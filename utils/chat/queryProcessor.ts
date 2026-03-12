import { STOP_WORDS, BRAND_SET } from './constants';
import { normalizeAccents } from './textNormalizer';

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

// Limpa a query removendo intenções de compra e mantendo só o produto
export function cleanProductQuery(query: string): string {
  let cleaned = query.toLowerCase().trim();
  
  // Remove padrões de intenção de compra
  for (const pattern of PURCHASE_INTENT_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }
  
  // Remove artigos no início
  const words = cleaned.split(/\s+/);
  if (words.length > 1 && PRODUCT_ARTICLES.has(words[0])) {
    words.shift();
    cleaned = words.join(' ');
  }
  
  // Remove pontuação e caracteres especiais (exceto números e letras)
  cleaned = cleaned.replace(/[^a-z0-9\sáàâãéèêíïóôõöúçñ]/g, ' ');
  
  // Remove espaços múltiplos
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Se ficou vazio, retorna a query original
  const result = cleaned.trim();
  return result || query.toLowerCase().trim();
}

// Detecta se a query tem modelo específico (não precisa localização)
export function hasSpecificModel(query: string): boolean {
  const normalized = normalizeAccents(query.toLowerCase());
  
  // Padrões de modelos específicos
  const modelPatterns = [
    /iphone\s+(\d+|se|x|xs|xr|pro|max|mini|plus)/i,
    /galaxy\s+(s\d+|note|a\d+|j\d+)/i,
    /redmi\s+(note|\d+)/i,
    /moto\s+(g\d+|e\d+|x\d+)/i,
    /\b(i[357]|ryzen\s*[357])\b/i,
    /\b\d+gb\b/i,
    /\b\d+\\\"\b/i,
    /\b\d+\s*(polegadas|pol)\b/i
  ];
  
  return modelPatterns.some(pattern => pattern.test(normalized));
}

// Sugere melhorias para queries muito genéricas
export function suggestQueryImprovements(query: string): string[] {
  const normalized = normalizeAccents(query.toLowerCase());
  const suggestions: string[] = [];
  
  // Sugestões baseadas no produto
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

// Extrai informações estruturadas da query
export function extractProductInfo(query: string) {
  const cleaned = cleanProductQuery(query);
  const normalized = normalizeAccents(cleaned.toLowerCase());
  const words = normalized.split(/\s+/).filter(word => word.length > 0);
  
  let brand = '';
  let product = '';
  let model = '';
  let priceMax: number | undefined;
  let attributes: string[] = [];
  
  // Detecta filtro de preço
  const priceMatch = query.match(/(até|abaixo de|menor que|máximo)\s*(de\s*)?r?\$?\s*(\d+)/i);
  if (priceMatch) {
    priceMax = Number(priceMatch[3]);
  }
  
  // Detecta marca
  for (const word of words) {
    if (BRAND_SET.has(word)) {
      brand = word;
      break;
    }
  }
  
  // Detecta produto principal (primeira palavra não-stop)
  for (const word of words) {
    if (!STOP_WORDS.has(word) && word !== brand && word.length > 2) {
      product = word;
      break;
    }
  }
  
  // Se não encontrou produto, usa a primeira palavra
  if (!product && words.length > 0) {
    product = words[0];
  }
  
  // Detecta modelo (números + letras)
  const MODEL_BLACKLIST = new Set(['gamer', 'barato', 'novo', 'usado', 'seminovo', 'ultra', 'nova', 'novos', 'novas', 'usada', 'usados', 'usadas']);
  const modelPattern = /\b(\d+[a-z]*|[a-z]+\d+|pro|max|mini|plus|se|note)\b/i;
  for (const word of words) {
    if (modelPattern.test(word) && word !== product && !MODEL_BLACKLIST.has(word)) {
      model = word;
      break;
    }
  }
  
  // Resto são atributos (remove condições)
  const CONDITION_WORDS = new Set(['novo', 'nova', 'novos', 'novas', 'usado', 'usada', 'usados', 'usadas', 'seminovo', 'seminova']);
  attributes = words.filter(word => 
    !STOP_WORDS.has(word) && 
    !CONDITION_WORDS.has(word) &&
    word !== brand && 
    word !== product && 
    word !== model &&
    !/\d+/.test(word) // Remove números de preço
  );
  
  return {
    original: query,
    cleaned,
    brand,
    product,
    model,
    priceMax,
    attributes,
    hasSpecificModel: hasSpecificModel(cleaned),
    isGeneric: !brand && !model && attributes.length === 0 && !hasSpecificModel(cleaned)
  };
}