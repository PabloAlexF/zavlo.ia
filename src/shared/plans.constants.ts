/**
 * Planos e Limites do Zavlo.ia
 * Baseado na análise de custos Apify Scale ($199/mês)
 * 
 * @see APIFY_COST_ANALYSIS.md
 * @see PLANS_COMPARISON.md
 */

export enum PlanType {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
  BUSINESS = 'business',
}

export interface PlanLimits {
  textSearchesPerDay: number; // -1 = unlimited, 0 = monthly limit
  imageSearchesPerDay: number; // -1 = unlimited, 0 = monthly limit
  textSearchesPerMonth?: number; // for free plan
  imageSearchesPerMonth?: number; // for free plan
  maxMarketplaces: number;
  historyDays: number;
  alerts: boolean;
  realtimeAlerts: boolean;
  whatsappAlerts: boolean;
  advancedAI: boolean;
  fraudDetection: boolean;
  apiAccess: boolean;
  maxUsers: number;
  exportData: boolean;
  prioritySupport: boolean;
  scrapingPriority: 'none' | 'basic' | 'high' | 'realtime';
}

export interface PlanPricing {
  monthly: number; // BRL
  yearly: number; // BRL
  currency: 'BRL';
}

export interface PlanCost {
  apifyCU: number; // Compute Units per month
  apifyProxy: number; // GB per month
  apifyStorage: number; // GB per month
  totalUSD: number; // Total cost in USD
  totalBRL: number; // Total cost in BRL (USD * 5)
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  [PlanType.FREE]: {
    textSearchesPerDay: 0,
    imageSearchesPerDay: 0,
    textSearchesPerMonth: 1,
    imageSearchesPerMonth: 1,
    maxMarketplaces: 3,
    historyDays: 0,
    alerts: false,
    realtimeAlerts: false,
    whatsappAlerts: false,
    advancedAI: false,
    fraudDetection: false,
    apiAccess: false,
    maxUsers: 1,
    exportData: false,
    prioritySupport: false,
    scrapingPriority: 'none',
  },
  [PlanType.BASIC]: {
    textSearchesPerDay: 0,
    textSearchesPerMonth: 15,
    imageSearchesPerDay: 0,
    imageSearchesPerMonth: 5,
    maxMarketplaces: 6,
    historyDays: 30,
    alerts: true,
    realtimeAlerts: false,
    whatsappAlerts: false,
    advancedAI: false,
    fraudDetection: false,
    apiAccess: false,
    maxUsers: 1,
    exportData: false,
    prioritySupport: false,
    scrapingPriority: 'basic',
  },
  [PlanType.PRO]: {
    textSearchesPerDay: 0,
    textSearchesPerMonth: 48,
    imageSearchesPerDay: 0,
    imageSearchesPerMonth: 15,
    maxMarketplaces: 9,
    historyDays: 90,
    alerts: true,
    realtimeAlerts: true,
    whatsappAlerts: true,
    advancedAI: true,
    fraudDetection: false,
    apiAccess: false,
    maxUsers: 1,
    exportData: false,
    prioritySupport: true,
    scrapingPriority: 'high',
  },
  [PlanType.BUSINESS]: {
    textSearchesPerDay: 0,
    textSearchesPerMonth: 200,
    imageSearchesPerDay: 0,
    imageSearchesPerMonth: 50,
    maxMarketplaces: -1,
    historyDays: -1,
    alerts: true,
    realtimeAlerts: true,
    whatsappAlerts: true,
    advancedAI: true,
    fraudDetection: true,
    apiAccess: true,
    maxUsers: 5,
    exportData: true,
    prioritySupport: true,
    scrapingPriority: 'realtime',
  },
};

export const PLAN_PRICING: Record<PlanType, PlanPricing> = {
  [PlanType.FREE]: {
    monthly: 0,
    yearly: 0,
    currency: 'BRL',
  },
  [PlanType.BASIC]: {
    monthly: 27.00,
    yearly: 270.00,
    currency: 'BRL',
  },
  [PlanType.PRO]: {
    monthly: 77.00,
    yearly: 770.00,
    currency: 'BRL',
  },
  [PlanType.BUSINESS]: {
    monthly: 197.00,
    yearly: 1970.00,
    currency: 'BRL',
  },
};

export const PLAN_COSTS: Record<PlanType, PlanCost> = {
  [PlanType.FREE]: {
    apifyCU: 0,
    apifyProxy: 0,
    apifyStorage: 0,
    totalUSD: 0,
    totalBRL: 0,
  },
  [PlanType.BASIC]: {
    apifyCU: 0.15,
    apifyProxy: 0.1,
    apifyStorage: 0.05,
    totalUSD: 0.10,
    totalBRL: 0.50,
  },
  [PlanType.PRO]: {
    apifyCU: 0.48,
    apifyProxy: 0.2,
    apifyStorage: 0.1,
    totalUSD: 0.20,
    totalBRL: 1.00,
  },
  [PlanType.BUSINESS]: {
    apifyCU: 2,
    apifyProxy: 0.5,
    apifyStorage: 0.2,
    totalUSD: 0.80,
    totalBRL: 4.00,
  },
};

export interface CreditPackage {
  credits: number;
  bonus: number;
  price: number; // BRL
  description: string;
  popular?: boolean;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    credits: 10,
    bonus: 0,
    price: 15.90,
    description: 'Ideal para testes',
  },
  {
    credits: 25,
    bonus: 0,
    price: 32.90,
    description: 'Uso moderado',
    popular: true,
  },
  {
    credits: 60,
    bonus: 0,
    price: 69.90,
    description: 'Melhor custo-benefício',
  },
];

export const CREDIT_USAGE = {
  IMAGE_SEARCH_AI: 1,
  REALTIME_SCRAPING: 1,
  ADVANCED_SIMILARITY: 1,
  FRAUD_DETECTION: 2,
  EXPORT_DATA: 5,
};

export const MARKETPLACES_BY_PLAN = {
  [PlanType.FREE]: ['olx', 'mercadolivre', 'enjoei'],
  [PlanType.BASIC]: ['olx', 'mercadolivre', 'enjoei', 'webmotors', 'icarros', 'mobiauto'],
  [PlanType.PRO]: [
    'olx',
    'mercadolivre',
    'enjoei',
    'webmotors',
    'icarros',
    'mobiauto',
    'amazon',
    'kabum',
    'shopee',
  ],
  [PlanType.BUSINESS]: [
    'olx',
    'mercadolivre',
    'enjoei',
    'webmotors',
    'icarros',
    'mobiauto',
    'amazon',
    'kabum',
    'shopee',
    'vinted',
    'estantevirtual',
    'buscape',
  ],
};

export const APIFY_PLANS = {
  FREE: {
    monthly: 0,
    credits: 5,
    cuCost: 0.30,
    proxyCost: 8.00,
    datacenterIPs: 5,
  },
  STARTER: {
    monthly: 29,
    credits: 29,
    cuCost: 0.30,
    proxyCost: 8.00,
    datacenterIPs: 30,
  },
  SCALE: {
    monthly: 199,
    credits: 199,
    cuCost: 0.25,
    proxyCost: 7.50,
    datacenterIPs: 200,
  },
  BUSINESS: {
    monthly: 999,
    credits: 999,
    cuCost: 0.20,
    proxyCost: 7.00,
    datacenterIPs: 500,
  },
};

export const BREAKEVEN = {
  APIFY_SCALE_USD: 199,
  APIFY_SCALE_BRL: 995,
  USERS_BASIC_NEEDED: 10,
  USERS_PRO_NEEDED: 4,
  USERS_BUSINESS_NEEDED: 2,
};

export function getPlanLimits(plan: PlanType): PlanLimits {
  return PLAN_LIMITS[plan];
}

export function getPlanPricing(plan: PlanType): PlanPricing {
  return PLAN_PRICING[plan];
}

export function getPlanCost(plan: PlanType): PlanCost {
  return PLAN_COSTS[plan];
}

export function getMarketplaces(plan: PlanType): string[] {
  return MARKETPLACES_BY_PLAN[plan];
}

export function canUseFeature(plan: PlanType, feature: keyof PlanLimits): boolean {
  const limits = PLAN_LIMITS[plan];
  return !!limits[feature];
}

export function hasReachedLimit(
  plan: PlanType,
  limitType: 'textSearchesPerDay' | 'imageSearchesPerDay',
  currentUsage: number,
): boolean {
  const limits = PLAN_LIMITS[plan];
  const limit = limits[limitType];
  
  if (limit === -1) return false;
  return currentUsage >= limit;
}

export function calculateMargin(plan: PlanType): number {
  const pricing = PLAN_PRICING[plan];
  const cost = PLAN_COSTS[plan];
  
  if (pricing.monthly === 0) return -100;
  
  return ((pricing.monthly - cost.totalBRL) / pricing.monthly) * 100;
}

export function calculateProfit(plan: PlanType): number {
  const pricing = PLAN_PRICING[plan];
  const cost = PLAN_COSTS[plan];
  
  return pricing.monthly - cost.totalBRL;
}
