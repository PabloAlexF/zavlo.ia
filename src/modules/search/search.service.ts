import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '@config/firebase.service';
import { RedisService } from '@config/redis.service';
import { Product } from '../products/interfaces/product.interface';
import { GoogleShoppingService } from '../scraping/google-shopping.service';
import { GoogleLensService } from '../scraping/google-lens.service';
import { OlxService } from '../scraping/olx.service';
import { WebmotorsService } from '../scraping/webmotors.service';
import { MercadoLivreService } from '../scraping/mercadolivre.service';
import { UsersService } from '../users/users.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { ClassificationService } from '../classification/classification.service';
import * as crypto from 'crypto';
import pLimit from 'p-limit';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  
  // 🚀 CACHE VERSION - Incrementar quando mudar algoritmo de ranking
  private readonly CACHE_VERSION = 'v3';
  
  // 🚀 CIRCUIT BREAKER - Rastrear falhas de scrapers
  private scraperFailures = new Map<string, { count: number; lastFailure: number }>();
  private readonly MAX_FAILURES = 10;
  private readonly CIRCUIT_BREAK_TIME = 5 * 60 * 1000; // 5 minutos
  
  // 🚀 CONCURRENCY LIMITER - Máximo 3 scrapers simultâneos
  private readonly scraperLimit = pLimit(3);

  constructor(
    private firebaseService: FirebaseService,
    private redisService: RedisService,
    private googleShoppingService: GoogleShoppingService,
    private googleLensService: GoogleLensService,
    private olxService: OlxService,
    private webmotorsService: WebmotorsService,
    private mercadoLivreService: MercadoLivreService,
    private usersService: UsersService,
    private analyticsService: AnalyticsService,
    private classificationService: ClassificationService,
  ) {}

  /* ============================================
     CIRCUIT BREAKER - Desativar scrapers que falham muito
  ============================================ */
  private recordScraperFailure(source: string): void {
    const now = Date.now();
    const failure = this.scraperFailures.get(source) || { count: 0, lastFailure: 0 };
    
    failure.count++;
    failure.lastFailure = now;
    this.scraperFailures.set(source, failure);
    
    if (failure.count >= this.MAX_FAILURES) {
      this.logger.warn(`🔴 [CIRCUIT BREAKER] ${source} atingiu ${this.MAX_FAILURES} falhas - desativado por 5 minutos`);
    }
  }
  
  private resetScraperFailures(source: string): void {
    this.scraperFailures.delete(source);
  }
  
  private isScraperAvailable(source: string): boolean {
    const failure = this.scraperFailures.get(source);
    if (!failure) return true;
    
    const now = Date.now();
    const timeSinceLastFailure = now - failure.lastFailure;
    
    // Se passou o tempo de circuit break, resetar contador
    if (timeSinceLastFailure > this.CIRCUIT_BREAK_TIME) {
      this.logger.log(`🟢 [CIRCUIT BREAKER] ${source} reativado após ${Math.round(timeSinceLastFailure / 1000)}s`);
      this.resetScraperFailures(source);
      return true;
    }
    
    // Se atingiu max failures e ainda está no período de break
    if (failure.count >= this.MAX_FAILURES) {
      const remainingTime = Math.round((this.CIRCUIT_BREAK_TIME - timeSinceLastFailure) / 1000);
      this.logger.warn(`🔴 [CIRCUIT BREAKER] ${source} ainda desativado (${remainingTime}s restantes)`);
      return false;
    }
    
    return true;
  }

  private sanitizeForLog(value: string): string {
    return String(value).replace(/[\r\n\t]/g, ' ').replace(/[\x00-\x1f\x7f]/g, '').slice(0, 200);
  }

  private safeParse<T>(raw: string, fallback: T): T {
    try {
      const parsed = JSON.parse(raw);
      return parsed !== null && typeof parsed === 'object' ? (parsed as T) : fallback;
    } catch {
      return fallback;
    }
  }

  /* ============================================
     CACHE POR SCRAPER (OTIMIZAÇÃO GIGANTE)
  ============================================ */
  private async getCachedScraperResult(source: string, query: string): Promise<Product[] | null> {
    // ✅ PROBLEMA 5 CORRIGIDO: Hash da query completa para evitar colisão
    const cacheKey = `scraper:${source}:${crypto.createHash('md5').update(query).digest('hex')}`;
    const cached = await this.redisService.get(cacheKey);
    
    if (cached) {
      this.logger.log(`✅ [CACHE] Hit for ${source}: ${query}`);
      const parsed = this.safeParse<Product[]>(cached, []);
      return Array.isArray(parsed) ? parsed : [];
    }
    
    return null;
  }

  private async setCachedScraperResult(source: string, query: string, results: Product[]): Promise<void> {
    // ✅ PROBLEMA 5 CORRIGIDO: Hash da query completa
    const cacheKey = `scraper:${source}:${crypto.createHash('md5').update(query).digest('hex')}`;
    // Cache por 6 horas (scrapers mudam menos que resultado final)
    await this.redisService.set(cacheKey, JSON.stringify(results), 21600);
    this.logger.log(`💾 [CACHE] Saved ${source}: ${results.length} products`);
  }

  /* ============================================
     TIMEOUT WRAPPER PARA SCRAPERS
  ============================================ */
  private async withTimeout<T>(promise: Promise<T>, ms: number = 5000, source: string = 'unknown'): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => {
          this.logger.warn(`⏱️ [TIMEOUT] ${source} exceeded ${ms}ms timeout`);
          reject(new Error(`${source} timeout after ${ms}ms`));
        }, ms)
      )
    ]);
  }

  /* ============================================
     GERAR HASH DE CACHE
     ✅ OTIMIZADO: String simples + versão para invalidação global
  ============================================ */
  private generateCacheKey(query: string, filters: any, location?: string): string {
    // ✅ String concatenada é mais eficiente que JSON.stringify
    const filterStr = [
      filters?.sortBy || 'BEST_MATCH',
      filters?.minPrice || '0',
      filters?.maxPrice || '999999',
      filters?.condition || 'all',
      filters?.limit || '50',
      filters?.providedClassification?.category || 'general',
      filters?.providedClassification?.condition || 'unknown',
      filters?.providedClassification?.detected_year || '0',
      filters?.providedClassification?.user_location?.city || 'all',
    ].join(':');
    
    const cacheData = `${query}:${filterStr}:${location || 'all'}`;
    const hash = crypto.createHash('md5').update(cacheData).digest('hex');
    
    // 🚀 Incluir versão para invalidação global fácil
    return `search:${this.CACHE_VERSION}:${hash}`;
  }

  /* ============================================
     CLASSIFICAÇÃO SEM BUSCA (NÃO CONSOME CRÉDITOS)
  ============================================ */
  async classifyQueryOnly(query: string, userId?: string): Promise<{
    classification: any;
    needsQuestion?: boolean;
    question?: string | { question: string; suggestions?: any[] };
    missingFields?: string[];
    is_question?: boolean;
    is_greeting?: boolean;
    question_type?: string;
    guided_response?: string;
  }> {
    this.logger.log(`🤖 [CLASSIFY ONLY] Classificando query: "${query}"`);
    
    try {
      const classification = await this.classificationService.classifyQuery(query, {}, userId);
      
      this.logger.log(`✅ [CLASSIFY ONLY] Resultado:`);
      this.logger.log(`   - Categoria: ${classification.category}`);
      this.logger.log(`   - Confiança: ${classification.confidence}`);
      this.logger.log(`   - É pergunta: ${classification.is_question}`);
      this.logger.log(`   - É saudação: ${classification.is_greeting}`);
      this.logger.log(`   - Campos faltantes: ${classification.missing_fields?.join(', ') || 'nenhum'}`);
      
      // Verificar se é pergunta sobre o sistema
      if (classification.is_question) {
        return {
          classification,
          is_question: true,
          question_type: (classification as any).question_type,
          guided_response: (classification as any).guided_response,
        };
      }
      
      // Verificar se é saudação
      if (classification.is_greeting) {
        return {
          classification,
          is_greeting: true,
        };
      }
      
      // Verificar se precisa fazer pergunta
      if (classification.missing_fields && classification.missing_fields.length > 0) {
        this.logger.log(`❓ [CLASSIFY ONLY] Campos faltantes: ${classification.missing_fields.join(', ')}`);
        return {
          classification,
          needsQuestion: true,
          question: classification.suggested_question,
          missingFields: classification.missing_fields,
        };
      }
      
      // Query válida para busca
      return {
        classification,
      };
      
    } catch (error) {
      this.logger.error(`❌ [CLASSIFY ONLY] Erro: ${error.message}`);
      throw error;
    }
  }

  /* ============================================
     FUNÇÃO PRINCIPAL
  ============================================ */
  async searchByText(
    query: string,
    filters?: any,
    userId?: string,
  ): Promise<{ 
    results: Product[]; 
    total: number; 
    creditsUsed?: number; 
    remainingCredits?: number;
    needsQuestion?: boolean;
    question?: string | { question: string; suggestions?: any[] };
    missingFields?: string[];
    classification?: any;
    priceRangeApplied?: { min?: number; max?: number; target?: number };
    searchedNationally?: boolean;
    originalCity?: string;
    cityFilterApplied?: boolean;
    relaxedFilters?: string[];
    canExpandSearch?: boolean;
    expansionSources?: string[];
    primarySource?: string;
  }> {
    const startTime = Date.now();
    let creditsUsed = 0;
    let remainingCredits: number | undefined;
    
    // Extrair sortBy dos filtros (padrão: RELEVANCE)
    const sortBy = filters?.sortBy || 'BEST_MATCH';
    
    this.logger.log(`🔍 [SEARCH DEBUG] Starting searchByText:`);
    this.logger.log(`   - query: ${this.sanitizeForLog(query)}`);
    this.logger.log(`   - userId: ${userId}`);
    this.logger.log(`   - sortBy: ${sortBy}`);
    this.logger.log(`   - filters: ${JSON.stringify(filters)}`);
    
    // 🆕 CLASSIFICAÇÃO INTELIGENTE
    let classification;
    
    // ✅ PROBLEMA 1 CORRIGIDO: Usar classificação fornecida se disponível
    if (filters?.providedClassification) {
      classification = filters.providedClassification;
      this.logger.log(`✅ [CLASSIFICATION] Using provided classification, skipping re-classification`);
      this.logger.log(`   - Categoria: ${classification.category}`);
      this.logger.log(`   - Confiança: ${classification.confidence}`);
      this.logger.log(`   - Scrapers recomendados: ${classification.scrapers?.map((s: any) => s.name).join(', ')}`);
      this.logger.log(`   - Faixa de preço: ${JSON.stringify(classification.price_range)}`);
    } else {
      // Classificar apenas se não foi fornecida
      try {
        this.logger.log(`🤖 [CLASSIFICATION] Classificando query: "${query}"`);
        classification = await this.classificationService.classifyQuery(query, {}, userId);
        this.logger.log(`✅ [CLASSIFICATION] Resultado:`);
        this.logger.log(`   - Categoria: ${classification.category}`);
        this.logger.log(`   - Confiança: ${classification.confidence}`);
        this.logger.log(`   - Scrapers recomendados: ${classification.scrapers?.map((s: any) => s.name).join(', ')}`);
        this.logger.log(`   - Condição: ${classification.condition}`);
        this.logger.log(`   - Limite de resultados: ${classification.result_limit || 'não especificado'}`);
        this.logger.log(`   - Ano detectado: ${classification.detected_year || 'N/A'}`);
        this.logger.log(`   - Marca detectada: ${classification.detected_brand || 'N/A'}`);
        this.logger.log(`   - Campos faltantes: ${classification.missing_fields?.join(', ') || 'nenhum'}`);
        
        // 💬 VERIFICAR SE PRECISA FAZER PERGUNTA
        if (classification.missing_fields && classification.missing_fields.length > 0) {
          this.logger.log(`❓ [QUESTION] Campos faltantes detectados: ${classification.missing_fields.join(', ')}`);
          this.logger.log(`❓ [QUESTION] Pergunta sugerida: ${classification.suggested_question}`);
          
          // Retornar indicação de que precisa fazer pergunta
          return {
            results: [],
            total: 0,
            needsQuestion: true,
            question: classification.suggested_question,
            missingFields: classification.missing_fields,
            classification: classification,
            creditsUsed: 0,
            remainingCredits: userId ? (await this.usersService.findById(userId))?.credits : undefined
          };
        }
      } catch (error) {
        this.logger.error(`❌ [CLASSIFICATION] Erro na classificação: ${error.message}`);
        this.logger.error(`❌ [CLASSIFICATION] Stack: ${error.stack}`);
        this.logger.warn(`⚠️ [CLASSIFICATION] Usando fallback (Google Shopping)`);
        classification = {
          category: 'general',
          confidence: 0.5,
          scrapers: [{ name: 'google_shopping', score: 0.6 }],
          condition: 'unknown',
          all_scores: {},
          missing_fields: [],
          suggested_question: null,
          result_limit: 20
        };
      }
    }
    if (userId) {
      this.logger.log(`🔍 [SEARCH DEBUG] User is logged in, checking usage limit...`);
      
      const canUse = await this.usersService.checkUsageLimit(userId, 'text');
      if (!canUse) {
        this.logger.warn(`❌ [SEARCH DEBUG] Usage limit exceeded for user ${userId}`);
        throw new BadRequestException({
          error: 'LIMIT_EXCEEDED',
          message: 'Daily search limit reached',
          type: 'text',
          action: 'upgrade_plan'
        });
      }
      
      this.logger.log(`✅ [SEARCH DEBUG] Usage limit OK, will deduct credits after successful search`);
      // incrementUsage movido para após useCredit bem-sucedido
    } else {
      this.logger.log(`🔍 [SEARCH DEBUG] No user ID provided, proceeding without credit deduction`);
    }
    
    // Preferir search_query (rico: inclui ano/condição/cidade) sobre normalized_query
    // Sempre normalizar para garantir consistência de encoding (sem acentos) para os scrapers
    const normalizedQuery = this.normalizeQuery(
      (filters?.providedClassification?.search_query)
        ? filters.providedClassification.search_query
        : (filters?.providedClassification?.normalized_query)
        ? filters.providedClassification.normalized_query
        : query
    );

    // Para freeMode, usar apenas normalized_query simples (sem cidade/condição) para não restringir resultados gratuitos
    const freeQuery = (filters?.providedClassification?.normalized_query)
      ? this.normalizeQuery(filters.providedClassification.normalized_query)
      : this.normalizeQuery(query);

    this.logger.log(`🔍 [SEARCH DEBUG] Query original: ${query}`);
    this.logger.log(`🔍 [SEARCH DEBUG] Query para scrapers: ${normalizedQuery}`);

    // Buscar localização do usuário
    let userLocation: { city: string; state: string } | undefined;
    if (userId) {
      try {
        const user = await this.usersService.findById(userId);
        if (user?.location?.city && user?.location?.state) {
          userLocation = {
            city: user.location.city,
            state: user.location.state,
          };
          this.logger.log(`🔍 [SEARCH DEBUG] Localização do usuário: ${userLocation.city}, ${userLocation.state}`);
        }
      } catch (error) {
        this.logger.warn(`⚠️ [SEARCH DEBUG] Erro ao buscar localização: ${error.message}`);
      }
    }

    // 🔍 [EXPANSION DEBUG] Detectar se é uma busca de expansão
    const isExpansionCall = !!(
      filters?.providedClassification?.scrapers?.length === 1
    );
    this.logger.log(`🔍 [EXPANSION DEBUG] isExpansionCall: ${isExpansionCall}`);
    if (isExpansionCall) {
      this.logger.log(`🔍 [EXPANSION DEBUG] Scraper solicitado: ${filters.providedClassification.scrapers[0]?.name}`);
    }

    const cacheKey = this.generateCacheKey(normalizedQuery, filters, userLocation?.city);
    this.logger.log(`🔑 [CACHE KEY] ${cacheKey} (expansion: ${isExpansionCall})`);

    // CACHE — pular cache em buscas de expansão para forçar scraper específico
    const cached = isExpansionCall ? null : await this.redisService.get(cacheKey);
    if (cached) {
      this.logger.log(`[CACHE] Hit`);
      const cachedResult = this.safeParse<any>(cached, null);
      if (!cachedResult) {
        this.logger.warn('[CACHE] Entrada inválida no cache — ignorando');
      } else {

      // Deduzir crédito e buscar saldo mesmo em cache hit
      if (userId) {
        try {
          await this.usersService.useCredit(userId, 1);
          creditsUsed = 1;
          await this.usersService.incrementUsage(userId, 'text');
          const user = await this.usersService.findById(userId);
          remainingCredits = user?.credits || 0;
        } catch (creditError: any) {
          if (creditError.response?.error === 'INSUFFICIENT_CREDITS') {
            throw new BadRequestException({
              error: 'INSUFFICIENT_CREDITS',
              message: 'Créditos insuficientes',
              currentCredits: creditError.response.currentCredits || 0,
              action: 'buy_credits',
            });
          }
          this.logger.warn(`[CACHE] Falha ao deduzir crédito no cache hit: ${creditError.message}`);
        }
      }

      // Aplicar filtros de preço se especificados
      let filteredResults = cachedResult.results;
      if (filters?.minPrice || filters?.maxPrice) {
        filteredResults = this.applyPriceFilter(cachedResult.results, filters.minPrice, filters.maxPrice);
      }
      
        return {
          ...cachedResult,
          results: filteredResults,
          total: filteredResults.length,
          creditsUsed,
          remainingCredits,
          searchedNationally: cachedResult.searchedNationally ?? undefined,
          originalCity: cachedResult.originalCity ?? undefined,
          cityFilterApplied: cachedResult.cityFilterApplied ?? undefined,
          relaxedFilters: cachedResult.relaxedFilters ?? undefined,
        };
      }
    }

    // GOOGLE SHOPPING SEARCH (planos pagos)
    let products: Product[] = [];
    const fixedLimit = 20;
    const usedSources: string[] = [];
    let availableExpansionSources: string[] = [];
    let primarySource = '';

    // 🚀 EXECUTAR SCRAPERS BASEADO NA CLASSIFICAÇÃO
    const category = classification?.category;
    const scrapers = (classification?.scrapers as { name: string; score: number }[] | undefined)
      ?.map(s => s.name)
      ?? (category === 'car' || category === 'motorcycle' ? ['mercadolivre', 'webmotors', 'olx'] : ['google_shopping', 'mercadolivre', 'olx']);
    const SATISFACTORY_THRESHOLD = 20;
    const resultLimit = 20;
    let searchedNationally = false;
    const rawCity = classification?.user_location?.city || undefined;
    const originalCity = rawCity
      ? rawCity.replace(/\+/g, ' ').replace(/%20/g, ' ').trim()
      : undefined;
    this.logger.log(`🎯 [SCRAPERS] Lista final de scrapers: [${scrapers.join(', ')}]`);
    this.logger.log(`🎯 [SCRAPERS] category=${category} | isExpansionCall=${isExpansionCall}`);
    this.logger.log(`🎯 [SCRAPERS] classification.scrapers raw: ${JSON.stringify(classification?.scrapers)}`);

    // Se freeMode (plano free/usuário não logado), busca limitada
    if (filters?.freeMode) {
      const isVehicleFree = category === 'car' || category === 'motorcycle';

      if (!isVehicleFree) {
        this.logger.log(`🆓 [SEARCH DEBUG] Busca gratuita - ${fixedLimit} resultados (freeMode=${filters.freeMode})`);
        
        try {
          const results = await this.googleShoppingService.search(freeQuery, fixedLimit, sortBy, classification);
          const result = { 
            results: results, 
            total: results.length,
            creditsUsed,
            remainingCredits,
            searchedNationally: undefined,
            originalCity: undefined,
            cityFilterApplied: undefined,
            relaxedFilters: undefined,
          };
          
          this.logger.log(`🆓 [SEARCH DEBUG] Free search completed with ${results.length} results`);
          
          await this.redisService.set(cacheKey, JSON.stringify(result), 3600);
          return result;
        } catch (error) {
          this.logger.warn(`⚠️ [SEARCH DEBUG] Erro na busca gratuita: ${error.message}`);
        }

        const fallback = await this.searchInFirebase(freeQuery, filters);
        this.logger.log(`🆓 [SEARCH DEBUG] Using Firebase fallback with ${fallback.results.length} results`);
        return {
          ...fallback,
          creditsUsed,
          remainingCredits
        };
      }
      // Veículos no freeMode: cai no loop principal abaixo
      this.logger.log(`🆓 [FREE MODE] Veículo detectado - usando scrapers de veículos`);
    }

    try {
      // ✅ ESTRATÉGIA: Executar scrapers sequencialmente.
      // Se o primeiro retornar >= SATISFACTORY_THRESHOLD resultados, parar e oferecer expansão.
      // Veículos (webmotors) sempre executam sem threshold.
      const isVehicle = category === 'car' || category === 'motorcycle';

      // Para veículos: buscar SOMENTE Mercado Livre primeiro.
      // Webmotors e OLX ficam disponíveis como expansão (usuário decide).
      // Garantir expansão independente do que o Python retornar nos scrapers.
      // Se classification já vem com scraper único (expansão do frontend), respeitar.
      const isExpansionRequest = scrapers.length === 1;
      const vehiclePrimaryScrapers = (isVehicle && !isExpansionRequest) ? ['mercadolivre'] : scrapers;
      const vehicleExpansionPool = (isVehicle && !isExpansionRequest)
        ? ['webmotors', 'olx'].filter(s => this.isScraperAvailable(s))
        : [];

      const activeScrapers = (isVehicle && !isExpansionRequest) ? vehiclePrimaryScrapers : scrapers;
      this.logger.log(`🚗 [VEHICLE] isVehicle=${isVehicle} | isExpansionRequest=${isExpansionRequest}`);
      this.logger.log(`🚗 [VEHICLE] activeScrapers=[${activeScrapers.join(', ')}] | expansionPool=[${vehicleExpansionPool.join(', ')}]`);
      this.logger.log(`🔴 [CIRCUIT BREAKER] olx available: ${this.isScraperAvailable('olx')} | webmotors: ${this.isScraperAvailable('webmotors')}`);
      this.logger.log(`🔴 [CIRCUIT BREAKER] failures map: ${JSON.stringify(Object.fromEntries(this.scraperFailures))}`);

      for (const scraper of activeScrapers) {
        this.logger.log(`🔄 [SCRAPER LOOP] Iniciando scraper: ${scraper}`);
        if (!this.isScraperAvailable(scraper)) {
          this.logger.warn(`[${scraper.toUpperCase()}] Pulado - circuit breaker ativo`);
          continue;
        }

        let scraperResults: Product[] = [];
        let cached = false;

        // Verificar cache — usar search_query como chave para evitar colisão entre filtros diferentes
        const scraperCacheKey = `${scraper}:${normalizedQuery}:${resultLimit}:${classification?.condition || 'any'}:${classification?.detected_year || '0'}:${classification?.user_location?.city || 'all'}`;
        const cachedData = await this.getCachedScraperResult(scraper, scraperCacheKey);
        if (cachedData) {
          scraperResults = cachedData;
          cached = true;
          this.resetScraperFailures(scraper);
        } else {
          try {
            if (scraper === 'mercadolivre') {
              const { results } = await this.withTimeout(
                this.mercadoLivreService.search(normalizedQuery, resultLimit, classification),
                60000, 'MercadoLivre'
              );
              scraperResults = results;
            } else if (scraper === 'webmotors') {
              const { results, searchedNationally: sn } = await this.withTimeout(
                this.webmotorsService.search(normalizedQuery, resultLimit, classification),
                90000, 'Webmotors'
              );
              if (sn) searchedNationally = true;
              scraperResults = results;
            } else if (scraper === 'olx') {
              scraperResults = await this.withTimeout(
                this.olxService.search(normalizedQuery, resultLimit, sortBy, classification),
                120000, 'OLX'
              );
            } else if (scraper === 'google_shopping') {
              scraperResults = await this.withTimeout(
                this.googleShoppingService.search(normalizedQuery, resultLimit, sortBy, classification),
                45000, 'GoogleShopping'
              );
            }
            await this.setCachedScraperResult(scraper, scraperCacheKey, scraperResults);
            this.resetScraperFailures(scraper);
          } catch (error) {
            this.logger.warn(`[${scraper.toUpperCase()}] Erro: ${error.message}`);
            this.recordScraperFailure(scraper);
          }
        }

        this.logger.log(`✅ [${scraper.toUpperCase()}] ${scraperResults.length} produtos (cached: ${cached})`);
        products.push(...scraperResults);
        usedSources.push(cached ? `${scraper}:cached` : scraper);

        if (primarySource === '') primarySource = scraper;

        // Para veículos: sempre parar após Mercado Livre e oferecer expansão
        if (isVehicle && !isExpansionRequest) {
          availableExpansionSources = vehicleExpansionPool;
          this.logger.log(`🚗 [VEHICLE STRATEGY] Mercado Livre concluído (${products.length} resultados). Expansão disponível: ${availableExpansionSources.join(', ') || 'nenhuma'}`);
          break;
        }

        // Para não-veículos: parar se já temos resultados suficientes
        if (products.length >= SATISFACTORY_THRESHOLD) {
          availableExpansionSources = scrapers
            .filter(s => !usedSources.some(u => u.startsWith(s)))
            .filter(s => this.isScraperAvailable(s));
          this.logger.log(`🎯 [STRATEGY] ${products.length} resultados satisfatórios em "${scraper}" — parando. Expansão disponível: ${availableExpansionSources.join(', ') || 'nenhuma'}`);
          break;
        }
      }

      this.logger.log(`📊 [TOTAL] ${products.length} produtos consolidados de ${scrapers.length} fonte(s)`);
      this.logger.log(`💾 [SOURCES] Fontes usadas: ${usedSources.join(', ')}`);
      
      // ✅ Deduplicar produtos (evitar repetições entre marketplaces)
      products = this.deduplicateProducts(products);
      this.logger.log(`🧹 [DEDUP] ${products.length} produtos após deduplicar`);
      
      // Ordenar produtos consolidados se necessário
      // Google Shopping e OLX já retornam ordenados
      // Webmotors e MercadoLivre precisam ser ordenados localmente
      if (sortBy !== 'RELEVANCE' && sortBy !== 'BEST_MATCH') {
        this.logger.log(`🔄 [SORT] Ordenando ${products.length} produtos por ${sortBy}`);
        products = this.sortProducts(products, sortBy);
      } else {
        // ✅ Aplicar ranking inteligente para RELEVANCE
        this.logger.log(`🎯 [RANKING] Aplicando ranking inteligente`);
        products = this.applyIntelligentRanking(products, normalizedQuery);
      }
    } catch (error) {
      this.logger.warn(`[SCRAPING] Erro geral: ${error.message}`);
    }

    // FALLBACK se vazio
    if (products.length === 0) {
      this.logger.warn(`[FALLBACK] Firebase search`);
      const fallback = await this.searchInFirebase(normalizedQuery, filters);

      await this.redisService.set(
        cacheKey,
        JSON.stringify(fallback),
        1800,
      );

      return {
        ...fallback,
        creditsUsed: 0, // ✅ Não cobrar se não encontrou nada
        remainingCredits: userId ? (await this.usersService.findById(userId))?.credits : undefined
      };
    }

    // ✅ PROBLEMA 2 CORRIGIDO: Deduzir créditos APENAS após sucesso
    if (userId && products.length > 0) {
      try {
        await this.usersService.useCredit(userId, 1);
        creditsUsed = 1;
        await this.usersService.incrementUsage(userId, 'text');
        const user = await this.usersService.findById(userId);
        remainingCredits = user?.credits || 0;
        this.logger.log(`✅ [CREDITS] Deducted 1 credit after successful search. Remaining: ${remainingCredits}`);
      } catch (creditError: any) {
        this.logger.error(`❌ [CREDITS] Failed to deduct credit: ${creditError.message}`);
      }

      // 🧠 SALVAR PREFERÊNCIAS DO USUÁRIO (memória entre sessões)
      try {
        const lastFilters = classification?.last_filters || {};
        // Usar objeto aninhado real (não dot notation) para compatibilidade com Firestore
        const prefsUpdate: Record<string, any> = { preferences: {} };
        const lf: Record<string, any> = {};
        if (lastFilters.condition)    lf.condition    = lastFilters.condition;
        if (lastFilters.location)     lf.location     = lastFilters.location;
        if (lastFilters.price_range)  lf.price_range  = lastFilters.price_range;
        if (lastFilters.brand)        lf.brand        = lastFilters.brand;
        if (lastFilters.gender)       lf.gender       = lastFilters.gender;
        if (lastFilters.size)         lf.size         = lastFilters.size;
        if (lastFilters.storage)      lf.storage      = lastFilters.storage;
        if (lastFilters.transmission) lf.transmission = lastFilters.transmission;
        if (lastFilters.fuel)         lf.fuel         = lastFilters.fuel;
        if (lastFilters.body_type)    lf.body_type    = lastFilters.body_type;
        if (lastFilters.shoe_type)    lf.shoe_type    = lastFilters.shoe_type;

        if (Object.keys(lf).length > 0 || classification?.category) {
          const firestore = this.firebaseService.getFirestore();
          const updateData: Record<string, any> = {};
          if (Object.keys(lf).length > 0) updateData['preferences.last_filters'] = lf;
          if (classification?.category)   updateData['preferences.last_category'] = classification.category;
          await firestore.collection('users').doc(userId).update(updateData);
          this.logger.log(`🧠 [PREFS] Preferências salvas para user ${userId}`);
        }
      } catch (prefsError: any) {
        this.logger.warn(`⚠️ [PREFS] Falha ao salvar preferências: ${prefsError.message}`);
      }
    }

    // ✅ PROBLEMA 2 CORRIGIDO: Aplicar filtros ANTES de cachear (sem mutação)
    let finalResults = products;
    let priceRangeApplied: { min?: number; max?: number; target?: number } | undefined;
    
    // Flags para avisar o frontend quais filtros foram relaxados
    const relaxedFilters: string[] = [];

    // 💰 FILTRO DE PREÇO ESTRUTURADO (com fallback gracioso)
    if (classification?.price_range) {
      const priceRange = classification.price_range;
      this.logger.log(`💰 [PRICE FILTER] Aplicando filtro estruturado:`, priceRange);

      const filtered = this.applyStructuredPriceFilter(products, priceRange);
      this.logger.log(`💰 [PRICE FILTER] Resultados: ${products.length} → ${filtered.length}`);

      if (filtered.length > 0) {
        finalResults = filtered;
        priceRangeApplied = {
          min: priceRange.min_price,
          max: priceRange.max_price,
          target: priceRange.target_price
        };
      } else {
        this.logger.warn(`💰 [PRICE FILTER] Nenhum resultado no orçamento — exibindo todos sem filtro de preço`);
        relaxedFilters.push('price');
      }
    } else if (filters?.minPrice || filters?.maxPrice) {
      const filtered = this.applyPriceFilter(products, filters.minPrice, filters.maxPrice);
      if (filtered.length > 0) {
        finalResults = filtered;
        priceRangeApplied = { min: filters.minPrice, max: filters.maxPrice };
      } else {
        this.logger.warn(`💰 [PRICE FILTER] Nenhum resultado no orçamento legado — exibindo todos`);
        relaxedFilters.push('price');
      }
    }

    // 🏠 FILTRO DE LOCALIZAÇÃO (pós-scraping — só aplica se seller não for null)
    let cityFilterApplied = false;
    if (classification?.user_location?.city && finalResults.length > 0) {
      const city = classification.user_location.city.replace(/\+/g, ' ').toLowerCase().trim();
      const byCity = finalResults.filter(p =>
        (p as any).dealerLocation?.toLowerCase().includes(city)
      );
      if (byCity.length > 0) {
        this.logger.log(`🏠 [LOCATION FILTER] ${finalResults.length} → ${byCity.length} (cidade: ${city})`);
        finalResults = byCity;
        cityFilterApplied = true;
      } else {
        this.logger.log(`🏠 [LOCATION FILTER] Nenhum resultado em ${city} — mantendo todos`);
      }
    }

    // 🔄 FILTRO DE CONDIÇÃO (pós-scraping)
    // Ignorar condição 'new' se o ano detectado indica carro antigo (> 3 anos)
    const currentYear = new Date().getFullYear();
    const yearIsOld = classification?.detected_year && classification.detected_year < currentYear - 3;
    const conditionIsNew = classification?.condition === 'new';
    const skipConditionFilter = conditionIsNew && yearIsOld;

    if (!skipConditionFilter && (classification?.condition === 'new' || classification?.condition === 'used') && finalResults.length > 0) {
      const cond = classification.condition;
      const byCondition = finalResults.filter(p => (p as any).condition === cond);
      if (byCondition.length > 0) {
        this.logger.log(`🔄 [CONDITION FILTER] ${finalResults.length} → ${byCondition.length} (${cond})`);
        finalResults = byCondition;
      } else {
        this.logger.warn(`🔄 [CONDITION FILTER] Nenhum resultado com condition=${cond} — mantendo todos`);
      }
    } else if (skipConditionFilter) {
      this.logger.log(`🔄 [CONDITION FILTER] Ignorado — condition=new mas ano=${classification.detected_year} indica carro antigo`);
    }

    // 📅 FILTRO DE ANO (com fallback gracioso)
    // Aceita fabrication_year OU model_year com tolerância de ±1 (padrão BR: carro 2011/2012)
    if (classification?.detected_year && finalResults.length > 0) {
      const yr = classification.detected_year;
      const byYear = finalResults.filter(p => {
        const fabYear  = (p as any).year;
        const modYear  = (p as any).modelYear;
        if (!fabYear && !modYear) return true; // sem dado de ano: manter
        return (fabYear  && Math.abs(fabYear  - yr) <= 1)
            || (modYear  && Math.abs(modYear  - yr) <= 1);
      });
      if (byYear.length > 0) {
        this.logger.log(`📅 [YEAR FILTER] ${finalResults.length} → ${byYear.length} (ano: ${yr} ±1)`);
        finalResults = byYear;
      } else {
        this.logger.warn(`📅 [YEAR FILTER] Nenhum resultado para ano=${yr} ±1 — exibindo todos sem filtro de ano`);
        relaxedFilters.push('year');
      }
    }

    const finalResult = {
      results: finalResults,
      total: finalResults.length,
      creditsUsed,
      remainingCredits,
      priceRangeApplied,
      searchedNationally: searchedNationally || undefined,
      originalCity: originalCity || undefined,
      cityFilterApplied: cityFilterApplied ? true : (originalCity ? false : undefined),
      relaxedFilters: relaxedFilters.length > 0 ? relaxedFilters : undefined,
      canExpandSearch: availableExpansionSources.length > 0 ? true : undefined,
      expansionSources: availableExpansionSources.length > 0 ? availableExpansionSources : undefined,
      primarySource: primarySource || undefined,
    };

    // Cache results for 1 hour (com filtros já aplicados)
    await this.redisService.set(
      cacheKey,
      JSON.stringify(finalResult),
      3600,
    );

    // Log search analytics
    if (userId) {
      const responseTime = Date.now() - startTime;
      await this.analyticsService.logSearch({
        userId,
        query,
        type: 'text',
        sources: usedSources, // ✅ PROBLEMA 3 CORRIGIDO: Usar fontes reais
        responseTime,
        success: true,
        resultsCount: finalResult.total,
        timestamp: new Date(),
        location: userLocation ? `${userLocation.city}, ${userLocation.state}` : undefined,
      });
    }

    return finalResult;
  }

/* ============================================
     FIREBASE FALLBACK INTELIGENTE
     ⚠️ PROBLEMA 4 DOCUMENTADO: Este fallback é caro e não escala
     
     LIMITAÇÕES:
     - Full scan parcial (limit 100) - O(n) em produtos
     - Filtragem em memória - ineficiente para grandes volumes
     - Sem índices de busca - latência alta (500ms-2s)
     - Custo Firestore: $0.06 por 100k reads
     
     IMPACTO EM ESCALA:
     - 10k buscas/dia = $6/dia = $180/mês
     - 100k buscas/dia = $60/dia = $1,800/mês
     
     SOLUÇÃO RECOMENDADA:
     - Algolia: $1/mês para 10k searches, índices otimizados
     - Meilisearch: Self-hosted, gratuito, 50ms latência
     - Typesense: Self-hosted, gratuito, typo-tolerance
     
     TODO: Migrar para search engine dedicado quando:
     - products > 10k
     - searches > 1k/dia
     - latência > 1s
  ============================================ */
  private async searchInFirebase(
    query: string,
    filters?: any,
  ): Promise<{ results: Product[]; total: number }> {

    const firestore = this.firebaseService.getFirestore();

    // ⚠️ Full scan parcial - caro em escala
    const snapshot = await firestore
      .collection('products')
      .limit(100)
      .get();

    const queryWords = query.split(' ');

    const products = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

    // ⚠️ Filtragem em memória - ineficiente
    const filtered = products.filter(product => {

      const title = this.normalizeQuery(product.title || '');

      return queryWords.some(word =>
        title.includes(word),
      );
    });

    return {
      results: filtered.slice(0, 50),
      total: filtered.length,
    };
  }

  /* ============================================
     SUGESTÕES MELHORADAS
  ============================================ */
  async getSuggestions(query: string): Promise<string[]> {

    const normalized = this.normalizeQuery(query);

    const cacheKey = `suggest:${normalized}`;

    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      const parsed = this.safeParse<string[]>(cached, []);
      return Array.isArray(parsed) ? parsed : [];
    }

    const firestore = this.firebaseService.getFirestore();

    const snapshot = await firestore
      .collection('products')
      .limit(50)
      .get();

    const suggestions = snapshot.docs
      .map(d => d.data().title)
      .filter(title =>
        this.normalizeQuery(title).includes(normalized),
      )
      .slice(0, 5);

    await this.redisService.set(
      cacheKey,
      JSON.stringify(suggestions),
      1800,
    );

    return suggestions;
  }

  /* ============================================
     BUSCA POR IMAGEM
  ============================================ */
  async searchByImage(imageUrl: string, userId?: string): Promise<{ 
    results?: Product[]; 
    creditsUsed?: number; 
    remainingCredits?: number;
    productName?: string;
  }> {
    const startTime = Date.now();
    let creditsUsed = 0;
    let remainingCredits: number | undefined;
    let productName = '';
    
    if (userId) {
      const canUse = await this.usersService.checkUsageLimit(userId, 'image');
      if (!canUse) {
        throw new BadRequestException({
          error: 'LIMIT_EXCEEDED',
          message: 'Daily image search limit reached',
          type: 'image',
          action: 'upgrade_plan'
        });
      }
      
      // Deduct credits for image identification only (1 credit)
      try {
        await this.usersService.useCredit(userId, 1);
        creditsUsed = 1;
        const user = await this.usersService.findById(userId);
        remainingCredits = user?.credits || 0;
        this.logger.log(`[CREDITS] Deducted 1 credit for image identification. Remaining: ${remainingCredits}`);
      } catch (creditError: any) {
        if (creditError.response?.error === 'INSUFFICIENT_CREDITS') {
          throw new BadRequestException({
            error: 'INSUFFICIENT_CREDITS',
            message: 'You do not have enough credits for image identification (requires 1 credit)',
            currentCredits: creditError.response.currentCredits || 0,
            requiredCredits: 1,
            action: 'buy_credits'
          });
        }
        this.logger.warn(`[CREDITS] Failed to deduct credits: ${creditError.message}`);
      }
      
      await this.usersService.incrementUsage(userId, 'image');
    }

    // 1. Identificar produto com Google Vision (SEM buscar preços)
    const { productName: identifiedProduct } = await this.googleLensService.identifyProduct(imageUrl);
    productName = identifiedProduct;
    
    // Log analytics
    if (userId) {
      const responseTime = Date.now() - startTime;
      await this.analyticsService.logSearch({
        userId,
        query: productName,
        type: 'image' as 'text' | 'image',
        sources: ['google_vision'],
        responseTime,
        success: true,
        resultsCount: 0, // Sem resultados de produtos ainda
        timestamp: new Date(),
      });
    }

    return {
      creditsUsed,
      remainingCredits,
      productName
      // results: undefined - Não buscar produtos ainda
    };
  }

  /* ============================================
     BUSCA DE PREÇOS APÓS IDENTIFICAÇÃO
  ============================================ */
  async searchProductPrices(productName: string, userId?: string): Promise<{ 
    results: Product[]; 
    creditsUsed?: number; 
    remainingCredits?: number;
  }> {
    const startTime = Date.now();
    let creditsUsed = 0;
    let remainingCredits: number | undefined;
    
    if (userId) {
      // Deduct 1 credit for price search
      try {
        await this.usersService.useCredit(userId, 1);
        creditsUsed = 1;
        const user = await this.usersService.findById(userId);
        remainingCredits = user?.credits || 0;
        this.logger.log(`[CREDITS] Deducted 1 credit for price search. Remaining: ${remainingCredits}`);
      } catch (creditError: any) {
        if (creditError.response?.error === 'INSUFFICIENT_CREDITS') {
          throw new BadRequestException({
            error: 'INSUFFICIENT_CREDITS',
            message: 'You do not have enough credits for price search (requires 1 credit)',
            currentCredits: creditError.response.currentCredits || 0,
            requiredCredits: 1,
            action: 'buy_credits'
          });
        }
        this.logger.warn(`[CREDITS] Failed to deduct credits: ${creditError.message}`);
      }
    }

    // Buscar no Google Shopping
    const results = await this.googleShoppingService.search(productName, 20);

    // Log analytics
    if (userId) {
      const responseTime = Date.now() - startTime;
      await this.analyticsService.logSearch({
        userId,
        query: productName,
        type: 'image' as 'text' | 'image',
        sources: ['google_shopping'],
        responseTime,
        success: true,
        resultsCount: results.length,
        timestamp: new Date(),
      });
    }

    return {
      results,
      creditsUsed,
      remainingCredits
    };
  }

  /* ============================================
     PRODUTO POR ID
  ============================================ */
  async getProductById(id: string): Promise<Product | null> {
    const firestore = this.firebaseService.getFirestore();
    const doc = await firestore.collection('products').doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return { id: doc.id, ...doc.data() } as Product;
  }

  /* ============================================
     FILTRO DE PREÇO ESTRUTURADO
  ============================================ */
  private applyStructuredPriceFilter(
    products: Product[], 
    priceRange: { min_price?: number; max_price?: number; target_price?: number }
  ): Product[] {
    if (!priceRange) return products;
    
    const { min_price, max_price, target_price } = priceRange;
    
    return products.filter(product => {
      const price = this.extractPrice(String(product.price));
      if (!price) return true; // Manter produtos sem preço
      
      // Caso 1: Faixa (entre X e Y)
      if (min_price && max_price) {
        return price >= min_price && price <= max_price;
      }
      
      // Caso 2: Máximo (até X)
      if (max_price && !min_price) {
        return price <= max_price;
      }
      
      // Caso 3: Mínimo (acima de X)
      if (min_price && !max_price) {
        return price >= min_price;
      }
      
      // Caso 4: Valor alvo (±20%)
      if (target_price) {
        const tolerance = target_price * 0.2;
        return price >= (target_price - tolerance) && price <= (target_price + tolerance);
      }
      
      return true;
    });
  }
  
  /* ============================================
     FILTRO DE PREÇO (LEGADO)
  ============================================ */
  private applyPriceFilter(products: Product[], minPrice?: number, maxPrice?: number): Product[] {
    if (!minPrice && !maxPrice) return products;
    
    return products.filter(product => {
      const price = this.extractPrice(String(product.price));
      if (!price) return true; // Manter produtos sem preço
      
      if (minPrice && price < minPrice) return false;
      if (maxPrice && price > maxPrice) return false;
      
      return true;
    });
  }
  
  private extractPrice(priceStr: string): number | null {
    if (!priceStr) return null;
    
    // Remover caracteres não numéricos exceto vírgula e ponto
    const cleanPrice = priceStr.replace(/[^0-9.,]/g, '');
    
    // Converter para número (assumindo formato brasileiro: 1.234,56)
    const normalizedPrice = cleanPrice.replace(/\./g, '').replace(',', '.');
    
    const price = parseFloat(normalizedPrice);
    return isNaN(price) ? null : price;
  }

  /* ============================================
     MÉTODOS DE DEBUG
  ============================================ */
  async getUserDetails(userId: string) {
    return await this.usersService.findById(userId);
  }

  async debugUseCredit(userId: string) {
    this.logger.log(`🔍 [DEBUG] Starting manual credit deduction for user ${userId}`);
    
    const userBefore = await this.usersService.findById(userId);
    this.logger.log(`🔍 [DEBUG] User before:`, {
      credits: userBefore?.credits,
      plan: userBefore?.plan
    });
    
    await this.usersService.useCredit(userId, 1);
    
    const userAfter = await this.usersService.findById(userId);
    this.logger.log(`🔍 [DEBUG] User after:`, {
      credits: userAfter?.credits,
      plan: userAfter?.plan
    });
    
    return {
      before: {
        credits: userBefore?.credits,
        plan: userBefore?.plan
      },
      after: {
        credits: userAfter?.credits,
        plan: userAfter?.plan
      },
      deducted: (userBefore?.credits || 0) - (userAfter?.credits || 0)
    };
  }

  /* ============================================
     DEDUPLICAÇÃO DE PRODUTOS
     ✅ PROBLEMA CORRIGIDO: Incluir source para evitar perder variantes
  ============================================ */
  private deduplicateProducts(products: Product[]): Product[] {
    if (!products || products.length === 0) return products;

    const productMap = new Map<string, Product>();

    for (const product of products) {
      // Gerar chave única baseada em título + marca + preço + source
      const normalizedTitle = this.normalizeQuery(product.title || '');
      const brand = this.normalizeQuery((product as any).make || product.brand || '');
      const price = this.extractPrice(String(product.price)) || 0;
      const source = product.source || 'unknown';
      
      // ✅ Incluir source para preservar variantes (ex: iPhone 128GB vs 256GB)
      const keyData = `${normalizedTitle}:${brand}:${Math.round(price)}:${source}`;
      const key = crypto.createHash('md5').update(keyData).digest('hex');
      
      // Se já existe, manter o que tiver melhor rating ou mais informações
      if (productMap.has(key)) {
        const existing = productMap.get(key)!;
        const existingRating = existing.rating || 0;
        const newRating = product.rating || 0;
        
        // Manter produto com melhor rating
        if (newRating > existingRating) {
          productMap.set(key, product);
        }
      } else {
        productMap.set(key, product);
      }
    }

    return Array.from(productMap.values());
  }

  /* ============================================
     RANKING INTELIGENTE
     ✅ OTIMIZADO: Normalização dinâmica + filtro de outliers
  ============================================ */
  private applyIntelligentRanking(products: Product[], query: string): Product[] {
    if (!products || products.length === 0) return products;

    const queryWords = query.toLowerCase().split(' ');
    
    // ✅ Calcular estatísticas de preço para normalização e outlier detection
    const prices = products
      .map(p => this.extractPrice(String(p.price)) || 0)
      .filter(p => p > 0);
    
    if (prices.length === 0) {
      // Se não há preços, ordenar apenas por relevância
      return products.sort((a, b) => {
        const titleA = (a.title || '').toLowerCase();
        const titleB = (b.title || '').toLowerCase();
        const matchA = queryWords.filter(w => titleA.includes(w)).length;
        const matchB = queryWords.filter(w => titleB.includes(w)).length;
        return matchB - matchA;
      });
    }
    
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minReasonablePrice = avgPrice / 5; // ✅ Outlier threshold

    // Calcular score para cada produto
    const scoredProducts = products.map(product => {
      const title = (product.title || '').toLowerCase();
      const price = this.extractPrice(String(product.price)) || 0;
      const rating = product.rating || 0;
      
      // 1. Relevância (40%): quantas palavras da query estão no título
      const matchedWords = queryWords.filter(word => title.includes(word)).length;
      const relevanceScore = (matchedWords / queryWords.length) * 0.4;
      
      // 2. Preço (20%): normalizado dinamicamente (menor é melhor)
      // ✅ Penalizar outliers (preços absurdamente baixos)
      let priceScore = 0;
      if (price > 0) {
        if (price < minReasonablePrice) {
          // Preço suspeito (muito baixo) - penalizar
          priceScore = 0.05;
        } else {
          priceScore = (1 - (price / maxPrice)) * 0.2;
        }
      }
      
      // 3. Rating (20%): normalizado (0-5)
      const ratingScore = (rating / 5) * 0.2;
      
      // 4. Freshness (10%): produtos mais recentes (se tiver timestamp)
      const freshnessScore = 0.1; // Placeholder (implementar se tiver data)
      
      // 5. Marketplace (10%): preferência por fonte
      const marketplaceScore = this.getMarketplaceScore(product.source) * 0.1;
      
      const totalScore = relevanceScore + priceScore + ratingScore + freshnessScore + marketplaceScore;
      
      return {
        product,
        score: totalScore
      };
    });

    // Ordenar por score (maior primeiro)
    scoredProducts.sort((a, b) => b.score - a.score);

    return scoredProducts.map(item => item.product);
  }

  private getMarketplaceScore(source?: string): number {
    // Preferência de marketplaces (ajustar conforme qualidade)
    const scores: Record<string, number> = {
      'google_shopping': 1.0,
      'olx': 0.8,
      'webmotors': 0.9,
      'mercadolivre': 0.85,
    };
    
    return scores[source || ''] || 0.5;
  }

  /* ============================================
     UTILIDADES
  ============================================ */

  private normalizeQuery(query: string): string {

    return query
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ');
  }

  private generateStableId(url: string): string {

    return crypto
      .createHash('md5')
      .update(url)
      .digest('hex');
  }

  /**
   * Ordena produtos localmente (para APIs que não suportam sortBy)
   */
  private sortProducts(products: Product[], sortBy: string): Product[] {
    if (!products || products.length === 0) return products;
    
    const sorted = [...products];
    
    switch (sortBy) {
      case 'LOWEST_PRICE':
        return sorted.sort((a, b) => {
          const priceA = this.extractPrice(String(a.price));
          const priceB = this.extractPrice(String(b.price));
          return (priceA || 0) - (priceB || 0);
        });
      
      case 'HIGHEST_PRICE':
        return sorted.sort((a, b) => {
          const priceA = this.extractPrice(String(a.price));
          const priceB = this.extractPrice(String(b.price));
          return (priceB || 0) - (priceA || 0);
        });
      
      case 'TOP_RATED':
        return sorted.sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA;
        });
      
      default:
        return sorted;
    }
  }

}
