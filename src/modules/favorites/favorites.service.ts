import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../../config/firebase.service';
import { PriceAlertsService } from '../price-alerts/price-alerts.service';

export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  productImage?: string;
  productUrl: string;
  source: string;
  priceAlertEnabled?: boolean;
  createdAt: Date;
}

@Injectable()
export class FavoritesService {
  private readonly logger = new Logger(FavoritesService.name);

  constructor(
    private firebaseService: FirebaseService,
    private priceAlertsService: PriceAlertsService,
  ) {}

  async addFavorite(userId: string, productData: any): Promise<Favorite> {
    this.logger.log(`Adicionando favorito para usuário: ${userId}`);
    this.logger.debug(`Dados recebidos: id=${productData.id}, title=${productData.title}, price=${productData.price}`);
    
    const favorite: Omit<Favorite, 'id'> = {
      userId,
      productId: productData.id,
      productTitle: productData.title,
      productPrice: productData.price,
      productImage: productData.image,
      productUrl: productData.url,
      source: productData.source,
      priceAlertEnabled: true, // Ativar alerta por padrão
      createdAt: new Date(),
    };

    try {
      const docRef = await this.firebaseService.getFirestore()
        .collection('favorites')
        .add(favorite);

      this.logger.log(`Favorito salvo com ID: ${docRef.id}`);
      
      // Criar alerta de preço automaticamente
      try {
        await this.priceAlertsService.createAlert(userId, {
          id: productData.id,
          title: productData.title,
          url: productData.url,
          price: productData.price,
          searchQuery: productData.title, // Usar título como termo de busca
        });
        this.logger.log(`✅ Alerta de preço criado automaticamente para: ${productData.title}`);
      } catch (alertError) {
        this.logger.warn(`⚠️ Não foi possível criar alerta de preço: ${alertError.message}`);
        // Não falhar a operação se o alerta não puder ser criado
      }
      
      return { id: docRef.id, ...favorite };
    } catch (error) {
      this.logger.error(`Erro ao salvar favorito: ${error.message}`);
      throw error;
    }
  }

  async removeFavorite(userId: string, favoriteId: string): Promise<void> {
    await this.firebaseService.getFirestore()
      .collection('favorites')
      .doc(favoriteId)
      .delete();
  }

  async getUserFavorites(userId: string): Promise<Favorite[]> {
    const snapshot = await this.firebaseService.getFirestore()
      .collection('favorites')
      .where('userId', '==', userId)
      .get();

    const favorites = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Favorite[];

    // Sort in memory instead of Firestore query
    return favorites.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async isFavorite(userId: string, productId: string): Promise<boolean> {
    const snapshot = await this.firebaseService.getFirestore()
      .collection('favorites')
      .where('userId', '==', userId)
      .where('productId', '==', productId)
      .get();

    return !snapshot.empty;
  }
}