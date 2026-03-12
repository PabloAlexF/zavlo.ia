// Normalizer avançado com tokenização, bigramas e trigramas
export function normalizeAndTokenize(query: string): { 
  normalized: string; 
  tokens: string[];
  bigrams: string[];
  trigrams: string[];
  allTokens: string[];
} {
  const normalized = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, ' ') // Remove pontuação
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim();
  
  const tokens = normalized.split(' ').filter(token => token.length > 0);
  
  // Gera bigramas ("air max", "galaxy s23", etc)
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  
  // Gera trigramas ("air max 97", "redmi note 12", "galaxy s 23")
  const trigrams: string[] = [];
  for (let i = 0; i < tokens.length - 2; i++) {
    trigrams.push(`${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`);
  }
  
  // Combina tokens + bigramas + trigramas
  const allTokens = [...tokens, ...bigrams, ...trigrams];
  
  return { normalized, tokens, bigrams, trigrams, allTokens };
}

// Normaliza plural (tenis/tenises → teni)
export function normalizePlural(word: string): string {
  if (word.endsWith('s') && word.length > 3) {
    return word.slice(0, -1);
  }
  return word;
}

// Sistema de sinônimos
const SYNONYMS: Record<string, string[]> = {
  celular: ['cel', 'celu', 'cell', 'phone'],
  telefone: ['phone', 'fone'],
  notebook: ['note', 'laptop', 'computador'],
  televisao: ['tv', 'televisao'],
  geladeira: ['refrigerador', 'frigobar'],
  fogao: ['fogao', 'cooktop'],
  carro: ['automovel', 'veiculo'],
  moto: ['motocicleta', 'bike']
};

// Detecta números de modelo (melhorado - detecta s23, a52, xps13)
export function detectModelNumber(normalized: string): string | null {
  // Padrão melhorado: detecta letras+números+letras (s23ultra, a52, xps13)
  const MODEL_PATTERN = /\b([a-z]*\d+[a-z]*)\b/i;
  const match = normalized.match(MODEL_PATTERN);
  
  if (match && match[1].length >= 2) {
    return match[1];
  }
  
  return null;
}

// Bigramas de modelos conhecidos (air max, galaxy s, redmi note)
const MODEL_BIGRAMS = new Set([
  'air max', 'air force', 'air jordan',
  'galaxy s', 'galaxy note', 'galaxy a',
  'redmi note', 'poco x', 'poco f',
  'iphone pro', 'iphone plus', 'iphone max', 'iphone mini',
  'macbook air', 'macbook pro',
  'thinkpad x', 'thinkpad t',
  'inspiron 15', 'inspiron 14'
]);

// Trigramas de modelos conhecidos (air max 97, redmi note 12)
const MODEL_TRIGRAMS = new Set([
  'air max 97', 'air max 90', 'air max 270',
  'redmi note 12', 'redmi note 11', 'redmi note 10',
  'galaxy s 23', 'galaxy s 22', 'galaxy s 21',
  'iphone 13 pro', 'iphone 14 pro', 'iphone 15 pro'
]);

// Detecta modelo via trigrama composto
export function detectModelTrigram(trigrams: string[]): string | null {
  for (const trigram of trigrams) {
    if (MODEL_TRIGRAMS.has(trigram)) {
      return trigram;
    }
  }
  return null;
}

// Detecta modelo via bigrama composto
export function detectModelBigram(bigrams: string[]): string | null {
  for (const bigram of bigrams) {
    if (MODEL_BIGRAMS.has(bigram)) {
      return bigram;
    }
  }
  return null;
}

// Expande tokens com sinônimos (bidirecional) + normaliza plural
export function expandWithSynonyms(tokens: string[]): string[] {
  const expanded = [...tokens];
  
  for (const token of tokens) {
    // Normaliza plural antes de expandir
    const normalized = normalizePlural(token);
    if (normalized !== token) {
      expanded.push(normalized);
    }
    
    for (const [main, synonyms] of Object.entries(SYNONYMS)) {
      // Main → sinônimos
      if (token === main || normalized === main) {
        expanded.push(...synonyms);
      }
      // Sinônimo → main
      if (synonyms.includes(token) || synonyms.includes(normalized)) {
        expanded.push(main);
      }
    }
  }
  
  return [...new Set(expanded)]; // Remove duplicatas
}