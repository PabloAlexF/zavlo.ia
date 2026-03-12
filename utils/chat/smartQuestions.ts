import { CategoryQuestion, PRODUCT_CATEGORIES, detectProductCategory } from './categorySystem';
import { enrichProductQuery, detectCondition } from './brandDetector';

// Detecta informações já fornecidas na query
export function detectProvidedInfo(query: string) {
  const normalized = query.toLowerCase();
  const provided: Record<string, string> = {};
  
  console.log('🔍 Analisando query para informações:', normalized);
  
  // Detecta categoria primeiro para validar perguntas
  const category = detectProductCategory(query);
  console.log('🎯 Categoria detectada:', category);
  
  // NÃO detecta condição automaticamente - sempre perguntar
  // Isso evita confusão quando o usuário digita "tenis nike air max 97 novo"
  // e o sistema pula a pergunta de condição
  
  // Detecta gênero
  if (/\b(masculino|masculina|homem|para homem|men)\b/i.test(normalized)) {
    provided.gender = 'Masculino';
    console.log('✅ Detectou gênero: Masculino');
  } else if (/\b(feminino|feminina|mulher|para mulher|women)\b/i.test(normalized)) {
    provided.gender = 'Feminino';
    console.log('✅ Detectou gênero: Feminino');
  } else if (/\b(unissex|unisex)\b/i.test(normalized)) {
    provided.gender = 'Unissex';
    console.log('✅ Detectou gênero: Unissex');
  }
  
  // Detecta armazenamento APENAS para smartphone e notebook
  if (category === 'smartphone' || category === 'notebook') {
    const storagePatterns = [
      /\b(\d+)\s*gb\b/i,
      /\b(\d+)gb\b/i,
      /\bde\s+(\d+)\s*gb\b/i
    ];
    
    for (const pattern of storagePatterns) {
      const match = normalized.match(pattern);
      if (match) {
        const size = parseInt(match[1]);
        if (size === 64) provided.storage = '64GB';
        else if (size === 128) provided.storage = '128GB';
        else if (size === 256) provided.storage = '256GB';
        else if (size === 512) provided.storage = '512GB';
        else if (size === 1024 || size === 1) provided.storage = '1TB';
        console.log('✅ Detectou armazenamento:', provided.storage);
        break;
      }
    }
  }
  
  // Detecta tipo de móvel
  if (category === 'movel') {
    if (/cadeira\s*gamer/i.test(normalized)) {
      provided.type = 'Cadeira gamer';
    } else if (/mesa\s*gamer/i.test(normalized)) {
      provided.type = 'Mesa gamer';
    } else if (/\bsofa\b|\bsofá\b/i.test(normalized)) {
      provided.type = 'Sofá';
    }
  }
  
  // Detecta material
  if (/\bcouro\b/i.test(normalized)) {
    provided.material = 'Couro';
  } else if (/\btecido\b/i.test(normalized)) {
    provided.material = 'Tecido';
  }
  
  console.log('📝 Informações detectadas:', provided);
  return provided;
}

// Verifica se produto precisa de pergunta de gênero
export function needsGenderQuestion(query: string): boolean {
  const enrichment = enrichProductQuery(query);
  return enrichment.needsGenderQuestion;
}

// Filtra perguntas que já foram respondidas
export function filterQuestions(questions: CategoryQuestion[], providedInfo: Record<string, string>): CategoryQuestion[] {
  return questions.filter(question => !providedInfo[question.id]);
}