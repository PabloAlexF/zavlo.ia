import { STOP_WORDS } from './constants';
// Remove acentos e normaliza texto
export function normalizeAccents(text) {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}
// Remove pontuação e caracteres especiais
export function removePunctuation(text) {
    return text.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}
// Remove stop words
export function removeStopWords(text) {
    return text
        .split(' ')
        .filter(word => word.length > 0 && !STOP_WORDS.has(word))
        .join(' ');
}
// Normalização completa do texto
export function normalizeText(text) {
    // Ordem importante: pontuação PRIMEIRO, depois acentos, depois stop words
    let normalized = removePunctuation(text);
    normalized = normalizeAccents(normalized);
    normalized = removeStopWords(normalized);
    return normalized.trim();
}
// Normalização leve (mantém mais contexto)
export function lightNormalize(text) {
    return normalizeAccents(text.trim());
}
