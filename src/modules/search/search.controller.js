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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { Controller, Get, Post, ForbiddenException, UseGuards, BadRequestException, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
let SearchController = (() => {
    let _classDecorators = [Controller('search')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _searchByText_decorators;
    let _searchReal_decorators;
    let _searchByImage_decorators;
    let _uploadImage_decorators;
    let _searchProductPrices_decorators;
    let _debugCredits_decorators;
    let _debugUseCredit_decorators;
    let _getSuggestions_decorators;
    var SearchController = _classThis = class {
        constructor(searchService, ipLimitService) {
            this.searchService = (__runInitializers(this, _instanceExtraInitializers), searchService);
            this.ipLimitService = ipLimitService;
        }
        /**
         * Extrai o IP real do request (considera proxies)
         */
        getClientIp(req) {
            const forwarded = req.headers['x-forwarded-for'];
            if (forwarded) {
                return forwarded.split(',')[0].trim();
            }
            return req.ip || req.connection.remoteAddress || 'unknown';
        }
        async searchByText(searchDto, sortBy, minPrice, maxPrice, req, user) {
            const { query, useRealScraping, limit } = searchDto, filters = __rest(searchDto, ["query", "useRealScraping", "limit"]);
            const clientIp = this.getClientIp(req);
            console.log(`🔍 [CONTROLLER DEBUG] Search request:`);
            console.log(`   - query: ${query}`);
            console.log(`   - sortBy: ${sortBy}`);
            console.log(`   - minPrice: ${minPrice}`);
            console.log(`   - maxPrice: ${maxPrice}`);
            console.log(`   - user: ${user ? `${user.id} (${user.plan})` : 'anonymous'}`);
            console.log(`   - clientIp: ${clientIp}`);
            console.log(`   - filters:`, filters);
            // Adiciona sortBy e filtros de preço
            const searchFilters = Object.assign(Object.assign({}, filters), { sortBy: sortBy || 'RELEVANCE', minPrice: minPrice ? Number(minPrice) : undefined, maxPrice: maxPrice ? Number(maxPrice) : undefined });
            // ============================================
            // REGRA: 1 BUSCA DE TEXTO GRATUITA POR IP
            // ============================================
            const hasUsed = await this.ipLimitService.hasUsedFreeSearch(clientIp);
            console.log(`🔍 [CONTROLLER DEBUG] IP ${clientIp} hasUsed free search: ${hasUsed}`);
            if (!hasUsed) {
                // IP ainda não usou = busca gratuita
                console.log(`✅ [CONTROLLER DEBUG] Using free search for IP ${clientIp}`);
                await this.ipLimitService.markFreeSearchUsed(clientIp);
                return this.searchService.searchByText(query, Object.assign(Object.assign({}, searchFilters), { useRealScraping: true, freeMode: true, limit: limit || 10 }), user === null || user === void 0 ? void 0 : user.id);
            }
            // IP já usou a busca gratuita
            if (!user) {
                console.log(`❌ [CONTROLLER DEBUG] IP ${clientIp} already used free search and no user logged in`);
                throw new ForbiddenException({
                    error: 'FREE_LIMIT_EXCEEDED',
                    message: 'Você já fez sua busca gratuita. Faça login ou assine um plano para continuar.',
                    action: 'login_or_upgrade',
                });
            }
            console.log(`🔍 [CONTROLLER DEBUG] User ${user.id} with plan ${user.plan} proceeding with search`);
            // Usuário logado - usa créditos/plano
            if (user.plan === 'free') {
                console.log(`🔍 [CONTROLLER DEBUG] Free plan user - using freeMode`);
                return this.searchService.searchByText(query, Object.assign(Object.assign({}, searchFilters), { useRealScraping: true, freeMode: true, limit: limit || 10 }), user.id);
            }
            console.log(`🔍 [CONTROLLER DEBUG] Paid plan user - using full search`);
            return this.searchService.searchByText(query, Object.assign(Object.assign({}, searchFilters), { useRealScraping: useRealScraping === 'true', limit: limit || 50 }), user.id);
        }
        async searchReal(query, user) {
            // Scraping real só para planos pagos
            if (user.plan === 'free') {
                throw new ForbiddenException({
                    error: 'FEATURE_NOT_AVAILABLE',
                    message: 'Scraping em tempo real disponível apenas para planos pagos.',
                    action: 'upgrade_plan',
                });
            }
            return this.searchService.searchByText(query, { useRealScraping: true }, user.id);
        }
        async searchByImage(body, user) {
            // Busca por imagem NÃO disponível no plano free
            if (user.plan === 'free') {
                throw new ForbiddenException({
                    error: 'FEATURE_NOT_AVAILABLE',
                    message: 'Busca por imagem disponível apenas para planos pagos.',
                    action: 'upgrade_plan',
                });
            }
            // Usar imageData se fornecido (enviado diretamente), ou imageUrl como fallback
            const imageUrl = body.imageData || body.imageUrl;
            if (!imageUrl) {
                throw new BadRequestException({
                    error: 'MISSING_IMAGE',
                    message: 'Forneça uma imagem (imageUrl ou imageData)',
                });
            }
            return this.searchService.searchByImage(imageUrl, user.id);
        }
        async uploadImage(file, user) {
            if (!file) {
                throw new BadRequestException('Nenhum arquivo enviado');
            }
            // Upload para Cloudinary via backend
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('file', file.buffer, file.originalname);
            formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET || 'zavlo_preset');
            const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME || 'dj2nkf9od'}/image/upload`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new BadRequestException('Erro ao fazer upload da imagem');
            }
            const data = await response.json();
            const imageUrl = data.secure_url.replace(/\/v\d+\//, '/');
            return { imageUrl };
        }
        async searchProductPrices(body, user) {
            // Busca de preços NÃO disponível no plano free
            if (user.plan === 'free') {
                throw new ForbiddenException({
                    error: 'FEATURE_NOT_AVAILABLE',
                    message: 'Busca de preços disponível apenas para planos pagos.',
                    action: 'upgrade_plan',
                });
            }
            if (!body.productName) {
                throw new BadRequestException({
                    error: 'MISSING_PRODUCT_NAME',
                    message: 'Nome do produto é obrigatório',
                });
            }
            return this.searchService.searchProductPrices(body.productName, user.id);
        }
        async debugCredits(user) {
            console.log(`🔍 [DEBUG] Checking credits for user ${user.id}`);
            const userDetails = await this.searchService.getUserDetails(user.id);
            console.log(`🔍 [DEBUG] User details:`, userDetails);
            return {
                userId: user.id,
                userDetails,
                timestamp: new Date().toISOString()
            };
        }
        async debugUseCredit(user) {
            console.log(`🔍 [DEBUG] Manually using 1 credit for user ${user.id}`);
            try {
                const result = await this.searchService.debugUseCredit(user.id);
                console.log(`✅ [DEBUG] Credit used successfully:`, result);
                return result;
            }
            catch (error) {
                console.error(`❌ [DEBUG] Error using credit:`, error);
                throw error;
            }
        }
        async getSuggestions(query) {
            return this.searchService.getSuggestions(query);
        }
    };
    __setFunctionName(_classThis, "SearchController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _searchByText_decorators = [Get('text'), UseGuards(OptionalJwtAuthGuard)];
        _searchReal_decorators = [Get('real'), UseGuards(JwtAuthGuard)];
        _searchByImage_decorators = [Post('image'), UseGuards(JwtAuthGuard)];
        _uploadImage_decorators = [Post('upload-image'), UseGuards(JwtAuthGuard), UseInterceptors(FileInterceptor('file'))];
        _searchProductPrices_decorators = [Post('prices'), UseGuards(JwtAuthGuard)];
        _debugCredits_decorators = [Get('debug/credits'), UseGuards(JwtAuthGuard)];
        _debugUseCredit_decorators = [Post('debug/use-credit'), UseGuards(JwtAuthGuard)];
        _getSuggestions_decorators = [Get('suggestions')];
        __esDecorate(_classThis, null, _searchByText_decorators, { kind: "method", name: "searchByText", static: false, private: false, access: { has: obj => "searchByText" in obj, get: obj => obj.searchByText }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _searchReal_decorators, { kind: "method", name: "searchReal", static: false, private: false, access: { has: obj => "searchReal" in obj, get: obj => obj.searchReal }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _searchByImage_decorators, { kind: "method", name: "searchByImage", static: false, private: false, access: { has: obj => "searchByImage" in obj, get: obj => obj.searchByImage }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _uploadImage_decorators, { kind: "method", name: "uploadImage", static: false, private: false, access: { has: obj => "uploadImage" in obj, get: obj => obj.uploadImage }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _searchProductPrices_decorators, { kind: "method", name: "searchProductPrices", static: false, private: false, access: { has: obj => "searchProductPrices" in obj, get: obj => obj.searchProductPrices }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _debugCredits_decorators, { kind: "method", name: "debugCredits", static: false, private: false, access: { has: obj => "debugCredits" in obj, get: obj => obj.debugCredits }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _debugUseCredit_decorators, { kind: "method", name: "debugUseCredit", static: false, private: false, access: { has: obj => "debugUseCredit" in obj, get: obj => obj.debugUseCredit }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSuggestions_decorators, { kind: "method", name: "getSuggestions", static: false, private: false, access: { has: obj => "getSuggestions" in obj, get: obj => obj.getSuggestions }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SearchController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SearchController = _classThis;
})();
export { SearchController };
