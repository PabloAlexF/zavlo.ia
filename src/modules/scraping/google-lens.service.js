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
let GoogleLensService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var GoogleLensService = _classThis = class {
        constructor(configService) {
            this.configService = configService;
            this.logger = new Logger(GoogleLensService.name);
            this.actorId = 'borderline~google-lens';
            this.apiToken = this.configService.get('APIFY_API_KEY');
            this.cloudinaryCloudName = this.configService.get('CLOUDINARY_CLOUD_NAME') || 'dj2nkf9od';
        }
        /**
         * Check if the input is a base64 data URL
         */
        isBase64DataUrl(url) {
            return url && url.startsWith('data:image/');
        }
        /**
         * Upload base64 image to Cloudinary using zavlo_preset (unsigned)
         */
        async uploadBase64ToCloudinary(base64Data) {
            const timestamp = Date.now();
            const response = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudinaryCloudName}/image/upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    file: base64Data,
                    upload_preset: 'zavlo_preset',
                    filename_override: `image_${timestamp}`,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`❌ Cloudinary upload failed: ${response.status} - ${errorText}`);
                throw new Error('Cloudinary upload failed');
            }
            const data = await response.json();
            this.logger.log(`✅ Image uploaded: ${data.secure_url}`);
            return data.secure_url;
        }
        /**
         * Main method to identify product from image
         * Accepts either HTTP/HTTPS URLs or base64 data URLs
         */
        async identifyProduct(imageUrl) {
            var _a, _b;
            try {
                this.logger.log(`Identificando produto na imagem: ${imageUrl === null || imageUrl === void 0 ? void 0 : imageUrl.substring(0, 100)}...`);
                if (!imageUrl) {
                    this.logger.error(`URL de imagem não fornecida`);
                    return {
                        productName: 'URL de imagem não fornecida',
                        confidence: 0,
                        results: []
                    };
                }
                // Handle base64 data URLs - upload to Cloudinary first
                let finalImageUrl = imageUrl;
                if (this.isBase64DataUrl(imageUrl)) {
                    this.logger.log(`📷 Detectada imagem base64, fazendo upload para Cloudinary...`);
                    finalImageUrl = await this.uploadBase64ToCloudinary(imageUrl);
                }
                else if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
                    // Not a valid URL and not base64
                    this.logger.error(`URL inválida: ${imageUrl}`);
                    return {
                        productName: 'URL de imagem inválida. Use uma URL pública (https://...) ou uma imagem base64',
                        confidence: 0,
                        results: []
                    };
                }
                this.logger.log(`🔍 Usando URL final para Google Lens: ${finalImageUrl === null || finalImageUrl === void 0 ? void 0 : finalImageUrl.substring(0, 100)}...`);
                const input = {
                    searchTypes: ['all'],
                    imageUrls: [{ url: finalImageUrl }],
                    language: 'pt-br',
                };
                this.logger.log(`Enviando para Apify: ${JSON.stringify(input)}`);
                const runResponse = await fetch(`https://api.apify.com/v2/acts/${this.actorId}/runs?token=${this.apiToken}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(input),
                });
                if (!runResponse.ok) {
                    const errorText = await runResponse.text();
                    this.logger.error(`Apify run error ${runResponse.status}: ${errorText}`);
                    throw new Error(`Apify run error: ${runResponse.status}`);
                }
                const runData = await runResponse.json();
                const runId = runData.data.id;
                this.logger.log(`Apify run started: ${runId}`);
                let finalResults = null;
                const maxAttempts = 60; // 2 minutos (60 * 2s)
                for (let i = 0; i < maxAttempts; i++) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    const statusResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${this.apiToken}`);
                    const statusData = await statusResponse.json();
                    if (i % 5 === 0) { // Log a cada 10 segundos
                        this.logger.log(`Run status [${i}/${maxAttempts}]: ${statusData.data.status}`);
                    }
                    if (statusData.data.status === 'SUCCEEDED') {
                        this.logger.log(`✅ Actor concluído após ${i * 2}s`);
                        const datasetResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${this.apiToken}`);
                        finalResults = await datasetResponse.json();
                        this.logger.log(`📦 Dataset items: ${(finalResults === null || finalResults === void 0 ? void 0 : finalResults.length) || 0}`);
                        break;
                    }
                    else if (statusData.data.status === 'FAILED' || statusData.data.status === 'ABORTED') {
                        this.logger.error(`❌ Actor failed: ${statusData.data.status}`);
                        throw new Error(`Actor ${statusData.data.status.toLowerCase()}`);
                    }
                }
                if (!finalResults) {
                    this.logger.error('⏱️ Timeout: Actor não concluiu em 2 minutos');
                    return { productName: 'Tempo limite excedido (2min)', confidence: 0, results: [] };
                }
                this.logger.log(`📊 Resultados recebidos: ${JSON.stringify(finalResults).substring(0, 800)}`);
                if (!finalResults || finalResults.length === 0) {
                    this.logger.warn('⚠️ Nenhum resultado retornado pelo Google Lens');
                    return { productName: 'Produto não identificado', confidence: 0, results: [] };
                }
                const firstResult = finalResults[0];
                let productName = 'Produto não identificado';
                // Extrair do campo 'all.aiPreview' (descrição gerada por IA)
                if ((_a = firstResult.all) === null || _a === void 0 ? void 0 : _a.aiPreview) {
                    productName = firstResult.all.aiPreview.split('\n')[0].trim();
                    productName = productName.replace(/^(Esta é uma|Este é um|Esta é|Este é)\s*/i, '');
                }
                else if (((_b = firstResult.all) === null || _b === void 0 ? void 0 : _b.results) && firstResult.all.results.length > 0) {
                    // Fallback: buscar título no primeiro resultado válido
                    const validResult = firstResult.all.results.find(r => {
                        var _a;
                        return ((_a = r.search) === null || _a === void 0 ? void 0 : _a.title) &&
                            !r.search.title.includes('Correspondências') &&
                            !r.search.title.includes('Política');
                    });
                    if (validResult) {
                        productName = validResult.search.title;
                    }
                }
                this.logger.log(`Produto identificado: ${productName}`);
                return { productName, confidence: 0.9, results: finalResults };
            }
            catch (error) {
                this.logger.error(`❌ Erro no Google Lens: ${error.message}`);
                // Provide more helpful error messages based on the error type
                if (error.message.includes('Cloudinary upload failed')) {
                    return {
                        productName: 'Erro ao processar imagem. Configure o CLOUDINARY_UPLOAD_PRESET no backend.',
                        confidence: 0,
                        results: []
                    };
                }
                return { productName: 'Erro ao identificar produto', confidence: 0, results: [] };
            }
        }
    };
    __setFunctionName(_classThis, "GoogleLensService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        GoogleLensService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return GoogleLensService = _classThis;
})();
export { GoogleLensService };
