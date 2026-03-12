// Exemplo de uso do Intent Parser
import { parseProductIntent, getQueryCompleteness, getMissingFields } from './intentParser';
import { PRODUCT_CATEGORIES } from './categorySystem';

// ============================================
// EXEMPLO 1: Query completa
// ============================================
const query1 = "tenis nike air max 97 masculino 42 preto novo";
const intent1 = parseProductIntent(query1);

console.log('📊 Query:', query1);
console.log('🎯 Intent:', intent1);
/*
{
  category: "calcado_roupa",
  brand: "nike",
  model: "air max 97",
  gender: "Masculino",
  size: "42",
  color: "Preto",
  condition: "Novo"
}
*/

const completeness1 = getQueryCompleteness(intent1);
console.log('✅ Completude:', completeness1 + '%'); // 100%

const missing1 = getMissingFields(intent1);
console.log('❓ Campos faltantes:', missing1); // []

// ============================================
// EXEMPLO 2: Query incompleta
// ============================================
const query2 = "tenis nike air max";
const intent2 = parseProductIntent(query2);

console.log('\n📊 Query:', query2);
console.log('🎯 Intent:', intent2);
/*
{
  category: "calcado_roupa",
  brand: "nike",
  model: "air max"
}
*/

const completeness2 = getQueryCompleteness(intent2);
console.log('⚠️ Completude:', completeness2 + '%'); // 0%

const missing2 = getMissingFields(intent2);
console.log('❓ Campos faltantes:', missing2); // ['gender', 'size', 'condition']

// ============================================
// EXEMPLO 3: Smartphone
// ============================================
const query3 = "iphone 13 pro 256gb";
const intent3 = parseProductIntent(query3);

console.log('\n📊 Query:', query3);
console.log('🎯 Intent:', intent3);
/*
{
  category: "smartphone",
  brand: "Apple",
  model: "iPhone 13 Pro",
  storage: "256GB"
}
*/

const missing3 = getMissingFields(intent3);
console.log('❓ Campos faltantes:', missing3); // ['condition']

// ============================================
// EXEMPLO 4: Integração com chat
// ============================================
function generateSmartQuestions(query: string) {
  const intent = parseProductIntent(query);
  const missing = getMissingFields(intent);
  
  console.log('\n🤖 Chat inteligente para:', query);
  console.log('🎯 Detectado:', intent);
  console.log('❓ Perguntar apenas:', missing);
  
  // Mapear campos para perguntas
  const QUESTION_MAP: Record<string, string> = {
    gender: 'Para quem é? (Masculino/Feminino/Unissex)',
    size: 'Qual tamanho?',
    condition: 'Produto novo ou usado?',
    storage: 'Qual capacidade de armazenamento?',
    type: 'Que tipo específico?'
  };
  
  const questions = missing.map(field => QUESTION_MAP[field]).filter(Boolean);
  
  console.log('💬 Perguntas:', questions);
  
  return { intent, questions };
}

// Teste
generateSmartQuestions("tenis nike air max 97 masculino 42");
/*
🤖 Chat inteligente para: tenis nike air max 97 masculino 42
🎯 Detectado: { category: "calcado_roupa", brand: "nike", model: "air max 97", gender: "Masculino", size: "42" }
❓ Perguntar apenas: ['condition']
💬 Perguntas: ['Produto novo ou usado?']
*/

// ============================================
// EXEMPLO 5: Comparação antes/depois
// ============================================
console.log('\n📊 COMPARAÇÃO: Antes vs Depois do Intent Parser\n');

const testQueries = [
  "tenis nike air max 97 masculino 42 preto novo",
  "iphone 13 pro 256gb usado",
  "notebook gamer",
  "cadeira gamer vermelha"
];

testQueries.forEach(query => {
  const intent = parseProductIntent(query);
  const completeness = getQueryCompleteness(intent);
  const missing = getMissingFields(intent);
  
  console.log(`Query: "${query}"`);
  console.log(`  Completude: ${completeness}%`);
  console.log(`  Faltam: ${missing.length} campos (${missing.join(', ') || 'nenhum'})`);
  console.log('');
});

// ============================================
// EXEMPLO 6: Uso no chat real
// ============================================
export function handleUserQuery(query: string) {
  // 1. Parse intent
  const intent = parseProductIntent(query);
  
  // 2. Verificar completude
  const completeness = getQueryCompleteness(intent);
  
  if (completeness === 100) {
    // Query completa - buscar direto
    console.log('✅ Query completa! Buscando...');
    return { action: 'search', intent };
  }
  
  // 3. Perguntar apenas o que falta
  const missing = getMissingFields(intent);
  const category = PRODUCT_CATEGORIES[intent.category || 'generico'];
  
  if (!category) {
    return { action: 'error', message: 'Categoria não encontrada' };
  }
  
  // Filtrar perguntas relevantes
  const relevantQuestions = category.questions.filter(q => missing.includes(q.id));
  
  console.log(`⚠️ Faltam ${missing.length} informações. Perguntando...`);
  
  return {
    action: 'ask',
    intent,
    questions: relevantQuestions,
    completeness
  };
}

// Teste
console.log('\n🧪 TESTE: handleUserQuery\n');
console.log(handleUserQuery("tenis nike air max 97 masculino 42 preto novo"));
console.log(handleUserQuery("tenis nike air max"));
