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
import { Controller, Get, Post, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
/**
 * Controller administrativo para gerenciamento de limites de IP
 * Protegido por autenticação JWT
 */
let IpLimitAdminController = (() => {
    let _classDecorators = [Controller('admin/ip-limit'), UseGuards(JwtAuthGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getGlobalStats_decorators;
    let _getIpStats_decorators;
    let _getBlockedIps_decorators;
    let _clearIp_decorators;
    let _blockIp_decorators;
    let _unblockIp_decorators;
    let _getBlockedHistory_decorators;
    let _resetDaily_decorators;
    var IpLimitAdminController = _classThis = class {
        constructor(ipLimitService) {
            this.ipLimitService = (__runInitializers(this, _instanceExtraInitializers), ipLimitService);
            this.logger = new Logger(IpLimitAdminController.name);
        }
        /**
         * GET /admin/ip-limit/stats
         * Obtém estatísticas globais do sistema de limites
         */
        async getGlobalStats() {
            this.logger.log(`[ADMIN] Getting global IP limit stats`);
            return await this.ipLimitService.getGlobalStats();
        }
        /**
         * GET /admin/ip-limit/ip/:ip
         * Obtém estatísticas de um IP específico
         */
        async getIpStats(ip) {
            this.logger.log(`[ADMIN] Getting stats for IP: ${ip}`);
            return await this.ipLimitService.getStats(ip);
        }
        /**
         * GET /admin/ip-limit/blocked
         * Lista todos os IPs bloqueados
         */
        async getBlockedIps() {
            this.logger.log(`[ADMIN] Getting blocked IPs`);
            return await this.ipLimitService.getBlockedIps();
        }
        /**
         * POST /admin/ip-limit/clear/:ip
         * Limpa o registro de um IP (reseta limites)
         */
        async clearIp(ip) {
            this.logger.log(`[ADMIN] Clearing IP: ${ip}`);
            await this.ipLimitService.clearIpLimit(ip);
            return { success: true, message: `IP ${ip} limpo com sucesso` };
        }
        /**
         * POST /admin/ip-limit/block/:ip
         * Bloqueia um IP permanentemente
         */
        async blockIp(ip, reason) {
            this.logger.warn(`[ADMIN] Blocking IP: ${ip}, reason: ${reason}`);
            await this.ipLimitService.blockIp(ip, reason);
            return { success: true, message: `IP ${ip} bloqueado permanentemente` };
        }
        /**
         * POST /admin/ip-limit/unblock/:ip
         * Desbloqueia um IP
         */
        async unblockIp(ip) {
            this.logger.log(`[ADMIN] Unblocking IP: ${ip}`);
            await this.ipLimitService.unblockIp(ip);
            return { success: true, message: `IP ${ip} desbloqueado com sucesso` };
        }
        /**
         * GET /admin/ip-limit/history/:ip
         * Obtém histórico de bloqueios de um IP
         */
        async getBlockedHistory(ip) {
            this.logger.log(`[ADMIN] Getting blocked history for IP: ${ip}`);
            return await this.ipLimitService.getBlockedHistory(ip);
        }
        /**
         * POST /admin/ip-limit/reset-daily
         * Reseta contadores diários de todos os IPs
         */
        async resetDaily() {
            this.logger.log(`[ADMIN] Resetting daily counts`);
            const count = await this.ipLimitService.resetDailyCounts();
            return { success: true, message: `Contadores diários resetados`, count };
        }
    };
    __setFunctionName(_classThis, "IpLimitAdminController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getGlobalStats_decorators = [Get('stats')];
        _getIpStats_decorators = [Get('ip/:ip')];
        _getBlockedIps_decorators = [Get('blocked')];
        _clearIp_decorators = [Post('clear/:ip')];
        _blockIp_decorators = [Post('block/:ip')];
        _unblockIp_decorators = [Post('unblock/:ip')];
        _getBlockedHistory_decorators = [Get('history/:ip')];
        _resetDaily_decorators = [Post('reset-daily')];
        __esDecorate(_classThis, null, _getGlobalStats_decorators, { kind: "method", name: "getGlobalStats", static: false, private: false, access: { has: obj => "getGlobalStats" in obj, get: obj => obj.getGlobalStats }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getIpStats_decorators, { kind: "method", name: "getIpStats", static: false, private: false, access: { has: obj => "getIpStats" in obj, get: obj => obj.getIpStats }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getBlockedIps_decorators, { kind: "method", name: "getBlockedIps", static: false, private: false, access: { has: obj => "getBlockedIps" in obj, get: obj => obj.getBlockedIps }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _clearIp_decorators, { kind: "method", name: "clearIp", static: false, private: false, access: { has: obj => "clearIp" in obj, get: obj => obj.clearIp }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _blockIp_decorators, { kind: "method", name: "blockIp", static: false, private: false, access: { has: obj => "blockIp" in obj, get: obj => obj.blockIp }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _unblockIp_decorators, { kind: "method", name: "unblockIp", static: false, private: false, access: { has: obj => "unblockIp" in obj, get: obj => obj.unblockIp }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getBlockedHistory_decorators, { kind: "method", name: "getBlockedHistory", static: false, private: false, access: { has: obj => "getBlockedHistory" in obj, get: obj => obj.getBlockedHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _resetDaily_decorators, { kind: "method", name: "resetDaily", static: false, private: false, access: { has: obj => "resetDaily" in obj, get: obj => obj.resetDaily }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        IpLimitAdminController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return IpLimitAdminController = _classThis;
})();
export { IpLimitAdminController };
