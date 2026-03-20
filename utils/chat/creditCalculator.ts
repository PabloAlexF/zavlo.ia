// utils/chat/creditCalculator.ts
// 1 crédito = 1 busca (texto ou imagem), alinhado com o backend (search.service.ts useCredit(userId, 1))
export const CREDIT_COST_PER_SEARCH = 1;

export function getCreditCostForResults(_numResults: number): number {
  return CREDIT_COST_PER_SEARCH;
}

export function getCreditWarning(_numResults: number): string {
  return `Esta busca custará ${CREDIT_COST_PER_SEARCH} crédito. Deseja continuar? (sim/não)`;
}

export const VALID_RESULTS_TIERS = [10, 20, 50] as const;
export type ResultsTier = typeof VALID_RESULTS_TIERS[number];

export function normalizeResultsTier(requested: number): ResultsTier {
  return VALID_RESULTS_TIERS.find(tier => tier >= requested) || 50;
}
