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
let IpLimitService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var IpLimitService = _classThis = class {
        constructor(redisService) {
            this.redisService = redisService;
            this.logger = new Logger(IpLimitService.name);
            // Configuração padrão
            this.defaultConfig = {
                dailyLimit: 3, // 3 buscas por dia
                permanentLimit: 10, // 10 buscas permanentes no total
                dailyTtl: 86400, // 24 horas
                permanentTtl: 2592000, // 30 dias
            };
        }
        /* ============================================
           MÉTODOS SIMPLES (para não logados)
           1 busca permanente por IP
        ============================================ */
        /**
         * Verifica se o IP já usou a busca gratuita
         */
        async hasUsedFreeSearch(ip) {
            const key = `free_search:${ip}`;
            const used = await this.redisService.get(key);
            return used === 'true';
        }
        /**
         * Marca o IP como tendo usado a busca gratuita
         * Expira em 1 ano (permanente)
         */
        async markFreeSearchUsed(ip) {
            const key = `free_search:${ip}`;
            // 31536000 segundos = 1 ano
            await this.redisService.set(key, 'true', 31536000);
            this.logger.log(`[IP_LIMIT] IP ${ip} marcado como usado`);
        }
        /* ============================================
           VERIFICAÇÕES PRINCIPAIS (para admins)
        ============================================ */
        /**
         * Verifica se o IP pode fazer uma busca gratuita
         * Retorna: { allowed: boolean, reason?: string, stats?: IpLimitStats }
         */
        async checkLimit(ip) {
            const stats = await this.getStats(ip);
            // Verifica se IP está bloqueado permanentemente
            if (stats.isBlocked) {
                this.logger.warn(`[IP_LIMIT] IP ${ip} bloqueado permanentemente`);
                await this.logBlockedAttempt(ip, 'PERMANENT_BLOCK');
                return {
                    allowed: false,
                    reason: 'IP bloqueado permanentemente',
                    stats,
                    needsUpgrade: true,
                };
            }
            // Verifica limite diário
            if (stats.dailyCount >= this.defaultConfig.dailyLimit) {
                this.logger.warn(`[IP_LIMIT] IP ${ip} excedeu limite diário (${stats.dailyCount})`);
                await this.logBlockedAttempt(ip, 'DAILY_LIMIT_EXCEEDED');
                return {
                    allowed: false,
                    reason: `Limite diário excedido (${stats.dailyCount}/${this.defaultConfig.dailyLimit})`,
                    stats,
                    needsUpgrade: true,
                };
            }
            // Verifica limite permanente
            if (stats.permanentCount >= this.defaultConfig.permanentLimit) {
                this.logger.warn(`[IP_LIMIT] IP ${ip} excedeu limite permanente (${stats.permanentCount})`);
                await this.logBlockedAttempt(ip, 'PERMANENT_LIMIT_EXCEEDED');
                return {
                    allowed: false,
                    reason: `Limite permanente excedido (${stats.permanentCount}/${this.defaultConfig.permanentLimit})`,
                    stats,
                    needsUpgrade: true,
                };
            }
            return {
                allowed: true,
                stats,
            };
        }
        /**
         * Registra uma busca gratuita para o IP
         */
        async recordSearch(ip) {
            const dailyKey = `free_search:daily:${ip}`;
            const permanentKey = `free_search:permanent:${ip}`;
            const lastSeenKey = `free_search:last_seen:${ip}`;
            // Incrementa contador diário
            const dailyCount = await this.redisService.hIncrBy('free_search:daily_counts', ip, 1);
            // Define TTL diário se for primeira vez hoje
            if (dailyCount === 1) {
                await this.redisService.expire(dailyKey, this.defaultConfig.dailyTtl);
            }
            // Incrementa contador permanente
            const permanentCount = await this.redisService.hIncrBy('free_search:permanent_counts', ip, 1);
            // Define TTL permanente se for primeira vez
            if (permanentCount === 1) {
                await this.redisService.expire(permanentKey, this.defaultConfig.permanentTtl);
            }
            // Atualiza último acesso
            await this.redisService.set(lastSeenKey, new Date().toISOString(), this.defaultConfig.permanentTtl);
            this.logger.log(`[IP_LIMIT] IP ${ip} - daily: ${dailyCount}, permanent: ${permanentCount}`);
            return this.getStats(ip);
        }
        /* ============================================
           ESTATÍSTICAS E INFORMAÇÕES
        ============================================ */
        /**
         * Obtém estatísticas de um IP
         */
        async getStats(ip) {
            const dailyCount = Number(await this.redisService.hGet('free_search:daily_counts', ip) || 0);
            const permanentCount = Number(await this.redisService.hGet('free_search:permanent_counts', ip) || 0);
            const lastSeen = await this.redisService.get(`free_search:last_seen:${ip}`);
            const isBlocked = permanentCount >= this.defaultConfig.permanentLimit;
            return {
                ip,
                dailyCount: Number(dailyCount),
                permanentCount: Number(permanentCount),
                isBlocked,
                lastSeen: lastSeen || 'never',
            };
        }
        /**
         * Obtém lista de IPs bloqueados
         */
        async getBlockedIps() {
            // Obtém todos os IPs do contador permanente
            // Nota: implementação simplificada, em produção seria otimizado
            const blockedIps = [];
            // Buscar todos os IPs com contagem >= limite permanente
            // Isso é uma simplificação, idealmente usaria SCAN
            const allCounts = await this.redisService.hGetAll('free_search:permanent_counts');
            if (allCounts) {
                for (const [ip, count] of Object.entries(allCounts)) {
                    if (Number(count) >= this.defaultConfig.permanentLimit) {
                        const stats = await this.getStats(ip);
                        blockedIps.push(stats);
                    }
                }
            }
            return blockedIps;
        }
        /**
         * Obtém estatísticas globais do sistema
         */
        async getGlobalStats() {
            const permanentCounts = await this.redisService.hGetAll('free_search:permanent_counts');
            const dailyCounts = await this.redisService.hGetAll('free_search:daily_counts');
            const totalUniqueIps = permanentCounts ? Object.keys(permanentCounts).length : 0;
            let blockedIps = 0;
            let activeToday = 0;
            if (permanentCounts) {
                for (const [, count] of Object.entries(permanentCounts)) {
                    if (Number(count) >= this.defaultConfig.permanentLimit) {
                        blockedIps++;
                    }
                }
            }
            if (dailyCounts) {
                for (const [, count] of Object.entries(dailyCounts)) {
                    if (Number(count) > 0) {
                        activeToday++;
                    }
                }
            }
            return { totalUniqueIps, blockedIps, activeToday };
        }
        /* ============================================
           ADMINISTRAÇÃO
        ============================================ */
        /**
         * Limpa o registro de um IP (admin only)
         */
        async clearIpLimit(ip) {
            await this.redisService.hDel('free_search:daily_counts', ip);
            await this.redisService.hDel('free_search:permanent_counts', ip);
            await this.redisService.del(`free_search:last_seen:${ip}`);
            await this.redisService.del(`free_search:blocked_log:${ip}`);
            this.logger.log(`[IP_LIMIT] IP ${ip} limpo pelo admin`);
        }
        /**
         * Bloqueia um IP permanentemente (admin only)
         */
        async blockIp(ip, reason) {
            // Define contagem alta para bloquear permanentemente
            await this.redisService.hSet('free_search:permanent_counts', ip, String(this.defaultConfig.permanentLimit + 1));
            await this.redisService.set(`free_search:blocked_reason:${ip}`, reason || 'admin_blocked', 31536000);
            this.logger.warn(`[IP_LIMIT] IP ${ip} bloqueado pelo admin. Razão: ${reason}`);
        }
        /**
         * Desbloqueia um IP (admin only)
         */
        async unblockIp(ip) {
            await this.clearIpLimit(ip);
            this.logger.log(`[IP_LIMIT] IP ${ip} desbloqueado pelo admin`);
        }
        /**
         * Reseta contadores diários de todos os IPs
         */
        async resetDailyCounts() {
            // Em produção, isso seria feito com uma chave diferente por dia
            // Por simplicidade, aqui apenas logamos
            this.logger.log(`[IP_LIMIT] Reset diário solicitado`);
            return 0;
        }
        /* ============================================
           LOGGING E MONITORAMENTO
        ============================================ */
        /**
         * Registra tentativa bloqueada
         */
        async logBlockedAttempt(ip, reason) {
            const logKey = `free_search:blocked_log:${ip}`;
            const timestamp = new Date().toISOString();
            const existing = await this.redisService.get(logKey) || '[]';
            const logs = JSON.parse(existing);
            logs.push({ reason, timestamp });
            // Mantém apenas últimos 10 registros
            if (logs.length > 10) {
                logs.shift();
            }
            await this.redisService.set(logKey, JSON.stringify(logs), this.defaultConfig.permanentTtl);
        }
        /**
         * Obtém histórico de bloqueios de um IP
         */
        async getBlockedHistory(ip) {
            const logKey = `free_search:blocked_log:${ip}`;
            const logs = await this.redisService.get(logKey);
            return logs ? JSON.parse(logs) : [];
        }
    };
    __setFunctionName(_classThis, "IpLimitService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        IpLimitService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return IpLimitService = _classThis;
})();
export { IpLimitService };
