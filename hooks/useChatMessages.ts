import { useState, useCallback } from 'react';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'products' | 'image_confirmation' | 'sort_question';
  content: string;
  products?: any[];
  timestamp: Date;
  creditCost?: number;
  imageData?: string;
  detectedProduct?: string;
}

export function useChatMessages() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Olá! 👋 Eu sou a Zavlo, sua assistente de compras inteligente!\n\nQue produto você está procurando?',
      timestamp: new Date(),
    }
  ]);

  const addMessage = useCallback((type: 'ai' | 'user', content: string, extra?: Partial<Message>) => {
    const message: Message = {
      id: crypto.randomUUID(),
      type,
      content,
      timestamp: new Date(),
      ...extra,
    };
    setMessages(prev => [...prev, message]);
    return message;
  }, []);

  const removeMessage = useCallback((predicate: (m: Message) => boolean) => {
    setMessages(prev => prev.filter(m => !predicate(m)));
  }, []);

  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setMessages(prev => {
      const updated = [...prev];
      const idx = updated.findIndex(m => m.id === messageId);
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], ...updates };
      }
      return updated;
    });
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([{
      id: '1',
      type: 'ai',
      content: 'Olá! 👋 Eu sou a Zavlo, sua assistente de compras inteligente!\n\nQue produto você está procurando?',
      timestamp: new Date(),
    }]);
  }, []);

  return {
    messages,
    setMessages,
    addMessage,
    removeMessage,
    updateMessage,
    clearMessages,
  };
}
