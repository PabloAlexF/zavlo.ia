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
import { Injectable } from '@nestjs/common';
let ComparisonsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ComparisonsService = _classThis = class {
        constructor(firebaseService, redisService) {
            this.firebaseService = firebaseService;
            this.redisService = redisService;
        }
        async compareProduct(productTitle) {
            const cacheKey = `comparison:${productTitle}`;
            const cached = await this.redisService.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
            const firestore = this.firebaseService.getFirestore();
            const snapshot = await firestore
                .collection('products')
                .where('title', '>=', productTitle)
                .where('title', '<=', productTitle + '\uf8ff')
                .limit(50)
                .get();
            const products = snapshot.docs.map(doc => doc.data());
            if (products.length === 0) {
                return null;
            }
            const prices = products.map(p => p.price);
            const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            const sources = products.map(p => ({
                source: p.source,
                price: p.price,
                url: p.sourceUrl,
            }));
            const comparison = {
                productTitle,
                averagePrice: Math.round(averagePrice * 100) / 100,
                minPrice,
                maxPrice,
                priceHistory: [],
                sources,
            };
            await this.redisService.set(cacheKey, JSON.stringify(comparison), 3600);
            return comparison;
        }
        async trackPriceHistory(productId, price, source) {
            const firestore = this.firebaseService.getFirestore();
            await firestore.collection('price_history').add({
                productId,
                price,
                source,
                timestamp: new Date(),
            });
        }
        async getPriceHistory(productId, days = 30) {
            const firestore = this.firebaseService.getFirestore();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const snapshot = await firestore
                .collection('price_history')
                .where('productId', '==', productId)
                .where('timestamp', '>=', startDate)
                .orderBy('timestamp', 'desc')
                .get();
            return snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        }
        async getBestDeals(category, limit = 10) {
            const firestore = this.firebaseService.getFirestore();
            let query = firestore.collection('products').orderBy('price', 'asc').limit(limit);
            if (category) {
                query = query.where('category', '==', category);
            }
            const snapshot = await query.get();
            return snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        }
    };
    __setFunctionName(_classThis, "ComparisonsService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ComparisonsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ComparisonsService = _classThis;
})();
export { ComparisonsService };
