import { BRAND_SET, GENERIC_PRODUCTS, NON_PRODUCT_WORDS } from './constants';
import { cleanProductQuery, extractProductInfo } from './queryProcessor';
import { detectBrandFromModel, enrichProductQuery, optimizeQueryOrder } from './brandDetector';
import { buildGoogleSearchQuery } from './googleQueryBuilder';

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
}

// Algoritmo de Levenshtein para fuzzy matching
function levenshtein(a: string, b: string): number {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }
  
  return matrix[b.length][a.length];
}

// Encontra marca mais próxima usando fuzzy matching otimizado
function findClosestBrand(word: string): string | null {
  if (word.length < 4) return null;
  
  const normalized = word.toLowerCase();
  
  // Match exato primeiro
  if (BRAND_SET.has(normalized)) {
    return normalized;
  }
  
  // Otimização: filtra por primeira letra
  const tolerance = word.length <= 5 ? 1 : 2;
  
  for (const brand of BRAND_SET) {
    // Pula se primeira letra é muito diferente
    if (Math.abs(brand.charCodeAt(0) - normalized.charCodeAt(0)) > 2) continue;
    
    const distance = levenshtein(normalized, brand);
    if (distance <= tolerance) {
      return brand;
    }
  }
  
  return null;
}

export function parseProductQuery(query: string): ParsedProduct {
  // Enriquece com detecção inteligente de marca (PRIMEIRO - mais preciso)
  const enrichment = enrichProductQuery(query);
  
  // Usa o sistema básico de processamento como fallback
  const info = extractProductInfo(query);
  
  // Detecta condição na query original
  const originalLower = query.toLowerCase();
  let condition: 'new' | 'used' | undefined;
  if (/\b(novo|nova|new)\b/i.test(originalLower)) {
    condition = 'new';
  } else if (/\b(usado|usada|seminovo|seminova|used)\b/i.test(originalLower)) {
    condition = 'used';
  }
  
  // PRIORIZA enrichment (Knowledge Graph) sobre extractProductInfo
  let brand = enrichment.detectedBrand || info.brand;
  let model = enrichment.detectedModel || info.model;
  
  // Aplica fuzzy matching na marca se não foi detectada
  if (!brand && info.product && info.product.length >= 4) {
    const fuzzyBrand = findClosestBrand(info.product);
    const commonProducts = ['mesa', 'cadeira', 'sofa', 'cama', 'armario', 'guarda', 'roupa'];
    if (fuzzyBrand && !commonProducts.includes(info.product)) {
      brand = fuzzyBrand;
    }
  }
  
  // Remove atributos que já estão no modelo (evita "air max air")
  let attributes = info.attributes;
  if (model) {
    const modelLower = model.toLowerCase();
    attributes = attributes.filter(attr => !modelLower.includes(attr.toLowerCase()));
  }
  
  // IMPORTANTE: NÃO remove produto genérico (tenis, celular, etc) mesmo se modelo existir
  // Apenas remove se o produto for parte do nome do modelo (ex: "iphone" em "iPhone 13")
  let product = info.product;
  if (model && product) {
    const modelLower = model.toLowerCase();
    const productLower = product.toLowerCase();
    // Só remove se produto é EXATAMENTE uma palavra do modelo
    const modelWords = modelLower.split(' ');
    if (modelWords.includes(productLower)) {
      product = '';
    }
  }
  
  // Verifica se é genérico
  const isGeneric = product && GENERIC_PRODUCTS[product] && !brand && !model && attributes.length === 0;
  
  // Determina se precisa de localização
  const needsLocation = !isGeneric && !info.hasSpecificModel && !model && !brand;
  
  return {
    product,
    brand,
    model,
    attributes,
    condition,
    isGeneric,
    needsLocation,
    query: enrichment.enrichedQuery
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
  
  console.log('🔧 buildSearchQuery - parsed:', {
    brand: parsed.brand,
    model: parsed.model,
    cleanModel,
    product: parsed.product,
    attributes: parsed.attributes
  });
  
  // Constrói query base SEM condição (evita duplicação)
  const baseQuery = optimizeQueryOrder({
    brand: parsed.brand,
    model: cleanModel,
    product: parsed.product,
    attributes: parsed.attributes,
    gender: undefined,
    condition: undefined
  });
  
  console.log('🎯 baseQuery após optimizeQueryOrder:', baseQuery);
  
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