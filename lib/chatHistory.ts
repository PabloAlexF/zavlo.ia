import { getDbInstance } from './firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'products' | 'image_confirmation' | 'sort_question' | 'question' | 'query_confirm' | 'expansion';
  content: string;
  products?: any[];
  timestamp: Date;
  searchType?: 'text' | 'image';
  creditCost?: number;
  imageData?: string;
  detectedProduct?: string;
  questionType?: string;
  questionSuggestions?: { label: string; min?: number; max?: number; value?: string }[];
  userLocation?: { city?: string; state?: string };
  expansionSources?: string[];
  primarySource?: string;
  isVehicle?: boolean;
  priceRangeApplied?: {
    min?: number;
    max?: number;
    target?: number;
  };
  queryConfirmSortBy?: string;
  queryConfirmCreditEstimate?: number;
  queryConfirmNotes?: string[];
  isImageSort?: boolean;
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
          const parsedTimestamp = m.timestamp instanceof Date
            ? m.timestamp
            : new Date(m.timestamp as unknown as string);
          const safeTimestamp = Number.isFinite(parsedTimestamp.getTime())
            ? parsedTimestamp
            : new Date();

          const msg: any = {
            id: m.id,
            type: m.type,
            content: m.content,
            timestamp: safeTimestamp.toISOString()
          };
          if (m.products) msg.products = m.products.slice(0, 6);
          if (m.searchType) msg.searchType = m.searchType;
          if (m.creditCost !== undefined) msg.creditCost = m.creditCost;
          if (m.imageData) msg.imageData = m.imageData;
          if (m.detectedProduct) msg.detectedProduct = m.detectedProduct;
          if (m.questionType) msg.questionType = m.questionType;
          if (m.questionSuggestions) msg.questionSuggestions = m.questionSuggestions;
          if (m.userLocation) msg.userLocation = m.userLocation;
          if (m.expansionSources) msg.expansionSources = m.expansionSources;
          if (m.primarySource) msg.primarySource = m.primarySource;
          if (m.isVehicle !== undefined) msg.isVehicle = m.isVehicle;
          if (m.priceRangeApplied) msg.priceRangeApplied = m.priceRangeApplied;
          if (m.queryConfirmSortBy) msg.queryConfirmSortBy = m.queryConfirmSortBy;
          if (m.queryConfirmCreditEstimate !== undefined) msg.queryConfirmCreditEstimate = m.queryConfirmCreditEstimate;
          if (m.queryConfirmNotes) msg.queryConfirmNotes = m.queryConfirmNotes;
          if (m.isImageSort !== undefined) msg.isImageSort = m.isImageSort;
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
        const parseDate = (value: any) => {
          const d = value instanceof Date ? value : new Date(value);
          return Number.isFinite(d.getTime()) ? d : new Date();
        };
        return {
          id: data.chatId,
          userId: data.userId,
          title: data.title,
          messages: data.messages.map((m: any) => ({
            ...m,
            timestamp: parseDate(m.timestamp)
          })),
          createdAt: parseDate(data.createdAt),
          updatedAt: parseDate(data.updatedAt)
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
