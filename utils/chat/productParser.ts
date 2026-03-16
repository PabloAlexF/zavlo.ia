// Funções básicas de parse de produto (versão simplificada)

export interface ParsedProduct {
  product: string;
  brand?: string;
  model?: string;
  condition?: string;
  location?: string;
  isGeneric: boolean;
  needsLocation: boolean;
}

export function parseProductQuery(query: string): ParsedProduct {
  const lower = query.toLowerCase();
  
  // Detectar condição
  let condition: string | undefined;
  if (lower.includes('novo')) condition = 'novo';
  else if (lower.includes('usado')) condition = 'usado';
  else if (lower.includes('seminovo')) condition = 'seminovo';
  
  // Detectar localização
  const locationMatch = lower.match(/em\s+([a-záàâãéèêíïóôõöúçñ\s]+)/i);
  const location = locationMatch ? locationMatch[1].trim() : undefined;
  
  // Produtos genéricos
  const genericProducts = ['celular', 'notebook', 'computador', 'tv', 'geladeira', 'fogão'];
  const isGeneric = genericProducts.some(g => lower === g || lower === `${g}s`);
  
  return {
    product: query,
    condition,
    location,
    isGeneric,
    needsLocation: false // Modo híbrido cuida disso
  };
}

export function buildSearchQuery(
  parsed: ParsedProduct,
  condition?: string,
  location?: string,
  gender?: string,
  priceMax?: string,
  storage?: string,
  sortBy?: string
): { query: string; sortBy: string } {
  let query = parsed.product;
  
  if (condition && condition !== 'tanto faz') {
    query += ` ${condition}`;
  }
  
  if (location) {
    query += ` em ${location}`;
  }
  
  if (gender) {
    query += ` ${gender}`;
  }
  
  if (storage) {
    query += ` ${storage}`;
  }
  
  if (priceMax) {
    query += ` até R$ ${priceMax}`;
  }
  
  return {
    query: query.trim(),
    sortBy: sortBy || 'RELEVANCE'
  };
}
