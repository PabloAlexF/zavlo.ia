import type { ClassifyQueryResponse } from '@shared/contracts/classification.contract';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isQuestionPayload(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0;
  if (!isObject(value)) return false;
  return typeof value.question === 'string' && value.question.trim().length > 0;
}

export function parseClassifyQueryResponse(value: unknown): ClassifyQueryResponse | null {
  if (!isObject(value)) return null;
  if (!isObject(value.classification)) return null;

  const response = value as ClassifyQueryResponse;

  if (response.missingFields && !Array.isArray(response.missingFields)) return null;
  if (Array.isArray(response.missingFields) && response.missingFields.some((field) => typeof field !== 'string')) return null;
  if (response.needsQuestion !== undefined && typeof response.needsQuestion !== 'boolean') return null;
  if (response.question !== undefined && !isQuestionPayload(response.question)) return null;

  return response;
}
