import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from '@config/firebase.service';

interface NotificationData {
  userId: string;
  title: string;
  body: string;
  data?: any;
}

@Injectable()
export class NotificationsService {
  constructor(
    private configService: ConfigService,
    private firebaseService: FirebaseService,
  ) {}

  async sendPushNotification(notification: NotificationData) {
    try {
      const firestore = this.firebaseService.getFirestore();
      
      // Salvar notificação no banco
      await firestore.collection('notifications').add({
        userId: notification.userId,
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        read: false,
        createdAt: new Date(),
      });

      // TODO: Integrar com Expo Push Notifications ou FCM
      console.log('Notificação enviada:', notification);

      return { success: true };
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserNotifications(userId: string, limit = 20) {
    const firestore = this.firebaseService.getFirestore();
    const snapshot = await firestore
      .collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async markAsRead(notificationId: string) {
    const firestore = this.firebaseService.getFirestore();
    await firestore.collection('notifications').doc(notificationId).update({
      read: true,
      readAt: new Date(),
    });
  }

  async notifyNewProduct(userId: string, productTitle: string, productId: string) {
    return this.sendPushNotification({
      userId,
      title: 'Novo produto encontrado!',
      body: `${productTitle} está disponível`,
      data: { productId, type: 'new_product' },
    });
  }

  /**
   * Notifica usuário sobre queda de preço
   */
  async notifyPriceDrop(
    userId: string,
    productTitle: string,
    productUrl: string,
    oldPrice: number,
    newPrice: number,
    priceDropPercent: number,
  ) {
    const priceDrop = oldPrice - newPrice;
    
    return this.sendPushNotification({
      userId,
      title: '💰 Alerta de Preço!',
      body: `${productTitle} caiu de R$ ${oldPrice.toFixed(2)} para R$ ${newPrice.toFixed(2)} (-${priceDropPercent.toFixed(0)}%)`,
      data: { 
        productUrl, 
        oldPrice, 
        newPrice, 
        priceDropPercent,
        type: 'price_drop' 
      },
    });
  }
}
