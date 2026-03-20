// Sistema NLP completo para Zavlo.ia
export { detectIntent } from './intentDetector';
export { contextManager } from './contextManager';
export { parseProductQuery, buildSearchQuery } from './productParser';
export { normalizeText, lightNormalize, normalizeAccents, removePunctuation, removeStopWords } from './textNormalizer';
export { STOP_WORDS, QUESTION_WORDS, NON_PRODUCT_WORDS, BRAND_SET, GENERIC_PRODUCTS } from './constants';

// Tipos
export type { Intent } from './intentDetector';
export type { ParsedProduct } from './productParser';