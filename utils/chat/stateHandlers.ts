// ============================================
// STATE MACHINE - HANDLERS PROFISSIONAIS
// ============================================
// Arquivo: utils/chat/stateHandlers.ts

import { 
  parseSortInput, 
  parseLimitInput, 
  parsePriceRangeInput,
  SORT_LABELS,
  getErrorMessage 
} from './chatHelpers';
import { getCreditWarning, normalizeResultsTier, VALID_RESULTS_TIERS } from './creditCalculator';

// ✅ Tipagem forte para estados
export enum ChatState {
  AwaitingSort = 'awaiting_sort',
  AwaitingLimit = 'awaiting_limit',
  AwaitingPriceRange = 'awaiting_price_range',
  AwaitingCondition = 'awaiting_condition',
  AwaitingCreditConfirmation = 'awaiting_credit_confirmation',
  AwaitingFinalConfirmation = 'awaiting_confirmation'
}

// ✅ Tipagem forte para PendingSearch
export interface PendingSearch {
  query?: string;
  sortBy?: 'RELEVANCE' | 'LOWEST_PRICE' | 'HIGHEST_PRICE';
  limit?: number;
  confirmedLimit?: number; // Confirmed after credit check
  creditWarning?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: 'new' | 'used' | 'both';
  location?: string;
  category?: string;
}

// ✅ Union types para mensagens (evita God Object)
interface BaseMessage {
  id: string;
  timestamp: Date;
}

export interface UserMessage extends BaseMessage {
  type: 'user';
  content: string;
}

export interface AIMessage extends BaseMessage {
  type: 'ai';
  content: string;
}

export interface ProductsMessage extends BaseMessage {
  type: 'products';
  content: string;
  products: any[];
}

export interface ConfirmationMessage extends BaseMessage {
  type: 'confirmation';
  content: string;
  searchType: 'text' | 'image';
  creditCost: number;
}

export interface CategoryQuestionMessage extends BaseMessage {
  type: 'category_question';
  content: string;
  categoryQuestion: {
    id: string;
    options: string[];
    category: string;
  };
}

export interface ImageConfirmationMessage extends BaseMessage {
  type: 'image_confirmation';
  content: string;
  imageData: string;
  detectedProduct: string;
}

export type Message = 
  | UserMessage 
  | AIMessage 
  | ProductsMessage 
  | ConfirmationMessage 
  | CategoryQuestionMessage 
  | ImageConfirmationMessage;

// ✅ Resultado declarativo do handler
export interface HandlerResult {
  nextState?: ChatState;
  pendingSearchUpdate?: Partial<PendingSearch>;
  messages: Message[];
}

export interface HandlerContext {
  currentInput: string;
  pendingSearch: PendingSearch | null;
  setPendingSearch: (updater: (prev: PendingSearch | null) => PendingSearch | null) => void;
  setChatState: (state: ChatState | string) => void;
  setLoading: (loading: boolean) => void;
  addMessages: (messages: Message[]) => void;
}

export type StateHandler = (ctx: HandlerContext) => boolean;

// ✅ Factory functions para mensagens (type-safe)
function createAIMessage(content: string): AIMessage {
  return {
    id: crypto.randomUUID(),
    type: 'ai',
    content,
    timestamp: new Date()
  };
}

function createCategoryQuestionMessage(
  content: string,
  categoryQuestion: CategoryQuestionMessage['categoryQuestion']
): CategoryQuestionMessage {
  return {
    id: crypto.randomUUID(),
    type: 'category_question',
    content,
    categoryQuestion,
    timestamp: new Date()
  };
}

// ✅ Handler retorna resultado declarativo (sem side effects)
export type DeclarativeStateHandler = (ctx: HandlerContext) => HandlerResult | null;

/**
 * Aplica resultado do handler (executor)
 */
export function applyHandlerResult(ctx: HandlerContext, result: HandlerResult): void {
  // 1. Atualiza pending search
  if (result.pendingSearchUpdate) {
    ctx.setPendingSearch(prev => {
      if (!prev) return prev;
      return { ...prev, ...result.pendingSearchUpdate };
    });
  }

  // 2. Transição de estado
  if (result.nextState) {
    ctx.setChatState(result.nextState);
  }

  // 3. Adiciona mensagens
  if (result.messages.length > 0) {
    ctx.addMessages(result.messages);
  }

  // 4. Finaliza loading
  ctx.setLoading(false);
}

/**
 * Handler para estado de ordenação (declarativo)
 */
export function handleSortState(ctx: HandlerContext): HandlerResult | null {
  const { currentInput } = ctx;
  
  const selectedSort = parseSortInput(currentInput);
  
  if (selectedSort) {
    return {
      nextState: ChatState.AwaitingLimit,
      pendingSearchUpdate: { sortBy: selectedSort },
      messages: [
        createAIMessage(`✅ Perfeito! Vou ordenar por ${SORT_LABELS[selectedSort]}.`),
        createCategoryQuestionMessage('Quantos produtos você quer ver?', {
          id: 'limit',
          options: ['10 produtos', '20 produtos', '50 produtos', '100 produtos'],
          category: 'limit'
        })
      ]
    };
  }
  
  // Erro: retorna mensagem sem mudar estado
  return {
    messages: [createAIMessage(getErrorMessage('awaiting_sort'))]
  };
}

/**
 * Handler para estado de quantidade (declarativo)
 */
export function handleLimitState(ctx: HandlerContext): HandlerResult | null {
  const { currentInput } = ctx;
  
  const selectedLimit = parseLimitInput(currentInput);
  
  if (selectedLimit) {
    return {
      nextState: ChatState.AwaitingPriceRange,
      pendingSearchUpdate: { limit: selectedLimit },
      messages: [
        createAIMessage(`✅ Certo! Vou buscar ${selectedLimit} produtos.`),
        createCategoryQuestionMessage('Qual faixa de preço você prefere?', {
          id: 'price_range',
          options: [
            'Até R$100',
            'R$100 - R$500',
            'R$500 - R$1000',
            'Acima de R$1000',
            'Sem filtro de preço'
          ],
          category: 'price'
        })
      ]
    };
  }
  
  return {
    messages: [createAIMessage(getErrorMessage('awaiting_limit'))]
  };
}

/**
 * Handler para estado de faixa de preço (declarativo)
 */
export function handlePriceRangeState(ctx: HandlerContext): HandlerResult | null {
  const { currentInput } = ctx;
  
  const selectedRange = parsePriceRangeInput(currentInput);
  
  if (selectedRange) {
    return {
      nextState: ChatState.AwaitingCondition,
      pendingSearchUpdate: { 
        minPrice: selectedRange.min,
        maxPrice: selectedRange.max
      },
      messages: [
        createAIMessage(`✅ Entendido! Filtro: ${selectedRange.label}`),
        createAIMessage('Produto novo ou usado?')
      ]
    };
  }
  
  return {
    messages: [createAIMessage(getErrorMessage('awaiting_price_range'))]
  };
}

/**
 * Handler global para input não reconhecido
 */
export function handleUnknownInput(ctx: HandlerContext): HandlerResult {
  return {
    messages: [
      createAIMessage('❓ Desculpe, não entendi. Pode reformular?')
    ]
  };
}

/**
 * ✅ State Machine: Define transições válidas (com suporte a múltiplas transições)
 */
export const CHAT_MACHINE: Record<ChatState, { 
  next: ChatState | ChatState[]; 
  previous?: ChatState;
  isFinal?: boolean;
}> = {
  [ChatState.AwaitingSort]: { 
    next: ChatState.AwaitingLimit 
  },
  [ChatState.AwaitingLimit]: { 
    next: ChatState.AwaitingPriceRange,
    previous: ChatState.AwaitingSort
  },
  [ChatState.AwaitingPriceRange]: { 
    next: [ChatState.AwaitingCondition, ChatState.AwaitingLimit], // Pode voltar
    previous: ChatState.AwaitingLimit
  },
  [ChatState.AwaitingCondition]: { 
    next: [ChatState.AwaitingConfirmation, ChatState.AwaitingPriceRange], // Pode voltar
    previous: ChatState.AwaitingPriceRange
  },
  [ChatState.AwaitingConfirmation]: { 
    next: ChatState.AwaitingConfirmation,
    isFinal: true
  }
};

/**
 * Mapa de handlers por estado
 * ✅ ARQUITETURA PROFISSIONAL: Handlers declarativos
 */
export const STATE_HANDLERS: Partial<Record<ChatState, DeclarativeStateHandler>> = {
  [ChatState.AwaitingSort]: handleSortState,
  [ChatState.AwaitingLimit]: handleLimitState,
  [ChatState.AwaitingPriceRange]: handlePriceRangeState,
  [ChatState.AwaitingCreditConfirmation]: handleCreditConfirmationState
};

/**
 * Valida se transição de estado é válida (suporta múltiplas transições)
 */
export function isValidTransition(from: ChatState, to: ChatState): boolean {
  const machine = CHAT_MACHINE[from];
  if (!machine) return false;
  
  const { next } = machine;
  
  if (Array.isArray(next)) {
    return next.includes(to);
  }
  
  return next === to;
}

/**
 * Executa handler baseado no estado atual (declarativo)
 * Retorna HandlerResult ou null se não houver handler
 */
export function executeStateHandler(
  chatState: ChatState,
  ctx: HandlerContext
): HandlerResult | null {
  const handler = STATE_HANDLERS[chatState];
  
  if (handler) {
    const result = handler(ctx);
    
    if (result) {
      applyHandlerResult(ctx, result);
      return result;
    }
  }
  
  // Fallback: input não reconhecido
  const fallback = handleUnknownInput(ctx);
  applyHandlerResult(ctx, fallback);
  return fallback;
}
