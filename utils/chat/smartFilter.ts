// ============================================
// AI SMART FILTER - EXTRAÇÃO AUTOMÁTICA
// ============================================
// Arquivo: utils/chat/smartFilter.ts

import { normalizeInput, extractPriceRange } from './chatHelpers';

export interface SmartFilters {
  product: string;
  condition?: 'novo' | 'usado' | 'ambos';
  location?: string;
  sortBy?: 'relevance' | 'price_low_to_high' | 'price_high_to_low';
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Extrai filtros automaticamente do texto do usuário
 * Exemplo: "iphone novo até 2000 reais em são paulo"
 * Retorna: { product: "iphone", condition: "novo", maxPrice: 2000, location: "são paulo" }
 */
export function extractSmartFilters(input: string): SmartFilters {
  const normalized = normalizeInput(input);
  let product = input.trim();
  const filters: SmartFilters = { product };
  
  // 1. EXTRAIR CONDIÇÃO (novo/usado)
  const conditionPatterns = [
    { pattern: /\b(novo|novos|nova|novas)\b/i, value: 'novo' as const },
    { pattern: /\b(usado|usados|usada|usadas|seminovo|seminovos)\b/i, value: 'usado' as const }
  ];
  
  for (const { pattern, value } of conditionPatterns) {
    if (pattern.test(normalized)) {
      filters.condition = value;
      product = product.replace(pattern, '').trim();
      break;
    }
  }
  
  // 2. EXTRAIR PREÇO
  const priceRange = extractPriceRange(input);
  if (priceRange) {
    filters.minPrice = priceRange.min;
    filters.maxPrice = priceRange.max;
    
    // Remover expressões de preço do produto
    product = product
      .replace(/\b(?:ate|até)\s*(?:r\$)?\s*\d+(?:\s*reais)?/gi, '')
      .replace(/\b(?:acima|mais)\s*de\s*(?:r\$)?\s*\d+(?:\s*reais)?/gi, '')
      .replace(/\b(?:entre|de)\s*(?:r\$)?\s*\d+\s*(?:e|a|ate|até)\s*(?:r\$)?\s*\d+(?:\s*reais)?/gi, '')
      .trim();
  }
  
  // 3. EXTRAIR LOCALIZAÇÃO
  const locationPatterns = [
    /\b(?:em|de|para)\s+(são paulo|sp|rio de janeiro|rj|minas gerais|mg|brasília|df|bahia|ba|paraná|pr|rio grande do sul|rs|pernambuco|pe|ceará|ce|santa catarina|sc)\b/i,
    /\b(são paulo|rio de janeiro|minas gerais|brasília|salvador|curitiba|porto alegre|recife|fortaleza|florianópolis)\b/i
  ];
  
  for (const pattern of locationPatterns) {
    const match = input.match(pattern);
    if (match) {
      filters.location = match[1] || match[0];
      product = product.replace(pattern, '').trim();
      break;
    }
  }
  
  // 4. EXTRAIR ORDENAÇÃO
  const sortPatterns = [
    { pattern: /\b(?:mais barato|menor preco|menor preço|barato)\b/i, value: 'price_low_to_high' as const },
    { pattern: /\b(?:mais caro|maior preco|maior preço|caro)\b/i, value: 'price_high_to_low' as const }
  ];
  
  for (const { pattern, value } of sortPatterns) {
    if (pattern.test(normalized)) {
      filters.sortBy = value;
      product = product.replace(pattern, '').trim();
      break;
    }
  }
  
  // 5. EXTRAIR QUANTIDADE
  const limitPatterns = [
    { pattern: /\b(10|dez)\s*(?:produtos|itens|resultados)?\b/i, value: 10 },
    { pattern: /\b(20|vinte)\s*(?:produtos|itens|resultados)?\b/i, value: 20 },
    { pattern: /\b(50|cinquenta)\s*(?:produtos|itens|resultados)?\b/i, value: 50 },
    { pattern: /\b(100|cem)\s*(?:produtos|itens|resultados)?\b/i, value: 100 }
  ];
  
  for (const { pattern, value } of limitPatterns) {
    if (pattern.test(normalized)) {
      filters.limit = value;
      product = product.replace(pattern, '').trim();
      break;
    }
  }
  
  // 6. LIMPAR PRODUTO (remover palavras de ligação)
  product = product
    .replace(/\b(?:quero|buscar|procurar|encontrar|ver|mostrar|me mostre|preciso)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  filters.product = product;
  
  return filters;
}

/**
 * Verifica se o input tem filtros suficientes para pular perguntas
 * Retorna quais perguntas ainda precisam ser feitas
 */
export function getMissingFilters(filters: SmartFilters): string[] {
  const missing: string[] = [];
  
  if (!filters.condition) missing.push('condition');
  if (!filters.sortBy) missing.push('sort');
  if (!filters.limit) missing.push('limit');
  if (filters.minPrice === undefined && filters.maxPrice === undefined) {
    missing.push('price');
  }
  
  return missing;
}

/**
 * Gera mensagem de confirmação dos filtros detectados
 */
export function generateFilterConfirmation(filters: SmartFilters): string {
  const parts: string[] = [];
  
  parts.push(`🔍 Produto: **${filters.product}**`);
  
  if (filters.condition) {
    const conditionLabel = filters.condition === 'novo' ? 'Novo' : 'Usado';
    parts.push(`📦 Condição: ${conditionLabel}`);
  }
  
  if (filters.location) {
    parts.push(`📍 Localização: ${filters.location}`);
  }
  
  if (filters.sortBy) {
    const sortLabels = {
      'relevance': 'Relevância',
      'price_low_to_high': 'Menor preço',
      'price_high_to_low': 'Maior preço'
    };
    parts.push(`🔄 Ordenação: ${sortLabels[filters.sortBy]}`);
  }
  
  if (filters.limit) {
    parts.push(`🔢 Quantidade: ${filters.limit} produtos`);
  }
  
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    if (filters.maxPrice && !filters.minPrice) {
      parts.push(`💰 Preço: Até R$${filters.maxPrice}`);
    } else if (filters.minPrice && !filters.maxPrice) {
      parts.push(`💰 Preço: Acima de R$${filters.minPrice}`);
    } else if (filters.minPrice && filters.maxPrice) {
      parts.push(`💰 Preço: R$${filters.minPrice} - R$${filters.maxPrice}`);
    }
  }
  
  return parts.join('\n');
}

/**
 * Exemplos de uso para testes
 */
export const SMART_FILTER_EXAMPLES = [
  {
    input: 'iphone 15 pro novo até 5000 reais em são paulo',
    expected: {
      product: 'iphone 15 pro',
      condition: 'novo',
      maxPrice: 5000,
      location: 'são paulo'
    }
  },
  {
    input: 'notebook gamer usado mais barato',
    expected: {
      product: 'notebook gamer',
      condition: 'usado',
      sortBy: 'price_low_to_high'
    }
  },
  {
    input: 'tênis nike entre 200 e 500 reais 20 produtos',
    expected: {
      product: 'tênis nike',
      minPrice: 200,
      maxPrice: 500,
      limit: 20
    }
  },
  {
    input: 'smart tv acima de 1000',
    expected: {
      product: 'smart tv',
      minPrice: 1000
    }
  }
];
