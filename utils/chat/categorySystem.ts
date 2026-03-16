// Sistema de categorias (stub - não usado no modo híbrido)

export const PRODUCT_CATEGORIES: Record<string, any> = {
  universal: { questions: [] }
};

export function detectProductCategory(query: string): string {
  return 'universal';
}

export function formatCategoryQuestion(question: any): string {
  return question.text || '';
}

export function isCategoryConfident(query: string): boolean {
  return false;
}

export function getRelevantQuestions(questions: any[]): any[] {
  return [];
}
