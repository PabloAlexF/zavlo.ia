export const PLAN_PRICES: Record<string, { monthly: number; yearly: number }> = {
  basic:    { monthly: 39.90, yearly: 399.00 },
  pro:      { monthly: 89.90, yearly: 899.00 },
  business: { monthly: 299.00, yearly: 2990.00 },
};

export const PLAN_CREDITS: Record<string, { monthly: number; yearly: number }> = {
  basic:    { monthly: 15,  yearly: 180  },
  pro:      { monthly: 48,  yearly: 576  },
  business: { monthly: 200, yearly: 2400 },
};

export function getPlanPrice(plan: string, cycle: 'monthly' | 'yearly'): number {
  return PLAN_PRICES[plan]?.[cycle] ?? 0;
}

export function getPlanCredits(plan: string, cycle: 'monthly' | 'yearly'): number {
  return PLAN_CREDITS[plan]?.[cycle] ?? 15;
}
