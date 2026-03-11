import { db } from './firebase';
import { collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export interface Transaction {
  userId: string;
  type: 'purchase' | 'usage' | 'bonus' | 'refund';
  amount: number;
  balance: number;
  description: string;
  createdAt: string;
}

export const transactionService = {
  async create(userId: string, transaction: Omit<Transaction, 'userId' | 'createdAt'>) {
    const transactionData: Transaction = {
      userId,
      ...transaction,
      createdAt: new Date().toISOString(),
    };
    
    await addDoc(collection(db, `users/${userId}/transactions`), transactionData);
    return transactionData;
  },

  async getHistory(userId: string, limitCount = 50) {
    const q = query(
      collection(db, `users/${userId}/transactions`),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction & { id: string }));
  },
};
