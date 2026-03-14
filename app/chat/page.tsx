'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { QuickSuggestions } from '@/components/chat/QuickSuggestions';
import { ProductCard } from '@/components/features/ProductCard';
import { detectIntent } from '@/utils/chat/intentDetector';
import { contextManager } from '@/utils/chat/contextManager';
import { parseProductQuery, buildSearchQuery } from '@/utils/chat/productParser';
import { handleGenericProduct } from '@/utils/chat/genericProductHandler';
import { cleanProductQuery } from '@/utils/chat/queryProcessor';
import { 
  detectProductCategory, 
  PRODUCT_CATEGORIES, 
  formatCategoryQuestion, 
  isCategoryConfident,
  getRelevantQuestions 
} from '@/utils/chat/categorySystem';
import { detectProvidedInfo, filterQuestions } from '@/utils/chat/smartQuestions';
import { parseAnswer } from '@/utils/chat/answerParser';
import { detectContextChange } from '@/utils/chat/contextChangeDetector';
import { 
  detectRefinement, 
  correctCommonTypos, 
  generateSmartResponse, 
  updateConversationContext,
  detectNegotiationIntent 
} from '@/utils/chat/smartBot';
import { extractSmartFilters, getMissingFilters, generateFilterConfirmation } from '@/utils/chat/smartFilter';
import { executeStateHandler } from '@/utils/chat/stateHandlers';
import { chatHistoryService } from '@/lib/chatHistory';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'products' | 'confirmation' | 'category_question' | 'image_confirmation' | 'sort_question';
  content: string;
  products?: any[];
  timestamp: Date;
  searchType?: 'text' | 'image';
  creditCost?: number;
  categoryQuestion?: {
    id: string;
    options: string[];
    category: string;
  };
  imageData?: string;
  detectedProduct?: string;
}

interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

type ChatState = 'idle' | 'awaiting_condition' | 'awaiting_location' | 'awaiting_confirmation' | 'searching' | 'category_questions' | 'awaiting_image_confirmation' | 'awaiting_image_sort' | 'awaiting_sort' | 'awaiting_limit' | 'awaiting_price_range';

interface CategoryAnswers {
  [key: string]: string;
}

interface SearchFilters {
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Olá! 👋 Eu sou a Zavlo, sua assistente de compras inteligente!\n\nAntes de começarmos, como posso te chamar?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [detectedProductName, setDetectedProductName] = useState<string>('');
  const [chatState, setChatState] = useState<ChatState>('idle');
  const [pendingSearch, setPendingSearch] = useState<{ query: string; condition?: string; location?: string; category?: string; sortBy?: string; limit?: number; minPrice?: number; maxPrice?: number } | null>(null);
  const [categoryAnswers, setCategoryAnswers] = useState<CategoryAnswers>({});
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [showMoreSuggestions, setShowMoreSuggestions] = useState(false);
  const [isEditingQuery, setIsEditingQuery] = useState(false);
  const [editedQuery, setEditedQuery] = useState('');

  const [userCredits, setUserCredits] = useState(0);
  
// Sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  
  // Mobile keyboard detection
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll suave apenas quando há nova mensagem (não no mount inicial)
    if (messages.length > 1) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    }
  }, [messages.length]);

  // Detecta teclado virtual no mobile
  useEffect(() => {
    const handleResize = () => {
      // Detecta se o teclado está aberto comparando altura da janela
      const isKeyboard = window.visualViewport ? 
        window.visualViewport.height < window.innerHeight : false;
      setIsKeyboardOpen(isKeyboard);
      
      // Scroll para o final quando teclado abre
      if (isKeyboard) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
      }
    };

    const handleFocus = () => {
      setIsKeyboardOpen(true);
      // Prevenir scroll automático indesejado
      setTimeout(() => {
        const container = document.querySelector('.overflow-y-auto');
        if (container) {
          const scrollHeight = container.scrollHeight;
          const clientHeight = container.clientHeight;
          const maxScroll = scrollHeight - clientHeight;
          container.scrollTop = maxScroll;
        }
      }, 300);
    };
    
    const handleBlur = () => {
      setTimeout(() => setIsKeyboardOpen(false), 100);
    };

    const inputElement = inputRef.current;
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }
    
    if (inputElement) {
      inputElement.addEventListener('focus', handleFocus);
      inputElement.addEventListener('blur', handleBlur);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
      if (inputElement) {
        inputElement.removeEventListener('focus', handleFocus);
        inputElement.removeEventListener('blur', handleBlur);
      }
    };
  }, []);

  useEffect(() => {
    loadUserCredits();
    loadChatHistory();

    // Listeners para atualização em tempo real
    const handleUserChanged = () => loadUserCredits();
    const handleStorageChanged = (e: StorageEvent) => {
      if (e.key === 'zavlo_user') loadUserCredits();
    };

    window.addEventListener('userChanged', handleUserChanged);
    window.addEventListener('storage', handleStorageChanged);

    return () => {
      window.removeEventListener('userChanged', handleUserChanged);
      window.removeEventListener('storage', handleStorageChanged);
    };
  }, []);

  // Auto-save chat to history com debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentChatId && messages.length > 1) {
        saveChatToHistory();
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [messages, currentChatId]);

  const loadUserCredits = async () => {
    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) return;
      const userData = JSON.parse(user);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${userData.token}` },
      });
      if (response.ok) {
        const profile = await response.json();
        setUserCredits(profile.credits || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar créditos:', error);
    }
  };

const loadChatHistory = async () => {
    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) {
        setChatHistory([]);
        return;
      }
      
      const userData = JSON.parse(user);
      const userId = userData.userId;
      
      // Tentar carregar do Firestore primeiro
      try {
        const firestoreHistory = await chatHistoryService.load(userId);
        if (firestoreHistory.length > 0) {
          setChatHistory(firestoreHistory);
          // Atualizar localStorage com dados do Firestore
          localStorage.setItem(`zavlo_chat_history_${userId}`, JSON.stringify(firestoreHistory));
          console.log(`✅ Loaded ${firestoreHistory.length} chats from Firestore`);
          return;
        }
      } catch (firestoreError) {
        console.warn('Firestore indisponível, usando localStorage:', firestoreError);
      }
      
      // Fallback para localStorage
      const saved = localStorage.getItem(`zavlo_chat_history_${userId}`);
      
      if (!saved) {
        setChatHistory([]);
        return;
      }
      
      const parsedHistory = JSON.parse(saved);
      
      if (!Array.isArray(parsedHistory)) {
        localStorage.removeItem(`zavlo_chat_history_${userId}`);
        setChatHistory([]);
        console.log('✅ Cleared invalid chat history array');
        return;
      }
      
      // Deep robust validation + sanitization
      const validHistory: ChatHistory[] = [];
      
      for (const chat of parsedHistory) {
        try {
          if (typeof chat !== 'object' || chat === null || typeof chat.id !== 'string' || !chat.id) {
            continue;
          }
          
          if (!Array.isArray(chat.messages)) {
            continue;
          }
          
          // Sanitize messages - immutable
          const validMessages: Message[] = chat.messages.filter((msg: any) => {
            if (!msg || typeof msg !== 'object') return false;
            if (typeof msg.content !== 'string' || !msg.content.trim()) return false;
            if (typeof msg.id !== 'string' || !msg.id) return false;
            
            // Clean corrupted content
            const cleanedContent = msg.content
              .replace(/\\u0000/g, '') // Null bytes
              .replace(/\}\)/g, '')
              .replace(/\}\)'/g, '')
              .replace(/\\}\\\\/g, '')
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // XSS
              .trim();
            
            return cleanedContent.length > 0;
          }).map((msg: any) => ({
            ...msg,
            content: msg.content.replace(/\\u0000/g, '').trim(),
            timestamp: new Date(msg.timestamp || Date.now())
          }));
          
          if (validMessages.length === 0) continue;
          
          validHistory.push({
            id: chat.id,
            title: (typeof chat.title === 'string' ? chat.title.slice(0, 50) : 'Chat'),
            messages: validMessages,
            createdAt: new Date(chat.createdAt || Date.now()),
            updatedAt: new Date(chat.updatedAt || Date.now())
          });
          
        } catch (chatError) {
          console.warn('Skipping corrupted chat:', chatError);
          continue;
        }
      }
      
      setChatHistory(validHistory);
      console.log(`✅ Loaded ${validHistory.length} valid chats safely`);
      
    } catch (error) {
      console.error('❌ Failed to load chat history:', error);
      // Clear ALL chat history for this user
      const user = localStorage.getItem('zavlo_user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          localStorage.removeItem(`zavlo_chat_history_${userData.userId}`);
        } catch {}
      }
      setChatHistory([]);
    }
    
    // Always ensure current chat
    if (!currentChatId) {
      const newChatId = Date.now().toString();
      setCurrentChatId(newChatId);
    }
  };

  const saveChatToHistory = async () => {
    setChatHistory(prevHistory => {
      try {
        const user = localStorage.getItem('zavlo_user');
        if (!user) return prevHistory;
        const userData = JSON.parse(user);
        const userId = userData.userId;
        
        // Get title from first user message
        const chatTitle = messages.find(m => m.type === 'user')?.content.slice(0, 30) || 'Nova conversa';
        const existingIndex = prevHistory.findIndex(c => c.id === currentChatId);
        
        // Clean messages before saving
        const cleanedMessages = messages.slice(-50).map(m => {
          const cleaned = m.type === 'products' ? { ...m, products: m.products?.slice(0, 6) } : { ...m };
          // Remove any corrupted content
          if (cleaned.content && typeof cleaned.content === 'string') {
            cleaned.content = cleaned.content
              .replace(/\}\)/g, '')
              .replace(/\}\)'/g, '')
              .trim();
          }
          return cleaned;
        });
        
        const chatData: ChatHistory = {
          id: currentChatId,
          title: chatTitle,
          messages: cleanedMessages,
          createdAt: existingIndex >= 0 ? prevHistory[existingIndex].createdAt : new Date(),
          updatedAt: new Date(),
        };
        
        let updatedHistory;
        if (existingIndex >= 0) {
          updatedHistory = [...prevHistory];
          updatedHistory[existingIndex] = chatData;
        } else {
          updatedHistory = [chatData, ...prevHistory];
        }
        
        // Salvar no localStorage (backup local)
        localStorage.setItem(`zavlo_chat_history_${userId}`, JSON.stringify(updatedHistory));
        
        // Salvar no Firestore (persistência na nuvem)
        chatHistoryService.save(userId, currentChatId, chatTitle, cleanedMessages).catch(err => {
          console.warn('Falha ao salvar no Firestore (continuando com localStorage):', err);
        });
        
        return updatedHistory;
      } catch (error) {
        console.error('Erro ao salvar chat:', error);
        return prevHistory;
      }
    });
  };

  const loadChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chatId);
      setChatState('idle');
      setPendingSearch(null);
      contextManager.clear();
      // Fecha sidebar no mobile ao selecionar conversa
      if (window.innerWidth < 768) setSidebarOpen(false);
    }
  };

  const createNewChat = () => {
    setIsCreatingNewChat(true);
    
    // Save current chat before creating new one
    if (currentChatId && messages.length > 1) {
      saveChatToHistory();
    }
    
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    setMessages([{
      id: '1',
      type: 'ai',
      content: 'Olá! 👋 Eu sou a Zavlo, sua assistente de compras inteligente!\n\nAntes de começarmos, como posso te chamar?',
      timestamp: new Date(),
    }]);
    setChatState('idle');
    setPendingSearch(null);
    setCategoryAnswers({});
    setUploadedImage(null);
    setImageFile(null);
    setDetectedProductName('');
    setShowMoreSuggestions(false);
    contextManager.clear();
    
    setTimeout(() => {
      setIsCreatingNewChat(false);
      inputRef.current?.focus();
    }, 300);
  };


  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = chatHistory.filter(c => c.id !== chatId);
    setChatHistory(updatedHistory);
    
    const user = localStorage.getItem('zavlo_user');
    if (user) {
      const userData = JSON.parse(user);
      const userId = userData.userId;
      
      // Deletar do localStorage
      localStorage.setItem(`zavlo_chat_history_${userId}`, JSON.stringify(updatedHistory));
      
      // Deletar do Firestore
      chatHistoryService.delete(userId, chatId).catch(err => {
        console.warn('Falha ao deletar do Firestore:', err);
      });
    }
    
    if (currentChatId === chatId) {
      createNewChat();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Imagem muito grande. Máximo 5MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageSearch = async () => {
    if (!imageFile || loading) return;

    setLoading(true);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: '[Busca por imagem]',
      timestamp: new Date(),
      imageData: uploadedImage || undefined,
    };
    setMessages(prev => [...prev, userMessage]);

    if (userCredits < 1) {
      setTimeout(() => {
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          type: 'ai',
          content: 'Créditos insuficientes para busca por imagem!',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        setLoading(false);
        setUploadedImage(null);
        setImageFile(null);
      }, 500);
      return;
    }

    // ETAPA 1: Dizer que está analisando a imagem
    const analyzingMessage: Message = {
      id: crypto.randomUUID(),
      type: 'ai',
      content: '🔍 Analisando sua imagem...\n\nAguarde enquanto identifico o produto.',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, analyzingMessage]);

    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) {
        router.push('/auth');
        return;
      }

      const userData = JSON.parse(user);
      
      // Usar imageData (base64) diretamente
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/search/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userData.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData: uploadedImage }),
      });

      if (response.status === 401) {
        localStorage.removeItem('zavlo_user');
        router.push('/auth');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        
        // Atualizar créditos
        if (typeof data.remainingCredits === 'number') {
          setUserCredits(data.remainingCredits);
          const updatedUser = { ...userData, credits: data.remainingCredits };
          localStorage.setItem('zavlo_user', JSON.stringify(updatedUser));
          window.dispatchEvent(new Event('userChanged'));
        }

        const creditsUsed = data.creditsUsed || 1;
        const remainingCredits = data.remainingCredits ?? userCredits - 1;
        let productName = data.productName || 'Produto não identificado';
        
        // Limpar prefixos indesejados
        productName = productName
          .replace(/^Esta imagem mostra uma?\s*/i, '')
          .replace(/^Esta é uma?\s*/i, '')
          .replace(/^Este é um\s*/i, '')
          .trim();

        // ETAPA 2: Informar o produto encontrado e perguntar se deseja buscar
        setTimeout(() => {
          // Limpar imagem com animação
          setUploadedImage(null);
          setImageFile(null);
          
          // Armazenar o nome do produto para uso posterior
          setDetectedProductName(productName);
          
          const confirmationMessage: Message = {
            id: crypto.randomUUID(),
            type: 'image_confirmation',
            content: `✅ Produto identificado!\n\n📦 ${productName}\n\n💳 Já gasto: -${creditsUsed} crédito(s) (identificação)\n💰 Saldo atual: ${remainingCredits} créditos\n\n🔍 Deseja buscar preços? (custará +1 crédito)`,
            timestamp: new Date(),
            detectedProduct: productName,
            creditCost: creditsUsed,
          };
          setMessages(prev => [...prev, confirmationMessage]);
          setChatState('awaiting_image_confirmation');
          setLoading(false);
        }, 800);
      } else {
        const errorData = await response.json().catch(() => ({}));
        
        if (errorData.error === 'LIMIT_EXCEEDED') {
          const errorMessage: Message = {
            id: crypto.randomUUID(),
            type: 'ai',
            content: `🚫 Limite diário atingido!\n\nVocê atingiu o limite de buscas por imagem do seu plano hoje.\n\n📊 Soluções:\n• Aguarde até amanhã para novas buscas\n• Faça upgrade do seu plano\n• Use busca por texto (se disponível)\n\n👆 Acesse Plans no menu para fazer upgrade!`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
        } else {
          const errorMessage: Message = {
            id: crypto.randomUUID(),
            type: 'ai',
            content: errorData.message || 'Erro na busca por imagem. Tente novamente.',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
        }
        setUploadedImage(null);
        setImageFile(null);
        setLoading(false);
      }
    } catch (error) {
      console.error('Image search error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: 'ai',
        content: 'Erro ao processar imagem. Tente novamente.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setUploadedImage(null);
      setImageFile(null);
      setLoading(false);
    }
  };

  // Função para iniciar busca após confirmação
  const handleImagePriceSearch = () => {
    // Remover mensagem de confirmação
    setMessages(prev => {
      const index = prev.findLastIndex(m => m.type === 'image_confirmation');
      if (index === -1) return prev;
      return prev.filter((_, i) => i !== index);
    });
    
    // Perguntar sobre ordenação
    const sortMessage: Message = {
      id: crypto.randomUUID(),
      type: 'sort_question',
      content: 'Como deseja ordenar os resultados?',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, sortMessage]);
    setChatState('awaiting_image_sort');
  };

  // Função para executar busca com ordenação
  const executeImageSearch = async (sortBy: string) => {
    if (!detectedProductName || loading) return;
    
    setLoading(true);
    setChatState('searching');

    // Remover mensagem de ordenação
    setMessages(prev => prev.filter(m => m.type !== 'sort_question'));
    


    // Mensagem de busca
    const searchingMessage: Message = {
      id: crypto.randomUUID(),
      type: 'ai',
      content: 'searching_animation',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, searchingMessage]);

    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) {
        router.push('/auth');
        return;
      }

      const userData = JSON.parse(user);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      
      // Buscar preços usando o nome do produto já detectado
      const params = new URLSearchParams({
        query: detectedProductName,
        limit: '50',
        sortBy: sortBy
      });
      
      const response = await fetch(`${API_URL}/search/text?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userData.token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('zavlo_user');
        router.push('/auth');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const products = data.results || [];
        
        // Atualizar créditos
        if (typeof data.remainingCredits === 'number') {
          setUserCredits(data.remainingCredits);
          const updatedUser = { ...userData, credits: data.remainingCredits };
          localStorage.setItem('zavlo_user', JSON.stringify(updatedUser));
          window.dispatchEvent(new Event('userChanged'));
        }

        const creditsUsed = data.creditsUsed || 1;
        const remainingCredits = data.remainingCredits ?? userCredits - 1;

        setTimeout(() => {
          const productsMessage: Message = {
            id: crypto.randomUUID(),
            type: 'products',
            content: `✅ Encontrei ${products.length} produtos!\n\n💳 Créditos: -${creditsUsed} | Restantes: ${remainingCredits}\n\n🔍 Quer buscar outro produto? Digite agora!`,
            products: products,
            timestamp: new Date(),
            creditCost: creditsUsed,
          };
          setMessages(prev => [...prev, productsMessage]);
          setChatState('idle');
          setDetectedProductName('');
          setLoading(false);
        }, 1000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        
        if (errorData.error === 'LIMIT_EXCEEDED') {
          const errorMessage: Message = {
            id: crypto.randomUUID(),
            type: 'ai',
            content: `🚫 Limite diário atingido!\n\nVocê atingiu o limite de buscas por texto do seu plano hoje.\n\n📊 Soluções:\n• Aguarde até amanhã para novas buscas\n• Faça upgrade do seu plano\n• Use busca por imagem (se disponível)\n\n👆 Acesse Plans no menu para fazer upgrade!`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
        } else {
          const errorMessage: Message = {
            id: crypto.randomUUID(),
            type: 'ai',
            content: 'Erro ao buscar preços. Tente novamente.',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
        }
        setChatState('idle');
        setLoading(false);
      }
    } catch (error) {
      console.error('Image price search error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: 'ai',
        content: 'Erro ao buscar preços. Tente novamente.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setChatState('idle');
      setLoading(false);
    }
  };

  // Função para rejeitar a busca de preços
  const handleImageSearchReject = () => {
    // Remover mensagem de confirmação
    setMessages(prev => {
      const index = prev.findLastIndex(m => m.type === 'image_confirmation');
      if (index === -1) return prev;
      return prev.filter((_, i) => i !== index);
    });
    
    const goodbyeMessage: Message = {
      id: crypto.randomUUID(),
      type: 'ai',
      content: '🔄 Ok! Quando quiser buscar preços, é só enviar outra imagem.\n\n💡 Dica: Você também pode digitar o nome do produto para buscar!',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, goodbyeMessage]);
    
    setChatState('idle');
    setUploadedImage(null);
    setImageFile(null);
    setDetectedProductName('');
    setLoading(false);
  };

  const sendMessage = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  const handleSend = async (messageText?: string, isInternal = false) => {
    const currentInput = messageText || input;
    if (!currentInput || !String(currentInput).trim() || loading) return;

    // Verificar se está no estado de confirmação de busca por imagem
    if (chatState === 'awaiting_image_confirmation') {
      const lowerInput = currentInput.toLowerCase().trim();
      
      if (lowerInput === 'sim' || lowerInput === 'sim!' || lowerInput === 'sim, por favor' || lowerInput === 'yes' || lowerInput === 'y' || lowerInput === 's') {
        // Usuário quer buscar preços
        handleImagePriceSearch();
        return;
      } else if (lowerInput === 'não' || lowerInput === 'nao' || lowerInput === 'no' || lowerInput === 'n' || lowerInput === 'nao, obrigado' || lowerInput === 'não, obrigado') {
        // Usuário não quer buscar
        handleImageSearchReject();
        return;
      } else {
        // Resposta inválida, pedir novamente
        const retryMessage: Message = {
          id: crypto.randomUUID(),
          type: 'ai',
          content: '❓ Por favor, responda apenas com "sim" ou "não".\n\n🔍 Deseja buscar preços deste produto?',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, retryMessage]);
        return;
      }
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: currentInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    // Scroll imediato após enviar mensagem
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 50);

    // NOVO: Detecta mudança de contexto APENAS quando idle E sem busca pendente
    if (!isInternal && chatState === 'idle' && !pendingSearch) {
      const contextChange = detectContextChange(
        currentInput,
        contextManager.get().conversationHistory
      );

      // IMPORTANTE: Só processa mudança se confidence for alta (> 0.85)
      if (contextChange.hasChange && contextChange.confidence > 0.85 && (contextChange.type === 'correction' || contextChange.type === 'new_search')) {
        console.log('🔄 Mudança de contexto detectada:', contextChange);
        
        // Resetar estado
        setChatState('idle');
        setPendingSearch(null);
        setCategoryAnswers({});
        contextManager.clear();
        
        // Construir nova query com as informações extraídas
        const parts = [];
        if (contextChange.newProduct) parts.push(contextChange.newProduct);
        if (contextChange.newBrand) parts.push(contextChange.newBrand);
        if (contextChange.newCondition) parts.push(contextChange.newCondition);
        if (contextChange.newLocation) parts.push(contextChange.newLocation);
        
        const newQuery = parts.join(' ').trim() || currentInput;
        
        // Mensagem de confirmação da mudança
        const confirmMessage: Message = {
          id: crypto.randomUUID(),
          type: 'ai',
          content: `🔄 Entendi! Você quer buscar: "${newQuery}"\n\nVou processar essa nova busca...`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, confirmMessage]);
        
        // Processar como nova busca após um delay (com flag internal)
        setTimeout(() => {
          setLoading(false);
          handleSend(newQuery, true);
        }, 800);
        return;
      }
    }



    // Estado: aguardando localização
    if (chatState === 'awaiting_location') {
      const location = currentInput.toLowerCase().trim();
      const updatedLocation = (location === 'não' || location === 'nao') ? undefined : currentInput;
      
      setPendingSearch(prev => {
        if (!prev) return prev;
        return { ...prev, location: updatedLocation };
      });
      
      // SEMPRE perguntar ordenação após localização
      setChatState('awaiting_sort');
      
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: 'category_question',
          content: 'Como quer ordenar os resultados?',
          timestamp: new Date(),
          categoryQuestion: {
            id: 'sort_by',
            options: ['Mais relevantes', 'Menor preço', 'Maior preço'],
            category: 'sort'
          }
        }
      ]);
      
      setLoading(false);
      return;
    }
    
    // Estado: aguardando ordenaÃ§Ã£o
    if (chatState === 'awaiting_sort') {
      const sortInput = currentInput.trim().toLowerCase();
      
      // Mapear resposta do usuário para valor da API
      let sortBy = 'RELEVANCE';
      if (sortInput.includes('menor') || sortInput.includes('barato') || sortInput === '2') {
        sortBy = 'LOWEST_PRICE';
      } else if (sortInput.includes('maior') || sortInput.includes('caro') || sortInput === '3') {
        sortBy = 'HIGHEST_PRICE';
      } else if (sortInput.includes('relevante') || sortInput === '1') {
        sortBy = 'RELEVANCE';
      }
      
      console.log(`🔄 Mapeamento sortBy: "${currentInput}" → ${sortBy}`);
      
      // Se tem categoria, gerar busca final com respostas
      if (pendingSearch?.category) {
        const allAnswers = { ...categoryAnswers, sort_by: sortBy };
        console.log('ðŸ“‹ Respostas coletadas:', allAnswers);
        console.log('ðŸ—ºï¸ LocalizaÃ§Ã£o:', pendingSearch.location);
        const searchResult = buildCategoryQuery(pendingSearch.query, allAnswers, pendingSearch.location);
        console.log('ðŸ” Query final gerada:', searchResult);
        
        const confirmationMessage: Message = {
          id: crypto.randomUUID(),
          type: 'confirmation',
          content: searchResult.query,
          timestamp: new Date(),
          searchType: 'text',
          creditCost: 1,
        };
        setMessages(prev => [...prev, confirmationMessage]);
        setChatState('awaiting_confirmation');
        setLoading(false);
        return;
      }
      
      // SenÃ£o, perguntar condiÃ§Ã£o
      setPendingSearch(prev => {
        if (!prev) return prev;
        return { ...prev, sortBy };
      });
      
      const quantityMessage: Message = {
        id: crypto.randomUUID(),
        type: 'category_question',
        content: 'Quantos produtos deseja ver?',
        timestamp: new Date(),
        categoryQuestion: {
          id: 'limit',
          options: ['10 produtos', '20 produtos'],
          category: 'limit'
        }
      };
      setMessages(prev => [...prev, quantityMessage]);
      setChatState('awaiting_limit');
      setLoading(false);
      return;
    }

    // Estado: aguardando quantidade
    if (chatState === 'awaiting_limit') {
      const limitInput = currentInput.trim().toLowerCase();
      
      let limit = 10;
      if (limitInput.includes('10') || limitInput === '1') {
        limit = 10;
      } else if (limitInput.includes('20') || limitInput === '2') {
        limit = 20;
      }
      
      console.log(`🔢 Mapeamento limit: "${currentInput}" → ${limit}`);
      
      setPendingSearch(prev => {
        if (!prev) return prev;
        return { ...prev, limit };
      });
      
      // Se já tem condição detectada, pular pergunta
      if (pendingSearch?.condition) {
        console.log(`✅ Condição já detectada: ${pendingSearch.condition}`);
        const searchResult = buildFinalQuery(pendingSearch.condition);
        const confirmationMessage: Message = {
          id: crypto.randomUUID(),
          type: 'confirmation',
          content: searchResult.query,
          timestamp: new Date(),
          searchType: 'text',
          creditCost: 1,
        };
        setMessages(prev => [...prev, confirmationMessage]);
        setChatState('awaiting_confirmation');
        setLoading(false);
        return;
      }
      
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        type: 'ai',
        content: 'Produto novo ou usado?',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setChatState('awaiting_condition');
      setLoading(false);
      return;
    }

    // Estado: respondendo perguntas de categoria
    if (chatState === 'category_questions') {
      if (!pendingSearch?.category) {
        setLoading(false);
        return;
      }
      
      const categoryData = PRODUCT_CATEGORIES[pendingSearch.category];
      const providedInfo = detectProvidedInfo(pendingSearch.query);
      const remainingQuestions = filterQuestions(categoryData.questions, { ...categoryAnswers, ...providedInfo });
      
      console.log('📋 Perguntas restantes:', remainingQuestions.map(q => q.id));
      
      const currentQuestion = remainingQuestions[0];
      
      if (!currentQuestion) {
        console.log('⚠️ Pergunta não encontrada!');
        setLoading(false);
        return;
      }
      
      console.log('📋 Pergunta atual:', currentQuestion);
      console.log('📋 ID da pergunta:', currentQuestion.id);
      console.log('📋 Resposta do usuário:', currentInput);
      
      // Parse da resposta (aceita número ou texto)
      const parsedAnswer = currentQuestion.options ? 
        parseAnswer(currentInput, currentQuestion.options) : currentInput;
      
      console.log(`📝 Salvando resposta para ${currentQuestion.id}:`, parsedAnswer);
      
      // Salva resposta
      const newAnswers = { ...categoryAnswers, [currentQuestion.id]: parsedAnswer };
      setCategoryAnswers(newAnswers);
      
      console.log('📋 Todas as respostas até agora:', newAnswers);
      
      // Próxima pergunta
      if (1 < remainingQuestions.length) {
        const nextQuestion = remainingQuestions[1];
        
        console.log('➡️ Próxima pergunta:', nextQuestion.id);
        
        const questionMessage: Message = {
          id: crypto.randomUUID(),
          type: 'category_question',
          content: formatCategoryQuestion(nextQuestion),
          timestamp: new Date(),
          categoryQuestion: {
            id: nextQuestion.id,
            options: nextQuestion.options || [],
            category: pendingSearch.category
          }
        };
        
        setMessages(prev => [...prev, questionMessage]);
        setLoading(false);
        return;
      }
      
      // ✅ FIX: Todas as perguntas respondidas, perguntar localização
      console.log('✅ Todas as perguntas de categoria respondidas');
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        type: 'ai',
        content: 'location_question',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setChatState('awaiting_location');
      setLoading(false);
      return;
    }

    // Estado: aguardando condição
    if (chatState === 'awaiting_condition') {
      const condition = currentInput.toLowerCase().trim();
      console.log(`🏷️ Condição capturada: "${currentInput}" → "${condition}"`);
      
      setPendingSearch(prev => {
        if (!prev) return prev;
        return { ...prev, condition };
      });
      
      const searchResult = buildFinalQuery(condition);
      const confirmationMessage: Message = {
        id: crypto.randomUUID(),
        type: 'confirmation',
        content: searchResult.query, // Usar apenas a query string
        timestamp: new Date(),
        searchType: 'text',
        creditCost: 1,
      };
      setMessages(prev => [...prev, confirmationMessage]);
      setChatState('awaiting_confirmation');
      setLoading(false);
      return;
    }

    // Verificar créditos ANTES de processar
    if (userCredits < 1) {
      setTimeout(() => {
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          type: 'ai',
          content: '💳 Créditos insuficientes!\n\nVocê precisa de pelo menos 1 crédito para fazer buscas.\n\n📊 Nossos Planos:\n• Básico: R$ 27,00/mês (15 comparações/mês)\n• Pro: R$ 77,00/mês (48 análises/mês)\n• Business: R$ 197,00/mês (200 análises/mês)\n\n👆 Acesse Plans no menu para assinar!',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        setLoading(false);
      }, 500);
      return;
    }

    // Pipeline NLP
    setTimeout(() => {
      // 1. Corrigir erros comuns de digitação (marcas)
      const typosCorrected = correctCommonTypos(currentInput);
      
      // 2. Limpar query (remove "estou querendo", "preciso de", etc.)
      const cleaned = cleanProductQuery(typosCorrected);
      
      // 3. Detectar refinamento de busca anterior
      const refinement = detectRefinement(cleaned);
      if (refinement.isRefinement && refinement.refinedQuery) {
        console.log('🔄 Refinamento detectado:', refinement);
        // Usar query refinada
        const withContext = contextManager.applyContext(refinement.refinedQuery);
        const intent = detectIntent(withContext);
        const parsed = parseProductQuery(withContext);
        
        // Atualizar contexto do smartBot
        updateConversationContext(refinement.refinedQuery, parsed);
        
        // Continuar com o fluxo normal usando a query refinada
        handleParsedQuery(withContext, intent, parsed);
        return;
      }
      
      // 4. Aplicar contexto
      const withContext = contextManager.applyContext(cleaned);
      
      // 5. Detectar intenção
      const intent = detectIntent(withContext);
      
      // 6. Gerar resposta inteligente baseada no contexto (smartBot)
      const smartResponse = generateSmartResponse(withContext, intent);
      if (smartResponse.shouldRespond) {
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          type: 'ai',
          content: smartResponse.response || '',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setLoading(false);
        return;
      }
      
      // 7. Detectar intenção de negociação
      const negotiation = detectNegotiationIntent(withContext);
      if (negotiation.isNegotiation) {
        console.log('💰 Intenção de negociação detectada:', negotiation.type);
        // Continuar com o fluxo normal, mas logar para analytics
      }
      
      // IMPORTANTE: Tratar comandos ANTES de processar como produto
      // Tratar apresentação pessoal
      if (intent.type === 'introduction') {
        const userName = intent.userName || 'amigo(a)';
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          type: 'ai',
          content: `Prazer em conhecer você, ${userName}! 😊\n\nSou especialista em encontrar os melhores preços do Brasil!\n\n🔍 O que faço:\n• Busco em 9+ marketplaces\n• Comparo preços automaticamente\n• Encontro ofertas exclusivas\n• Filtro por localização\n\n🎯 Marketplaces:\nOLX, Mercado Livre, Amazon, Shopee, KaBuM, Enjoei e mais!\n\n💡 Que produto você está procurando hoje?`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setLoading(false);
        return; // IMPORTANTE: Parar aqui!
      }
      
      // Tratar conversa casual
      if (intent.type === 'casual_talk') {
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          type: 'ai',
          content: 'Tudo ótimo por aqui! 😊\n\nEstou pronta para te ajudar a encontrar os melhores preços!\n\n💰 Economize tempo e dinheiro:\n• Digite o produto que procura\n• Eu busco nos principais sites\n• Você escolhe a melhor oferta\n\n🔍 O que você gostaria de buscar?',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setLoading(false);
        return;
      }
      
      // Tratar saudações
      if (intent.type === 'greeting') {
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          type: 'ai',
          content: 'Olá! 👋\n\nQue bom te ver por aqui!\n\nSou a Zavlo, sua assistente de compras inteligente. Posso te ajudar a encontrar os melhores preços em diversos produtos!\n\n💡 Como funciona:\n1️⃣ Você me diz o que procura\n2️⃣ Eu busco nos melhores sites\n3️⃣ Você economiza!\n\n🛒 Que produto você está procurando?',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setLoading(false);
        return;
      }
      
      // Tratar conversas casuais (tudo bem, como vai, etc)
      if (intent.type === 'question' && /^(tudo bem|como vai|e ai|beleza|oi tudo bem|tá tudo bem)/i.test(currentInput.toLowerCase().trim())) {
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          type: 'ai',
          content: 'Tudo ótimo! 😊\n\nEstou aqui para te ajudar a encontrar os melhores preços.\n\nQue produto você está procurando?',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setLoading(false);
        return;
      }
      
      // Tratar despedidas
      if (intent.type === 'despedida') {
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          type: 'ai',
          content: 'Até mais! 👋\n\nVolte sempre que precisar buscar produtos!',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setLoading(false);
        return;
      }
      
      // Perguntas sobre créditos
      if (intent.type === 'credits_question') {
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          type: 'ai',
          content: `💰 Seus Créditos: ${userCredits}\n\n📊 Custos por busca:\n• Busca por texto: 1 crédito\n• Busca por imagem: 2 créditos\n  └ 1 crédito (identificação)\n  └ 1 crédito (busca de preços)\n\n✨ Vantagens:\n• Créditos não expiram\n• Resultados ilimitados por busca\n• Sem taxas extras\n\n${userCredits < 5 ? '⚠️ Poucos créditos restantes!\n' : ''}💡 Precisa de mais? Confira nossos planos!`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setLoading(false);
        return;
      }
      
      // Perguntas sobre planos
      if (intent.type === 'plans_question') {
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          type: 'ai',
          content: '📊 Nossos Planos:\n\n🌱 Básico - R$ 27,00/mês\n• 15 comparações/mês\n• Todos os marketplaces\n• Sem anúncios\n• Histórico 30 dias\n\n🚀 Pro - R$ 77,00/mês (Popular)\n• 48 análises/mês\n• IA que entende o produto\n• Todos os marketplaces\n• Prioridade na fila\n• Suporte WhatsApp\n\n👑 Business - R$ 197,00/mês\n• 200 análises/mês\n• API completa\n• Todas as lojas\n• Até 5 usuários\n• Relatórios avançados\n\n👆 Acesse Plans no menu para assinar!',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setLoading(false);
        return;
      }
      
      // Perguntas sobre a plataforma
      if (intent.type === 'platform_question') {
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          type: 'ai',
          content: '🤖 Sobre a Zavlo.ia:\n\nSou uma IA especializada em encontrar os melhores preços do Brasil!\n\n🔍 O que faço:\n• Busco em 9+ marketplaces\n• Comparo preços automaticamente\n• Encontro ofertas exclusivas\n• Filtro por localização\n\n🎯 Marketplaces:\nOLX, Mercado Livre, Amazon, Shopee, KaBuM, Enjoei e mais!\n\n💡 Digite um produto para começar!',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setLoading(false);
        return;
      }
      
      // Ajuda
      if (intent.type === 'help') {
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          type: 'ai',
          content: '❓ Como usar a Zavlo:\n\n🔄 Processo:\n1️⃣ Digite o produto (ex: "iPhone 15")\n2️⃣ Escolha localização (opcional)\n3️⃣ Escolha novo ou usado\n4️⃣ Confirme a busca\n\n💡 Dicas para melhores resultados:\n• Seja específico: "notebook gamer i7 16gb"\n• Use marcas: "tênis nike air max 90"\n• Inclua detalhes: "geladeira frost free 2 portas"\n\n🤖 Comandos úteis:\n• "meus créditos" - Ver saldo\n• "planos" - Ver assinaturas\n• "ajuda" - Este menu',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setLoading(false);
        return;
      }
      
      // Tratar perguntas gerais
      if (intent.type === 'question') {
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          type: 'ai',
          content: '❓ Como posso ajudar:\n\n🔍 Para buscar produtos:\n• Digite: "iPhone 15", "notebook gamer"\n• Comparo preços de 9+ sites\n\n💬 Perguntas frequentes:\n• "meus créditos" - Ver saldo\n• "planos" - Ver assinaturas\n• "como funciona" - Sobre a Zavlo\n• "ajuda" - Comandos completos\n\n🎯 O que você procura?',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setLoading(false);
        return;
      }
      
      // Se não for busca de produto, avisar
      if (intent.type !== 'search' && intent.type !== 'buy') {
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          type: 'ai',
          content: '🤔 Não entendi...\n\nTente:\n• "iPhone 15 Pro"\n• "notebook gamer"\n• "tênis nike"\n• "meus créditos"\n• "planos"\n• "ajuda"',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setLoading(false);
        return;
      }
      
      // 8. Parse do produto
      const parsed = parseProductQuery(withContext);
      
      // 9. Atualizar contexto do smartBot
      updateConversationContext(withContext, parsed);
      
      console.log('🔍 Pipeline NLP:', {
        original: currentInput,
        typosCorrected,
        cleaned,
        withContext,
        intent,
        parsed,
        refinement,
        negotiation
      });
      
      // 10. Processar query parseada
      handleParsedQuery(withContext, intent, parsed);
    }, 500);
  };

  // Função auxiliar para processar query parseada (evita duplicação)
  const handleParsedQuery = (withContext: string, intent: any, parsed: any) => {
    // 1. Verificar se é genérico
    if (parsed.isGeneric) {
        const genericMessage = handleGenericProduct(parsed.product);
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          type: 'ai',
          content: genericMessage,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setLoading(false);
        return;
      }
      
      // Detecta categoria e iniciar perguntas inteligentes (ENHANCED)
      const detectedCategory = detectProductCategory(withContext);
      const categoryConfident = isCategoryConfident(withContext);
      
      console.log('🔎 Categoria detectada:', detectedCategory, 'Confiante?', categoryConfident);
      
      const category = PRODUCT_CATEGORIES[detectedCategory] ? detectedCategory : 'universal';
      const categoryData = PRODUCT_CATEGORIES[category];
      
      // PASSO NOVO: Filtrar perguntas relevantes
      const categoryQuestions = categoryData?.questions || [];
      const relevantQuestions = categoryQuestions; // Usar todas as perguntas da categoria
      
      console.log('📋 Perguntas relevantes:', relevantQuestions.length, relevantQuestions.map(q => q.id));
      
      // Detecta informações já fornecidas (PASSA CATEGORIA)
      const providedInfo = detectProvidedInfo(withContext, category);
      console.log('📝 Informações detectadas automaticamente:', providedInfo);
      
      // Universal ou low confidence → perguntar localização (que depois pergunta ordenação)
      if (category === 'universal' || !categoryConfident || relevantQuestions.length === 0) {
        console.log('🚀 No category questions - going to location');
        
        setPendingSearch({ query: withContext, condition: providedInfo.condition });
        
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          type: 'ai',
          content: 'location_question',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setChatState('awaiting_location');
        setLoading(false);
        return;
      }
      
      // Filtra perguntas já respondidas (SOBRE relevantQuestions)
      const remainingQuestions = filterQuestions(relevantQuestions, providedInfo);
      
      if (remainingQuestions.length === 0) {
        // Todas respondidas → localização
        setPendingSearch({ query: withContext, category, condition: providedInfo.condition });
        setCategoryAnswers(providedInfo);
        
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          type: 'ai',
          content: 'location_question',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setChatState('awaiting_location');
        setLoading(false);
        return;
      }
      
      setPendingSearch({ query: withContext, category, condition: providedInfo.condition });
      setCategoryAnswers(providedInfo);
      
      const firstQuestion = remainingQuestions[0];
      const questionMessage: Message = {
        id: crypto.randomUUID(),
        type: 'category_question',
        content: formatCategoryQuestion(firstQuestion),
        timestamp: new Date(),
        categoryQuestion: {
          id: firstQuestion.id,
          options: firstQuestion.options || [],
          category
        }
      };
      
      setMessages(prev => [...prev, questionMessage]);
      setChatState('category_questions');
      setLoading(false);
      return;

      
      // 3. Verificar se precisa de localização
      if (parsed.needsLocation) {
        setPendingSearch(prev => {
          if (!prev) return { query: withContext };
          return { ...prev, query: withContext };
        });
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          type: 'ai',
          content: 'location_question',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setChatState('awaiting_location');
        setLoading(false);
        return;
      }
      
      // 4. Verificar se já tem condição ou pedir condição
      if (parsed.condition) {
        // Já tem condição, vai direto para confirmação
        setPendingSearch(prev => {
          if (!prev) return { query: withContext, condition: parsed.condition };
          return { ...prev, query: withContext, condition: parsed.condition };
        });
        const searchResult = buildSearchQuery(parsed, parsed.condition);
        const confirmationMessage: Message = {
          id: crypto.randomUUID(),
          type: 'confirmation',
          content: searchResult.query, // Usar apenas a query string
          timestamp: new Date(),
          searchType: 'text',
          creditCost: 1,
        };
        setMessages(prev => [...prev, confirmationMessage]);
        setChatState('awaiting_confirmation');
        setLoading(false);
        return;
      }
      
      // 5. Pedir condição
      setPendingSearch(prev => {
        if (!prev) return { query: withContext };
        return { ...prev, query: withContext };
      });
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        type: 'ai',
        content: 'Produto novo ou usado?',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setChatState('awaiting_condition');
      setLoading(false);
  };

const buildFinalQuery = (overrideCondition?: string): { query: string; sortBy: string; limit?: number } => {
    if (!pendingSearch) return { query: '', sortBy: 'RELEVANCE' };
    
    const priceMax = categoryAnswers?.price_max;
    const storage = categoryAnswers?.storage;
    const sortBy = categoryAnswers?.sort_by;
    const condition = overrideCondition || pendingSearch.condition;
    
    console.log(`🔍 buildFinalQuery - condition: "${condition}"`);
    
    const result = buildSearchQuery(
      parseProductQuery(pendingSearch.query),
      condition,
      pendingSearch.location,
      undefined,
      priceMax,
      storage,
      sortBy
    );
    
    console.log(`✅ buildFinalQuery - result:`, result);
    
    return {
      query: result.query || '',
      sortBy: result.sortBy || 'RELEVANCE',
      ...(pendingSearch.limit !== undefined && { limit: pendingSearch.limit })
    };
  };

  const buildCategoryQuery = (baseQuery: string, answers: CategoryAnswers, location?: string): { query: string; sortBy: string; limit?: number } => {
    const parsed = parseProductQuery(baseQuery);
    
    const condition = answers?.condition;
    const priceMax = answers?.price_max;
    const storage = answers?.storage;
    const gender = answers?.gender;
    const sortBy = answers?.sort_by;
    
    console.log('💰 buildCategoryQuery - Dados:', {
      baseQuery,
      answers,
      condition,
      priceMax,
      storage,
      gender,
      location,
      sortBy
    });
    
    const result = buildSearchQuery(
      parsed,
      condition,
      location,
      gender,
      priceMax,
      storage,
      sortBy
    );
    
    console.log('🎯 Query final gerada:', result);
    return {
      query: result.query || '',
      sortBy: result.sortBy || 'RELEVANCE',
      ...(pendingSearch?.limit !== undefined && { limit: pendingSearch.limit })
    };
  };

  const handleConfirmSearch = async () => {
    if (!pendingSearch || chatState !== 'awaiting_confirmation') return;

    const searchParams = buildFinalQuery();

    setMessages(prev => {
      const index = prev.findLastIndex(m => m.type === 'confirmation');
      if (index === -1) return prev;
      return prev.filter((_, i) => i !== index);
    });
    setChatState('searching');

    const searchingMessage: Message = {
      id: crypto.randomUUID(),
      type: 'ai',
      content: 'searching_animation',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, searchingMessage]);

    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) {
        router.push('/auth');
        return;
      }

      const userData = JSON.parse(user);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      
      // Construir URL com parâmetros
      const params = new URLSearchParams({
        query: searchParams.query,
        limit: String(searchParams.limit || 50),
        sortBy: searchParams.sortBy
      });
      
      const response = await fetch(`${API_URL}/search/text?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userData.token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('zavlo_user');
        router.push('/auth');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const products = data.results || [];
        
        if (products.length === 0) {
          const errorMessage: Message = {
            id: crypto.randomUUID(),
            type: 'ai',
            content: `❌ Nenhum produto encontrado para "${searchParams.query}".\n\n💡 Tente:\n• Ser mais específico\n• Usar sinônimos\n• Remover filtros\n\n🔍 Digite outro produto para buscar!`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
          setChatState('idle');
          setPendingSearch(null);
          return;
        }
        
        if (typeof data.remainingCredits === 'number') {
          setUserCredits(data.remainingCredits);
          const updatedUser = { ...userData, credits: data.remainingCredits };
          localStorage.setItem('zavlo_user', JSON.stringify(updatedUser));
          window.dispatchEvent(new Event('userChanged'));
        }
        
        const creditsUsed = data.creditsUsed || 1;
        const remainingCredits = data.remainingCredits ?? userCredits - 1;
        
        setTimeout(() => {
          const productsMessage: Message = {
            id: crypto.randomUUID(),
            type: 'products',
            content: `✅ Encontrei ${products.length} produtos!\n\n💳 Créditos: -${creditsUsed} | Restantes: ${remainingCredits}\n\n🔍 Quer buscar outro produto? Digite agora!`,
            products: products,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, productsMessage]);
          
          // Atualiza contexto com resultados - usa parsed.product ao invés de split
          const parsedFinal = parseProductQuery(searchParams.query);
          contextManager.update({
            lastResults: products,
            lastProduct: parsedFinal.product
          });
          
          setChatState('idle');
          setPendingSearch(null);
        }, 1000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        
        if (errorData.error === 'LIMIT_EXCEEDED') {
          const errorMessage: Message = {
            id: crypto.randomUUID(),
            type: 'ai',
            content: `🚫 Limite diário atingido!\n\nVocê atingiu o limite de buscas por texto do seu plano hoje.\n\n📊 Soluções:\n• Aguarde até amanhã para novas buscas\n• Faça upgrade do seu plano\n• Use busca por imagem (se disponível)\n\n👆 Acesse Plans no menu para fazer upgrade!`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
        } else {
          const errorMessage: Message = {
            id: crypto.randomUUID(),
            type: 'ai',
            content: 'Erro na busca. Tente novamente.',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
        }
        setChatState('idle');
        setPendingSearch(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: 'ai',
        content: 'Ops! Algo deu errado. Tente novamente.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setChatState('idle');
      setPendingSearch(null);
    }
  };

  const handleCancelSearch = () => {
    setMessages(prev => {
      const index = prev.findLastIndex(m => m.type === 'confirmation');
      if (index === -1) return prev;
      return prev.filter((_, i) => i !== index);
    });
    setChatState('idle');
    setPendingSearch(null);
    
    const cancelMessage: Message = {
      id: crypto.randomUUID(),
      type: 'ai',
      content: '🔄 Vejo que você cancelou a busca!\n\n💡 Dica: Digite o produto com o máximo de detalhes possíveis para melhores resultados.\n\nExemplos:\n• "iPhone 13 Pro 256GB"\n• "Tênis Nike Air Max 270 preto"\n• "Notebook Gamer i7 16GB RTX"',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, cancelMessage]);
  };

  return (
    <div className="h-screen bg-[#0A0A12] flex overflow-hidden">
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        userCredits={userCredits}
        isCreatingNewChat={isCreatingNewChat}
        onNewChat={createNewChat}
        onLoadChat={loadChat}
        onDeleteChat={deleteChat}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          userCredits={userCredits}
          onClearChat={createNewChat}
        />

        {messages.length === 1 && messages[0].type === 'ai' ? (
          <QuickSuggestions
            onSuggestionClick={(text) => {
              setInput(text);
              inputRef.current?.focus();
            }}
            showMoreSuggestions={showMoreSuggestions}
            onToggleMore={() => setShowMoreSuggestions(!showMoreSuggestions)}
            isIntroduction={messages[0].content.includes('como posso te chamar')}
          />
        ) : (
          <ChatMessages
            messages={messages}
            loading={loading}
            userCredits={userCredits}
            onSendMessage={handleSend}
            onImageSearchReject={handleImageSearchReject}
            onImagePriceSearch={handleImagePriceSearch}
            onExecuteImageSearch={executeImageSearch}
            onConfirmSearch={handleConfirmSearch}
            onCancelSearch={handleCancelSearch}
            isEditingQuery={isEditingQuery}
            editedQuery={editedQuery}
            onEditQueryChange={setEditedQuery}
            onStartEditQuery={() => {
              setIsEditingQuery(true);
              const lastConfirmation = messages.findLast(m => m.type === 'confirmation');
              if (lastConfirmation) setEditedQuery(lastConfirmation.content);
            }}
            onCancelEditQuery={() => {
              setIsEditingQuery(false);
              setEditedQuery('');
            }}
            onConfirmEditQuery={() => {
              setMessages(prev => {
                const updated = [...prev];
                const idx = updated.findLastIndex(m => m.type === 'confirmation');
                if (idx >= 0) updated[idx].content = editedQuery;
                return updated;
              });
              setPendingSearch(prev => prev ? { ...prev, query: editedQuery } : prev);
              setIsEditingQuery(false);
              setEditedQuery('');
            }}
            onUpdateDetectedProduct={(messageId, newName) => {
              setDetectedProductName(newName);
              setMessages(prev => {
                const updated = [...prev];
                const idx = updated.findIndex(m => m.id === messageId);
                if (idx >= 0 && updated[idx].detectedProduct) {
                  updated[idx].detectedProduct = newName;
                }
                return updated;
              });
            }}
            messagesEndRef={messagesEndRef}
          />
        )}

        <ChatInput
          input={input}
          onInputChange={setInput}
          onSend={() => handleSend()}
          onImageUpload={handleImageUpload}
          onImageSearch={handleImageSearch}
          uploadedImage={uploadedImage}
          onRemoveImage={() => {
            setUploadedImage(null);
            setImageFile(null);
          }}
          loading={loading}
          inputRef={inputRef}
          fileInputRef={fileInputRef}
        />
      </div>
    </div>
  );
}
