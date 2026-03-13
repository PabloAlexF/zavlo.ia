import { STOP_WORDS, BRAND_SET } from './constants';
import { normalizeAccents } from './textNormalizer';
// Padrões de intenção de compra que devem ser removidos
const PURCHASE_INTENT_PATTERNS = [
    /^(estou|to|tou)\s+(querendo|buscando|procurando|interessado|interessada)\s+/i,
    /^(quero|preciso|busco|procuro|gostaria)\s+(de\s+)?/i,
    /^(vou|vamos)\s+(comprar|buscar)\s+/i,
    /^(me\s+)?(ajuda|ajudem?)\s+(a\s+)?(encontrar|achar)\s+/i
];
// Artigos e preposições específicas para produtos
const PRODUCT_ARTICLES = new Set([
    'um', 'uma', 'uns', 'umas', 'o', 'a', 'os', 'as'
]);
// Limpa a query removendo intenções de compra e mantendo só o produto
export function cleanProductQuery(query) {
    let cleaned = query.toLowerCase().trim();
    // Remove padrões de intenção de compra
    for (const pattern of PURCHASE_INTENT_PATTERNS) {
        cleaned = cleaned.replace(pattern, '');
    }
    // Remove artigos no início
    const words = cleaned.split(/\s+/);
    if (words.length > 1 && PRODUCT_ARTICLES.has(words[0])) {
        words.shift();
        cleaned = words.join(' ');
    }
    // Se ficou vazio, retorna a query original
    const result = cleaned.trim();
    return result || query.toLowerCase().trim();
}
// Detecta se a query tem modelo específico (não precisa localização)
export function hasSpecificModel(query) {
    const normalized = normalizeAccents(query.toLowerCase());
    // Padrões de modelos específicos
    const modelPatterns = [
        /iphone\s+(\d+|se|x|xs|xr|pro|max|mini|plus)/i,
        /galaxy\s+(s\d+|note|a\d+|j\d+)/i,
        /redmi\s+(note|\d+)/i,
        /moto\s+(g\d+|e\d+|x\d+)/i,
        /\b(i[357]|ryzen\s*[357])\b/i,
        /\b\d+gb\b/i,
        /\b\d+\\\"\b/i,
        /\b\d+\s*(polegadas|pol)\b/i
    ];
    return modelPatterns.some(pattern => pattern.test(normalized));
}
// Sugere melhorias para queries muito genéricas
export function suggestQueryImprovements(query) {
    const normalized = normalizeAccents(query.toLowerCase());
    const suggestions = [];
    // Sugestões baseadas no produto
    if (normalized.includes('iphone')) {
        suggestions.push('iPhone 15 Pro', 'iPhone 14', 'iPhone SE');
    }
    else if (normalized.includes('samsung') || normalized.includes('galaxy')) {
        suggestions.push('Samsung Galaxy S24', 'Galaxy A54', 'Galaxy Note');
    }
    else if (normalized.includes('notebook')) {
        suggestions.push('notebook gamer', 'notebook i7', 'notebook Dell');
    }
    else if (normalized.includes('tv')) {
        suggestions.push('Smart TV 50 polegadas', 'TV Samsung', 'TV LG');
    }
    return suggestions;
}
// Extrai informações estruturadas da query
export function extractProductInfo(query) {
    const cleaned = cleanProductQuery(query);
    const normalized = normalizeAccents(cleaned.toLowerCase());
    const words = normalized.split(/\s+/).filter(word => word.length > 0);
    let brand = '';
    let product = '';
    let model = '';
    let priceMax;
    let attributes = [];
    // Detecta filtro de preço
    const priceMatch = query.match(/(até|abaixo de|menor que|máximo)\s*(de\s*)?r?\$?\s*(\d+)/i);
    if (priceMatch) {
        priceMax = Number(priceMatch[3]);
    }
    // Detecta marca
    for (const word of words) {
        if (BRAND_SET.has(word)) {
            brand = word;
            break;
        }
    }
    // Lista de produtos conhecidos de 2 letras
    const SHORT_PRODUCTS = new Set(['hd', 'tv', 'pc', 'ar']);
    
    // Detecta produto principal (primeira palavra não-stop)
    for (const word of words) {
        if (!STOP_WORDS.has(word) && word !== brand) {
            // Aceita palavras com 3+ caracteres OU produtos conhecidos de 2 letras
            if (word.length > 2 || SHORT_PRODUCTS.has(word)) {
                product = word;
                break;
            }
        }
    }
    // Se não encontrou produto, usa a primeira palavra
    if (!product && words.length > 0) {
        product = words[0];
    }
    // Detecta modelo (números + letras, mas NÃO especificações de armazenamento)
    const MODEL_BLACKLIST = new Set(['gamer', 'barato', 'novo', 'usado', 'seminovo', 'ultra', 'nova', 'novos', 'novas', 'usada', 'usados', 'usadas']);
    const STORAGE_PATTERN = /^\d+(gb|tb|mb)$/i; // Padrão de armazenamento: 1tb, 256gb, etc
    const modelPattern = /\b(\d+[a-z]*|[a-z]+\d+|pro|max|mini|plus|se|note)\b/i;
    
    for (const word of words) {
        // Pula se for especificação de armazenamento
        if (STORAGE_PATTERN.test(word)) {
            continue;
        }
        
        if (modelPattern.test(word) && word !== product && !MODEL_BLACKLIST.has(word)) {
            model = word;
            break;
        }
    }
    // Resto são atributos (remove condições e preços, mas mantém especificações como "1tb", "256gb")
    const CONDITION_WORDS = new Set(['novo', 'nova', 'novos', 'novas', 'usado', 'usada', 'usados', 'usadas', 'seminovo', 'seminova']);
    const PRICE_WORDS = new Set(['ate', 'até', 'abaixo', 'menor', 'maximo', 'máximo', 'reais', 'real']);
    
    attributes = words.filter(word => 
        !STOP_WORDS.has(word) &&
        !CONDITION_WORDS.has(word) &&
        !PRICE_WORDS.has(word) &&
        word !== brand &&
        word !== product &&
        word !== model
    );
    return {
        original: query,
        cleaned,
        brand,
        product,
        model,
        priceMax,
        attributes,
        hasSpecificModel: hasSpecificModel(cleaned),
        isGeneric: !brand && !model && attributes.length === 0 && !hasSpecificModel(cleaned)
    };
}
