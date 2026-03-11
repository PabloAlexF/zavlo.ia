export interface ProductEntity {
  id?: string;
  canonicalId: string;
  name: string;
  brand: string;
  category: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  depreciationPerYear: number;
  releaseYear: number;
  popularityScore: number;
  searchCount: number;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceHistoryEntity {
  id?: string;
  productId: string;
  canonicalId: string;
  marketplace: string;
  price: number;
  date: string;
  createdAt: Date;
}

export interface MarketplaceEntity {
  id?: string;
  name: string;
  reputation: number;
  priceModifier: number;
  avgDeliveryDays: number;
  updatedAt: Date;
}
