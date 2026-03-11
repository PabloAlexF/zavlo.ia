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
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PlanType } from '@shared/plans.constants';
let PlanExpirationService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _checkExpiredPlans_decorators;
    let _notifyExpiringPlans_decorators;
    var PlanExpirationService = _classThis = class {
        constructor(firebaseService) {
            this.firebaseService = (__runInitializers(this, _instanceExtraInitializers), firebaseService);
            this.logger = new Logger(PlanExpirationService.name);
        }
        /**
         * Verifica planos expirados todos os dias à meia-noite
         */
        async checkExpiredPlans() {
            this.logger.log('🔍 [CRON] Checking for expired plans...');
            try {
                const firestore = this.firebaseService.getFirestore();
                const now = new Date();
                // Buscar usuários com planos que expiraram
                const usersSnapshot = await firestore
                    .collection('users')
                    .where('planExpiresAt', '<=', now)
                    .where('plan', '!=', PlanType.FREE)
                    .get();
                if (usersSnapshot.empty) {
                    this.logger.log('✅ [CRON] No expired plans found');
                    return;
                }
                this.logger.log(`⚠️ [CRON] Found ${usersSnapshot.size} expired plans`);
                // Processar cada usuário com plano expirado
                for (const doc of usersSnapshot.docs) {
                    const userId = doc.id;
                    const userData = doc.data();
                    this.logger.log(`📋 [CRON] Processing user ${userId} - Plan: ${userData.plan}`);
                    // Downgrade para plano FREE
                    await firestore.collection('users').doc(userId).update({
                        plan: PlanType.FREE,
                        billingCycle: null,
                        planStartedAt: null,
                        planExpiresAt: null,
                        updatedAt: new Date(),
                    });
                    this.logger.log(`✅ [CRON] User ${userId} downgraded to FREE plan`);
                    // TODO: Enviar email de notificação
                    // await this.emailService.sendPlanExpiredNotification(userId, userData.email);
                }
                this.logger.log(`✅ [CRON] Processed ${usersSnapshot.size} expired plans`);
            }
            catch (error) {
                this.logger.error('❌ [CRON] Error checking expired plans:', error);
            }
        }
        /**
         * Notifica usuários 3 dias antes do plano expirar
         */
        async notifyExpiringPlans() {
            this.logger.log('🔔 [CRON] Checking for expiring plans...');
            try {
                const firestore = this.firebaseService.getFirestore();
                const now = new Date();
                const threeDaysFromNow = new Date();
                threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
                // Buscar usuários com planos que expiram em 3 dias
                const usersSnapshot = await firestore
                    .collection('users')
                    .where('planExpiresAt', '>=', now)
                    .where('planExpiresAt', '<=', threeDaysFromNow)
                    .where('plan', '!=', PlanType.FREE)
                    .get();
                if (usersSnapshot.empty) {
                    this.logger.log('✅ [CRON] No expiring plans found');
                    return;
                }
                this.logger.log(`⚠️ [CRON] Found ${usersSnapshot.size} expiring plans`);
                for (const doc of usersSnapshot.docs) {
                    const userId = doc.id;
                    const userData = doc.data();
                    const expiresAt = userData.planExpiresAt.toDate();
                    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    this.logger.log(`📧 [CRON] Notifying user ${userId} - ${daysLeft} days left`);
                    // TODO: Enviar email de aviso
                    // await this.emailService.sendPlanExpiringNotification(userId, userData.email, daysLeft);
                }
                this.logger.log(`✅ [CRON] Notified ${usersSnapshot.size} users`);
            }
            catch (error) {
                this.logger.error('❌ [CRON] Error notifying expiring plans:', error);
            }
        }
        /**
         * Método manual para verificar status do plano de um usuário
         */
        async checkUserPlanStatus(userId) {
            var _a;
            try {
                const firestore = this.firebaseService.getFirestore();
                const userDoc = await firestore.collection('users').doc(userId).get();
                if (!userDoc.exists) {
                    return {
                        isExpired: false,
                        daysLeft: null,
                        message: 'Usuário não encontrado',
                    };
                }
                const userData = userDoc.data();
                const plan = (userData === null || userData === void 0 ? void 0 : userData.plan) || PlanType.FREE;
                // Plano FREE não expira
                if (plan === PlanType.FREE) {
                    return {
                        isExpired: false,
                        daysLeft: null,
                        message: 'Plano gratuito não expira',
                    };
                }
                const planExpiresAt = (_a = userData === null || userData === void 0 ? void 0 : userData.planExpiresAt) === null || _a === void 0 ? void 0 : _a.toDate();
                if (!planExpiresAt) {
                    return {
                        isExpired: false,
                        daysLeft: null,
                        message: 'Data de expiração não definida',
                    };
                }
                const now = new Date();
                const daysLeft = Math.ceil((planExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                if (daysLeft <= 0) {
                    return {
                        isExpired: true,
                        daysLeft: 0,
                        message: 'Seu plano expirou. Renove para continuar aproveitando os benefícios!',
                    };
                }
                else if (daysLeft <= 3) {
                    return {
                        isExpired: false,
                        daysLeft,
                        message: `Seu plano expira em ${daysLeft} dia(s). Renove agora para não perder acesso!`,
                    };
                }
                else if (daysLeft <= 7) {
                    return {
                        isExpired: false,
                        daysLeft,
                        message: `Seu plano expira em ${daysLeft} dias.`,
                    };
                }
                else {
                    return {
                        isExpired: false,
                        daysLeft,
                        message: `Seu plano está ativo por mais ${daysLeft} dias.`,
                    };
                }
            }
            catch (error) {
                this.logger.error('❌ Error checking plan status:', error);
                throw error;
            }
        }
    };
    __setFunctionName(_classThis, "PlanExpirationService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _checkExpiredPlans_decorators = [Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)];
        _notifyExpiringPlans_decorators = [Cron(CronExpression.EVERY_DAY_AT_10AM)];
        __esDecorate(_classThis, null, _checkExpiredPlans_decorators, { kind: "method", name: "checkExpiredPlans", static: false, private: false, access: { has: obj => "checkExpiredPlans" in obj, get: obj => obj.checkExpiredPlans }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _notifyExpiringPlans_decorators, { kind: "method", name: "notifyExpiringPlans", static: false, private: false, access: { has: obj => "notifyExpiringPlans" in obj, get: obj => obj.notifyExpiringPlans }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PlanExpirationService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PlanExpirationService = _classThis;
})();
export { PlanExpirationService };
