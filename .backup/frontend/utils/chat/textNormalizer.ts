import { STOP_WORDS } from './constants';

// Remove acentos e normaliza texto
export function normalizeAccents(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Remove pontuação e caracteres especiais
export function removePunctuation(text: string): string {
  return text.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Remove stop words
export function removeStopWords(text: string): string {
  return text
    .split(' ')
    .filter(word => word.length > 0 && !STOP_WORDS.has(word))
    .join(' ');
}

// Normalização completa do texto
export function normalizeText(text: string): string {
  // Ordem importante: pontuação PRIMEIRO, depois acentos, depois stop words
  let normalized = removePunctuation(text);
  normalized = normalizeAccents(normalized);
  normalized = removeStopWords(normalized);
  
  return normalized.trim();
}

// Normalização leve (mantém mais contexto)
export function lightNormalize(text: string): string {
  return normalizeAccents(text.trim());
}