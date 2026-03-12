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

export interface Message {
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

export interface HandlerContext {
  currentInput: string;
  pendingSearch: any;
  setPendingSearch: (updater: (prev: any) => any) => void;
  setChatState: (state: string) => void;
  setLoading: (loading: boolean) => void;
  addMessages: (messages: Message[]) => void;
}

export type StateHandler = (ctx: HandlerContext) => boolean;

/**
 * Handler para estado de ordenação
 */
export function handleSortState(ctx: HandlerContext): boolean {
  const { currentInput, setPendingSearch, setChatState, setLoading, addMessages } = ctx;
  
  const selectedSort = parseSortInput(currentInput);
  
  if (selectedSort) {
    setPendingSearch(prev => {
      if (!prev) return prev;
      return { ...prev, sortBy: selectedSort };
    });
    
    setChatState('awaiting_limit');
    
    // ✅ CORREÇÃO: Adicionar ambas mensagens de uma vez (evita race condition)
    addMessages([
      {
        id: crypto.randomUUID(),
        type: 'ai',
        content: `✅ Perfeito! Vou ordenar por ${SORT_LABELS[selectedSort]}.`,
        timestamp: new Date(),
      },
      {
        id: crypto.randomUUID(),
        type: 'category_question',
        content: 'Quantos produtos você quer ver?',
        timestamp: new Date(),
        categoryQuestion: {
          id: 'limit',
          options: ['10 produtos', '20 produtos', '50 produtos', '100 produtos'],
          category: 'limit'
        }
      }
    ]);
    
    setLoading(false);
    return true;
  }
  
  // Erro: opção inválida
  addMessages([{
    id: crypto.randomUUID(),
    type: 'ai',
    content: getErrorMessage('awaiting_sort'),
    timestamp: new Date(),
  }]);
  
  setLoading(false);
  return true;
}

/**
 * Handler para estado de quantidade
 */
export function handleLimitState(ctx: HandlerContext): boolean {
  const { currentInput, setPendingSearch, setChatState, setLoading, addMessages } = ctx;
  
  const selectedLimit = parseLimitInput(currentInput);
  
  if (selectedLimit) {
    setPendingSearch(prev => {
      if (!prev) return prev;
      return { ...prev, limit: selectedLimit };
    });
    
    setChatState('awaiting_price_range');
    
    // ✅ CORREÇÃO: Adicionar ambas mensagens de uma vez
    addMessages([
      {
        id: crypto.randomUUID(),
        type: 'ai',
        content: `✅ Certo! Vou buscar ${selectedLimit} produtos.`,
        timestamp: new Date(),
      },
      {
        id: crypto.randomUUID(),
        type: 'category_question',
        content: 'Qual faixa de preço você prefere?',
        timestamp: new Date(),
        categoryQuestion: {
          id: 'price_range',
          options: [
            'Até R$100',
            'R$100 - R$500',
            'R$500 - R$1000',
            'Acima de R$1000',
            'Sem filtro de preço'
          ],
          category: 'price'
        }
      }
    ]);
    
    setLoading(false);
    return true;
  }
  
  // Erro: opção inválida
  addMessages([{
    id: crypto.randomUUID(),
    type: 'ai',
    content: getErrorMessage('awaiting_limit'),
    timestamp: new Date(),
  }]);
  
  setLoading(false);
  return true;
}

/**
 * Handler para estado de faixa de preço
 */
export function handlePriceRangeState(ctx: HandlerContext): boolean {
  const { currentInput, setPendingSearch, setChatState, setLoading, addMessages } = ctx;
  
  const selectedRange = parsePriceRangeInput(currentInput);
  
  if (selectedRange) {
    setPendingSearch(prev => {
      if (!prev) return prev;
      return { 
        ...prev, 
        minPrice: selectedRange.min,
        maxPrice: selectedRange.max
      };
    });
    
    setChatState('awaiting_condition');
    
    // ✅ CORREÇÃO: Adicionar ambas mensagens de uma vez
    addMessages([
      {
        id: crypto.randomUUID(),
        type: 'ai',
        content: `✅ Entendido! Filtro: ${selectedRange.label}`,
        timestamp: new Date(),
      },
      {
        id: crypto.randomUUID(),
        type: 'ai',
        content: 'Produto novo ou usado?',
        timestamp: new Date(),
      }
    ]);
    
    setLoading(false);
    return true;
  }
  
  // Erro: opção inválida
  addMessages([{
    id: crypto.randomUUID(),
    type: 'ai',
    content: getErrorMessage('awaiting_price_range'),
    timestamp: new Date(),
  }]);
  
  setLoading(false);
  return true;
}

/**
 * Mapa de handlers por estado
 * ✅ ARQUITETURA PROFISSIONAL: Evita múltiplos if/else
 */
export const STATE_HANDLERS: Record<string, StateHandler> = {
  'awaiting_sort': handleSortState,
  'awaiting_limit': handleLimitState,
  'awaiting_price_range': handlePriceRangeState
};

/**
 * Executa handler baseado no estado atual
 * Retorna true se o handler foi executado, false caso contrário
 */
export function executeStateHandler(
  chatState: string,
  ctx: HandlerContext
): boolean {
  const handler = STATE_HANDLERS[chatState];
  
  if (handler) {
    return handler(ctx);
  }
  
  return false;
}
