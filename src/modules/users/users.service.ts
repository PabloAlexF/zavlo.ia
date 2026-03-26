import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { FirebaseService } from '@config/firebase.service';
import { PlanType, PLAN_LIMITS } from '@shared/plans.constants';
import { User } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(private firebaseService: FirebaseService) {}

  private readonly logger = new Logger(UsersService.name);

  async findById(userId: string): Promise<User | null> {
    const firestore = this.firebaseService.getFirestore();
    const userDoc = await firestore.collection('users').doc(userId).get();

    if (!userDoc.exists) return null;

    const userData = userDoc.data();
    if (userData) delete userData.password;

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
      
      return this.findById(userId);
    } catch (error) {
      this.logger.error(`Erro ao atualizar plano: ${error.message}`);
      throw error;
    }
  }

  async addCredits(userId: string, credits: number) {
    const firestore = this.firebaseService.getFirestore();
    const userRef = firestore.collection('users').doc(userId);

    await firestore.runTransaction(async (tx) => {
      const userDoc = await tx.get(userRef);
      if (!userDoc.exists) throw new BadRequestException('User not found');
      const current = userDoc.data()?.credits || 0;
      tx.update(userRef, { credits: current + credits, updatedAt: new Date() });
    });

    return this.findById(userId);
  }

  async setCredits(userId: string, credits: number) {
    // #3: update() já lança erro se documento não existe — get() prévio é desnecessário
    const firestore = this.firebaseService.getFirestore();
    await firestore.collection('users').doc(userId).update({
      credits,
      updatedAt: new Date(),
    });
    return this.findById(userId);
  }

  async checkUsageLimit(userId: string, type: 'text' | 'image'): Promise<boolean> {
    // #1: leitura pura — não precisa de transação
    const firestore = this.firebaseService.getFirestore();
    const userDoc = await firestore.collection('users').doc(userId).get();
    if (!userDoc.exists) return false;

    const userData = userDoc.data();
    const plan = userData?.plan || PlanType.FREE;
    const credits = userData?.credits || 0;

    const isPaidUser = plan !== PlanType.FREE || credits > 0;
    if (isPaidUser) return true;

    const limits = PLAN_LIMITS[PlanType.FREE];
    const monthKey = new Date().toISOString().slice(0, 7);
    const monthlyUsageKey = type === 'text' ? 'textSearchesThisMonth' : 'imageSearchesThisMonth';
    const monthlyUsage = userData?.lastMonthKey === monthKey ? (userData?.[monthlyUsageKey] || 0) : 0;
    const monthlyLimit = type === 'text' ? limits.textSearchesPerMonth : limits.imageSearchesPerMonth;

    return monthlyUsage < (monthlyLimit || 0);
  }

  async incrementUsage(userId: string, type: 'text' | 'image') {
    const firestore = this.firebaseService.getFirestore();
    const userRef = firestore.collection('users').doc(userId);

    await firestore.runTransaction(async (tx) => {
      const userDoc = await tx.get(userRef);
      if (!userDoc.exists) return;

      const userData = userDoc.data();
      const today = new Date().toISOString().split('T')[0];
      const monthKey = new Date().toISOString().slice(0, 7);
      const usageKey = type === 'text' ? 'textSearchesToday' : 'imageSearchesToday';
      const monthlyUsageKey = type === 'text' ? 'textSearchesThisMonth' : 'imageSearchesThisMonth';

      const currentUsage = userData?.lastUsageDate === today ? (userData?.[usageKey] || 0) : 0;
      const monthlyUsage = userData?.lastMonthKey === monthKey ? (userData?.[monthlyUsageKey] || 0) : 0;

      tx.update(userRef, {
        [usageKey]: currentUsage + 1,
        [monthlyUsageKey]: monthlyUsage + 1,
        lastUsageDate: today,
        lastMonthKey: monthKey,
        updatedAt: new Date(),
      });
    });
  }

  async useCredit(userId: string, amount: number = 1) {
    const firestore = this.firebaseService.getFirestore();
    const userRef = firestore.collection('users').doc(userId);

    await firestore.runTransaction(async (tx) => {
      const userDoc = await tx.get(userRef);

      if (!userDoc.exists) throw new BadRequestException('User not found');

      const userData = userDoc.data();
      const currentCredits = userData?.credits || 0;
      const freeTrialUsed = userData?.freeTrialUsed || false;

      if (currentCredits < amount) {
        throw new BadRequestException({
          error: 'INSUFFICIENT_CREDITS',
          message: 'Insufficient credits',
          currentCredits,
          requiredCredits: amount,
          action: 'buy_credits',
        });
      }

      const update: Record<string, any> = {
        credits: currentCredits - amount,
        updatedAt: new Date(),
      };

      if (!freeTrialUsed) update.freeTrialUsed = true;

      tx.update(userRef, update);
    });
  }

  // #2: useCredit + incrementUsage em uma única transação atômica
  async useCreditAndIncrementUsage(userId: string, type: 'text' | 'image', amount: number = 1) {
    const firestore = this.firebaseService.getFirestore();
    const userRef = firestore.collection('users').doc(userId);

    await firestore.runTransaction(async (tx) => {
      const userDoc = await tx.get(userRef);
      if (!userDoc.exists) throw new BadRequestException('User not found');

      const userData = userDoc.data();
      const currentCredits = userData?.credits || 0;
      const freeTrialUsed = userData?.freeTrialUsed || false;

      if (currentCredits < amount) {
        throw new BadRequestException({
          error: 'INSUFFICIENT_CREDITS',
          message: 'Insufficient credits',
          currentCredits,
          requiredCredits: amount,
          action: 'buy_credits',
        });
      }

      const today = new Date().toISOString().split('T')[0];
      const monthKey = new Date().toISOString().slice(0, 7);
      const usageKey = type === 'text' ? 'textSearchesToday' : 'imageSearchesToday';
      const monthlyUsageKey = type === 'text' ? 'textSearchesThisMonth' : 'imageSearchesThisMonth';
      const currentUsage = userData?.lastUsageDate === today ? (userData?.[usageKey] || 0) : 0;
      const monthlyUsage = userData?.lastMonthKey === monthKey ? (userData?.[monthlyUsageKey] || 0) : 0;

      const update: Record<string, any> = {
        credits: currentCredits - amount,
        [usageKey]: currentUsage + 1,
        [monthlyUsageKey]: monthlyUsage + 1,
        lastUsageDate: today,
        lastMonthKey: monthKey,
        updatedAt: new Date(),
      };
      if (!freeTrialUsed) update.freeTrialUsed = true;

      tx.update(userRef, update);
    });
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
