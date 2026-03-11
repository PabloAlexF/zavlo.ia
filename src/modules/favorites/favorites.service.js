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
let FavoritesService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var FavoritesService = _classThis = class {
        constructor(firebaseService, priceAlertsService) {
            this.firebaseService = firebaseService;
            this.priceAlertsService = priceAlertsService;
            this.logger = new Logger(FavoritesService.name);
        }
        async addFavorite(userId, productData) {
            this.logger.log(`Adicionando favorito para usuário: ${userId}`);
            this.logger.debug(`Dados recebidos: id=${productData.id}, title=${productData.title}, price=${productData.price}`);
            const favorite = {
                userId,
                productId: productData.id,
                productTitle: productData.title,
                productPrice: productData.price,
                productImage: productData.image,
                productUrl: productData.url,
                source: productData.source,
                priceAlertEnabled: true, // Ativar alerta por padrão
                createdAt: new Date(),
            };
            try {
                const docRef = await this.firebaseService.getFirestore()
                    .collection('favorites')
                    .add(favorite);
                this.logger.log(`Favorito salvo com ID: ${docRef.id}`);
                // Criar alerta de preço automaticamente
                try {
                    await this.priceAlertsService.createAlert(userId, {
                        id: productData.id,
                        title: productData.title,
                        url: productData.url,
                        price: productData.price,
                        searchQuery: productData.title, // Usar título como termo de busca
                    });
                    this.logger.log(`✅ Alerta de preço criado automaticamente para: ${productData.title}`);
                }
                catch (alertError) {
                    this.logger.warn(`⚠️ Não foi possível criar alerta de preço: ${alertError.message}`);
                    // Não falhar a operação se o alerta não puder ser criado
                }
                return Object.assign({ id: docRef.id }, favorite);
            }
            catch (error) {
                this.logger.error(`Erro ao salvar favorito: ${error.message}`);
                throw error;
            }
        }
        async removeFavorite(userId, favoriteId) {
            await this.firebaseService.getFirestore()
                .collection('favorites')
                .doc(favoriteId)
                .delete();
        }
        async getUserFavorites(userId) {
            const snapshot = await this.firebaseService.getFirestore()
                .collection('favorites')
                .where('userId', '==', userId)
                .get();
            const favorites = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            // Sort in memory instead of Firestore query
            return favorites.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        async isFavorite(userId, productId) {
            const snapshot = await this.firebaseService.getFirestore()
                .collection('favorites')
                .where('userId', '==', userId)
                .where('productId', '==', productId)
                .get();
            return !snapshot.empty;
        }
    };
    __setFunctionName(_classThis, "FavoritesService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        FavoritesService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return FavoritesService = _classThis;
})();
export { FavoritesService };
