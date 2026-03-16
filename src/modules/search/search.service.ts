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

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

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
    try {
      this.logger.log(`🤖 [CLASSIFICATION] Classificando query: "${query}"`);
      classification = await this.classificationService.classifyQuery(query);
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
      
      this.logger.log(`✅ [SEARCH DEBUG] Usage limit OK, attempting to deduct credits...`);
      
      // Deduct credits for the search
      try {
        await this.usersService.useCredit(userId, 1);
        creditsUsed = 1;
        
        this.logger.log(`✅ [SEARCH DEBUG] Credits deducted successfully, fetching updated user...`);
        
        const user = await this.usersService.findById(userId);
        remainingCredits = user?.credits || 0;
        
        this.logger.log(`💳 [SEARCH DEBUG] Updated user credits: ${remainingCredits}`);
        
      } catch (creditError: any) {
        this.logger.error(`❌ [SEARCH DEBUG] Credit deduction failed: ${creditError.message}`);
        
        if (creditError.response?.error === 'INSUFFICIENT_CREDITS') {
          throw new BadRequestException({
            error: 'INSUFFICIENT_CREDITS',
            message: 'You do not have enough credits to perform this search',
            currentCredits: creditError.response.currentCredits || 0,
            requiredCredits: 1,
            action: 'buy_credits'
          });
        }
        // If credit deduction fails, continue with search (for backwards compatibility)
        this.logger.warn(`⚠️ [SEARCH DEBUG] Continuing search despite credit error`);
      }
      
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

    const cacheKey = `search:${normalizedQuery}:${JSON.stringify(filters)}:${userLocation?.city || 'all'}`;

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
      const requestedLimit = filters?.limit || 10;
      const maxLimit = Math.min(requestedLimit, 20); // Máximo 20 para free
      
      this.logger.log(`🆓 [SEARCH DEBUG] Busca gratuita - ${maxLimit} resultados (freeMode=${filters.freeMode})`);
      
      try {
        const results = await this.googleShoppingService.search(normalizedQuery, maxLimit, sortBy);
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
    const requestedLimit = filters?.limit || 50;
    const maxLimit = Math.min(requestedLimit, 100); // Máximo 100 conforme API

    // 🚀 EXECUTAR SCRAPERS BASEADO NA CLASSIFICAÇÃO
    const scrapers = classification.recommended_scrapers;
    const resultLimit = classification.result_limit || 20; // Padrão 20 se não especificado
    this.logger.log(`🎯 [SCRAPERS] Executando: ${scrapers.join(', ')} com limite de ${resultLimit} resultados`);

    try {
      // Executar scrapers em paralelo
      const scrapingPromises = [];

      if (scrapers.includes('google_shopping')) {
        this.logger.log(`[GOOGLE SHOPPING] Buscando ${resultLimit} produtos com sortBy=${sortBy}...`);
        scrapingPromises.push(
          this.googleShoppingService.search(normalizedQuery, resultLimit, sortBy)
            .then(results => ({ source: 'google_shopping', results }))
            .catch(error => {
              this.logger.warn(`[GOOGLE SHOPPING] Erro: ${error.message}`);
              return { source: 'google_shopping', results: [] };
            })
        );
      }

      if (scrapers.includes('olx')) {
        this.logger.log(`[OLX] Buscando ${resultLimit} produtos...`);
        scrapingPromises.push(
          this.olxService.search(normalizedQuery, resultLimit)
            .then(results => ({ source: 'olx', results }))
            .catch(error => {
              this.logger.warn(`[OLX] Erro: ${error.message}`);
              return { source: 'olx', results: [] };
            })
        );
      }

      if (scrapers.includes('webmotors')) {
        this.logger.log(`[WEBMOTORS] Buscando ${resultLimit} veículos...`);
        scrapingPromises.push(
          this.webmotorsService.search(normalizedQuery, resultLimit)
            .then(results => ({ source: 'webmotors', results }))
            .catch(error => {
              this.logger.warn(`[WEBMOTORS] Erro: ${error.message}`);
              return { source: 'webmotors', results: [] };
            })
        );
      }

      if (scrapers.includes('mobiauto')) {
        this.logger.log(`[MOBIAUTO] Buscando ${resultLimit} veículos...`);
        scrapingPromises.push(
          this.mobiautoService.search(normalizedQuery, resultLimit)
            .then(results => ({ source: 'mobiauto', results }))
            .catch(error => {
              this.logger.warn(`[MOBIAUTO] Erro: ${error.message}`);
              return { source: 'mobiauto', results: [] };
            })
        );
      }

      // Aguardar todos os scrapers
      const scrapingResults = await Promise.all(scrapingPromises);

      // Consolidar resultados
      for (const { source, results } of scrapingResults) {
        this.logger.log(`✅ [${source.toUpperCase()}] ${results.length} produtos encontrados`);
        products.push(...results);
      }

      this.logger.log(`📊 [TOTAL] ${products.length} produtos consolidados de ${scrapers.length} fonte(s)`);
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
        creditsUsed,
        remainingCredits
      };
    }

    const result = {
      results: products,
      total: products.length,
      creditsUsed,
      remainingCredits
    };

    // Aplicar filtros de preço se especificados
    if (filters?.minPrice || filters?.maxPrice) {
      result.results = this.applyPriceFilter(products, filters.minPrice, filters.maxPrice);
      result.total = result.results.length;
    }

    // Cache results for 1 hour
    await this.redisService.set(
      cacheKey,
      JSON.stringify(result),
      3600,
    );

    // Log search analytics
    if (userId) {
      const responseTime = Date.now() - startTime;
      await this.analyticsService.logSearch({
        userId,
        query,
        type: 'text',
        sources: ['google_shopping'],
        responseTime,
        success: true,
        resultsCount: result.total,
        timestamp: new Date(),
        location: userLocation ? `${userLocation.city}, ${userLocation.state}` : undefined,
      });
    }

    return result;
  }

/* ============================================
     FIREBASE FALLBACK INTELIGENTE
  ============================================ */
  private async searchInFirebase(
    query: string,
    filters?: any,
  ): Promise<{ results: Product[]; total: number }> {

    const firestore = this.firebaseService.getFirestore();

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

}
