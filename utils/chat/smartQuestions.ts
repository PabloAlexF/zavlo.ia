import { CategoryQuestion, PRODUCT_CATEGORIES } from './categorySystem';
import { enrichProductQuery } from './brandDetector';
import { parseProductIntent, ProductIntent } from './intentParser';

// Detecta informações já fornecidas na query (recebe category para evitar reprocessamento)
export function detectProvidedInfo(query: string, category?: string): Record<string, string> {
  const normalized = query.toLowerCase();
  const provided: Record<string, string> = {};
  
  console.log('🔍 Analisando query para informações:', normalized);
  console.log('🎯 Categoria:', category || 'não fornecida');
  
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
  
  // Detecta armazenamento APENAS para smartphone e notebook (valores válidos apenas)
  if (category === 'smartphone' || category === 'notebook') {
    const STORAGE_PATTERN = /\b(64|128|256|512|1024)\s*gb\b/i;
    const match = normalized.match(STORAGE_PATTERN);
    
    if (match) {
      const size = match[1];
      provided.storage = size === '1024' ? '1TB' : `${size}GB`;
      console.log('✅ Detectou armazenamento:', provided.storage);
    }
  }
  
  // Detecta tipo de móvel (genérico e escalável)
  if (category === 'movel') {
    const FURNITURE_TYPES = [
      { pattern: /cadeira\s*gamer/i, label: 'Cadeira gamer' },
      { pattern: /cadeira\s*(escritorio|office)/i, label: 'Cadeira escritório' },
      { pattern: /mesa\s*gamer/i, label: 'Mesa gamer' },
      { pattern: /mesa\s*(escritorio|office)/i, label: 'Mesa escritório' },
      { pattern: /\bsof[aá]\b/i, label: 'Sofá' },
      { pattern: /\bcama\b/i, label: 'Cama' }
    ];
    
    for (const { pattern, label } of FURNITURE_TYPES) {
      if (pattern.test(normalized)) {
        provided.type = label;
        console.log('✅ Detectou tipo de móvel:', label);
        break;
      }
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