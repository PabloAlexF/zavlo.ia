// utils/chat/creditCalculator.ts
// A cobrança final varia por fonte e volume de resultados no backend.
// Aqui usamos apenas um piso para aviso no fluxo de chat.
export const MIN_CREDIT_COST_PER_SEARCH = 1;

export function getCreditCostForResults(_numResults: number): number {
  return MIN_CREDIT_COST_PER_SEARCH;
}

export function getCreditWarning(_numResults: number): string {
  return `Esta busca custará a partir de ${MIN_CREDIT_COST_PER_SEARCH} crédito, variando conforme a fonte consultada. Deseja continuar? (sim/não)`;
}

export const VALID_RESULTS_TIERS = [10, 20, 50] as const;
export type ResultsTier = typeof VALID_RESULTS_TIERS[number];

export function normalizeResultsTier(requested: number): ResultsTier {
  return VALID_RESULTS_TIERS.find(tier => tier >= requested) || 50;
}
