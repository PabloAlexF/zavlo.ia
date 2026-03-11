import { db } from './firebase';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
export const transactionService = {
    async create(userId, transaction) {
        const transactionData = Object.assign(Object.assign({ userId }, transaction), { createdAt: new Date().toISOString() });
        await addDoc(collection(db, `users/${userId}/transactions`), transactionData);
        return transactionData;
    },
    async getHistory(userId, limitCount = 50) {
        const q = query(collection(db, `users/${userId}/transactions`), orderBy('createdAt', 'desc'), limit(limitCount));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    },
};
