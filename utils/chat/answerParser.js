// Parser inteligente para respostas de perguntas
export function parseAnswer(answer, options) {
    const normalized = answer.toLowerCase().trim();
    // Tenta número primeiro
    const numberMatch = normalized.match(/^(\\d+)/);
    if (numberMatch) {
        const index = parseInt(numberMatch[1]) - 1;
        if (index >= 0 && index < options.length) {
            return options[index];
        }
    }
    // Tenta match por texto
    for (const option of options) {
        const optionLower = option.toLowerCase();
        // Match exato
        if (normalized === optionLower) {
            return option;
        }
        // Match por palavras-chave específicas
        if (optionLower.includes('novo') && normalized.includes('novo')) {
            return option;
        }
        if (optionLower.includes('usado') && normalized.includes('usado')) {
            return option;
        }
        if (optionLower.includes('gamer') && normalized.includes('gamer')) {
            return option;
        }
        if (optionLower.includes('tanto') && normalized.includes('tanto')) {
            return option;
        }
        // Match parcial melhorado (evita falsos matches)
        const optionWords = optionLower.split(' ');
        if (optionWords.some(word => normalized === word && word.length > 2)) {
            return option;
        }
    }
    // Fallback: retorna a resposta original
    return answer;
}
