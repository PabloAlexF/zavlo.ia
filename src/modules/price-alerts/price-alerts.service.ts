import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FirebaseService } from '@config/firebase.service';
import { NotificationsService } from '../notifications/notifications.service';
import { GoogleShoppingService } from '../scraping/google-shopping.service';

interface PriceAlert {
  id: string;
  userId: string;
  productId: string;
  productTitle: string;
  productUrl: string;
  searchQuery?: string; // termo de busca salvo para facilitar verificação
  currentPrice: number;
  targetPrice?: number;
  lastCheckedPrice: number;
  lastCheckedAt: Date;
  isActive: boolean;
  createdAt: Date;
}

@Injectable()
export class PriceAlertsService {
  private readonly logger = new Logger(PriceAlertsService.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly notificationsService: NotificationsService,
    private readonly googleShoppingService: GoogleShoppingService,
  ) {}

  async createAlert(userId: string, productData: any): Promise<PriceAlert> {
    // Gerar searchQuery a partir do título do produto
    const searchQuery = productData.searchQuery || 
      (productData.title ? productData.title.replace(/[^\w\s]/gi, '').trim() : '');
    
    const alertData: Omit<PriceAlert, 'id'> = {
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

    return { id: docRef.id, ...alertData };
  }

  async getUserAlerts(userId: string): Promise<PriceAlert[]> {
    const firestore = this.firebaseService.getFirestore();
    const snapshot = await firestore
      .collection('price_alerts')
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PriceAlert[];
  }

  async deleteAlert(alertId: string, userId: string): Promise<void> {
    const firestore = this.firebaseService.getFirestore();
    const docRef = firestore.collection('price_alerts').doc(alertId);
    const doc = await docRef.get();

    if (!doc.exists || doc.data()?.userId !== userId) {
      throw new Error('Alert not found or unauthorized');
    }

    await docRef.update({ isActive: false });
    this.logger.log(`Alert deleted: ${alertId}`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkPriceAlerts() {
    this.logger.log('Starting price alerts check...');

    try {
      const firestore = this.firebaseService.getFirestore();
      const snapshot = await firestore
        .collection('price_alerts')
        .where('isActive', '==', true)
        .get();

      const alerts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PriceAlert[];

      this.logger.log(`Found ${alerts.length} active alerts`);

      for (const alert of alerts) {
        await this.checkSingleAlert(alert);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Rate limiting
      }

      this.logger.log('Price alerts check completed');
    } catch (error) {
      this.logger.error('Error checking price alerts:', error);
    }
  }

  private async checkSingleAlert(alert: PriceAlert) {
    try {
      // Buscar preço atual (usa scraping direto primeiro, Apify como fallback)
      const newPrice = await this.fetchCurrentPrice(alert);

      if (!newPrice) return;

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
      const shouldNotify =
        (alert.targetPrice && newPrice <= alert.targetPrice) ||
        priceDropPercent >= 10;

      if (shouldNotify && priceDrop > 0) {
        await this.notificationsService.notifyPriceDrop(
          alert.userId,
          alert.productTitle,
          alert.productUrl,
          alert.lastCheckedPrice,
          newPrice,
          priceDropPercent,
        );

        this.logger.log(
          `Price drop notification sent for alert ${alert.id}: ${priceDropPercent.toFixed(0)}% drop`,
        );
      }
    } catch (error) {
      this.logger.error(`Error checking alert ${alert.id}:`, error);
    }
  }
  
  /**
   * Extrai termo de busca da URL do produto
   */
  private async extractSearchQuery(url: string): Promise<string | null> {
    try {
      const urlParts = url.split('/');
      const productIdentifier = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
      let searchQuery = decodeURIComponent(productIdentifier);
      searchQuery = searchQuery.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
      return searchQuery || null;
    } catch {
      return null;
    }
  }

  /**
   * Busca preço atual do produto
   * OTIMIZAÇÃO: Usa scraping direto da URL original quando possível
   * Só usa Apify/Google Shopping como fallback
   */
  private async fetchCurrentPrice(alert: PriceAlert): Promise<number | null> {
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
    } catch (error) {
      this.logger.error(`Error fetching price: ${error.message}`);
      return null;
    }
  }

  /**
   * Scraping direto da URL do produto (GRÁTIS - sem usar Apify)
   * Suporta: OLX, Mercado Livre, Amazon, etc.
   */
  private async scrapePriceFromUrl(url: string): Promise<number | null> {
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
      } else if (url.includes('mercadolivre.com.br') || url.includes('mercadolibre.com')) {
        return this.extractMercadoLivrePrice($);
      } else if (url.includes('amazon.com.br')) {
        return this.extractAmazonPrice($);
      } else if (url.includes('enjoei.com.br')) {
        return this.extractEnjoeiPrice($);
      } else if (url.includes('shopee.com.br')) {
        return this.extractShopeePrice($);
      }
      
      // Fallback: tentar seletores genéricos
      return this.extractGenericPrice($);
      
    } catch (error) {
      this.logger.debug(`Scraping direto falhou para ${url}: ${error.message}`);
      return null;
    }
  }

  private extractOlxPrice($: any): number | null {
    try {
      const priceText = $('h2[data-testid="ad-price"]').text() ||
                       $('.price-tag').text() ||
                       $('[data-ds-component="DS-Text"]').first().text();
      return this.parsePrice(priceText);
    } catch { return null; }
  }

  private extractMercadoLivrePrice($: any): number | null {
    try {
      const priceText = $('.price-tag-fraction').text() ||
                       $('[class*="price"]').first().text() ||
                       $('meta[property="product:price:amount"]').attr('content');
      return this.parsePrice(priceText);
    } catch { return null; }
  }

  private extractAmazonPrice($: any): number | null {
    try {
      const priceText = $('.a-price-whole').first().text() ||
                       $('#priceblock_ourprice').text() ||
                       $('#priceblock_dealprice').text();
      return this.parsePrice(priceText);
    } catch { return null; }
  }

  private extractEnjoeiPrice($: any): number | null {
    try {
      const priceText = $('[data-testid="product-price"]').text() ||
                       $('.product-price').text();
      return this.parsePrice(priceText);
    } catch { return null; }
  }

  private extractShopeePrice($: any): number | null {
    try {
      const priceText = $('[class*="price"]').first().text();
      return this.parsePrice(priceText);
    } catch { return null; }
  }

  private extractGenericPrice($: any): number | null {
    try {
      // Tentar meta tags
      const metaPrice = $('meta[property="product:price:amount"]').attr('content') ||
                       $('meta[property="og:price:amount"]').attr('content');
      if (metaPrice) return this.parsePrice(metaPrice);
      
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
        if (price) return price;
      }
      
      return null;
    } catch { return null; }
  }

  private parsePrice(text: string): number | null {
    if (!text) return null;
    
    // Remove tudo exceto números, vírgula e ponto
    const cleaned = text.replace(/[^0-9,.]/g, '');
    
    // Converte para número
    const price = parseFloat(cleaned.replace(',', '.'));
    
    return isNaN(price) ? null : price;
  }

  async getAlertStats(userId: string) {
    const alerts = await this.getUserAlerts(userId);

    return {
      total: alerts.length,
      active: alerts.filter((a) => a.isActive).length,
      withTarget: alerts.filter((a) => a.targetPrice).length,
    };
  }
}
