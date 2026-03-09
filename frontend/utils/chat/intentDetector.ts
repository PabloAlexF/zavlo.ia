// Detector de intenção do usuário
export interface UserIntent {
  type: 'buy' | 'sell' | 'search' | 'greeting' | 'despedida' | 'question' | 'help' | 'credits_question' | 'plans_question' | 'platform_question' | 'other';
  confidence: number;
  extractedPrice?: number;
}

// Patterns de intenção
const INTENT_PATTERNS = {
  greeting: /\b(oi|ola|olá|bom dia|boa tarde|boa noite|hey|hello|opa|e ai|eai)\b/i,
  despedida: /\b(tchau|adeus|até logo|até mais|falou|flw|bye|até)\b/i,
  help: /\b(ajuda|help|socorro|como usar|como funciona|tutorial|comandos)\b/i,
  credits_question: /\b(meus? créditos?|saldo|quanto tenho|creditos|quantos creditos)\b/i,
  plans_question: /\b(planos?|assinaturas?|preços?|valores?|quanto custa|pacotes?)\b/i,
  platform_question: /\b(o que é|quem é|sobre|zavlo|plataforma|site|app)\b/i,
  buy: /\b(quero|procuro|busco|preciso|comprar|comprando)\b/i,
  sell: /\b(vendo|vendendo|vender|anuncio)\b/i,
  question: /\b(como|quando|onde|porque|qual|quanto|que)\b/i
};

// Extrai preço da query
const PRICE_PATTERNS = [
  /(ate|até|menos de|max|maximo|máximo)?\s*r?\$?\s*(\d+(?:\.\d+)?k?)/i,
  /(\d+(?:\.\d+)?k?)\s*(reais?|real|r\$)/i
];

// Alias para compatibilidade
export const detectIntent = detectUserIntent;

export function detectUserIntent(query: string): UserIntent {
  const normalized = query.toLowerCase().trim();
  
  // Detecta comandos específicos PRIMEIRO (ordem importa!)
  if (INTENT_PATTERNS.help.test(normalized)) {
    return { type: 'help', confidence: 0.95 };
  }
  
  if (INTENT_PATTERNS.credits_question.test(normalized)) {
    return { type: 'credits_question', confidence: 0.95 };
  }
  
  if (INTENT_PATTERNS.plans_question.test(normalized)) {
    return { type: 'plans_question', confidence: 0.95 };
  }
  
  if (INTENT_PATTERNS.platform_question.test(normalized)) {
    return { type: 'platform_question', confidence: 0.95 };
  }
  
  if (INTENT_PATTERNS.greeting.test(normalized)) {
    return { type: 'greeting', confidence: 0.9 };
  }
  
  if (INTENT_PATTERNS.despedida.test(normalized)) {
    return { type: 'despedida', confidence: 0.9 };
  }
  
  // Detecta intenção de compra/venda
  if (INTENT_PATTERNS.buy.test(normalized)) {
    return { type: 'buy', confidence: 0.8, extractedPrice: extractPrice(query) };
  }
  
  if (INTENT_PATTERNS.sell.test(normalized)) {
    return { type: 'sell', confidence: 0.8 };
  }
  
  if (INTENT_PATTERNS.question.test(normalized)) {
    return { type: 'question', confidence: 0.7 };
  }
  
  // Default: busca
  return {
    type: 'search',
    confidence: 0.6,
    extractedPrice: extractPrice(query)
  };
}

function extractPrice(query: string): number | undefined {
  for (const pattern of PRICE_PATTERNS) {
    const match = query.match(pattern);
    if (match) {
      const priceStr = match[2] || match[1];
      let price = parseFloat(priceStr.replace(/[^\d.]/g, ''));
      
      // Converte 'k' para milhares
      if (priceStr.toLowerCase().includes('k')) {
        price *= 1000;
      }
      
      return price;
    }
  }
  return undefined;
}