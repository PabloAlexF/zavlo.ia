/**
 * Interface para resposta do serviço de classificação Python
 */
export interface ClassificationResult {
  category: string;
  confidence: number;
  recommended_scrapers: string[];
  condition: 'new' | 'used' | 'unknown';
  all_scores: Record<string, number>;
  missing_fields: string[];
  suggested_question: string | null;
}

/**
 * Interface para request de classificação
 */
export interface ClassificationRequest {
  query: string;
  context?: Record<string, any>;
}

/**
 * Mapeamento de categorias para tipos de produto
 */
export enum ProductCategory {
  CAR = 'car',
  MOTORCYCLE = 'motorcycle',
  SMARTPHONE = 'smartphone',
  ELECTRONICS = 'electronics',
  FURNITURE = 'furniture',
  APPLIANCE = 'appliance',
  FASHION = 'fashion',
  MARKETPLACE_USED = 'marketplace_used',
  GENERAL = 'general',
}

/**
 * Mapeamento de scrapers disponíveis
 */
export enum ScraperType {
  GOOGLE_SHOPPING = 'google_shopping',
  WEBMOTORS = 'webmotors',
  MOBIAUTO = 'mobiauto',
  OLX = 'olx',
}
