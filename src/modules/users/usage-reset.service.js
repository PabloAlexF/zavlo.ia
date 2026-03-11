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
let UsageResetService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _resetDailyUsage_decorators;
    let _resetMonthlyUsage_decorators;
    var UsageResetService = _classThis = class {
        constructor(firebaseService) {
            this.firebaseService = (__runInitializers(this, _instanceExtraInitializers), firebaseService);
            this.logger = new Logger(UsageResetService.name);
        }
        // Reset diário à meia-noite (00:00)
        async resetDailyUsage() {
            try {
                const firestore = this.firebaseService.getFirestore();
                const today = new Date().toISOString().split('T')[0];
                const usersSnapshot = await firestore.collection('users').get();
                let resetCount = 0;
                const batch = firestore.batch();
                usersSnapshot.docs.forEach(doc => {
                    const userData = doc.data();
                    // Reset apenas se não foi resetado hoje
                    if (userData.lastUsageDate !== today) {
                        batch.update(doc.ref, {
                            textSearchesToday: 0,
                            imageSearchesToday: 0,
                            lastUsageDate: today,
                            updatedAt: new Date(),
                        });
                        resetCount++;
                    }
                });
                if (resetCount > 0) {
                    await batch.commit();
                    this.logger.log(`✅ Reset diário: ${resetCount} usuários`);
                }
            }
            catch (error) {
                this.logger.error('❌ Erro no reset diário:', error);
            }
        }
        // Reset mensal no dia 1 às 00:01
        async resetMonthlyUsage() {
            try {
                const firestore = this.firebaseService.getFirestore();
                const monthKey = new Date().toISOString().slice(0, 7);
                const usersSnapshot = await firestore.collection('users').get();
                let resetCount = 0;
                const batch = firestore.batch();
                usersSnapshot.docs.forEach(doc => {
                    const userData = doc.data();
                    // Reset apenas se não foi resetado este mês
                    if (userData.lastMonthKey !== monthKey) {
                        batch.update(doc.ref, {
                            textSearchesThisMonth: 0,
                            imageSearchesThisMonth: 0,
                            lastMonthKey: monthKey,
                            updatedAt: new Date(),
                        });
                        resetCount++;
                    }
                });
                if (resetCount > 0) {
                    await batch.commit();
                    this.logger.log(`✅ Reset mensal: ${resetCount} usuários`);
                }
            }
            catch (error) {
                this.logger.error('❌ Erro no reset mensal:', error);
            }
        }
    };
    __setFunctionName(_classThis, "UsageResetService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _resetDailyUsage_decorators = [Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)];
        _resetMonthlyUsage_decorators = [Cron('1 0 1 * *')];
        __esDecorate(_classThis, null, _resetDailyUsage_decorators, { kind: "method", name: "resetDailyUsage", static: false, private: false, access: { has: obj => "resetDailyUsage" in obj, get: obj => obj.resetDailyUsage }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _resetMonthlyUsage_decorators, { kind: "method", name: "resetMonthlyUsage", static: false, private: false, access: { has: obj => "resetMonthlyUsage" in obj, get: obj => obj.resetMonthlyUsage }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UsageResetService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UsageResetService = _classThis;
})();
export { UsageResetService };
