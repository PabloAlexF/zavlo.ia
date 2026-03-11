import { db } from './firebase';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
export const searchService = {
    async create(userId, search) {
        const searchData = Object.assign(Object.assign({ userId }, search), { createdAt: new Date().toISOString() });
        await addDoc(collection(db, `users/${userId}/searches`), searchData);
        return searchData;
    },
    async getHistory(userId, limitCount = 50) {
        const q = query(collection(db, `users/${userId}/searches`), orderBy('createdAt', 'desc'), limit(limitCount));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    },
    async getStats(userId) {
        const searches = await this.getHistory(userId, 1000);
        return {
            total: searches.length,
            text: searches.filter(s => s.type === 'text').length,
            image: searches.filter(s => s.type === 'image').length,
            creditsUsed: searches.filter(s => s.usedCredit).length,
        };
    },
};
