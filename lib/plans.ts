export const PLAN_PRICES: Record<string, { monthly: number; yearly: number }> = {
  basic:    { monthly: 29.90, yearly: 299.00 },
  pro:      { monthly: 59.90, yearly: 599.00 },
  business: { monthly: 149.00, yearly: 1490.00 },
};

export const PLAN_CREDITS: Record<string, { monthly: number; yearly: number }> = {
  basic:    { monthly: 10,  yearly: 120  },
  pro:      { monthly: 20,  yearly: 240  },
  business: { monthly: 50,  yearly: 600  },
};

export function getPlanPrice(plan: string, cycle: 'monthly' | 'yearly'): number {
  return PLAN_PRICES[plan]?.[cycle] ?? 0;
}

export function getPlanCredits(plan: string, cycle: 'monthly' | 'yearly'): number {
  return PLAN_CREDITS[plan]?.[cycle] ?? 10;
}

const PLAN_LIMITS: Record<string, { textSearchesPerMonth: number; imageSearchesPerMonth: number }> = {
  free:     { textSearchesPerMonth: 1,  imageSearchesPerMonth: 1  },
  basic:    { textSearchesPerMonth: 10, imageSearchesPerMonth: 3  },
  pro:      { textSearchesPerMonth: 20, imageSearchesPerMonth: 6  },
  business: { textSearchesPerMonth: 50, imageSearchesPerMonth: 15 },
};

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}
