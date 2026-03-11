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
import { Controller, Post } from '@nestjs/common';
let AIController = (() => {
    let _classDecorators = [Controller('ai')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _classifyImage_decorators;
    let _classifyText_decorators;
    let _detectFraud_decorators;
    let _generateEmbedding_decorators;
    var AIController = _classThis = class {
        constructor(imageAIService, textAIService) {
            this.imageAIService = (__runInitializers(this, _instanceExtraInitializers), imageAIService);
            this.textAIService = textAIService;
        }
        async classifyImage(body) {
            return this.imageAIService.classifyImage(body.imageUrl);
        }
        async classifyText(body) {
            return this.textAIService.classifyText(body.text);
        }
        async detectFraud(body) {
            const isFraud = await this.textAIService.detectFraud(body.title, body.description, body.price);
            return { isFraud, confidence: isFraud ? 0.75 : 0.25 };
        }
        async generateEmbedding(body) {
            if (body.imageUrl) {
                return this.imageAIService.generateEmbedding(body.imageUrl);
            }
            if (body.text) {
                return this.textAIService.generateTextEmbedding(body.text);
            }
            return { error: 'Forneça text ou imageUrl' };
        }
    };
    __setFunctionName(_classThis, "AIController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _classifyImage_decorators = [Post('classify-image')];
        _classifyText_decorators = [Post('classify-text')];
        _detectFraud_decorators = [Post('detect-fraud')];
        _generateEmbedding_decorators = [Post('generate-embedding')];
        __esDecorate(_classThis, null, _classifyImage_decorators, { kind: "method", name: "classifyImage", static: false, private: false, access: { has: obj => "classifyImage" in obj, get: obj => obj.classifyImage }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _classifyText_decorators, { kind: "method", name: "classifyText", static: false, private: false, access: { has: obj => "classifyText" in obj, get: obj => obj.classifyText }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _detectFraud_decorators, { kind: "method", name: "detectFraud", static: false, private: false, access: { has: obj => "detectFraud" in obj, get: obj => obj.detectFraud }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _generateEmbedding_decorators, { kind: "method", name: "generateEmbedding", static: false, private: false, access: { has: obj => "generateEmbedding" in obj, get: obj => obj.generateEmbedding }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AIController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AIController = _classThis;
})();
export { AIController };
