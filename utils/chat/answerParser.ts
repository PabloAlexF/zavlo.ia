// Answer Parser - Interpreta respostas do usuário com confidence scoring
export interface ParsedAnswer {
  value: string | null;
  confidence: number; // 0-1
  matchedOption?: string;
  method?: string; // Para debug: 'number' | 'exact' | 'contains' | 'word' | 'semantic' | 'fuzzy' | 'neutral'
}

interface OptionScore {
  option: string;
  score: number;
  method: string;
}

// Mapeamento semântico de respostas comuns
const SEMANTIC_MATCHES: Record<string, string[]> = {
  'novo': ['novo', 'nova', 'lacrado', 'lacrada', 'zero', 'zerado', 'na caixa'],
  'usado': ['usado', 'usada', 'seminovo', 'seminova', 'segunda mao', 'segunda mão'],
  'masculino': ['masculino', 'masculina', 'homem', 'men', 'male', 'para homem'],
  'feminino': ['feminino', 'feminina', 'mulher', 'women', 'female', 'para mulher'],
  'unissex': ['unissex', 'unisex', 'ambos', 'tanto faz'],
  'sim': ['sim', 'yes', 'quero', 'aceito', 'ok', 'pode ser'],
  'nao': ['nao', 'não', 'no', 'nope', 'negativo'],
  'relevantes': ['relevantes', 'relevancia', 'relevância', 'melhor', 'melhores'],
  'menor': ['menor', 'barato', 'barata', 'mais barato', 'mais barata', 'economico'],
  'maior': ['maior', 'caro', 'cara', 'mais caro', 'mais cara']
};

// Respostas neutras ("tanto faz", "qualquer")
const NEUTRAL_ANSWERS = new Set([
  'tanto faz', 'qualquer', 'nao sei', 'não sei', 'indiferente',
  'qualquer um', 'qualquer uma', 'nao importa', 'não importa',
  'sem preferencia', 'sem preferência', 'any'
]);

// Respostas afirmativas (confirmação)
const CONFIRM_YES = new Set([
  'sim', 'yes', 'isso', 'isso mesmo', 'exato', 'correto', 'certo',
  'ok', 'pode ser', 'confirmo', 'afirmativo', 'positivo'
]);

// Respostas negativas (negação)
const CONFIRM_NO = new Set([
  'nao', 'não', 'no', 'errado', 'negativo', 'nope',
  'nao quis dizer isso', 'não quis dizer isso', 'incorreto'
]);

/**
 * Normaliza texto removendo acentos e pontuação
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, ' ') // Remove pontuação
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim();
}

/**
 * Calcula distância de Levenshtein entre duas strings
 */
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substituição
          matrix[i][j - 1] + 1,     // inserção
          matrix[i - 1][j] + 1      // deleção
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Calcula similaridade entre duas strings usando Levenshtein (0-1)
 */
function calculateSimilarity(a: string, b: string): number {
  const distance = levenshtein(a, b);
  return 1 - distance / Math.max(a.length, b.length);
}

/**
 * Parser robusto de respostas com confidence scoring e ranking global
 * 
 * @param answer - Resposta do usuário
 * @param options - Opções disponíveis
 * @returns ParsedAnswer com value, confidence e método usado
 */
export function parseAnswer(answer: string, options: string[]): ParsedAnswer {
  const normalized = normalizeText(answer);
  
  // Validação básica
  if (!normalized || options.length === 0) {
    return { value: null, confidence: 0, method: 'none' };
  }
  
  // Debug logging (condicional)
  const DEBUG = process.env.DEBUG_INTENT === 'true';
  
  if (DEBUG) {
    console.log('\n🔍 [ANSWER PARSER]');
    console.log('  Input:', answer);
    console.log('  Normalized:', normalized);
    console.log('  Options:', options);
  }
  
  // Array para armazenar scores de todas as opções
  const scores: OptionScore[] = [];
  
  // ============================================
  // 0️⃣ DETECÇÃO DE RESPOSTA NEUTRA (confidence: 0.9)
  // ============================================
  if (NEUTRAL_ANSWERS.has(normalized)) {
    const result = {
      value: 'Tanto faz',
      confidence: 0.9,
      matchedOption: 'Tanto faz',
      method: 'neutral'
    };
    
    if (DEBUG) console.log('  ✅ Neutral answer detected:', result);
    return result;
  }
  
  // ============================================
  // 1️⃣ DETECÇÃO DE NÚMERO (confidence: 1.0)
  // ============================================
  // Detecta número em qualquer lugar: "1", "1.", "2)", "opção 3-"
  const numberMatch = normalized.match(/\b(\d+)[\.\)\-]?\b/);
  
  if (numberMatch) {
    const index = parseInt(numberMatch[1]) - 1;
    
    if (index >= 0 && index < options.length) {
      const result = {
        value: options[index],
        confidence: 1.0,
        matchedOption: options[index],
        method: 'number'
      };
      
      if (DEBUG) console.log('  ✅ Number match:', result);
      return result;
    }
  }
  
  // ============================================
  // 2️⃣ CACHE DE NORMALIZAÇÃO (performance)
  // ============================================
  const normalizedOptions = options.map(option => ({
    option,
    normalized: normalizeText(option)
  }));
  
  // ============================================
  // 3️⃣ RANKING GLOBAL - Calcula score para TODAS as opções
  // ============================================
  for (const { option, normalized: optionNormalized } of normalizedOptions) {
    let score = 0;
    let method = '';
    
    // Match exato (0.95)
    if (normalized === optionNormalized) {
      score = 0.95;
      method = 'exact';
    }
    // Match por inclusão (0.9)
    else if (normalized.includes(optionNormalized)) {
      score = 0.9;
      method = 'contains';
    }
    // Inverso: opção contém resposta (0.85)
    else if (optionNormalized.includes(normalized) && normalized.length > 2) {
      score = 0.85;
      method = 'contains-inverse';
      
      // Boost para respostas curtas e diretas ("novo", "usado", "feminino")
      if (normalized.length <= 10) {
        score += 0.1;
        if (DEBUG) console.log('  🚀 Short answer boost:', option);
      }
    }
    
    // Match semântico (0.85)
    if (score === 0) {
      for (const [key, variants] of Object.entries(SEMANTIC_MATCHES)) {
        if (optionNormalized.includes(key)) {
          for (const variant of variants) {
            if (normalized.includes(variant)) {
              score = 0.85;
              method = 'semantic';
              break;
            }
          }
          if (score > 0) break;
        }
      }
    }
    
    // Match por palavras (0.4-0.8)
    if (score === 0) {
      const answerWords = normalized.split(/\s+/);
      const optionWords = optionNormalized.split(/\s+/);
      
      let matchedWords = 0;
      
      for (const word of answerWords) {
        if (word.length <= 2) continue;
        if (optionWords.includes(word)) {
          matchedWords++;
        }
      }
      
      if (matchedWords > 0) {
        score = Math.min(matchedWords * 0.4 + (matchedWords > 1 ? 0.2 : 0), 0.8);
        method = 'word';
      }
    }
    
    // Fuzzy match com Levenshtein (0.6-0.8) - APENAS se nenhuma regra bateu E string curta
    if (score === 0 && normalized.length <= 20) {
      const similarity = calculateSimilarity(normalized, optionNormalized);
      
      if (similarity > 0.7) {
        score = similarity * 0.8;
        method = 'fuzzy';
      }
    }
    
    // Adiciona ao ranking
    if (score > 0) {
      scores.push({ option, score, method });
    }
  }
  
  // ============================================
  // 3️⃣ RETORNA MELHOR MATCH
  // ============================================
  if (scores.length === 0) {
    if (DEBUG) console.log('  ❌ No match found');
    return { value: null, confidence: 0, method: 'none' };
  }
  
  // Ordena por score (maior primeiro) + tie breaker (opção mais curta)
  scores.sort((a, b) => {
    if (b.score === a.score) {
      // Em caso de empate, prioriza opção mais específica (curta)
      return a.option.length - b.option.length;
    }
    return b.score - a.score;
  });
  
  const best = scores[0];
  const result = {
    value: best.option,
    confidence: best.score,
    matchedOption: best.option,
    method: best.method
  };
  
  if (DEBUG) {
    console.log('  ✅ Best match:', result);
    console.log('  📊 All scores:', scores.slice(0, 3));
  }
  
  return result;
}



/**
 * Detecta se a resposta é uma confirmação (sim/não)
 */
export function isConfirmation(answer: string): 'yes' | 'no' | null {
  const normalized = normalizeText(answer);
  
  if (CONFIRM_YES.has(normalized)) {
    return 'yes';
  }
  
  if (CONFIRM_NO.has(normalized)) {
    return 'no';
  }
  
  return null;
}

/**
 * Verifica se a resposta é confiável o suficiente
 */
export function isAnswerConfident(parsed: ParsedAnswer, threshold = 0.7): boolean {
  return parsed.confidence >= threshold;
}

/**
 * Gera mensagem de confirmação quando confiança é baixa
 */
export function generateConfirmationMessage(parsed: ParsedAnswer, options: string[]): string {
  if (!parsed.value) {
    return `Desculpe, não entendi. Por favor, escolha uma das opções:\n${options.map((o, i) => `${i + 1}. ${o}`).join('\n')}`;
  }
  
  return `Você quis dizer "${parsed.value}"? (Sim/Não)`;
}

/**
 * Exemplo de uso no fluxo de chat
 */
export function handleUserAnswer(
  userAnswer: string,
  options: string[],
  onSuccess: (value: string) => void,
  onNeedConfirmation: (message: string) => void
) {
  const parsed = parseAnswer(userAnswer, options);
  
  if (isAnswerConfident(parsed)) {
    // Confiança alta - aceita resposta
    onSuccess(parsed.value!);
  } else if (parsed.value && parsed.confidence > 0.5) {
    // Confiança média - pede confirmação
    const confirmMsg = generateConfirmationMessage(parsed, options);
    onNeedConfirmation(confirmMsg);
  } else {
    // Confiança baixa - pede para escolher novamente
    const retryMsg = generateConfirmationMessage({ value: null, confidence: 0 }, options);
    onNeedConfirmation(retryMsg);
  }
}
