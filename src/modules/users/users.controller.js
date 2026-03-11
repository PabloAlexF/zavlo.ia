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
import { Controller, Post, UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
let UsersController = (() => {
    let _classDecorators = [Controller('users')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getProfile_decorators;
    let _getPlanStatus_decorators;
    let _addCredits_decorators;
    let _setCredits_decorators;
    let _getCurrentUsage_decorators;
    var UsersController = _classThis = class {
        constructor(usersService, planExpirationService) {
            this.usersService = (__runInitializers(this, _instanceExtraInitializers), usersService);
            this.planExpirationService = planExpirationService;
        }
        async getProfile(req) {
            const userId = req.user.userId;
            return this.usersService.findById(userId);
        }
        async getPlanStatus(req) {
            const userId = req.user.userId;
            return this.planExpirationService.checkUserPlanStatus(userId);
        }
        async addCredits(userId, credits) {
            return this.usersService.addCredits(userId, credits);
        }
        async setCredits(userId, credits) {
            return this.usersService.setCredits(userId, credits);
        }
        async getCurrentUsage(req) {
            const userId = req.user.userId;
            return this.usersService.getCurrentUsage(userId);
        }
    };
    __setFunctionName(_classThis, "UsersController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getProfile_decorators = [UseGuards(JwtAuthGuard), Get('profile')];
        _getPlanStatus_decorators = [UseGuards(JwtAuthGuard), Get('plan-status')];
        _addCredits_decorators = [UseGuards(JwtAuthGuard), Post(':userId/credits')];
        _setCredits_decorators = [UseGuards(JwtAuthGuard), Post(':userId/credits/set')];
        _getCurrentUsage_decorators = [UseGuards(JwtAuthGuard), Get('usage')];
        __esDecorate(_classThis, null, _getProfile_decorators, { kind: "method", name: "getProfile", static: false, private: false, access: { has: obj => "getProfile" in obj, get: obj => obj.getProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPlanStatus_decorators, { kind: "method", name: "getPlanStatus", static: false, private: false, access: { has: obj => "getPlanStatus" in obj, get: obj => obj.getPlanStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _addCredits_decorators, { kind: "method", name: "addCredits", static: false, private: false, access: { has: obj => "addCredits" in obj, get: obj => obj.addCredits }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _setCredits_decorators, { kind: "method", name: "setCredits", static: false, private: false, access: { has: obj => "setCredits" in obj, get: obj => obj.setCredits }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCurrentUsage_decorators, { kind: "method", name: "getCurrentUsage", static: false, private: false, access: { has: obj => "getCurrentUsage" in obj, get: obj => obj.getCurrentUsage }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UsersController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UsersController = _classThis;
})();
export { UsersController };
