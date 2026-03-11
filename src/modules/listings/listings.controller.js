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
import { Controller, Post, Get, Put, Delete, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
let ListingsController = (() => {
    let _classDecorators = [Controller('listings')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getPublicListings_decorators;
    let _searchListings_decorators;
    let _getListingsByCategory_decorators;
    let _createListing_decorators;
    let _getUserListings_decorators;
    let _updateListing_decorators;
    let _toggleActive_decorators;
    let _featureListing_decorators;
    let _deleteListing_decorators;
    let _getListingById_decorators;
    let _incrementViews_decorators;
    let _incrementClicks_decorators;
    var ListingsController = _classThis = class {
        constructor(listingsService) {
            this.listingsService = (__runInitializers(this, _instanceExtraInitializers), listingsService);
            this.logger = new Logger(ListingsController.name);
        }
        // =====================================================
        // PUBLIC ENDPOINTS - More specific routes first
        // =====================================================
        async getPublicListings() {
            return this.listingsService.getAllActiveListings();
        }
        async searchListings(query) {
            if (!query) {
                return this.listingsService.getAllActiveListings();
            }
            return this.listingsService.searchListings(query);
        }
        async getListingsByCategory(category) {
            return this.listingsService.getListingsByCategory(category);
        }
        // =====================================================
        // PROTECTED ENDPOINTS - Authentication required
        // =====================================================
        async createListing(user, listingData) {
            const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.id);
            this.logger.log(`Criando listing para usuario: ${userId}`);
            return this.listingsService.createListing(userId, listingData);
        }
        async getUserListings(user) {
            const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.id);
            return this.listingsService.getUserListings(userId);
        }
        async updateListing(user, listingId, updates) {
            const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.id);
            await this.listingsService.updateListing(userId, listingId, updates);
            return { success: true };
        }
        async toggleActive(user, listingId) {
            const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.id);
            await this.listingsService.toggleActive(userId, listingId);
            return { success: true };
        }
        async featureListing(user, listingId, { days }) {
            const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.id);
            await this.listingsService.featureListing(userId, listingId, days);
            return { success: true };
        }
        async deleteListing(user, listingId) {
            const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.id);
            await this.listingsService.deleteListing(userId, listingId);
            return { success: true };
        }
        // =====================================================
        // PUBLIC ENDPOINTS - Less specific routes last
        // =====================================================
        async getListingById(listingId) {
            return this.listingsService.getListingById(listingId);
        }
        async incrementViews(listingId) {
            await this.listingsService.incrementViews(listingId);
            return { success: true };
        }
        async incrementClicks(listingId) {
            await this.listingsService.incrementClicks(listingId);
            return { success: true };
        }
    };
    __setFunctionName(_classThis, "ListingsController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getPublicListings_decorators = [Get('public')];
        _searchListings_decorators = [Get('public/search')];
        _getListingsByCategory_decorators = [Get('public/category/:category')];
        _createListing_decorators = [Post(), UseGuards(JwtAuthGuard)];
        _getUserListings_decorators = [Get('my'), UseGuards(JwtAuthGuard)];
        _updateListing_decorators = [Put(':id'), UseGuards(JwtAuthGuard)];
        _toggleActive_decorators = [Put(':id/toggle'), UseGuards(JwtAuthGuard)];
        _featureListing_decorators = [Post(':id/feature'), UseGuards(JwtAuthGuard)];
        _deleteListing_decorators = [Delete(':id'), UseGuards(JwtAuthGuard)];
        _getListingById_decorators = [Get(':id')];
        _incrementViews_decorators = [Post(':id/view')];
        _incrementClicks_decorators = [Post(':id/click')];
        __esDecorate(_classThis, null, _getPublicListings_decorators, { kind: "method", name: "getPublicListings", static: false, private: false, access: { has: obj => "getPublicListings" in obj, get: obj => obj.getPublicListings }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _searchListings_decorators, { kind: "method", name: "searchListings", static: false, private: false, access: { has: obj => "searchListings" in obj, get: obj => obj.searchListings }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getListingsByCategory_decorators, { kind: "method", name: "getListingsByCategory", static: false, private: false, access: { has: obj => "getListingsByCategory" in obj, get: obj => obj.getListingsByCategory }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createListing_decorators, { kind: "method", name: "createListing", static: false, private: false, access: { has: obj => "createListing" in obj, get: obj => obj.createListing }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getUserListings_decorators, { kind: "method", name: "getUserListings", static: false, private: false, access: { has: obj => "getUserListings" in obj, get: obj => obj.getUserListings }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateListing_decorators, { kind: "method", name: "updateListing", static: false, private: false, access: { has: obj => "updateListing" in obj, get: obj => obj.updateListing }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _toggleActive_decorators, { kind: "method", name: "toggleActive", static: false, private: false, access: { has: obj => "toggleActive" in obj, get: obj => obj.toggleActive }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _featureListing_decorators, { kind: "method", name: "featureListing", static: false, private: false, access: { has: obj => "featureListing" in obj, get: obj => obj.featureListing }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteListing_decorators, { kind: "method", name: "deleteListing", static: false, private: false, access: { has: obj => "deleteListing" in obj, get: obj => obj.deleteListing }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getListingById_decorators, { kind: "method", name: "getListingById", static: false, private: false, access: { has: obj => "getListingById" in obj, get: obj => obj.getListingById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _incrementViews_decorators, { kind: "method", name: "incrementViews", static: false, private: false, access: { has: obj => "incrementViews" in obj, get: obj => obj.incrementViews }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _incrementClicks_decorators, { kind: "method", name: "incrementClicks", static: false, private: false, access: { has: obj => "incrementClicks" in obj, get: obj => obj.incrementClicks }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ListingsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ListingsController = _classThis;
})();
export { ListingsController };
