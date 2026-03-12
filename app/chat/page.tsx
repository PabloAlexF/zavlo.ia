'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Sparkles, Loader2, X, Check, Coins, Menu, Plus, MessageSquare, Trash2, ChevronLeft, MapPin, Trophy, Flag, Bot, HelpCircle, Hash, Search, Globe, Zap, CheckCircle2, CreditCard, ArrowRight, Image as ImageIcon, Upload, ChevronDown, Smartphone, Headphones, Laptop, Tv, Shirt, Car, Home, Book } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
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

  const [userCredits, setUserCredits] = useState(0);
  
// Sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Foca no input apenas se nenhum outro input está focado
    setTimeout(() => {
      if (document.activeElement?.tagName !== 'INPUT') {
        inputRef.current?.focus();
      }
    }, 100);
  }, [messages]);

  // Detecta teclado virtual no mobile
  useEffect(() => {
    const handleFocus = () => setIsKeyboardOpen(true);
    const handleBlur = () => setIsKeyboardOpen(false);

    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener('focus', handleFocus);
      inputElement.addEventListener('blur', handleBlur);
    }

    return () => {
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

const loadChatHistory = () => {
    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) return;
      
      const userData = JSON.parse(user);
      const userId = userData.userId;
      const saved = localStorage.getItem(`zavlo_chat_history_${userId}`);
      
      if (!saved) return;
      
      const parsedHistory = JSON.parse(saved);
      
      // Validate and filter valid chats only
      const validHistory = Array.isArray(parsedHistory) ? parsedHistory.filter(chat => {
        try {
          if (typeof chat.id !== 'string' || !chat.messages || !Array.isArray(chat.messages)) return false;
          
          // Validate and sanitize messages
          chat.messages = chat.messages.filter(msg => {
            if (!msg.content || typeof msg.content !== 'string') return false;
            
            // Remove corrupted patterns
            msg.content = msg.content
              .replace(/\}\)/g, '')
              .replace(/\}\)'/g, '')
              .replace(/\\}\\\\/g, '')
              .trim();
            
            // Skip empty messages after cleaning
            return msg.content.length > 0;
          });
          
          // Skip chats with no valid messages
          if (chat.messages.length === 0) return false;
          
          chat.createdAt = new Date(chat.createdAt);
          chat.updatedAt = new Date(chat.updatedAt);
          chat.messages.forEach((m: any) => {
            m.timestamp = new Date(m.timestamp);
          });
          return true;
        } catch {
          return false; // Skip corrupted chat
        }
      }) : [];
      
      setChatHistory(validHistory);
      console.log(`✅ Loaded ${validHistory.length} valid chats`);
      
    } catch (error) {
      console.error('❌ Failed to load chat history, clearing:', error);
      // Clear corrupted data
      const user = localStorage.getItem('zavlo_user');
      if (user) {
        const userData = JSON.parse(user);
        localStorage.removeItem(`zavlo_chat_history_${userData.userId}`);
      }
      setChatHistory([]);
    }
    
    // Always ensure we have a current chat
    if (!currentChatId) {
      const newChatId = Date.now().toString();
      setCurrentChatId(newChatId);
    }
  };

  const saveChatToHistory = () => {
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
        
        localStorage.setItem(`zavlo_chat_history_${userId}`, JSON.stringify(updatedHistory));
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


  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = chatHistory.filter(c => c.id !== chatId);
    setChatHistory(updatedHistory);
    
    const user = localStorage.getItem('zavlo_user');
    if (user) {
      const userData = JSON.parse(user);
      const userId = userData.userId;
      localStorage.setItem(`zavlo_chat_history_${userId}`, JSON.stringify(updatedHistory));
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
          options: ['10 produtos', '20 produtos', '50 produtos', '100 produtos'],
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
      
      let limit = 50;
      if (limitInput.includes('10') || limitInput === '1') {
        limit = 10;
      } else if (limitInput.includes('20') || limitInput === '2') {
        limit = 20;
      } else if (limitInput.includes('50') || limitInput === '3') {
        limit = 50;
      } else if (limitInput.includes('100') || limitInput === '4') {
        limit = 100;
      }
      
      console.log(`🔢 Mapeamento limit: "${currentInput}" → ${limit}`);
      
      setPendingSearch(prev => {
        if (!prev) return prev;
        return { ...prev, limit };
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
      } else {
        // Todas as perguntas respondidas, perguntar localização
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
          content: '💳 Créditos insuficientes!\n\nVocê precisa de pelo menos 1 crédito para fazer buscas.\n\n📊 Nossos Planos:\n• Básico: R$ 9,90/mês (50 buscas)\n• Pro: R$ 19,90/mês (150 buscas)\n• Premium: R$ 39,90/mês (ilimitadas)\n\n👆 Acesse Plans no menu para assinar!',
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
          content: '📊 Nossos Planos:\n\n🌱 Básico - R$ 9,90/mês\n• 50 buscas mensais\n• Suporte por email\n\n🚀 Pro - R$ 19,90/mês\n• 150 buscas mensais\n• Suporte prioritário\n• Alertas de preço\n\n👑 Premium - R$ 39,90/mês\n• Buscas ilimitadas\n• Suporte 24/7\n• Alertas avançados\n• API access\n\n👆 Acesse Plans no menu para assinar!',
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
      
      // 2. Detectar categoria e iniciar perguntas inteligentes (ENHANCED)
      const detectedCategory = detectProductCategory(withContext);
      const categoryConfident = isCategoryConfident(withContext);
      
      console.log('🔎 Categoria detectada:', detectedCategory, 'Confiante?', categoryConfident);
      
      const category = PRODUCT_CATEGORIES[detectedCategory] ? detectedCategory : 'universal';
      const categoryData = PRODUCT_CATEGORIES[category];
      
      // PASSO NOVO: Filtrar perguntas relevantes
      const categoryQuestions = categoryData?.questions || [];
      const relevantQuestions = categoryQuestions; // Usar todas as perguntas da categoria
      
      console.log('📋 Perguntas relevantes:', relevantQuestions.length, relevantQuestions.map(q => q.id));
      
      // Universal ou low confidence → perguntar localização (que depois pergunta ordenação)
      if (category === 'universal' || !categoryConfident || relevantQuestions.length === 0) {
        console.log('🚀 No category questions - going to location');
        
        setPendingSearch({ query: withContext });
        
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
      
      // Detecta informações já fornecidas
      const providedInfo = detectProvidedInfo(withContext);
      
      // Filtra perguntas já respondidas (SOBRE relevantQuestions)
      const remainingQuestions = filterQuestions(relevantQuestions, providedInfo);
      
      if (remainingQuestions.length === 0) {
        // Todas respondidas → localização
        setPendingSearch({ query: withContext, category });
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
      
      setPendingSearch({ query: withContext, category });
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

const buildFinalQuery = (overrideCondition?: string): { query: string; sortBy: string; limit?: number; minPrice?: number; maxPrice?: number } => {
    if (!pendingSearch) return { query: '', sortBy: 'RELEVANCE' };
    
    const priceMax = categoryAnswers?.price_max;
    const storage = categoryAnswers?.storage;
    const sortBy = categoryAnswers?.sort_by;
    const condition = overrideCondition || pendingSearch.condition; // ✅ Usar override se fornecido
    
    console.log(`🔍 buildFinalQuery - condition: "${condition}"`);
    
    const result = buildSearchQuery(
      parseProductQuery(pendingSearch.query),
      condition, // ✅ Usar a condição correta
      pendingSearch.location,
      undefined, // gender
      priceMax,
      storage,
      sortBy
    );
    
    console.log(`✅ buildFinalQuery - result.query: "${result.query}"`);
    
    console.log(`✅ buildFinalQuery - result.query: "${result.query}"`);
    
    return {
      ...result,
      ...(pendingSearch.limit !== undefined && { limit: pendingSearch.limit }),
      ...(pendingSearch.minPrice !== undefined && { minPrice: pendingSearch.minPrice }),
      ...(pendingSearch.maxPrice !== undefined && { maxPrice: pendingSearch.maxPrice })
    };
  };

  const buildCategoryQuery = (baseQuery: string, answers: CategoryAnswers, location?: string): { query: string; sortBy: string; minPrice?: number; maxPrice?: number } => {
    // Parse do produto
    const parsed = parseProductQuery(baseQuery);
    
    // Extrai dados das respostas
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
    
    // Usa buildSearchQuery com Google Query Builder
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
    return result;
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
        limit: String(searchParams.limit || 50), // ✅ Usar limit do pendingSearch
        sortBy: searchParams.sortBy
      });
      
      // ✅ Usar !== undefined ao invés de truthy check
      if (searchParams.minPrice !== undefined) {
        params.append('minPrice', String(searchParams.minPrice));
      }
      if (searchParams.maxPrice !== undefined) {
        params.append('maxPrice', String(searchParams.maxPrice));
      }
      
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
    <div className="h-screen bg-gradient-to-br from-[#0A0A0F] via-[#0F0F14] to-[#0A0A0F] flex overflow-hidden">
      {/* Espaçador para o header global */}
      <div className="h-16 w-full fixed top-0 left-0 right-0 z-0" />
      
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="w-72 border-r border-white/5 bg-black/40 backdrop-blur-2xl flex flex-col fixed md:relative z-[45]"
            style={{ 
              top: '4rem',
              bottom: 0,
              height: 'calc(100vh - 4rem)'
            }}
          >
            {/* Header da Sidebar */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <h2 className="text-sm font-semibold text-white">Conversas</h2>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* New Chat Button */}
            <div className="p-3">


                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    createNewChat();
                  }}
                  disabled={isCreatingNewChat}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 border border-white/10 rounded-xl text-white transition-all text-sm font-medium shadow-lg shadow-blue-500/5 ${isCreatingNewChat ? 'bg-gray-500/30 cursor-not-allowed opacity-70' : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20'}`}
                >

                  {isCreatingNewChat ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Nova conversa
                    </>
                  )}
                </motion.button>

            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
              {chatHistory.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-white/10"
                  >
                    <MessageSquare className="w-8 h-8 text-gray-500" />
                  </motion.div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Nenhuma conversa</p>
                  <p className="text-xs text-gray-600">Inicie uma nova busca!</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {chatHistory.map((chat, index) => (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 2 }}
                      className={`group relative p-3 rounded-xl transition-all cursor-pointer ${
                        currentChatId === chat.id
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                          : 'hover:bg-white/5 border border-transparent hover:border-white/10'
                      }`}
                      onClick={() => loadChat(chat.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 transition-all ${
                          currentChatId === chat.id 
                            ? 'bg-blue-400 shadow-lg shadow-blue-400/50' 
                            : 'bg-gray-600 group-hover:bg-gray-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-300 group-hover:text-white truncate transition-colors font-medium">
                            {chat.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {chat.messages.length} mensagens
                          </p>
                        </div>
                        <button
                          onClick={(e) => deleteChat(chat.id, e)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-red-500/20 rounded-lg transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                          aria-label="Deletar conversa"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-400 transition-colors" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer da Sidebar */}
            <div className="p-3 border-t border-white/5 bg-black/20">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Coins className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Créditos</p>
                  <p className="text-sm font-semibold text-white">{userCredits}</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bg-black/80 backdrop-blur-sm z-[44] md:hidden"
            style={{ 
              top: '4rem',
              left: 0,
              right: 0,
              bottom: 0
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ marginTop: '4rem', height: 'calc(100vh - 4rem)' }}>
        {/* Header com Hamburguer - Logo abaixo do header global */}
        <div className="border-b border-white/5 bg-black/95 backdrop-blur-2xl px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 rounded-xl flex-shrink-0 transition-all border-2 border-blue-500/30 hover:border-blue-500/50 shadow-xl shadow-blue-500/20"
              aria-label="Toggle sidebar"
            >
              <motion.div
                animate={{ rotate: sidebarOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6 text-blue-400" />
                ) : (
                  <Menu className="w-6 h-6 text-blue-400" />
                )}
              </motion.div>
            </motion.button>
            <div className="flex items-center gap-3 min-w-0">
              <Image 
                src="/assets/icons/logo.ico" 
                alt="Zavlo AI" 
                width={36} 
                height={36}
                className="rounded-2xl flex-shrink-0 shadow-lg shadow-purple-500/20"
              />
              <div className="min-w-0">
                <h1 className="text-sm font-semibold text-white truncate">Zavlo AI</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Assistente de Compras</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl shadow-lg shadow-yellow-500/5"
            >
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-semibold text-white">{userCredits}</span>
            </motion.div>
          </div>
        </div>

        {/* Messages */}
        <div 
          className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 py-4 sm:py-6" 
          style={{ 
            WebkitOverflowScrolling: 'touch',
            paddingBottom: isKeyboardOpen ? '120px' : '0px'
          }}
        >
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 1 && messages[0].type === 'ai' && (
              <div className="flex flex-col items-center gap-3 sm:gap-4 mt-4 sm:mt-8">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <p className="text-sm sm:text-base font-semibold text-white">Sugestões Rápidas</p>
                </div>
                
                {/* Sugestões de apresentação */}
                {messages[0].content.includes('como posso te chamar') && (
                  <div className="grid grid-cols-1 gap-2 w-full max-w-2xl">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const name = prompt('👋 Qual é o seu nome?');
                        if (name) {
                          setInput(`Meu nome é ${name}`);
                          inputRef.current?.focus();
                        }
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl text-white transition-all hover:shadow-lg"
                    >
                      <span className="text-sm sm:text-base font-medium">👤 Me apresentar</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setInput('Quero buscar um produto');
                        inputRef.current?.focus();
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl text-white transition-all hover:shadow-lg"
                    >
                      <span className="text-sm sm:text-base font-medium">🛒 Começar a buscar</span>
                    </motion.button>
                  </div>
                )}
                
                {/* Sugestões principais de produtos */}
                {!messages[0].content.includes('como posso te chamar') && (
                  <div className="grid grid-cols-2 gap-2 w-full max-w-2xl">
                  {[
                    { icon: <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />, text: 'iPhone 15 Pro', color: 'from-blue-500/20 to-purple-500/20 border-blue-500/30' },
                    { icon: <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />, text: 'Fone até R$ 200', color: 'from-green-500/20 to-emerald-500/20 border-green-500/30' },
                    { icon: <Laptop className="w-4 h-4 sm:w-5 sm:h-5" />, text: 'Notebook Gamer', color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30' },
                    { icon: <Tv className="w-4 h-4 sm:w-5 sm:h-5" />, text: 'Smart TV 50"', color: 'from-orange-500/20 to-red-500/20 border-orange-500/30' }
                  ].map((suggestion, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowMoreSuggestions(false);
                        setInput(suggestion.text);
                        inputRef.current?.focus();
                      }}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-3 sm:py-3.5 bg-gradient-to-br ${suggestion.color} border rounded-xl text-white transition-all hover:shadow-lg`}
                    >
                      {suggestion.icon}
                      <span className="truncate text-sm sm:text-base font-medium">{suggestion.text}</span>
                    </motion.button>
                  ))}
                  </div>
                )}

                {/* Dropdown de mais sugestões */}
                <div className="w-full max-w-2xl">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setShowMoreSuggestions(!showMoreSuggestions)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-colors"
                  >
                    <span className="text-sm sm:text-base font-medium">Mais sugestões</span>
                    <motion.div
                      animate={{ rotate: showMoreSuggestions ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {showMoreSuggestions && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 space-y-3">
                          {/* Eletrônicos */}
                          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="w-5 h-5 text-yellow-400" />
                              <h3 className="text-sm font-semibold text-gray-300">Eletrônicos</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { icon: <Smartphone className="w-4 h-4" />, text: 'Samsung Galaxy S24' },
                                { icon: <Laptop className="w-4 h-4" />, text: 'MacBook Air M2' },
                                { icon: <Headphones className="w-4 h-4" />, text: 'AirPods Pro' },
                                { icon: <Tv className="w-4 h-4" />, text: 'PS5 Digital' }
                              ].map((item, i) => (
                                <button
                                  key={i}
                                  onClick={() => { setInput(item.text); setShowMoreSuggestions(false); inputRef.current?.focus(); }}
                                  className="flex items-center gap-2 px-2.5 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors text-left"
                                >
                                  <div className="flex-shrink-0">{item.icon}</div>
                                  <span className="text-xs sm:text-sm truncate">{item.text}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Moda */}
                          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Shirt className="w-5 h-5 text-pink-400" />
                              <h3 className="text-sm font-semibold text-gray-300">Moda</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { text: 'Tênis Nike Air Max' },
                                { text: 'Jaqueta de couro' },
                                { text: 'Relógio Casio' },
                                { text: 'Óculos Ray-Ban' }
                              ].map((item, i) => (
                                <button
                                  key={i}
                                  onClick={() => { setInput(item.text); setShowMoreSuggestions(false); inputRef.current?.focus(); }}
                                  className="flex items-center gap-2 px-2.5 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors text-left"
                                >
                                  <Shirt className="w-4 h-4 flex-shrink-0" />
                                  <span className="text-xs sm:text-sm truncate">{item.text}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Veículos */}
                          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Car className="w-5 h-5 text-blue-400" />
                              <h3 className="text-sm font-semibold text-gray-300">Veículos</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { text: 'Honda Civic 2020' },
                                { text: 'Moto Honda CG' },
                                { text: 'Corolla 2019' },
                                { text: 'Gol G7' }
                              ].map((item, i) => (
                                <button
                                  key={i}
                                  onClick={() => { setInput(item.text); setShowMoreSuggestions(false); inputRef.current?.focus(); }}
                                  className="flex items-center gap-2 px-2.5 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors text-left"
                                >
                                  <Car className="w-4 h-4 flex-shrink-0" />
                                  <span className="text-xs sm:text-sm truncate">{item.text}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Ajuda */}
                          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <HelpCircle className="w-5 h-5 text-purple-400" />
                              <h3 className="text-sm font-semibold text-gray-300">Comandos</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { icon: <CreditCard className="w-4 h-4" />, text: 'meus créditos' },
                                { icon: <Trophy className="w-4 h-4" />, text: 'planos' },
                                { icon: <Bot className="w-4 h-4" />, text: 'como funciona' },
                                { icon: <HelpCircle className="w-4 h-4" />, text: 'ajuda' }
                              ].map((item, i) => (
                                <button
                                  key={i}
                                  onClick={() => { setInput(item.text); setShowMoreSuggestions(false); inputRef.current?.focus(); }}
                                  className="flex items-center gap-2 px-2.5 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors text-left"
                                >
                                  <div className="flex-shrink-0">{item.icon}</div>
                                  <span className="text-xs sm:text-sm truncate">{item.text}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
            
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {message.type === 'user' && (
                    <motion.div 
                      className="flex justify-end"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className="bg-blue-500/90 backdrop-blur-xl rounded-2xl rounded-tr-sm px-5 py-3.5 max-w-[85%] shadow-lg border border-blue-400/20">
                        {message.imageData && (
                          <div className="mb-3">
                            <img 
                              src={message.imageData} 
                              alt="Imagem enviada" 
                              className="rounded-xl max-w-[200px] border border-white/20"
                            />
                          </div>
                        )}
                        <p className="text-white whitespace-pre-wrap text-sm break-words">{message.content}</p>
                      </div>
                    </motion.div>
                  )}

                  {message.type === 'ai' && (
                    <motion.div 
                      className="flex justify-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className="w-9 h-9 bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-2xl rounded-tl-sm px-5 py-4 max-w-[85%]">
                        {message.content === 'searching_animation' ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-10 h-10 bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 rounded-xl flex items-center justify-center"
                              >
                                <Search className="w-5 h-5 text-blue-400" />
                              </motion.div>
                              <div>
                                <span className="text-white font-medium text-sm">Buscando produtos</span>
                                <p className="text-gray-500 text-xs mt-0.5">Aguarde alguns instantes</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <motion.div 
                                className="flex items-center gap-3 p-3 bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-xl"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                              >
                                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                                <span className="text-gray-300 text-sm">Analisando marketplaces</span>
                              </motion.div>
                              
                              <motion.div 
                                className="flex items-center gap-3 p-3 bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-xl"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                              >
                                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                                <span className="text-gray-300 text-sm">Comparando preços</span>
                              </motion.div>
                              
                              <motion.div 
                                className="flex items-center gap-3 p-3 bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-xl"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                              >
                                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                                <span className="text-gray-300 text-sm">Organizando resultados</span>
                              </motion.div>
                            </div>
                          </div>
                        ) : message.content === 'location_question' ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2.5">
                              <MapPin className="w-4 h-4 text-blue-400" />
                              <span className="text-white font-medium text-sm">Localização</span>
                            </div>
                            
                            <p className="text-gray-300 text-sm">Quer buscar em alguma região específica?</p>
                            
                            <div className="space-y-2">
                              <button
                                onClick={() => handleSend('São Paulo')}
                                className="w-full text-left px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] backdrop-blur-xl border border-white/10 rounded-xl text-gray-300 text-sm transition-colors"
                              >
                                São Paulo
                              </button>
                              <button
                                onClick={() => handleSend('Rio de Janeiro')}
                                className="w-full text-left px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] backdrop-blur-xl border border-white/10 rounded-xl text-gray-300 text-sm transition-colors"
                              >
                                Rio de Janeiro
                              </button>
                              <button
                                onClick={() => handleSend('Minas Gerais')}
                                className="w-full text-left px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] backdrop-blur-xl border border-white/10 rounded-xl text-gray-300 text-sm transition-colors"
                              >
                                Minas Gerais
                              </button>
                            </div>
                            
                            <button
                              onClick={() => handleSend('não')}
                              className="w-full px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] backdrop-blur-xl border border-white/10 rounded-xl text-white text-sm font-medium transition-colors"
                            >
                              Buscar em todo Brasil
                            </button>
                          </div>
                        ) : (
                          <p className="text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {message.type === 'category_question' && (
                    <div className="flex justify-start">
                      <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-2xl rounded-tl-sm p-5 max-w-lg w-full">
                        <div className="flex items-center gap-2.5 mb-4">
                          <Bot className="w-4 h-4 text-blue-400" />
                          <span className="text-white font-medium text-sm">{message.content}</span>
                        </div>
                        
                        {message.categoryQuestion?.options && (
                          <div className="space-y-2">
                            {message.categoryQuestion.options.map((option, i) => (
                              <motion.button
                                key={i}
                                onClick={() => handleSend(option)}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className="w-full px-4 py-3 bg-white/[0.06] hover:bg-white/[0.1] backdrop-blur-xl border border-white/10 rounded-xl text-gray-300 text-sm text-left transition-colors"
                              >
                                {option}
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {message.type === 'image_confirmation' && (
                    <div className="flex justify-start">
                      <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-2xl rounded-tl-sm p-5 max-w-lg w-full">
                        <div className="flex items-center gap-2.5 mb-4">
                          <Sparkles className="w-4 h-4 text-blue-400" />
                          <span className="text-white font-medium text-sm">Produto identificado</span>
                        </div>
                        
                        <div className="mb-4 p-4 bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-xl">
                          <input
                            type="text"
                            defaultValue={message.detectedProduct}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                              if (e.key === 'Enter') {
                                const newName = (e.target as HTMLInputElement).value;
                                setDetectedProductName(newName);
                                setMessages(prev => {
                                  const updated = [...prev];
                                  const idx = updated.findIndex(m => m.id === message.id);
                                  if (idx >= 0 && updated[idx].detectedProduct) {
                                    updated[idx].detectedProduct = newName;
                                  }
                                  return updated;
                                });
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            className="w-full bg-transparent text-white text-sm outline-none border-b border-white/10 focus:border-blue-400/50 pb-2 transition-colors"
                            placeholder="Edite o nome do produto..."
                          />
                          <p className="text-gray-500 text-xs mt-2">Pressione Enter para salvar</p>
                        </div>
                        
                        <div className="space-y-2 mb-4 p-3 bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-xl">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Identificação</span>
                            <span className="text-white">-{message.creditCost || 1} crédito</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Busca de preços</span>
                            <span className="text-white">+1 crédito</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={handleImageSearchReject}
                            disabled={loading || chatState === 'searching'}
                            className="flex-1 px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] backdrop-blur-xl border border-white/10 rounded-xl text-gray-300 text-sm transition-colors"
                          >
                            Não
                          </button>
                          <button
                            onClick={handleImagePriceSearch}
                            disabled={loading || chatState === 'searching'}
                            className="flex-1 px-4 py-2.5 bg-blue-500/90 hover:bg-blue-500 backdrop-blur-xl border border-blue-400/20 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            Sim, buscar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {message.type === 'sort_question' && (
                    <div className="flex justify-start">
                      <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-2xl rounded-tl-sm p-5 max-w-lg w-full">
                        <div className="flex items-center gap-2.5 mb-4">
                          <Sparkles className="w-4 h-4 text-blue-400" />
                          <span className="text-white font-medium text-sm">{message.content}</span>
                        </div>
                        
                        <div className="space-y-2">
                          <button
                            onClick={() => executeImageSearch('BEST_MATCH')}
                            disabled={loading}
                            className="w-full px-4 py-3 bg-white/[0.06] hover:bg-white/[0.1] backdrop-blur-xl border border-white/10 rounded-xl text-left transition-colors disabled:opacity-50"
                          >
                            <div className="text-white text-sm font-medium">Maior relevância</div>
                            <div className="text-gray-500 text-xs mt-0.5">Produtos mais relacionados</div>
                          </button>
                          
                          <button
                            onClick={() => executeImageSearch('LOWEST_PRICE')}
                            disabled={loading}
                            className="w-full px-4 py-3 bg-white/[0.06] hover:bg-white/[0.1] backdrop-blur-xl border border-white/10 rounded-xl text-left transition-colors disabled:opacity-50"
                          >
                            <div className="text-white text-sm font-medium">Menor preço</div>
                            <div className="text-gray-500 text-xs mt-0.5">Do mais barato ao mais caro</div>
                          </button>
                          
                          <button
                            onClick={() => executeImageSearch('HIGHEST_PRICE')}
                            disabled={loading}
                            className="w-full px-4 py-3 bg-white/[0.06] hover:bg-white/[0.1] backdrop-blur-xl border border-white/10 rounded-xl text-left transition-colors disabled:opacity-50"
                          >
                            <div className="text-white text-sm font-medium">Maior preço</div>
                            <div className="text-gray-500 text-xs mt-0.5">Do mais caro ao mais barato</div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {message.type === 'confirmation' && (
                    <div className="flex justify-start">
                      <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-2xl rounded-tl-sm p-5 max-w-lg w-full">
                        <div className="flex items-center gap-2.5 mb-4">
                          <Search className="w-4 h-4 text-blue-400" />
                          <span className="text-white font-medium text-sm">Confirmar busca</span>
                        </div>
                        
                        <div className="mb-4 p-4 bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-xl">
                          <input
                            type="text"
                            defaultValue={message.content}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              setMessages(prev => {
                                const updated = [...prev];
                                const idx = updated.findIndex(m => m.id === message.id);
                                if (idx >= 0) updated[idx].content = e.target.value;
                                return updated;
                              });
                            }}
                            className="w-full bg-transparent text-white text-base outline-none border-b border-white/10 focus:border-blue-400/50 pb-2 transition-colors"
                            placeholder="Edite a busca..."
                          />
                          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Custo: 1 crédito</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={handleCancelSearch}
                            className="flex-1 px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] backdrop-blur-xl border border-white/10 rounded-xl text-gray-300 text-sm transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleConfirmSearch}
                            disabled={loading || chatState === 'searching'}
                            className="flex-1 px-4 py-2.5 bg-blue-500/90 hover:bg-blue-500 backdrop-blur-xl border border-blue-400/20 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            Confirmar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {message.type === 'products' && (
                    <div className="space-y-3 sm:space-y-4">
                      {message.products && message.products.length > 0 && (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                            {message.products.map((product, idx) => (
                              <ProductCard key={product.id || idx} product={product} />
                            ))}
                          </div>
                          
                          {/* Success Message */}
                          <div className="flex justify-center">
                            <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-2xl w-full">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                                  </div>
                                  <div>
                                    <h3 className="text-white font-semibold text-sm sm:text-base">Busca concluída!</h3>
                                    <p className="text-gray-400 text-xs sm:text-sm">Encontramos {message.products.length} produtos para você</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-black/20 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 gap-3 sm:gap-0">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
                                  <div>
                                    <p className="text-gray-400 text-[10px] sm:text-xs">Créditos utilizados</p>
                                    <p className="text-white font-semibold text-xs sm:text-base">-1 crédito</p>
                                  </div>
                                </div>
                                <div className="h-px w-full sm:h-8 sm:w-px bg-white/10" />
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
                                  <div>
                                    <p className="text-gray-400 text-[10px] sm:text-xs">Saldo restante</p>
                                    <p className="text-white font-semibold text-xs sm:text-base">{message.content.match(/Restantes: (\d+)/)?.[1] || userCredits} créditos</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-300 text-xs sm:text-sm">
                                <Search className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                                <span className="text-[11px] sm:text-sm">Quer buscar outro produto?</span>
                                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 hidden sm:block" />
                                <span className="text-white font-medium text-[11px] sm:text-sm">Digite agora!</span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    <span className="text-gray-400 text-sm">Processando...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div 
          ref={inputContainerRef}
          className="input-container-mobile border-t border-white/5 bg-black/95 backdrop-blur-2xl p-3 sm:p-4 flex-shrink-0 sticky bottom-0 left-0 right-0 z-50"
        >
          <div className="max-w-4xl mx-auto">
            <AnimatePresence>
              {uploadedImage && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  className="mb-2"
                >
                  <div className="relative inline-block">
                    <img 
                      src={uploadedImage} 
                      alt="Preview" 
                      className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-xl border-2 border-blue-500/50 shadow-lg shadow-blue-500/20"
                    />
                    <motion.button
                      onClick={() => {
                        setUploadedImage(null);
                        setImageFile(null);
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full hover:bg-red-600 transition shadow-lg"
                    >
                      <X className="w-3 h-3 text-white" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-white disabled:opacity-50 transition-all flex-shrink-0 shadow-lg"
                title="Buscar por imagem"
              >
                <ImageIcon className="w-5 h-5" />
              </motion.button>
              
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                onFocus={() => {
                  setIsKeyboardOpen(true);
                  setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                  }, 300);
                }}
                onBlur={() => {
                  setTimeout(() => setIsKeyboardOpen(false), 100);
                }}
                placeholder={uploadedImage ? "Ou digite..." : "Digite um produto..."}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-blue-500/50 focus:bg-white/10 text-sm transition-all backdrop-blur-xl min-w-0"
                disabled={loading}
              />
              
              {uploadedImage ? (
                <motion.button
                  onClick={handleImageSearch}
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-purple-500/30 flex-shrink-0 font-medium"
                >
                  <Search className="w-5 h-5" />
                  <span className="text-sm hidden sm:inline">Buscar</span>
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/30 flex-shrink-0 font-medium"
                >
                  <Send className="w-5 h-5" />
                  <span className="text-sm hidden sm:inline">Enviar</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
