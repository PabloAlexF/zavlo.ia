export interface ClassificationQuestion {
  question: string;
  suggestions?: Array<{ label: string; value?: string; min?: number; max?: number }>;
}

export interface ClassificationLocation {
  city?: string;
  state?: string;
}

export interface ClassificationPriceRange {
  min_price?: number;
  max_price?: number;
  target_price?: number;
}

export interface ClassificationData {
  category?: string;
  confidence?: number;
  normalized_query?: string;
  search_query?: string;
  condition?: 'new' | 'used' | 'unknown';
  detected_year?: number | null;
  detected_brand?: string | null;
  detected_gender?: string | null;
  detected_size?: string | null;
  detected_storage?: string | null;
  detected_transmission?: string | null;
  detected_fuel?: string | null;
  detected_body_type?: string | null;
  detected_shoe_type?: string | null;
  user_location?: ClassificationLocation | null;
  price_range?: ClassificationPriceRange | null;
  minimum_rating?: number | null;
  require_free_shipping?: boolean | null;
  prefer_installments?: boolean | null;
  priority_discounted?: boolean | null;
  prefer_proximity_olx?: 'nearby' | 'any' | null;
  seller_type_preference?: 'business' | 'individual' | 'any' | null;
  availability_preference?: 'in_stock' | 'flexible' | null;
  prefer_price_drop?: boolean | null;
  webmotors_seller_data_addon?: boolean | null;
  webmotors_max_requests?: number | null;
  google_country?: string | null;
  google_language?: string | null;
  google_limit?: number | null;
  missing_fields?: string[];
  suggested_question?: string | ClassificationQuestion | null;
  is_question?: boolean;
  is_greeting?: boolean;
  question_type?: string | null;
  guided_response?: string | null;
  last_filters?: Record<string, any>;
  [key: string]: any;
}

export interface ClassifyQueryRequest {
  query: string;
  answers?: Record<string, string | { value: any }>;
  prevClassification?: ClassificationData;
}

export interface ClassifyQueryResponse {
  classification: ClassificationData;
  needsQuestion?: boolean;
  question?: string | ClassificationQuestion;
  missingFields?: string[];
  is_question?: boolean;
  is_greeting?: boolean;
  question_type?: string;
  guided_response?: string;
}
