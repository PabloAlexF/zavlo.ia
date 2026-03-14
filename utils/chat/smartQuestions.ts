import { CategoryQuestion, PRODUCT_CATEGORIES } from './categorySystem';
import { enrichProductQuery } from './brandDetector';
import { parseProductIntent, ProductIntent } from './intentParser';

// Detecta informações já fornecidas na query (recebe category para evitar reprocessamento)
export function detectProvidedInfo(query: string, category?: string): Record<string, string> {
  const normalized = query.toLowerCase();
  const provided: Record<string, string> = {};
  
  console.log('🔍 Analisando query para informações:', normalized);
  console.log('🎯 Categoria:', category || 'não fornecida');
  
  // Detecta condição (novo/usado)
  if (/\b(novo|nova|novos|novas|lacrado|lacrada|zero|0km)\b/i.test(normalized)) {
    provided.condition = 'novo';
    console.log('✅ Detectou condição: novo');
  } else if (/\b(usado|usada|usados|usadas|seminovo|seminova|segunda\s*m[ãa]o)\b/i.test(normalized)) {
    provided.condition = 'usado';
    console.log('✅ Detectou condição: usado');
  }
  
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
  
  // Detecta armazenamento APENAS para categorias relevantes (sem acessório)
  const STORAGE_PATTERN = /\b(64|128|256|512|1024|1|2|4)\s*(gb|tb)\b/i;
  const match = normalized.match(STORAGE_PATTERN);
  
  if ((category === 'smartphone' || category === 'notebook' || category === 'tablet') && match) {
    const size = match[1];
    const unit = match[2].toLowerCase();
    
    if (unit === 'tb') {
      provided.storage = size === '1' ? '1TB' : `${size}TB`;
    } else {
      provided.storage = size === '1024' ? '1TB' : `${size}GB`;
    }
    console.log('✅ Detectou armazenamento:', provided.storage);
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

