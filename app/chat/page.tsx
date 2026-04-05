'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { QuickSuggestions } from '@/components/chat/QuickSuggestions';

import { detectIntent } from '@/utils/chat/intentDetector';
import { ContextManager, type SearchResult } from '@/utils/chat/contextManager';
import { parseClassifyQueryResponse } from '@/utils/chat/classifyResponseGuard';
import {
  orderQuestionFields,
  isScraperSpecificField,
  getVehiclePrimaryScraperByCondition,
  filterMissingFieldsByScraper,
  getQuestionForField,
  resolveQuestionForField as sharedResolveQuestionForField,
  getMercadoLivreQuestionFields,
  getOlxQuestionFields,
  getGoogleShoppingQuestionFields,
  getWebmotorsQuestionFields,
} from '@shared/chat/questionRules';
import { chatHistoryService } from '@/lib/chatHistory';
import { PLAN_PRICES, PLAN_CREDITS } from '@/lib/plans';
import type { ClassificationData, ClassificationQuestion, ClassifyQueryResponse } from '@shared/contracts/classification.contract';

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
  type: 'user' | 'ai' | 'products' | 'image_confirmation' | 'sort_question' | 'query_confirm' | 'question' | 'expansion';
  content: string;
  products?: unknown[];
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
  queryConfirmSortBy?: string;
  queryConfirmCreditEstimate?: number;
  queryConfirmNotes?: string[];
  isImageSort?: boolean;
  questionAnswered?: boolean;
  questionAnswerLabel?: string;
}

interface UserSession {
  token: string;
  userId?: string;
  credits?: number;
  [key: string]: unknown;
}

interface UserProfileResponse {
  credits?: number;
}

interface SearchImageResponse {
  results?: unknown[];
  productName?: string;
  classification?: ClassificationData;
  remainingCredits?: number;
  creditsUsed?: number;
}

interface SearchPricesResponse {
  results?: unknown[];
  remainingCredits?: number;
  creditsUsed?: number;
}

interface SearchTextResponse {
  results?: unknown[];
  error?: string;
  remainingCredits?: number;
  creditsUsed?: number;
  originalCity?: string;
  searchedNationally?: boolean;
  cityFilterApplied?: boolean;
  relaxedFilters?: string[];
  canExpandSearch?: boolean;
  expansionSources?: string[];
  primarySource?: string;
  priceRangeApplied?: { min?: number; max?: number; target?: number };
}

interface ApiErrorResponse {
  error?: string;
  message?: string;
}

const toNumericPrice = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  if (typeof value === 'string') {
    const normalized = value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
  return null;
};

const getBestPricedProduct = (products: unknown[]): (Record<string, unknown> & { price: number }) | null => {
  const candidates = products
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => {
      const price = toNumericPrice(item.price);
      return price ? { ...item, price } : null;
    })
    .filter((item): item is Record<string, unknown> & { price: number } => item !== null);

  if (candidates.length === 0) return null;
  return candidates.reduce((best, current) => (current.price < best.price ? current : best));
};

const getTopPricedProducts = (products: unknown[], limit = 3): (Record<string, unknown> & { price: number })[] => {
  const candidates = products
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => {
      const price = toNumericPrice(item.price);
      return price ? { ...item, price } : null;
    })
    .filter((item): item is Record<string, unknown> & { price: number } => item !== null)
    .sort((a, b) => a.price - b.price);

  const unique: (Record<string, unknown> & { price: number })[] = [];
  const seen = new Set<string>();
  for (const item of candidates) {
    const title = String(item.title ?? '').trim().toLowerCase();
    const source = String(item.source ?? item.marketplace ?? '').trim().toLowerCase();
    const key = `${title}|${source}|${item.price}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
    if (unique.length >= limit) break;
  }

  return unique;
};

const formatBRL = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const collectProductsFromMessages = (messages: Message[]): unknown[] =>
  messages.filter((m) => m.type === 'products').flatMap((m) => m.products ?? []);

const ESTIMATION_USD_TO_BRL = 5;
const ESTIMATION_MAX_COST_PER_CREDIT_BRL = Math.min(29.9 / 10, 59.9 / 20, 149 / 50, 14.9 / 5, 39.9 / 15, 84.9 / 35) * 0.35;
const ESTIMATION_WEBMOTORS_DEFAULT_REQUESTS = 10;
const ESTIMATION_WEBMOTORS_SELLER_ADDON_MULTIPLIER = 1.5;

const estimateCreditsForConfirmation = (classification?: ClassificationData | null): number | undefined => {
  if (!classification) return undefined;

  const rawScrapers = (classification as any)?.scrapers;
  const scraperNames = Array.isArray(rawScrapers)
    ? rawScrapers
        .map((item: any) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object' && typeof item.name === 'string') return item.name;
          return null;
        })
        .filter((name: string | null): name is string => !!name)
        .map((name) => name.toLowerCase())
    : [];

  const category = (classification as any)?.category;
  const condition = String((classification as any)?.condition || '').toLowerCase();
  const defaultVehiclePrimary = condition === 'new' ? 'mercadolivre' : 'olx';
  const primaryScraper = scraperNames[0]
    || ((category === 'car' || category === 'motorcycle') ? defaultVehiclePrimary : 'google_shopping');

  const ceilCredits = (costBrl: number) => Math.max(1, Math.ceil(costBrl / ESTIMATION_MAX_COST_PER_CREDIT_BRL));

  if (primaryScraper === 'google_shopping') {
    const requestedResults = Number((classification as any)?.google_limit || (classification as any)?.result_limit || 20);
    const costBrl = (20 / 1000) * Math.max(20, Math.min(requestedResults, 100)) * ESTIMATION_USD_TO_BRL;
    return ceilCredits(costBrl);
  }

  if (primaryScraper === 'olx') {
    const pages = Math.max(1, Math.min(Number((classification as any)?.olx_max_pages || 1), 3));
    const estimatedResults = pages * 50;
    const baseCostBrl = (10 / 1000) * estimatedResults * ESTIMATION_USD_TO_BRL;
    return ceilCredits(baseCostBrl) + Math.max(0, pages - 1);
  }

  if (primaryScraper === 'mercadolivre') {
    const requestedResults = Number((classification as any)?.result_limit || 20);
    const costBrl = (2 / 1000) * Math.max(10, Math.min(requestedResults, 50)) * ESTIMATION_USD_TO_BRL;
    return ceilCredits(costBrl);
  }

  if (primaryScraper === 'webmotors') {
    const classificationAny = classification as any;
    const maxRequests = Math.max(1, Math.min(Number(classificationAny?.webmotors_max_requests || ESTIMATION_WEBMOTORS_DEFAULT_REQUESTS), 30));
    const requestMultiplier = Math.max(1, maxRequests / ESTIMATION_WEBMOTORS_DEFAULT_REQUESTS);
    const sellerAddonMultiplier = classificationAny?.webmotors_seller_data_addon
      ? ESTIMATION_WEBMOTORS_SELLER_ADDON_MULTIPLIER
      : 1;
    return ceilCredits(0.30 * requestMultiplier * sellerAddonMultiplier * ESTIMATION_USD_TO_BRL);
  }

  return undefined;
};

const parseSortByFromText = (text: string): 'BEST_MATCH' | 'LOWEST_PRICE' | 'HIGHEST_PRICE' | 'TOP_RATED' | null => {
  const lower = text.toLowerCase();
  if (/(menor\s*pre[cç]o|mais\s*barato|barat)/.test(lower)) return 'LOWEST_PRICE';
  if (/(maior\s*pre[cç]o|mais\s*caro)/.test(lower)) return 'HIGHEST_PRICE';
  if (/(mais\s*avaliad|melhor\s*avaliad|top\s*rated|estrel)/.test(lower)) return 'TOP_RATED';
  if (/(relev|melhor\s*match|mais\s*relevante|padr[aã]o)/.test(lower)) return 'BEST_MATCH';
  return null;
};

const isAbortError = (error: unknown): boolean =>
  error instanceof Error && error.name === 'AbortError';

const parseCityStateFromInput = (rawInput: string): { city?: string; state?: string } => {
  const normalized = String(rawInput || '').trim();
  if (!normalized || /todo\s+o\s+brasil/i.test(normalized)) return {};

  const cleaned = normalized
    .replace(/^em\s+/i, '')
    .replace(/\s*[-–—]\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();

  const byComma = cleaned.split(',').map((part) => part.trim()).filter(Boolean);
  const rawCity = byComma[0] || cleaned;
  let state: string | undefined;

  if (byComma.length > 1) {
    const stateCandidate = byComma[1]
      .replace(/[()]/g, '')
      .trim()
      .toUpperCase();
    if (/^[A-Z]{2}$/.test(stateCandidate)) {
      state = stateCandidate;
    }
  }

  const city = rawCity
    .replace(/^cidade\s+de\s+/i, '')
    .replace(/^cidade\s+/i, '')
    .trim();

  return {
    city: city || undefined,
    state,
  };
};


const toContextResults = (products: unknown[]): SearchResult[] => {
  return products
    .filter((item): item is { id: string; title: string; price: number; brand?: string; condition?: 'new' | 'used'; location?: string } => {
      return !!item
        && typeof item === 'object'
        && typeof (item as { id?: unknown }).id === 'string'
        && typeof (item as { title?: unknown }).title === 'string'
        && typeof (item as { price?: unknown }).price === 'number';
    })
    .map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      brand: item.brand,
      condition: item.condition,
      location: item.location,
    }));
};

interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

function getNextQuestion(
  field: string,
  classification?: ClassificationData | null,
): string | ClassificationQuestion {
  return getQuestionForField(field, classification, classification?.suggested_question) as string | ClassificationQuestion;
}

const resolveQuestionForField = (
  field: string,
  candidate: unknown,
  classification?: ClassificationData | null,
): string | ClassificationQuestion => {
  return sharedResolveQuestionForField(field, candidate, classification, classification?.suggested_question) as string | ClassificationQuestion;
};

export default function ChatPage() {
  const router = useRouter();
  const contextManager = useRef(new ContextManager()).current;
  const INTRO_MESSAGE_ID = 'intro-message';
  const DEFAULT_INTRO_MESSAGE = 'Olá! 👋 Eu sou a **Zavlo**, sua assistente de compras inteligente.\n\n🔎 **Como funciona:**\n1️⃣ Você diz o produto (ex: "Honda Civic 2020")\n2️⃣ Eu faço perguntas rápidas para refinar\n3️⃣ Busco no marketplace principal\n4️⃣ Você pode expandir para outras plataformas\n\n🚗 Para veículos: **novo** geralmente começa no **Mercado Livre** e **usado** geralmente começa na **OLX**.\n\n💡 Dica: quanto mais detalhes você der, melhor fica o resultado.\n\nQual produto você quer encontrar agora?';
  const [messages, setMessages] = useState<Message[]>([
    {
      id: INTRO_MESSAGE_ID,
      type: 'ai',
      content: DEFAULT_INTRO_MESSAGE,
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
    classification: ClassificationData | null;
    missingFields: string[];
    answers: Record<string, string>;
    step: 'idle' | 'asking' | 'sort' | 'confirm';
    expansionSources: string[];
    primarySource: string;
    sortBy: string;
    scraperPlanAnnounced: boolean;
  }>({
    query: '',
    classification: null,
    missingFields: [],
    answers: {},
    step: 'idle',
    expansionSources: [],
    primarySource: '',
    sortBy: 'BEST_MATCH',
    scraperPlanAnnounced: false,
  });



  const [userCredits, setUserCredits] = useState(0);
  const userCreditsRef = useRef(0);
  const [inputReadyCue, setInputReadyCue] = useState(false);
  
  // Sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  const bestPriceRef = useRef<number | null>(null);
  
  const isProcessingRef = useRef(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Refs para evitar stale closure no saveChatToHistory
  const messagesRef = useRef(messages);
  const chatHistoryRef = useRef(chatHistory);
  const currentChatIdRef = useRef(currentChatId);
  const searchSessionRef = useRef(searchSession);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { chatHistoryRef.current = chatHistory; }, [chatHistory]);
  useEffect(() => { currentChatIdRef.current = currentChatId; }, [currentChatId]);
  useEffect(() => { searchSessionRef.current = searchSession; }, [searchSession]);

  useEffect(() => {
    if (messages.length > 1) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    }
  }, [messages.length]);

  const isLikelyInvalidInput = (text: string): boolean => {
    const normalized = text.trim();
    if (!normalized) return true;

    if (/^[^a-zA-ZÀ-ÿ0-9]+$/.test(normalized)) return true;
    if (/(.)\1{5,}/.test(normalized)) return true;

    const lettersOnly = normalized.toLowerCase().replace(/[^a-zà-ÿ]/g, '');
    if (lettersOnly.length >= 8 && !/[aeiouáéíóúâêôãõà]/i.test(lettersOnly)) return true;

    const tokens = normalized.toLowerCase().split(/\s+/).filter(Boolean);
    const usefulTokens = tokens.filter((token) => /[a-zà-ÿ0-9]/i.test(token));
    if (usefulTokens.length === 0) return true;

    return false;
  };

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

  const isMountedRef = useRef(true);
  useEffect(() => () => { isMountedRef.current = false; }, []);

  useEffect(() => {
    if (!currentChatId || messages.length <= 1) return;
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled && isMountedRef.current) saveChatToHistory();
    }, 2000);
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [messages, currentChatId]);

  const loadUserCredits = async (retries = 2) => {
    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) return;
      const userData = JSON.parse(user);
      const response = await fetch(apiUrl('/users/profile'), {
        headers: { 'Authorization': `Bearer ${userData.token}` },
      });
      if (response.ok) {
        const profile: UserProfileResponse = await response.json();
        const credits = profile.credits || 0;
        setUserCredits(credits);
        userCreditsRef.current = credits;
      } else if (retries > 0) {
        setTimeout(() => loadUserCredits(retries - 1), 2000);
      }
    } catch (error) {
      console.error('Erro ao carregar créditos:', error);
      if (retries > 0) setTimeout(() => loadUserCredits(retries - 1), 2000);
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
        } else {
          const saved = localStorage.getItem(`zavlo_chat_history_${userId}`);
          if (saved) {
            const parsedHistory = JSON.parse(saved);
            if (Array.isArray(parsedHistory)) {
              const normalized = parsedHistory.map((chat: any) => ({
                ...chat,
                createdAt: new Date(chat.createdAt),
                updatedAt: new Date(chat.updatedAt),
                messages: Array.isArray(chat.messages)
                  ? chat.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
                  : [],
              }));
              setChatHistory(normalized);
            }
          }
        }
      } catch (firestoreError) {
        console.warn('Firestore indisponível, usando localStorage');
        const saved = localStorage.getItem(`zavlo_chat_history_${userId}`);
        if (saved) {
          const parsedHistory = JSON.parse(saved);
          if (Array.isArray(parsedHistory)) {
            const normalized = parsedHistory.map((chat: any) => ({
              ...chat,
              createdAt: new Date(chat.createdAt),
              updatedAt: new Date(chat.updatedAt),
              messages: Array.isArray(chat.messages)
                ? chat.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
                : [],
            }));
            setChatHistory(normalized);
          } else {
            setChatHistory([]);
          }
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

      const cleanedMessages = currentMessages
        .filter(m => m.content !== 'searching_animation')
        .slice(-50)
        .map(m =>
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
    if (currentChatIdRef.current && currentChatIdRef.current !== chatId && messagesRef.current.length > 1) {
      void saveChatToHistory();
    }
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      const best = getBestPricedProduct(collectProductsFromMessages(chat.messages));
      bestPriceRef.current = best?.price ?? null;
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
      id: INTRO_MESSAGE_ID,
      type: 'ai',
      content: DEFAULT_INTRO_MESSAGE,
      timestamp: new Date(),
    }]);
    setUploadedImage(null);
    setImageFile(null);
    setDetectedProductName('');
    setAwaitingImageConfirmation(false);
    setAwaitingImageSort(false);
    setInputReadyCue(false);
    bestPriceRef.current = null;
    isProcessingRef.current = false;
    setSearchSession({
      query: '',
      classification: null,
      missingFields: [],
      answers: {},
      step: 'idle',
      expansionSources: [],
      primarySource: '',
      sortBy: 'BEST_MATCH',
      scraperPlanAnnounced: false,
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
    if (!imageFile || loading || isProcessingRef.current) return;
    if (!uploadedImage || !uploadedImage.startsWith('data:image/')) {
      addMessage('ai', 'Imagem inválida. Por favor, selecione uma imagem válida.');
      setUploadedImage(null);
      setImageFile(null);
      setLoading(false);
      isProcessingRef.current = false;
      return;
    }
    isProcessingRef.current = true;
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
      isProcessingRef.current = false;
      return;
    }

    addMessage('ai', '🔍 Analisando sua imagem...\n\nAguarde enquanto identifico o produto.');

    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) {
        setLoading(false);
        setUploadedImage(null);
        setImageFile(null);
        router.push('/auth');
        return;
      }

      const userData = JSON.parse(user);
      const controller = new AbortController();
      // #10: Google Lens pode demorar até 120s — usar 130s para dar margem
      const timeout = setTimeout(() => controller.abort(), 130000);

      let response: Response;
      try {
        response = await fetch(apiUrl('/search/image'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageData: uploadedImage }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      if (response.status === 401) {
        localStorage.removeItem('zavlo_user');
        setLoading(false);
        setUploadedImage(null);
        setImageFile(null);
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
        const data: SearchImageResponse = await response.json();
        
        if (typeof data.remainingCredits === 'number') {
          updateCredits(data.remainingCredits, userData as UserSession);
        }

        const creditsUsed = data.creditsUsed || 1;
        const remainingCredits = data.remainingCredits ?? userCredits - 1;
        const productName = data.productName || 'Produto não identificado';

        await delay(800);
        setUploadedImage(null);
        setImageFile(null);
        setDetectedProductName(productName);
        if (data.classification) {
          setSearchSession(s => ({ ...s, classification: data.classification }));
        }
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
    } catch (error: unknown) {
      console.error('Image search error:', error);
      const msg = isAbortError(error)
        ? '⏱️ A análise da imagem demorou demais. Tente novamente.'
        : 'Erro ao processar imagem. Tente novamente.';
      addMessage('ai', msg);
      setUploadedImage(null);
      setImageFile(null);
      setLoading(false);
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleImagePriceSearch = () => {
    setMessages(prev => prev.filter(m => m.type !== 'image_confirmation'));
    const sortMessage: Message = {
      id: crypto.randomUUID(),
      type: 'sort_question',
      content: 'Como deseja ordenar os resultados?',
      timestamp: new Date(),
      isImageSort: true,
    };
    setMessages(prev => [...prev, sortMessage]);
    setAwaitingImageConfirmation(false);
    setAwaitingImageSort(true);
    // #6: unificar guard — step='sort' cobre ambos os fluxos
    setSearchSession(s => ({ ...s, step: 'sort' }));
  };

  const executeImageSearch = async (sortBy: string) => {
    if (!detectedProductName || loading) return;

    setLoading(true);
    setMessages(prev => prev.filter(m => m.type !== 'sort_question'));
    const searchingMsgId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: searchingMsgId, type: 'ai' as const, content: 'searching_animation', timestamp: new Date() }]);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) {
        clearTimeout(timeout);
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
        body: JSON.stringify({ productName: detectedProductName, sortBy, classification: searchSessionRef.current.classification }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.status === 401) {
        localStorage.removeItem('zavlo_user');
        router.push('/auth');
        return;
      }

      setMessages(prev => prev.filter(m => m.id !== searchingMsgId));

      if (response.ok) {
        const data: SearchPricesResponse = await response.json();
        const products = data.results || [];

        if (typeof data.remainingCredits === 'number') {
          updateCredits(data.remainingCredits, userData as UserSession);
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
        setMessages(prev => {
          const nextMessages = [...prev, productsMessage];
          const allProducts = collectProductsFromMessages(nextMessages);
          const bestProduct = getBestPricedProduct(allProducts);

          if (!bestProduct) return nextMessages;

          const isNewBest = bestPriceRef.current === null || bestProduct.price < bestPriceRef.current;
          if (!isNewBest) return nextMessages;

          bestPriceRef.current = bestProduct.price;
          const bestSummary: Message = {
            id: crypto.randomUUID(),
            type: 'ai',
            content: '🏆 O melhor preço que conseguimos para o seu produto foi esse:',
            timestamp: new Date(),
          };
          const bestProductMessage: Message = {
            id: crypto.randomUUID(),
            type: 'products',
            content: 'Melhor oferta até agora',
            products: [bestProduct],
            timestamp: new Date(),
          };
          return [...nextMessages, bestSummary, bestProductMessage];
        });
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
      clearTimeout(timeout);
      setMessages(prev => prev.filter(m => m.id !== searchingMsgId));
      const msg = isAbortError(error)
        ? '⏱️ A busca de preços demorou demais. Tente novamente.'
        : 'Erro ao buscar preços. Tente novamente.';
      addMessage('ai', msg);
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
    // #2: usar ref para evitar stale closure
    const { query, classification, sortBy } = searchSessionRef.current;
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

  const freezeCurrentQuestionBubble = (answerLabel?: string) => {
    setMessages(prev => {
      const idx = [...prev].reverse().findIndex(m => m.type === 'question');
      if (idx === -1) return prev;
      const realIdx = prev.length - 1 - idx;
      const updated = [...prev];
      const q = updated[realIdx];
      updated[realIdx] = {
        ...q,
        questionAnswered: true,
        questionAnswerLabel: answerLabel || 'Respondido',
      };
      return updated;
    });
  };

  const maybeAnnounceVehicleScraperPlan = (classification?: ClassificationData | null, nextField?: string) => {
    const isVehicle = classification?.category === 'car' || classification?.category === 'motorcycle';
    if (!isVehicle || !isScraperSpecificField(nextField)) return;
    if (searchSessionRef.current.scraperPlanAnnounced) return;

    const primaryScraper = getVehiclePrimaryScraperByCondition(classification);
    const primaryLabel = primaryScraper === 'mercadolivre' ? 'Mercado Livre' : 'OLX';
    const expansionLabels = primaryScraper === 'mercadolivre'
      ? 'OLX e Webmotors'
      : 'Mercado Livre e Webmotors';
    addMessage('ai', `📍 Estratégia desta busca: primeiro vou buscar no **${primaryLabel}**. Depois você poderá expandir para outros marketplaces, como ${expansionLabels}.`);
    setSearchSession(s => ({ ...s, scraperPlanAnnounced: true }));
  };

  const handleHybridAnswer = async (answer: string, _fromTyping = false) => {
    const displayText = (() => {
      try {
        const parsed = JSON.parse(answer);
        if (parsed?.value && typeof parsed.value === 'object') {
          const { min, max } = parsed.value as { min?: number; max?: number };
          if (typeof min === 'number' && typeof max === 'number') return `entre ${min/1000}mil e ${max/1000}mil`;
          if (typeof max === 'number') return `até ${max/1000}mil`;
          if (typeof min === 'number') return `acima de ${min/1000}mil`;
        }
      } catch {}
      return answer;
    })();

    freezeCurrentQuestionBubble(displayText || 'Continuar sem esse filtro');
    if (answer) {
      if (displayText) addMessage('user', displayText);
    }
    // #2: usar ref para evitar stale closure
    const { missingFields, query, answers, classification } = searchSessionRef.current;
    if (!missingFields.length) return;
    const currentField = missingFields[0];
    
    // Normalizar respostas especiais
    const normalizedAnswer = (() => {
      const lower = answer.toLowerCase().trim();
      if (currentField === 'condition' && lower === 'ambos') return '';
      if (currentField === 'year' && lower === 'qualquer ano') return '';
      if (currentField === 'location' && lower === 'todo o brasil') return 'todo o brasil';
      if (['transmission', 'fuel', 'body_type', 'brand'].includes(currentField) && lower === 'qualquer') return '';
      return answer;
    })();
    
    const updatedAnswers = { ...answers, [currentField]: normalizedAnswer };

    // Enriquecer classificação com a resposta do usuário
    const updatedClassification = { ...classification };
    if (currentField === 'condition' && normalizedAnswer) {
      updatedClassification.condition = normalizedAnswer === 'novo' ? 'new' : 'used';
      if (updatedClassification.category === 'car' || updatedClassification.category === 'motorcycle') {
        const prioritizedScrapers = normalizedAnswer === 'novo'
          ? ['mercadolivre', 'olx', 'webmotors']
          : ['olx', 'mercadolivre', 'webmotors'];
        (updatedClassification as any).scrapers = prioritizedScrapers.map((name, index) => ({
          name,
          score: Math.max(0.7, 1 - (index * 0.1)),
        }));
      }
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
    } else if (currentField === 'location' && normalizedAnswer === 'todo o brasil') {
      updatedClassification.user_location = null;
    } else if (currentField === 'location' && normalizedAnswer) {
      const parsedLocation = parseCityStateFromInput(normalizedAnswer);
      if (parsedLocation.city || parsedLocation.state) {
        updatedClassification.user_location = {
          city: parsedLocation.city,
          state: parsedLocation.state,
        };
      } else {
        updatedClassification.user_location = { city: normalizedAnswer };
      }
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
    } else if (currentField === 'prefer_price_drop' && normalizedAnswer) {
      const key = normalizedAnswer.toLowerCase().trim();
      updatedClassification.prefer_price_drop =
        ['sim', 'yes', 's', 'ok', 'queda', 'caindo', 'oferta'].some(w => key.includes(w));
    } else if (currentField === 'ml_scrape_ofertas' && normalizedAnswer) {
      const key = normalizedAnswer.toLowerCase().trim();
      (updatedClassification as any).ml_scrape_ofertas = ['sim', 'yes', 's', 'ok', 'ofertas', 'oferta'].some(w => key.includes(w));
    } else if (currentField === 'ml_promoted' && normalizedAnswer) {
      const key = normalizedAnswer.toLowerCase().trim();
      (updatedClassification as any).ml_promoted = ['sim', 'yes', 's', 'ok', 'patrocin', 'anúncio', 'anuncio'].some(w => key.includes(w));
    } else if (currentField === 'olx_max_pages' && normalizedAnswer) {
      const parsed = Number(normalizedAnswer);
      if (Number.isFinite(parsed)) {
        (updatedClassification as any).olx_max_pages = Math.min(Math.max(parsed, 1), 3);
      }
    } else if (currentField === 'webmotors_seller_data_addon' && normalizedAnswer) {
      const key = normalizedAnswer.toLowerCase().trim();
      (updatedClassification as any).webmotors_seller_data_addon = ['sim', 'yes', 's', 'ok', 'vendedor', 'cnpj', 'telefone'].some(w => key.includes(w));
    } else if (currentField === 'webmotors_max_requests' && normalizedAnswer) {
      const parsed = Number(normalizedAnswer);
      if (Number.isFinite(parsed)) {
        (updatedClassification as any).webmotors_max_requests = Math.min(Math.max(parsed, 1), 30);
      }
    } else if (currentField === 'google_country' && normalizedAnswer) {
      (updatedClassification as any).google_country = normalizedAnswer.toLowerCase().trim();
    } else if (currentField === 'google_language' && normalizedAnswer) {
      (updatedClassification as any).google_language = normalizedAnswer.toLowerCase().trim();
    } else if (currentField === 'google_limit' && normalizedAnswer) {
      const parsed = Number(normalizedAnswer);
      if (Number.isFinite(parsed)) {
        (updatedClassification as any).google_limit = Math.min(Math.max(parsed, 20), 100);
      }
    }

    // Enriquecer query textual para exibição
    let displayAnswer = answer;
    if (
      !normalizedAnswer
      || (currentField === 'location' && normalizedAnswer === 'todo o brasil')
      || ['ml_scrape_ofertas', 'ml_promoted', 'olx_max_pages', 'webmotors_seller_data_addon', 'webmotors_max_requests', 'google_country', 'google_language', 'google_limit'].includes(currentField)
    ) {
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

    setSearchSession(s => ({
      ...s,
      query: enrichedQuery,
      classification: updatedClassification,
      answers: updatedAnswers,
      step: 'asking',
    }));

    await classifyWithAnswers(enrichedQuery, updatedAnswers, updatedClassification);
  };

  const handleHybridSkip = async () => {
    const session = searchSessionRef.current;
    if (session.step !== 'asking' || loading) return;
    await handleHybridAnswer('', true);
  };

  // Reenvia ao backend com as respostas para enriquecer a classification lá
  // Recebe sortBy como parâmetro para evitar stale closure
  const classifyWithAnswers = async (
    query: string,
    answers: Record<string, string>,
    prevClassification: ClassificationData,
  ) => {
    const controller = new AbortController();
    // #8: 20s > 15s do backend para dar margem ao fallback interno do backend
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) { router.push('/auth'); return; }
      const userData: UserSession = JSON.parse(user);

      let response: Response;
      try {
        response = await fetch(apiUrl('/search/classify'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, answers, prevClassification }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      if (!response.ok) throw new Error(`classify failed: ${response.status}`);
      const rawData: unknown = await response.json();
      const data = parseClassifyQueryResponse(rawData);
      if (!data) throw new Error('invalid classify response');
      const enrichedClassification: ClassificationData = data.classification
        ? { ...prevClassification, ...data.classification }
        : prevClassification;

      // Se o backend ainda quer fazer perguntas sobre campos não respondidos, continuar perguntando
      if (data.needsQuestion && data.missingFields?.length > 0) {
        const compatibleFields = filterMissingFieldsByScraper(data.missingFields as string[], enrichedClassification);
        const mlExtraFields = getMercadoLivreQuestionFields(enrichedClassification, answers);
        const olxExtraFields = getOlxQuestionFields(enrichedClassification, answers);
        const webmotorsExtraFields = getWebmotorsQuestionFields(enrichedClassification, answers);
        const googleExtraFields = getGoogleShoppingQuestionFields(enrichedClassification, answers);
        const mergedFields = orderQuestionFields(
          [...new Set([...compatibleFields, ...mlExtraFields, ...olxExtraFields, ...webmotorsExtraFields, ...googleExtraFields])],
          enrichedClassification,
        );
        const newMissingFields: string[] = mergedFields.filter(f => !(f in answers));
        if (newMissingFields.length > 0) {
          const nextField = newMissingFields[0];
          maybeAnnounceVehicleScraperPlan(enrichedClassification, nextField);
          const nextQ = resolveQuestionForField(nextField, data.question, enrichedClassification);
          const nextText = typeof nextQ === 'object' ? nextQ.question : nextQ;
          const nextSuggestions = typeof nextQ === 'object' ? nextQ.suggestions : undefined;
          setSearchSession(s => ({
            ...s,
            query,
            classification: enrichedClassification,
            missingFields: newMissingFields,
            answers,
            step: 'asking',
          }));
          const qMsg: Message = {
            id: crypto.randomUUID(),
            type: 'question',
            content: nextText,
            timestamp: new Date(),
            questionType: nextField,
            questionSuggestions: nextSuggestions,
            userLocation: enrichedClassification?.user_location,
          };
          setMessages(prev => [...prev, qMsg]);
          return;
        }
      }

      const mlPendingFields = orderQuestionFields(
        getMercadoLivreQuestionFields(enrichedClassification, answers)
          .filter(f => !(f in answers)),
        enrichedClassification,
      );
      if (mlPendingFields.length > 0) {
        const nextField = mlPendingFields[0];
        maybeAnnounceVehicleScraperPlan(enrichedClassification, nextField);
        const nextQ = getNextQuestion(nextField, enrichedClassification);
        const nextText = typeof nextQ === 'object' ? nextQ.question : nextQ;
        const nextSuggestions = typeof nextQ === 'object' ? nextQ.suggestions : undefined;
        setSearchSession(s => ({
          ...s,
          query,
          classification: enrichedClassification,
          missingFields: mlPendingFields,
          answers,
          step: 'asking',
        }));
        const qMsg: Message = {
          id: crypto.randomUUID(),
          type: 'question',
          content: nextText,
          timestamp: new Date(),
          questionType: nextField,
          questionSuggestions: nextSuggestions,
          userLocation: enrichedClassification?.user_location,
        };
        setMessages(prev => [...prev, qMsg]);
        return;
      }

      const olxPendingFields = orderQuestionFields(
        getOlxQuestionFields(enrichedClassification, answers)
          .filter(f => !(f in answers)),
        enrichedClassification,
      );
      if (olxPendingFields.length > 0) {
        const nextField = olxPendingFields[0];
        maybeAnnounceVehicleScraperPlan(enrichedClassification, nextField);
        const nextQ = getNextQuestion(nextField, enrichedClassification);
        const nextText = typeof nextQ === 'object' ? nextQ.question : nextQ;
        const nextSuggestions = typeof nextQ === 'object' ? nextQ.suggestions : undefined;
        setSearchSession(s => ({
          ...s,
          query,
          classification: enrichedClassification,
          missingFields: olxPendingFields,
          answers,
          step: 'asking',
        }));
        const qMsg: Message = {
          id: crypto.randomUUID(),
          type: 'question',
          content: nextText,
          timestamp: new Date(),
          questionType: nextField,
          questionSuggestions: nextSuggestions,
          userLocation: enrichedClassification?.user_location,
        };
        setMessages(prev => [...prev, qMsg]);
        return;
      }

      const webmotorsPendingFields = orderQuestionFields(
        getWebmotorsQuestionFields(enrichedClassification, answers)
          .filter(f => !(f in answers)),
        enrichedClassification,
      );
      if (webmotorsPendingFields.length > 0) {
        const nextField = webmotorsPendingFields[0];
        maybeAnnounceVehicleScraperPlan(enrichedClassification, nextField);
        const nextQ = getNextQuestion(nextField, enrichedClassification);
        const nextText = typeof nextQ === 'object' ? nextQ.question : nextQ;
        const nextSuggestions = typeof nextQ === 'object' ? nextQ.suggestions : undefined;
        setSearchSession(s => ({
          ...s,
          query,
          classification: enrichedClassification,
          missingFields: webmotorsPendingFields,
          answers,
          step: 'asking',
        }));
        const qMsg: Message = {
          id: crypto.randomUUID(),
          type: 'question',
          content: nextText,
          timestamp: new Date(),
          questionType: nextField,
          questionSuggestions: nextSuggestions,
          userLocation: enrichedClassification?.user_location,
        };
        setMessages(prev => [...prev, qMsg]);
        return;
      }

      const googlePendingFields = orderQuestionFields(
        getGoogleShoppingQuestionFields(enrichedClassification, answers)
          .filter(f => !(f in answers)),
        enrichedClassification,
      );
      if (googlePendingFields.length > 0) {
        const nextField = googlePendingFields[0];
        maybeAnnounceVehicleScraperPlan(enrichedClassification, nextField);
        const nextQ = getNextQuestion(nextField, enrichedClassification);
        const nextText = typeof nextQ === 'object' ? nextQ.question : nextQ;
        const nextSuggestions = typeof nextQ === 'object' ? nextQ.suggestions : undefined;
        setSearchSession(s => ({
          ...s,
          query,
          classification: enrichedClassification,
          missingFields: googlePendingFields,
          answers,
          step: 'asking',
        }));
        const qMsg: Message = {
          id: crypto.randomUUID(),
          type: 'question',
          content: nextText,
          timestamp: new Date(),
          questionType: nextField,
          questionSuggestions: nextSuggestions,
          userLocation: enrichedClassification?.user_location,
        };
        setMessages(prev => [...prev, qMsg]);
        return;
      }

      setSearchSession(s => ({ ...s, classification: enrichedClassification, step: 'idle', scraperPlanAnnounced: false }));
      askSortThenSearch(query, enrichedClassification);
    } catch {
      const fallbackClassification: ClassificationData = { ...prevClassification, search_query: query };
      // #5: garantir step='idle' antes de askSortThenSearch
      setSearchSession(s => ({ ...s, step: 'idle', scraperPlanAnnounced: false }));
      askSortThenSearch(query, fallbackClassification);
    }
  };

  const handleSend = async (messageText?: string) => {
    const rawInput = String(messageText ?? input).replace(/[\x00-\x1F\x7F]/g, ' ').trim();
    const currentInput = rawInput.slice(0, 500);
    if (!currentInput || loading) return;
    if (rawInput.length > 500) {
      addMessage('ai', '✂️ Sua mensagem estava muito longa e foi resumida para processar melhor.');
    }
    setInput('');

    // Handle image confirmation
    if (awaitingImageConfirmation) {
      const lowerInput = currentInput.toLowerCase().trim();
      if (['sim', 'sim!', 'yes', 'y', 's', 'buscar', 'buscar preços', 'pode buscar', 'ok'].includes(lowerInput)) {
        handleImagePriceSearch();
        return;
      } else if (['não', 'nao', 'no', 'n', 'cancelar', 'não quero', 'nao quero'].includes(lowerInput)) {
        handleImageSearchReject();
        return;
      } else {
        addMessage('ai', '❓ Por favor, responda apenas com \"sim\" ou \"não\".');
        return;
      }
    }

    // Handle hybrid question — user typed instead of clicking a button
    if (searchSession.step === 'asking') {
      await handleHybridAnswer(currentInput, true);
      return;
    }

    // #7: guard unificado via step='sort' — awaitingImageSort redundante
    if (awaitingImageSort && searchSessionRef.current.step !== 'sort') {
      addMessage('ai', '⏳ Selecione uma opção de ordenação acima para continuar.');
      setLoading(false);
      return;
    }

    // Guard inteligente: sort_question/query_confirm aceitando comando textual
    const sessionSnap = searchSessionRef.current;
    if (sessionSnap.step === 'sort') {
      const sortBy = parseSortByFromText(currentInput);
      if (sortBy) {
        if (awaitingImageSort) await executeImageSearch(sortBy);
        else executeTextSort(sortBy);
        return;
      }
      addMessage('ai', '⏳ Escolha a ordenação acima ou digite: "menor preço", "maior preço", "mais avaliados" ou "mais relevante".');
      setLoading(false);
      return;
    }

    if (sessionSnap.step === 'confirm') {
      const lower = currentInput.toLowerCase();
      const wantsConfirm = /(buscar|confirm|ok|pode\s*ir|seguir|manda|vai)/.test(lower);
      if (wantsConfirm) {
        const lastConfirm = [...messagesRef.current].reverse().find(m => m.type === 'query_confirm');
        if (lastConfirm) {
          const sortBy = lastConfirm.queryConfirmSortBy || sessionSnap.sortBy || 'BEST_MATCH';
          await handleQueryConfirm(lastConfirm.content, sortBy);
          return;
        }
      }
      addMessage('ai', '⏳ Confirme a busca acima ou edite o texto da consulta e clique em "Buscar agora".');
      setLoading(false);
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: currentInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

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
        setSearchSession(s => ({ ...s, expansionSources: [] }));
        setMessages(prev => prev.filter(m => m.type !== 'expansion'));
        addMessage('ai', 'Perfeito! Encerramos por aqui ✅. Se quiser, posso iniciar uma nova busca agora mesmo.');
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
      // Input não reconhecido com expansionSources ativo — orientar sem consumir crédito
      addMessage('ai', '👆 Clique em um marketplace acima para expandir a busca, ou diga **"não"** para encerrar.');
      setLoading(false);
      return;
    }

    if (isLikelyInvalidInput(currentInput)) {
      addMessage('ai', '🤔 Não consegui entender essa mensagem.\n\nTente algo como:\n• "quero um honda civic 2020"\n• "iphone 15 pro até 5 mil"\n• "notebook gamer"');
      setLoading(false);
      return;
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
        addMessage('ai', 'Olá! 👋\n\nMe diga o produto + detalhes (modelo, ano, faixa de preço) que eu inicio a busca agora.');
        setLoading(false);
        return;
      }

      if (intent.type === 'despedida') {
        const topOffers = getTopPricedProducts(collectProductsFromMessages(messagesRef.current), 3);
        if (topOffers.length === 0) {
          addMessage('ai', 'Até logo! 👋 Volte sempre que precisar encontrar o melhor preço. 😊');
          setLoading(false);
          return;
        }

        bestPriceRef.current = topOffers[0].price;
        const summaryLines = topOffers.map((offer, index) => {
          const title = String(offer.title ?? 'Produto');
          return `${index + 1}. ${title} — **${formatBRL(offer.price)}**`;
        });

        setMessages(prev => ([
          ...prev,
          {
            id: crypto.randomUUID(),
            type: 'ai',
            content: `Até logo! 👋\n\nResumo da sessão: aqui está seu **Top ${topOffers.length} menores preços** encontrados:\n${summaryLines.join('\n')}`,
            timestamp: new Date(),
          },
          {
            id: crypto.randomUUID(),
            type: 'products',
            content: `Top ${topOffers.length} melhores ofertas da sessão`,
            products: topOffers,
            timestamp: new Date(),
          },
        ]));
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

      if (intent.type === 'offer') {
        addMessage('ai', '💬 Para fazer uma oferta, entre em contato diretamente com o vendedor pelo anúncio!\n\nQuer que eu busque mais opções com preço menor?');
        setLoading(false);
        return;
      }

      if (intent.type === 'other') {
        addMessage('ai', '🤔 Não entendi. Digite o nome do produto que você procura!');
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

      const userData: UserSession = JSON.parse(user);
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000); // #8: 20s > 15s do backend
      let response: Response;
      try {
        response = await fetch(apiUrl('/search/classify'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      if (response.status === 401) {
        localStorage.removeItem('zavlo_user');
        router.push('/auth');
        return;
      }

      if (response.ok) {
        const rawData: unknown = await response.json();
        const data = parseClassifyQueryResponse(rawData);
        if (!data) {
          addMessage('ai', 'Não consegui entender a resposta da classificação. Tente novamente.');
          setLoading(false);
          return;
        }
        
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
        if (data.needsQuestion && (data.question || (data.missingFields?.length ?? 0) > 0)) {
          const backendFields: string[] = filterMissingFieldsByScraper(data.missingFields || [], data.classification);
          const mlExtraFields = getMercadoLivreQuestionFields(data.classification, {});
          const olxExtraFields = getOlxQuestionFields(data.classification, {});
          const webmotorsExtraFields = getWebmotorsQuestionFields(data.classification, {});
          const googleExtraFields = getGoogleShoppingQuestionFields(data.classification, {});
          const missingFields: string[] = orderQuestionFields(
            [...new Set([...backendFields, ...mlExtraFields, ...olxExtraFields, ...webmotorsExtraFields, ...googleExtraFields])],
            data.classification,
          );
          const firstField = missingFields[0];
          if (!firstField) {
            setSearchSession(s => ({ ...s, query, classification: data.classification, step: 'idle' }));
            setLoading(false);
            askSortThenSearch(query, data.classification);
            return;
          }
          const q = resolveQuestionForField(firstField, data.question, data.classification);
          const questionText = typeof q === 'object' ? q.question : q;
          const suggestions = typeof q === 'object' ? q.suggestions : undefined;
          setSearchSession(s => ({
            ...s,
            query,
            classification: data.classification,
            missingFields,
            answers: {},
            step: 'asking',
            scraperPlanAnnounced: false,
          }));
          setLoading(false);
          maybeAnnounceVehicleScraperPlan(data.classification, firstField);
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

        const mlPendingFields = orderQuestionFields(getMercadoLivreQuestionFields(data.classification, {}), data.classification);
        if (mlPendingFields.length > 0) {
          const firstField = mlPendingFields[0];
          const q = getNextQuestion(firstField, data.classification);
          const questionText = typeof q === 'object' ? q.question : q;
          const suggestions = typeof q === 'object' ? q.suggestions : undefined;
          setSearchSession(s => ({
            ...s,
            query,
            classification: data.classification,
            missingFields: mlPendingFields,
            answers: {},
            step: 'asking',
            scraperPlanAnnounced: false,
          }));
          setLoading(false);
          maybeAnnounceVehicleScraperPlan(data.classification, firstField);
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

        const olxPendingFields = orderQuestionFields(getOlxQuestionFields(data.classification, {}), data.classification);
        if (olxPendingFields.length > 0) {
          const firstField = olxPendingFields[0];
          const q = getNextQuestion(firstField, data.classification);
          const questionText = typeof q === 'object' ? q.question : q;
          const suggestions = typeof q === 'object' ? q.suggestions : undefined;
          setSearchSession(s => ({
            ...s,
            query,
            classification: data.classification,
            missingFields: olxPendingFields,
            answers: {},
            step: 'asking',
            scraperPlanAnnounced: false,
          }));
          setLoading(false);
          maybeAnnounceVehicleScraperPlan(data.classification, firstField);
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

        const webmotorsPendingFields = orderQuestionFields(getWebmotorsQuestionFields(data.classification, {}), data.classification);
        if (webmotorsPendingFields.length > 0) {
          const firstField = webmotorsPendingFields[0];
          const q = getNextQuestion(firstField, data.classification);
          const questionText = typeof q === 'object' ? q.question : q;
          const suggestions = typeof q === 'object' ? q.suggestions : undefined;
          setSearchSession(s => ({
            ...s,
            query,
            classification: data.classification,
            missingFields: webmotorsPendingFields,
            answers: {},
            step: 'asking',
            scraperPlanAnnounced: false,
          }));
          setLoading(false);
          maybeAnnounceVehicleScraperPlan(data.classification, firstField);
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

        const googlePendingFields = orderQuestionFields(getGoogleShoppingQuestionFields(data.classification, {}), data.classification);
        if (googlePendingFields.length > 0) {
          const firstField = googlePendingFields[0];
          const q = getNextQuestion(firstField, data.classification);
          const questionText = typeof q === 'object' ? q.question : q;
          const suggestions = typeof q === 'object' ? q.suggestions : undefined;
          setSearchSession(s => ({
            ...s,
            query,
            classification: data.classification,
            missingFields: googlePendingFields,
            answers: {},
            step: 'asking',
            scraperPlanAnnounced: false,
          }));
          setLoading(false);
          maybeAnnounceVehicleScraperPlan(data.classification, firstField);
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
        askSortThenSearch(query, data.classification);
        
      } else {
        addMessage('ai', 'Erro ao processar. Tente novamente.');
        setLoading(false);
      }
    } catch (error: any) {
      const msg = error?.name === 'AbortError'
        ? '⏱️ O serviço de classificação demorou demais. Tente novamente.'
        : 'Erro ao processar. Tente novamente.';
      addMessage('ai', msg);
      setLoading(false);
    }
  };

  const sanitizeForLog = (value: string): string =>
    String(value).replace(/[\r\n\t\x00-\x1F\x7F]/g, ' ').trim();

  // Mostra bolha de ordenação e aguarda escolha do usuário antes de buscar
  const executeTextSort = (sortBy: string) => {
    if (isProcessingRef.current) return;
    const { query, classification } = searchSessionRef.current;
    setMessages(prev => prev.filter(m => m.type !== 'sort_question'));
    const cl = classification;
    // #2: usar search_query (enriquecida pelo backend) em vez de normalized_query
    const parts: string[] = [cl?.search_query || cl?.normalized_query || query];
    // evitar duplicar tokens já presentes no search_query
    const base = (cl?.search_query || '').toLowerCase();
    if (cl?.detected_year && !base.includes(String(cl.detected_year))) parts.push(String(cl.detected_year));
    if (cl?.condition === 'new'  && !base.includes('novo'))  parts.push('novo');
    if (cl?.condition === 'used' && !base.includes('usado')) parts.push('usado');
    if (cl?.user_location?.city && !base.includes(cl.user_location.city.toLowerCase())) parts.push(`em ${cl.user_location.city}`);
    const finalQueryText = parts.join(' ').trim();
    const extraNotes: string[] = [];
    const classificationAny = cl as any;
    if (classificationAny?.google_limit && Number(classificationAny.google_limit) > 20) {
      extraNotes.push(`Google Shopping com ${classificationAny.google_limit} resultados pode consumir mais créditos.`);
    }
    if (classificationAny?.olx_max_pages && Number(classificationAny.olx_max_pages) > 1) {
      extraNotes.push(`OLX com ${classificationAny.olx_max_pages} páginas vai consumir créditos extras.`);
    }
    if (classificationAny?.webmotors_seller_data_addon) {
      extraNotes.push('Webmotors vai tentar coletar CNPJ e telefone do vendedor, o que pode consumir créditos extras.');
    }
    if (classificationAny?.webmotors_max_requests && Number(classificationAny.webmotors_max_requests) > 10) {
      extraNotes.push(`Webmotors com ${classificationAny.webmotors_max_requests} requests terá cobertura maior e pode consumir mais créditos.`);
    }
    if (classificationAny?.ml_scrape_ofertas) {
      extraNotes.push('Mercado Livre será executado em modo ofertas do dia.');
    }
    const estimatedCredits = estimateCreditsForConfirmation(cl);
    if (estimatedCredits) {
      extraNotes.unshift(`Esta busca deve consumir cerca de ${estimatedCredits} crédito${estimatedCredits > 1 ? 's' : ''}.`);
    }
    setSearchSession(s => ({ ...s, step: 'confirm', sortBy }));
    const confirmMsg: Message = {
      id: crypto.randomUUID(),
      type: 'query_confirm',
      content: finalQueryText,
      timestamp: new Date(),
      queryConfirmSortBy: sortBy,
      queryConfirmCreditEstimate: estimatedCredits,
      queryConfirmNotes: extraNotes,
    };
    setMessages(prev => [...prev, confirmMsg]);
  };

  const handleQueryConfirm = async (finalQuery: string, sortBy: string) => {
    // #6: guard contra duplo clique
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setMessages(prev => prev.filter(m => m.type !== 'query_confirm'));
    const { classification } = searchSessionRef.current;
    // #3: quando usuário edita, limpar filtros derivados para não conflitar com o texto editado
    const updatedClassification = { ...classification, search_query: finalQuery };
    // #7: atualizar query no session para expansões futuras usarem o texto correto
    setSearchSession(s => ({ ...s, query: finalQuery, classification: updatedClassification, step: 'idle', sortBy }));
    setLoading(true);
    await executeTextSearch(finalQuery, sortBy, updatedClassification);
    isProcessingRef.current = false;
  };

  const askSortThenSearch = (query: string, classification: ClassificationData) => {
    // #1: resetar awaitingImageSort ao entrar no fluxo de texto
    setAwaitingImageSort(false);
    const sortMsg: Message = {
      id: crypto.randomUUID(),
      type: 'sort_question',
      content: 'Como deseja ordenar os resultados?',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, sortMsg]);
    setSearchSession(s => ({ ...s, query, classification, step: 'sort' }));
  };

  const executeTextSearch = async (
    query: string,
    sortBy: string = 'BEST_MATCH',
    classification?: ClassificationData,
    isExpansion = false,
    replaceMsgId?: string,
  ) => {
    // Não aplicar contextManager quando a classification já tem search_query enriquecida
    // (hybrid mode já acumulou query + respostas — contextManager pode corromper)
    const effectiveQuery = classification?.search_query || query;
    const searchingMsgId = crypto.randomUUID();
    setMessages(prev => prev.filter(m => m.id !== replaceMsgId));
    setMessages(prev => [...prev, { id: searchingMsgId, type: 'ai' as const, content: 'searching_animation', timestamp: new Date() }]);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

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
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.status === 401) {
        localStorage.removeItem('zavlo_user');
        router.push('/auth');
        return;
      }

      if (response.status === 403) {
        const errData: ApiErrorResponse = await response.json().catch(() => ({} as ApiErrorResponse));
        const isFreeLimit = errData?.error === 'FREE_LIMIT_EXCEEDED' || errData?.message?.includes('gratuita');
        addMessage('ai', isFreeLimit
          ? '🔒 Você já usou sua busca gratuita. Faça login ou assine um plano para continuar buscando!'
          : 'Acesso negado. Verifique seu plano.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({} as ApiErrorResponse & { currentCredits?: number; requiredCredits?: number }));
        if (errData?.error === 'INSUFFICIENT_CREDITS') {
          addMessage(
            'ai',
            `💳 Créditos insuficientes! Você tem ${errData.currentCredits ?? 0} e precisa de ${errData.requiredCredits ?? 1} para esta busca.`
          );
          setLoading(false);
          return;
        }
        addMessage('ai', errData?.message || 'Erro na busca. Tente novamente.');
        setLoading(false);
        return;
      }

      if (response.ok) {
        const data: SearchTextResponse = await response.json();
        const products = data.results || [];

        setMessages(prev => prev.filter(m => m.id !== searchingMsgId));

        if (data.error === 'INSUFFICIENT_CREDITS') {
          setUserCredits(0);
          userCreditsRef.current = 0;
          addMessage('ai', '💳 Créditos insuficientes! Adquira mais créditos para continuar buscando.');
          setLoading(false);
          return;
        }

        if (typeof data.remainingCredits === 'number') {
          updateCredits(data.remainingCredits, userData);
        }
        
        const creditsUsed = data.creditsUsed ?? 0;
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

        if (cl?.prefer_price_drop === true) {
          const downtrendCount = products.filter((product: any) => {
            const trend = product?.priceTrend;
            return trend?.status === 'down' && Number(trend?.dropPercent || 0) >= 10;
          }).length;

          if (downtrendCount > 0) {
            contextParts.push(`📉 Priorizando ofertas em queda nos últimos 30 dias (${downtrendCount} com tendência de baixa)`);
          } else {
            contextParts.push('📉 Priorização por queda está ativa, mas não houve histórico suficiente para destacar ofertas nesta busca');
          }
        }

        if (contextParts.length > 0) {
          addMessage('ai', contextParts.join('\n') + '.');
        }

        const productsMessage: Message = {
            id: crypto.randomUUID(),
            type: 'products',
            content: `✅ Encontrei ${products.length} ${products.length === 1 ? 'resultado' : 'resultados'}!\n\n💳 Créditos: ${creditsUsed > 0 ? `-${creditsUsed}` : '0 (cache)'} | Restantes: ${remainingCredits}`,
            products: products,
            timestamp: new Date(),
            priceRangeApplied: data.priceRangeApplied,
          };
          setMessages(prev => {
            const nextMessages = [...prev, productsMessage];
            const allProducts = collectProductsFromMessages(nextMessages);
            const bestProduct = getBestPricedProduct(allProducts);

            if (!bestProduct) return nextMessages;

            const isNewBest = bestPriceRef.current === null || bestProduct.price < bestPriceRef.current;
            if (!isNewBest) return nextMessages;

            bestPriceRef.current = bestProduct.price;
            const bestSummary: Message = {
              id: crypto.randomUUID(),
              type: 'ai',
              content: '🏆 O melhor preço que conseguimos para o seu produto foi esse:',
              timestamp: new Date(),
            };
            const bestProductMessage: Message = {
              id: crypto.randomUUID(),
              type: 'products',
              content: 'Melhor oferta até agora',
              products: [bestProduct],
              timestamp: new Date(),
            };
            return [...nextMessages, bestSummary, bestProductMessage];
          });
          // #5: atualizar contexto com effectiveQuery (enriquecida) não query original
          contextManager.update({ lastResults: toContextResults(products), lastProduct: effectiveQuery });

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
          } else {
            // #4: resetar step e limpar expansionSources quando não há expansão
            setSearchSession(s => ({ ...s, step: 'idle', expansionSources: [] }));
          }

          setLoading(false);
      }
    } catch (error: unknown) {
      clearTimeout(timeout);
      setMessages(prev => prev.filter(m => m.id !== searchingMsgId));
      // #8: limpar expansionSources em caso de erro
      setSearchSession(s => ({ ...s, step: 'idle', expansionSources: [] }));
      const msg = isAbortError(error)
        ? '⏱️ A busca demorou demais. Tente novamente.'
        : 'Erro ao processar busca. Tente novamente.';
      addMessage('ai', msg);
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

  const handleQuickSuggestion = (text: string) => {
    if (text === '__quick_start__') {
      addMessage('ai', 'Perfeito! ✨\n\nDigite o produto que você deseja encontrar (ex: iPhone 15 Pro, Honda Civic 2020, tênis Nike Air).\n\nAssim que você enviar, eu inicio o classificador para refinar sua busca.');
      setInputReadyCue(true);
      setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }

    setInput(text);
    setTimeout(() => handleSend(text), 0);
  };

  const setCredits = (n: number, userData?: UserSession) => {
    setUserCredits(n);
    userCreditsRef.current = n;
    if (userData) {
      const updatedUser = { ...userData, credits: n };
      localStorage.setItem('zavlo_user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userChanged'));
    }
  };

  const updateCredits = (newCredits: number, userData: UserSession) => setCredits(newCredits, userData);
  const showQuickSuggestions = messages.length === 1 && messages[0]?.id === INTRO_MESSAGE_ID && !loading;

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#0A0A12]" style={{ background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.08) 0%, transparent 55%), #0A0A12' }}>
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

      <div className="flex flex-1 flex-col overflow-hidden md:m-3 md:rounded-2xl md:border md:border-white/[0.06] md:bg-[#0D0D14]/70 md:shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <ChatHeader
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          userCredits={userCredits}
          onClearChat={createNewChat}
        />

        {showQuickSuggestions ? (
          <QuickSuggestions
            onSuggestionClick={handleQuickSuggestion}
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
            onExecuteTextSort={executeTextSort}
            onQueryConfirm={handleQueryConfirm}
            messagesEndRef={messagesEndRef}
          />
        )}

        <ChatInput
          input={input}
          onInputChange={(value) => {
            setInput(value);
            if (value.trim().length > 0 && inputReadyCue) setInputReadyCue(false);
          }}
          onSend={() => {
            setInputReadyCue(false);
            handleSend();
          }}
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
          inputReadyCue={inputReadyCue}
        />
      </div>

    </div>
  );
}
