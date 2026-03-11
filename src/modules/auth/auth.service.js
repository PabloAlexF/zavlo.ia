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
import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
let AuthService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthService = _classThis = class {
        constructor(firebaseService, jwtService) {
            this.firebaseService = firebaseService;
            this.jwtService = jwtService;
            this.logger = new Logger(AuthService.name);
        }
        async register(registerDto) {
            try {
                const { email, password, name, phone, location } = registerDto;
                const hashedPassword = await bcrypt.hash(password, 10);
                const firestore = this.firebaseService.getFirestore();
                const usersRef = firestore.collection('users');
                const existingUser = await usersRef.where('email', '==', email).get();
                if (!existingUser.empty) {
                    throw new ConflictException('Email já cadastrado');
                }
                const now = new Date();
                const today = now.toISOString().split('T')[0];
                const monthKey = now.toISOString().slice(0, 7);
                const userDoc = await usersRef.add({
                    email,
                    password: hashedPassword,
                    name,
                    phone: phone || null,
                    location: location || null,
                    // Plano inicial
                    plan: 'free',
                    billingCycle: 'monthly',
                    planStartedAt: now,
                    planExpiresAt: null,
                    // Créditos iniciais
                    credits: 1,
                    freeTrialUsed: false,
                    // Contadores de uso
                    textSearchesToday: 0,
                    imageSearchesToday: 0,
                    textSearchesThisMonth: 0,
                    imageSearchesThisMonth: 0,
                    lastUsageDate: today,
                    lastMonthKey: monthKey,
                    // Timestamps
                    createdAt: now,
                    updatedAt: now,
                });
                this.logger.log(`Novo usuário cadastrado: ${email}`);
                const tokens = await this.generateTokens(userDoc.id, email);
                return Object.assign({ userId: userDoc.id, email,
                    name, plan: 'free', credits: 1 }, tokens);
            }
            catch (error) {
                if (error instanceof ConflictException) {
                    throw error;
                }
                this.logger.error('Erro ao cadastrar usuário:', error);
                throw new InternalServerErrorException('Erro ao cadastrar usuário');
            }
        }
        async login(loginDto) {
            try {
                const { email, password } = loginDto;
                const firestore = this.firebaseService.getFirestore();
                const usersRef = firestore.collection('users');
                const userSnapshot = await usersRef.where('email', '==', email).get();
                if (userSnapshot.empty) {
                    throw new UnauthorizedException('Credenciais inválidas');
                }
                const userDoc = userSnapshot.docs[0];
                const userData = userDoc.data();
                const isPasswordValid = await bcrypt.compare(password, userData.password);
                if (!isPasswordValid) {
                    throw new UnauthorizedException('Credenciais inválidas');
                }
                this.logger.log(`Login realizado: ${email}`);
                const tokens = await this.generateTokens(userDoc.id, email);
                return Object.assign({ userId: userDoc.id, email: userData.email, name: userData.name }, tokens);
            }
            catch (error) {
                if (error instanceof UnauthorizedException) {
                    throw error;
                }
                this.logger.error('Erro ao fazer login:', error);
                throw new InternalServerErrorException('Erro ao fazer login');
            }
        }
        async generateTokens(userId, email) {
            const payload = { sub: userId, email };
            return {
                accessToken: this.jwtService.sign(payload),
                refreshToken: this.jwtService.sign(payload, { expiresIn: '30d' }),
            };
        }
        async validateUser(userId) {
            const firestore = this.firebaseService.getFirestore();
            const userDoc = await firestore.collection('users').doc(userId).get();
            if (!userDoc.exists) {
                return null;
            }
            return Object.assign({ id: userDoc.id }, userDoc.data());
        }
    };
    __setFunctionName(_classThis, "AuthService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthService = _classThis;
})();
export { AuthService };
