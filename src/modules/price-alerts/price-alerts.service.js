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
let PriceAlertsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _checkPriceAlerts_decorators;
    var PriceAlertsService = _classThis = class {
        constructor(firebaseService, notificationsService, googleShoppingService) {
            this.firebaseService = (__runInitializers(this, _instanceExtraInitializers), firebaseService);
            this.notificationsService = notificationsService;
            this.googleShoppingService = googleShoppingService;
            this.logger = new Logger(PriceAlertsService.name);
        }
        async createAlert(userId, productData) {
            // Gerar searchQuery a partir do título do produto
            const searchQuery = productData.searchQuery ||
                (productData.title ? productData.title.replace(/[^\w\s]/gi, '').trim() : '');
            const alertData = {
                userId,
                productId: productData.id || productData.url,
                productTitle: productData.title,
                productUrl: productData.url,
                searchQuery,
                currentPrice: productData.price,
                targetPrice: productData.targetPrice,
                lastCheckedPrice: productData.price,
                lastCheckedAt: new Date(),
                isActive: true,
                createdAt: new Date(),
            };
            const firestore = this.firebaseService.getFirestore();
            const docRef = await firestore
                .collection('price_alerts')
                .add(alertData);
            this.logger.log(`Alert created: ${docRef.id} for user ${userId}`);
            return Object.assign({ id: docRef.id }, alertData);
        }
        async getUserAlerts(userId) {
            const firestore = this.firebaseService.getFirestore();
            const snapshot = await firestore
                .collection('price_alerts')
                .where('userId', '==', userId)
                .where('isActive', '==', true)
                .get();
            return snapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        }
        async deleteAlert(alertId, userId) {
            var _a;
            const firestore = this.firebaseService.getFirestore();
            const docRef = firestore.collection('price_alerts').doc(alertId);
            const doc = await docRef.get();
            if (!doc.exists || ((_a = doc.data()) === null || _a === void 0 ? void 0 : _a.userId) !== userId) {
                throw new Error('Alert not found or unauthorized');
            }
            await docRef.update({ isActive: false });
            this.logger.log(`Alert deleted: ${alertId}`);
        }
        async checkPriceAlerts() {
            this.logger.log('Starting price alerts check...');
            try {
                const firestore = this.firebaseService.getFirestore();
                const snapshot = await firestore
                    .collection('price_alerts')
                    .where('isActive', '==', true)
                    .get();
                const alerts = snapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
                this.logger.log(`Found ${alerts.length} active alerts`);
                for (const alert of alerts) {
                    await this.checkSingleAlert(alert);
                    await new Promise((resolve) => setTimeout(resolve, 2000)); // Rate limiting
                }
                this.logger.log('Price alerts check completed');
            }
            catch (error) {
                this.logger.error('Error checking price alerts:', error);
            }
        }
        async checkSingleAlert(alert) {
            try {
                // Buscar preço atual (usa scraping direto primeiro, Apify como fallback)
                const newPrice = await this.fetchCurrentPrice(alert);
                if (!newPrice)
                    return;
                const priceDrop = alert.lastCheckedPrice - newPrice;
                const priceDropPercent = (priceDrop / alert.lastCheckedPrice) * 100;
                // Atualizar último preço verificado
                const firestore = this.firebaseService.getFirestore();
                await firestore
                    .collection('price_alerts')
                    .doc(alert.id)
                    .update({
                    lastCheckedPrice: newPrice,
                    lastCheckedAt: new Date(),
                });
                // Notificar se preço caiu significativamente ou atingiu target
                const shouldNotify = (alert.targetPrice && newPrice <= alert.targetPrice) ||
                    priceDropPercent >= 10;
                if (shouldNotify && priceDrop > 0) {
                    await this.notificationsService.notifyPriceDrop(alert.userId, alert.productTitle, alert.productUrl, alert.lastCheckedPrice, newPrice, priceDropPercent);
                    this.logger.log(`Price drop notification sent for alert ${alert.id}: ${priceDropPercent.toFixed(0)}% drop`);
                }
            }
            catch (error) {
                this.logger.error(`Error checking alert ${alert.id}:`, error);
            }
        }
        /**
         * Extrai termo de busca da URL do produto
         */
        async extractSearchQuery(url) {
            try {
                const urlParts = url.split('/');
                const productIdentifier = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
                let searchQuery = decodeURIComponent(productIdentifier);
                searchQuery = searchQuery.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
                return searchQuery || null;
            }
            catch (_a) {
                return null;
            }
        }
        /**
         * Busca preço atual do produto
         * OTIMIZAÇÃO: Usa scraping direto da URL original quando possível
         * Só usa Apify/Google Shopping como fallback
         */
        async fetchCurrentPrice(alert) {
            try {
                // 1. TENTAR SCRAPING DIRETO DA URL ORIGINAL (GRÁTIS)
                if (alert.productUrl) {
                    const directPrice = await this.scrapePriceFromUrl(alert.productUrl);
                    if (directPrice) {
                        this.logger.log(`✅ Preço obtido via scraping direto (GRÁTIS): R$ ${directPrice}`);
                        return directPrice;
                    }
                }
                // 2. FALLBACK: Usar Google Shopping apenas se scraping direto falhar
                this.logger.warn(`⚠️ Scraping direto falhou, usando Google Shopping (PAGO)`);
                const searchQuery = alert.searchQuery || await this.extractSearchQuery(alert.productUrl);
                if (!searchQuery) {
                    this.logger.warn(`Could not extract search query for alert ${alert.id}`);
                    return null;
                }
                const products = await this.googleShoppingService.search(searchQuery, 5);
                if (products && products.length > 0) {
                    const lowestPrice = Math.min(...products.map(p => p.price || p.price));
                    this.logger.log(`Found price via Google Shopping: R$ ${lowestPrice}`);
                    return lowestPrice;
                }
                return null;
            }
            catch (error) {
                this.logger.error(`Error fetching price: ${error.message}`);
                return null;
            }
        }
        /**
         * Scraping direto da URL do produto (GRÁTIS - sem usar Apify)
         * Suporta: OLX, Mercado Livre, Amazon, etc.
         */
        async scrapePriceFromUrl(url) {
            try {
                const axios = require('axios');
                const cheerio = require('cheerio');
                // Headers para simular navegador
                const headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml',
                    'Accept-Language': 'pt-BR,pt;q=0.9',
                };
                const response = await axios.get(url, { headers, timeout: 10000 });
                const $ = cheerio.load(response.data);
                // Detectar marketplace e extrair preço
                if (url.includes('olx.com.br')) {
                    return this.extractOlxPrice($);
                }
                else if (url.includes('mercadolivre.com.br') || url.includes('mercadolibre.com')) {
                    return this.extractMercadoLivrePrice($);
                }
                else if (url.includes('amazon.com.br')) {
                    return this.extractAmazonPrice($);
                }
                else if (url.includes('enjoei.com.br')) {
                    return this.extractEnjoeiPrice($);
                }
                else if (url.includes('shopee.com.br')) {
                    return this.extractShopeePrice($);
                }
                // Fallback: tentar seletores genéricos
                return this.extractGenericPrice($);
            }
            catch (error) {
                this.logger.debug(`Scraping direto falhou para ${url}: ${error.message}`);
                return null;
            }
        }
        extractOlxPrice($) {
            try {
                const priceText = $('h2[data-testid="ad-price"]').text() ||
                    $('.price-tag').text() ||
                    $('[data-ds-component="DS-Text"]').first().text();
                return this.parsePrice(priceText);
            }
            catch (_a) {
                return null;
            }
        }
        extractMercadoLivrePrice($) {
            try {
                const priceText = $('.price-tag-fraction').text() ||
                    $('[class*="price"]').first().text() ||
                    $('meta[property="product:price:amount"]').attr('content');
                return this.parsePrice(priceText);
            }
            catch (_a) {
                return null;
            }
        }
        extractAmazonPrice($) {
            try {
                const priceText = $('.a-price-whole').first().text() ||
                    $('#priceblock_ourprice').text() ||
                    $('#priceblock_dealprice').text();
                return this.parsePrice(priceText);
            }
            catch (_a) {
                return null;
            }
        }
        extractEnjoeiPrice($) {
            try {
                const priceText = $('[data-testid="product-price"]').text() ||
                    $('.product-price').text();
                return this.parsePrice(priceText);
            }
            catch (_a) {
                return null;
            }
        }
        extractShopeePrice($) {
            try {
                const priceText = $('[class*="price"]').first().text();
                return this.parsePrice(priceText);
            }
            catch (_a) {
                return null;
            }
        }
        extractGenericPrice($) {
            try {
                // Tentar meta tags
                const metaPrice = $('meta[property="product:price:amount"]').attr('content') ||
                    $('meta[property="og:price:amount"]').attr('content');
                if (metaPrice)
                    return this.parsePrice(metaPrice);
                // Tentar seletores comuns
                const selectors = [
                    '[class*="price"]',
                    '[id*="price"]',
                    '[data-testid*="price"]',
                    '.product-price',
                    '.price-tag',
                ];
                for (const selector of selectors) {
                    const text = $(selector).first().text();
                    const price = this.parsePrice(text);
                    if (price)
                        return price;
                }
                return null;
            }
            catch (_a) {
                return null;
            }
        }
        parsePrice(text) {
            if (!text)
                return null;
            // Remove tudo exceto números, vírgula e ponto
            const cleaned = text.replace(/[^0-9,.]/g, '');
            // Converte para número
            const price = parseFloat(cleaned.replace(',', '.'));
            return isNaN(price) ? null : price;
        }
        async getAlertStats(userId) {
            const alerts = await this.getUserAlerts(userId);
            return {
                total: alerts.length,
                active: alerts.filter((a) => a.isActive).length,
                withTarget: alerts.filter((a) => a.targetPrice).length,
            };
        }
    };
    __setFunctionName(_classThis, "PriceAlertsService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _checkPriceAlerts_decorators = [Cron(CronExpression.EVERY_DAY_AT_8AM)];
        __esDecorate(_classThis, null, _checkPriceAlerts_decorators, { kind: "method", name: "checkPriceAlerts", static: false, private: false, access: { has: obj => "checkPriceAlerts" in obj, get: obj => obj.checkPriceAlerts }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PriceAlertsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PriceAlertsService = _classThis;
})();
export { PriceAlertsService };
