export const PLAN_LIMITS = {
  free: {
    textSearches: 1,
    imageSearches: 0,
    name: 'Gratuito'
  },
  basic: {
    textSearches: 15,
    imageSearches: 5,
    name: 'Básico'
  },
  pro: {
    textSearches: 48,
    imageSearches: 15,
    name: 'Pro'
  },
  business: {
    textSearches: 200,
    imageSearches: 50,
    name: 'Business'
  }
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export const getPlanLimits = (plan: string) => {
  return PLAN_LIMITS[plan as PlanType] || PLAN_LIMITS.free;
};
