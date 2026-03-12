// Sistema de categorização inteligente de produtos
export interface ProductCategory {
  name: string;
  keywords: string[];
  patterns: RegExp[];
  questions: CategoryQuestion[];
}

export interface CategoryQuestion {
  id: string;
  question: string;
  type: 'choice' | 'text' | 'number';
  options?: string[];
  required: boolean;
  conditions?: string[]; // e.g., ['smartphone'] - only ask if category matches
}


// Categorias com detecção robusta
export const PRODUCT_CATEGORIES: Record<string, ProductCategory> = {
  smartphone: {
    name: 'Smartphone',
    keywords: ['iphone', 'samsung', 'xiaomi', 'motorola', 'celular', 'smartphone', 'telefone', 'galaxy', 'redmi', 'cel', 'cell', 'android', 'ios'],
    patterns: [
      /\biphone\s?\d+/i, 
      /\bgalaxy\s?(s\d+|note|a\d+|j\d+)/i, 
      /\bredmi\s?(note|\d+)/i, 
      /\bmoto\s?g\d+/i, 
      /\bcelular\b/i,
      /\bsmartphone\b/i
    ],
    questions: [
      {
        id: 'storage',
        question: 'Qual capacidade de armazenamento?',
        type: 'choice',
        options: ['64GB', '128GB', '256GB', '512GB', '1TB', 'Tanto faz'],
        required: false
      },
      {
        id: 'condition',
        question: 'Produto novo ou usado?',
        type: 'choice',
        options: ['Novo', 'Usado', 'Tanto faz'],
        required: true
      }
    ]
  },
  
  notebook: {
    name: 'Notebook',
    keywords: ['notebook', 'laptop', 'macbook'],
    patterns: [/\bnotebook\b/i, /\blaptop\b/i, /\bmacbook\b/i],
    questions: [
      {
        id: 'usage',
        question: 'Para que você vai usar?',
        type: 'choice',
        options: ['Trabalho/Estudos', 'Jogos', 'Design/Edição', 'Uso básico'],
        required: false
      },
      {
        id: 'condition',
        question: 'Produto novo ou usado?',
        type: 'choice',
        options: ['Novo', 'Usado', 'Tanto faz'],
        required: true
      }
    ]
  },

  eletrodomestico: {
    name: 'Eletrodoméstico',
    keywords: ['geladeira', 'fogao', 'microondas', 'secadora', 'freezer', 'brastemp', 'consul', 'electrolux'],
    patterns: [/\bgeladeira\b/i, /\bfog[aã]o\b/i, /\bmicroondas\b/i, /\blava[-\s]?(roupa|louça)/i],
    questions: [
      {
        id: 'brand_preference',
        question: 'Tem preferência de marca?',
        type: 'choice',
        options: ['Brastemp', 'Consul', 'Electrolux', 'LG', 'Samsung', 'Nenhuma dessas marcas'],
        required: false
      },
      {
        id: 'condition',
        question: 'Produto novo ou usado?',
        type: 'choice',
        options: ['Novo', 'Usado', 'Tanto faz'],
        required: true
      }
    ]
  },

  movel: {
    name: 'Móvel',
    keywords: ['sofa', 'mesa', 'cadeira', 'cama', 'guarda', 'armario', 'estante', 'poltrona', 'banco', 'escrivaninha', 'rack', 'comoda', 'painel', 'criado', 'closet'],
    patterns: [/\bcadeira\s*(gamer|escritorio|office)/i, /\bmesa\s*(gamer|escritorio|jantar)/i, /\bsof[aá]\b/i, /\bcama\s*(box|solteiro|casal)/i, /\brack\s*(tv)?/i, /\bpainel\s*(tv)?/i],
    questions: [
      {
        id: 'type',
        question: 'Que tipo específico?',
        type: 'choice',
        options: ['Cadeira gamer', 'Cadeira escritório', 'Mesa gamer', 'Mesa escritório', 'Sofá', 'Cama', 'Outro'],
        required: false
      },
      {
        id: 'condition',
        question: 'Produto novo ou usado?',
        type: 'choice',
        options: ['Novo', 'Usado', 'Tanto faz'],
        required: true
      }
    ]
  },

  veiculo: {
    name: 'Veículo',
    keywords: ['carro', 'motocicleta', 'bicicleta', 'bike', 'automovel', 'veiculo', 'moto'],
    patterns: [
      /\b(carro|automovel|veiculo)\b/i, 
      /\b(moto|motocicleta)\b/i, 
      /\bbicicleta\b/i,
      /\b(honda|toyota|ford|vw|chevrolet)\s+(civic|corolla|gol|onix|fit|city)/i,
      /\bcarro\s+(honda|toyota|ford|vw|chevrolet)/i,
      /\bmoto\s+(honda|yamaha|suzuki)/i
    ],
    questions: [
      {
        id: 'condition',
        question: 'Produto novo ou usado?',
        type: 'choice',
        options: ['Novo', 'Usado', 'Tanto faz'],
        required: true
      }
    ]
  },

  eletronico: {
    name: 'Eletrônico',
    keywords: ['televisao', 'monitor', 'fone', 'headset', 'mouse', 'teclado', 'camera', 'playstation', 'xbox', 'nintendo', 'airpods', 'ipad'],
    patterns: [
      /\b(tv|televisao)\s?\d{2}/i, 
      /\bmonitor\s?\d{2}/i,
      /\bfone\s*(ouvido|bluetooth)?/i, 
      /\b(playstation|xbox|nintendo)\b/i,
      /\b(airpods|ipad)\b/i,
      /\btv\b/i,
      /\bmonitor\b/i
    ],
    questions: [
      {
        id: 'type',
        question: 'Que tipo de eletrônico?',
        type: 'choice',
        options: ['TV/Monitor', 'Fone de ouvido', 'Periféricos', 'Console/Games', 'Outro'],
        required: false
      },
      {
        id: 'condition',
        question: 'Produto novo ou usado?',
        type: 'choice',
        options: ['Novo', 'Usado', 'Tanto faz'],
        required: true
      }
    ]
  },

  calcado_roupa: {
    name: 'Calçado/Roupa',
    keywords: ['tenis', 'tênis', 'sapato', 'bota', 'sandalia', 'chinelo', 'camisa', 'camiseta', 'calça', 'jaqueta', 'blusa', 'vestido', 'saia', 'shorts', 'corrida', 'esporte', 'cloudrunner', 'waterproof', 'running', 'trail', 'casual', 'chuteira', 'sapatilha'],
    patterns: [
      /\bt[eê]nis\b/i,
      /\bt[eê]nis\s+(de\s+)?(corrida|esporte|caminhada|treino)/i,
      /\bsapato\b/i,
      /\bbota\b/i,
      /\bcamisa\b/i,
      /\bcamiseta\b/i,
      /\bcalça\b/i,
      /\b(cloudrunner|waterproof|running|trail)\b/i,
      /\bchuteira\b/i
    ],
    questions: [
      {
        id: 'gender',
        question: 'Para quem é o produto?',
        type: 'choice',
        options: ['Masculino', 'Feminino', 'Unissex', 'Tanto faz'],
        required: false
      },
      {
        id: 'condition',
        question: 'Produto novo ou usado?',
        type: 'choice',
        options: ['Novo', 'Usado', 'Tanto faz'],
        required: true
      },
      {
        id: 'sort_by',
        question: 'Como quer ordenar os resultados?',
        type: 'choice',
        options: ['Mais relevantes', 'Menor preço', 'Maior preço'],
        required: false
      }
    ]
  },

  acessorio: {
    name: 'Acessório',
    keywords: ['oculos', 'óculos', 'luz azul', 'anti luz', 'óculos de grau', 'óculos solar', 'relogio', 'relógio', 'bolsa', 'mochila', 'carteira', 'cinto', 'bone', 'boné', 'chapeu', 'chapéu', 'luva', 'cachecol', 'gravata', 'pulseira', 'colar', 'brinco', 'anel'],
    patterns: [
      /\b[oó]culos\b.*?(luz\s+azul|anti\s+luz|grau|sol|degrau)/i,
      /\banti[- ]?luz\b/i,
      /\b[lL]uz\s+[aA]zul\b/i,
      /\b[oó]culos\b/i,
      /\brel[oó]gio\b/i,
      /\bbolsa\b/i,
      /\bmochila\b/i,
      /\bbon[eé]\b/i,
      /\bchap[eé]u\b/i
    ],
    questions: [
      {
        id: 'condition',
        question: 'Produto novo ou usado?',
        type: 'choice',
        options: ['Novo', 'Usado', 'Tanto faz'],
        required: false,
        conditions: ['acessorio']
      }
    ]
  },

  // universal removido - categoria catch-all perigosa que matcha tudo

  generico: {
    name: 'Produto',
    keywords: [],
    patterns: [],
    questions: [
      {
        id: 'condition',
        question: 'Produto novo ou usado?',
        type: 'choice',
        options: ['Novo', 'Usado', 'Tanto faz'],
        required: false
      }
    ]
  }
};


import { normalizeAndTokenize, expandWithSynonyms } from './advancedNormalizer';
import { detectProductEntity } from './brandDetector';

// Stopwords para filtrar tokens inúteis
const STOPWORDS = new Set([
  'quero', 'comprar', 'buscar', 'procurar', 'um', 'uma', 'de', 'para', 'com', 'me', 'mostra', 'mostrar'
]);

// Modelos específicos de produtos (detecção prioritária)
const PRODUCT_MODEL_PATTERNS: Record<string, RegExp[]> = {
  calcado_roupa: [
    /\bcloudrunner\s?\d*\b/i,
    /\bcloud\s?runner\s?\d*\b/i,
    /\bultraboost\s?\d*\b/i,
    /\bair\s?max\s?\d*\b/i,
    /\bpegasus\s?\d*\b/i,
    /\brevolution\s?\d*\b/i,
    /\breact\s?\d*\b/i
  ],
  smartphone: [
    /\biphone\s?(1[0-9]|[6-9])(\s?(pro|max|plus|mini))?\b/i,
    /\bgalaxy\s?s\d+(\s?(ultra|plus))?\b/i,
    /\bredmi\s?note\s?\d*\b/i
  ],
  notebook: [
    /\bmacbook(\s?(air|pro))?\b/i,
    /\bthinkpad\b/i,
    /\binspiron\b/i
  ]
};

// Objetos que SEMPRE indicam acessório (override forte)
const HARD_ACCESSORY_OBJECTS = new Set([
  'capa', 'case', 'capinha', 'cover',
  'carregador', 'fonte', 'adaptador',
  'pelicula', 'película', 'protetor',
  'cabo', 'fio',
  'suporte', 'base'
]);

// Dispositivos que podem ser eletrônicos OU acessórios (não forçar override)
const DEVICE_ACCESSORIES = new Set([
  'mouse', 'teclado', 'mousepad',
  'fone', 'headset', 'earphone'
]);

// Pré-filtro: tokens que indicam categoria (performance)
const CATEGORY_TOKEN_HINTS: Record<string, Set<string>> = {
  smartphone: new Set(['iphone', 'celular', 'galaxy', 'redmi', 'smartphone', 'telefone', 'android', 'ios']),
  notebook: new Set(['notebook', 'laptop', 'macbook', 'thinkpad', 'inspiron']),
  calcado_roupa: new Set(['tenis', 'sapato', 'bota', 'sandalia', 'chinelo', 'camisa', 'calça', 'cloudrunner', 'airmax', 'air', 'max', 'ultraboost', 'pegasus', 'revolution', 'react']),
  eletronico: new Set(['tv', 'televisao', 'monitor', 'playstation', 'xbox', 'nintendo', 'airpods', 'ipad', 'mouse', 'teclado', 'fone', 'headset']),
  eletrodomestico: new Set(['geladeira', 'fogao', 'microondas', 'secadora', 'freezer']),
  movel: new Set(['sofa', 'mesa', 'cadeira', 'cama', 'guarda', 'armario', 'estante', 'rack']),
  veiculo: new Set(['carro', 'moto', 'bicicleta', 'bike', 'automovel', 'veiculo']),
  acessorio: new Set(['oculos', 'relogio', 'bolsa', 'mochila', 'carteira', 'cinto', 'bone', 'capa', 'carregador', 'pelicula', 'cabo'])
};

// Marcas que não devem pontuar sozinhas (exceto samsung/lg que são fortemente eletrônicos)
const BRAND_ONLY_KEYWORDS = new Set([
  'nike', 'adidas', 'puma', 'olympikus', 'brastemp', 'consul'
]);

// Substantivos de produto (peso maior que marcas)
const PRODUCT_NOUNS = new Set([
  'tenis', 'sapato', 'bota', 'sandalia', 'chinelo',
  'celular', 'smartphone', 'telefone',
  'notebook', 'laptop',
  'tv', 'televisao', 'monitor',
  'geladeira', 'fogao', 'microondas',
  'sofa', 'mesa', 'cadeira', 'cama',
  'carro', 'moto', 'bicicleta', 'bike',
  'oculos', 'relogio', 'bolsa', 'mochila'
]);

// Cache de classificação (performance)
const categoryCache = new Map<string, string>();
const CACHE_MAX_SIZE = 1000;

// Prioridade das categorias (maior = mais prioritário)
const CATEGORY_PRIORITY: Record<string, number> = {
  smartphone: 10,
  notebook: 9,
  veiculo: 8,
  calcado_roupa: 7,
  eletronico: 6,
  acessorio: 5,
  movel: 4,
  eletrodomestico: 3,
  generico: 1
};

// Detecta categoria com ranking (retorna top 3)
export function detectProductCategoryWithRanking(query: string): Array<{category: string, score: number}> {
  // Normalize query once (agora com bigramas e trigramas)
  const { normalized, tokens, bigrams, trigrams, allTokens } = normalizeAndTokenize(query);
  
  // Filtrar stopwords ANTES de expandir sinônimos (ordem correta)
  const filteredTokens = tokens.filter(t => !STOPWORDS.has(t));
  const expandedTokens = expandWithSynonyms(filteredTokens);
  
  const DEBUG = process.env.NODE_ENV === 'development';
  
  // PRIORIDADE 0: Detecta categoria via entity (iPhone, PS5, MacBook)
  const entity = detectProductEntity(query);
  if (entity.category) {
    const categoryMap: Record<string, string> = {
      'smartphone': 'smartphone',
      'laptop': 'notebook',
      'tablet': 'eletronico',
      'console': 'eletronico'
    };
    const mappedCategory = categoryMap[entity.category];
    if (mappedCategory) {
      if (DEBUG) console.log('⭐ Entity category detected:', mappedCategory);
      return [{ category: mappedCategory, score: 100 }];
    }
  }
  
  // PRIORIDADE 1: Override para objetos de acessório HARD (após entity)
  for (const token of tokens) {
    if (HARD_ACCESSORY_OBJECTS.has(token)) {
      if (DEBUG) console.log('⭐ Hard accessory object detected:', token);
      return [{ category: 'acessorio', score: 100 }];
    }
  }
  
  // PRIORIDADE 2: Detecta modelos específicos (score máximo)
  for (const [category, patterns] of Object.entries(PRODUCT_MODEL_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalized)) {
        if (DEBUG) console.log('⭐ Modelo específico detectado:', category, pattern);
        return [{ category, score: 100 }];
      }
    }
  }
  
  const expandedTokens = expandWithSynonyms(filteredTokens);
  
  // Separar tokens originais de sinônimos para peso diferenciado
  const tokenSet = new Set(filteredTokens);
  const synonymSet = new Set(expandedTokens.filter(t => !tokenSet.has(t)));
  const candidateCategories = new Set<string>();
  
  for (const [category, hints] of Object.entries(CATEGORY_TOKEN_HINTS)) {
    for (const token of filteredTokens) {
      if (hints.has(token)) {
        candidateCategories.add(category);
        break;
      }
    }
  }
  
  // Se nenhuma categoria candidata, processar todas
  const categoriesToProcess = candidateCategories.size > 0 
    ? Array.from(candidateCategories)
    : Object.keys(PRODUCT_CATEGORIES).filter(c => c !== 'generico' && c !== 'universal');
  
  if (DEBUG) {
    console.log('🔍 QUERY:', query);
    console.log('🔍 NORMALIZED:', normalized);
    console.log('🔍 TOKENS:', tokens);
    console.log('🔍 BIGRAMS:', bigrams);
    console.log('🔍 TRIGRAMS:', trigrams);
    console.log('🔍 FILTERED:', filteredTokens);
    console.log('🔍 EXPANDED:', expandedTokens);
  }
  
  const scores: Array<{category: string, score: number}> = [];
  
  for (const categoryId of categoriesToProcess) {
    const category = PRODUCT_CATEGORIES[categoryId];
    
    let score = 0;
    
    // Patterns regex (só roda se categoria é candidata - performance)
    if (candidateCategories.has(categoryId) || candidateCategories.size === 0) {
      for (const pattern of category.patterns) {
        if (pattern.test(normalized)) {
          score += 10;
          if (DEBUG) console.log('✅ Pattern match:', categoryId, '+10 pontos');
          break;
        }
      }
    } else {
      // Pula categoria se não é candidata (evita regex desnecessária)
      continue;
    }
    
    // Keywords com tokens - separar contadores (usa allTokens para incluir bigramas e trigramas)
    let tokenMatches = 0;
    let synonymMatches = 0;
    let hasBrandOnly = false;
    let hasProductNoun = false;
    
    for (const keyword of category.keywords) {
      // Multi-word keywords (phrases) com word boundary
      if (keyword.includes(' ')) {
        const phraseRegex = new RegExp(`\\b${keyword.replace(/\s+/g, '\\s+')}\\b`, 'i');
        if (phraseRegex.test(normalized)) {
          tokenMatches++;
          if (DEBUG) console.log('✅ Phrase keyword match:', keyword);
        }
        // Também verifica em bigramas e trigramas
        else if (bigrams.includes(keyword) || trigrams.includes(keyword)) {
          tokenMatches++;
          if (DEBUG) console.log('✅ N-gram keyword match:', keyword);
        }
      }
      // Single-word keywords (tokens originais peso maior)
      else if (tokenSet.has(keyword)) {
        tokenMatches++;
        
        // Check if it's a product noun (higher weight)
        if (PRODUCT_NOUNS.has(keyword)) {
          hasProductNoun = true;
          if (DEBUG) console.log('✅ Product noun match:', keyword);
        }
        // Check if it's a device accessory (bonus for eletronico)
        else if (DEVICE_ACCESSORIES.has(keyword)) {
          if (categoryId === 'eletronico') {
            score += 3;
            if (DEBUG) console.log('✅ Device accessory bonus for eletronico:', keyword);
          }
        }
        
        // Verifica se é apenas marca sem contexto
        if (BRAND_ONLY_KEYWORDS.has(keyword) && tokens.length === 1) {
          hasBrandOnly = true;
        }
      }
      // Sinônimos têm peso menor (2 pontos vs 5 do original)
      else if (synonymSet.has(keyword)) {
        synonymMatches++;
        if (DEBUG) console.log('✅ Synonym match:', keyword);
      }
    }
    
    // Brand + Product boost (marca + produto = super forte)
    if (entity.brand && hasProductNoun) {
      score += 6;
      if (DEBUG) console.log('✅ Brand + Product boost:', categoryId, '+6 pontos');
    }
    
    // Scoring com peso por tipo de palavra (contadores separados)
    if (hasBrandOnly && tokenMatches === 1 && synonymMatches === 0) {
      score += 1;
      if (DEBUG) console.log('⚠️ Brand only:', categoryId, '+1 ponto');
    } else if (hasProductNoun) {
      score += Math.min(tokenMatches * 5, 15);
      score += Math.min(synonymMatches * 2, 6);
      if (DEBUG) console.log('✅ Product noun:', categoryId, `tokens:${Math.min(tokenMatches * 5, 15)} synonyms:${Math.min(synonymMatches * 2, 6)}`);
    } else if (tokenMatches >= 2) {
      score += Math.min(tokenMatches * 4, 12);
      score += Math.min(synonymMatches * 2, 6);
      if (DEBUG) console.log('✅ Multiple keywords:', categoryId, `tokens:${Math.min(tokenMatches * 4, 12)} synonyms:${Math.min(synonymMatches * 2, 6)}`);
    } else if (tokenMatches > 0) {
      score += Math.min(tokenMatches * 3, 8);
      score += Math.min(synonymMatches * 2, 6);
      if (DEBUG) console.log('✅ Single keyword:', categoryId, `tokens:${Math.min(tokenMatches * 3, 8)} synonyms:${Math.min(synonymMatches * 2, 6)}`);
    } else if (synonymMatches > 0) {
      score += Math.min(synonymMatches * 2, 6);
      if (DEBUG) console.log('✅ Synonym only:', categoryId, `+${Math.min(synonymMatches * 2, 6)}`);
    }
    
    // Bonus por posição: peso decrescente (produto principal no início)
    for (let i = 0; i < Math.min(filteredTokens.length, 3); i++) {
      if (category.keywords.includes(filteredTokens[i])) {
        const positionWeight = [4, 2, 1][i];
        score += positionWeight;
        if (DEBUG) console.log(`✅ Position ${i+1} bonus:`, categoryId, `+${positionWeight} pontos`);
        break;
      }
    }
    
    // Bonus por prioridade (apenas como tiebreaker, não como pontuação principal)
    const priorityBonus = CATEGORY_PRIORITY[categoryId] || 0;
    score += priorityBonus * 0.1;
    
    if (score > 0) {
      scores.push({ category: categoryId, score });
      if (DEBUG) console.log('🏆 CATEGORY:', categoryId, 'SCORE:', score);
    }
  }
  
  // Ordena por score e retorna top 3
  const ranking = scores.sort((a, b) => b.score - a.score).slice(0, 3);
  
  if (DEBUG) {
    console.log('🏆 Ranking final:', ranking);
  }
  
  return ranking;
}

// Detecta categoria do produto com confiança (cache por query normalizada)
export function detectProductCategory(query: string): string {
  // Cache com query normalizada (preserva semântica)
  const { normalized, tokens } = normalizeAndTokenize(query);
  const cached = categoryCache.get(normalized);
  if (cached) return cached;
  
  let ranking = detectProductCategoryWithRanking(query);
  
  // Score negativo para conflitos: se hard accessory presente, penaliza outras categorias
  if (ranking.length > 1) {
    const hasHardAccessory = tokens.some(t => HARD_ACCESSORY_OBJECTS.has(t));
    if (hasHardAccessory) {
      ranking = ranking.map(r => ({
        ...r,
        score: r.category === 'acessorio' ? r.score : r.score - 10
      })).sort((a, b) => b.score - a.score);
    }
  }
  
  if (ranking.length === 0) return 'generico';
  
  // If score is too low, return generic (threshold aumentado para 6)
  if (ranking[0].score < 6) return 'generico';
  
  // If not confident enough, return generic
  if (!isCategoryConfident(ranking)) {
    categoryCache.set(normalized, 'generico');
    if (categoryCache.size > CACHE_MAX_SIZE) {
      const firstKey = categoryCache.keys().next().value;
      categoryCache.delete(firstKey);
    }
    return 'generico';
  }
  
  const result = ranking[0].category;
  
  // Cache result (usando normalized)
  categoryCache.set(normalized, result);
  if (categoryCache.size > CACHE_MAX_SIZE) {
    const firstKey = categoryCache.keys().next().value;
    categoryCache.delete(firstKey);
  }
  
  return result;
}

// Filtra perguntas relevantes baseado na categoria e parsed data
export function getRelevantQuestions(questions: CategoryQuestion[], category: string, parsedProduct?: any): CategoryQuestion[] {
  return questions.filter(question => {
    if (!question.conditions || question.conditions.length === 0) return true;
    
    // Skip if category doesn't match condition
    const matchesCategory = question.conditions.includes(category);
    if (!matchesCategory) {
      console.log(`⏭️ Skipping irrelevant question ${question.id} for category ${category}`);
      return false;
    }
    
    // Additional product-based filtering (future)
    if (parsedProduct) {
      // Ex: skip storage if not smartphone/notebook
      if (question.id === 'storage' && !['smartphone', 'notebook'].includes(category)) {
        return false;
      }
    }
    
    return true;
  });
}


// Verifica se a detecção de categoria é confiável (usa ratio)
export function isCategoryConfident(ranking: Array<{category: string, score: number}>): boolean {
  if (ranking.length === 0) return false;
  if (ranking.length === 1) return true;
  
  // Confiante se ratio >= 1.3 (padrão em classificadores heurísticos)
  const ratio = ranking[0].score / ranking[1].score;
  return ratio >= 1.3;
}

export function formatCategoryQuestion(question: CategoryQuestion): string {
  return question.question;
}