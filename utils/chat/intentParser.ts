// Intent Parser - Extrai entidades estruturadas da query
import { normalizeAndTokenize, detectModelNumber, detectModelBigram, detectModelTrigram, expandWithSynonyms } from './advancedNormalizer';
import { detectProductCategory } from './categorySystem';
import { detectProductEntity } from './brandDetector';

export interface ProductIntent {
  category?: string;
  brand?: string;
  model?: string;
  gender?: string;
  size?: string;
  color?: string;
  storage?: string;
  condition?: string;
  material?: string;
  type?: string;
  confidence?: number; // Score de confiança (0-1)
}

// Cores comuns (português + inglês)
const COLORS = new Set([
  'preto', 'branco', 'vermelho', 'azul', 'verde', 'amarelo',
  'cinza', 'rosa', 'roxo', 'laranja', 'marrom', 'bege',
  'dourado', 'prateado', 'bronze',
  'black', 'white', 'red', 'blue', 'green', 'yellow',
  'gray', 'grey', 'pink', 'purple', 'orange', 'brown'
]);

// Tradução de cores (inglês → português)
const COLOR_TRANSLATIONS: Record<string, string> = {
  'black': 'Preto',
  'white': 'Branco',
  'red': 'Vermelho',
  'blue': 'Azul',
  'green': 'Verde',
  'yellow': 'Amarelo',
  'gray': 'Cinza',
  'grey': 'Cinza',
  'pink': 'Rosa',
  'purple': 'Roxo',
  'orange': 'Laranja',
  'brown': 'Marrom'
};

// Categorias que suportam cor
const COLOR_CATEGORIES = new Set([
  'calcado_roupa', 'movel', 'acessorio', 'eletronico'
]);

// Materiais comuns (limitado por categoria)
const MATERIALS = new Set([
  'couro', 'tecido', 'algodao', 'poliester', 'nylon',
  'madeira', 'metal', 'plastico', 'vidro', 'aco'
]);

// Categorias que suportam material
const MATERIAL_CATEGORIES = new Set([
  'movel', 'calcado_roupa', 'acessorio'
]);

// Tipos de móveis
const FURNITURE_TYPES = [
  'cadeira gamer', 'cadeira escritorio', 'cadeira office',
  'mesa gamer', 'mesa escritorio', 'mesa jantar',
  'sofa', 'sofá', 'cama box', 'cama solteiro', 'cama casal'
];

// Detecta tamanho de calçado (34-46 - range expandido)
function detectSize(allTokens: string[]): string | undefined {
  const SIZE_PATTERN = /^(3[4-9]|4[0-6])$/;
  
  for (const token of allTokens) {
    if (SIZE_PATTERN.test(token)) {
      return token;
    }
  }
}

// Detecta cor (usa allTokens para incluir bigramas + traduz inglês)
function detectColor(allTokens: string[], category: string): string | undefined {
  if (!COLOR_CATEGORIES.has(category)) return;
  
  for (const token of allTokens) {
    if (COLORS.has(token)) {
      // Traduz se for inglês
      if (COLOR_TRANSLATIONS[token]) {
        return COLOR_TRANSLATIONS[token];
      }
      // Capitaliza se for português
      return token.charAt(0).toUpperCase() + token.slice(1);
    }
  }
}

// Detecta gênero (usa normalized direto - consistência)
function detectGender(normalized: string): string | undefined {
  if (/\b(masculino|masculina|homem|para homem|men)\b/i.test(normalized)) {
    return 'Masculino';
  }
  
  if (/\b(feminino|feminina|mulher|para mulher|women)\b/i.test(normalized)) {
    return 'Feminino';
  }
  
  if (/\b(unissex|unisex)\b/i.test(normalized)) {
    return 'Unissex';
  }
}

// Detecta armazenamento (apenas valores válidos)
function detectStorage(normalized: string): string | undefined {
  const STORAGE_PATTERN = /\b(64|128|256|512|1024)\s*gb\b/i;
  const match = normalized.match(STORAGE_PATTERN);
  
  if (!match) return;
  
  const size = match[1];
  return size === '1024' ? '1TB' : `${size}GB`;
}

// Detecta condição (usa normalized direto - consistência)
function detectCondition(normalized: string): string | undefined {
  if (/\b(novo|nova|novos|novas|lacrado|lacrada)\b/i.test(normalized)) {
    return 'Novo';
  }
  
  if (/\b(usado|usada|usados|usadas|seminovo|seminova)\b/i.test(normalized)) {
    return 'Usado';
  }
}

// Detecta material (usa allTokens para incluir bigramas)
function detectMaterial(allTokens: string[], category: string): string | undefined {
  if (!MATERIAL_CATEGORIES.has(category)) return;
  
  for (const token of allTokens) {
    if (MATERIALS.has(token)) {
      return token.charAt(0).toUpperCase() + token.slice(1);
    }
  }
}

// Detecta tipo de móvel
function detectFurnitureType(normalized: string): string | undefined {
  for (const type of FURNITURE_TYPES) {
    if (normalized.includes(type)) {
      return type.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
}

// Parser principal (otimizado com trigramas, sinônimos e confidence scoring)
export function parseProductIntent(query: string): ProductIntent {
  const { normalized, tokens, bigrams, trigrams, allTokens } = normalizeAndTokenize(query);
  const intent: ProductIntent = {};
  
  // Expande tokens com sinônimos (cel → celular, phone → telefone)
  const expandedTokens = expandWithSynonyms(tokens);
  // Remove duplicatas ao combinar
  const allExpandedTokens = [...new Set([...allTokens, ...expandedTokens])];
  
  // Scores de confiança para cada campo
  const confidenceScores: number[] = [];
  
  // Categoria
  intent.category = detectProductCategory(query);
  if (intent.category && intent.category !== 'generico') {
    confidenceScores.push(0.9);
  } else {
    confidenceScores.push(0.5);
  }
  
  // Marca e modelo (brandDetector)
  const entity = detectProductEntity(query);
  if (entity.brand) {
    intent.brand = entity.brand;
    confidenceScores.push(0.95);
  }
  if (entity.model) {
    intent.model = entity.model;
    confidenceScores.push(0.9);
  }
  
  // Fallback 1: detecta modelo via trigrama composto (air max 97, redmi note 12)
  if (!intent.model) {
    const modelTrigram = detectModelTrigram(trigrams);
    if (modelTrigram) {
      intent.model = modelTrigram.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      confidenceScores.push(0.85);
    }
  }
  
  // Fallback 2: detecta modelo via bigrama composto (air max, galaxy s)
  if (!intent.model) {
    const modelBigram = detectModelBigram(bigrams);
    if (modelBigram) {
      intent.model = modelBigram.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      confidenceScores.push(0.8);
    }
  }
  
  // Fallback 3: detecta modelo via número (s23, a52, xps13)
  if (!intent.model) {
    const modelNumber = detectModelNumber(normalized);
    if (modelNumber) {
      intent.model = modelNumber.toUpperCase();
      confidenceScores.push(0.7);
    }
  }
  
  // Gênero (usa normalized - consistência)
  const gender = detectGender(normalized);
  if (gender) {
    intent.gender = gender;
    confidenceScores.push(0.85);
  }
  
  // Tamanho (apenas calçados - usa allExpandedTokens)
  if (intent.category === 'calcado_roupa') {
    const size = detectSize(allExpandedTokens);
    if (size) {
      intent.size = size;
      confidenceScores.push(0.9);
    }
  }
  
  // Cor (limitado por categoria - usa allExpandedTokens)
  const color = detectColor(allExpandedTokens, intent.category || 'generico');
  if (color) {
    intent.color = color;
    confidenceScores.push(0.8);
  }
  
  // Armazenamento (apenas smartphone/notebook)
  if (intent.category === 'smartphone' || intent.category === 'notebook') {
    const storage = detectStorage(normalized);
    if (storage) {
      intent.storage = storage;
      confidenceScores.push(0.95);
    }
  }
  
  // Condição (usa normalized - consistência)
  const condition = detectCondition(normalized);
  if (condition) {
    intent.condition = condition;
    confidenceScores.push(0.9);
  }
  
  // Material (limitado por categoria - usa allExpandedTokens)
  const material = detectMaterial(allExpandedTokens, intent.category || 'generico');
  if (material) {
    intent.material = material;
    confidenceScores.push(0.75);
  }
  
  // Tipo de móvel
  if (intent.category === 'movel') {
    const type = detectFurnitureType(normalized);
    if (type) {
      intent.type = type;
      confidenceScores.push(0.85);
    }
  }
  
  // Calcula confiança média (0-1)
  if (confidenceScores.length > 0) {
    const avgConfidence = confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length;
    intent.confidence = Math.round(avgConfidence * 100) / 100;
  } else {
    intent.confidence = 0.5; // Confiança baixa se nada foi detectado
  }
  
  return intent;
}

// Calcula completude da query (0-100%)
export function getQueryCompleteness(intent: ProductIntent): number {
  const REQUIRED_FIELDS: Record<string, string[]> = {
    calcado_roupa: ['gender', 'size', 'condition'],
    smartphone: ['storage', 'condition'],
    notebook: ['storage', 'condition'],
    movel: ['type', 'condition'],
    eletrodomestico: ['condition'],
    veiculo: ['condition'],
    eletronico: ['condition'],
    acessorio: ['condition'],
    generico: ['condition']
  };
  
  const required = REQUIRED_FIELDS[intent.category || 'generico'] || ['condition'];
  const provided = required.filter(field => intent[field as keyof ProductIntent]);
  
  return Math.round((provided.length / required.length) * 100);
}

// Retorna campos faltantes
export function getMissingFields(intent: ProductIntent): string[] {
  const REQUIRED_FIELDS: Record<string, string[]> = {
    calcado_roupa: ['gender', 'size', 'condition'],
    smartphone: ['storage', 'condition'],
    notebook: ['storage', 'condition'],
    movel: ['type', 'condition'],
    eletrodomestico: ['condition'],
    veiculo: ['condition'],
    eletronico: ['condition'],
    acessorio: ['condition'],
    generico: ['condition']
  };
  
  const required = REQUIRED_FIELDS[intent.category || 'generico'] || ['condition'];
  return required.filter(field => !intent[field as keyof ProductIntent]);
}
