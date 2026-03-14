import { db } from './firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'products' | 'confirmation' | 'category_question' | 'image_confirmation' | 'sort_question';
  content: string;
  products?: any[];
  timestamp: Date;
  searchType?: 'text' | 'image';
  creditCost?: number;
}

export interface ChatHistory {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export const chatHistoryService = {
  async save(userId: string, chatId: string, title: string, messages: ChatMessage[]) {
    if (!db) return;
    
    try {
      const chatData = {
        userId,
        chatId,
        title: title.slice(0, 50),
        messages: messages.slice(-50).map(m => ({
          ...m,
          timestamp: m.timestamp.toISOString(),
          products: m.products?.slice(0, 6)
        })),
        updatedAt: new Date().toISOString()
      };

      const chatsRef = collection(db, 'chat_history');
      const q = query(chatsRef, where('userId', '==', userId), where('chatId', '==', chatId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        await addDoc(chatsRef, {
          ...chatData,
          createdAt: new Date().toISOString()
        });
      } else {
        const docRef = doc(db, 'chat_history', snapshot.docs[0].id);
        await updateDoc(docRef, chatData);
      }
    } catch (error) {
      console.error('Erro ao salvar chat no Firestore:', error);
    }
  },

  async load(userId: string, limitCount = 50): Promise<ChatHistory[]> {
    if (!db) return [];
    
    try {
      const chatsRef = collection(db, 'chat_history');
      const q = query(
        chatsRef,
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.chatId,
          userId: data.userId,
          title: data.title,
          messages: data.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          })),
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt)
        };
      });
    } catch (error) {
      console.error('Erro ao carregar chat do Firestore:', error);
      return [];
    }
  },

  async delete(userId: string, chatId: string) {
    if (!db) return;
    
    try {
      const chatsRef = collection(db, 'chat_history');
      const q = query(chatsRef, where('userId', '==', userId), where('chatId', '==', chatId));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        await deleteDoc(doc(db, 'chat_history', snapshot.docs[0].id));
      }
    } catch (error) {
      console.error('Erro ao deletar chat do Firestore:', error);
    }
  }
};
