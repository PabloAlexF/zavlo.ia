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
import * as admin from 'firebase-admin';
let ListingsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ListingsService = _classThis = class {
        constructor(firebaseService) {
            this.firebaseService = firebaseService;
        }
        async createListing(userId, listingData) {
            // Filter out undefined values
            const cleanObject = (obj) => {
                if (obj === undefined || obj === null)
                    return undefined;
                if (typeof obj !== 'object')
                    return obj;
                if (Array.isArray(obj))
                    return obj.map(cleanObject);
                const cleaned = {};
                for (const key in obj) {
                    if (obj[key] !== undefined) {
                        cleaned[key] = cleanObject(obj[key]);
                    }
                }
                return cleaned;
            };
            const listing = {
                userId,
                title: listingData.title,
                description: listingData.description,
                price: listingData.price,
                images: listingData.images || [],
                category: listingData.category || 'geral',
                condition: listingData.condition || 'used',
                location: listingData.location,
                contact: listingData.contact,
                active: true,
                featured: false,
                featuredUntil: null,
                views: 0,
                clicks: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            // Add optional fields only if they exist
            if (listingData.brand)
                listing.brand = listingData.brand;
            if (listingData.model)
                listing.model = listingData.model;
            if (listingData.year)
                listing.year = listingData.year;
            if (listingData.specifications && Object.keys(listingData.specifications).length > 0) {
                listing.specifications = listingData.specifications;
            }
            if (listingData.shipping)
                listing.shipping = listingData.shipping;
            const docRef = await this.firebaseService.getFirestore()
                .collection('listings')
                .add(listing);
            // Also add to products collection for search (only defined fields)
            const productData = {
                id: docRef.id,
                title: listing.title,
                description: listing.description,
                price: listing.price,
                image: listing.images[0] || null,
                images: listing.images,
                url: `https://zavlo.ia/listing/${docRef.id}`,
                sourceUrl: `https://zavlo.ia/listing/${docRef.id}`,
                source: 'Zavlo.ia',
                marketplace: 'Zavlo.ia',
                category: listing.category,
                location: listing.location,
                condition: listing.condition,
                active: listing.active,
                stock: true,
                seller: 'Zavlo User',
                score: 1.0,
                qualityScore: 1.0,
                createdAt: listing.createdAt,
                updatedAt: listing.updatedAt,
                scrapedAt: listing.createdAt,
                featured: listing.featured,
            };
            // Add optional fields to product
            if (listing.brand)
                productData.brand = listing.brand;
            if (listing.model)
                productData.model = listing.model;
            if (listing.year)
                productData.year = listing.year;
            await this.firebaseService.getFirestore()
                .collection('products')
                .doc(docRef.id)
                .set(productData);
            return Object.assign({ id: docRef.id }, listing);
        }
        async getUserListings(userId) {
            const snapshot = await this.firebaseService.getFirestore()
                .collection('listings')
                .where('userId', '==', userId)
                .get();
            const listings = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            // Sort in memory instead of Firestore
            return listings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        async updateListing(userId, listingId, updates) {
            await this.firebaseService.getFirestore()
                .collection('listings')
                .doc(listingId)
                .update(Object.assign(Object.assign({}, updates), { updatedAt: new Date() }));
            // Update in products collection too
            await this.firebaseService.getFirestore()
                .collection('products')
                .doc(listingId)
                .update(Object.assign(Object.assign({}, updates), { updatedAt: new Date() }));
        }
        async toggleActive(userId, listingId) {
            var _a;
            const doc = await this.firebaseService.getFirestore()
                .collection('listings')
                .doc(listingId)
                .get();
            if (doc.exists) {
                const currentActive = ((_a = doc.data()) === null || _a === void 0 ? void 0 : _a.active) || false;
                await this.updateListing(userId, listingId, { active: !currentActive });
            }
        }
        async incrementViews(listingId) {
            await this.firebaseService.getFirestore()
                .collection('listings')
                .doc(listingId)
                .update({
                views: admin.firestore.FieldValue.increment(1),
            });
        }
        async incrementClicks(listingId) {
            await this.firebaseService.getFirestore()
                .collection('listings')
                .doc(listingId)
                .update({
                clicks: admin.firestore.FieldValue.increment(1),
            });
        }
        async deleteListing(userId, listingId) {
            // Delete from listings collection
            await this.firebaseService.getFirestore()
                .collection('listings')
                .doc(listingId)
                .delete();
            // Delete from products collection
            await this.firebaseService.getFirestore()
                .collection('products')
                .doc(listingId)
                .delete();
        }
        async getListingById(listingId) {
            const doc = await this.firebaseService.getFirestore()
                .collection('listings')
                .doc(listingId)
                .get();
            if (!doc.exists)
                return null;
            return Object.assign({ id: doc.id }, doc.data());
        }
        async featureListing(userId, listingId, days) {
            const featuredUntil = new Date();
            featuredUntil.setDate(featuredUntil.getDate() + days);
            await this.updateListing(userId, listingId, {
                featured: true,
                featuredUntil,
            });
        }
        async getAllActiveListings() {
            const snapshot = await this.firebaseService.getFirestore()
                .collection('listings')
                .where('active', '==', true)
                .get();
            const listings = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            // Sort by creation date (newest first)
            return listings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        async getListingsByCategory(category) {
            const snapshot = await this.firebaseService.getFirestore()
                .collection('listings')
                .where('active', '==', true)
                .where('category', '==', category)
                .get();
            const listings = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            return listings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        async searchListings(query) {
            // For now, get all active and filter in memory
            // In production, use Algolia or similar for full-text search
            const allListings = await this.getAllActiveListings();
            const lowerQuery = query.toLowerCase();
            return allListings.filter(listing => {
                var _a;
                return listing.title.toLowerCase().includes(lowerQuery) ||
                    ((_a = listing.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(lowerQuery)) ||
                    listing.category.toLowerCase().includes(lowerQuery);
            });
        }
    };
    __setFunctionName(_classThis, "ListingsService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ListingsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ListingsService = _classThis;
})();
export { ListingsService };
