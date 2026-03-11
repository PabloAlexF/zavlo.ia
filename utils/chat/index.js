// Sistema NLP completo para Zavlo.ia
export { detectIntent } from './intentDetector';
export { contextManager } from './contextManager';
export { parseProductQuery, buildSearchQuery } from './productParser';
export { handleGenericProduct } from './genericProductHandler';
export { normalizeText, lightNormalize, normalizeAccents, removePunctuation, removeStopWords } from './textNormalizer';
export { cleanProductQuery, extractProductInfo, hasSpecificModel, suggestQueryImprovements } from './queryProcessor';
export { STOP_WORDS, QUESTION_WORDS, NON_PRODUCT_WORDS, BRAND_SET, GENERIC_PRODUCTS } from './constants';
export { buildGoogleSearchQuery } from './googleQueryBuilder';
