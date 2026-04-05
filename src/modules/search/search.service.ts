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
import { ComparisonsService } from '../comparisons/comparisons.service';
import { PLAN_LIMITS, PLAN_PRICING, CREDIT_PACKAGES, PlanType } from '@shared/plans.constants';
import * as crypto from 'crypto';
import pLimit from 'p-limit';

type SearchBillingEvent = {
  source: string;
  resultsCount: number;
  pagesRequested?: number;
  requestedResults?: number;
  sellerDataAddonRequested?: boolean;
};

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

  // 💰 MODELO DE CUSTO POR FONTE (Apify)
  // Mercado Livre: $2.00 / 1.000 resultados
  // OLX: $10.00 / 1.000 resultados
  // Google Shopping: $20.00 / 1.000 resultados
  private readonly SOURCE_COST_USD_PER_1000_RESULTS: Record<string, number> = {
    mercadolivre: 2,
    olx: 10,
    google_shopping: 20,
  };

  // Webmotors é pay-per-event (estimativa conservadora para proteger margem)
  private readonly WEBMOTORS_EVENT_COST_USD = 0.30;
  private readonly WEBMOTORS_DEFAULT_MAX_REQUESTS = 10;
  private readonly WEBMOTORS_SELLER_ADDON_MULTIPLIER = 1.5;

  // Conversão e margem de negócio
  private readonly USD_TO_BRL = 5;
  private readonly TARGET_GROSS_MARGIN = 0.65;
  private readonly MIN_CREDITS_PER_EXTERNAL_CALL = 1;

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
    private comparisonsService: ComparisonsService,
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
      this.logger.log(`🟢 [CIRCUIT BREAKER] ${this.sanitizeForLog(source)} reativado após ${Math.round(timeSinceLastFailure / 1000)}s`);
      this.resetScraperFailures(source);
      return true;
    }
    
    // Se atingiu max failures e ainda está no período de break
    if (failure.count >= this.MAX_FAILURES) {
      const remainingTime = Math.round((this.CIRCUIT_BREAK_TIME - timeSinceLastFailure) / 1000);
      this.logger.warn(`🔴 [CIRCUIT BREAKER] ${this.sanitizeForLog(source)} ainda desativado (${remainingTime}s restantes)`);
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

  private calculateEstimatedUsdCost(event: SearchBillingEvent): number {
    if (event.source === 'webmotors') {
      const maxRequests = Number.isFinite(event.pagesRequested)
        ? Math.max(1, Number(event.pagesRequested))
        : this.WEBMOTORS_DEFAULT_MAX_REQUESTS;
      const requestMultiplier = Math.max(1, maxRequests / this.WEBMOTORS_DEFAULT_MAX_REQUESTS);
      const sellerAddonMultiplier = event.sellerDataAddonRequested
        ? this.WEBMOTORS_SELLER_ADDON_MULTIPLIER
        : 1;
      return this.WEBMOTORS_EVENT_COST_USD * requestMultiplier * sellerAddonMultiplier;
    }

    const sourceCost = this.SOURCE_COST_USD_PER_1000_RESULTS[event.source];
    if (sourceCost) {
      const billableResults = event.source === 'google_shopping'
        ? Math.max(event.resultsCount, event.requestedResults || 0, 1)
        : Math.max(event.resultsCount, 1);
      return (sourceCost * billableResults) / 1000;
    }

    return this.maxCostPerCreditUsd();
  }

  private minRevenuePerCreditBrl(): number {
    const paidPlans = [PlanType.BASIC, PlanType.PRO, PlanType.BUSINESS];

    const planRevenues = paidPlans
      .map((plan) => {
        const price = PLAN_PRICING[plan].monthly;
        const credits = PLAN_LIMITS[plan].textSearchesPerMonth || 1;
        return price / credits;
      })
      .filter((v) => Number.isFinite(v) && v > 0);

    const packageRevenues = CREDIT_PACKAGES
      .map((pkg) => {
        const totalCredits = pkg.credits + (pkg.bonus || 0);
        return totalCredits > 0 ? pkg.price / totalCredits : Number.POSITIVE_INFINITY;
      })
      .filter((v) => Number.isFinite(v) && v > 0);

    const all = [...planRevenues, ...packageRevenues];
    return all.length > 0 ? Math.min(...all) : 2.5;
  }

  private maxCostPerCreditBrl(): number {
    const minRevenue = this.minRevenuePerCreditBrl();
    return minRevenue * (1 - this.TARGET_GROSS_MARGIN);
  }

  private maxCostPerCreditUsd(): number {
    return this.maxCostPerCreditBrl() / this.USD_TO_BRL;
  }

  private calculateCreditsFromBillingEvents(events: SearchBillingEvent[]): number {
    if (events.length === 0) return 0;

    let totalCredits = 0;
    const maxCostUsdPerCredit = this.maxCostPerCreditUsd();
    const minRevenuePerCredit = this.minRevenuePerCreditBrl();
    const maxCostPerCreditBrl = this.maxCostPerCreditBrl();

    this.logger.log(
      `💼 [CREDITS MODEL] minRevenuePerCreditBRL=${minRevenuePerCredit.toFixed(2)} targetMargin=${(this.TARGET_GROSS_MARGIN * 100).toFixed(0)}% maxCostPerCreditBRL=${maxCostPerCreditBrl.toFixed(2)} maxCostPerCreditUSD=${maxCostUsdPerCredit.toFixed(4)}`,
    );

    for (const event of events) {
      const estimatedUsd = this.calculateEstimatedUsdCost(event);
      let creditsForEvent = Math.max(
        this.MIN_CREDITS_PER_EXTERNAL_CALL,
        Math.ceil(estimatedUsd / maxCostUsdPerCredit),
      );

      if (event.source === 'olx') {
        const pages = Number.isFinite(event.pagesRequested)
          ? Math.max(1, Number(event.pagesRequested))
          : 1;
        const extraCredits = Math.max(0, pages - 1);
        creditsForEvent += extraCredits;
      }

      totalCredits += creditsForEvent;
      this.logger.log(
        `💳 [CREDITS COST] source=${event.source} results=${event.resultsCount} requestedResults=${event.requestedResults || event.resultsCount} pages=${event.pagesRequested || 1} estimatedUsd=${estimatedUsd.toFixed(4)} credits=${creditsForEvent}`,
      );
    }

    return totalCredits;
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
      filters?.providedClassification?.ml_scrape_ofertas === true ? 'mlOffers:1' : 'mlOffers:0',
      filters?.providedClassification?.ml_promoted === true ? 'mlPromoted:1' : 'mlPromoted:0',
      filters?.providedClassification?.olx_max_pages ? `olxPages:${filters.providedClassification.olx_max_pages}` : 'olxPages:auto',
      filters?.providedClassification?.olx_max_requests ? `olxReq:${filters.providedClassification.olx_max_requests}` : 'olxReq:100',
      filters?.providedClassification?.google_country ? `gCountry:${filters.providedClassification.google_country}` : 'gCountry:br',
      filters?.providedClassification?.google_language ? `gLang:${filters.providedClassification.google_language}` : 'gLang:pt',
      filters?.providedClassification?.google_limit ? `gLimit:${filters.providedClassification.google_limit}` : 'gLimit:auto',
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

      // Aplicar filtros de preço se especificados
      let filteredResults = cachedResult.results;
      if (filters?.minPrice || filters?.maxPrice) {
        filteredResults = this.applyPriceFilter(cachedResult.results, filters.minPrice, filters.maxPrice);
      }

      // 🌟 Aplicar filtros de qualidade (ratings, frete grátis)
      filteredResults = this.filterByQualityAndShipping(filteredResults, classification);
      filteredResults = await this.applyPriceDropPreference(filteredResults, classification);

      // Cache hit puro: sem nova chamada a marketplace, então não cobra crédito
      creditsUsed = 0;
      if (userId) {
        const user = await this.usersService.findById(userId);
        remainingCredits = user?.credits || 0;
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
        relaxedFilters: filteredResults.length === 0
          ? [...(cachedResult.relaxedFilters ?? []), 'price']
          : cachedResult.relaxedFilters ?? undefined,
      };
      }
    }

    // GOOGLE SHOPPING SEARCH (planos pagos)
    let products: Product[] = [];
    const fixedLimit = 20;
    const usedSources: string[] = [];
    const billingEvents: SearchBillingEvent[] = [];
    let availableExpansionSources: string[] = [];
    let primarySource = '';

    // 🚀 EXECUTAR SCRAPERS BASEADO NA CLASSIFICAÇÃO
    const category = classification?.category;
    const isVehicleCategory = category === 'car' || category === 'motorcycle';
    const normalizedCondition = String(classification?.condition || '').toLowerCase();
    const vehicleDefaultScrapers = normalizedCondition === 'new'
      ? ['mercadolivre', 'olx', 'webmotors']
      : ['olx', 'mercadolivre', 'webmotors'];
    const scrapers = (classification?.scrapers as { name: string; score: number }[] | undefined)
      ?.map(s => s.name)
      ?? (isVehicleCategory ? vehicleDefaultScrapers : ['google_shopping', 'mercadolivre', 'olx']);
    const SATISFACTORY_THRESHOLD = 20;
    const resultLimit = Number.isFinite(classification?.result_limit)
      ? Math.min(Math.max(Number(classification.result_limit), 10), 50)
      : 20;
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

      // Para veículos: definir marketplace primário pela condição.
      // - novo  -> Mercado Livre primeiro
      // - usado -> OLX primeiro
      // O segundo/terceiro ficam para expansão opcional do usuário.
      // Se classification já vem com scraper único (expansão do frontend), respeitar.
      const isExpansionRequest = scrapers.length === 1;
      const vehiclePrimarySource = normalizedCondition === 'new' ? 'mercadolivre' : 'olx';
      const vehiclePrimaryScrapers = (isVehicle && !isExpansionRequest) ? [vehiclePrimarySource] : scrapers;
      const vehicleExpansionPool = (isVehicle && !isExpansionRequest)
        ? ['olx', 'mercadolivre', 'webmotors']
            .filter(s => s !== vehiclePrimarySource)
            .filter(s => this.isScraperAvailable(s))
        : [];

      const activeScrapers = (isVehicle && !isExpansionRequest) ? vehiclePrimaryScrapers : scrapers;
      this.logger.log(`🚗 [VEHICLE] isVehicle=${isVehicle} | isExpansionRequest=${isExpansionRequest}`);
      this.logger.log(`🚗 [VEHICLE] condition=${normalizedCondition || 'unknown'} | activeScrapers=[${activeScrapers.join(', ')}] | expansionPool=[${vehicleExpansionPool.join(', ')}]`);
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
        const scraperCacheKey = `${scraper}:${normalizedQuery}:${resultLimit}:${classification?.condition || 'any'}:${classification?.detected_year || '0'}:${classification?.user_location?.city || 'all'}:${classification?.ml_scrape_ofertas ? 'offers1' : 'offers0'}:${classification?.ml_promoted ? 'promoted1' : 'promoted0'}:${classification?.olx_max_pages ? `olxPages${classification.olx_max_pages}` : 'olxPagesAuto'}:${classification?.olx_max_requests ? `olxReq${classification.olx_max_requests}` : 'olxReq100'}:${classification?.webmotors_seller_data_addon ? 'wmSeller1' : 'wmSeller0'}:${classification?.webmotors_max_requests ? `wmReq${classification.webmotors_max_requests}` : 'wmReq10'}:${classification?.google_country ? `gCountry${classification.google_country}` : 'gCountryBr'}:${classification?.google_language ? `gLang${classification.google_language}` : 'gLangPt'}:${classification?.google_limit ? `gLimit${classification.google_limit}` : 'gLimitAuto'}`;
        const cachedData = await this.getCachedScraperResult(scraper, scraperCacheKey);
        if (cachedData) {
          scraperResults = cachedData;
          cached = true;
          this.resetScraperFailures(scraper);
        } else {
          try {
            if (scraper === 'mercadolivre') {
              const { results } = await this.withTimeout(
                this.mercadoLivreService.search(normalizedQuery, resultLimit, sortBy as any, classification),
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
            billingEvents.push({
              source: scraper,
              resultsCount: scraperResults.length,
              pagesRequested: scraper === 'olx'
                ? Number(classification?.olx_max_pages || 1)
                : scraper === 'webmotors'
                  ? Number(classification?.webmotors_max_requests || this.WEBMOTORS_DEFAULT_MAX_REQUESTS)
                  : 1,
              requestedResults: scraper === 'google_shopping'
                ? Number(classification?.google_limit || resultLimit)
                : resultLimit,
              sellerDataAddonRequested: scraper === 'webmotors'
                ? Boolean(classification?.webmotors_seller_data_addon)
                : false,
            });
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

        // Para veículos: sempre parar após o scraper primário e oferecer expansão
        if (isVehicle && !isExpansionRequest) {
          availableExpansionSources = vehicleExpansionPool;
          this.logger.log(`🚗 [VEHICLE STRATEGY] ${scraper.toUpperCase()} concluído (${products.length} resultados). Expansão disponível: ${availableExpansionSources.join(', ') || 'nenhuma'}`);
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

      // 🌟 Aplicar filtros de qualidade (ratings, frete grátis)
      products = this.filterByQualityAndShipping(products, classification);
      products = await this.applyPriceDropPreference(products, classification);
      this.logger.log(`🏆 [QUALITY FILTERS] ${products.length} produtos após filtros de qualidade`);
      
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

      // Fallback Firebase: sem chamada a marketplace externo, então sem cobrança
      creditsUsed = 0;
      if (userId) {
        const user = await this.usersService.findById(userId);
        remainingCredits = user?.credits || 0;
      }

      return {
        ...fallback,
        creditsUsed,
        remainingCredits: userId ? (await this.usersService.findById(userId))?.credits : undefined
      };
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

    finalResults = this.applyVehicleIdentityFilter(finalResults, classification);

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
      const isVehicle = classification?.category === 'car' || classification?.category === 'motorcycle';
      const byYear = finalResults.filter(p => {
        const fabYear  = (p as any).year;
        const modYear  = (p as any).modelYear;
        const titleYear = this.extractYearFromText(String((p as any).title || ''));
        const yearCandidates = [fabYear, modYear, titleYear]
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value) && value >= 1950 && value <= new Date().getFullYear() + 1);

        if (yearCandidates.length === 0) {
          return !isVehicle;
        }

        return yearCandidates.some((candidate) => Math.abs(candidate - yr) <= 1);
      });
      if (byYear.length > 0) {
        this.logger.log(`📅 [YEAR FILTER] ${finalResults.length} → ${byYear.length} (ano: ${yr} ±1)`);
        finalResults = byYear;
      } else {
        this.logger.warn(`📅 [YEAR FILTER] Nenhum resultado para ano=${yr} ±1 — exibindo todos sem filtro de ano`);
        relaxedFilters.push('year');
      }
    }

    // ✅ Cobrança ponderada por custo estimado de fonte/resultado
    // Regra: só cobrar quando há resultados finais entregues ao usuário
    if (userId && !filters?.freeMode) {
      if (finalResults.length > 0 && products.length > 0) {
        creditsUsed = this.calculateCreditsFromBillingEvents(billingEvents);
        try {
          if (creditsUsed > 0) {
            await this.usersService.useCreditAndIncrementUsage(userId, 'text', creditsUsed);
          }
          const user = await this.usersService.findById(userId);
          remainingCredits = user?.credits || 0;
          this.logger.log(`✅ [CREDITS] Deducted ${creditsUsed} credit(s) after successful search. Remaining: ${remainingCredits}`);
        } catch (creditError: any) {
          if (creditError.response?.error === 'INSUFFICIENT_CREDITS') {
            throw new BadRequestException({
              error: 'INSUFFICIENT_CREDITS',
              message: 'Créditos insuficientes',
              currentCredits: creditError.response.currentCredits || 0,
              requiredCredits: creditsUsed,
              action: 'buy_credits',
            });
          }
          throw creditError;
        }
      } else {
        creditsUsed = 0;
        const user = await this.usersService.findById(userId);
        remainingCredits = user?.credits || 0;
        this.logger.log('💳 [CREDITS] No final results after filtering — no credits deducted');
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

    void this.trackPriceSnapshots(finalResults).catch((error) => {
      this.logger.warn(`⚠️ [PRICE HISTORY] Falha ao rastrear snapshots: ${error.message}`);
    });

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
    classification?: any;
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
      
    }

    // 1. Identificar produto com Google Vision (SEM buscar preços)
    const { productName: identifiedProduct } = await this.googleLensService.identifyProduct(imageUrl);
    productName = identifiedProduct;

    // 2. Classificar o produto identificado via Python (sem custo de crédito)
    let classification: any = null;
    try {
      classification = await this.classificationService.classifyQuery(productName, {}, userId);
      this.logger.log(`[IMAGE] Produto classificado: categoria=${classification.category}, scrapers=${classification.scrapers?.map((s: any) => s.name).join(', ')}`);
    } catch (classifyError) {
      this.logger.warn(`[IMAGE] Falha ao classificar produto identificado: ${classifyError.message}`);
    }

    // Deduzir crédito APÓS identificação bem-sucedida
    if (userId) {
      try {
        await this.usersService.useCreditAndIncrementUsage(userId, 'image', 1);
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
    }
    
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
      productName,
      classification,
    };
  }

  /* ============================================
     BUSCA DE PREÇOS APÓS IDENTIFICAÇÃO
  ============================================ */
  async searchProductPrices(productName: string, userId?: string, sortBy: string = 'BEST_MATCH', classification?: any): Promise<{ 
    results: Product[]; 
    creditsUsed?: number; 
    remainingCredits?: number;
  }> {
    const startTime = Date.now();
    let creditsUsed = 0;
    let apiCalls = 0;
    let remainingCredits: number | undefined;

    // Rotear para o scraper correto baseado na classificação do Python
    const primaryScraper = classification?.scrapers?.[0]?.name || 'google_shopping';
    this.logger.log(`[PRICES] scraper=${primaryScraper} categoria=${classification?.category || 'n/a'}`);

    let results: Product[];
    try {
      if (primaryScraper === 'mercadolivre') {
        apiCalls += 1;
        const { results: r } = await this.withTimeout(this.mercadoLivreService.search(productName, 20, sortBy as any, classification), 60000, 'MercadoLivre');
        results = r;
      } else if (primaryScraper === 'webmotors') {
        apiCalls += 1;
        const { results: r } = await this.withTimeout(this.webmotorsService.search(productName, 20, classification), 90000, 'Webmotors');
        results = r;
      } else if (primaryScraper === 'olx') {
        apiCalls += 1;
        results = await this.withTimeout(this.olxService.search(productName, 20, sortBy, classification), 120000, 'OLX');
      } else {
        apiCalls += 1;
        results = await this.googleShoppingService.search(productName, 20, sortBy as any);
      }
    } catch (scraperError) {
      this.logger.warn(`[PRICES] ${primaryScraper} falhou, fallback Google Shopping: ${scraperError.message}`);
      apiCalls += 1;
      results = await this.googleShoppingService.search(productName, 20, sortBy as any);
    }

    if (userId) {
      try {
        creditsUsed = apiCalls;
        if (creditsUsed > 0) {
          await this.usersService.useCreditAndIncrementUsage(userId, 'image', creditsUsed);
        }
        const user = await this.usersService.findById(userId);
        remainingCredits = user?.credits || 0;
        this.logger.log(`[CREDITS] Deducted ${creditsUsed} credit(s) for price search. Remaining: ${remainingCredits}`);
      } catch (creditError: any) {
        if (creditError.response?.error === 'INSUFFICIENT_CREDITS') {
          throw new BadRequestException({
            error: 'INSUFFICIENT_CREDITS',
            message: 'You do not have enough credits for price search',
            currentCredits: creditError.response.currentCredits || 0,
            requiredCredits: creditsUsed,
            action: 'buy_credits'
          });
        }
        this.logger.warn(`[CREDITS] Failed to deduct credits: ${creditError.message}`);
      }
    }

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

  private filterByQualityAndShipping(products: Product[], classification?: any): Product[] {
    let filtered = [...products];

    // 🌟 Filtrar por ratings se preferência informada
    if (classification?.minimum_rating && typeof classification.minimum_rating === 'number') {
      const minRating = classification.minimum_rating;
      filtered = filtered.filter(p => {
        const rating = (p.rating || 0);
        return rating >= minRating;
      });
      this.logger.log(`⭐ [QUALITY FILTER] Aplicado: rating >= ${minRating}. Resultados: ${filtered.length}/${products.length}`);
    }

    // 🚚 Filtrar por frete grátis se preferência informada
    if (classification?.require_free_shipping === true) {
      filtered = filtered.filter(p => {
        const shipping = String(p.shipping || '').toLowerCase();
        const isFree = shipping.includes('grátis') || shipping.includes('gratuito') || shipping.includes('free');
        return isFree;
      });
      this.logger.log(`🚚 [SHIPPING FILTER] Aplicado: frete grátis. Resultados: ${filtered.length}/${products.length}`);
    }

    // 💳 Boost para Mercadolivre com parcelamento sem juros
    if (classification?.prefer_installments === true) {
      filtered.sort((a, b) => {
        const aIsMercado = (a.source || '').toLowerCase().includes('mercado');
        const bIsMercado = (b.source || '').toLowerCase().includes('mercado');
        if (aIsMercado && !bIsMercado) return -1;
        if (!aIsMercado && bIsMercado) return 1;
        return 0;
      });
      this.logger.log(`💳 [INSTALLMENT BOOST] Mercadolivre com parcelamento prioritário`);
    }

    // 🎉 Ordenar por promoções se preferência informada
    if (classification?.priority_discounted === true) {
      filtered.sort((a, b) => {
        const aDiscount = this.extractDiscountPercent(a);
        const bDiscount = this.extractDiscountPercent(b);
        return bDiscount - aDiscount; // Maior desconto primeiro
      });
      this.logger.log(`🎉 [PROMOTION BOOST] Ordenado por desconto. Resultados: ${filtered.length}/${products.length}`);
    }

    // 📍 Ordenar por proximidade se preferência informada (OLX)
    if (classification?.prefer_proximity_olx === 'nearby' && classification?.user_location?.city) {
      const userCoords = this.getLocationFromCity(classification.user_location.city);
      if (userCoords) {
        filtered.sort((a, b) => {
          // Extrair coordenadas dos produtos (OLX fornece location)
          const aLocation = (a as any).location;
          const bLocation = (b as any).location;
          
          // Se tem coordenadas exatas, usar; senão estimado pela cidade
          const aCity = aLocation?.city || '';
          const bCity = bLocation?.city || '';
          const aCoords = this.getLocationFromCity(aCity) || userCoords;
          const bCoords = this.getLocationFromCity(bCity) || userCoords;
          
          const aDist = this.calculateDistance(userCoords.lat, userCoords.lon, aCoords.lat, aCoords.lon);
          const bDist = this.calculateDistance(userCoords.lat, userCoords.lon, bCoords.lat, bCoords.lon);
          
          return aDist - bDist; // Menor distância primeiro
        });
        this.logger.log(`📍 [PROXIMITY BOOST] Ordenado por proximidade a ${classification.user_location.city}`);
      }
    }

    // 👤 Filtrar por tipo de vendedor (OLX)
    if (classification?.seller_type_preference && classification.seller_type_preference !== 'any') {
      filtered = filtered.filter(p => {
        const isBusiness = (p as any).isBusiness || false;
        if (classification.seller_type_preference === 'business') {
          return isBusiness === true;
        } else if (classification.seller_type_preference === 'individual') {
          return isBusiness === false;
        }
        return true;
      });
      this.logger.log(`👤 [SELLER FILTER] Filtrado por tipo: ${classification.seller_type_preference}. Resultados: ${filtered.length}/${products.length}`);
    }

    // 📦 Filtrar por disponibilidade
    if (classification?.availability_preference === 'in_stock') {
      filtered = filtered.filter(p => {
        const inStock = (p as any).inStock !== false && (p as any).productCondition !== 'out_of_stock';
        return inStock;
      });
      this.logger.log(`📦 [AVAILABILITY FILTER] Filtrado em estoque. Resultados: ${filtered.length}/${products.length}`);
    }

    return filtered.length > 0 ? filtered : products;
  }

  private async applyPriceDropPreference(products: Product[], classification?: any): Promise<Product[]> {
    if (classification?.prefer_price_drop !== true || products.length === 0) {
      return products;
    }

    const withIndex = products.map((product, index) => ({ product, index }));
    const ranked = await Promise.all(withIndex.map(async ({ product, index }) => {
      const productId = this.buildPriceHistoryId(product);
      if (!productId) return { product, index, priority: 2, dropPercent: 0 };

      try {
        const history = await this.comparisonsService.getPriceHistory(productId, 30);
        const trend = this.computePriceTrend(history);
        if (!trend) return { product, index, priority: 2, dropPercent: 0 };

        (product as any).priceTrend = trend;

        if (trend.status === 'down' && trend.dropPercent >= 10) {
          return { product, index, priority: 0, dropPercent: trend.dropPercent };
        }
        if (trend.status === 'stable') {
          return { product, index, priority: 1, dropPercent: trend.dropPercent };
        }
        return { product, index, priority: 2, dropPercent: trend.dropPercent };
      } catch {
        return { product, index, priority: 2, dropPercent: 0 };
      }
    }));

    if (!ranked.some(item => item.priority === 0)) {
      this.logger.log('📉 [PRICE DROP] Sem itens elegíveis com queda >= 10% (30d), mantendo ordenação atual');
      return products;
    }

    ranked.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      if (a.dropPercent !== b.dropPercent) return b.dropPercent - a.dropPercent;
      return a.index - b.index;
    });

    this.logger.log('📉 [PRICE DROP] Priorização aplicada por tendência de queda (30d)');
    return ranked.map(item => item.product);
  }

  private async trackPriceSnapshots(products: Product[]): Promise<void> {
    const sample = products.slice(0, 30);

    await Promise.all(sample.map(async (product) => {
      const productId = this.buildPriceHistoryId(product);
      const price = this.extractPrice(String(product.price));

      if (!productId || !price || price <= 0) return;

      await this.comparisonsService.trackPriceHistory(productId, price, product.source || 'unknown');
    }));
  }

  private buildPriceHistoryId(product: Product): string | null {
    const source = String(product.source || 'unknown').toLowerCase();
    const rawId = product.id
      ? String(product.id)
      : this.generateStableId(String(product.sourceUrl || product.title || `${source}:${product.price || 0}`));

    if (!rawId) return null;
    return `${source}:${rawId}`;
  }

  private computePriceTrend(history: any[]): {
    status: 'down' | 'stable' | 'up';
    dropPercent: number;
    windowDays: number;
    latestPrice: number;
    oldestPrice: number;
  } | null {
    if (!Array.isArray(history) || history.length < 2) return null;

    const points = history
      .map((item) => {
        const price = this.extractPrice(String(item?.price ?? ''));
        const timestamp = this.extractHistoryTimestamp(item);
        if (!price || !timestamp) return null;
        return { price, timestamp };
      })
      .filter((point): point is { price: number; timestamp: number } => point !== null)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (points.length < 2) return null;

    const oldestPrice = points[0].price;
    const latestPrice = points[points.length - 1].price;

    if (!oldestPrice || oldestPrice <= 0) return null;

    const dropPercent = Math.round(((oldestPrice - latestPrice) / oldestPrice) * 100);
    const status: 'down' | 'stable' | 'up' = dropPercent >= 10
      ? 'down'
      : dropPercent <= -5
      ? 'up'
      : 'stable';

    return {
      status,
      dropPercent,
      windowDays: 30,
      latestPrice,
      oldestPrice,
    };
  }

  private extractHistoryTimestamp(item: any): number | null {
    const raw = item?.timestamp ?? item?.date ?? item?.createdAt;
    if (!raw) return null;

    if (typeof raw?.toDate === 'function') {
      const date = raw.toDate();
      return date instanceof Date ? date.getTime() : null;
    }

    if (raw instanceof Date) return raw.getTime();
    if (typeof raw === 'number') return raw;

    const parsed = Date.parse(String(raw));
    return Number.isFinite(parsed) ? parsed : null;
  }

  private extractDiscountPercent(product: Product): number {
    // Tentar extrair percentual de desconto do título ou campos específicos
    const title = String(product.title || '').toLowerCase();
    const offMatch = title.match(/(\d+)%\s*(?:off|desconto|promocao|promocão)/);
    if (offMatch) return parseInt(offMatch[1]);

    // Se tem preço original > preço atual = tem desconto
    const originalPrice = product.originalPrice ? this.extractPrice(String(product.originalPrice)) : null;
    const currentPrice = product.price ? this.extractPrice(String(product.price)) : null;
    if (originalPrice && currentPrice && originalPrice > currentPrice) {
      return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }

    return 0;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula simplificado para km
    const R = 6371; // Raio da Terra em km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private getLocationFromCity(city?: string): { lat: number; lon: number } | null {
    // Coordenadas aproximadas de cidades brasileiras principais
    const cityCoords: Record<string, { lat: number; lon: number }> = {
      'sao paulo': { lat: -23.5505, lon: -46.6333 },
      'sp': { lat: -23.5505, lon: -46.6333 },
      'são paulo': { lat: -23.5505, lon: -46.6333 },
      'rio de janeiro': { lat: -22.9068, lon: -43.1729 },
      'rj': { lat: -22.9068, lon: -43.1729 },
      'belo horizonte': { lat: -19.9167, lon: -43.9345 },
      'bh': { lat: -19.9167, lon: -43.9345 },
      'brasilia': { lat: -15.7975, lon: -47.8919 },
      'df': { lat: -15.7975, lon: -47.8919 },
      'salvador': { lat: -12.9714, lon: -38.5014 },
      'ba': { lat: -12.9714, lon: -38.5014 },
      'fortaleza': { lat: -3.7319, lon: -38.5267 },
      'ce': { lat: -3.7319, lon: -38.5267 },
      'curitiba': { lat: -25.4284, lon: -49.2733 },
      'pr': { lat: -25.4284, lon: -49.2733 },
      'recife': { lat: -8.0476, lon: -34.8770 },
      'pe': { lat: -8.0476, lon: -34.8770 },
      'manaus': { lat: -3.1190, lon: -60.0217 },
      'am': { lat: -3.1190, lon: -60.0217 },
      'porto alegre': { lat: -30.0346, lon: -51.2177 },
      'rs': { lat: -30.0346, lon: -51.2177 },
    };

    const normalized = (city || '').toLowerCase().trim();
    return cityCoords[normalized] || null;
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

  private extractYearFromText(text: string): number | null {
    const normalized = this.normalizeQuery(String(text || ''));
    const matches = normalized.match(/\b(19\d{2}|20\d{2})\b/g);
    if (!matches || matches.length === 0) return null;
    const year = Number(matches[0]);
    if (!Number.isFinite(year)) return null;
    return year;
  }

  private applyVehicleIdentityFilter(products: Product[], classification?: any): Product[] {
    if (!Array.isArray(products) || products.length === 0) return products;

    const isVehicle = classification?.category === 'car' || classification?.category === 'motorcycle';
    if (!isVehicle) return products;

    const brand = this.normalizeQuery(String(classification?.detected_brand || '')).trim();
    const model = this.normalizeQuery(String(classification?.detected_model || '')).trim();
    if (!brand && !model) return products;

    const withNormalizedTitle = products.map((product) => ({
      product,
      title: this.normalizeQuery(String(product.title || '')),
    }));

    const strictMatches = withNormalizedTitle
      .filter(({ title }) => {
        const brandOk = !brand || title.includes(brand);
        const modelOk = !model || title.includes(model);
        return brandOk && modelOk;
      })
      .map(({ product }) => product);

    if (strictMatches.length > 0) {
      this.logger.log(`🚗 [IDENTITY FILTER] strict match brand/model: ${products.length} → ${strictMatches.length}`);
      return strictMatches;
    }

    if (model) {
      const modelOnlyMatches = withNormalizedTitle
        .filter(({ title }) => title.includes(model))
        .map(({ product }) => product);
      if (modelOnlyMatches.length > 0) {
        this.logger.log(`🚗 [IDENTITY FILTER] model-only fallback: ${products.length} → ${modelOnlyMatches.length}`);
        return modelOnlyMatches;
      }
    }

    if (brand) {
      const brandOnlyMatches = withNormalizedTitle
        .filter(({ title }) => title.includes(brand))
        .map(({ product }) => product);
      if (brandOnlyMatches.length > 0) {
        this.logger.log(`🚗 [IDENTITY FILTER] brand-only fallback: ${products.length} → ${brandOnlyMatches.length}`);
        return brandOnlyMatches;
      }
    }

    this.logger.warn('🚗 [IDENTITY FILTER] no brand/model match found, returning 0 results to avoid unrelated vehicles');
    return [];
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
