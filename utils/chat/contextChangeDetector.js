// Detecta mudanças de contexto e extrai informações da conversa completa
// Palavras que indicam correção/mudança
const CORRECTION_PATTERNS = [
    /\b(na verdade|não|nao|melhor|prefiro|quero|ao invés|em vez|invés|vez)\b/i,
    /\b(mudei de ideia|mudei|esquece|deixa|cancela)\b/i,
    /\b(errei|erro|desculpa|ops)\b/i,
];
// Palavras que indicam refinamento (não mudança completa)
const REFINEMENT_PATTERNS = [
    /\b(também|e|mais|além|junto|com)\b/i,
    /\b(específico|especifico|detalhe|característica|caracteristica)\b/i,
];
export function detectContextChange(currentMessage, conversationHistory) {
    const normalized = currentMessage.toLowerCase().trim();
    // Verifica se é uma correção
    const isCorrection = CORRECTION_PATTERNS.some(pattern => pattern.test(normalized));
    if (isCorrection) {
        // Extrai o novo produto da mensagem
        const extracted = extractProductFromCorrection(currentMessage);
        return {
            hasChange: true,
            type: 'correction',
            newProduct: extracted.product,
            newBrand: extracted.brand,
            newCondition: extracted.condition,
            newLocation: extracted.location,
            confidence: 0.9,
        };
    }
    // Verifica se é refinamento
    const isRefinement = REFINEMENT_PATTERNS.some(pattern => pattern.test(normalized));
    if (isRefinement) {
        return {
            hasChange: false,
            type: 'refinement',
            confidence: 0.7,
        };
    }
    // Verifica se é uma nova busca (sem relação com anterior)
    if (conversationHistory.length > 0) {
        const lastMessage = conversationHistory[conversationHistory.length - 1];
        const similarity = calculateSimilarity(normalized, lastMessage.toLowerCase());
        if (similarity < 0.3) {
            const extracted = extractProductFromCorrection(currentMessage);
            return {
                hasChange: true,
                type: 'new_search',
                newProduct: extracted.product,
                newBrand: extracted.brand,
                newCondition: extracted.condition,
                newLocation: extracted.location,
                confidence: 0.8,
            };
        }
    }
    return {
        hasChange: false,
        type: 'none',
        confidence: 0.5,
    };
}
// Extrai produto de uma frase de correção
function extractProductFromCorrection(message) {
    const normalized = message.toLowerCase();
    // Remove palavras de correção para focar no produto
    let cleaned = normalized
        .replace(/\b(na verdade|não|nao|melhor|prefiro|quero|ao invés|em vez|invés|vez)\b/gi, '')
        .replace(/\b(mudei de ideia|mudei|esquece|deixa|cancela)\b/gi, '')
        .replace(/\b(comprar|buscar|procurar|encontrar|ver)\b/gi, '')
        .replace(/\b(um|uma|uns|umas|o|a|os|as)\b/gi, '')
        .trim();
    // Extrai condição
    let condition;
    if (/\b(novo|nova)\b/i.test(cleaned)) {
        condition = 'novo';
        cleaned = cleaned.replace(/\b(novo|nova)\b/gi, '').trim();
    }
    else if (/\b(usado|usada|seminovo|seminova)\b/i.test(cleaned)) {
        condition = 'usado';
        cleaned = cleaned.replace(/\b(usado|usada|seminovo|seminova)\b/gi, '').trim();
    }
    // Extrai localização
    let location;
    const locationMatch = cleaned.match(/\b(em|na|no|de)\s+([a-záàâãéèêíïóôõöúçñ\s]+)/i);
    if (locationMatch) {
        location = locationMatch[2].trim();
        cleaned = cleaned.replace(locationMatch[0], '').trim();
    }
    // Extrai marca conhecida
    const brands = [
        'samsung', 'apple', 'lg', 'sony', 'dell', 'hp', 'lenovo', 'asus',
        'brastemp', 'consul', 'electrolux', 'philco', 'midea', 'panasonic',
        'nike', 'adidas', 'puma', 'fila', 'olympikus',
        'ford', 'chevrolet', 'volkswagen', 'fiat', 'honda', 'toyota',
    ];
    let brand;
    for (const b of brands) {
        if (cleaned.includes(b)) {
            brand = b;
            cleaned = cleaned.replace(b, '').trim();
            break;
        }
    }
    // O que sobrou é o produto
    const product = cleaned.trim() || undefined;
    return { product, brand, condition, location };
}
// Calcula similaridade entre duas strings (0-1)
function calculateSimilarity(str1, str2) {
    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
}
