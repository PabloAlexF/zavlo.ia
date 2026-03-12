// Query Understanding Pipeline - Orquestra todo o fluxo de NLP
import { normalizeAndTokenize, expandWithSynonyms } from './advancedNormalizer';
import { detectProductCategory } from './categorySystem';
import { detectProductEntity } from './brandDetector';
import { parseProductIntent, getQueryCompleteness, getMissingFields, ProductIntent } from './intentParser';

export interface QueryUnderstanding {
  // Query original
  originalQuery: string;
  
  // Normalização
  normalized: string;
  tokens: string[];
  bigrams: string[];
  trigrams: string[];
  expandedTokens: string[];
  
  // Intent estruturado
  intent: ProductIntent;
  
  // Completude
  completeness: number;
  missingFields: string[];
  
  // Metadata
  isComplete: boolean;
  needsQuestions: boolean;
  confidence: number; // Score de confiança (0-1)
}

// Pipeline principal de entendimento de query
export function understandProductQuery(query: string, debug = false): QueryUnderstanding {
  const startTime = Date.now();
  
  // ETAPA 1: Normalização e tokenização
  const { normalized, tokens, bigrams, trigrams, allTokens } = normalizeAndTokenize(query);
  
  if (debug) {
    console.log('\n🔍 [PIPELINE] Etapa 1: Normalização');
    console.log('  Original:', query);
    console.log('  Normalized:', normalized);
    console.log('  Tokens:', tokens);
    console.log('  Bigrams:', bigrams);
    console.log('  Trigrams:', trigrams);
  }
  
  // ETAPA 2: Expansão com sinônimos
  const expandedTokens = expandWithSynonyms(tokens);
  
  if (debug) {
    console.log('\n🔍 [PIPELINE] Etapa 2: Expansão de sinônimos');
    console.log('  Expanded:', expandedTokens);
  }
  
  // ETAPA 3: Detecção de categoria
  const category = detectProductCategory(query);
  
  if (debug) {
    console.log('\n🔍 [PIPELINE] Etapa 3: Categoria');
    console.log('  Category:', category);
  }
  
  // ETAPA 4: Detecção de marca/modelo
  const entity = detectProductEntity(query);
  
  if (debug) {
    console.log('\n🔍 [PIPELINE] Etapa 4: Entidade');
    console.log('  Brand:', entity.brand || 'não detectado');
    console.log('  Model:', entity.model || 'não detectado');
  }
  
  // ETAPA 5: Extração de atributos (Intent Parser)
  const intent = parseProductIntent(query);
  
  if (debug) {
    console.log('\n🔍 [PIPELINE] Etapa 5: Intent estruturado');
    console.log('  Intent:', JSON.stringify(intent, null, 2));
  }
  
  // ETAPA 6: Cálculo de completude
  const completeness = getQueryCompleteness(intent);
  const missingFields = getMissingFields(intent);
  
  if (debug) {
    console.log('\n🔍 [PIPELINE] Etapa 6: Completude');
    console.log('  Completeness:', completeness + '%');
    console.log('  Missing:', missingFields);
    console.log('  Confidence:', intent.confidence);
  }
  
  const endTime = Date.now();
  
  if (debug) {
    console.log('\n⏱️ [PIPELINE] Tempo total:', (endTime - startTime) + 'ms');
  }
  
  return {
    originalQuery: query,
    normalized,
    tokens,
    bigrams,
    trigrams,
    expandedTokens,
    intent,
    completeness,
    missingFields,
    isComplete: completeness === 100,
    needsQuestions: completeness < 100,
    confidence: intent.confidence || 0.5
  };
}

// Função auxiliar para gerar perguntas inteligentes
export function generateSmartQuestions(understanding: QueryUnderstanding): string[] {
  const QUESTION_MAP: Record<string, string> = {
    gender: 'Para quem é o produto? (Masculino/Feminino/Unissex)',
    size: 'Qual tamanho?',
    condition: 'Produto novo ou usado?',
    storage: 'Qual capacidade de armazenamento?',
    type: 'Que tipo específico?',
    material: 'Qual material preferido?',
    color: 'Qual cor?'
  };
  
  return understanding.missingFields
    .map(field => QUESTION_MAP[field])
    .filter(Boolean);
}

// Exemplo de uso
export function exampleUsage() {
  console.log('📊 EXEMPLO DE USO DO PIPELINE\n');
  
  const queries = [
    "tenis nike air max 97 masculino 42 preto novo",
    "iphone 13 pro 256gb",
    "notebook gamer",
    "cadeira gamer vermelha"
  ];
  
  queries.forEach(query => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Query: "${query}"`);
    console.log('='.repeat(60));
    
    const understanding = understandProductQuery(query, true);
    
    if (understanding.isComplete) {
      console.log('\n✅ Query completa! Pronto para buscar.');
    } else {
      console.log('\n⚠️ Query incompleta. Perguntas necessárias:');
      const questions = generateSmartQuestions(understanding);
      questions.forEach((q, i) => console.log(`  ${i + 1}. ${q}`));
    }
  });
}
