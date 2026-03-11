import { db } from './firebase';
import { collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';

export interface Subscription {
  userId: string;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod?: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export const subscriptionService = {
  async create(subscription: Omit<Subscription, 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const subscriptionData: Subscription = {
      ...subscription,
      createdAt: now,
      updatedAt: now,
    };
    
    const docRef = await addDoc(collection(db, 'subscriptions'), subscriptionData);
    return { id: docRef.id, ...subscriptionData };
  },

  async getByUserId(userId: string) {
    const q = query(
      collection(db, 'subscriptions'),
      where('userId', '==', userId),
      where('status', '==', 'active')
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Subscription & { id: string };
  },

  async update(subscriptionId: string, updates: Partial<Subscription>) {
    await updateDoc(doc(db, 'subscriptions', subscriptionId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  async cancel(subscriptionId: string) {
    await this.update(subscriptionId, {
      status: 'cancelled',
      autoRenew: false,
    });
  },
};
