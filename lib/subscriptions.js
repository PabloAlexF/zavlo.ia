import { db } from './firebase';
import { collection, addDoc, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';
export const subscriptionService = {
    async create(subscription) {
        const now = new Date().toISOString();
        const subscriptionData = Object.assign(Object.assign({}, subscription), { createdAt: now, updatedAt: now });
        const docRef = await addDoc(collection(db, 'subscriptions'), subscriptionData);
        return Object.assign({ id: docRef.id }, subscriptionData);
    },
    async getByUserId(userId) {
        const q = query(collection(db, 'subscriptions'), where('userId', '==', userId), where('status', '==', 'active'));
        const snapshot = await getDocs(q);
        if (snapshot.empty)
            return null;
        const doc = snapshot.docs[0];
        return Object.assign({ id: doc.id }, doc.data());
    },
    async update(subscriptionId, updates) {
        await updateDoc(doc(db, 'subscriptions', subscriptionId), Object.assign(Object.assign({}, updates), { updatedAt: new Date().toISOString() }));
    },
    async cancel(subscriptionId) {
        await this.update(subscriptionId, {
            status: 'cancelled',
            autoRenew: false,
        });
    },
};
