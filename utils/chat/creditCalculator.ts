// utils/chat/creditCalculator.ts - Frontend credit warnings for chat bot
// Standalone - copy logic from backend plans.constants.ts
const RESULTS_CREDIT_COSTS = {
  10: 1,
  20: 2,
  50: 3,
  100: 5
} as const;

export function getCreditCostForResults(numResults: number): number {
  if (numResults <= 10) return 1;
  if (numResults <= 20) return 2;
  if (numResults <= 50) return 3;
  return 5; // 100+
}

export function getCreditWarning(numResults: number): string {
  const credits = getCreditCostForResults(numResults);
  return `${numResults} resultados = ${credits} crédito${credits > 1 ? 's' : ''} (melhor custo-benefício para essa quantidade). Deseja continuar? (sim/não)`;
}

export const VALID_RESULTS_TIERS = [10, 20] as const;
export type ResultsTier = typeof VALID_RESULTS_TIERS[number];

export function normalizeResultsTier(requested: number): ResultsTier {
  return VALID_RESULTS_TIERS.find(tier => tier >= requested) || 20;
}
