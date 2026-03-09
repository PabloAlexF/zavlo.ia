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
      // Usar searchQuery se disponível, caso contrário extrair da URL
      const searchQuery = alert.searchQuery || await this.extractSearchQuery(alert.productUrl);
      
      if (!searchQuery) {
        this.logger.warn(`Could not extract search query for alert ${alert.id}`);
        return;
      }
      
      // Buscar preço atual
      const newPrice = await this.fetchCurrentPrice(searchQuery);

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
   * Busca preço atual do produto usando Google Shopping
   * Usa cache para evitar custos excessivos de API
   */
  private async fetchCurrentPrice(searchQuery: string): Promise<number | null> {
    try {
      this.logger.log(`Fetching price for: ${searchQuery}`);
      
      const products = await this.googleShoppingService.search(searchQuery, 5);
      
      if (products && products.length > 0) {
        // Pegar o menor preço encontrado
        const lowestPrice = Math.min(...products.map(p => p.price || p.price));
        this.logger.log(`Found price: R$ ${lowestPrice}`);
        return lowestPrice;
      }
      
      this.logger.warn(`No products found for: ${searchQuery}`);
      return null;
    } catch (error) {
      this.logger.error(`Error fetching price: ${error.message}`);
      return null;
    }
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
