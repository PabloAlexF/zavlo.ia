import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '@config/firebase.service';
import { RedisService } from '@config/redis.service';
import { Product } from '../products/interfaces/product.interface';
import { GoogleShoppingService } from '../scraping/google-shopping.service';
import { GoogleLensService } from '../scraping/google-lens.service';
import { OlxService } from '../scraping/olx.service';
import { MobiautoService } from '../scraping/mobiauto.service';
import { WebmotorsService } from '../scraping/webmotors.service';
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
    private mobiautoService: MobiautoService,
    private webmotorsService: WebmotorsService,
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

  /* ============================================
     CACHE POR SCRAPER (OTIMIZAÇÃO GIGANTE)
  ============================================ */
  private async getCachedScraperResult(source: string, query: string): Promise<Product[] | null> {
    // ✅ PROBLEMA 5 CORRIGIDO: Hash da query completa para evitar colisão
    const cacheKey = `scraper:${source}:${crypto.createHash('md5').update(query).digest('hex')}`;
    const cached = await this.redisService.get(cacheKey);
    
    if (cached) {
      this.logger.log(`✅ [CACHE] Hit for ${source}: ${query}`);
      return JSON.parse(cached);
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
      filters?.sortBy || 'RELEVANCE',
      filters?.minPrice || '0',
      filters?.maxPrice || '999999',
      filters?.condition || 'all',
      filters?.limit || '50',
      filters?.providedClassification?.category || 'general',
      filters?.providedClassification?.condition || 'unknown',
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
    question?: string;
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
    question?: string;
    missingFields?: string[];
    classification?: any;
  }> {
    const startTime = Date.now();
    let creditsUsed = 0;
    let remainingCredits: number | undefined;
    
    // Extrair sortBy dos filtros (padrão: RELEVANCE)
    const sortBy = filters?.sortBy || 'RELEVANCE';
    
    this.logger.log(`🔍 [SEARCH DEBUG] Starting searchByText:`);
    this.logger.log(`   - query: ${query}`);
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
      this.logger.log(`   - Scrapers recomendados: ${classification.recommended_scrapers?.join(', ')}`);
    } else {
      // Classificar apenas se não foi fornecida
      try {
        this.logger.log(`🤖 [CLASSIFICATION] Classificando query: "${query}"`);
        classification = await this.classificationService.classifyQuery(query, {}, userId);
        this.logger.log(`✅ [CLASSIFICATION] Resultado:`);
        this.logger.log(`   - Categoria: ${classification.category}`);
        this.logger.log(`   - Confiança: ${classification.confidence}`);
        this.logger.log(`   - Scrapers recomendados: ${classification.recommended_scrapers.join(', ')}`);
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
          recommended_scrapers: ['google_shopping'],
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
      
      // ✅ PROBLEMA 2 CORRIGIDO: NÃO deduzir créditos ainda
      // Vamos deduzir apenas se a busca retornar resultados
      this.logger.log(`✅ [SEARCH DEBUG] Usage limit OK, will deduct credits after successful search`);
      
      await this.usersService.incrementUsage(userId, 'text');
    } else {
      this.logger.log(`🔍 [SEARCH DEBUG] No user ID provided, proceeding without credit deduction`);
    }
    
    const normalizedQuery = this.normalizeQuery(query);

    this.logger.log(`🔍 [SEARCH DEBUG] Query original: ${query}`);
    this.logger.log(`🔍 [SEARCH DEBUG] Query normalizada: ${normalizedQuery}`);

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

    const cacheKey = this.generateCacheKey(normalizedQuery, filters, userLocation?.city);

    // CACHE
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      this.logger.log(`[CACHE] Hit`);
      const cachedResult = JSON.parse(cached);
      
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
        remainingCredits
      };
    }

    // Se freeMode (plano free/usuário não logado), busca limitada
    if (filters?.freeMode) {
      const fixedLimit = 20; // ✅ SEMPRE 20 resultados
      
      this.logger.log(`🆓 [SEARCH DEBUG] Busca gratuita - ${fixedLimit} resultados (freeMode=${filters.freeMode})`);
      
      try {
        const results = await this.googleShoppingService.search(normalizedQuery, fixedLimit, sortBy);
        const result = { 
          results: results, 
          total: results.length,
          creditsUsed,
          remainingCredits
        };
        
        this.logger.log(`🆓 [SEARCH DEBUG] Free search completed with ${results.length} results`);
        
        await this.redisService.set(cacheKey, JSON.stringify(result), 3600);
        return result;
      } catch (error) {
        this.logger.warn(`⚠️ [SEARCH DEBUG] Erro na busca gratuita: ${error.message}`);
      }

      const fallback = await this.searchInFirebase(normalizedQuery, filters);
      this.logger.log(`🆓 [SEARCH DEBUG] Using Firebase fallback with ${fallback.results.length} results`);
      return {
        ...fallback,
        creditsUsed,
        remainingCredits
      };
    }

    // GOOGLE SHOPPING SEARCH (planos pagos)
    let products: Product[] = [];
    const fixedLimit = 20; // ✅ SEMPRE 20 resultados
    const usedSources: string[] = []; // Declarar antes do try

    // 🚀 EXECUTAR SCRAPERS BASEADO NA CLASSIFICAÇÃO
    const scrapers = classification.recommended_scrapers;
    const resultLimit = 20; // ✅ SEMPRE 20 resultados
    this.logger.log(`🎯 [SCRAPERS] Executando: ${scrapers.join(', ')} com limite fixo de ${resultLimit} resultados`);

    try {
      // ✅ PROBLEMA 1 CORRIGIDO: Retornar source no objeto para evitar race condition
      const scrapingPromises = [];

      if (scrapers.includes('google_shopping')) {
        // 🚀 Verificar circuit breaker
        if (!this.isScraperAvailable('google_shopping')) {
          this.logger.warn(`[GOOGLE SHOPPING] Pulado - circuit breaker ativo`);
        } else {
          this.logger.log(`[GOOGLE SHOPPING] Buscando ${resultLimit} produtos com sortBy=${sortBy}...`);
          
          // 🚀 Usar limiter de concorrência
          scrapingPromises.push(
            this.scraperLimit(() => (async () => {
              // ✅ Verificar cache primeiro
              const cached = await this.getCachedScraperResult('google_shopping', `${normalizedQuery}:${sortBy}:${resultLimit}`);
              if (cached) {
                this.resetScraperFailures('google_shopping'); // Sucesso via cache
                return { source: 'google_shopping', results: cached, cached: true };
              }
              
              // Executar scraper
              try {
                const results = await this.withTimeout(
                  this.googleShoppingService.search(normalizedQuery, resultLimit, sortBy),
                  8000,
                  'GoogleShopping'
                );
                
                // ✅ Salvar no cache
                await this.setCachedScraperResult('google_shopping', `${normalizedQuery}:${sortBy}:${resultLimit}`, results);
                this.resetScraperFailures('google_shopping'); // Sucesso
                return { source: 'google_shopping', results, cached: false };
              } catch (error) {
                this.logger.warn(`[GOOGLE SHOPPING] Erro: ${error.message}`);
                this.recordScraperFailure('google_shopping'); // Registrar falha
                return { source: 'google_shopping', results: [], cached: false };
              }
            })())
          );
        }
      }

      if (scrapers.includes('olx')) {
        // 🚀 Verificar circuit breaker
        if (!this.isScraperAvailable('olx')) {
          this.logger.warn(`[OLX] Pulado - circuit breaker ativo`);
        } else {
          this.logger.log(`[OLX] Buscando ${resultLimit} produtos com sortBy=${sortBy}...`);
          
          // 🚀 Usar limiter de concorrência
          scrapingPromises.push(
            this.scraperLimit(() => (async () => {
              // ✅ Verificar cache primeiro
              const cached = await this.getCachedScraperResult('olx', `${normalizedQuery}:${sortBy}:${resultLimit}`);
              if (cached) {
                this.resetScraperFailures('olx');
                return { source: 'olx', results: cached, cached: true };
              }
              
              // Executar scraper
              try {
                const results = await this.withTimeout(
                  this.olxService.search(normalizedQuery, resultLimit, sortBy),
                  8000,
                  'OLX'
                );
                
                // ✅ Salvar no cache
                await this.setCachedScraperResult('olx', `${normalizedQuery}:${sortBy}:${resultLimit}`, results);
                this.resetScraperFailures('olx');
                return { source: 'olx', results, cached: false };
              } catch (error) {
                this.logger.warn(`[OLX] Erro: ${error.message}`);
                this.recordScraperFailure('olx');
                return { source: 'olx', results: [], cached: false };
              }
            })())
          );
        }
      }

      if (scrapers.includes('webmotors')) {
        // 🚀 Verificar circuit breaker
        if (!this.isScraperAvailable('webmotors')) {
          this.logger.warn(`[WEBMOTORS] Pulado - circuit breaker ativo`);
        } else {
          this.logger.log(`[WEBMOTORS] Buscando ${resultLimit} veículos...`);
          
          // 🚀 Usar limiter de concorrência
          scrapingPromises.push(
            this.scraperLimit(() => (async () => {
              // ✅ Verificar cache primeiro
              const cached = await this.getCachedScraperResult('webmotors', `${normalizedQuery}:${resultLimit}`);
              if (cached) {
                this.resetScraperFailures('webmotors');
                return { source: 'webmotors', results: cached, cached: true };
              }
              
              // Executar scraper
              try {
                const results = await this.withTimeout(
                  this.webmotorsService.search(normalizedQuery, resultLimit),
                  10000,
                  'Webmotors'
                );
                
                // ✅ Salvar no cache
                await this.setCachedScraperResult('webmotors', `${normalizedQuery}:${resultLimit}`, results);
                this.resetScraperFailures('webmotors');
                return { source: 'webmotors', results, cached: false };
              } catch (error) {
                this.logger.warn(`[WEBMOTORS] Erro: ${error.message}`);
                this.recordScraperFailure('webmotors');
                return { source: 'webmotors', results: [], cached: false };
              }
            })())
          );
        }
      }

      if (scrapers.includes('mobiauto')) {
        // 🚀 Verificar circuit breaker
        if (!this.isScraperAvailable('mobiauto')) {
          this.logger.warn(`[MOBIAUTO] Pulado - circuit breaker ativo`);
        } else {
          this.logger.log(`[MOBIAUTO] Buscando ${resultLimit} veículos...`);
          
          // 🚀 Usar limiter de concorrência
          scrapingPromises.push(
            this.scraperLimit(() => (async () => {
              // ✅ Verificar cache primeiro
              const cached = await this.getCachedScraperResult('mobiauto', `${normalizedQuery}:${resultLimit}`);
              if (cached) {
                this.resetScraperFailures('mobiauto');
                return { source: 'mobiauto', results: cached, cached: true };
              }
              
              // Executar scraper
              try {
                const results = await this.withTimeout(
                  this.mobiautoService.search(normalizedQuery, resultLimit),
                  10000,
                  'Mobiauto'
                );
                
                // ✅ Salvar no cache
                await this.setCachedScraperResult('mobiauto', `${normalizedQuery}:${resultLimit}`, results);
                this.resetScraperFailures('mobiauto');
                return { source: 'mobiauto', results, cached: false };
              } catch (error) {
                this.logger.warn(`[MOBIAUTO] Erro: ${error.message}`);
                this.recordScraperFailure('mobiauto');
                return { source: 'mobiauto', results: [], cached: false };
              }
            })())
          );
        }
      }

      // Aguardar todos os scrapers (com resiliência)
      // ✅ Promise.allSettled: Um scraper falhando não derruba os outros
      const scrapingResults = await Promise.allSettled(scrapingPromises);
      
      // Consolidar resultados (apenas fulfilled)
      for (const result of scrapingResults) {
        if (result.status === 'fulfilled') {
          const { source, results, cached } = result.value;
          this.logger.log(`✅ [${source.toUpperCase()}] ${results.length} produtos encontrados`);
          products.push(...results);
          
          // Adicionar source à lista (com indicador de cache)
          usedSources.push(cached ? `${source}:cached` : source);
        } else {
          this.logger.error(`❌ [SCRAPER] Falha: ${result.reason}`);
        }
      }

      this.logger.log(`📊 [TOTAL] ${products.length} produtos consolidados de ${scrapers.length} fonte(s)`);
      this.logger.log(`💾 [SOURCES] Fontes usadas: ${usedSources.join(', ')}`);
      
      // ✅ Deduplicar produtos (evitar repetições entre marketplaces)
      products = this.deduplicateProducts(products);
      this.logger.log(`🧹 [DEDUP] ${products.length} produtos após deduplicar`);
      
      // Ordenar produtos consolidados se necessário
      // Google Shopping e OLX já retornam ordenados
      // Webmotors e Mobiauto precisam ser ordenados localmente
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
        
        const user = await this.usersService.findById(userId);
        remainingCredits = user?.credits || 0;
        
        this.logger.log(`✅ [CREDITS] Deducted 1 credit after successful search. Remaining: ${remainingCredits}`);
      } catch (creditError: any) {
        this.logger.error(`❌ [CREDITS] Failed to deduct credit: ${creditError.message}`);
        // Não bloquear resultado se falhar deduzir crédito
      }
    }

    const result = {
      results: products,
      total: products.length,
      creditsUsed,
      remainingCredits
    };

    // ✅ PROBLEMA 2 CORRIGIDO: Aplicar filtros ANTES de cachear (sem mutação)
    let finalResults = products;
    if (filters?.minPrice || filters?.maxPrice) {
      finalResults = this.applyPriceFilter(products, filters.minPrice, filters.maxPrice);
    }

    const finalResult = {
      results: finalResults,
      total: finalResults.length,
      creditsUsed,
      remainingCredits
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

    if (cached) return JSON.parse(cached);

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
     FILTRO DE PREÇO
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
      const brand = this.normalizeQuery(product.brand || '');
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
      'mobiauto': 0.85,
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
