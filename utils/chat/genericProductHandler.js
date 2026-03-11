import { GENERIC_PRODUCTS } from './constants';
export function handleGenericProduct(product) {
    const normalized = product.toLowerCase();
    const suggestions = GENERIC_PRODUCTS[normalized];
    if (!suggestions) {
        return `Sua busca por "${product}" é muito genérica. Pode ser mais específico? Por exemplo, mencione uma marca ou modelo.`;
    }
    const suggestionList = suggestions.slice(0, 5).join(', ');
    return `Sua busca por "${product}" é muito genérica. Que tal ser mais específico? Por exemplo:
  
• ${suggestions[0]} ${product}
• ${suggestions[1]} ${product}
• ${suggestions[2]} ${product}

Ou mencione alguma característica específica que você procura!`;
}
