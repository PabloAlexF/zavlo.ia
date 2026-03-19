'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { QuickSuggestions } from '@/components/chat/QuickSuggestions';
import { QuestionModal } from '@/components/chat/QuestionModal';
import { SortSelectionModal } from '@/components/chat/SortSelectionModal';
import { detectIntent } from '@/utils/chat/intentDetector';
import { contextManager } from '@/utils/chat/contextManager';
import { chatHistoryService } from '@/lib/chatHistory';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'products' | 'image_confirmation' | 'sort_question';
  content: string;
  products?: any[];
  timestamp: Date;
  creditCost?: number;
  imageData?: string;
  detectedProduct?: string;
  priceRangeApplied?: {
    min?: number;
    max?: number;
    target?: number;
  };
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
    step: 'idle' | 'asking' | 'searching';
  }>({
    query: '',
    classification: null,
    missingFields: [],
    answers: {},
    step: 'idle',
  });

  // Derivados do searchSession (sem estado extra)
  const hybridQuestion = searchSession.step === 'asking'
    ? getNextQuestion(searchSession.missingFields[0], searchSession.classification)
    : null;
  const showSortQuestion = searchSession.step === 'searching' &&
    searchSession.classification?.category !== 'car' &&
    searchSession.classification?.category !== 'motorcycle';

  const [userCredits, setUserCredits] = useState(0);
  
  // Sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messages.length > 1) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    }
  }, [messages.length]);

  useEffect(() => {
    loadUserCredits();
    loadChatHistory();

    const handleUserChanged = () => loadUserCredits();
    window.addEventListener('userChanged', handleUserChanged);
    return () => window.removeEventListener('userChanged', handleUserChanged);
  }, []);

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
      
      try {
        const firestoreHistory = await chatHistoryService.load(userId);
        if (firestoreHistory.length > 0) {
          setChatHistory(firestoreHistory);
          localStorage.setItem(`zavlo_chat_history_${userId}`, JSON.stringify(firestoreHistory));
          return;
        }
      } catch (firestoreError) {
        console.warn('Firestore indisponível, usando localStorage');
      }
      
      const saved = localStorage.getItem(`zavlo_chat_history_${userId}`);
      if (saved) {
        const parsedHistory = JSON.parse(saved);
        setChatHistory(Array.isArray(parsedHistory) ? parsedHistory : []);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setChatHistory([]);
    }
    
    if (!currentChatId) {
      setCurrentChatId(Date.now().toString());
    }
  };

  const saveChatToHistory = async () => {
    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) return;
      const userData = JSON.parse(user);
      const userId = userData.userId;
      
      const chatTitle = messages.find(m => m.type === 'user')?.content.slice(0, 30) || 'Nova conversa';
      const existingIndex = chatHistory.findIndex(c => c.id === currentChatId);
      
      const cleanedMessages = messages.slice(-50).map(m => 
        m.type === 'products' ? { ...m, products: m.products?.slice(0, 6) } : { ...m }
      );
      
      const chatData: ChatHistory = {
        id: currentChatId,
        title: chatTitle,
        messages: cleanedMessages,
        createdAt: existingIndex >= 0 ? chatHistory[existingIndex].createdAt : new Date(),
        updatedAt: new Date(),
      };
      
      let updatedHistory;
      if (existingIndex >= 0) {
        updatedHistory = [...chatHistory];
        updatedHistory[existingIndex] = chatData;
      } else {
        updatedHistory = [chatData, ...chatHistory];
      }
      
      setChatHistory(updatedHistory);
      localStorage.setItem(`zavlo_chat_history_${userId}`, JSON.stringify(updatedHistory));
      chatHistoryService.save(userId, currentChatId, chatTitle, cleanedMessages).catch(() => {});
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
      chatHistoryService.delete(userId, chatId).catch(() => {});
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
        addMessage('ai', 'Créditos insuficientes para busca por imagem!');
        setLoading(false);
        setUploadedImage(null);
        setImageFile(null);
      }, 500);
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
        
        if (typeof data.remainingCredits === 'number') {
          updateCredits(data.remainingCredits, userData);
        }

        const creditsUsed = data.creditsUsed || 1;
        const remainingCredits = data.remainingCredits ?? userCredits - 1;
        let productName = (data.productName || 'Produto não identificado')
          .replace(/^Esta imagem mostra uma?\\s*/i, '')
          .replace(/^Esta é uma?\\s*/i, '')
          .replace(/^Este é um\\s*/i, '')
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
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      
      const params = new URLSearchParams({
        query: detectedProductName,
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

  const handleHybridAnswer = async (answer: string) => {
    const { missingFields, query, answers, classification } = searchSession;
    const currentField = missingFields[0];
    const updatedAnswers = { ...answers, [currentField]: answer };
    const remainingFields = missingFields.slice(1);

    // Enriquecer query textual para exibição
    let displayAnswer = answer;
    try {
      const parsed = JSON.parse(answer);
      if (parsed?.value) {
        const { min, max } = parsed.value;
        if (min && max) displayAnswer = `entre ${min/1000}mil e ${max/1000}mil`;
        else if (max)   displayAnswer = `até ${max/1000}mil`;
        else if (min)   displayAnswer = `acima de ${min/1000}mil`;
      }
    } catch {}

    const enrichedQuery = currentField === 'location'
      ? `${query} em ${displayAnswer}`
      : `${query} ${displayAnswer}`;

    if (remainingFields.length > 0) {
      setSearchSession(s => ({
        ...s,
        query: enrichedQuery,
        missingFields: remainingFields,
        answers: updatedAnswers,
      }));
      const nextQ = getNextQuestion(remainingFields[0], classification);
      addMessage('ai', typeof nextQ === 'object' ? nextQ.question : nextQ);
    } else {
      // Todas perguntas respondidas — enviar answers ao backend para enriquecer
      setSearchSession(s => ({ ...s, query: enrichedQuery, answers: updatedAnswers, step: 'searching' }));
      await classifyWithAnswers(enrichedQuery, updatedAnswers, classification);
    }
  };

  const handleHybridSkip = async () => {
    const { query, classification } = searchSession;
    setSearchSession(s => ({ ...s, step: 'idle', missingFields: [] }));
    if (classification?.category === 'car' || classification?.category === 'motorcycle') {
      await executeTextSearch(query, 'RELEVANCE', classification);
    } else {
      setSearchSession(s => ({ ...s, step: 'searching' }));
    }
  };

  const handleSortSelection = async (sortBy: string) => {
    const { query, classification } = searchSession;
    setSearchSession(s => ({ ...s, step: 'idle' }));
    await executeTextSearch(query, sortBy, classification);
  };

  // Reenvia ao backend com as respostas para enriquecer a classification lá
  const classifyWithAnswers = async (query: string, answers: Record<string, string>, prevClassification: any) => {
    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) { router.push('/auth'); return; }
      const userData = JSON.parse(user);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${API_URL}/search/classify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userData.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, answers }),
      });

      if (!response.ok) throw new Error(`classify failed: ${response.status}`);
      const data = await response.json();
      const enrichedClassification = data.classification || prevClassification;

      setSearchSession(s => ({ ...s, classification: enrichedClassification, step: 'idle' }));

      if (enrichedClassification?.category === 'car' || enrichedClassification?.category === 'motorcycle') {
        await executeTextSearch(query, 'RELEVANCE', enrichedClassification);
      } else {
        setSearchSession(s => ({ ...s, step: 'searching' }));
      }
    } catch {
      // Fallback: usar classification anterior sem enriquecimento
      await executeTextSearch(query, 'RELEVANCE', prevClassification);
    }
  };

  const handleSend = async (messageText?: string) => {
    const currentInput = messageText || input;
    if (!currentInput || !String(currentInput).trim() || loading) return;

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

    // Handle image sort
    if (awaitingImageSort) {
      const sortInput = currentInput.toLowerCase();
      let sortBy = 'RELEVANCE';
      if (sortInput.includes('menor') || sortInput.includes('barato')) sortBy = 'LOWEST_PRICE';
      else if (sortInput.includes('maior') || sortInput.includes('caro')) sortBy = 'HIGHEST_PRICE';
      executeImageSearch(sortBy);
      return;
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

    if (userCredits < 1) {
      await delay(300);
      addMessage('ai', '💳 Créditos insuficientes! Você precisa de pelo menos 1 crédito para fazer buscas.');
      setLoading(false);
      return;
    }

    await delay(300);
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

      if (intent.type === 'help') {
        addMessage('ai', '❓ Como usar:\n\n1️⃣ Digite o produto\n2️⃣ Responda perguntas (se houver)\n3️⃣ Veja os resultados!');
        setLoading(false);
        return;
      }

      if (intent.type === 'credits_question') {
        addMessage('ai', `💰 Seus Créditos: ${userCredits}\n\n📊 Custos:\n• Busca por texto: 1 crédito\n• Busca por imagem: 2 créditos`);
        setLoading(false);
        return;
      }

      if (intent.type === 'plans_question') {
        addMessage('ai', '📊 Nossos Planos:\n\n🌱 Básico - R$ 27/mês\n🚀 Pro - R$ 77/mês\n👑 Business - R$ 197/mês');
        setLoading(false);
        return;
      }

      if (intent.type !== 'search' && intent.type !== 'buy') {
        addMessage('ai', '🤔 Não entendi... Digite um produto para buscar!');
        setLoading(false);
        return;
      }

      // ✅ VALIDAÇÃO: Verificar se é realmente um produto pesquisável
      // Não executar busca diretamente, apenas classificar
      classifyQuery(currentInput);
  };

  const classifyQuery = async (query: string) => {
    console.log('[CLASSIFY] Classificando query:', query);
    
    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) {
        router.push('/auth');
        return;
      }

      const userData = JSON.parse(user);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      
      // ✅ USAR ENDPOINT CORRETO: /search/classify (NÃO consome créditos)
      const response = await fetch(`${API_URL}/search/classify`, {
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
        
        console.log('[CLASSIFY] Classificação recebida:', data.classification);
        
        // Check if it's a question about the system
        if (data.classification?.is_question) {
          setLoading(false);
          
          const questionType = data.classification?.question_type;
          
          // 💳 PERGUNTAS SOBRE CRÉDITOS
          if (questionType === 'credits') {
            const creditsMessage = `💰 **Seus Créditos: ${userCredits}**\n\n📊 **Custos por busca:**\n• Busca por texto: **1 crédito**\n• Busca por imagem: **2 créditos** (1 para identificar + 1 para buscar preços)\n\n🔄 **Precisa de mais créditos?**\nVocê pode comprar créditos avulsos ou assinar um plano mensal!`;
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
            const plansMessage = `📊 **Nossos Planos:**\n\n🌱 **Básico - R$ 27/mês**\n• 100 créditos/mês\n• Busca por texto e imagem\n• Suporte por email\n\n🚀 **Pro - R$ 77/mês**\n• 300 créditos/mês\n• Todos os recursos do Básico\n• Alertas de preço\n• Suporte prioritário\n\n👑 **Business - R$ 197/mês**\n• 1000 créditos/mês\n• Todos os recursos do Pro\n• API de integração\n• Suporte dedicado\n\n👉 **Para assinar:** Acesse **Perfil → Planos**`;
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
        
        // Check if it's a greeting
        if (data.classification?.is_greeting) {
          setLoading(false);
          addMessage('ai', 'Olá! 👋 Que produto você está procurando?');
          return;
        }
        
        // ✅ VALIDAR: Verificar se é um produto válido
        const category = data.classification?.category;
        const confidence = data.classification?.confidence || 0;
        
        console.log('[CLASSIFY] Categoria:', category, 'Confiança:', confidence);
        
        // Se confiança muito baixa, não é um produto válido
        if (confidence < 0.3 || category === 'general') {
          setLoading(false);
          addMessage('ai', '🤔 Não consegui identificar um produto específico.\n\n💡 Tente ser mais específico:\n• "iPhone 15 Pro"\n• "Honda Civic 2020"\n• "Notebook Dell"');
          return;
        }
        
        // ✅ SEMPRE ATUALIZAR CLASSIFICAÇÃO
        setSearchSession(s => ({ ...s, classification: data.classification }));
        
        // HYBRID MODE: Check if needs question
        if (data.needsQuestion && data.question) {
          setSearchSession(s => ({
            ...s,
            query,
            classification: data.classification,
            missingFields: data.missingFields || [],
            answers: {},
            step: 'asking',
          }));
          setLoading(false);
          const questionText = typeof data.question === 'object' ? data.question.question : data.question;
          addMessage('ai', questionText);
          return;
        }
        
        setSearchSession(s => ({ ...s, query, classification: data.classification, step: 'idle' }));
        setLoading(false);
        
        if (data.classification?.category === 'car' || data.classification?.category === 'motorcycle') {
          await executeTextSearch(query, 'RELEVANCE', data.classification);
        } else {
          setSearchSession(s => ({ ...s, step: 'searching' }));
        }
        
      } else {
        addMessage('ai', 'Erro ao processar. Tente novamente.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Classify error:', error);
      addMessage('ai', 'Erro ao processar. Tente novamente.');
      setLoading(false);
    }
  };

  const executeTextSearch = async (query: string, sortBy: string = 'RELEVANCE', classification?: any) => {
    console.log('[SEARCH] ========== INICIANDO BUSCA ==========');
    console.log('[SEARCH] Query:', query);
    console.log('[SEARCH] SortBy:', sortBy);
    console.log('[SEARCH] Classification:', classification);
    console.log('[SEARCH] User Credits:', userCredits);
    
    addMessage('ai', 'searching_animation');

    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) {
        console.error('[SEARCH] Usuário não encontrado no localStorage');
        router.push('/auth');
        return;
      }

      const userData = JSON.parse(user);
      console.log('[SEARCH] User ID:', userData.userId);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      console.log('[SEARCH] API URL:', API_URL);
      
      const params = new URLSearchParams({
        query: query,
        sortBy: sortBy
      });
      
      if (classification) {
        params.append('classification', JSON.stringify(classification));
        console.log('[SEARCH] Classificação adicionada aos params');
      }
      
      const fullUrl = `${API_URL}/search/text?${params.toString()}`;
      console.log('[SEARCH] URL completa:', fullUrl);
      
      console.log('[SEARCH] Fazendo requisição...');
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userData.token}`,
        },
      });

      console.log('[SEARCH] Status da resposta:', response.status);
      console.log('[SEARCH] Response OK?', response.ok);

      if (response.status === 401) {
        console.error('[SEARCH] Não autorizado - redirecionando para login');
        localStorage.removeItem('zavlo_user');
        router.push('/auth');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        
        console.log('[SEARCH] ========== RESPOSTA DO BACKEND ==========');
        console.log('[SEARCH] Data completa:', data);
        console.log('[SEARCH] Results:', data.results);
        console.log('[SEARCH] Total:', data.total);
        console.log('[SEARCH] Credits Used:', data.creditsUsed);
        console.log('[SEARCH] Remaining Credits:', data.remainingCredits);
        console.log('[SEARCH] Needs Question?', data.needsQuestion);
        console.log('[SEARCH] Question:', data.question);
        console.log('[SEARCH] Price Range Applied:', data.priceRangeApplied);
        
        const products = data.results || [];
        
        console.log('[SEARCH] Produtos encontrados:', products.length);
        
        if (typeof data.remainingCredits === 'number') {
          console.log('[SEARCH] Atualizando créditos de', userCredits, 'para', data.remainingCredits);
          updateCredits(data.remainingCredits, userData);
        } else {
          console.warn('[SEARCH] remainingCredits não retornado pelo backend');
        }
        
        const creditsUsed = data.creditsUsed || 1;
        const remainingCredits = data.remainingCredits ?? userCredits - 1;
        
        console.log('[SEARCH] Aguardando 1s antes de mostrar produtos...');
        await delay(1000);
        console.log('[SEARCH] Criando mensagem de produtos...');

        if (products.length === 0) {
            const cl = classification;
            const brand = cl?.detected_brand ? cl.detected_brand.charAt(0).toUpperCase() + cl.detected_brand.slice(1) : null;
            const model = cl?.detected_model ? cl.detected_model.charAt(0).toUpperCase() + cl.detected_model.slice(1) : null;
            const city  = cl?.user_location?.city || null;
            const cond  = cl?.condition === 'new' ? 'novo' : cl?.condition === 'used' ? 'usado' : null;
            const year  = cl?.detected_year || null;

            const vehicle = [brand, model, year, cond].filter(Boolean).join(' ');
            const where   = city ? ` em ${city.charAt(0).toUpperCase() + city.slice(1)}` : '';

            let msg = `😕 Não encontrei anúncios de **${vehicle || query}**${where} no momento.\n\n`;
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
            console.log('[SEARCH] ========== BUSCA CONCLUÍDA (0 resultados) ==========');
            return;
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
          setLoading(false);
      } else {
        const errorText = await response.text();
        console.error('[SEARCH] Erro na resposta:', errorText);
        addMessage('ai', 'Erro na busca. Tente novamente.');
        setLoading(false);
      }
    } catch (error) {
      console.error('[SEARCH] ========== ERRO NA BUSCA ==========');
      console.error('[SEARCH] Error:', error);
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
    console.log('💳 [CREDITS] Atualizando créditos:', {
      anterior: userCredits,
      novo: newCredits,
      diferença: userCredits - newCredits
    });
    
    setUserCredits(newCredits);
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
            onConfirmSearch={() => {}}
            onCancelSearch={() => {}}
            isEditingQuery={false}
            editedQuery=""
            onEditQueryChange={() => {}}
            onStartEditQuery={() => {}}
            onCancelEditQuery={() => {}}
            onConfirmEditQuery={() => {}}
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

      {/* Hybrid Mode Question Modal */}
      {hybridQuestion && (
        <QuestionModal
          question={hybridQuestion}
          missingFields={searchSession.missingFields}
          onAnswer={handleHybridAnswer}
          onSkip={handleHybridSkip}
          userLocation={searchSession.classification?.user_location}
        />
      )}

      {/* Sort Selection Modal */}
      {showSortQuestion && (
        <SortSelectionModal
          onSelect={handleSortSelection}
          onCancel={() => setSearchSession(s => ({ ...s, step: 'idle' }))}
        />
      )}
    </div>
  );
}
