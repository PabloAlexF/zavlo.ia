import { Injectable } from '@nestjs/common';
import { FirebaseService } from '@config/firebase.service';
import { RedisService } from '@config/redis.service';

interface PriceComparison {
  productTitle: string;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  priceHistory: Array<{ date: Date; price: number; source: string }>;
  sources: Array<{ source: string; price: number; url: string }>;
}

@Injectable()
export class ComparisonsService {
  constructor(
    private firebaseService: FirebaseService,
    private redisService: RedisService,
  ) {}

  async compareProduct(productTitle: string): Promise<PriceComparison> {
    const cacheKey = `comparison:${productTitle}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const firestore = this.firebaseService.getFirestore();
    const snapshot = await firestore
      .collection('products')
      .where('title', '>=', productTitle)
      .where('title', '<=', productTitle + '\uf8ff')
      .limit(50)
      .get();

    const products = snapshot.docs.map(doc => doc.data());

    if (products.length === 0) {
      return null;
    }

    const prices = products.map(p => p.price);
    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const sources = products.map(p => ({
      source: p.source,
      price: p.price,
      url: p.sourceUrl,
    }));

    const comparison: PriceComparison = {
      productTitle,
      averagePrice: Math.round(averagePrice * 100) / 100,
      minPrice,
      maxPrice,
      priceHistory: [],
      sources,
    };

    await this.redisService.set(cacheKey, JSON.stringify(comparison), 3600);
    return comparison;
  }

  async trackPriceHistory(productId: string, price: number, source: string) {
    const firestore = this.firebaseService.getFirestore();
    await firestore.collection('price_history').add({
      productId,
      price,
      source,
      timestamp: new Date(),
    });
  }

  async getPriceHistory(productId: string, days = 30) {
    const firestore = this.firebaseService.getFirestore();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const snapshot = await firestore
      .collection('price_history')
      .where('productId', '==', productId)
      .where('timestamp', '>=', startDate)
      .orderBy('timestamp', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async getBestDeals(category?: string, limit = 10) {
    const firestore = this.firebaseService.getFirestore();
    let query = firestore.collection('products').orderBy('price', 'asc').limit(limit);

    if (category) {
      query = query.where('category', '==', category) as any;
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
}
