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

const PLAN_LIMITS: Record<string, { textSearchesPerMonth: number; imageSearchesPerMonth: number }> = {
  free:     { textSearchesPerMonth: 3,        imageSearchesPerMonth: 0        },
  basic:    { textSearchesPerMonth: 100,       imageSearchesPerMonth: 20       },
  pro:      { textSearchesPerMonth: 500,       imageSearchesPerMonth: 100      },
  business: { textSearchesPerMonth: Infinity,  imageSearchesPerMonth: Infinity },
};

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}
