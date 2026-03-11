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
let ProductsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ProductsService = _classThis = class {
        constructor(firebaseService, redisService, searchService) {
            this.firebaseService = firebaseService;
            this.redisService = redisService;
            this.searchService = searchService;
            this.productCache = new Map(); // Cache em memória
        }
        async create(createProductDto) {
            const firestore = this.firebaseService.getFirestore();
            const productsRef = firestore.collection('products');
            const productData = {
                title: createProductDto.title,
                description: createProductDto.description,
                price: createProductDto.price,
                images: createProductDto.images,
                category: createProductDto.category,
                source: createProductDto.source,
                sourceUrl: createProductDto.sourceUrl,
                location: {
                    state: createProductDto.state,
                    city: createProductDto.city,
                    cep: createProductDto.cep || null,
                },
                seller: {
                    name: createProductDto.sellerName,
                    phone: createProductDto.sellerPhone || null,
                },
                condition: createProductDto.condition || 'used',
                createdAt: new Date(),
                updatedAt: new Date(),
                scrapedAt: new Date(),
            };
            const docRef = await productsRef.add(productData);
            return Object.assign({ id: docRef.id }, productData);
        }
        async findAll(filters, limit = 50) {
            const cacheKey = `products:${JSON.stringify(filters)}:${limit}`;
            const cached = await this.redisService.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
            const firestore = this.firebaseService.getFirestore();
            let query = firestore.collection('products').orderBy('createdAt', 'desc').limit(limit);
            if (filters.category) {
                query = query.where('category', '==', filters.category);
            }
            if (filters.state) {
                query = query.where('location.state', '==', filters.state);
            }
            if (filters.city) {
                query = query.where('location.city', '==', filters.city);
            }
            if (filters.source) {
                query = query.where('source', '==', filters.source);
            }
            const snapshot = await query.get();
            const products = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            await this.redisService.set(cacheKey, JSON.stringify(products), 300);
            return products;
        }
        async findById(id) {
            // Verificar cache em memória primeiro
            if (this.productCache.has(id)) {
                return this.productCache.get(id);
            }
            // Verificar cache do SearchService (produtos simulados)
            if (this.searchService) {
                const cachedProduct = await this.searchService.getProductById(id);
                if (cachedProduct) {
                    return cachedProduct;
                }
            }
            // Buscar no Firebase
            const firestore = this.firebaseService.getFirestore();
            const doc = await firestore.collection('products').doc(id).get();
            if (!doc.exists) {
                return null;
            }
            return Object.assign({ id: doc.id }, doc.data());
        }
        cacheProduct(product) {
            this.productCache.set(product.id, product);
        }
        async delete(id) {
            const firestore = this.firebaseService.getFirestore();
            await firestore.collection('products').doc(id).delete();
        }
    };
    __setFunctionName(_classThis, "ProductsService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProductsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProductsService = _classThis;
})();
export { ProductsService };
