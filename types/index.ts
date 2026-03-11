export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  source: string;
  sourceUrl: string;
  location: {
    state: string;
    city: string;
    cep?: string;
  };
  seller: {
    name: string;
    phone?: string;
  };
  condition?: 'new' | 'used';
  createdAt: string;
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
