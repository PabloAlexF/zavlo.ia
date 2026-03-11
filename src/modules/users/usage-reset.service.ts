import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FirebaseService } from '@config/firebase.service';

@Injectable()
export class UsageResetService {
  private readonly logger = new Logger(UsageResetService.name);

  constructor(private firebaseService: FirebaseService) {}

  // Reset diário à meia-noite (00:00)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetDailyUsage() {
    try {
      const firestore = this.firebaseService.getFirestore();
      const today = new Date().toISOString().split('T')[0];
      
      const usersSnapshot = await firestore.collection('users').get();
      let resetCount = 0;

      const batch = firestore.batch();

      usersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        
        // Reset apenas se não foi resetado hoje
        if (userData.lastUsageDate !== today) {
          batch.update(doc.ref, {
            textSearchesToday: 0,
            imageSearchesToday: 0,
            lastUsageDate: today,
            updatedAt: new Date(),
          });
          resetCount++;
        }
      });

      if (resetCount > 0) {
        await batch.commit();
        this.logger.log(`✅ Reset diário: ${resetCount} usuários`);
      }
    } catch (error) {
      this.logger.error('❌ Erro no reset diário:', error);
    }
  }

  // Reset mensal no dia 1 às 00:01
  @Cron('1 0 1 * *')
  async resetMonthlyUsage() {
    try {
      const firestore = this.firebaseService.getFirestore();
      const monthKey = new Date().toISOString().slice(0, 7);
      
      const usersSnapshot = await firestore.collection('users').get();
      let resetCount = 0;

      const batch = firestore.batch();

      usersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        
        // Reset apenas se não foi resetado este mês
        if (userData.lastMonthKey !== monthKey) {
          batch.update(doc.ref, {
            textSearchesThisMonth: 0,
            imageSearchesThisMonth: 0,
            lastMonthKey: monthKey,
            updatedAt: new Date(),
          });
          resetCount++;
        }
      });

      if (resetCount > 0) {
        await batch.commit();
        this.logger.log(`✅ Reset mensal: ${resetCount} usuários`);
      }
    } catch (error) {
      this.logger.error('❌ Erro no reset mensal:', error);
    }
  }
}