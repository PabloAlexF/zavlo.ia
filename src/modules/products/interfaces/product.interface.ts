export interface Product {
  id?: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  source: string; // OLX, Mercado Livre, etc
  sourceUrl: string;
  location: {
    state: string;
    city: string;
    cep?: string;
  };
  seller: {
    name: string;
    phone?: string;
    whatsapp?: string;
  };
  condition?: 'new' | 'used';
  rating?: number; // Rating do produto (0-5)
  createdAt: Date;
  updatedAt: Date;
  scrapedAt: Date;
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
