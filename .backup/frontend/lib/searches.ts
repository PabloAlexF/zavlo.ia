import { db } from './firebase';
import { collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export interface Search {
  userId: string;
  type: 'text' | 'image';
  query: string;
  resultsCount: number;
  usedCredit: boolean;
  createdAt: string;
}

export const searchService = {
  async create(userId: string, search: Omit<Search, 'userId' | 'createdAt'>) {
    const searchData: Search = {
      userId,
      ...search,
      createdAt: new Date().toISOString(),
    };
    
    await addDoc(collection(db, `users/${userId}/searches`), searchData);
    return searchData;
  },

  async getHistory(userId: string, limitCount = 50) {
    const q = query(
      collection(db, `users/${userId}/searches`),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Search & { id: string }));
  },

  async getStats(userId: string) {
    const searches = await this.getHistory(userId, 1000);
    return {
      total: searches.length,
      text: searches.filter(s => s.type === 'text').length,
      image: searches.filter(s => s.type === 'image').length,
      creditsUsed: searches.filter(s => s.usedCredit).length,
    };
  },
};
