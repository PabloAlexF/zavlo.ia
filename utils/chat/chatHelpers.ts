// ============================================
// CHAT HELPERS - ARQUITETURA PROFISSIONAL
// ============================================
// Arquivo: utils/chat/chatHelpers.ts

/**
 * Normaliza input do usuário removendo acentos e convertendo para lowercase
 * Resolve: "preço" vs "preco" vs "Preço" vs "PREÇO"
 */
export function normalizeInput(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Extrai o primeiro número encontrado em uma string
 * Permite: "quero 20", "mostre 50 produtos", "100"
 */
export function extractNumber(input: string): number | null {
  const match = input.match(/\d+/);
  return match ? Number(match[0]) : null;
}

/**
 * Extrai range de preço de texto livre
 * Exemplos:
 * - "até 100" → { max: 100 }
 * - "acima de 500" → { min: 500 }
 * - "entre 100 e 500" → { min: 100, max: 500 }
 * - "de 100 a 500" → { min: 100, max: 500 }
 */
export function extractPriceRange(input: string): { min?: number; max?: number } | null {
  const normalized = normalizeInput(input);
  
  // Padrão: "até X" ou "ate X"
  const upToMatch = normalized.match(/(?:ate|até)\s*(?:r\$)?\s*(\d+)/);
  if (upToMatch) {
    return { min: 0, max: Number(upToMatch[1]) };
  }
  
  // Padrão: "acima de X" ou "mais de X"
  const aboveMatch = normalized.match(/(?:acima|mais)\s*de\s*(?:r\$)?\s*(\d+)/);
  if (aboveMatch) {
    return { min: Number(aboveMatch[1]) };
  }
  
  // Padrão: "entre X e Y" ou "de X a Y"
  const rangeMatch = normalized.match(/(?:entre|de)\s*(?:r\$)?\s*(\d+)\s*(?:e|a|ate|até)\s*(?:r\$)?\s*(\d+)/);
  if (rangeMatch) {
    return { min: Number(rangeMatch[1]), max: Number(rangeMatch[2]) };
  }
  
  return null;
}

/**
 * Valida se um número está dentro das opções permitidas
 */
export function validateLimit(value: number): boolean {
  return [10, 20, 50, 100].includes(value);
}

/**
 * Mapeia input do usuário para valor de ordenação
 * Aceita números (1-3) e texto descritivo
 */
export function parseSortInput(input: string): string | null {
  const normalized = normalizeInput(input);
  
  const sortMap: Record<string, string> = {
    '1': 'relevance',
    'relevancia': 'relevance',
    'mais relevantes': 'relevance',
    'relevante': 'relevance',
    '2': 'price_low_to_high',
    'menor': 'price_low_to_high',
    'menor preco': 'price_low_to_high',
    'mais barato': 'price_low_to_high',
    'barato': 'price_low_to_high',
    '3': 'price_high_to_low',
    'maior': 'price_high_to_low',
    'maior preco': 'price_high_to_low',
    'mais caro': 'price_high_to_low',
    'caro': 'price_high_to_low'
  };
  
  return sortMap[normalized] || null;
}

/**
 * Mapeia input do usuário para limite de produtos
 * Aceita números diretos e texto descritivo
 */
export function parseLimitInput(input: string): number | null {
  const normalized = normalizeInput(input);
  
  // Tentar extrair número primeiro
  const number = extractNumber(normalized);
  if (number && validateLimit(number)) {
    return number;
  }
  
  // Fallback para mapeamento de texto
const limitMap: Record<string, number> = {
    '1': 10,
    'dez': 10,
    '10': 10,
    '2': 20,
    'vinte': 20,
    '20': 20,
    '3': 50,
    'cinquenta': 50,
    '50': 50,
    '4': 100,
    'cem': 100,
    '100': 100
  };
  
  return limitMap[normalized] || null;
}

/**
 * Mapeia input do usuário para faixa de preço
 * Aceita números (1-5) e texto descritivo
 */
export function parsePriceRangeInput(input: string): { min?: number; max?: number; label: string } | null {
  const normalized = normalizeInput(input);
  
  // Definir ranges
  const priceRanges = [
    { id: '1', min: 0, max: 100, label: 'Até R$100', keywords: ['ate 100', 'ate r$100'] },
    { id: '2', min: 100, max: 500, label: 'R$100 - R$500', keywords: ['100 a 500', '100-500', 'r$100 - r$500'] },
    { id: '3', min: 500, max: 1000, label: 'R$500 - R$1000', keywords: ['500 a 1000', '500-1000', 'r$500 - r$1000'] },
    { id: '4', min: 1000, label: 'Acima de R$1000', keywords: ['acima de 1000', 'mais de 1000', 'acima de r$1000'] },
    { id: '5', label: 'Sem filtro de preço', keywords: ['sem filtro', 'qualquer', 'qualquer preco', 'tanto faz'] }
  ];
  
  // Tentar match por ID
  const rangeById = priceRanges.find(r => r.id === normalized);
  if (rangeById) {
    return { min: rangeById.min, max: rangeById.max, label: rangeById.label };
  }
  
  // Tentar match por keywords
  for (const range of priceRanges) {
    if (range.keywords?.some(keyword => normalized.includes(keyword))) {
      return { min: range.min, max: range.max, label: range.label };
    }
  }
  
  // Tentar extrair range do texto livre
  const extracted = extractPriceRange(input);
  if (extracted) {
    const label = extracted.max 
      ? `Até R$${extracted.max}`
      : `Acima de R$${extracted.min}`;
    return { ...extracted, label };
  }
  
  return null;
}

/**
 * Labels amigáveis para ordenação
 */
export const SORT_LABELS: Record<string, string> = {
  'relevance': 'Relevância',
  'price_low_to_high': 'Menor preço',
  'price_high_to_low': 'Maior preço'
};

/**
 * Gera mensagem de erro amigável baseada no estado
 */
export function getErrorMessage(state: string): string {
  const errorMessages: Record<string, string> = {
    'awaiting_sort': '❓ Não entendi. Por favor, escolha:\n\n1️⃣ Mais relevantes\n2️⃣ Menor preço\n3️⃣ Maior preço',
    'awaiting_limit': '❓ Não entendi. Por favor, escolha:\n\n1️⃣ 10 produtos\n2️⃣ 20 produtos\n3️⃣ 50 produtos\n4️⃣ 100 produtos',
    'awaiting_price_range': '❓ Não entendi. Por favor, escolha:\n\n1️⃣ Até R$100\n2️⃣ R$100 - R$500\n3️⃣ R$500 - R$1000\n4️⃣ Acima de R$1000\n5️⃣ Sem filtro de preço'
  };
  
  return errorMessages[state] || '❓ Não entendi. Tente novamente.';
}
