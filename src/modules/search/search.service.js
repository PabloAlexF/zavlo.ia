var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
let SearchService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SearchService = _classThis = class {
        constructor(firebaseService, redisService, googleShoppingService, googleLensService, usersService, analyticsService) {
            this.firebaseService = firebaseService;
            this.redisService = redisService;
            this.googleShoppingService = googleShoppingService;
            this.googleLensService = googleLensService;
            this.usersService = usersService;
            this.analyticsService = analyticsService;
            this.logger = new Logger(SearchService.name);
        }
        /* ============================================
           FUNÇÃO PRINCIPAL
        ============================================ */
        async searchByText(query, filters, userId) {
            var _a, _b, _c;
            const startTime = Date.now();
            let creditsUsed = 0;
            let remainingCredits;
            // Extrair sortBy dos filtros (padrão: RELEVANCE)
            const sortBy = (filters === null || filters === void 0 ? void 0 : filters.sortBy) || 'RELEVANCE';
            this.logger.log(`🔍 [SEARCH DEBUG] Starting searchByText:`);
            this.logger.log(`   - query: ${query}`);
            this.logger.log(`   - userId: ${userId}`);
            this.logger.log(`   - sortBy: ${sortBy}`);
            this.logger.log(`   - filters: ${JSON.stringify(filters)}`);
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
                    remainingCredits = (user === null || user === void 0 ? void 0 : user.credits) || 0;
                    this.logger.log(`💳 [SEARCH DEBUG] Updated user credits: ${remainingCredits}`);
                }
                catch (creditError) {
                    this.logger.error(`❌ [SEARCH DEBUG] Credit deduction failed: ${creditError.message}`);
                    if (((_a = creditError.response) === null || _a === void 0 ? void 0 : _a.error) === 'INSUFFICIENT_CREDITS') {
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
            }
            else {
                this.logger.log(`🔍 [SEARCH DEBUG] No user ID provided, proceeding without credit deduction`);
            }
            const normalizedQuery = this.normalizeQuery(query);
            this.logger.log(`🔍 [SEARCH DEBUG] Query original: ${query}`);
            this.logger.log(`🔍 [SEARCH DEBUG] Query normalizada: ${normalizedQuery}`);
            // Buscar localização do usuário
            let userLocation;
            if (userId) {
                try {
                    const user = await this.usersService.findById(userId);
                    if (((_b = user === null || user === void 0 ? void 0 : user.location) === null || _b === void 0 ? void 0 : _b.city) && ((_c = user === null || user === void 0 ? void 0 : user.location) === null || _c === void 0 ? void 0 : _c.state)) {
                        userLocation = {
                            city: user.location.city,
                            state: user.location.state,
                        };
                        this.logger.log(`🔍 [SEARCH DEBUG] Localização do usuário: ${userLocation.city}, ${userLocation.state}`);
                    }
                }
                catch (error) {
                    this.logger.warn(`⚠️ [SEARCH DEBUG] Erro ao buscar localização: ${error.message}`);
                }
            }
            const cacheKey = `search:${normalizedQuery}:${JSON.stringify(filters)}:${(userLocation === null || userLocation === void 0 ? void 0 : userLocation.city) || 'all'}`;
            // CACHE
            const cached = await this.redisService.get(cacheKey);
            if (cached) {
                this.logger.log(`[CACHE] Hit`);
                const cachedResult = JSON.parse(cached);
                // Aplicar filtros de preço se especificados
                let filteredResults = cachedResult.results;
                if ((filters === null || filters === void 0 ? void 0 : filters.minPrice) || (filters === null || filters === void 0 ? void 0 : filters.maxPrice)) {
                    filteredResults = this.applyPriceFilter(cachedResult.results, filters.minPrice, filters.maxPrice);
                }
                return Object.assign(Object.assign({}, cachedResult), { results: filteredResults, total: filteredResults.length, creditsUsed,
                    remainingCredits });
            }
            // Se freeMode (plano free/usuário não logado), busca limitada a 3 lojas
            if (filters === null || filters === void 0 ? void 0 : filters.freeMode) {
                this.logger.log(`🆓 [SEARCH DEBUG] Busca gratuita - 10 resultados (freeMode=${filters.freeMode})`);
                try {
                    const results = await this.googleShoppingService.search(normalizedQuery, 20, sortBy);
                    const limitedProducts = results.slice(0, 10); // Limitar a 10 no frontend
                    const result = {
                        results: limitedProducts,
                        total: limitedProducts.length,
                        creditsUsed,
                        remainingCredits
                    };
                    this.logger.log(`🆓 [SEARCH DEBUG] Free search completed with ${limitedProducts.length} results`);
                    await this.redisService.set(cacheKey, JSON.stringify(result), 3600);
                    return result;
                }
                catch (error) {
                    this.logger.warn(`⚠️ [SEARCH DEBUG] Erro na busca gratuita: ${error.message}`);
                }
                const fallback = await this.searchInFirebase(normalizedQuery, filters);
                this.logger.log(`🆓 [SEARCH DEBUG] Using Firebase fallback with ${fallback.results.length} results`);
                return Object.assign(Object.assign({}, fallback), { creditsUsed,
                    remainingCredits });
            }
            // GOOGLE SHOPPING SEARCH (planos pagos)
            let products = [];
            try {
                this.logger.log(`[GOOGLE SHOPPING] Buscando produtos com sortBy=${sortBy}...`);
                products = await this.googleShoppingService.search(normalizedQuery, 50, sortBy);
                this.logger.log(`[GOOGLE SHOPPING] ${products.length} produtos encontrados`);
            }
            catch (error) {
                this.logger.warn(`[GOOGLE SHOPPING] Erro: ${error.message}`);
            }
            // FALLBACK se vazio
            if (products.length === 0) {
                this.logger.warn(`[FALLBACK] Firebase search`);
                const fallback = await this.searchInFirebase(normalizedQuery, filters);
                await this.redisService.set(cacheKey, JSON.stringify(fallback), 1800);
                return Object.assign(Object.assign({}, fallback), { creditsUsed,
                    remainingCredits });
            }
            const result = {
                results: products,
                total: products.length,
                creditsUsed,
                remainingCredits
            };
            // Aplicar filtros de preço se especificados
            if ((filters === null || filters === void 0 ? void 0 : filters.minPrice) || (filters === null || filters === void 0 ? void 0 : filters.maxPrice)) {
                result.results = this.applyPriceFilter(products, filters.minPrice, filters.maxPrice);
                result.total = result.results.length;
            }
            // Cache results for 1 hour
            await this.redisService.set(cacheKey, JSON.stringify(result), 3600);
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
        async searchInFirebase(query, filters) {
            const firestore = this.firebaseService.getFirestore();
            const snapshot = await firestore
                .collection('products')
                .limit(100)
                .get();
            const queryWords = query.split(' ');
            const products = snapshot.docs
                .map(doc => (Object.assign({ id: doc.id }, doc.data())));
            const filtered = products.filter(product => {
                const title = this.normalizeQuery(product.title || '');
                return queryWords.some(word => title.includes(word));
            });
            return {
                results: filtered.slice(0, 50),
                total: filtered.length,
            };
        }
        /* ============================================
           SUGESTÕES MELHORADAS
        ============================================ */
        async getSuggestions(query) {
            const normalized = this.normalizeQuery(query);
            const cacheKey = `suggest:${normalized}`;
            const cached = await this.redisService.get(cacheKey);
            if (cached)
                return JSON.parse(cached);
            const firestore = this.firebaseService.getFirestore();
            const snapshot = await firestore
                .collection('products')
                .limit(50)
                .get();
            const suggestions = snapshot.docs
                .map(d => d.data().title)
                .filter(title => this.normalizeQuery(title).includes(normalized))
                .slice(0, 5);
            await this.redisService.set(cacheKey, JSON.stringify(suggestions), 1800);
            return suggestions;
        }
        /* ============================================
           BUSCA POR IMAGEM
        ============================================ */
        async searchByImage(imageUrl, userId) {
            var _a;
            const startTime = Date.now();
            let creditsUsed = 0;
            let remainingCredits;
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
                    remainingCredits = (user === null || user === void 0 ? void 0 : user.credits) || 0;
                    this.logger.log(`[CREDITS] Deducted 1 credit for image identification. Remaining: ${remainingCredits}`);
                }
                catch (creditError) {
                    if (((_a = creditError.response) === null || _a === void 0 ? void 0 : _a.error) === 'INSUFFICIENT_CREDITS') {
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
                    type: 'image',
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
        async searchProductPrices(productName, userId) {
            var _a;
            const startTime = Date.now();
            let creditsUsed = 0;
            let remainingCredits;
            if (userId) {
                // Deduct 1 credit for price search
                try {
                    await this.usersService.useCredit(userId, 1);
                    creditsUsed = 1;
                    const user = await this.usersService.findById(userId);
                    remainingCredits = (user === null || user === void 0 ? void 0 : user.credits) || 0;
                    this.logger.log(`[CREDITS] Deducted 1 credit for price search. Remaining: ${remainingCredits}`);
                }
                catch (creditError) {
                    if (((_a = creditError.response) === null || _a === void 0 ? void 0 : _a.error) === 'INSUFFICIENT_CREDITS') {
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
                    type: 'image',
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
        async getProductById(id) {
            const firestore = this.firebaseService.getFirestore();
            const doc = await firestore.collection('products').doc(id).get();
            if (!doc.exists) {
                return null;
            }
            return Object.assign({ id: doc.id }, doc.data());
        }
        /* ============================================
           FILTRO DE PREÇO
        ============================================ */
        applyPriceFilter(products, minPrice, maxPrice) {
            if (!minPrice && !maxPrice)
                return products;
            return products.filter(product => {
                const price = this.extractPrice(String(product.price));
                if (!price)
                    return true; // Manter produtos sem preço
                if (minPrice && price < minPrice)
                    return false;
                if (maxPrice && price > maxPrice)
                    return false;
                return true;
            });
        }
        extractPrice(priceStr) {
            if (!priceStr)
                return null;
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
        async getUserDetails(userId) {
            return await this.usersService.findById(userId);
        }
        async debugUseCredit(userId) {
            this.logger.log(`🔍 [DEBUG] Starting manual credit deduction for user ${userId}`);
            const userBefore = await this.usersService.findById(userId);
            this.logger.log(`🔍 [DEBUG] User before:`, {
                credits: userBefore === null || userBefore === void 0 ? void 0 : userBefore.credits,
                plan: userBefore === null || userBefore === void 0 ? void 0 : userBefore.plan
            });
            await this.usersService.useCredit(userId, 1);
            const userAfter = await this.usersService.findById(userId);
            this.logger.log(`🔍 [DEBUG] User after:`, {
                credits: userAfter === null || userAfter === void 0 ? void 0 : userAfter.credits,
                plan: userAfter === null || userAfter === void 0 ? void 0 : userAfter.plan
            });
            return {
                before: {
                    credits: userBefore === null || userBefore === void 0 ? void 0 : userBefore.credits,
                    plan: userBefore === null || userBefore === void 0 ? void 0 : userBefore.plan
                },
                after: {
                    credits: userAfter === null || userAfter === void 0 ? void 0 : userAfter.credits,
                    plan: userAfter === null || userAfter === void 0 ? void 0 : userAfter.plan
                },
                deducted: ((userBefore === null || userBefore === void 0 ? void 0 : userBefore.credits) || 0) - ((userAfter === null || userAfter === void 0 ? void 0 : userAfter.credits) || 0)
            };
        }
        /* ============================================
           UTILIDADES
        ============================================ */
        normalizeQuery(query) {
            return query
                .toLowerCase()
                .trim()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^\w\s]/g, '')
                .replace(/\s+/g, ' ');
        }
        generateStableId(url) {
            return crypto
                .createHash('md5')
                .update(url)
                .digest('hex');
        }
    };
    __setFunctionName(_classThis, "SearchService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SearchService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SearchService = _classThis;
})();
export { SearchService };
