// Normalizer avançado com tokenização
export function normalizeAndTokenize(query) {
    const normalized = query
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^\w\s]/g, ' ') // Remove pontuação
        .replace(/\s+/g, ' ') // Normaliza espaços
        .trim();
    const tokens = normalized.split(' ').filter(token => token.length > 0);
    return { normalized, tokens };
}
// Sistema de sinônimos
const SYNONYMS = {
    celular: ['cel', 'celu', 'cell', 'phone'],
    telefone: ['phone', 'fone'],
    notebook: ['note', 'laptop', 'computador'],
    televisao: ['tv', 'televisao'],
    geladeira: ['refrigerador', 'frigobar'],
    fogao: ['fogao', 'cooktop'],
    carro: ['automovel', 'veiculo'],
    moto: ['motocicleta', 'bike']
};
// Expande tokens com sinônimos (bidirecional)
export function expandWithSynonyms(tokens) {
    const expanded = [...tokens];
    for (const token of tokens) {
        for (const [main, synonyms] of Object.entries(SYNONYMS)) {
            // Main → sinônimos
            if (token === main) {
                expanded.push(...synonyms);
            }
            // Sinônimo → main
            if (synonyms.includes(token)) {
                expanded.push(main);
            }
        }
    }
    return [...new Set(expanded)]; // Remove duplicatas
}
