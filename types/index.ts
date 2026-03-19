export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  images: string[];
  category: string;
  source: string;
  sourceUrl: string;
  location?: {
    state: string;
    city: string;
    cep?: string;
  };
  seller?: {
    name: string;
    phone?: string;
  };
  condition?: 'new' | 'used';
  createdAt?: string;
  // Campos de veículo (Webmotors / Mobiauto)
  make?: string;
  model?: string;
  version?: string;
  year?: number;
  modelYear?: number;
  km?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  color?: string;
  fipePrice?: number;
  dealer?: string;
  dealerLocation?: string;
  originalPrice?: number;
  percentOff?: string;
  rating?: number;
  reviews?: number;
}

export interface SearchFilters {
  query?: string;
  state?: string;
  city?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
}
