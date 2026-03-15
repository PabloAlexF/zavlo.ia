// Construtor de query otimizada para Google Search

interface SearchFilters {
  condition?: string;
  priceMax?: string;
  location?: string;
  storage?: string;
  gender?: string;
  brand?: string;
  sortBy?: string;
}

// ✅ Palavras ruins que devem ser removidas da query
const BAD_KEYWORDS = new Set([
  'barato', 'caro', 'promocao', 'oferta', 'desconto',
  'comprar', 'vender', 'preco', 'ate', 'abaixo', 'acima'
]);

// ✅ UFs brasileiras (remover da localização)
const UFS = new Set([
  'ac', 'al', 'ap', 'am', 'ba', 'ce', 'df', 'es', 'go', 'ma',
  'mt', 'ms', 'mg', 'pa', 'pb', 'pr', 'pe', 'pi', 'rj', 'rn',
  'rs', 'ro', 'rr', 'sc', 'sp', 'se', 'to'
]);

// ✅ Categorias que aceitam gênero
const GENDER_CATEGORIES = new Set([
  'tenis', 'sapato', 'roupa', 'camisa', 'calca', 'jaqueta',
  'blusa', 'vestido', 'saia', 'short', 'bermuda', 'bone',
  'relogio', 'oculos', 'bolsa', 'mochila'
]);

/**
 * ✅ Remove acentos e normaliza lowercase
 */
function removeAccents(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * ✅ BUG FIX: Suporta milhar BR (3.000) e k (2.5k)
 */
function extractPriceValue(priceFilter: string): number | null {
  const normalized = priceFilter
    .toLowerCase()
    .replace(/\./g, ''); // Remove pontos de milhar (3.000 → 3000)

  const match = normalized.match(/(\d+(\,\d+)?)(k?)/);
  if (!match) return null;

  let value = parseFloat(match[1].replace(',', '.')); // 2,5 → 2.5

  if (match[3] === 'k') {
    value *= 1000;
  }

  return value;
}

/**
 * ✅ Verifica se é filtro de preço mínimo (case insensitive)
 */
function isMinPriceFilter(priceFilter: string): boolean {
  return priceFilter.toLowerCase().includes('acima');
}

/**
 * ✅ Normaliza storage e capacidade (256 gb → 256gb, 1 tera → 1tb, 500 giga → 500gb)
 */
export function normalizeStorage(storage: string): string {
  let normalized = storage.toLowerCase().replace(/\s+/g, '');
  
  // Normaliza unidades por extenso
  normalized = normalized
    .replace(/(\d+)\s*tera(s|bytes?)?/gi, '$1tb')
    .replace(/(\d+)\s*giga(s|bytes?)?/gi, '$1gb')
    .replace(/(\d+)\s*mega(s|bytes?)?/gi, '$1mb');
  
  return normalized;
}

/**
 * ✅ BUG FIX: Limpa localização (normaliza antes de remover UF)
 */
export function cleanLocation(location: string): string {
  const normalized = removeAccents(location);
  return normalized
    .split(/\s+/)
    .filter(p => !UFS.has(p))
    .join(' ');
}

/**
 * ✅ Verifica se categoria aceita gênero
 */
function shouldIncludeGender(baseQuery: string): boolean {
  const normalized = removeAccents(baseQuery);
  return Array.from(GENDER_CATEGORIES).some(cat => normalized.includes(cat));
}

/**
 * Mapeia resposta do usuário para formato da API
 */
function mapSortByToAPI(userChoice?: string): 'BEST_MATCH' | 'LOWEST_PRICE' | 'HIGHEST_PRICE' {
  if (!userChoice) return 'BEST_MATCH';
  
  const normalized = userChoice.toLowerCase();
  
  if (normalized.includes('menor') || normalized.includes('barato')) {
    return 'LOWEST_PRICE';
  }
  
  if (normalized.includes('maior') || normalized.includes('caro')) {
    return 'HIGHEST_PRICE';
  }
  
  return 'BEST_MATCH';
}

/**
 * Constrói query otimizada para Google Shopping Scraper
 * ORDEM: marca > produto > modelo > armazenamento > condição > localização
 * IMPORTANTE: Preço NÃO deve ir na query, apenas nos filtros do backend
 */
export function buildGoogleSearchQuery(
  baseQuery: string,
  filters: SearchFilters
): { query: string; sortBy: 'BEST_MATCH' | 'LOWEST_PRICE' | 'HIGHEST_PRICE'; minPrice?: number; maxPrice?: number } {
  const parts: string[] = [];
  
  // 1. ✅ Normaliza base query (lowercase + sem acentos + normaliza capacidades)
  let cleanBase = removeAccents(baseQuery.trim());
  cleanBase = normalizeStorage(cleanBase); // Normaliza "1 tera" → "1tb"
  parts.push(cleanBase);
  
  // 2. ✅ Adiciona armazenamento normalizado (ANTES da condição)
  if (filters.storage && filters.storage !== 'Tanto faz') {
    const normalized = normalizeStorage(filters.storage);
    parts.push(normalized);
  }
  
  // 3. Adiciona condição (remove acentos e normaliza)
  if (filters.condition && filters.condition !== 'Tanto faz') {
    const normalizedCondition = removeAccents(filters.condition.toLowerCase());
    // Mapear "seminovo" para "usado" no Google Shopping (mais resultados)
    const mappedCondition = normalizedCondition === 'seminovo' ? 'usado' : normalizedCondition;
    parts.push(mappedCondition);
  }
  
  // 4. PREÇO NÃO VAI NA QUERY - Extrair para filtro separado
  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  
  if (filters.priceMax) {
    const price = extractPriceValue(filters.priceMax);
    if (price) {
      if (isMinPriceFilter(filters.priceMax)) {
        minPrice = price;
      } else {
        maxPrice = price;
      }
    }
  }
  
  // 5. ✅ BUG FIX: Validação robusta de location (suporta "Nao", "NÃO", "Não quero")
  const loc = removeAccents(filters.location || '');
  if (loc && !loc.includes('nao')) {
    const cleaned = cleanLocation(filters.location!);
    if (cleaned) {
      parts.push(cleaned);
    }
  }
  
  // 6. ✅ Adiciona gênero APENAS se categoria aceita
  if (filters.gender && shouldIncludeGender(cleanBase)) {
    parts.push(removeAccents(filters.gender.toLowerCase()));
  }
  
  // ✅ Remove duplicatas de parts
  const uniqueParts = [...new Set(parts)];
  
  // ✅ Remove palavras ruins de cada part
  const cleanedParts = uniqueParts.map(part => {
    const words = part.split(/\s+/);
    const filtered = words.filter(w => !BAD_KEYWORDS.has(removeAccents(w)));
    return filtered.join(' ');
  }).filter(Boolean);
  
// ✅ FINAL DEDUPLICAÇÃO INTEGRADA (deduplica usando normalize local)
  const allTokens = cleanedParts.join(' ').split(/\s+/).filter(Boolean);
  const seenTokens = new Set<string>();
  const uniqueTokens: string[] = [];
  
  for (const token of allTokens) {
    const normalized = removeAccents(token);
    if (!seenTokens.has(normalized)) {
      seenTokens.add(normalized);
      uniqueTokens.push(token);
    }
  }
  
  for (const token of allTokens) {
    const normalized = removeAccents(token);
    if (!seenTokens.has(normalized)) {
      seenTokens.add(normalized);
      uniqueTokens.push(token);
    }
  }
  
  // Limita a 6 tokens (Google funciona melhor)
  const finalTokens = uniqueTokens.slice(0, 6);
  
  // ✅ Query fallback: se vazia, usa base query
  const finalQuery = finalTokens.length > 0 
    ? finalTokens.join(' ').trim()
    : cleanBase;
  
  return {
    query: finalQuery,
    sortBy: mapSortByToAPI(filters.sortBy),
    minPrice,
    maxPrice
  };
}

/**
 * Exemplo de uso:
 * 
 * buildGoogleSearchQuery('iphone 13 pro', {
 *   condition: 'Usado',
 *   storage: '256 gb',
 *   location: 'Belo Horizonte MG'
 * })
 * 
 * Resultado: { 
 *   query: "iphone 13 pro 256gb usado belo horizonte",
 *   sortBy: "BEST_MATCH"
 * }
 */
