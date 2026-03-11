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
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PlanType, PLAN_LIMITS } from '@shared/plans.constants';
let UsersService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var UsersService = _classThis = class {
        constructor(firebaseService) {
            this.firebaseService = firebaseService;
        }
        async findById(userId) {
            const logger = new Logger(UsersService.name);
            const firestore = this.firebaseService.getFirestore();
            const userDoc = await firestore.collection('users').doc(userId).get();
            if (!userDoc.exists) {
                logger.warn(`🔍 [USER DEBUG] User ${userId} not found`);
                return null;
            }
            const userData = userDoc.data();
            delete userData.password;
            logger.log(`🔍 [USER DEBUG] Found user ${userId}: credits=${userData.credits}, plan=${userData.plan}, freeTrialUsed=${userData.freeTrialUsed}`);
            return Object.assign({ id: userDoc.id }, userData);
        }
        async updateProfile(userId, data) {
            const firestore = this.firebaseService.getFirestore();
            await firestore.collection('users').doc(userId).update(Object.assign(Object.assign({}, data), { updatedAt: new Date() }));
            return this.findById(userId);
        }
        async updatePlan(userId, plan, billingCycle) {
            const logger = new Logger(UsersService.name);
            logger.log(`💾 [DB] Atualizando plano do usuário ${userId} para: ${plan}`);
            const firestore = this.firebaseService.getFirestore();
            const now = new Date();
            const expiresAt = new Date();
            if (billingCycle === 'monthly') {
                expiresAt.setMonth(expiresAt.getMonth() + 1);
            }
            else {
                expiresAt.setFullYear(expiresAt.getFullYear() + 1);
            }
            try {
                await firestore.collection('users').doc(userId).update({
                    plan,
                    billingCycle,
                    planStartedAt: now,
                    planExpiresAt: expiresAt,
                    updatedAt: now,
                });
                logger.log(`✅ [DB] Plano atualizado no Firebase com sucesso`);
                const updatedUser = await this.findById(userId);
                logger.log(`🔍 [DB] Usuário recarregado: plano=${updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.plan}`);
                return updatedUser;
            }
            catch (error) {
                logger.error(`❌ [DB] Erro ao atualizar plano no Firebase: ${error.message}`);
                throw error;
            }
        }
        async addCredits(userId, credits) {
            var _a;
            const firestore = this.firebaseService.getFirestore();
            const userDoc = await firestore.collection('users').doc(userId).get();
            if (!userDoc.exists) {
                throw new BadRequestException('User not found');
            }
            const currentCredits = ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.credits) || 0;
            await firestore.collection('users').doc(userId).update({
                credits: currentCredits + credits,
                updatedAt: new Date(),
            });
            return this.findById(userId);
        }
        async setCredits(userId, credits) {
            const firestore = this.firebaseService.getFirestore();
            const userDoc = await firestore.collection('users').doc(userId).get();
            if (!userDoc.exists) {
                throw new BadRequestException('User not found');
            }
            await firestore.collection('users').doc(userId).update({
                credits,
                updatedAt: new Date(),
            });
            return this.findById(userId);
        }
        async checkUsageLimit(userId, type) {
            const firestore = this.firebaseService.getFirestore();
            const userDoc = await firestore.collection('users').doc(userId).get();
            if (!userDoc.exists) {
                return false;
            }
            const userData = userDoc.data();
            const plan = (userData === null || userData === void 0 ? void 0 : userData.plan) || PlanType.FREE;
            const limits = PLAN_LIMITS[plan];
            const today = new Date().toISOString().split('T')[0];
            const monthKey = new Date().toISOString().slice(0, 7);
            const usageKey = type === 'text' ? 'textSearchesToday' : 'imageSearchesToday';
            const monthlyUsageKey = type === 'text' ? 'textSearchesThisMonth' : 'imageSearchesThisMonth';
            const lastUsageDate = userData === null || userData === void 0 ? void 0 : userData.lastUsageDate;
            const lastMonthKey = userData === null || userData === void 0 ? void 0 : userData.lastMonthKey;
            let currentUsage = (userData === null || userData === void 0 ? void 0 : userData[usageKey]) || 0;
            let monthlyUsage = (userData === null || userData === void 0 ? void 0 : userData[monthlyUsageKey]) || 0;
            // RESET AUTOMÁTICO - Dia mudou
            if (lastUsageDate !== today) {
                currentUsage = 0;
                await firestore.collection('users').doc(userId).update({
                    [usageKey]: 0,
                    lastUsageDate: today,
                    updatedAt: new Date(),
                });
            }
            // RESET AUTOMÁTICO - Mês mudou
            if (lastMonthKey !== monthKey) {
                monthlyUsage = 0;
                await firestore.collection('users').doc(userId).update({
                    [monthlyUsageKey]: 0,
                    lastMonthKey: monthKey,
                    updatedAt: new Date(),
                });
            }
            const dailyLimit = type === 'text' ? limits.textSearchesPerDay : limits.imageSearchesPerDay;
            // Plano ilimitado
            if (dailyLimit === -1)
                return true;
            // Plano com limite mensal (FREE)
            if (dailyLimit === 0) {
                const monthlyLimit = type === 'text' ? limits.textSearchesPerMonth : limits.imageSearchesPerMonth;
                return monthlyUsage < (monthlyLimit || 0);
            }
            // Plano com limite diário
            return currentUsage < dailyLimit;
        }
        async incrementUsage(userId, type) {
            const firestore = this.firebaseService.getFirestore();
            const userDoc = await firestore.collection('users').doc(userId).get();
            if (!userDoc.exists)
                return;
            const userData = userDoc.data();
            const today = new Date().toISOString().split('T')[0];
            const monthKey = new Date().toISOString().slice(0, 7);
            const lastUsageDate = userData === null || userData === void 0 ? void 0 : userData.lastUsageDate;
            const lastMonthKey = userData === null || userData === void 0 ? void 0 : userData.lastMonthKey;
            const usageKey = type === 'text' ? 'textSearchesToday' : 'imageSearchesToday';
            const monthlyUsageKey = type === 'text' ? 'textSearchesThisMonth' : 'imageSearchesThisMonth';
            let currentUsage = (userData === null || userData === void 0 ? void 0 : userData[usageKey]) || 0;
            let monthlyUsage = (userData === null || userData === void 0 ? void 0 : userData[monthlyUsageKey]) || 0;
            if (lastUsageDate !== today) {
                currentUsage = 0;
            }
            if (lastMonthKey !== monthKey) {
                monthlyUsage = 0;
            }
            await firestore.collection('users').doc(userId).update({
                [usageKey]: currentUsage + 1,
                [monthlyUsageKey]: monthlyUsage + 1,
                lastUsageDate: today,
                lastMonthKey: monthKey,
                updatedAt: new Date(),
            });
        }
        async useCredit(userId, amount = 1) {
            const logger = new Logger(UsersService.name);
            const firestore = this.firebaseService.getFirestore();
            logger.log(`🔍 [CREDITS DEBUG] Starting useCredit for user ${userId}, amount: ${amount}`);
            const userDoc = await firestore.collection('users').doc(userId).get();
            if (!userDoc.exists) {
                logger.error(`❌ [CREDITS DEBUG] User ${userId} not found`);
                throw new BadRequestException('User not found');
            }
            const userData = userDoc.data();
            const currentCredits = (userData === null || userData === void 0 ? void 0 : userData.credits) || 0;
            const freeTrialUsed = (userData === null || userData === void 0 ? void 0 : userData.freeTrialUsed) || false;
            const plan = (userData === null || userData === void 0 ? void 0 : userData.plan) || 'free';
            logger.log(`💳 [CREDITS DEBUG] User ${userId} data:`);
            logger.log(`   - currentCredits: ${currentCredits}`);
            logger.log(`   - amount to deduct: ${amount}`);
            logger.log(`   - freeTrialUsed: ${freeTrialUsed}`);
            logger.log(`   - plan: ${plan}`);
            // Se tem crédito de teste E ainda não usou = usar teste
            if (currentCredits > 0 && !freeTrialUsed) {
                const newCredits = currentCredits - amount;
                logger.log(`💳 [CREDITS DEBUG] Using free trial credit: ${currentCredits} -> ${newCredits}`);
                try {
                    await firestore.collection('users').doc(userId).update({
                        credits: newCredits,
                        freeTrialUsed: true,
                        updatedAt: new Date(),
                    });
                    logger.log(`✅ [CREDITS DEBUG] Free trial credit deducted successfully`);
                    // Verificar se realmente foi atualizado
                    const updatedDoc = await firestore.collection('users').doc(userId).get();
                    const updatedData = updatedDoc.data();
                    logger.log(`🔍 [CREDITS DEBUG] After update - credits: ${updatedData === null || updatedData === void 0 ? void 0 : updatedData.credits}, freeTrialUsed: ${updatedData === null || updatedData === void 0 ? void 0 : updatedData.freeTrialUsed}`);
                    return;
                }
                catch (error) {
                    logger.error(`❌ [CREDITS DEBUG] Error updating free trial credit: ${error.message}`);
                    throw error;
                }
            }
            // Créditos normais
            if (currentCredits < amount) {
                logger.warn(`❌ [CREDITS DEBUG] Insufficient credits: has ${currentCredits}, needs ${amount}`);
                throw new BadRequestException({
                    error: 'INSUFFICIENT_CREDITS',
                    message: 'Insufficient credits',
                    currentCredits,
                    requiredCredits: amount,
                    action: 'buy_credits'
                });
            }
            const newCredits = currentCredits - amount;
            logger.log(`💳 [CREDITS DEBUG] Deducting normal credit: ${currentCredits} -> ${newCredits}`);
            try {
                await firestore.collection('users').doc(userId).update({
                    credits: newCredits,
                    updatedAt: new Date(),
                });
                logger.log(`✅ [CREDITS DEBUG] Normal credit deducted successfully`);
                // Verificar se realmente foi atualizado
                const updatedDoc = await firestore.collection('users').doc(userId).get();
                const updatedData = updatedDoc.data();
                logger.log(`🔍 [CREDITS DEBUG] After update - credits: ${updatedData === null || updatedData === void 0 ? void 0 : updatedData.credits}`);
            }
            catch (error) {
                logger.error(`❌ [CREDITS DEBUG] Error updating normal credit: ${error.message}`);
                throw error;
            }
        }
        async getPlanLimits(plan) {
            const limits = PLAN_LIMITS[plan] || PLAN_LIMITS[PlanType.FREE];
            return limits;
        }
        async getCurrentUsage(userId) {
            const firestore = this.firebaseService.getFirestore();
            const userDoc = await firestore.collection('users').doc(userId).get();
            if (!userDoc.exists) {
                return { textToday: 0, imageToday: 0, textMonth: 0, imageMonth: 0 };
            }
            const userData = userDoc.data();
            const today = new Date().toISOString().split('T')[0];
            const monthKey = new Date().toISOString().slice(0, 7);
            return {
                textToday: (userData === null || userData === void 0 ? void 0 : userData.lastUsageDate) === today ? ((userData === null || userData === void 0 ? void 0 : userData.textSearchesToday) || 0) : 0,
                imageToday: (userData === null || userData === void 0 ? void 0 : userData.lastUsageDate) === today ? ((userData === null || userData === void 0 ? void 0 : userData.imageSearchesToday) || 0) : 0,
                textMonth: (userData === null || userData === void 0 ? void 0 : userData.lastMonthKey) === monthKey ? ((userData === null || userData === void 0 ? void 0 : userData.textSearchesThisMonth) || 0) : 0,
                imageMonth: (userData === null || userData === void 0 ? void 0 : userData.lastMonthKey) === monthKey ? ((userData === null || userData === void 0 ? void 0 : userData.imageSearchesThisMonth) || 0) : 0,
            };
        }
    };
    __setFunctionName(_classThis, "UsersService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UsersService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UsersService = _classThis;
})();
export { UsersService };
