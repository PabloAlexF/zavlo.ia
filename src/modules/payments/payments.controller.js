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
import { Controller, Post, UseGuards, Get, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
let PaymentsController = (() => {
    let _classDecorators = [Controller('payments')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _pixSimple_decorators;
    let _debugPayment_decorators;
    let _testPayment_decorators;
    let _createPayment_decorators;
    let _createPixPayment_decorators;
    let _confirmPixPayment_decorators;
    let _createPixPaymentTest_decorators;
    let _handleWebhook_decorators;
    let _createPaymentTest_decorators;
    var PaymentsController = _classThis = class {
        constructor(paymentsService, pixSimpleService) {
            this.paymentsService = (__runInitializers(this, _instanceExtraInitializers), paymentsService);
            this.pixSimpleService = pixSimpleService;
            this.logger = new Logger(PaymentsController.name);
        }
        async pixSimple() {
            return this.pixSimpleService.createSimplePix();
        }
        async debugPayment() {
            return this.paymentsService.debugInfo();
        }
        async testPayment() {
            return this.paymentsService.testConnection();
        }
        async createPayment(user, body) {
            const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.id);
            this.logger.log(`Criando pagamento para usuário: ${userId}`);
            return this.paymentsService.createPayment({
                plan: body.plan,
                amount: body.amount,
                userId: userId,
                userEmail: user.email,
            });
        }
        async createPixPayment(user, body) {
            const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.id);
            this.logger.log(`Criando PIX para usuário: ${userId}`);
            return this.paymentsService.createPixPayment({
                plan: body.plan,
                amount: body.amount,
                userId: userId,
                userEmail: user.email,
            });
        }
        async confirmPixPayment(user, body) {
            const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.id);
            const paymentId = body.paymentId;
            this.logger.log(`Confirmando PIX ${paymentId} para usuário: ${userId}`);
            return this.paymentsService.confirmPixPayment(paymentId, userId);
        }
        async createPixPaymentTest(body) {
            return this.paymentsService.createPixPayment({
                plan: body.plan,
                amount: body.amount,
                userId: 'test-user',
                userEmail: 'test@zavlo.ia',
            });
        }
        async handleWebhook(body) {
            return this.paymentsService.handleWebhook(body);
        }
        // Checkout Pro test - works with TEST tokens
        async createPaymentTest(body) {
            return this.paymentsService.createPayment({
                plan: body.plan,
                amount: body.amount,
                userId: 'test-user',
                userEmail: 'test@zavlo.ia',
            });
        }
    };
    __setFunctionName(_classThis, "PaymentsController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _pixSimple_decorators = [Get('pix-simple')];
        _debugPayment_decorators = [Get('debug')];
        _testPayment_decorators = [Get('test')];
        _createPayment_decorators = [Post('create'), UseGuards(JwtAuthGuard)];
        _createPixPayment_decorators = [Post('pix'), UseGuards(JwtAuthGuard)];
        _confirmPixPayment_decorators = [Post('pix/:paymentId/confirm'), UseGuards(JwtAuthGuard)];
        _createPixPaymentTest_decorators = [Post('pix-test')];
        _handleWebhook_decorators = [Post('webhook')];
        _createPaymentTest_decorators = [Post('create-test')];
        __esDecorate(_classThis, null, _pixSimple_decorators, { kind: "method", name: "pixSimple", static: false, private: false, access: { has: obj => "pixSimple" in obj, get: obj => obj.pixSimple }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _debugPayment_decorators, { kind: "method", name: "debugPayment", static: false, private: false, access: { has: obj => "debugPayment" in obj, get: obj => obj.debugPayment }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _testPayment_decorators, { kind: "method", name: "testPayment", static: false, private: false, access: { has: obj => "testPayment" in obj, get: obj => obj.testPayment }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createPayment_decorators, { kind: "method", name: "createPayment", static: false, private: false, access: { has: obj => "createPayment" in obj, get: obj => obj.createPayment }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createPixPayment_decorators, { kind: "method", name: "createPixPayment", static: false, private: false, access: { has: obj => "createPixPayment" in obj, get: obj => obj.createPixPayment }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _confirmPixPayment_decorators, { kind: "method", name: "confirmPixPayment", static: false, private: false, access: { has: obj => "confirmPixPayment" in obj, get: obj => obj.confirmPixPayment }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createPixPaymentTest_decorators, { kind: "method", name: "createPixPaymentTest", static: false, private: false, access: { has: obj => "createPixPaymentTest" in obj, get: obj => obj.createPixPaymentTest }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleWebhook_decorators, { kind: "method", name: "handleWebhook", static: false, private: false, access: { has: obj => "handleWebhook" in obj, get: obj => obj.handleWebhook }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createPaymentTest_decorators, { kind: "method", name: "createPaymentTest", static: false, private: false, access: { has: obj => "createPaymentTest" in obj, get: obj => obj.createPaymentTest }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PaymentsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PaymentsController = _classThis;
})();
export { PaymentsController };
