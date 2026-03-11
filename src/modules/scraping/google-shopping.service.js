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
import { Injectable, Logger } from '@nestjs/common';
let GoogleShoppingService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var GoogleShoppingService = _classThis = class {
        constructor(configService) {
            this.configService = configService;
            this.logger = new Logger(GoogleShoppingService.name);
            this.actorId = 'burbn~google-shopping-scraper';
            this.apiToken = this.configService.get('APIFY_API_KEY');
        }
        async search(query, limit = 50, sortBy = 'RELEVANCE') {
            var _a;
            try {
                this.logger.log(`Buscando no Google Shopping: ${query} (sortBy: ${sortBy})`);
                // Aumentar limite para 100 (máximo do Apify)
                const maxLimit = Math.min(limit, 100);
                const input = {
                    country: 'BR',
                    language: 'pt-BR',
                    limit: maxLimit,
                    searchQuery: query,
                    sortBy: sortBy,
                };
                this.logger.log(`Input Apify: ${JSON.stringify(input)}`);
                const response = await fetch(`https://api.apify.com/v2/acts/${this.actorId}/run-sync-get-dataset-items?token=${this.apiToken}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(input),
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    this.logger.error(`Apify API error ${response.status}: ${errorText}`);
                    throw new Error(`Apify API error: ${response.status}`);
                }
                const results = await response.json();
                if (!Array.isArray(results) || results.length === 0) {
                    this.logger.warn(`Nenhum resultado encontrado para: ${query}`);
                    return [];
                }
                this.logger.log(`Resultados recebidos: ${results.length}`);
                this.logger.log(`Primeiro resultado: ${JSON.stringify(((_a = results[0]) === null || _a === void 0 ? void 0 : _a.productTitle) || 'N/A')}`);
                if (results.length > 0) {
                    this.logger.log('Primeiros 3 titulos:');
                    results.slice(0, 3).forEach((item, i) => {
                        this.logger.log(`  ${i + 1}. ${item.productTitle}`);
                    });
                }
                // Filtro mais flexível - aceita se tiver pelo menos 1 palavra-chave importante
                const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
                const importantWords = queryWords.filter(w => w.length > 3); // Palavras com mais de 3 letras
                const filtered = results.filter((item) => {
                    const title = (item.productTitle || '').toLowerCase();
                    // Aceita se tiver pelo menos 1 palavra importante OU 2 palavras quaisquer
                    const hasImportantWord = importantWords.some(word => title.includes(word));
                    const matchCount = queryWords.filter(word => title.includes(word)).length;
                    return hasImportantWord || matchCount >= 2;
                });
                this.logger.log(`Resultados filtrados: ${filtered.length}`);
                if (filtered.length > 0) {
                    this.logger.log('Primeiros 3 filtrados:');
                    filtered.slice(0, 3).forEach((item, i) => {
                        this.logger.log(`  ${i + 1}. ${item.productTitle}`);
                    });
                }
                // Mapear para formato Zavlo.ia
                return filtered.map((item, index) => {
                    var _a;
                    return ({
                        id: item.offerId || item.productId || `product-${index}`,
                        title: item.productTitle,
                        price: this.parsePrice(item.price),
                        image: ((_a = item.productPhotos) === null || _a === void 0 ? void 0 : _a[0]) || '',
                        images: item.productPhotos || [],
                        source: item.storeName || 'Google Shopping',
                        url: item.offerPageUrl,
                        sourceUrl: item.offerPageUrl,
                        rating: item.productRating,
                        reviews: item.productNumReviews,
                        condition: this.detectCondition(item),
                        category: 'geral',
                        scrapedAt: new Date().toISOString(),
                    });
                });
            }
            catch (error) {
                this.logger.error(`Erro no Google Shopping: ${error.message}`);
                return [];
            }
        }
        detectCondition(item) {
            const title = (item.productTitle || '').toLowerCase();
            const condition = (item.productCondition || '').toLowerCase();
            const source = (item.storeName || '').toLowerCase();
            // Se tem campo productCondition
            if (condition.includes('used') || condition === 'usado')
                return 'used';
            if (condition.includes('new') || condition === 'novo')
                return 'new';
            // Se é da OLX, provavelmente é usado
            if (source.includes('olx'))
                return 'used';
            // Se o título menciona usado
            if (title.includes('usado') || title.includes('seminovo') || title.includes('refurbished')) {
                return 'used';
            }
            // Padrão: novo
            return 'new';
        }
        parsePrice(priceStr) {
            if (!priceStr)
                return 0;
            // Remove R$, pontos e converte vírgula para ponto
            const cleaned = priceStr.replace(/[R$\s.]/g, '').replace(',', '.');
            return parseFloat(cleaned) || 0;
        }
    };
    __setFunctionName(_classThis, "GoogleShoppingService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        GoogleShoppingService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return GoogleShoppingService = _classThis;
})();
export { GoogleShoppingService };
