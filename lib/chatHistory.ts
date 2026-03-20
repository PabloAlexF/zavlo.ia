import { getDbInstance } from './firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'products' | 'image_confirmation' | 'sort_question';
  content: string;
  products?: any[];
  timestamp: Date;
  searchType?: 'text' | 'image';
  creditCost?: number;
  imageData?: string;
  detectedProduct?: string;
  priceRangeApplied?: {
    min?: number;
    max?: number;
    target?: number;
  };
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
    const db = getDbInstance();
    if (!db) return;
    
    try {
      const chatData = {
        userId,
        chatId,
        title: title.slice(0, 50),
        messages: messages.slice(-50).map(m => {
          const msg: any = {
            id: m.id,
            type: m.type,
            content: m.content,
            timestamp: m.timestamp.toISOString()
          };
          if (m.products) msg.products = m.products.slice(0, 6);
          if (m.searchType) msg.searchType = m.searchType;
          if (m.creditCost !== undefined) msg.creditCost = m.creditCost;
          if (m.imageData) msg.imageData = m.imageData;
          if (m.detectedProduct) msg.detectedProduct = m.detectedProduct;
          if (m.priceRangeApplied) msg.priceRangeApplied = m.priceRangeApplied;
          return msg;
        }),
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
    const db = getDbInstance();
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
    const db = getDbInstance();
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
