/**
 * Helper para ordenar produtos localmente
 * Usado quando APIs (Webmotors, Mobiauto) não suportam sortBy
 */

export type SortBy = 'RELEVANCE' | 'LOWEST_PRICE' | 'HIGHEST_PRICE' | 'BEST_MATCH' | 'TOP_RATED';

export interface Product {
  id: string;
  title: string;
  price: number | string;
  rating?: number;
  source?: string;
  [key: string]: any;
}

/**
 * Extrai valor numérico do preço
 */
function extractPrice(price: number | string): number {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  
  // Remover caracteres não numéricos exceto vírgula e ponto
  const cleaned = String(price).replace(/[^0-9.,]/g, '');
  
  // Converter para número (formato brasileiro: 1.234,56)
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  
  return parseFloat(normalized) || 0;
}

/**
 * Ordena produtos baseado no sortBy
 * @param products - Array de produtos
 * @param sortBy - Tipo de ordenação
 * @returns Array ordenado
 */
export function sortProducts(products: Product[], sortBy: SortBy): Product[] {
  if (!products || products.length === 0) return products;
  
  const sorted = [...products]; // Criar cópia para não mutar original
  
  switch (sortBy) {
    case 'LOWEST_PRICE':
      return sorted.sort((a, b) => {
        const priceA = extractPrice(a.price);
        const priceB = extractPrice(b.price);
        return priceA - priceB;
      });
    
    case 'HIGHEST_PRICE':
      return sorted.sort((a, b) => {
        const priceA = extractPrice(a.price);
        const priceB = extractPrice(b.price);
        return priceB - priceA;
      });
    
    case 'TOP_RATED':
      return sorted.sort((a, b) => {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return ratingB - ratingA;
      });
    
    case 'RELEVANCE':
    case 'BEST_MATCH':
    default:
      // Manter ordem original (relevância da API)
      return sorted;
  }
}

/**
 * Ordena produtos por fonte (source)
 * Útil para agrupar resultados de diferentes scrapers
 */
export function sortProductsBySource(products: Product[]): Product[] {
  const sourceOrder = ['Google Shopping', 'OLX', 'Webmotors', 'Mobiauto'];
  
  return [...products].sort((a, b) => {
    const indexA = sourceOrder.indexOf(a.source || '');
    const indexB = sourceOrder.indexOf(b.source || '');
    
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    
    return indexA - indexB;
  });
}

/**
 * Verifica se a fonte suporta sortBy nativo
 */
export function supportsNativeSortBy(source: string): boolean {
  const supportedSources = ['Google Shopping', 'OLX'];
  return supportedSources.includes(source);
}
