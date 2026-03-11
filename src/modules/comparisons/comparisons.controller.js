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
import { Controller, Get } from '@nestjs/common';
let ComparisonsController = (() => {
    let _classDecorators = [Controller('comparisons')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _compareProduct_decorators;
    let _getPriceHistory_decorators;
    let _getBestDeals_decorators;
    var ComparisonsController = _classThis = class {
        constructor(comparisonsService) {
            this.comparisonsService = (__runInitializers(this, _instanceExtraInitializers), comparisonsService);
        }
        async compareProduct(title) {
            return this.comparisonsService.compareProduct(title);
        }
        async getPriceHistory(productId, days) {
            return this.comparisonsService.getPriceHistory(productId, days ? parseInt(days) : 30);
        }
        async getBestDeals(category, limit) {
            return this.comparisonsService.getBestDeals(category, limit ? parseInt(limit) : 10);
        }
    };
    __setFunctionName(_classThis, "ComparisonsController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _compareProduct_decorators = [Get('compare')];
        _getPriceHistory_decorators = [Get('history/:productId')];
        _getBestDeals_decorators = [Get('best-deals')];
        __esDecorate(_classThis, null, _compareProduct_decorators, { kind: "method", name: "compareProduct", static: false, private: false, access: { has: obj => "compareProduct" in obj, get: obj => obj.compareProduct }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPriceHistory_decorators, { kind: "method", name: "getPriceHistory", static: false, private: false, access: { has: obj => "getPriceHistory" in obj, get: obj => obj.getPriceHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getBestDeals_decorators, { kind: "method", name: "getBestDeals", static: false, private: false, access: { has: obj => "getBestDeals" in obj, get: obj => obj.getBestDeals }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ComparisonsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ComparisonsController = _classThis;
})();
export { ComparisonsController };
