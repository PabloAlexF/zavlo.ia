export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  location?: {
    cep?: string;
    city?: string;
    state?: string;
  };
  plan?: string;
  billingCycle?: 'monthly' | 'yearly';
  credits?: number;
  planStartedAt?: Date;
  planExpiresAt?: Date;
  textSearchesToday?: number;
  imageSearchesToday?: number;
  textSearchesThisMonth?: number;
  imageSearchesThisMonth?: number;
  lastUsageDate?: string;
  lastMonthKey?: string;
  createdAt: Date;
  updatedAt: Date;
}