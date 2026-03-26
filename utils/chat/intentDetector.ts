// ✅ Interface de entidades (melhor manutenção)
export interface Entities {
  price?: number;
  product?: string;
  userName?: string;
  location?: string;
}

// Detector de intenção do usuário com sistema de pontuação
export interface UserIntent {
  type: 'buy' | 'sell' | 'search' | 'greeting' | 'despedida' | 'thanks' | 'question' | 'help' | 'credits_question' | 'plans_question' | 'platform_question' | 'introduction' | 'casual_talk' | 'negotiation' | 'offer' | 'other';
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
  help: { pattern: /\b(socorro|como usar|como funciona|tutorial|comandos)\b|^(ajuda|help)$/i, weight: 1.0 },
  credits_question: { pattern: /\b(meus? créditos?|saldo|quanto tenho|creditos|quantos creditos)\b/i, weight: 1.0 },
  plans_question: { pattern: /\b(planos?|assinaturas?|quanto custa o plano|pacotes? de creditos?|assinar)\b/i, weight: 1.0 },
  platform_question: { pattern: /\b(zavlo|plataforma)\b|^(o que (e|é)|quem (e|é)|sobre)\s+(voc[eê]s?|o\s+zavlo|a\s+zavlo|o\s+site|o\s+app)/i, weight: 1.0 },
  
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
  casual_talk: { pattern: /\b(tudo bem|como vai|beleza|tranquilo)\b/i, weight: 0.6 },
  despedida: { pattern: /^(tchau|adeus|até logo|até mais|falou|flw|bye|xau)\b/i, weight: 0.8 },
  thanks: { pattern: /^(obrigad[oa]|obg|valeu|vlw|grato|grata|muito obrigad[oa])\b/i, weight: 0.85 },
  
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
  'tenis', 'sapatos?', 'botas?', 'sandálias?', 'sandalias?',
  'carros?', 'motos?', 'veiculos?',
  'casas?', 'apartamentos?', 'imoveis?',
  'computadores?', 'pcs?', 'desktops?',
  'tablets?', 'ipads?',
  'consoles?', 'playstations?', 'xboxs?', 'nintendos?',
  'cameras?', 'gopros?',
  'relogios?', 'smartwatchs?',
  'geladeiras?', 'fogoes?', 'microondas', 'lavadoras?', 'maquinas? de lavar',
  'colchoes?', 'colchao', 'sofas?', 'sofá', 'camas?', 'guarda-roupas?', 'estantes?',
  'ar condicionado', 'ventiladores?', 'aquecedores?',
  'bicicletas?', 'patinetes?', 'skates?',
  'impressoras?', 'monitores?', 'teclados?', 'mouses?',
  'cadeiras?', 'mesas?', 'escrivaninhas?',
];

// ✅ Pré-compilar regex de produtos (performance)
const PRODUCT_REGEX = PRODUCT_KEYWORDS.map(
  k => new RegExp(`\\b${k}\\b`, 'i')
);

// Patterns de preço — prefixo OU sufixo obrigatório para evitar capturar anos/modelos
const PRICE_PATTERNS = [
  // Com prefixo explícito: "até 1200", "R$ 500", "menos de 800"
  /(ate|até|menos de|abaixo de|max|maximo|máximo)\s*r?\$?\s*(\d+(?:[.,]\d+)?)(k|mil)?/i,
  // Com R$ explícito: "R$1200", "r$ 500"
  /r\$\s*(\d+(?:[.,]\d+)?)(k|mil)?/i,
  // Com sufixo k/mil obrigatório: "2k", "50mil", "1.5k"
  /(\d+(?:[.,]\d+)?)(k|mil)\b/i,
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
  
  // Se tem produto, aumenta score de buy/search
  if (entities?.product) {
    const buyScore = scores.find(s => s.type === 'buy');
    if (buyScore) {
      buyScore.score += 0.2;
    } else {
      scores.push({ type: 'search', score: 0.7, entities });
    }
  }

  // ✅ Entity bonus: aplicado DEPOIS de todos os scores serem adicionados
  for (const score of scores) {
    let bonus = 0;
    if (score.entities?.product && score.entities?.price) bonus += 0.1;
    if (score.entities?.location) bonus += 0.05;
    if (score.entities?.userName) bonus += 0.05;
    score.score += bonus;
  }
  
  // Se é palavra única sem produto E tem padrão explícito de apresentação, pode ser nome
  // Não inferir introduction por palavra única — muito propenso a falso positivo com produtos
  const words = normalized.split(/\s+/);
  const hasExplicitIntroduction = /\b(meu nome|me chamo|sou o|sou a|pode me chamar|eu sou)\b/i.test(normalized);
  if (words.length === 1 && words[0].length >= 3 && words[0].length <= 20 && !hasProductKeywords(normalized) && !/^\d+$/.test(words[0]) && hasExplicitIntroduction) {
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

  const patterns = [
    /\b(?:em|de|perto de|aqui em)\s+([a-z]{2,}(?:\s+[a-z]{2,})?)/i,
    /\b(bh|sp|rj|mg|ba|pr|sc|rs|df|go|mt|ms|pa|am|ro|ac|rr|ap|to|ma|pi|ce|rn|pb|pe|al|se)\b/i,
  ];

  // #2: expandir lista de palavras comuns que não são localizações
  const commonWords = [
    'promocao', 'oferta', 'venda', 'compra', 'novo', 'usado', 'ate', 'por',
    'estoque', 'pronta', 'entrega', 'desconto', 'preco', 'valor', 'custo',
    'qualidade', 'garantia', 'original', 'importado', 'nacional', 'atacado',
    'varejo', 'loja', 'site', 'online', 'delivery', 'frete', 'gratis',
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      const location = match[1].trim();
      if (location.length >= 3 && !commonWords.includes(location)) {
        return location;
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
  
  // Padrões com prefixo/sufixo obrigatório
  for (const pattern of PRICE_PATTERNS) {
    const match = query.match(pattern);
    if (!match) continue;

    // Detecta qual grupo contém o número (varia por pattern)
    // Pattern 0: grupos (prefixo, numero, sufixo)
    // Pattern 1: grupos (numero, sufixo) — R$
    // Pattern 2: grupos (numero, sufixo) — k/mil
    const numberPart = match[2] ?? match[1];
    const multiplier = match[3] ?? match[2];
    if (!numberPart) continue;

    const normalized = numberPart.replace(',', '.');
    let price = parseFloat(normalized);
    if (multiplier && /^(k|mil)$/i.test(multiplier)) price *= 1000;
    if (price > 0) return Math.round(price);
  }
  return undefined;
}
