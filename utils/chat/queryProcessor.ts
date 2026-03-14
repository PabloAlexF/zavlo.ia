import { STOP_WORDS, BRAND_SET } from './constants';

// ✅ Normalização centralizada (consistente com parser principal)
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// ✅ NORMALIZAÇÃO DE STORAGE - CORREÇÃO CRÍTICA
export function normalizeStorage(input: string): string {
  let normalized = input.toLowerCase();
  
  // Unidades por extenso → abreviação (1 tera → 1tb, 500 giga → 500gb)
  normalized = normalized
    .replace(/(\d+(?:\.\d+)?)\s*(tera(s?bytes?)?|tb?)/gi, '$1tb')
    .replace(/(\d+(?:\.\d+)?)\s*(giga(s?bytes?)?|gb?)/gi, '$1gb')
    .replace(/(\d+(?:\.\d+)?)\s*(mega(s?bytes?)?|mb?)/gi, '$1mb')
    .replace(/(\d+(?:\.\d+)?)\s*(kilo(s?bytes?)?|kb?)/gi, '$1kb');
  
  // Remove espaços extras e padroniza case (1TB → 1tb)
  return normalized.replace(/\s+/g, ' ').trim();
}

// ✅ DEDUPLICAÇÃO DE TOKENS - CORREÇÃO CRÍTICA
export function deduplicateTokens(tokens: string[]): string[] {
  const normalized = tokens.map(t => normalize(t));
  const seen = new Set<string>();
  const result: string[] = [];
  
  for (let i = 0; i < normalized.length; i++) {
    const normToken = normalized[i];
    const originalToken = tokens[i];
    
    // Skip se já visto (case insensitive)
    if (seen.has(normToken)) continue;
    
    seen.add(normToken);
    result.push(originalToken);
  }
  
  return result;
}

// ✅ OTIMIZAÇÃO DE ORDEM DE PALAVRAS (produto + specs)
export function optimizeWordOrder(tokens: string[]): string[] {
  const normalizedTokens = tokens.map(t => normalize(t));
  
  // 1. Identifica produto principal (não é spec técnica)
  const productCandidates = tokens.filter((_, i) => 
    !/^(tb|gb|mb|kb|hz|pol|polegadas|"|')$/i.test(tokens[i]) &&
    !/^\d+$/.test(tokens[i])
  );
  
  // 2. Identifica specs técnicas (tb, gb, números)
  const specs = tokens.filter(t => 
    /tb|gb|hz|pol|polegadas/i.test(t) || /^\d+\.?\d*$/.test(t)
  );
  
  // 3. Prioridade: produto primeiro → specs → resto
  return [...productCandidates.slice(0, 2), ...specs, ...tokens.filter(t => 
    !productCandidates.includes(t) && !specs.includes(t)
  )];
}

// Padrões de intenção de compra que devem ser removidos
const PURCHASE_INTENT_PATTERNS = [
  /^(eu\s+)?(estou|to|tou)\s+(querendo|buscando|procurando|interessado|interessada)\s+/i,
  /^(eu\s+)?(quero|queria|preciso|busco|procuro|gostaria)\s+(de\s+)?(comprar\s+)?/i,
  /^(vou|vamos)\s+(comprar|buscar)\s+/i,
  /^(me\s+)?(ajuda|ajudem?)\s+(a\s+)?(encontrar|achar)\s+/i
];

// Artigos e preposições específicas para produtos
const PRODUCT_ARTICLES = new Set([
  'um', 'uma', 'uns', 'umas', 'o', 'a', 'os', 'as'
]);

// ✅ Regex de preço melhorado (detecta R$ 3k, r$2.5k, até 3000)
const PRICE_REGEX = /(até|abaixo de|menor que|max(imo)?|ate)\s*(de\s*)?(r?\$?\s*)?(\d+(\.\d+)?[k]?)/i;

// ✅ Regex de faixa de preço (entre 2.5k e 4k, entre 2000 e 3000)
const PRICE_RANGE_REGEX = /entre\s*(r?\$?\s*)?(\d+(\.\d+)?[k]?)\s*(e|a)\s*(r?\$?\s*)?(\d+(\.\d+)?[k]?)/i;

// ✅ Regex de storage (256gb, 128 GB, 1tb, 1 TB) - case insensitive
const STORAGE_REGEX = /\b(\d+)\s?(gb|tb)\b/i;

// ✅ Regex de RAM (16gb ram, 8 GB RAM)
const RAM_REGEX = /\b(\d+)\s?gb\s?ram\b/i;

// ✅ Regex de refresh rate (144hz, 120 Hz)
const REFRESH_RATE_REGEX = /\b(\d+)\s?hz\b/i;

// ✅ Regex de resolução (4k, 8k, 1080p, 1440p)
const RESOLUTION_REGEX = /\b(4k|8k|1080p|1440p|2k|full\s?hd|hd)\b/i;

// ✅ Regex de tamanho de tela (55", 15.6", 100 pol) - suporta decimal e 3 dígitos
const SCREEN_SIZE_REGEX = /\b(\d{2,3}(\.\d+)?)\s?(pol|polegadas|"|')\b/i;

// ✅ Intenção de preço baixo (normalizado)
const CHEAP_INTENT_REGEX = /\b(barato|mais barato|economico|promocao|oferta)\b/i;

// ✅ Condição do produto
const CONDITION_REGEX = /\b(novo|nova|lacrado|lacrada|usado|usada|semi[\s-]?novo|semi[\s-]?nova|seminovo|seminova)\b/i;

// ✅ Cores comuns (expandido com cores compostas)
const COLORS = new Set([
  'preto', 'branco', 'azul', 'vermelho', 'verde', 'amarelo', 'rosa',
  'roxo', 'cinza', 'prata', 'dourado', 'laranja', 'marrom',
  'grafite', 'spacegray', 'midnight', 'silver', 'gold', 'rose',
  'coral', 'turquesa', 'violeta',
  'verde agua', 'azul marinho', 'rosa gold', 'cinza espacial'
]);

// ✅ Gêneros
const GENDER_REGEX = /\b(masculino|feminino|unissex|infantil)\b/i;

// ✅ Categorias compostas (bigrams)
const COMPOSITE_PRODUCTS = new Set([
  'air fryer', 'smart tv', 'smart watch', 'video game',
  'fone de ouvido', 'caixa de som', 'placa de video', 'placa mae',
  'fonte de alimentacao', 'disco rigido', 'ssd nvme'
]);

// ✅ Marcas compostas (bigrams)
const COMPOSITE_BRANDS = new Set([
  'new balance', 'under armour', 'tommy hilfiger', 'calvin klein',
  'ralph lauren', 'louis vuitton', 'michael kors'
]);

// ✅ Categorias implícitas (ps5 → videogame, macbook → notebook)
const CATEGORY_MAP: Record<string, string> = {
  'ps5': 'videogame',
  'ps4': 'videogame',
  'xbox': 'videogame',
  'playstation': 'videogame',
  'nintendo': 'videogame',
  'switch': 'videogame',
  'macbook': 'notebook',
  'ipad': 'tablet',
  'kindle': 'tablet'
};

// ✅ Tamanho de TV implícito (grande → >=55, pequena → <=43)
const TV_SIZE_MAP: Record<string, { min?: number; max?: number }> = {
  'grande': { min: 55 },
  'media': { min: 43, max: 54 },
  'pequena': { max: 43 }
};

// ✅ Atributo gamer (prioridade alta)
const GAMER_REGEX = /\b(gamer|gaming)\b/i;

// ✅ Palavras de intenção barata (normalizado)
const CHEAP_WORDS = new Set(['barato', 'economico', 'promocao', 'oferta']);

// Limpa a query removendo intenções de compra e mantendo só o produto
export function cleanProductQuery(query: string): string {
  let cleaned = query.toLowerCase().trim();
  
  // ✅ APLICA NORMALIZAÇÃO DE STORAGE PRIMEIRO
  cleaned = normalizeStorage(cleaned);
  
  for (const pattern of PURCHASE_INTENT_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }
  
  const words = cleaned.split(/\s+/);
  if (words.length > 1 && PRODUCT_ARTICLES.has(words[0])) {
    words.shift();
    cleaned = words.join(' ');
  }
  
  cleaned = cleaned.replace(/[^\w\s+\-$áàâãéèêíïóôõöúçñ]/g, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // ✅ DEDUPLICA TOKENS na limpeza
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  const dedupedTokens = deduplicateTokens(tokens);
  cleaned = dedupedTokens.join(' ');
  
  const result = cleaned.trim();
  return result || query.toLowerCase().trim();
}

export function suggestQueryImprovements(query: string): string[] {
  const normalized = normalize(query);
  const suggestions: string[] = [];
  
  if (normalized.includes('iphone')) {
    suggestions.push('iPhone 15 Pro', 'iPhone 14', 'iPhone SE');
  } else if (normalized.includes('samsung') || normalized.includes('galaxy')) {
    suggestions.push('Samsung Galaxy S24', 'Galaxy A54', 'Galaxy Note');
  } else if (normalized.includes('notebook')) {
    suggestions.push('notebook gamer', 'notebook i7', 'notebook Dell');
  } else if (normalized.includes('tv')) {
    suggestions.push('Smart TV 50 polegadas', 'TV Samsung', 'TV LG');
  }
  
  return suggestions;
}

export function extractProductInfo(query: string) {
  // ✅ NORMALIZA STORAGE PRIMEIRO
  const normalizedQuery = normalizeStorage(query);
  const cleaned = cleanProductQuery(normalizedQuery);
  const normalized = normalize(cleaned);
  const words = normalized.split(/\s+/).filter(word => word.length > 0);
  
  let brand = '';
  let product = '';
  let priceMin: number | undefined;
  let priceMax: number | undefined;
  let storage: string | undefined;
  let ram: string | undefined;
  let refreshRate: string | undefined;
  let resolution: string | undefined;
  let screenSize: string | undefined;
  let color: string | undefined;
  let gender: string | undefined;
  let condition: string | undefined;
  let sortByPrice = false;
  let isGamer = false;
  let implicitScreenSize: { min?: number; max?: number } | undefined;
  let attributes: string[] = [];
  
  // ✅ Detecta faixa de preço (entre 2.5k e 4k)
  const priceRangeMatch = normalizedQuery.match(PRICE_RANGE_REGEX);
  if (priceRangeMatch) {
    let min = priceRangeMatch[2];
    let max = priceRangeMatch[6];
    
    if (min.endsWith('k')) {
      priceMin = Number(min.slice(0, -1)) * 1000;
    } else {
      priceMin = Number(min);
    }
    
    if (max.endsWith('k')) {
      priceMax = Number(max.slice(0, -1)) * 1000;
    } else {
      priceMax = Number(max);
    }
  }
  
  // ✅ Detecta preço máximo (até 3k, R$ 2.5k)
  if (!priceMax) {
    const priceMatch = normalizedQuery.match(PRICE_REGEX);
    if (priceMatch) {
      let price = priceMatch[5];
      if (price.endsWith('k')) {
        priceMax = Number(price.slice(0, -1)) * 1000;
      } else {
        priceMax = Number(price);
      }
    }
  }
  
  // ✅ Detecta intenção de preço baixo (normalizado)
  if (CHEAP_INTENT_REGEX.test(normalizedQuery)) {
    sortByPrice = true;
  }
  
  // ✅ Detecta condição do produto
  const conditionMatch = normalizedQuery.match(CONDITION_REGEX);
  if (conditionMatch) {
    const cond = conditionMatch[1].toLowerCase();
    if (['novo', 'nova', 'lacrado', 'lacrada'].includes(cond)) {
      condition = 'new';
    } else if (['usado', 'usada'].includes(cond)) {
      condition = 'used';
    } else if (cond.includes('semi')) {
      condition = 'refurbished';
    }
  }
  
  // ✅ Detecta atributo gamer
  if (GAMER_REGEX.test(normalizedQuery)) {
    isGamer = true;
  }
  
  const storageMatch = normalizedQuery.match(STORAGE_REGEX);
  if (storageMatch && !normalizedQuery.match(RAM_REGEX)) {
    storage = storageMatch[0];
  }
  
  const ramMatch = normalizedQuery.match(RAM_REGEX);
  if (ramMatch) {
    ram = ramMatch[0];
  }
  
  const refreshMatch = normalizedQuery.match(REFRESH_RATE_REGEX);
  if (refreshMatch) {
    refreshRate = refreshMatch[0];
  }
  
  const resolutionMatch = normalizedQuery.match(RESOLUTION_REGEX);
  if (resolutionMatch) {
    resolution = resolutionMatch[0];
  }
  
  const screenMatch = normalizedQuery.match(SCREEN_SIZE_REGEX);
  if (screenMatch) {
    screenSize = screenMatch[0];
  }
  
  // ✅ Detecta cor composta primeiro
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    if (COLORS.has(bigram)) {
      color = bigram;
      break;
    }
  }
  
  if (!color) {
    for (const word of words) {
      if (COLORS.has(word)) {
        color = word;
        break;
      }
    }
  }
  
  const genderMatch = normalizedQuery.match(GENDER_REGEX);
  if (genderMatch) {
    gender = genderMatch[1];
  }
  
  // ✅ Detecta marca composta primeiro
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    if (COMPOSITE_BRANDS.has(bigram)) {
      brand = bigram;
      break;
    }
  }
  
  if (!brand) {
    for (const word of words) {
      const normalizedWord = normalize(word);
      if (BRAND_SET.has(normalizedWord)) {
        brand = normalizedWord;
        break;
      }
    }
  }
  
  // ✅ Remove palavras da marca composta
  let filteredWords = words;
  if (brand && brand.includes(' ')) {
    const brandWords = brand.split(' ');
    filteredWords = words.filter(w => !brandWords.includes(w));
  }
  
  // ✅ Detecta produto composto primeiro
  for (let i = 0; i < filteredWords.length - 1; i++) {
    const bigram = `${filteredWords[i]} ${filteredWords[i + 1]}`;
    if (COMPOSITE_PRODUCTS.has(bigram)) {
      product = bigram;
      break;
    }
  }
  
  if (!product) {
    for (const word of filteredWords) {
      if (!STOP_WORDS.has(word) && word !== brand && word.length > 2) {
        product = word;
        break;
      }
    }
  }
  
  if (!product && filteredWords.length > 0) {
        product = filteredWords[0];
  }
  
  // ✅ Mapeia categoria implícita
  const normalizedProduct = normalize(product);
  if (CATEGORY_MAP[normalizedProduct]) {
    product = CATEGORY_MAP[normalizedProduct];
  }
  
  // ✅ Detecta tamanho de TV implícito
  if (product === 'tv') {
    for (const word of filteredWords) {
      if (TV_SIZE_MAP[word]) {
        implicitScreenSize = TV_SIZE_MAP[word];
        break;
      }
    }
  }
  
  // ✅ Filtra atributos (DEDUPLICADOS)
  const dedupedWords = deduplicateTokens(filteredWords);
  const CONDITION_WORDS = new Set(['novo', 'nova', 'novos', 'novas', 'usado', 'usada', 'usados', 'usadas', 'seminovo', 'seminova', 'lacrado', 'lacrada']);
  
  attributes = dedupedWords.filter(word => {
    const norm = normalize(word);
    return !STOP_WORDS.has(norm) && 
      !CONDITION_WORDS.has(norm) &&
      !CHEAP_WORDS.has(norm) &&
      norm !== normalize(brand) && 
      norm !== normalize(product) &&
      norm !== normalize(storage || '') &&
      norm !== normalize(ram || '') &&
      norm !== normalize(refreshRate || '') &&
      norm !== normalize(resolution || '') &&
      norm !== normalize(screenSize || '') &&
      norm !== normalize(color || '') &&
      !/^\d+$/.test(word) &&
      !['grande', 'media', 'pequena', 'gamer', 'gaming'].includes(norm);
  });
  
  attributes = [...new Set(attributes)];
  
  return {
    original: query,
    cleaned,
    brand,
    product,
    priceMin,
    priceMax,
    storage,
    ram,
    refreshRate,
    resolution,
    screenSize,
    implicitScreenSize,
    color,
    gender,
    condition,
    sortByPrice,
    isGamer,
    attributes,
    isGeneric: !brand && !product && attributes.length === 0
  };
}

