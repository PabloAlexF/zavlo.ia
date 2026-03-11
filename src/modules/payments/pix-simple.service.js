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
import axios from 'axios';
let PixSimpleService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var PixSimpleService = _classThis = class {
        constructor(configService) {
            this.configService = configService;
            this.logger = new Logger(PixSimpleService.name);
        }
        async createSimplePix() {
            var _a, _b, _c, _d;
            let isTestToken = false;
            try {
                const accessToken = this.configService.get('MERCADOPAGO_ACCESS_TOKEN');
                this.logger.log('=== PIX DEBUG ===');
                this.logger.debug('Access Token:', accessToken ? accessToken.substring(0, 20) + '...' : 'NOT_FOUND');
                if (!accessToken) {
                    return {
                        error: true,
                        statusCode: 503,
                        message: 'Mercado Pago não configurado',
                        details: 'Adicione MERCADOPAGO_ACCESS_TOKEN no arquivo .env',
                        solution: 'Obtenha suas credenciais em: https://www.mercadopago.com.br/developers/panel/credentials'
                    };
                }
                // Check if using test or production token
                isTestToken = accessToken.startsWith('TEST-');
                this.logger.log('Token type:', isTestToken ? 'TEST' : 'PRODUCTION');
                // For Mercado Pago test mode, use the test buyer account created in your dashboard
                // Test buyer account: TESTUSER1643143031681461731
                // Format: <user_id>@testuser.com
                const testEmail = 'test_user_1643143031681461731@testuser.com';
                const payload = {
                    transaction_amount: 1.00,
                    description: 'Teste PIX - Zavlo.ia',
                    payment_method_id: 'pix',
                    payer: {
                        email: testEmail,
                        first_name: 'Comprador',
                        last_name: 'Teste',
                        identification: {
                            type: 'CPF',
                            number: '12345678900'
                        }
                    }
                };
                this.logger.log('Payload:', JSON.stringify(payload, null, 2));
                const response = await axios.post(isTestToken
                    ? 'https://api.mercadopago.com/v1/payments'
                    : 'https://api.mercadopago.com/v1/payments', payload, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                this.logger.log('Success! Payment ID:', response.data.id);
                return {
                    id: response.data.id,
                    status: response.data.status,
                    qr_code: (_b = (_a = response.data.point_of_interaction) === null || _a === void 0 ? void 0 : _a.transaction_data) === null || _b === void 0 ? void 0 : _b.qr_code,
                    qr_code_base64: (_d = (_c = response.data.point_of_interaction) === null || _c === void 0 ? void 0 : _c.transaction_data) === null || _d === void 0 ? void 0 : _d.qr_code_base64,
                };
            }
            catch (error) {
                this.logger.error('=== PIX ERROR ===');
                this.logger.error('Error:', error.message);
                if (error.response) {
                    this.logger.error('Status:', error.response.status);
                    this.logger.error('Data:', JSON.stringify(error.response.data, null, 2));
                    const errorData = error.response.data;
                    // Handle specific Mercado Pago errors
                    if (error.response.status === 401) {
                        return {
                            error: true,
                            statusCode: 401,
                            message: 'Credenciais inválidas',
                            details: errorData,
                            explanation: 'Tokens TEST- nao funcionam para API direta de PIX. Apenas funcionam com Checkout Pro (fluxo de redirecionamento).',
                            solution: isTestToken
                                ? 'Para PIX via API direta, use token de producao (APP_USR-). Alternativa: Use Checkout Pro (/create).'
                                : 'Verifique se o token de producao esta correto.',
                            howToTest: 'Para testar PIX em modo de teste:\n1. Va para https://www.mercadopago.com.br/developers/panel\n2. Crie um usuário de teste na aba "Configurações > Usuários de teste"\n3. Use o email do usuário de teste para pagamentos\n4. Ou mude para um token de produção (APP_USR-...)'
                        };
                    }
                    // Return detailed error instead of throwing
                    return {
                        error: true,
                        statusCode: error.response.status,
                        message: (errorData === null || errorData === void 0 ? void 0 : errorData.message) || 'Pagamento falhou',
                        details: errorData,
                    };
                }
                return {
                    error: true,
                    statusCode: 500,
                    message: 'Erro interno do servidor',
                    details: error.message,
                };
            }
        }
    };
    __setFunctionName(_classThis, "PixSimpleService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PixSimpleService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PixSimpleService = _classThis;
})();
export { PixSimpleService };
