import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FirebaseService } from '@config/firebase.service';
import { PlanType } from '@shared/plans.constants';

@Injectable()
export class PlanExpirationService {
  private readonly logger = new Logger(PlanExpirationService.name);

  constructor(private firebaseService: FirebaseService) {}

  /**
   * Verifica planos expirados todos os dias à meia-noite
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiredPlans() {
    this.logger.log('🔍 [CRON] Checking for expired plans...');
    
    try {
      const firestore = this.firebaseService.getFirestore();
      const now = new Date();
      
      // Buscar usuários com planos que expiraram
      const usersSnapshot = await firestore
        .collection('users')
        .where('planExpiresAt', '<=', now)
        .where('plan', '!=', PlanType.FREE)
        .get();

      if (usersSnapshot.empty) {
        this.logger.log('✅ [CRON] No expired plans found');
        return;
      }

      this.logger.log(`⚠️ [CRON] Found ${usersSnapshot.size} expired plans`);

      // Processar cada usuário com plano expirado
      for (const doc of usersSnapshot.docs) {
        const userId = doc.id;
        const userData = doc.data();
        
        this.logger.log(`📋 [CRON] Processing user ${userId} - Plan: ${userData.plan}`);
        
        // Downgrade para plano FREE
        await firestore.collection('users').doc(userId).update({
          plan: PlanType.FREE,
          billingCycle: null,
          planStartedAt: null,
          planExpiresAt: null,
          updatedAt: new Date(),
        });
        
        this.logger.log(`✅ [CRON] User ${userId} downgraded to FREE plan`);
        
        // TODO: Enviar email de notificação
        // await this.emailService.sendPlanExpiredNotification(userId, userData.email);
      }

      this.logger.log(`✅ [CRON] Processed ${usersSnapshot.size} expired plans`);
    } catch (error) {
      this.logger.error('❌ [CRON] Error checking expired plans:', error);
    }
  }

  /**
   * Notifica usuários 3 dias antes do plano expirar
   */
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async notifyExpiringPlans() {
    this.logger.log('🔔 [CRON] Checking for expiring plans...');
    
    try {
      const firestore = this.firebaseService.getFirestore();
      const now = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      // Buscar usuários com planos que expiram em 3 dias
      const usersSnapshot = await firestore
        .collection('users')
        .where('planExpiresAt', '>=', now)
        .where('planExpiresAt', '<=', threeDaysFromNow)
        .where('plan', '!=', PlanType.FREE)
        .get();

      if (usersSnapshot.empty) {
        this.logger.log('✅ [CRON] No expiring plans found');
        return;
      }

      this.logger.log(`⚠️ [CRON] Found ${usersSnapshot.size} expiring plans`);

      for (const doc of usersSnapshot.docs) {
        const userId = doc.id;
        const userData = doc.data();
        const expiresAt = userData.planExpiresAt.toDate();
        const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        this.logger.log(`📧 [CRON] Notifying user ${userId} - ${daysLeft} days left`);
        
        // TODO: Enviar email de aviso
        // await this.emailService.sendPlanExpiringNotification(userId, userData.email, daysLeft);
      }

      this.logger.log(`✅ [CRON] Notified ${usersSnapshot.size} users`);
    } catch (error) {
      this.logger.error('❌ [CRON] Error notifying expiring plans:', error);
    }
  }

  /**
   * Método manual para verificar status do plano de um usuário
   */
  async checkUserPlanStatus(userId: string): Promise<{
    isExpired: boolean;
    daysLeft: number | null;
    message: string;
  }> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const userDoc = await firestore.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return {
          isExpired: false,
          daysLeft: null,
          message: 'Usuário não encontrado',
        };
      }

      const userData = userDoc.data();
      const plan = userData?.plan || PlanType.FREE;
      
      // Plano FREE não expira
      if (plan === PlanType.FREE) {
        return {
          isExpired: false,
          daysLeft: null,
          message: 'Plano gratuito não expira',
        };
      }

      const planExpiresAt = userData?.planExpiresAt?.toDate();
      
      if (!planExpiresAt) {
        return {
          isExpired: false,
          daysLeft: null,
          message: 'Data de expiração não definida',
        };
      }

      const now = new Date();
      const daysLeft = Math.ceil((planExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft <= 0) {
        return {
          isExpired: true,
          daysLeft: 0,
          message: 'Seu plano expirou. Renove para continuar aproveitando os benefícios!',
        };
      } else if (daysLeft <= 3) {
        return {
          isExpired: false,
          daysLeft,
          message: `Seu plano expira em ${daysLeft} dia(s). Renove agora para não perder acesso!`,
        };
      } else if (daysLeft <= 7) {
        return {
          isExpired: false,
          daysLeft,
          message: `Seu plano expira em ${daysLeft} dias.`,
        };
      } else {
        return {
          isExpired: false,
          daysLeft,
          message: `Seu plano está ativo por mais ${daysLeft} dias.`,
        };
      }
    } catch (error) {
      this.logger.error('❌ Error checking plan status:', error);
      throw error;
    }
  }
}
