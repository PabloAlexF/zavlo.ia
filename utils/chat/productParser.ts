import { BRAND_SET, GENERIC_PRODUCTS, NON_PRODUCT_WORDS, COMMON_NON_PRODUCTS, MODEL_DICTIONARY, TokenWithPosition } from './constants';
import { cleanProductQuery, extractProductInfo, normalizeStorage, deduplicateTokens } from './queryProcessor';
import { enrichProductQuery, optimizeQueryOrder } from './brandDetector';
import { buildGoogleSearchQuery } from './googleQueryBuilder';

// ✅ LRU Cache para fuzzy matching (limite de 500 entradas)
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 500) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }
}

const BRAND_CACHE = new LRUCache<string, { brand: string; score: number } | null>(500);

// Stop words para filtrar tokens irrelevantes
const STOP_WORDS = new Set(['de', 'da', 'do', 'para', 'com', 'em', 'o', 'a', 'os', 'as']);

// ✅ Normalização de acentos (melhora recall)
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// ✅ Tokenização robusta com posição (para ranking)
function tokenizeWithPosition(query: string): TokenWithPosition[] {
  const cleaned = query
    .toLowerCase()
    .replace(/[^\w\s+-]/g, ' ');  // Preserva + e - para c++, usb-c
  
  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((token, position) => ({
      token,
      position,
      isNumeric: /^\d+/.test(token),
      isAlpha: /^[a-z]+$/i.test(token)
    }));
}

function tokenize(query: string): string[] {
  return tokenizeWithPosition(query).map(t => t.token);
}

// ✅ Gera n-grams (unigrams, bigrams, trigrams)
function generateNGrams(tokens: string[], maxN: number = 3): string[] {
  const ngrams: string[] = [];
  
  for (let n = 1; n <= Math.min(maxN, tokens.length); n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join(' '));
    }
  }
  
  return ngrams;
}

export interface ParsedProduct {
  product: string;
  brand?: string;
  model?: string;
  attributes: string[];
  condition?: 'new' | 'used';
  location?: string;
  isGeneric: boolean;
  needsLocation: boolean;
  query: string;
  tokens: string[];        // ✅ Tokens originais
  confidence: number;      // ✅ Confiança do parsing (0-1)
  brandScore?: number;     // ✅ Score da detecção de marca
  modelScore?: number;     // ✅ Score da detecção de modelo
}

// ✅ Índice de marcas por primeira letra (performance)
const BRAND_INDEX: Record<string, Set<string>> = {};
for (const brand of BRAND_SET) {
  const firstLetter = brand[0].toLowerCase();
  if (!BRAND_INDEX[firstLetter]) {
    BRAND_INDEX[firstLetter] = new Set();
  }
  BRAND_INDEX[firstLetter].add(brand);
}

// Importado de constants.ts

// ✅ Regex melhorados para condição
const NEW_CONDITION_REGEX = /\b(novo|nova|lacrado|lacrada|new|zero|0km)\b/i;
const USED_CONDITION_REGEX = /\b(usado|usada|semi[\s-]?novo|semi[\s-]?nova|used|2a\s*mão|segunda\s*mão)\b/i;

// ✅ Algoritmo de Levenshtein otimizado (two-row, O(min(a,b)) memória)
function levenshtein(a: string, b: string): number {
  if (a.length > b.length) [a, b] = [b, a];
  
  let prevRow = Array(a.length + 1).fill(0).map((_, i) => i);
  let currRow = Array(a.length + 1).fill(0);
  
  for (let j = 1; j <= b.length; j++) {
    currRow[0] = j;
    
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currRow[i] = Math.min(
        currRow[i - 1] + 1,      // inserção
        prevRow[i] + 1,          // deleção
        prevRow[i - 1] + cost    // substituição
      );
    }
    
    [prevRow, currRow] = [currRow, prevRow];
  }
  
  return prevRow[a.length];
}

// ✅ Detecta números como atributos (iphone 13, ps5, 256gb, 128 gb, 16gb ram)
function isNumericAttribute(token: string): boolean {
  return /^\d+\s?(gb|tb|hz|mp|pol|"|')?$/i.test(token);
}

// ✅ Detecta modelo usando n-grams + dicionário (melhora detecção)
function detectModelFromNGrams(ngrams: string[], brand?: string): { model: string; score: number } | null {
  // 1. Verifica dicionário primeiro (mais preciso)
  for (const ngram of ngrams) {
    const normalizedNgram = normalize(ngram);
    
    if (MODEL_DICTIONARY[normalizedNgram]) {
      const dictBrand = MODEL_DICTIONARY[normalizedNgram];
      
      // Se marca já detectada, valida consistência
      if (!brand || normalize(brand) === dictBrand) {
        return { model: ngram, score: 1.0 };
      }
    }
  }
  
  // 2. Heurística: prioriza n-grams maiores
  const sortedNGrams = [...ngrams].sort((a, b) => b.split(' ').length - a.split(' ').length);
  
  for (const ngram of sortedNGrams) {
    // Se tem marca, verifica se n-gram contém a marca
    if (brand && normalize(ngram).includes(normalize(brand))) {
      return { model: ngram, score: 0.9 };
    }
    
    // ✅ Regex melhorado: exige letra + número
    if (/[a-z]+\s*\d+/i.test(ngram) && ngram.split(' ').length >= 2) {
      return { model: ngram, score: 0.7 };
    }
  }
  
  return null;
}

// ✅ Encontra marca mais próxima usando fuzzy matching otimizado + similarity score + cache
function findClosestBrand(word: string): { brand: string; score: number } | null {
  if (word.length < 4) return null;
  
  const normalized = normalize(word);
  
  // ✅ Verifica cache primeiro
  if (BRAND_CACHE.has(normalized)) {
    return BRAND_CACHE.get(normalized) || null;
  }
  
  // Match exato primeiro
  if (BRAND_SET.has(normalized)) {
    const result = { brand: normalized, score: 1.0 };
    BRAND_CACHE.set(normalized, result);
    return result;
  }
  
  // ✅ Usa índice por primeira letra (performance)
  const firstLetter = normalized[0];
  const candidates = BRAND_INDEX[firstLetter];
  
  if (!candidates) {
    BRAND_CACHE.set(normalized, null);
    return null;
  }
  
  const tolerance = word.length <= 5 ? 1 : 2;
  let bestMatch: { brand: string; score: number } | null = null;
  
  for (const brand of candidates) {
    // Otimização: pular se diferença de tamanho > 2
    if (Math.abs(normalized.length - brand.length) > 2) continue;
    
    const distance = levenshtein(normalized, brand);
    
    if (distance <= tolerance) {
      const maxLength = Math.max(normalized.length, brand.length);
      const similarity = 1 - (distance / maxLength);
      
      if (similarity >= 0.8) {
        if (!bestMatch || similarity > bestMatch.score) {
          bestMatch = { brand, score: similarity };
        }
      }
    }
  }
  
  // ✅ Armazena no cache
  BRAND_CACHE.set(normalized, bestMatch);
  return bestMatch;
}

export function parseProductQuery(query: string): ParsedProduct {
  // ✅ MELHORIA: Normalizar storage e deduplicar ANTES do parse
  const normalizedQuery = normalizeStorage(query);
  const tokens = tokenize(normalizedQuery);
  
  // Deduplicar tokens logo no início
  const dedupedTokens = deduplicateTokens(tokens);
  const dedupedQuery = dedupedTokens.join(' ');
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 [PARSER] Original → Deduped:', {
      original: query,
      normalized: normalizedQuery,
      dedupedQuery,
      tokens: dedupedTokens.length
    });
  }
// ✅ Tokens já deduplicados do pré-processamento (tokens originais preservados)
  const tokens = dedupedTokens;
  
  // Normalizar tokens UMA VEZ (performance)
  const normalizedTokens = tokens.map(t => normalize(t));
  
  // Remover stop words
  // Normalizar tokens UMA VEZ (performance) - dedupedTokens já limpos
  const normalizedTokens = tokens.map(t => normalize(t));
  const filteredTokens = normalizedTokens.filter(t => !STOP_WORDS.has(t));
  
  // ✅ Gera n-grams para melhor detecção de modelos (usa tokens filtrados)
  const ngrams = generateNGrams(filteredTokens, 4);
  
  const enrichment = enrichProductQuery(dedupedQuery);
  const info = extractProductInfo(dedupedQuery);
  
  const originalLower = dedupedQuery.toLowerCase();
  let condition: 'new' | 'used' | undefined;
  if (NEW_CONDITION_REGEX.test(originalLower)) {
    condition = 'new';
  } else if (USED_CONDITION_REGEX.test(originalLower)) {
    condition = 'used';
  }
  
  let brand = enrichment.detectedBrand || info.brand;
  let model = enrichment.detectedModel || info.brand;
  let brandScore = 0;
  let modelScore = 0;
  
  // ✅ Aplica fuzzy matching na marca
  if (!brand && info.product && info.product.length >= 4) {
    const fuzzyResult = findClosestBrand(info.product);
    if (fuzzyResult && !COMMON_NON_PRODUCTS.has(normalize(info.product))) {
      brand = fuzzyResult.brand;
      brandScore = fuzzyResult.score;
    }
  } else if (brand) {
    brandScore = 1.0;
  }
  
  // ✅ Tenta detectar modelo usando n-grams + dicionário
  if (!model) {
    const ngramModel = detectModelFromNGrams(ngrams, brand);
    if (ngramModel) {
      model = ngramModel.model;
      modelScore = ngramModel.score;
      
      // Se modelo veio do dicionário e não tinha marca, pega do dicionário
      if (!brand && ngramModel.score === 1.0) {
        const dictBrand = MODEL_DICTIONARY[normalize(model)];
        if (dictBrand) {
          brand = dictBrand;
          brandScore = 1.0;
        }
      }
    }
  } else {
    modelScore = 1.0;
  }
  
  // ✅ Extrai atributos numéricos (já deduplicados)
  let attributes = info.attributes;
  
  if (model) {
    const modelLower = normalize(model);
    attributes = attributes.filter(attr => !modelLower.includes(normalize(attr)));
  }
  
  let product = info.product;
  if (model && product) {
    const modelLower = normalize(model);
    const productLower = normalize(product);
    const modelWords = modelLower.split(' ');
    if (modelWords.includes(productLower)) {
      product = '';
    }
  }
  
  const isGeneric = !!(product && GENERIC_PRODUCTS[product as keyof typeof GENERIC_PRODUCTS] && !brand && !model && attributes.length === 0);
  
  // ✅ Confidence PENALIZA duplicatas detectadas
  const dedupPenalty = (tokens.length - dedupedTokens.length) * 0.1;
  const attributeScore = Math.min(attributes.length * 0.1, 0.2);
  let confidence = (
    brandScore * 0.4 +
    modelScore * 0.4 +
    attributeScore
  ) - dedupPenalty;
  
  // Penalizar se não detectou nada
  if (!brand && !model) confidence *= 0.5;
  
  // Garantir mínimo 0
  confidence = Math.max(confidence, 0);
  
  // ✅ needsLocation com threshold 0.6
  const needsLocation = confidence < 0.6;
  
  return {
    product,
    brand,
    model,
    attributes,
    condition,
    isGeneric,
    needsLocation,
    query: enrichment.enrichedQuery || dedupedQuery,
    tokens,
    confidence,
    brandScore,
    modelScore
  };
}

export function buildSearchQuery(
  parsed: ParsedProduct, 
  condition?: string, 
  location?: string, 
  gender?: string,
  priceMax?: string,
  storage?: string,
  sortBy?: string
): { query: string; sortBy: 'BEST_MATCH' | 'LOWEST_PRICE' | 'HIGHEST_PRICE'; minPrice?: number; maxPrice?: number } {
  // Remove marca do model se já está incluída (evita "nike Nike Air Max")
  let cleanModel = parsed.model;
  if (cleanModel && parsed.brand) {
    const brandLower = parsed.brand.toLowerCase();
    const modelLower = cleanModel.toLowerCase();
    if (modelLower.startsWith(brandLower + ' ')) {
      cleanModel = cleanModel.substring(parsed.brand.length + 1);
    }
  }
  
  // Normaliza para lowercase (consistência)
  if (cleanModel) {
    cleanModel = cleanModel.toLowerCase();
  }
  
  // ✅ Logs apenas em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 buildSearchQuery - parsed:', {
      brand: parsed.brand,
      model: parsed.model,
      cleanModel,
      product: parsed.product,
      attributes: parsed.attributes,
      confidence: parsed.confidence
    });
  }
  
  // Constrói query base SEM condição (evita duplicação)
  const baseQuery = optimizeQueryOrder({
    brand: parsed.brand,
    model: cleanModel,
    product: parsed.product,
    attributes: parsed.attributes,
    gender: undefined,
    condition: undefined
  });
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🎯 baseQuery após optimizeQueryOrder:', baseQuery);
  }
  
  // Google Query Builder adiciona tudo e retorna sortBy
  return buildGoogleSearchQuery(baseQuery, {
    condition,
    priceMax,
    location,
    storage,
    gender,
    sortBy
  });
}