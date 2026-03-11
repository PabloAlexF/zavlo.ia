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
import { Controller, Get, Post, Delete, UseGuards, } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
let PriceAlertsController = (() => {
    let _classDecorators = [Controller('price-alerts'), UseGuards(JwtAuthGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _createAlert_decorators;
    let _getUserAlerts_decorators;
    let _getStats_decorators;
    let _deleteAlert_decorators;
    var PriceAlertsController = _classThis = class {
        constructor(priceAlertsService) {
            this.priceAlertsService = (__runInitializers(this, _instanceExtraInitializers), priceAlertsService);
        }
        async createAlert(req, body) {
            return this.priceAlertsService.createAlert(req.user.uid, body);
        }
        async getUserAlerts(req) {
            return this.priceAlertsService.getUserAlerts(req.user.uid);
        }
        async getStats(req) {
            return this.priceAlertsService.getAlertStats(req.user.uid);
        }
        async deleteAlert(req, id) {
            await this.priceAlertsService.deleteAlert(id, req.user.uid);
            return { message: 'Alert deleted successfully' };
        }
    };
    __setFunctionName(_classThis, "PriceAlertsController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _createAlert_decorators = [Post()];
        _getUserAlerts_decorators = [Get()];
        _getStats_decorators = [Get('stats')];
        _deleteAlert_decorators = [Delete(':id')];
        __esDecorate(_classThis, null, _createAlert_decorators, { kind: "method", name: "createAlert", static: false, private: false, access: { has: obj => "createAlert" in obj, get: obj => obj.createAlert }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getUserAlerts_decorators, { kind: "method", name: "getUserAlerts", static: false, private: false, access: { has: obj => "getUserAlerts" in obj, get: obj => obj.getUserAlerts }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: obj => "getStats" in obj, get: obj => obj.getStats }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteAlert_decorators, { kind: "method", name: "deleteAlert", static: false, private: false, access: { has: obj => "deleteAlert" in obj, get: obj => obj.deleteAlert }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PriceAlertsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PriceAlertsController = _classThis;
})();
export { PriceAlertsController };
