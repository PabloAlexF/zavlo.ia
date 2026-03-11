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
import { Controller, Post, Delete, Get, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
let FavoritesController = (() => {
    let _classDecorators = [Controller('favorites'), UseGuards(JwtAuthGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _addFavorite_decorators;
    let _removeFavorite_decorators;
    let _getUserFavorites_decorators;
    let _checkFavorite_decorators;
    var FavoritesController = _classThis = class {
        constructor(favoritesService) {
            this.favoritesService = (__runInitializers(this, _instanceExtraInitializers), favoritesService);
            this.logger = new Logger(FavoritesController.name);
        }
        async addFavorite(user, productData) {
            const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.id);
            this.logger.log(`Adicionando favorito para usuário: ${userId}`);
            this.logger.debug(`Dados do produto recebidos: ${JSON.stringify(productData)}`);
            if (!userId) {
                this.logger.error('Usuário não encontrado ou inválido');
                throw new Error('Usuário não autenticado');
            }
            if (!productData || !productData.id) {
                this.logger.error('Dados do produto inválidos');
                throw new Error('Dados do produto inválidos');
            }
            return this.favoritesService.addFavorite(userId, productData);
        }
        async removeFavorite(user, favoriteId) {
            const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.id);
            await this.favoritesService.removeFavorite(userId, favoriteId);
            return { success: true };
        }
        async getUserFavorites(user) {
            const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.id);
            this.logger.log(`Carregando favoritos para usuário: ${userId}`);
            if (!userId) {
                this.logger.error('Usuário não encontrado ou inválido');
                throw new Error('Usuário não autenticado');
            }
            return this.favoritesService.getUserFavorites(userId);
        }
        async checkFavorite(user, productId) {
            const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.id);
            const isFavorite = await this.favoritesService.isFavorite(userId, productId);
            return { isFavorite };
        }
    };
    __setFunctionName(_classThis, "FavoritesController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _addFavorite_decorators = [Post()];
        _removeFavorite_decorators = [Delete(':id')];
        _getUserFavorites_decorators = [Get()];
        _checkFavorite_decorators = [Get('check/:productId')];
        __esDecorate(_classThis, null, _addFavorite_decorators, { kind: "method", name: "addFavorite", static: false, private: false, access: { has: obj => "addFavorite" in obj, get: obj => obj.addFavorite }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _removeFavorite_decorators, { kind: "method", name: "removeFavorite", static: false, private: false, access: { has: obj => "removeFavorite" in obj, get: obj => obj.removeFavorite }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getUserFavorites_decorators, { kind: "method", name: "getUserFavorites", static: false, private: false, access: { has: obj => "getUserFavorites" in obj, get: obj => obj.getUserFavorites }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _checkFavorite_decorators, { kind: "method", name: "checkFavorite", static: false, private: false, access: { has: obj => "checkFavorite" in obj, get: obj => obj.checkFavorite }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        FavoritesController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return FavoritesController = _classThis;
})();
export { FavoritesController };
