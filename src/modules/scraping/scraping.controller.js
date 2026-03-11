var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Controller, Post, Logger } from '@nestjs/common';
let ScrapingController = (() => {
    let _classDecorators = [Controller('scraping')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _searchGoogleShopping_decorators;
    let _identifyProduct_decorators;
    let _searchByImage_decorators;
    var ScrapingController = _classThis = class {
        constructor(googleShoppingService, googleLensService) {
            this.googleShoppingService = (__runInitializers(this, _instanceExtraInitializers), googleShoppingService);
            this.googleLensService = googleLensService;
            this.logger = new Logger(ScrapingController.name);
        }
        async searchGoogleShopping(body) {
            this.logger.log(`📥 [CONTROLLER] Recebido: query="${body.query}", limit=${body.limit}`);
            const results = await this.googleShoppingService.search(body.query, body.limit || 20);
            this.logger.log(`📤 [CONTROLLER] Retornando ${results.length} produtos`);
            // Se não encontrou produtos, retornar erro
            if (!results || results.length === 0) {
                this.logger.warn(`❌ Nenhum produto encontrado para: ${body.query}`);
                return {
                    error: 'NO_RESULTS',
                    message: 'Nenhum produto encontrado. Tente outra busca.',
                    results: [],
                };
            }
            return {
                results,
            };
        }
        async identifyProduct(body) {
            var _a;
            this.logger.log('📸 Recebendo requisição de identificação de produto');
            this.logger.log(`📄 Tamanho da imagem base64: ${((_a = body.imageUrl) === null || _a === void 0 ? void 0 : _a.length) || 0} caracteres`);
            const result = await this.googleLensService.identifyProduct(body.imageUrl);
            this.logger.log(`✅ Produto identificado: ${result.productName}`);
            return {
                warning: 'Identificação consumiu 1 crédito. A busca consumirá +1 crédito (total: 2 créditos)',
                creditsUsed: 1,
                creditsForSearch: 1,
                totalCredits: 2,
                productName: result.productName,
                confidence: result.confidence,
            };
        }
        async searchByImage(body) {
            let productName = body.productName;
            // Se não tem o nome, identifica pela imagem
            if (!productName && body.imageUrl) {
                const result = await this.googleLensService.identifyProduct(body.imageUrl);
                productName = result.productName;
            }
            // SEMPRE busca no Google Shopping (ordenado por menor preço)
            const results = await this.googleShoppingService.search(productName, body.limit || 20);
            return {
                warning: 'Busca concluída. Total de créditos consumidos: 2 (1 identificação + 1 busca)',
                creditsUsed: 2,
                identifiedProduct: productName,
                results,
            };
        }
    };
    __setFunctionName(_classThis, "ScrapingController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _searchGoogleShopping_decorators = [Post('google-shopping')];
        _identifyProduct_decorators = [Post('identify-product')];
        _searchByImage_decorators = [Post('search-by-image')];
        __esDecorate(_classThis, null, _searchGoogleShopping_decorators, { kind: "method", name: "searchGoogleShopping", static: false, private: false, access: { has: obj => "searchGoogleShopping" in obj, get: obj => obj.searchGoogleShopping }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _identifyProduct_decorators, { kind: "method", name: "identifyProduct", static: false, private: false, access: { has: obj => "identifyProduct" in obj, get: obj => obj.identifyProduct }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _searchByImage_decorators, { kind: "method", name: "searchByImage", static: false, private: false, access: { has: obj => "searchByImage" in obj, get: obj => obj.searchByImage }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ScrapingController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ScrapingController = _classThis;
})();
export { ScrapingController };
