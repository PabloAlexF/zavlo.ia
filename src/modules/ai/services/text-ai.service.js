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
import axios from 'axios';
let TextAIService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TextAIService = _classThis = class {
        constructor(configService) {
            this.configService = configService;
            this.huggingFaceToken = this.configService.get('HUGGINGFACE_API_TOKEN');
        }
        async classifyText(text) {
            try {
                const keywords = this.extractKeywords(text);
                const category = this.detectCategory(text, keywords);
                return {
                    category,
                    confidence: 0.85,
                    keywords,
                    sentiment: 'neutral',
                };
            }
            catch (error) {
                console.error('Erro na classificação de texto:', error);
                return {
                    category: 'outros',
                    confidence: 0,
                    keywords: [],
                };
            }
        }
        async generateTextEmbedding(text) {
            try {
                const response = await axios.post('https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2', { inputs: text }, {
                    headers: {
                        Authorization: `Bearer ${this.huggingFaceToken}`,
                    },
                });
                return response.data;
            }
            catch (error) {
                console.error('Erro ao gerar embedding de texto:', error);
                return [];
            }
        }
        async detectFraud(title, description, price) {
            // Detecção simples de fraude
            const suspiciousKeywords = [
                'urgente', 'imperdível', 'última chance', 'ganhe dinheiro',
                'trabalhe em casa', 'renda extra garantida'
            ];
            const text = `${title} ${description}`.toLowerCase();
            const hasSuspiciousWords = suspiciousKeywords.some(keyword => text.includes(keyword));
            // Preço muito baixo pode ser suspeito
            const isSuspiciousPrice = price < 10;
            return hasSuspiciousWords || isSuspiciousPrice;
        }
        extractKeywords(text) {
            const stopWords = ['de', 'da', 'do', 'em', 'para', 'com', 'por', 'o', 'a', 'os', 'as'];
            const words = text
                .toLowerCase()
                .replace(/[^\w\sáàâãéèêíïóôõöúçñ]/g, '')
                .split(/\s+/)
                .filter(word => word.length > 2 && !stopWords.includes(word));
            // Retornar palavras únicas
            return [...new Set(words)].slice(0, 10);
        }
        detectCategory(text, keywords) {
            const categoryPatterns = {
                eletronicos: ['celular', 'iphone', 'samsung', 'tv', 'notebook', 'computador', 'tablet', 'fone', 'geladeira'],
                veiculos: ['carro', 'moto', 'caminhão', 'veículo', 'honda', 'ford', 'chevrolet', 'volkswagen'],
                imoveis: ['casa', 'apartamento', 'terreno', 'imóvel', 'aluguel', 'venda', 'quarto'],
                moveis: ['sofá', 'mesa', 'cadeira', 'armário', 'cama', 'guarda-roupa', 'estante'],
                moda: ['roupa', 'camisa', 'calça', 'vestido', 'sapato', 'tênis', 'bolsa'],
                esportes: ['bicicleta', 'bike', 'academia', 'futebol', 'tênis', 'corrida'],
                livros: ['livro', 'revista', 'apostila', 'curso'],
                agro: ['fazenda', 'sítio', 'chácara', 'trator', 'gado', 'plantação'],
            };
            const lowerText = text.toLowerCase();
            for (const [category, patterns] of Object.entries(categoryPatterns)) {
                if (patterns.some(pattern => lowerText.includes(pattern) || keywords.includes(pattern))) {
                    return category;
                }
            }
            return 'outros';
        }
    };
    __setFunctionName(_classThis, "TextAIService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TextAIService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TextAIService = _classThis;
})();
export { TextAIService };
