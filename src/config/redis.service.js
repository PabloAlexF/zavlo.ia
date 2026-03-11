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
import { createClient } from 'redis';
let RedisService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var RedisService = _classThis = class {
        constructor(configService) {
            this.configService = configService;
            this.isConnected = false;
            this.logger = new Logger(RedisService.name);
        }
        async onModuleInit() {
            const redisUrl = this.configService.get('REDIS_URL');
            if (!redisUrl) {
                this.logger.warn('Redis URL not configured. Cache disabled.');
                return;
            }
            try {
                this.client = createClient({
                    url: redisUrl,
                    password: this.configService.get('REDIS_PASSWORD'),
                });
                this.client.on('error', (err) => {
                    this.logger.error('Redis connection error:', err.message);
                    this.isConnected = false;
                });
                await this.client.connect();
                this.isConnected = true;
                this.logger.log('Redis connected successfully');
            }
            catch (error) {
                this.logger.error('Failed to connect to Redis:', error.message);
                this.isConnected = false;
            }
        }
        async get(key) {
            if (!this.isConnected)
                return null;
            return await this.client.get(key);
        }
        async set(key, value, ttl) {
            if (!this.isConnected)
                return;
            if (ttl) {
                await this.client.setEx(key, ttl, value);
            }
            else {
                await this.client.set(key, value);
            }
        }
        async del(key) {
            if (!this.isConnected)
                return;
            await this.client.del(key);
        }
        async hIncrBy(key, field, increment) {
            if (!this.isConnected)
                return 0;
            try {
                return await this.client.hIncrBy(key, field, increment);
            }
            catch (error) {
                this.logger.error(`Redis HINCRBY error: ${error.message}`);
                return 0;
            }
        }
        async hGet(key, field) {
            if (!this.isConnected)
                return null;
            try {
                return await this.client.hGet(key, field);
            }
            catch (error) {
                this.logger.error(`Redis HGET error: ${error.message}`);
                return null;
            }
        }
        async hGetAll(key) {
            if (!this.isConnected)
                return {};
            try {
                return await this.client.hGetAll(key);
            }
            catch (error) {
                this.logger.error(`Redis HGETALL error: ${error.message}`);
                return {};
            }
        }
        async hSet(key, field, value) {
            if (!this.isConnected)
                return;
            try {
                await this.client.hSet(key, field, value);
            }
            catch (error) {
                this.logger.error(`Redis HSET error: ${error.message}`);
            }
        }
        async hDel(key, ...fields) {
            if (!this.isConnected)
                return;
            try {
                for (const field of fields) {
                    await this.client.hDel(key, field);
                }
            }
            catch (error) {
                this.logger.error(`Redis HDEL error: ${error.message}`);
            }
        }
        async expire(key, seconds) {
            if (!this.isConnected)
                return;
            try {
                await this.client.expire(key, seconds);
            }
            catch (error) {
                this.logger.error(`Redis EXPIRE error: ${error.message}`);
            }
        }
        async exists(key) {
            if (!this.isConnected)
                return false;
            try {
                return (await this.client.exists(key)) === 1;
            }
            catch (error) {
                this.logger.error(`Redis EXISTS error: ${error.message}`);
                return false;
            }
        }
        async incr(key) {
            if (!this.isConnected)
                return 0;
            try {
                return await this.client.incr(key);
            }
            catch (error) {
                this.logger.error(`Redis INCR error: ${error.message}`);
                return 0;
            }
        }
        isReady() {
            return this.isConnected;
        }
    };
    __setFunctionName(_classThis, "RedisService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RedisService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RedisService = _classThis;
})();
export { RedisService };
