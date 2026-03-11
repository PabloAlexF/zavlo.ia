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
import { Injectable } from '@nestjs/common';
let AnalyticsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AnalyticsService = _classThis = class {
        constructor(firebaseService, redisService) {
            this.firebaseService = firebaseService;
            this.redisService = redisService;
        }
        async logSearch(searchData) {
            try {
                await this.firebaseService.getFirestore()
                    .collection('search_logs')
                    .add(Object.assign(Object.assign({}, searchData), { timestamp: new Date() }));
                // Cache metrics for quick access
                const key = `metrics:${new Date().toISOString().split('T')[0]}`;
                await this.redisService.hIncrBy(key, 'total_searches', 1);
                await this.redisService.hIncrBy(key, `${searchData.type}_searches`, 1);
                await this.redisService.expire(key, 86400 * 7); // 7 days
            }
            catch (error) {
                console.error('Error logging search:', error);
            }
        }
        async getSearchMetrics(days = 7) {
            const metrics = {
                totalSearches: 0,
                textSearches: 0,
                imageSearches: 0,
                avgResponseTime: 0,
                successRate: 0,
                topSources: {},
                dailyStats: [],
            };
            try {
                const endDate = new Date();
                const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
                const snapshot = await this.firebaseService.getFirestore()
                    .collection('search_logs')
                    .where('timestamp', '>=', startDate)
                    .where('timestamp', '<=', endDate)
                    .get();
                const logs = snapshot.docs.map(doc => doc.data());
                metrics.totalSearches = logs.length;
                metrics.textSearches = logs.filter(log => log.type === 'text').length;
                metrics.imageSearches = logs.filter(log => log.type === 'image').length;
                if (logs.length > 0) {
                    metrics.avgResponseTime = logs.reduce((sum, log) => sum + log.responseTime, 0) / logs.length;
                    metrics.successRate = (logs.filter(log => log.success).length / logs.length) * 100;
                }
                // Top sources
                logs.forEach(log => {
                    log.sources.forEach(source => {
                        metrics.topSources[source] = (metrics.topSources[source] || 0) + 1;
                    });
                });
                return metrics;
            }
            catch (error) {
                console.error('Error getting metrics:', error);
                return metrics;
            }
        }
        async getUserSearchHistory(userId, limit = 20) {
            try {
                const snapshot = await this.firebaseService.getFirestore()
                    .collection('search_logs')
                    .where('userId', '==', userId)
                    .orderBy('timestamp', 'desc')
                    .limit(limit)
                    .get();
                return snapshot.docs.map(doc => doc.data());
            }
            catch (error) {
                console.error('Error getting user history:', error);
                return [];
            }
        }
    };
    __setFunctionName(_classThis, "AnalyticsService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AnalyticsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AnalyticsService = _classThis;
})();
export { AnalyticsService };
