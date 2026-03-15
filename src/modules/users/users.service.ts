import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { FirebaseService } from '@config/firebase.service';
import { PlanType, PLAN_LIMITS } from '@shared/plans.constants';
import { User } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(private firebaseService: FirebaseService) {}

  async findById(userId: string): Promise<User | null> {
    const logger = new Logger(UsersService.name);
    const firestore = this.firebaseService.getFirestore();
    const userDoc = await firestore.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      logger.warn(`🔍 [USER DEBUG] User ${userId} not found`);
      return null;
    }

    const userData = userDoc.data();
    delete userData.password;
    
    logger.log(`🔍 [USER DEBUG] Found user ${userId}: credits=${userData.credits}, plan=${userData.plan}, freeTrialUsed=${userData.freeTrialUsed}`);

    return { id: userDoc.id, ...userData } as User;
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string; location?: { cep?: string; city?: string; state?: string } }) {
    const firestore = this.firebaseService.getFirestore();
    await firestore.collection('users').doc(userId).update({
      ...data,
      updatedAt: new Date(),
    });

    return this.findById(userId);
  }

  async updatePlan(userId: string, plan: PlanType, billingCycle: 'monthly' | 'yearly'): Promise<User | null> {
    const logger = new Logger(UsersService.name);
    
    logger.log(`💾 [DB] Atualizando plano do usuário ${userId} para: ${plan}`);
    
    const firestore = this.firebaseService.getFirestore();
    const now = new Date();
    const expiresAt = new Date();
    
    if (billingCycle === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    try {
      await firestore.collection('users').doc(userId).update({
        plan,
        billingCycle,
        planStartedAt: now,
        planExpiresAt: expiresAt,
        updatedAt: now,
      });
      
      logger.log(`✅ [DB] Plano atualizado no Firebase com sucesso`);
      
      const updatedUser = await this.findById(userId);
      logger.log(`🔍 [DB] Usuário recarregado: plano=${updatedUser?.plan}`);
      
      return updatedUser;
    } catch (error) {
      logger.error(`❌ [DB] Erro ao atualizar plano no Firebase: ${error.message}`);
      throw error;
    }
  }

  async addCredits(userId: string, credits: number) {
    const firestore = this.firebaseService.getFirestore();
    const userDoc = await firestore.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new BadRequestException('User not found');
    }

    const currentCredits = userDoc.data()?.credits || 0;
    
    await firestore.collection('users').doc(userId).update({
      credits: currentCredits + credits,
      updatedAt: new Date(),
    });

    return this.findById(userId);
  }

  async setCredits(userId: string, credits: number) {
    const firestore = this.firebaseService.getFirestore();
    const userDoc = await firestore.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new BadRequestException('User not found');
    }
    
    await firestore.collection('users').doc(userId).update({
      credits,
      updatedAt: new Date(),
    });

    return this.findById(userId);
  }

  async checkUsageLimit(userId: string, type: 'text' | 'image'): Promise<boolean> {
    const firestore = this.firebaseService.getFirestore();
    const userDoc = await firestore.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return false;
    }

    const userData = userDoc.data();
    const plan = userData?.plan || PlanType.FREE;
    const limits = PLAN_LIMITS[plan];
    
    const today = new Date().toISOString().split('T')[0];
    const monthKey = new Date().toISOString().slice(0, 7);
    const usageKey = type === 'text' ? 'textSearchesToday' : 'imageSearchesToday';
    const monthlyUsageKey = type === 'text' ? 'textSearchesThisMonth' : 'imageSearchesThisMonth';
    const lastUsageDate = userData?.lastUsageDate;
    const lastMonthKey = userData?.lastMonthKey;
    
    let currentUsage = userData?.[usageKey] || 0;
    let monthlyUsage = userData?.[monthlyUsageKey] || 0;
    
    // RESET AUTOMÁTICO - Dia mudou
    if (lastUsageDate !== today) {
      currentUsage = 0;
      await firestore.collection('users').doc(userId).update({
        [usageKey]: 0,
        lastUsageDate: today,
        updatedAt: new Date(),
      });
    }
    
    // RESET AUTOMÁTICO - Mês mudou
    if (lastMonthKey !== monthKey) {
      monthlyUsage = 0;
      await firestore.collection('users').doc(userId).update({
        [monthlyUsageKey]: 0,
        lastMonthKey: monthKey,
        updatedAt: new Date(),
      });
    }
    
    const dailyLimit = type === 'text' ? limits.textSearchesPerDay : limits.imageSearchesPerDay;
    
    // Plano ilimitado
    if (dailyLimit === -1) return true;
    
    // Plano com limite mensal (FREE)
    if (dailyLimit === 0) {
      const monthlyLimit = type === 'text' ? limits.textSearchesPerMonth : limits.imageSearchesPerMonth;
      return monthlyUsage < (monthlyLimit || 0);
    }
    
    // Plano com limite diário
    return currentUsage < dailyLimit;
  }

  async incrementUsage(userId: string, type: 'text' | 'image') {
    const firestore = this.firebaseService.getFirestore();
    const userDoc = await firestore.collection('users').doc(userId).get();
    
    if (!userDoc.exists) return;

    const userData = userDoc.data();
    const today = new Date().toISOString().split('T')[0];
    const monthKey = new Date().toISOString().slice(0, 7);
    const lastUsageDate = userData?.lastUsageDate;
    const lastMonthKey = userData?.lastMonthKey;
    
    const usageKey = type === 'text' ? 'textSearchesToday' : 'imageSearchesToday';
    const monthlyUsageKey = type === 'text' ? 'textSearchesThisMonth' : 'imageSearchesThisMonth';
    
    let currentUsage = userData?.[usageKey] || 0;
    let monthlyUsage = userData?.[monthlyUsageKey] || 0;
    
    if (lastUsageDate !== today) {
      currentUsage = 0;
    }
    
    if (lastMonthKey !== monthKey) {
      monthlyUsage = 0;
    }
    
    await firestore.collection('users').doc(userId).update({
      [usageKey]: currentUsage + 1,
      [monthlyUsageKey]: monthlyUsage + 1,
      lastUsageDate: today,
      lastMonthKey: monthKey,
      updatedAt: new Date(),
    });
  }

  async useCredit(userId: string, amount: number = 1) {
    const logger = new Logger(UsersService.name);
    const firestore = this.firebaseService.getFirestore();
    
    logger.log(`🔍 [CREDITS DEBUG] Starting useCredit for user ${userId}, amount: ${amount}`);
    
    const userDoc = await firestore.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      logger.error(`❌ [CREDITS DEBUG] User ${userId} not found`);
      throw new BadRequestException('User not found');
    }

    const userData = userDoc.data();
    const currentCredits = userData?.credits || 0;
    const freeTrialUsed = userData?.freeTrialUsed || false;
    const plan = userData?.plan || 'free';
    
    logger.log(`💳 [CREDITS DEBUG] User ${userId} data:`);
    logger.log(`   - currentCredits: ${currentCredits}`);
    logger.log(`   - amount to deduct: ${amount}`);
    logger.log(`   - freeTrialUsed: ${freeTrialUsed}`);
    logger.log(`   - plan: ${plan}`);
    
    // Se tem crédito de teste E ainda não usou = usar teste
    if (currentCredits > 0 && !freeTrialUsed) {
      const newCredits = currentCredits - amount;
      logger.log(`💳 [CREDITS DEBUG] Using free trial credit: ${currentCredits} -> ${newCredits}`);
      
      try {
        await firestore.collection('users').doc(userId).update({
          credits: newCredits,
          freeTrialUsed: true,
          updatedAt: new Date(),
        });
        logger.log(`✅ [CREDITS DEBUG] Free trial credit deducted successfully`);
        
        // Verificar se realmente foi atualizado
        const updatedDoc = await firestore.collection('users').doc(userId).get();
        const updatedData = updatedDoc.data();
        logger.log(`🔍 [CREDITS DEBUG] After update - credits: ${updatedData?.credits}, freeTrialUsed: ${updatedData?.freeTrialUsed}`);
        
        return;
      } catch (error) {
        logger.error(`❌ [CREDITS DEBUG] Error updating free trial credit: ${error.message}`);
        throw error;
      }
    }
    
    // Créditos normais
    if (currentCredits < amount) {
      logger.warn(`❌ [CREDITS DEBUG] Insufficient credits: has ${currentCredits}, needs ${amount}`);
      throw new BadRequestException({
        error: 'INSUFFICIENT_CREDITS',
        message: 'Insufficient credits',
        currentCredits,
        requiredCredits: amount,
        action: 'buy_credits'
      });
    }

    const newCredits = currentCredits - amount;
    logger.log(`💳 [CREDITS DEBUG] Deducting normal credit: ${currentCredits} -> ${newCredits}`);
    
    try {
      await firestore.collection('users').doc(userId).update({
        credits: newCredits,
        updatedAt: new Date(),
      });
      logger.log(`✅ [CREDITS DEBUG] Normal credit deducted successfully`);
      
      // Verificar se realmente foi atualizado
      const updatedDoc = await firestore.collection('users').doc(userId).get();
      const updatedData = updatedDoc.data();
      logger.log(`🔍 [CREDITS DEBUG] After update - credits: ${updatedData?.credits}`);
      
    } catch (error) {
      logger.error(`❌ [CREDITS DEBUG] Error updating normal credit: ${error.message}`);
      throw error;
    }
  }

  async getPlanLimits(plan: string) {
    const limits = PLAN_LIMITS[plan as PlanType] || PLAN_LIMITS[PlanType.FREE];
    return limits;
  }

  async getCurrentUsage(userId: string) {
    const firestore = this.firebaseService.getFirestore();
    const userDoc = await firestore.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return { textToday: 0, imageToday: 0, textMonth: 0, imageMonth: 0 };
    }

    const userData = userDoc.data();
    const today = new Date().toISOString().split('T')[0];
    const monthKey = new Date().toISOString().slice(0, 7);
    
    return {
      textToday: userData?.lastUsageDate === today ? (userData?.textSearchesToday || 0) : 0,
      imageToday: userData?.lastUsageDate === today ? (userData?.imageSearchesToday || 0) : 0,
      textMonth: userData?.lastMonthKey === monthKey ? (userData?.textSearchesThisMonth || 0) : 0,
      imageMonth: userData?.lastMonthKey === monthKey ? (userData?.imageSearchesThisMonth || 0) : 0,
    };
  }
}
