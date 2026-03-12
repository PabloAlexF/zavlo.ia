// ✅ Interface de entidades (melhor manutenção)
export interface Entities {
  price?: number;
  product?: string;
  userName?: string;
  location?: string;
}

// Detector de intenção do usuário com sistema de pontuação
export interface UserIntent {
  type: 'buy' | 'sell' | 'search' | 'greeting' | 'despedida' | 'question' | 'help' | 'credits_question' | 'plans_question' | 'platform_question' | 'introduction' | 'casual_talk' | 'negotiation' | 'offer' | 'other';
  confidence: number;
  entities?: Entities;
  // Deprecated - mantido para compatibilidade
  extractedPrice?: number;
  userName?: string;
}

// Alias para compatibilidade
export type Intent = UserIntent;

interface IntentScore {
  type: UserIntent['type'];
  score: number;
  entities?: Entities;
}

// Patterns de intenção com pesos
const INTENT_PATTERNS = {
  // Comandos específicos (alta prioridade)
  help: { pattern: /\b(ajuda|help|socorro|como usar|como funciona|tutorial|comandos)\b/i, weight: 1.0 },
  credits_question: { pattern: /\b(meus? créditos?|saldo|quanto tenho|creditos|quantos creditos)\b/i, weight: 1.0 },
  plans_question: { pattern: /\b(planos?|assinaturas?|preços?|valores?|quanto custa|pacotes?)\b/i, weight: 1.0 },
  platform_question: { pattern: /\b(o que é|quem é|sobre|zavlo|plataforma|site|app)\b/i, weight: 1.0 },
  
  // Apresentação
  introduction: { pattern: /\b(meu nome é|me chamo|sou o|sou a|pode me chamar de|eu sou)\b/i, weight: 1.0 },
  
  // Negociação (marketplace) - ✅ Expandido com casos reais
  negotiation: { pattern: /\b(faz por|aceita|desconto|melhor preco|ultimo preco|quanto faz|tem desconto|faz desconto|menor preco|ultimo valor|da pra baixar|negocia|melhora o preco|pode fazer|quanto fica)\b/i, weight: 0.95 },
  
  // ✅ Nova: Oferta (marketplace)
  offer: { pattern: /\b(faco|faço|pago|dou|ofereço|ofereco)\s+\d+/i, weight: 0.9 },
  
  // Intenções principais
  buy: { pattern: /\b(quero|procuro|busco|preciso|comprar|comprando|querendo|buscando|procurando)\b/i, weight: 0.9 },
  sell: { pattern: /\b(vendo|vendendo|vender|anuncio|anúncio|anunciar)\b/i, weight: 0.9 },
  
  // Conversação
  greeting: { pattern: /^(oi|ola|olá|bom dia|boa tarde|boa noite|hey|hello|opa|e ai|eai)\b/i, weight: 0.7 },
  casual_talk: { pattern: /\b(tudo bem|como vai|beleza|tranquilo|legal|show|massa|top)\b/i, weight: 0.6 },
  despedida: { pattern: /\b(tchau|adeus|até logo|até mais|falou|flw|bye|até)\b/i, weight: 0.8 },
  
  // Pergunta (baixa prioridade, muito genérica)
  question: { pattern: /^(como|quando|onde|por que|porque|qual|quanto)\b|\?$/i, weight: 0.5 }
} as const;

// Keywords de produtos (expandível) - ✅ Plural automático com s?
const PRODUCT_KEYWORDS = [
  'iphones?', 'samsungs?', 'xiaomis?', 'motorolas?', 'lgs?',
  'notebooks?', 'laptops?', 'macbooks?', 'dells?', 'lenovos?', 'asus',
  'celulares?', 'smartphones?', 'telefones?',
  'tvs?', 'televisoes?', 'smart tvs?',
  'fones?', 'headphones?', 'airpods', 'earbuds',
  'tenis', 'sapatos?', 'botas?',
  'carros?', 'motos?', 'veiculos?',
  'casas?', 'apartamentos?', 'imoveis?',
  'computadores?', 'pcs?', 'desktops?',
  'tablets?', 'ipads?',
  'consoles?', 'playstations?', 'xboxs?', 'nintendos?',
  'cameras?', 'gopros?',
  'relogios?', 'smartwatchs?',
  'geladeiras?', 'fogoes?', 'microondas', 'lavadoras?'
];

// ✅ Pré-compilar regex de produtos (performance)
const PRODUCT_REGEX = PRODUCT_KEYWORDS.map(
  k => new RegExp(`\\b${k}\\b`, 'i')
);

// Patterns de preço melhorados - ✅ Suporta 2k500, 2,5k, 3.5k
const PRICE_PATTERNS = [
  // Formatos: 1.200, 1200, 1,200, 1k, 1.5k, 2k500, 2,5k
  /(ate|até|menos de|max|maximo|máximo)?\s*r?\$?\s*(\d+(?:[.,]\d+)?)(k|mil)?/i,
];

// ✅ Tokenização (abre portas para melhorias futuras)
function tokenize(text: string): string[] {
  return normalize(text).split(/\s+/).filter(t => t.length > 0);
}

// Normalização completa
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim();
}

// Extrai entidades da query
function extractEntities(query: string): Entities | undefined {
  const entities: Entities = {};
  
  // Extrai preço
  const price = extractPrice(query);
  if (price) entities.price = price;
  
  // Extrai produto
  const product = extractProduct(query);
  if (product) entities.product = product;
  
  // Extrai nome de usuário
  const userName = extractUserName(query);
  if (userName) entities.userName = userName;
  
  // ✅ Extrai localização
  const location = extractLocation(query);
  if (location) entities.location = location;
  
  return Object.keys(entities).length > 0 ? entities : undefined;
}

// Detecta intenção com sistema de pontuação
export function detectUserIntent(query: string): UserIntent {
  const normalized = normalize(query);
  const entities = extractEntities(query);
  
  // Calcula score para cada intenção
  const scores: IntentScore[] = [];
  
  for (const [intentType, config] of Object.entries(INTENT_PATTERNS)) {
    if (config.pattern.test(normalized)) {
      scores.push({
        type: intentType as UserIntent['type'],
        score: config.weight,
        entities
      });
    }
  }
  
  // Regras especiais
  
  // ✅ Produto + preço sem "vendo" = buy (marketplace)
  if (entities?.product && entities?.price && !scores.find(s => s.type === 'sell')) {
    scores.push({ type: 'buy', score: 0.85, entities });
  }
  
  // ✅ Produto + "usado" + preço = provável sell
  if (entities?.product && entities?.price && /\b(usado|seminovo)\b/i.test(normalized)) {
    const sellScore = scores.find(s => s.type === 'sell');
    if (sellScore) {
      sellScore.score += 0.15; // Reforça sell
    } else {
      scores.push({ type: 'sell', score: 0.8, entities });
    }
  }
  
  // ✅ Produto sozinho (palavra única) = buy intent (marketplace)
  const tokens = tokenize(query);
  if (entities?.product && tokens.length === 1) {
    scores.push({ type: 'buy', score: 0.8, entities });
  }
  
  // ✅ Entity bonus: aumenta score baseado em entidades detectadas
  for (const score of scores) {
    let bonus = 0;
    if (score.entities?.product && score.entities?.price) bonus += 0.1;
    if (score.entities?.location) bonus += 0.05;
    if (score.entities?.userName) bonus += 0.05;
    score.score += bonus;
  }
  
  // Se tem produto, aumenta score de buy/search
  if (entities?.product) {
    const buyScore = scores.find(s => s.type === 'buy');
    if (buyScore) {
      buyScore.score += 0.2;
    } else {
      scores.push({ type: 'search', score: 0.7, entities });
    }
  }
  
  // Se é palavra única sem produto, pode ser nome
  const words = normalized.split(/\s+/);
  if (words.length === 1 && words[0].length >= 3 && words[0].length <= 20 && !hasProductKeywords(normalized) && !/^\d+$/.test(words[0])) {
    scores.push({
      type: 'introduction',
      score: 0.75,
      entities: { userName: query.charAt(0).toUpperCase() + query.slice(1).toLowerCase() }
    });
  }
  
  // ✅ Ordena por score (otimizado para poucos itens)
  if (scores.length === 0) {
    return {
      type: 'search',
      confidence: 0.6,
      entities,
      extractedPrice: entities?.price
    };
  }
  
  // Encontra melhor score (mais eficiente que sort para poucos itens)
  let best = scores[0];
  for (let i = 1; i < scores.length; i++) {
    if (scores[i].score > best.score) {
      best = scores[i];
    }
  }
  
  return {
    type: best.type,
    confidence: Math.min(best.score, 0.99),
    entities: best.entities,
    // Deprecated - mantido para compatibilidade
    extractedPrice: best.entities?.price,
    userName: best.entities?.userName
  };
}

// Alias para compatibilidade
export const detectIntent = detectUserIntent;

// Extrai nome de usuário - ✅ Usa normalize + nomes compostos
function extractUserName(query: string): string | undefined {
  const normalized = normalize(query);
  
  const patterns = [
    /meu nome e ([a-z]+(?:\s+[a-z]+)?)/i,
    /me chamo ([a-z]+(?:\s+[a-z]+)?)/i,
    /sou o ([a-z]+(?:\s+[a-z]+)?)/i,
    /sou a ([a-z]+(?:\s+[a-z]+)?)/i,
    /pode me chamar de ([a-z]+(?:\s+[a-z]+)?)/i,
    /eu sou ([a-z]+(?:\s+[a-z]+)?)/i
  ];
  
  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      // Capitalizar cada palavra
      return match[1].split(/\s+/).map(w => 
        w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      ).join(' ');
    }
  }
  return undefined;
}

// ✅ Nova função: extrair localização (validação melhorada)
function extractLocation(query: string): string | undefined {
  const normalized = normalize(query);
  
  // Padrões: "em BH", "em São Paulo", "perto de mim", "aqui em"
  const patterns = [
    /\b(?:em|de|perto de|aqui em)\s+([a-z]{2,}(?:\s+[a-z]{2,})?)/i,
    /\b(bh|sp|rj|mg|ba|pr|sc|rs|df|go|mt|ms|pa|am|ro|ac|rr|ap|to|ma|pi|ce|rn|pb|pe|al|se)\b/i, // Siglas UF
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      const location = match[1].trim();
      // ✅ Validação: mínimo 3 caracteres (evita "em", "de")
      if (location.length >= 3) {
        // ✅ Evitar falsos positivos: não pode ser palavra comum
        const commonWords = ['promocao', 'oferta', 'venda', 'compra', 'novo', 'usado', 'ate', 'por'];
        if (!commonWords.includes(location)) {
          return location;
        }
      }
    }
  }

  return undefined;
}

// Verifica se tem keywords de produto - ✅ Usa regex pré-compilado
function hasProductKeywords(query: string): boolean {
  const normalized = normalize(query);
  return PRODUCT_REGEX.some(regex => regex.test(normalized));
}

// Extrai produto da query - ✅ Suporta iphone13, iphone-13, 256gb
function extractProduct(query: string): string | undefined {
  const normalized = normalize(query);
  
  // ✅ Usa regex pré-compilado
  const matchedRegex = PRODUCT_REGEX.find(regex => regex.test(normalized));
  if (!matchedRegex) return undefined;
  
  // Encontra keyword original
  const keywordIndex = PRODUCT_REGEX.indexOf(matchedRegex);
  const productMatch = PRODUCT_KEYWORDS[keywordIndex];
  const cleanKeyword = productMatch.replace(/s\?$/, '');
  
  // ✅ Regex robusto: iphone13, iphone-13, iphone-13-pro, iphone 13 pro max 256gb
  const regex = new RegExp(
    `\\b${cleanKeyword}s?[-\\s]?(?:\\d+)?(?:[-\\s]?(?:pro|max|plus|ultra|mini|lite|air|edge|note))*(?:\\s?\\d+gb)?`,
    'i'
  );
  const match = query.match(regex);
  return match ? match[0].trim() : cleanKeyword;
}

// Extrai preço da query (melhorado) - ✅ Suporta 2k500, 2,5k, 3.5k
function extractPrice(query: string): number | undefined {
  // ✅ Padrão avançado: captura 2k500 (2000 + 500)
  const advancedPattern = /(\d+)(k|mil)(\d+)?/i;
  const advancedMatch = query.match(advancedPattern);
  
  if (advancedMatch) {
    const base = parseInt(advancedMatch[1]);
    const remainder = advancedMatch[3] ? parseInt(advancedMatch[3]) : 0;
    const price = base * 1000 + remainder;
    if (price > 0) return Math.round(price);
  }
  
  // Padrão normal
  for (const pattern of PRICE_PATTERNS) {
    const match = query.match(pattern);
    
    if (match) {
      const numberPart = match[2]; // Ex: "2.5", "2,5", "2000"
      const multiplier = match[3]; // "k" ou "mil"
      
      // Normaliza separadores: 2,5 → 2.5
      const normalized = numberPart.replace(',', '.');
      let price = parseFloat(normalized);
      
      // Converte 'k' ou 'mil' para milhares
      if (multiplier && (multiplier.toLowerCase() === 'k' || multiplier.toLowerCase() === 'mil')) {
        price *= 1000;
      }
      
      if (price > 0) {
        return Math.round(price);
      }
    }
  }
  return undefined;
}
