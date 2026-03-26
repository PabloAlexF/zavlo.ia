// #9: fonte única de verdade — importar do backend para evitar divergência silenciosa
import {
  PLAN_PRICING,
  PLAN_LIMITS as BACKEND_PLAN_LIMITS,
} from '@/src/shared/plans.constants';

export const PLAN_PRICES: Record<string, { monthly: number; yearly: number }> = {
  basic:    { monthly: PLAN_PRICING.basic.monthly,    yearly: PLAN_PRICING.basic.yearly    },
  pro:      { monthly: PLAN_PRICING.pro.monthly,      yearly: PLAN_PRICING.pro.yearly      },
  business: { monthly: PLAN_PRICING.business.monthly, yearly: PLAN_PRICING.business.yearly },
};

export const PLAN_CREDITS: Record<string, { monthly: number; yearly: number }> = {
  basic:    { monthly: BACKEND_PLAN_LIMITS.basic.textSearchesPerMonth!,    yearly: BACKEND_PLAN_LIMITS.basic.textSearchesPerMonth!    * 12 },
  pro:      { monthly: BACKEND_PLAN_LIMITS.pro.textSearchesPerMonth!,      yearly: BACKEND_PLAN_LIMITS.pro.textSearchesPerMonth!      * 12 },
  business: { monthly: BACKEND_PLAN_LIMITS.business.textSearchesPerMonth!, yearly: BACKEND_PLAN_LIMITS.business.textSearchesPerMonth! * 12 },
};

export function getPlanPrice(plan: string, cycle: 'monthly' | 'yearly'): number {
  return PLAN_PRICES[plan]?.[cycle] ?? 0;
}

export function getPlanCredits(plan: string, cycle: 'monthly' | 'yearly'): number {
  return PLAN_CREDITS[plan]?.[cycle] ?? 10;
}

export function getPlanLimits(plan: string) {
  const limits = BACKEND_PLAN_LIMITS[plan as keyof typeof BACKEND_PLAN_LIMITS];
  return {
    textSearchesPerMonth:  limits?.textSearchesPerMonth  ?? 1,
    imageSearchesPerMonth: limits?.imageSearchesPerMonth ?? 1,
  };
}
