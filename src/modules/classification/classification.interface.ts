/**
 * Interface para resposta do serviço de classificação Python
 */
export interface ScraperPriority {
  name: string;
  score: number;
}

export interface ClassificationResult {
  category: string;
  confidence: number;
  scrapers: ScraperPriority[];
  condition: 'new' | 'used' | 'unknown';
  all_scores: Record<string, number>;
  missing_fields: string[];
  suggested_question: string | { question: string; suggestions?: any[] } | null;
  question_type?: string | null;
  is_question?: boolean;
  is_greeting?: boolean;
  extracted_product?: string | null;
  detected_brand?: string | null;
  detected_model?: string | null;
  detected_version?: string | null;
  detected_year?: number | null;
  normalized_query?: string;
  search_query?: string;
  user_location?: { city?: string; state?: string } | null;
  price_range?: any | null;
  last_filters?: Record<string, any>;
  guided_response?: string | null;
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
  MERCADOLIVRE = 'mercadolivre',
  OLX = 'olx',
}
