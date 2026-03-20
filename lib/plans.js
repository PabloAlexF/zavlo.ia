export const PLAN_PRICES = {
    basic:    { monthly: 29.90, yearly: 299.00 },
    pro:      { monthly: 59.90, yearly: 599.00 },
    business: { monthly: 149.00, yearly: 1490.00 },
};

export const PLAN_CREDITS = {
    basic:    { monthly: 10,  yearly: 120  },
    pro:      { monthly: 20,  yearly: 240  },
    business: { monthly: 50,  yearly: 600  },
};

export const PLAN_LIMITS = {
    free:     { textSearchesPerMonth: 1,  imageSearchesPerMonth: 1,  name: 'Gratuito' },
    basic:    { textSearchesPerMonth: 10, imageSearchesPerMonth: 3,  name: 'Básico'   },
    pro:      { textSearchesPerMonth: 20, imageSearchesPerMonth: 6,  name: 'Pro'      },
    business: { textSearchesPerMonth: 50, imageSearchesPerMonth: 15, name: 'Business' },
};

export const getPlanPrice = (plan, cycle) => PLAN_PRICES[plan]?.[cycle] ?? 0;
export const getPlanCredits = (plan, cycle) => PLAN_CREDITS[plan]?.[cycle] ?? 10;
export const getPlanLimits = (plan) => PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
