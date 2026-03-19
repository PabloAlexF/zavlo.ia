export interface Product {
  id?: string;
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
    whatsapp?: string;
  };
  condition?: 'new' | 'used';
  rating?: number;
  brand?: string;
  createdAt?: Date;
  updatedAt?: Date;
  scrapedAt?: Date;
  // Campos de veículo (Webmotors)
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
  // Campos de marketplace (MercadoLivre / Google Shopping)
  originalPrice?: number;
  percentOff?: string;
  reviews?: number;
  shipping?: string;
  installments?: string;
  isInternational?: boolean;
  shippedFrom?: string;
  highlight?: string;
  sku?: string;
}

export interface ProductFilter {
  category?: string;
  state?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  source?: string;
}
