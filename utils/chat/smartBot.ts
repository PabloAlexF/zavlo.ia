// Sistema de Inteligência Avançada do Bot
import { detectIntent } from './intentDetector';
import { parseProductQuery } from './productParser';

// Sinônimos e variações de produtos
const PRODUCT_SYNONYMS: Record<string, string[]> = {
  'celular': ['smartphone', 'telefone', 'fone', 'mobile', 'aparelho'],
  'notebook': ['laptop', 'computador portatil', 'note'],
  'tenis': ['tênis', 'tenis', 'sapato esportivo', 'calçado esportivo'],
  'tv': ['televisão', 'televisao', 'smart tv', 'televisor'],
  'geladeira': ['refrigerador', 'frigobar', 'freezer'],
  'fogao': ['fogão', 'cooktop'],
  'carro': ['veiculo', 'veículo', 'auto', 'automóvel', 'automovel'],
  'moto': ['motocicleta', 'motoca', 'bike'],
  'bicicleta': ['bike', 'magrela'],
  'relogio': ['relógio', 'smartwatch'],
  'fone': ['fone de ouvido', 'headphone', 'earphone', 'airpods'],
};

// Correções comuns de digitação
const COMMON_TYPOS: Record<string, string> = {
  'iphone': 'iPhone',
  'ipad': 'iPad',
  'macbook': 'MacBook',
  'playstation': 'PlayStation',
  'xbox': 'Xbox',
  'samsung': 'Samsung',
  'xiaomi': 'Xiaomi',
  'motorola': 'Motorola',
  'lg': 'LG',
  'dell': 'Dell',
  'lenovo': 'Lenovo',
  'asus': 'Asus',
  'acer': 'Acer',
  'hp': 'HP',
  'nike': 'Nike',
  'adidas': 'Adidas',
};

// Contextos de conversa
interface ConversationContext {
  lastProduct?: string;
  lastBrand?: string;
  lastCategory?: string;
  userPreferences: {
    priceRange?: { min: number; max: number };
    preferredBrands: string[];
    searchHistory: string[];
  };
}

let conversationContext: ConversationContext = {
  userPreferences: {
    preferredBrands: [],
    searchHistory: [],
  },
};

// Detecta se usuário está refinando busca anterior
export function detectRefinement(currentQuery: string): {
  isRefinement: boolean;
  refinedQuery?: string;
  type?: 'add_detail' | 'change_attribute' | 'price_filter';
} {
  const lower = currentQuery.toLowerCase();
  
  // Padrões de refinamento
  const addDetailPatterns = [
    /^(com|que tenha|que seja|de) /i,
    /^(preto|branco|azul|vermelho|verde|amarelo|rosa|roxo)/i,
    /^(\d+gb|\d+tb|\d+mb)/i,
  ];
  
  const priceFilterPatterns = [
    /^(ate|até|menos de|abaixo de|max|maximo|máximo) /i,
    /^(mais barato|mais caro|economico|econômico)/i,
  ];
  
  // Verifica se é refinamento
  for (const pattern of addDetailPatterns) {
    if (pattern.test(lower) && conversationContext.lastProduct) {
      return {
        isRefinement: true,
        refinedQuery: `${conversationContext.lastProduct} ${currentQuery}`,
        type: 'add_detail',
      };
    }
  }
  
  for (const pattern of priceFilterPatterns) {
    if (pattern.test(lower) && conversationContext.lastProduct) {
      return {
        isRefinement: true,
        refinedQuery: `${conversationContext.lastProduct} ${currentQuery}`,
        type: 'price_filter',
      };
    }
  }
  
  return { isRefinement: false };
}

// Expande query com sinônimos
export function expandQueryWithSynonyms(query: string): string {
  let expanded = query;
  
  for (const [key, synonyms] of Object.entries(PRODUCT_SYNONYMS)) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    if (regex.test(expanded)) {
      // Mantém o termo original, mas adiciona contexto
      break;
    }
  }
  
  return expanded;
}

// Corrige erros comuns
export function correctCommonTypos(query: string): string {
  let corrected = query;
  
  for (const [typo, correct] of Object.entries(COMMON_TYPOS)) {
    const regex = new RegExp(`\\b${typo}\\b`, 'gi');
    corrected = corrected.replace(regex, correct);
  }
  
  return corrected;
}

// Gera resposta inteligente baseada no contexto
export function generateSmartResponse(query: string, intent: any): {
  shouldRespond: boolean;
  response?: string;
  action?: 'search' | 'clarify' | 'suggest';
} {
  const lower = query.toLowerCase().trim();
  
  // Detecta comparações
  if (/\\b(ou|vs|versus|melhor|diferença|comparar)\\b/i.test(lower)) {
    return {
      shouldRespond: true,
      response: '🔍 Entendi que você quer comparar produtos!\\n\\nVou buscar ambos para você. Digite o primeiro produto que deseja comparar.',
      action: 'clarify',
    };
  }
  
  // Detecta dúvidas sobre especificações
  if (/\\b(qual|quanto|como|especificação|ficha técnica)\\b/i.test(lower)) {
    const parsed = parseProductQuery(query);
    if (parsed.product) {
      return {
        shouldRespond: true,
        response: `📋 Vou buscar ${parsed.product} para você ver todas as especificações e comparar preços!\\n\\nDigite mais detalhes se quiser refinar (marca, modelo, cor, etc).`,
        action: 'suggest',
      };
    }
  }
  
  // Detecta pedidos de recomendação
  if (/\\b(recomenda|indica|sugere|melhor|bom|vale a pena)\\b/i.test(lower)) {
    return {
      shouldRespond: true,
      response: '💡 Posso te ajudar a encontrar as melhores opções!\\n\\nMe diga:\\n• Que tipo de produto você procura?\\n• Qual sua faixa de preço?\\n• Alguma marca de preferência?',
      action: 'clarify',
    };
  }
  
  // Detecta expressões de insatisfação
  if (/\\b(não|nao|errado|outro|diferente)\\b/i.test(lower) && conversationContext.lastProduct) {
    return {
      shouldRespond: true,
      response: '🔄 Entendi! Vamos tentar de novo.\\n\\nPode descrever melhor o que você procura? Quanto mais detalhes, melhor!',
      action: 'clarify',
    };
  }
  
  return { shouldRespond: false };
}

// Atualiza contexto da conversa
export function updateConversationContext(query: string, parsed: any) {
  if (parsed.product) {
    conversationContext.lastProduct = parsed.product;
    conversationContext.lastCategory = parsed.product;
    
    // Adiciona ao histórico
    if (!conversationContext.userPreferences.searchHistory.includes(query)) {
      conversationContext.userPreferences.searchHistory.push(query);
      // Mantém apenas últimas 10 buscas
      if (conversationContext.userPreferences.searchHistory.length > 10) {
        conversationContext.userPreferences.searchHistory.shift();
      }
    }
  }
  
  if (parsed.brand) {
    conversationContext.lastBrand = parsed.brand;
    
    // Adiciona às marcas preferidas se aparecer mais de uma vez
    const brandCount = conversationContext.userPreferences.searchHistory.filter(
      h => h.toLowerCase().includes(parsed.brand.toLowerCase())
    ).length;
    
    if (brandCount > 1 && !conversationContext.userPreferences.preferredBrands.includes(parsed.brand)) {
      conversationContext.userPreferences.preferredBrands.push(parsed.brand);
    }
  }
}

// Gera sugestões personalizadas
export function generatePersonalizedSuggestions(): string[] {
  const suggestions: string[] = [];
  
  // Baseado em marcas preferidas
  if (conversationContext.userPreferences.preferredBrands.length > 0) {
    const brand = conversationContext.userPreferences.preferredBrands[0];
    suggestions.push(`${brand} mais recente`);
  }
  
  // Baseado em histórico
  if (conversationContext.lastCategory) {
    suggestions.push(`${conversationContext.lastCategory} em promoção`);
    suggestions.push(`${conversationContext.lastCategory} usado`);
  }
  
  return suggestions;
}

// Detecta intenção de negociação
export function detectNegotiationIntent(query: string): {
  isNegotiation: boolean;
  type?: 'price_check' | 'discount' | 'payment';
} {
  const lower = query.toLowerCase();
  
  if (/\\b(desconto|promoção|oferta|barato|pechincha)\\b/i.test(lower)) {
    return { isNegotiation: true, type: 'discount' };
  }
  
  if (/\\b(parcelado|parcela|cartão|pix|boleto|pagamento)\\b/i.test(lower)) {
    return { isNegotiation: true, type: 'payment' };
  }
  
  if (/\\b(quanto custa|preço|valor|ta quanto|tá quanto)\\b/i.test(lower)) {
    return { isNegotiation: true, type: 'price_check' };
  }
  
  return { isNegotiation: false };
}

// Limpa contexto
export function clearConversationContext() {
  conversationContext = {
    userPreferences: {
      preferredBrands: [],
      searchHistory: [],
    },
  };
}

// Exporta contexto para debug
export function getConversationContext() {
  return conversationContext;
}
