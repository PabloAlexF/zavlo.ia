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
};
export const getPlanLimits = (plan) => {
    return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
};
