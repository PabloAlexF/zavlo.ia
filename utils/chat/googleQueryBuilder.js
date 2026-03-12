// Construtor de query otimizada para Google Search
/**
 * Remove acentos para melhor recall
 */
function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
/**
 * Converte filtro de preço para valor numérico
 */
function extractPriceValue(priceFilter) {
    const match = priceFilter.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1].replace('.', '')) : null;
}
/**
 * Mapeia resposta do usuário para formato da API
 */
function mapSortByToAPI(userChoice) {
    if (!userChoice)
        return 'BEST_MATCH';
    const normalized = userChoice.toLowerCase();
    if (normalized.includes('menor') || normalized.includes('barato')) {
        return 'LOWEST_PRICE';
    }
    if (normalized.includes('maior') || normalized.includes('caro')) {
        return 'HIGHEST_PRICE';
    }
    return 'BEST_MATCH';
}
/**
 * Constrói query otimizada para Google Shopping Scraper
 * IMPORTANTE: Preço NÃO deve ir na query, apenas nos filtros do backend
 */
export function buildGoogleSearchQuery(baseQuery, filters) {
    console.log(`🔍 buildGoogleSearchQuery chamado:`, { baseQuery, filters });
    
    const parts = [];
    // 1. Base query (produto + marca + modelo)
    const cleanBase = baseQuery.trim();
    parts.push(cleanBase);
    // 2. Adiciona condição (remove acentos)
    if (filters.condition && filters.condition !== 'Tanto faz') {
        const normalizedCondition = removeAccents(filters.condition.toLowerCase());
        console.log(`🏷️ Condição adicionada à query: "${filters.condition}" → "${normalizedCondition}"`);
        parts.push(normalizedCondition);
    }
    // 3. PREÇO NÃO VAI NA QUERY - Extrair para filtro separado
    let minPrice;
    let maxPrice;
    if (filters.priceMax) {
        const price = extractPriceValue(filters.priceMax);
        if (price) {
            if (filters.priceMax.includes('Acima')) {
                minPrice = price;
            }
            else {
                maxPrice = price;
            }
        }
    }
    // 4. Adiciona localização (remove acentos)
    if (filters.location && filters.location !== 'não' && filters.location !== 'nao') {
        parts.push(removeAccents(filters.location));
    }
    // 5. Adiciona armazenamento
    if (filters.storage && filters.storage !== 'Tanto faz') {
        parts.push(filters.storage);
    }
    // 6. Adiciona gênero (remove acentos)
    if (filters.gender) {
        parts.push(removeAccents(filters.gender.toLowerCase()));
    }
    return {
        query: parts.join(' ').trim(),
        sortBy: mapSortByToAPI(filters.sortBy),
        minPrice,
        maxPrice
    };
}

console.log('✅ googleQueryBuilder.js carregado - buildGoogleSearchQuery disponível');
/**
 * Exemplo de uso:
 *
 * buildGoogleSearchQuery('iphone 13 pro', {
 *   condition: 'Usado',
 *   priceMax: 'Até R$ 3.000'
 * })
 *
 * Resultado: "iphone 13 pro" usado ate R$3000 preco
 */
