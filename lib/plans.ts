export const PLAN_PRICES: Record<string, { monthly: number; yearly: number }> = {
  basic:    { monthly: 39.90, yearly: 399.00 },
  pro:      { monthly: 89.90, yearly: 899.00 },
  business: { monthly: 299.00, yearly: 2990.00 },
};

export function getPlanPrice(plan: string, cycle: 'monthly' | 'yearly'): number {
  return PLAN_PRICES[plan]?.[cycle] ?? 0;
}
