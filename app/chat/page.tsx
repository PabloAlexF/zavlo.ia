'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { QuickSuggestions } from '@/components/chat/QuickSuggestions';

import { detectIntent } from '@/utils/chat/intentDetector';
import { contextManager } from '@/utils/chat/contextManager';
import { chatHistoryService } from '@/lib/chatHistory';
import { PLAN_PRICES, PLAN_CREDITS } from '@/lib/plans';

const API_BASE = (() => {
  const raw = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');
  try {
    new URL(raw);
    return raw;
  } catch {
    throw new Error(`NEXT_PUBLIC_API_URL inválida: "${raw}"`);
  }
})();

function apiUrl(path: string): string {
  return `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
}

interface Message {
  id: string;
  type: 'user' | 'ai' | 'products' | 'image_confirmation' | 'sort_question' | 'question' | 'expansion';
  content: string;
  products?: any[];
  timestamp: Date;
  creditCost?: number;
  imageData?: string;
  detectedProduct?: string;
  priceRangeApplied?: { min?: number; max?: number; target?: number };
  questionType?: string;
  questionSuggestions?: { label: string; min?: number; max?: number; value?: string }[];
  userLocation?: { city?: string; state?: string };
  expansionSources?: string[];
  primarySource?: string;
  isVehicle?: boolean;
}

interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

function getNextQuestion(
  field: string,
  classification: any,
): string | { question: string; suggestions?: any[] } {
  if (field === 'condition') return 'Você prefere novo ou usado?';
  if (field === 'year')      return 'De qual ano? (Ex: 2020, 2018-2022)';
  if (field === 'location')  return 'Em qual cidade você está procurando? (ou "todo o Brasil")';
  if (field === 'price_range') {
    const smartQ = classification?.suggested_question;
    return (smartQ && typeof smartQ === 'object') ? smartQ : {
      question: 'Qual sua faixa de preço?',
      suggestions: [
        { label: 'até 30mil', max: 30000 },
        { label: 'até 50mil', max: 50000 },
        { label: 'até 80mil', max: 80000 },
        { label: 'acima de 80mil', min: 80000 },
      ],
    };
  }
  // Campos não-veículo: a pergunta e sugestões vêm do Python via classification.suggested_question
  // Se disponível, usar; senão fallback genérico
  if (['gender', 'size', 'storage', 'transmission', 'fuel', 'body_type', 'brand', 'shoe_type'].includes(field)) {
    const smartQ = classification?.suggested_question;
    if (smartQ && typeof smartQ === 'object') return smartQ;
    const fallbacks: Record<string, { question: string; suggestions: any[] }> = {
      gender:  { question: 'Para quem é?', suggestions: [
        { label: '👨 Masculino', value: 'masculino' },
        { label: '👩 Feminino',  value: 'feminino' },
        { label: '🧒 Infantil',  value: 'infantil' },
        { label: '🔀 Unissex',   value: 'unissex' },
      ]},
      size:    { question: 'Qual tamanho/número?', suggestions: [
        { label: 'P / 36-37', value: 'P 36' },
        { label: 'M / 38-39', value: 'M 38' },
        { label: 'G / 40-41', value: 'G 40' },
        { label: 'GG / 42+',  value: 'GG 42' },
      ]},
      storage: { question: 'Qual capacidade de armazenamento?', suggestions: [
        { label: '64 GB',  value: '64gb' },
        { label: '128 GB', value: '128gb' },
        { label: '256 GB', value: '256gb' },
        { label: '512 GB', value: '512gb' },
      ]},
      transmission: { question: 'Qual câmbio você prefere?', suggestions: [
        { label: '⚙️ Manual',     value: 'manual' },
        { label: '🤖 Automático', value: 'automatico' },
        { label: '🔀 Tanto faz',  value: 'qualquer' },
      ]},
      fuel: { question: 'Qual combustível você prefere?', suggestions: [
        { label: '⛽ Flex',      value: 'flex' },
        { label: '🛢️ Diesel',    value: 'diesel' },
        { label: '⚡ Elétrico',  value: 'eletrico' },
        { label: '🔀 Tanto faz', value: 'qualquer' },
      ]},
      body_type: { question: 'Qual estilo de carroceria?', suggestions: [
        { label: '🚗 Hatch',    value: 'hatch' },
        { label: '🚙 Sedan',    value: 'sedan' },
        { label: '🛻 SUV',      value: 'suv' },
        { label: '🚐 Pickup',   value: 'pickup' },
        { label: '🔀 Tanto faz', value: 'qualquer' },
      ]},
      brand: { question: 'Tem preferência de marca?', suggestions: [
        { label: '🔀 Sem preferência', value: 'qualquer' },
      ]},
      shoe_type: { question: 'Que tipo de calçado?', suggestions: [
        { label: '👟 Tênis',    value: 'tenis' },
        { label: '👢 Bota',     value: 'bota' },
        { label: '👡 Sandália', value: 'sandalia' },
        { label: '🥿 Sapatilha', value: 'sapatilha' },
      ]},
    };
    return fallbacks[field] ?? field;
  }
  return field;
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Olá! 👋 Eu sou a Zavlo, sua assistente de compras inteligente!\n\nQue produto você está procurando?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Image search states
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [detectedProductName, setDetectedProductName] = useState<string>('');
  const [awaitingImageConfirmation, setAwaitingImageConfirmation] = useState(false);
  const [awaitingImageSort, setAwaitingImageSort] = useState(false);
  
  // Search session — estado centralizado (evita dessincronia)
  const [searchSession, setSearchSession] = useState<{
    query: string;
    classification: any;
    missingFields: string[];
    answers: Record<string, string>;
    step: 'idle' | 'asking';
    expansionSources: string[];
    primarySource: string;
    sortBy: string;
  }>({
    query: '',
    classification: null,
    missingFields: [],
    answers: {},
    step: 'idle',
    expansionSources: [],
    primarySource: '',
    sortBy: 'BEST_MATCH',
  });



  const [userCredits, setUserCredits] = useState(0);
  const userCreditsRef = useRef(0);
  
  // Sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Refs para evitar stale closure no saveChatToHistory
  const messagesRef = useRef(messages);
  const chatHistoryRef = useRef(chatHistory);
  const currentChatIdRef = useRef(currentChatId);
  const sortByRef = useRef(searchSession.sortBy);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { chatHistoryRef.current = chatHistory; }, [chatHistory]);
  useEffect(() => { currentChatIdRef.current = currentChatId; }, [currentChatId]);
  useEffect(() => { sortByRef.current = searchSession.sortBy; }, [searchSession.sortBy]);

  useEffect(() => {
    if (messages.length > 1) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    }
  }, [messages.length]);

  useEffect(() => {
    const user = localStorage.getItem('zavlo_user');
    if (!user) {
      router.push('/auth');
      return;
    }
    loadUserCredits();
    loadChatHistory();

    const handleUserChanged = () => loadUserCredits();
    window.addEventListener('userChanged', handleUserChanged);
    return () => window.removeEventListener('userChanged', handleUserChanged);
  }, []);

  useEffect(() => {
    if (!currentChatId || messages.length <= 1) return;
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled) saveChatToHistory();
    }, 2000);
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [messages.length, currentChatId]);

  const loadUserCredits = async () => {
    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) return;
      const userData = JSON.parse(user);
      const response = await fetch(apiUrl('/users/profile'), {
        headers: { 'Authorization': `Bearer ${userData.token}` },
      });
      if (response.ok) {
        const profile = await response.json();
        const credits = profile.credits || 0;
        setUserCredits(credits);
        userCreditsRef.current = credits;
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
        setCurrentChatId(id => id || Date.now().toString());
        return;
      }
      
      const userData = JSON.parse(user);
      const userId = userData.userId;
      
      try {
        const firestoreHistory = await chatHistoryService.load(userId);
        if (firestoreHistory.length > 0) {
          setChatHistory(firestoreHistory);
          localStorage.setItem(`zavlo_chat_history_${userId}`, JSON.stringify(firestoreHistory));
        }
      } catch (firestoreError) {
        console.warn('Firestore indisponível, usando localStorage');
        const saved = localStorage.getItem(`zavlo_chat_history_${userId}`);
        if (saved) {
          const parsedHistory = JSON.parse(saved);
          setChatHistory(Array.isArray(parsedHistory) ? parsedHistory : []);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setChatHistory([]);
    } finally {
      setCurrentChatId(id => id || Date.now().toString());
    }
  };

  const saveChatToHistory = async () => {
    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) return;
      const userData = JSON.parse(user);
      const userId = userData.userId;

      // Usar refs para evitar stale closure
      const currentMessages = messagesRef.current;
      const currentHistory = chatHistoryRef.current;
      const chatId = currentChatIdRef.current;
      if (!chatId || currentMessages.length <= 1) return;

      const chatTitle = currentMessages.find(m => m.type === 'user')?.content.slice(0, 30) || 'Nova conversa';
      const existingIndex = currentHistory.findIndex(c => c.id === chatId);

      const cleanedMessages = currentMessages.slice(-50).map(m =>
        m.type === 'products' ? { ...m, products: m.products?.slice(0, 6) } : { ...m }
      );

      const chatData: ChatHistory = {
        id: chatId,
        title: chatTitle,
        messages: cleanedMessages,
        createdAt: existingIndex >= 0 ? currentHistory[existingIndex].createdAt : new Date(),
        updatedAt: new Date(),
      };

      let updatedHistory;
      if (existingIndex >= 0) {
        updatedHistory = [...currentHistory];
        updatedHistory[existingIndex] = chatData;
      } else {
        updatedHistory = [chatData, ...currentHistory];
      }

      setChatHistory(updatedHistory);
      localStorage.setItem(`zavlo_chat_history_${userId}`, JSON.stringify(updatedHistory));
      chatHistoryService.save(userId, chatId, chatTitle, cleanedMessages).catch(e => console.warn('Firestore save failed:', e));
    } catch (error) {
      console.error('Erro ao salvar chat:', error);
    }
  };

  const loadChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chatId);
      contextManager.clear();
      if (window.innerWidth < 768) setSidebarOpen(false);
    }
  };

  const createNewChat = () => {
    setIsCreatingNewChat(true);
    
    if (currentChatId && messages.length > 1) {
      saveChatToHistory();
    }
    
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    setMessages([{
      id: '1',
      type: 'ai',
      content: 'Olá! 👋 Eu sou a Zavlo, sua assistente de compras inteligente!\n\nQue produto você está procurando?',
      timestamp: new Date(),
    }]);
    setUploadedImage(null);
    setImageFile(null);
    setDetectedProductName('');
    setAwaitingImageConfirmation(false);
    setAwaitingImageSort(false);
    setSearchSession({
      query: '',
      classification: null,
      missingFields: [],
      answers: {},
      step: 'idle',
      expansionSources: [],
      primarySource: '',
      sortBy: 'BEST_MATCH',
    });
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
      localStorage.setItem(`zavlo_chat_history_${userId}`, JSON.stringify(updatedHistory));
      chatHistoryService.delete(userId, chatId).catch(e => console.warn('Firestore delete failed:', e));
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

    if (userCreditsRef.current < 1) {
      await delay(500);
      addMessage('ai', 'Créditos insuficientes para busca por imagem!');
      setLoading(false);
      setUploadedImage(null);
      setImageFile(null);
      return;
    }

    addMessage('ai', '🔍 Analisando sua imagem...\n\nAguarde enquanto identifico o produto.');

    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) {
        router.push('/auth');
        return;
      }

      const userData = JSON.parse(user);
      const response = await fetch(apiUrl('/search/image'), {
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

      if (response.status === 403) {
        addMessage('ai', '🔒 Busca por imagem disponível apenas para planos pagos. Acesse **Perfil → Planos** para fazer upgrade!');
        setUploadedImage(null);
        setImageFile(null);
        setLoading(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        
        if (typeof data.remainingCredits === 'number') {
          updateCredits(data.remainingCredits, userData);
        }

        const creditsUsed = data.creditsUsed || 1;
        const remainingCredits = data.remainingCredits ?? userCredits - 1;
        let productName = (data.productName || 'Produto não identificado')
          .replace(/^Esta imagem mostra uma?\s*/i, '')
          .replace(/^Esta é uma?\s*/i, '')
          .replace(/^Este é um\s*/i, '')
          .trim();

        await delay(800);
        setUploadedImage(null);
        setImageFile(null);
        setDetectedProductName(productName);
        const confirmationMessage: Message = {
          id: crypto.randomUUID(),
          type: 'image_confirmation',
          content: `✅ Produto identificado!\n\n📦 ${productName}\n\n💳 Já gasto: -${creditsUsed} crédito(s)\n💰 Saldo: ${remainingCredits} créditos\n\n🔍 Deseja buscar preços? (custará +1 crédito)`,
          timestamp: new Date(),
          detectedProduct: productName,
          creditCost: creditsUsed,
        };
        setMessages(prev => [...prev, confirmationMessage]);
        setAwaitingImageConfirmation(true);
        setLoading(false);
      } else {
        addMessage('ai', 'Erro na busca por imagem. Tente novamente.');
        setUploadedImage(null);
        setImageFile(null);
        setLoading(false);
      }
    } catch (error) {
      console.error('Image search error:', error);
      addMessage('ai', 'Erro ao processar imagem. Tente novamente.');
      setUploadedImage(null);
      setImageFile(null);
      setLoading(false);
    }
  };

  const handleImagePriceSearch = () => {
    setMessages(prev => prev.filter(m => m.type !== 'image_confirmation'));
    
    const sortMessage: Message = {
      id: crypto.randomUUID(),
      type: 'sort_question',
      content: 'Como deseja ordenar os resultados?',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, sortMessage]);
    setAwaitingImageConfirmation(false);
    setAwaitingImageSort(true);
  };

  const executeImageSearch = async (sortBy: string) => {
    if (!detectedProductName || loading) return;
    
    setLoading(true);
    setMessages(prev => prev.filter(m => m.type !== 'sort_question'));
    addMessage('ai', 'searching_animation');

    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) {
        router.push('/auth');
        return;
      }

      const userData = JSON.parse(user);

      const response = await fetch(apiUrl('/search/prices'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userData.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productName: detectedProductName, sortBy }),
      });

      if (response.status === 401) {
        localStorage.removeItem('zavlo_user');
        router.push('/auth');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const products = data.results || [];
        
        if (typeof data.remainingCredits === 'number') {
          updateCredits(data.remainingCredits, userData);
        }

        const creditsUsed = data.creditsUsed || 1;
        const remainingCredits = data.remainingCredits ?? userCredits - 1;

        await delay(1000);
        const productsMessage: Message = {
          id: crypto.randomUUID(),
          type: 'products',
          content: `✅ Encontrei ${products.length} produtos!\n\n💳 Créditos: -${creditsUsed} | Restantes: ${remainingCredits}`,
          products: products,
          timestamp: new Date(),
          creditCost: creditsUsed,
        };
        setMessages(prev => [...prev, productsMessage]);
        setAwaitingImageSort(false);
        setDetectedProductName('');
        setLoading(false);
      } else {
        addMessage('ai', 'Erro ao buscar preços. Tente novamente.');
        setAwaitingImageSort(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Image price search error:', error);
      addMessage('ai', 'Erro ao buscar preços. Tente novamente.');
      setAwaitingImageSort(false);
      setLoading(false);
    }
  };

  const handleImageSearchReject = () => {
    setMessages(prev => prev.filter(m => m.type !== 'image_confirmation'));
    addMessage('ai', '🔄 Ok! Quando quiser buscar preços, é só enviar outra imagem.');
    setAwaitingImageConfirmation(false);
    setUploadedImage(null);
    setImageFile(null);
    setDetectedProductName('');
    setLoading(false);
  };

  // Helper para delay visual controlado
  const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

  const handleExpandSearch = async (source: string) => {
    const { query, classification, sortBy } = searchSession;
    const sourceLabel: Record<string, string> = {
      olx: 'OLX',
      webmotors: 'Webmotors',
      google_shopping: 'Google Shopping',
      mercadolivre: 'Mercado Livre',
    };
    // Remove expansion bubble and update remaining sources
    setMessages(prev => prev.map(m =>
      m.type === 'expansion'
        ? { ...m, expansionSources: (m.expansionSources || []).filter(s => s !== source) }
        : m
    ).filter(m => m.type !== 'expansion' || (m.expansionSources || []).length > 0));
    const searchingMsgId = crypto.randomUUID();
    setMessages(prev => [...prev, {
      id: searchingMsgId,
      type: 'ai' as const,
      content: `Buscando no ${sourceLabel[source] || source}...`,
      timestamp: new Date(),
    }]);
    const enrichedClassification = {
      ...classification,
      scrapers: [{ name: source, score: 1.0 }],
    };
    await executeTextSearch(query, sortBy, enrichedClassification, true, searchingMsgId);
  };

  const dismissQuestionBubble = () => {
    setMessages(prev => prev.filter(m => m.type !== 'question'));
  };

  const handleHybridAnswer = async (answer: string) => {
    dismissQuestionBubble();
    const { missingFields, query, answers, classification } = searchSession;
    const currentField = missingFields[0];
    
    // Normalizar respostas especiais
    const normalizedAnswer = (() => {
      if (currentField === 'condition' && answer === 'ambos') return '';
      if (currentField === 'year' && answer === 'qualquer ano') return '';
      if (currentField === 'location' && answer === 'todo o brasil') return '';
      if (['transmission', 'fuel', 'body_type', 'brand'].includes(currentField) && answer === 'qualquer') return '';
      return answer;
    })();
    
    const updatedAnswers = { ...answers, [currentField]: normalizedAnswer };
    const remainingFields = missingFields.slice(1);

    // Enriquecer classificação com a resposta do usuário
    const updatedClassification = { ...classification };
    if (currentField === 'condition' && normalizedAnswer) {
      updatedClassification.condition = normalizedAnswer === 'novo' ? 'new' : 'used';
    } else if (currentField === 'price_range' && normalizedAnswer) {
      try {
        const parsed = JSON.parse(normalizedAnswer);
        if (parsed?.value) updatedClassification.price_range = {
          min_price: parsed.value.min,
          max_price: parsed.value.max,
        };
      } catch {}
    } else if (currentField === 'year' && normalizedAnswer) {
      updatedClassification.detected_year = parseInt(normalizedAnswer) || null;
    } else if (currentField === 'location' && normalizedAnswer) {
      updatedClassification.user_location = { city: normalizedAnswer };
    } else if (currentField === 'gender' && normalizedAnswer) {
      updatedClassification.detected_gender = normalizedAnswer;
    } else if (currentField === 'size' && normalizedAnswer) {
      updatedClassification.detected_size = normalizedAnswer;
    } else if (currentField === 'storage' && normalizedAnswer) {
      updatedClassification.detected_storage = normalizedAnswer;
    } else if (currentField === 'transmission' && normalizedAnswer) {
      updatedClassification.detected_transmission = normalizedAnswer;
    } else if (currentField === 'fuel' && normalizedAnswer) {
      updatedClassification.detected_fuel = normalizedAnswer;
    } else if (currentField === 'body_type' && normalizedAnswer) {
      updatedClassification.detected_body_type = normalizedAnswer;
    } else if (currentField === 'brand' && normalizedAnswer) {
      updatedClassification.detected_brand = normalizedAnswer;
    } else if (currentField === 'shoe_type' && normalizedAnswer) {
      updatedClassification.detected_shoe_type = normalizedAnswer;
    }

    // Enriquecer query textual para exibição
    let displayAnswer = answer;
    if (!normalizedAnswer) {
      displayAnswer = '';
    } else {
      try {
        const parsed = JSON.parse(answer);
        if (parsed?.value && typeof parsed.value === 'object') {
          const { min, max } = parsed.value as { min?: number; max?: number };
          if (typeof min === 'number' && typeof max === 'number') displayAnswer = `entre ${min/1000}mil e ${max/1000}mil`;
          else if (typeof max === 'number') displayAnswer = `até ${max/1000}mil`;
          else if (typeof min === 'number') displayAnswer = `acima de ${min/1000}mil`;
        }
      } catch {}
    }

    const enrichedQuery = !displayAnswer
      ? query
      : currentField === 'location'
      ? `${query} em ${displayAnswer}`
      : `${query} ${displayAnswer}`;

    // Manter search_query sincronizado com enrichedQuery para que o scraper receba a query acumulada
    updatedClassification.search_query = enrichedQuery;

    if (remainingFields.length > 0) {
      const nextField = remainingFields[0];
      const nextQ = getNextQuestion(nextField, updatedClassification);
      const nextText = typeof nextQ === 'object' ? nextQ.question : nextQ;
      const nextSuggestions = typeof nextQ === 'object' ? nextQ.suggestions : undefined;
      setSearchSession(s => ({
        ...s,
        query: enrichedQuery,
        classification: updatedClassification,
        missingFields: remainingFields,
        answers: updatedAnswers,
      }));
      const qMsg: Message = {
        id: crypto.randomUUID(),
        type: 'question',
        content: nextText,
        timestamp: new Date(),
        questionType: nextField,
        questionSuggestions: nextSuggestions,
        userLocation: updatedClassification?.user_location,
      };
      setMessages(prev => [...prev, qMsg]);
    } else {
      const currentSortBy = searchSession.sortBy;
      setSearchSession(s => ({ ...s, query: enrichedQuery, classification: updatedClassification, answers: updatedAnswers, step: 'idle' }));
      await classifyWithAnswers(enrichedQuery, updatedAnswers, updatedClassification, currentSortBy);
    }
  };

  const handleHybridSkip = async () => {
    if (searchSession.step !== 'asking') return;
    dismissQuestionBubble();
    const { query, classification, sortBy } = searchSession;
    setSearchSession(s => ({ ...s, step: 'idle', missingFields: [] }));
    await executeTextSearch(query, sortBy, classification);
  };

  // Reenvia ao backend com as respostas para enriquecer a classification lá
  // Recebe sortBy como parâmetro para evitar stale closure
  const classifyWithAnswers = async (query: string, answers: Record<string, string>, prevClassification: any, sortBy: string) => {
    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) { router.push('/auth'); return; }
      const userData = JSON.parse(user);

      const response = await fetch(apiUrl('/search/classify'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userData.token}`,
          'Content-Type': 'application/json',
        },
        // Passar prevClassification para o backend mesclar sem reprocessar do zero
        body: JSON.stringify({ query, answers, prevClassification }),
      });

      if (!response.ok) throw new Error(`classify failed: ${response.status}`);
      const data = await response.json();
      // Mesclar enrichedClassification com prevClassification para preservar filtros acumulados
      const enrichedClassification = data.classification
        ? { ...prevClassification, ...data.classification }
        : prevClassification;

      setSearchSession(s => ({ ...s, classification: enrichedClassification, step: 'idle' }));
      await executeTextSearch(query, sortBy, enrichedClassification);
    } catch {
      // fallback: usar prevClassification já enriquecida (search_query atualizado pelo handleHybridAnswer)
      const fallbackClassification = { ...prevClassification, search_query: query };
      await executeTextSearch(query, sortBy, fallbackClassification);
    }
  };

  const handleSend = async (messageText?: string) => {
    const currentInput = (messageText ?? input).trim();
    if (!currentInput || loading) return;
    setInput('');

    // Handle image confirmation
    if (awaitingImageConfirmation) {
      const lowerInput = currentInput.toLowerCase().trim();
      if (['sim', 'sim!', 'yes', 'y', 's'].includes(lowerInput)) {
        handleImagePriceSearch();
        return;
      } else if (['não', 'nao', 'no', 'n'].includes(lowerInput)) {
        handleImageSearchReject();
        return;
      } else {
        addMessage('ai', '❓ Por favor, responda apenas com \"sim\" ou \"não\".');
        return;
      }
    }

    // Handle hybrid question — user typed instead of clicking a button
    if (searchSession.step === 'asking') {
      dismissQuestionBubble();
      await handleHybridAnswer(currentInput);
      return;
    }

    // Handle image sort — modal já está visível, ignorar input de texto
    if (awaitingImageSort) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: currentInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    if (userCreditsRef.current < 1) {
      addMessage('ai', '💳 Créditos insuficientes! Você precisa de pelo menos 1 crédito para fazer buscas.');
      setLoading(false);
      return;
    }

    // ✅ Bug Medium #1: verificar expansionSources ANTES do detectIntent
    // Evita que "OLX", "Mercado Livre" etc. caiam no fallback classifyQuery e consumam crédito
    if (searchSession.expansionSources.length > 0) {
      const lower = currentInput.toLowerCase().trim();
      const sourceLabel: Record<string, string> = {
        olx: 'OLX', webmotors: 'Webmotors',
        google_shopping: 'Google Shopping', mercadolivre: 'Mercado Livre',
      };
      const sourceMap: Record<string, string> = {
        'olx': 'olx', 'webmotors': 'webmotors',
        'google shopping': 'google_shopping', 'google': 'google_shopping',
        'mercado livre': 'mercadolivre', 'mercadolivre': 'mercadolivre',
      };
      const matchedSource = Object.entries(sourceMap).find(([k]) => lower.includes(k))?.[1];
      if (matchedSource && searchSession.expansionSources.includes(matchedSource)) {
        setSearchSession(s => ({ ...s, expansionSources: s.expansionSources.filter(x => x !== matchedSource) }));
        await handleExpandSearch(matchedSource);
        return;
      }
      const notSatisfied = ['não', 'nao', 'no', 'n', 'nope', 'negativo', 'nada', 'ruim', 'péssimo', 'pessimo', 'insatisfeito'].some(w => lower.includes(w));
      if (notSatisfied) {
        setLoading(false);
        return;
      }
      const satisfied = ['sim', 'yes', 's', 'ok', 'obrigado', 'obrigada', 'valeu', 'perfeito', 'satisfeito', 'satisfeita', 'encerrar'].some(w => lower.includes(w));
      if (satisfied) {
        setSearchSession(s => ({ ...s, expansionSources: [] }));
        setMessages(prev => prev.filter(m => m.type !== 'expansion'));
        addMessage('ai', 'Que ótimo! Se precisar de mais buscas, é só digitar. 😊');
        setLoading(false);
        return;
      }
    }

    const intent = detectIntent(currentInput);

      // Handle special commands
      if (intent.type === 'introduction') {
        const userName = intent.userName || 'amigo(a)';
        addMessage('ai', `Prazer em conhecer você, ${userName}! 😊\n\nDigite o produto que procura!`);
        setLoading(false);
        return;
      }

      if (intent.type === 'greeting') {
        addMessage('ai', 'Olá! 👋 Que produto você está procurando?');
        setLoading(false);
        return;
      }

      if (intent.type === 'despedida') {
        addMessage('ai', 'Até logo! 👋 Volte sempre que precisar encontrar o melhor preço. 😊');
        setLoading(false);
        return;
      }

      if (intent.type === 'thanks') {
        addMessage('ai', 'De nada! 😊 Se precisar de mais alguma busca, é só digitar.');
        setLoading(false);
        return;
      }

      if (intent.type === 'casual_talk') {
        addMessage('ai', 'Tudo bem por aqui! 😄 Me diga o produto que você está procurando e eu encontro os melhores preços!');
        setLoading(false);
        return;
      }

      if (intent.type === 'sell') {
        addMessage('ai', '🏪 Para anunciar um produto, acesse a seção **Vender** no menu!\n\nSe quiser **buscar** algo para comprar, é só digitar o nome do produto. 😊');
        setLoading(false);
        return;
      }

      if (intent.type === 'negotiation') {
        addMessage('ai', '💬 Para negociar preços, entre em contato diretamente com o vendedor pelo anúncio!\n\nQuer que eu busque mais opções com preço menor?');
        setLoading(false);
        return;
      }

      if (intent.type === 'platform_question') {
        addMessage('ai', '🤖 Sou a **Zavlo**, sua assistente de compras inteligente!\n\nBusco os melhores preços em múltiplos marketplaces (Google Shopping, Mercado Livre, OLX, Webmotors) de uma só vez.\n\nDigite o produto que procura! 🔍');
        setLoading(false);
        return;
      }

      if (intent.type === 'help') {
        addMessage('ai', '❓ Como usar:\n\n1️⃣ Digite o produto\n2️⃣ Responda perguntas (se houver)\n3️⃣ Veja os resultados!\n\n💡 Exemplos:\n• "iPhone 15 Pro"\n• "Honda Civic 2020 usado"\n• "Notebook Dell gamer"');
        setLoading(false);
        return;
      }

      if (intent.type === 'credits_question') {
        const creditsMessage = `💰 **Seus Créditos: ${userCredits}**\n\n📊 **Custos por busca:**\n• Busca por texto: **1 crédito**\n• Identificação por imagem: **1 crédito**\n• Busca de preços após imagem: **+1 crédito** (opcional)\n\n🔄 **Precisa de mais créditos?**\nVocê pode comprar créditos avulsos ou assinar um plano mensal!`;
        addMessage('ai', creditsMessage);
        setLoading(false);
        return;
      }

      if (intent.type === 'plans_question') {
        const plansMessage =
          `📊 **Nossos Planos:**\n\n` +
          `🌱 **Básico - R$ ${PLAN_PRICES.basic.monthly.toFixed(2).replace('.', ',')}/mês**\n• ${PLAN_CREDITS.basic.monthly} créditos/mês\n• Busca por texto e imagem\n• Suporte por email\n\n` +
          `🚀 **Pro - R$ ${PLAN_PRICES.pro.monthly.toFixed(2).replace('.', ',')}/mês**\n• ${PLAN_CREDITS.pro.monthly} créditos/mês\n• Todos os recursos do Básico\n• Alertas de preço\n• Suporte prioritário\n\n` +
          `👑 **Business - R$ ${PLAN_PRICES.business.monthly.toFixed(2).replace('.', ',')}/mês**\n• ${PLAN_CREDITS.business.monthly} créditos/mês\n• Todos os recursos do Pro\n• API de integração\n• Suporte dedicado\n\n` +
          `👉 **Para assinar:** Acesse **Perfil → Planos**`;
        addMessage('ai', plansMessage);
        setLoading(false);
        return;
      }

      if (intent.type !== 'search' && intent.type !== 'buy') {
        // ✅ Bug Medium #2: validar query antes de chamar API (evita chamadas desnecessárias)
        const trimmed = currentInput.trim();
        const STOPWORDS = new Set(['a', 'o', 'e', 'de', 'da', 'do', 'em', 'um', 'uma', 'para', 'com', 'por']);
        const meaningfulTokens = trimmed.toLowerCase().split(/\s+/).filter(t => t.length >= 3 && !STOPWORDS.has(t));
        if (trimmed.length < 3 || meaningfulTokens.length === 0) {
          addMessage('ai', '🤔 Não entendi. Digite o nome do produto que você procura!');
          setLoading(false);
          return;
        }
        await classifyQuery(currentInput);
        return;
      }

      // ✅ VALIDAÇÃO: Verificar se é realmente um produto pesquisável
      // Não executar busca diretamente, apenas classificar
      await classifyQuery(currentInput);
  };

  const classifyQuery = async (query: string) => {
    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) {
        router.push('/auth');
        return;
      }

      const userData = JSON.parse(user);
      
      // ✅ USAR ENDPOINT CORRETO: /search/classify (NÃO consome créditos)
      const response = await fetch(apiUrl('/search/classify'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userData.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (response.status === 401) {
        localStorage.removeItem('zavlo_user');
        router.push('/auth');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        
        // Check if it's a question about the system
        if (data.classification?.is_question) {
          setLoading(false);
          
          const questionType = data.classification?.question_type;
          
          // 💳 PERGUNTAS SOBRE CRÉDITOS
          if (questionType === 'credits') {
            const creditsMessage = `💰 **Seus Créditos: ${userCredits}**\n\n📊 **Custos por busca:**\n• Busca por texto: **1 crédito**\n• Identificação por imagem: **1 crédito**\n• Busca de preços após imagem: **+1 crédito** (opcional)\n\n🔄 **Precisa de mais créditos?**\nVocê pode comprar créditos avulsos ou assinar um plano mensal!`;
            addMessage('ai', creditsMessage);
            return;
          }
          
          // 🔄 PERGUNTAS SOBRE RECARGA
          if (questionType === 'recharge') {
            const rechargeMessage = `🔄 **Como comprar créditos:**\n\n**Opção 1: Créditos Avulsos**\n• Acesse: **Perfil → Comprar Créditos**\n• Escolha o pacote desejado\n• Pague via PIX instantâneo\n\n**Opção 2: Assinar Plano Mensal**\n• Acesse: **Perfil → Planos**\n• Créditos renovam automaticamente todo mês\n• Melhor custo-benefício!\n\n💳 **Formas de pagamento:**\nPIX, Cartão de Crédito e Boleto`;
            addMessage('ai', rechargeMessage);
            return;
          }
          
          // 📊 PERGUNTAS SOBRE PLANOS
          if (questionType === 'plans') {
            const plansMessage =
              `📊 **Nossos Planos:**\n\n` +
              `🌱 **Básico - R$ ${PLAN_PRICES.basic.monthly.toFixed(2).replace('.', ',')}/mês**\n• ${PLAN_CREDITS.basic.monthly} créditos/mês\n• Busca por texto e imagem\n• Suporte por email\n\n` +
              `🚀 **Pro - R$ ${PLAN_PRICES.pro.monthly.toFixed(2).replace('.', ',')}/mês**\n• ${PLAN_CREDITS.pro.monthly} créditos/mês\n• Todos os recursos do Básico\n• Alertas de preço\n• Suporte prioritário\n\n` +
              `👑 **Business - R$ ${PLAN_PRICES.business.monthly.toFixed(2).replace('.', ',')}/mês**\n• ${PLAN_CREDITS.business.monthly} créditos/mês\n• Todos os recursos do Pro\n• API de integração\n• Suporte dedicado\n\n` +
              `👉 **Para assinar:** Acesse **Perfil → Planos**`;
            addMessage('ai', plansMessage);
            return;
          }
          
          // ❓ PERGUNTAS SOBRE USO DO SISTEMA
          const guidedResponse = data.classification?.guided_response;
          if (guidedResponse) {
            addMessage('ai', guidedResponse);
          } else {
            addMessage('ai', '❓ Como usar:\n\n1️⃣ Digite o produto que procura\n2️⃣ Responda perguntas se necessário\n3️⃣ Veja os melhores preços!\n\n💡 Exemplos:\n• "iPhone 13 usado"\n• "Honda Civic 2020"\n• "Notebook gamer"');
          }
          return;
        }
        
        // Check if it's a greeting or farewell
        if (data.classification?.is_greeting) {
          setLoading(false);
          const lower = query.toLowerCase();
          const isFarewell = ['tchau', 'adeus', 'ate logo', 'falou', 'flw', 'bye'].some(w => lower.includes(w));
          const isThanks = ['obrigado', 'obrigada', 'valeu', 'vlw', 'obg'].some(w => lower.includes(w));
          addMessage('ai', isFarewell
            ? 'Até logo! 👋 Volte sempre que precisar encontrar o melhor preço. 😊'
            : isThanks
            ? 'De nada! 😊 Se precisar de mais alguma busca, é só digitar.'
            : 'Olá! 👋 Que produto você está procurando?'
          );
          return;
        }
        
        // ✅ VALIDAR: Verificar se é um produto válido
        const category = data.classification?.category;
        const confidence = data.classification?.confidence || 0;

        // ✅ Bug Medium #3: só bloquear se for 'general' com confiança muito baixa
        // Categorias específicas com qualquer confiança devem prosseguir normalmente
        if (category === 'general' && confidence < 0.4) {
          setLoading(false);
          addMessage('ai', '🤔 Não consegui identificar um produto específico.\n\n💡 Tente ser mais específico:\n• "iPhone 15 Pro"\n• "Honda Civic 2020"\n• "Notebook Dell"');
          return;
        }
        
        // ✅ SEMPRE ATUALIZAR CLASSIFICAÇÃO
        setSearchSession(s => ({ ...s, classification: data.classification }));
        
        // HYBRID MODE: Check if needs question
        if (data.needsQuestion && data.question) {
          const missingFields: string[] = data.missingFields || [];
          const firstField = missingFields[0];
          const q = data.question;
          const questionText = typeof q === 'object' ? q.question : q;
          const suggestions = typeof q === 'object' ? q.suggestions : undefined;
          setSearchSession(s => ({
            ...s,
            query,
            classification: data.classification,
            missingFields,
            answers: {},
            step: 'asking',
          }));
          setLoading(false);
          const qMsg: Message = {
            id: crypto.randomUUID(),
            type: 'question',
            content: questionText,
            timestamp: new Date(),
            questionType: firstField,
            questionSuggestions: suggestions,
            userLocation: data.classification?.user_location,
          };
          setMessages(prev => [...prev, qMsg]);
          return;
        }
        
        setSearchSession(s => ({ ...s, query, classification: data.classification, step: 'idle' }));
        setLoading(false);
        await executeTextSearch(query, sortByRef.current, data.classification);
        
      } else {
        addMessage('ai', 'Erro ao processar. Tente novamente.');
        setLoading(false);
      }
    } catch {
      addMessage('ai', 'Erro ao processar. Tente novamente.');
      setLoading(false);
    }
  };

  const sanitizeForLog = (value: string): string =>
    String(value).replace(/[\r\n\t\x00-\x1F\x7F]/g, ' ').trim();

  const executeTextSearch = async (query: string, sortBy: string = 'RELEVANCE', classification?: any, isExpansion = false, replaceMsgId?: string) => {
    const enrichedQuery = contextManager.applyContext(query);
    const effectiveQuery = enrichedQuery !== query ? enrichedQuery : query;
    const searchingMsgId = crypto.randomUUID();
    setMessages(prev => prev.filter(m => m.id !== replaceMsgId));
    setMessages(prev => [...prev, { id: searchingMsgId, type: 'ai' as const, content: 'searching_animation', timestamp: new Date() }]);

    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) { router.push('/auth'); return; }

      const userData = JSON.parse(user);

      const params = new URLSearchParams({ query: effectiveQuery, sortBy });
      if (classification) params.append('classification', JSON.stringify(classification));

      const response = await fetch(apiUrl(`/search/text?${params.toString()}`), {
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

      if (response.status === 403) {
        const errData = await response.json().catch(() => ({}));
        const isFreeLimit = errData?.error === 'FREE_LIMIT_EXCEEDED' || errData?.message?.includes('gratuita');
        addMessage('ai', isFreeLimit
          ? '🔒 Você já usou sua busca gratuita. Faça login ou assine um plano para continuar buscando!'
          : 'Acesso negado. Verifique seu plano.');
        setLoading(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const products = data.results || [];

        setMessages(prev => prev.filter(m => m.id !== searchingMsgId));

        if (data.error === 'INSUFFICIENT_CREDITS') {
          setUserCredits(0);
          addMessage('ai', '💳 Créditos insuficientes! Adquira mais créditos para continuar buscando.');
          setLoading(false);
          return;
        }

        if (typeof data.remainingCredits === 'number') {
          updateCredits(data.remainingCredits, userData);
        }
        
        const creditsUsed = data.creditsUsed || 1;
        const remainingCredits = data.remainingCredits ?? userCredits - 1;

        await delay(1000);

        // Mensagem de contexto unificada (cidade + filtros relaxados)
        const cl = classification;

        if (products.length === 0) {
            const brand = cl?.detected_brand ? sanitizeForLog(cl.detected_brand.charAt(0).toUpperCase() + cl.detected_brand.slice(1)) : null;
            const model = cl?.detected_model ? sanitizeForLog(cl.detected_model.charAt(0).toUpperCase() + cl.detected_model.slice(1)) : null;
            const city  = cl?.user_location?.city ? sanitizeForLog(cl.user_location.city) : null;
            const cond  = cl?.condition === 'new' ? 'novo' : cl?.condition === 'used' ? 'usado' : null;
            const year  = cl?.detected_year || null;

            const vehicle = [brand, model, year, cond].filter(Boolean).join(' ');
            const where   = city ? ` em ${city.charAt(0).toUpperCase() + city.slice(1)}` : '';

            let msg = `😕 Não encontrei anúncios de **${sanitizeForLog(vehicle || query)}**${where} no momento.\n\n`;
            msg += `Isso pode acontecer porque:\n`;
            msg += `• Não há estoque disponível com esses filtros\n`;
            msg += `• A combinação de cidade + condição + ano é muito específica\n\n`;
            msg += `💡 **Sugestões:**\n`;
            if (cond) msg += `• Tente buscar sem filtrar por "${cond === 'novo' ? 'novo' : 'usado'}"\n`;
            if (city) msg += `• Expanda para cidades próximas ou todo o Brasil\n`;
            if (year) msg += `• Tente um intervalo de anos (ex: ${year - 1}–${year + 1})\n`;
            msg += `• Tente novamente em alguns minutos`;

            addMessage('ai', msg);
            setLoading(false);
            return;
          }
        const rawCityLabel = data.originalCity || cl?.user_location?.city || null;
        const cityLabel = rawCityLabel
          ? sanitizeForLog(rawCityLabel.replace(/\+/g, ' ').replace(/%20/g, ' ').trim()
              .replace(/\b\w/g, (c: string) => c.toUpperCase()))
          : null;

        const contextParts: string[] = [];

        if (data.searchedNationally && cityLabel) {
          contextParts.push(`📍 Não encontrei anúncios específicos em **${cityLabel}**, então expandi para **todo o Brasil**`);
        } else if (cityLabel && data.cityFilterApplied === false && !data.searchedNationally) {
          contextParts.push(`📍 Os resultados abaixo são de todo o Brasil — os vendedores não informaram localização, então não foi possível filtrar por **${cityLabel}**`);
        }

        if (data.relaxedFilters?.length) {
          const relaxMsgs: string[] = [];
          if (data.relaxedFilters.includes('price')) {
            const max = cl?.price_range?.max_price;
            relaxMsgs.push(max ? `nenhum dentro do orçamento de R$ ${(max / 1000).toFixed(0)}mil` : 'nenhum no orçamento informado');
          }
          if (data.relaxedFilters.includes('year')) {
            relaxMsgs.push(`nenhum do ano ${cl?.detected_year}`);
          }
          contextParts.push(`⚠️ ${relaxMsgs.join(' e ')} — mostrando os mais próximos disponíveis`);
        }

        if (contextParts.length > 0) {
          addMessage('ai', contextParts.join('\n') + '.');
        }

        const productsMessage: Message = {
            id: crypto.randomUUID(),
            type: 'products',
            content: `✅ Encontrei ${products.length} ${products.length === 1 ? 'resultado' : 'resultados'}!\n\n💳 Créditos: -${creditsUsed} | Restantes: ${remainingCredits}`,
            products: products,
            timestamp: new Date(),
            priceRangeApplied: data.priceRangeApplied,
          };
          setMessages(prev => [...prev, productsMessage]);
          contextManager.update({ lastResults: products, lastProduct: query });

          // Perguntar se os resultados satisfizeram (apenas na busca primária, não em expansões)
          if (!isExpansion && data.canExpandSearch && data.expansionSources?.length > 0) {
            const sourceLabel: Record<string, string> = {
              olx: 'OLX',
              webmotors: 'Webmotors',
              google_shopping: 'Google Shopping',
              mercadolivre: 'Mercado Livre',
            };
            const isVehicle = classification?.category === 'car' || classification?.category === 'motorcycle';
            const primaryLabel = sourceLabel[data.primarySource] || data.primarySource || 'Google Shopping';
            setSearchSession(s => ({
              ...s,
              expansionSources: data.expansionSources,
              primarySource: data.primarySource || '',
              sortBy,
              step: 'idle',
            }));
            const expansionMsg: Message = {
              id: crypto.randomUUID(),
              type: 'expansion',
              content: `Encontrei **${products.length} resultados** no **${primaryLabel}**`,
              timestamp: new Date(),
              expansionSources: data.expansionSources,
              primarySource: data.primarySource || '',
              isVehicle,
            };
            setMessages(prev => [...prev, expansionMsg]);
          }

          setLoading(false);
      } else {
        addMessage('ai', 'Erro na busca. Tente novamente.');
        setLoading(false);
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== searchingMsgId));
      addMessage('ai', 'Erro ao processar busca. Tente novamente.');
      setLoading(false);
    }
  };

  const addMessage = (type: 'ai' | 'user', content: string) => {
    const message: Message = {
      id: crypto.randomUUID(),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const updateCredits = (newCredits: number, userData: any) => {
    setUserCredits(newCredits);
    userCreditsRef.current = newCredits;
    const updatedUser = { ...userData, credits: newCredits };
    localStorage.setItem('zavlo_user', JSON.stringify(updatedUser));
    window.dispatchEvent(new Event('userChanged'));
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
        onRenameChat={(chatId, newTitle) => {
          const updatedHistory = chatHistory.map(c =>
            c.id === chatId ? { ...c, title: newTitle } : c
          );
          setChatHistory(updatedHistory);
          const user = localStorage.getItem('zavlo_user');
          if (user) {
            const { userId } = JSON.parse(user);
            localStorage.setItem(`zavlo_chat_history_${userId}`, JSON.stringify(updatedHistory));
            chatHistoryService.save(userId, chatId, newTitle, updatedHistory.find(c => c.id === chatId)?.messages || []).catch(e => console.warn('Firestore save failed:', e));
          }
        }}
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
              setTimeout(() => handleSend(text), 0);
            }}
            onImageSearchClick={() => fileInputRef.current?.click()}
            showMoreSuggestions={false}
            onToggleMore={() => {}}
            isIntroduction={false}
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
            onQuestionAnswer={handleHybridAnswer}
            onQuestionSkip={handleHybridSkip}
            onExpandSearch={handleExpandSearch}
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
