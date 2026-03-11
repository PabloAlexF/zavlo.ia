// Sistema de detecção inteligente de marca e enriquecimento de dados

interface BrandInfo {
  name: string;
  category: string;
  aliases: string[];
}

interface ModelInfo {
  brand: string;
  category: string;
  fullName: string;
}

interface ProductEntity {
  category: string;
  brand?: string;
  aliases: string[];
}

interface ProductEnrichment {
  detectedBrand?: string;
  detectedModel?: string;
  category?: string;
  condition?: 'novo' | 'usado';
  gender?: 'masculino' | 'feminino' | 'unissex';
  needsGenderQuestion: boolean;
  needsConditionQuestion: boolean;
  enrichedQuery: string;
  intent?: SearchIntent;
}

interface SearchIntent {
  priceSensitive?: boolean;
  premium?: boolean;
  feature?: string;
}

// Tokens conhecidos para split inteligente
const KNOWN_TOKENS = ['nike', 'air', 'max', 'force', 'jordan', 'adidas', 'ultra', 'boost', 'new', 'balance', 'asics', 'gel', 'puma', 'tenis'];

// Product Aliases - Sinônimos de produtos
const PRODUCT_ALIASES: Record<string, string[]> = {
  'tenis': ['tênis', 'sneaker', 'running shoe', 'tenis de corrida', 'airmax'],
  'celular': ['smartphone', 'phone', 'telefone'],
  'notebook': ['laptop', 'computador portátil'],
  'tv': ['televisão', 'televisao', 'smart tv'],
  'geladeira': ['refrigerador', 'freezer'],
  'fogao': ['fogão', 'cooktop'],
  'carro': ['veículo', 'veiculo', 'automóvel', 'automovel'],
  'moto': ['motocicleta', 'motorcycle']
};

// Product Entities - Produtos específicos com categoria e marca
const PRODUCT_ENTITIES: Record<string, ProductEntity> = {
  'iphone': { category: 'smartphone', brand: 'apple', aliases: ['iphone', 'apple iphone'] },
  'macbook': { category: 'laptop', brand: 'apple', aliases: ['macbook', 'apple macbook'] },
  'ipad': { category: 'tablet', brand: 'apple', aliases: ['ipad', 'apple ipad'] },
  'galaxy': { category: 'smartphone', brand: 'samsung', aliases: ['galaxy', 'samsung galaxy'] },
  'ps5': { category: 'console', brand: 'sony', aliases: ['playstation 5', 'playstation', 'ps5'] },
  'xbox': { category: 'console', brand: 'microsoft', aliases: ['xbox series', 'xbox one'] },
  'switch': { category: 'console', brand: 'nintendo', aliases: ['nintendo switch'] }
};

// Product Knowledge Graph - Modelos específicos (ordenado por tamanho)
const MODEL_KNOWLEDGE: Record<string, ModelInfo> = {
  'cloudrunner 2': { brand: 'on running', category: 'running shoe', fullName: 'On Cloudrunner 2' },
  'cloudrunner': { brand: 'on running', category: 'running shoe', fullName: 'On Cloudrunner' },
  'cloudflow': { brand: 'on running', category: 'running shoe', fullName: 'On Cloudflow' },
  'cloudswift': { brand: 'on running', category: 'running shoe', fullName: 'On Cloudswift' },
  'air max 270': { brand: 'nike', category: 'running shoe', fullName: 'Nike Air Max 270' },
  'air max 90': { brand: 'nike', category: 'running shoe', fullName: 'Nike Air Max 90' },
  'air max': { brand: 'nike', category: 'running shoe', fullName: 'Nike Air Max' },
  'air force 1': { brand: 'nike', category: 'sneaker', fullName: 'Nike Air Force 1' },
  'air force': { brand: 'nike', category: 'sneaker', fullName: 'Nike Air Force' },
  'jordan 1': { brand: 'nike', category: 'sneaker', fullName: 'Air Jordan 1' },
  'jordan': { brand: 'nike', category: 'sneaker', fullName: 'Air Jordan' },
  'ultraboost 22': { brand: 'adidas', category: 'running shoe', fullName: 'Adidas Ultraboost 22' },
  'ultraboost': { brand: 'adidas', category: 'running shoe', fullName: 'Adidas Ultraboost' },
  'nmd': { brand: 'adidas', category: 'sneaker', fullName: 'Adidas NMD' },
  'superstar': { brand: 'adidas', category: 'sneaker', fullName: 'Adidas Superstar' },
  'yeezy': { brand: 'adidas', category: 'sneaker', fullName: 'Adidas Yeezy' },
  'suede': { brand: 'puma', category: 'sneaker', fullName: 'Puma Suede' },
  'rs-x': { brand: 'puma', category: 'sneaker', fullName: 'Puma RS-X' },
  'gel kayano': { brand: 'asics', category: 'running shoe', fullName: 'Asics Gel Kayano' },
  'gel nimbus': { brand: 'asics', category: 'running shoe', fullName: 'Asics Gel Nimbus' },
  'gel': { brand: 'asics', category: 'running shoe', fullName: 'Asics Gel' },
  '990v5': { brand: 'new balance', category: 'running shoe', fullName: 'New Balance 990v5' },
  '990': { brand: 'new balance', category: 'running shoe', fullName: 'New Balance 990' },
  '574': { brand: 'new balance', category: 'sneaker', fullName: 'New Balance 574' }
};

// Versões válidas por linha de produto (evita capturar tamanhos/anos)
const VALID_VERSIONS: Record<string, string[]> = {
  'air max': ['90', '95', '97', '98', '200', '270', '720', '2090'],
  'air force': ['1', '07'],
  'jordan': ['1', '3', '4', '5', '6', '11', '12', '13'],
  'ultraboost': ['19', '20', '21', '22', '23'],
  'gel': ['1090', '1130'],
  '990': ['v3', 'v4', 'v5', 'v6']
};

// Ordenar modelos por tamanho (mais específicos primeiro)
const SORTED_MODELS = Object.entries(MODEL_KNOWLEDGE)
  .sort((a, b) => b[0].length - a[0].length);

// Base de conhecimento de marcas específicas
const BRAND_KNOWLEDGE: Record<string, BrandInfo> = {
  'on': {
    name: 'On Running',
    category: 'running shoe',
    aliases: ['on running', 'on shoes']
  },
  'nike': {
    name: 'Nike',
    category: 'sportswear',
    aliases: ['nike']
  },
  'adidas': {
    name: 'Adidas',
    category: 'sportswear',
    aliases: ['adidas']
  }
};

// Regex para produtos que precisam de gênero (mais robusto)
const GENDER_PRODUCT_REGEX = /\b(tenis|tênis|sapato|bota|sandalia|sandália|camisa|camiseta|blusa|calça|short|bermuda|jaqueta|casaco|moletom)\b/i;

// Regex para versões de produtos
const VERSION_PATTERNS = {
  iphone: /iphone\s*(\d+)\s*(pro|max|plus|mini)?\s*(max)?/i,
  galaxy: /galaxy\s*(s|note|a|z)?\s*(\d+)\s*(ultra|plus)?/i,
  macbook: /macbook\s*(air|pro)?\s*(\d+)?/i
};

// Palavras de intenção
const INTENT_KEYWORDS = {
  priceSensitive: ['barato', 'barata', 'promoção', 'promocao', 'desconto', 'oferta', 'economico'],
  premium: ['top', 'melhor', 'premium', 'luxo', 'flagship'],
  features: ['camera', 'câmera', 'bateria', 'tela', 'processador', 'memoria']
};

/**
 * Normaliza query com split inteligente (Token Matching)
 * airmax97 -> air max 97
 * nikeairmax -> nike air max
 */
function smartNormalize(query: string): string {
  let normalized = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/([a-z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-z])/g, '$1 $2')
    .replace(/[^a-z0-9 ]/g, ' ');
  
  // Split tokens colados
  for (const token of KNOWN_TOKENS) {
    const pattern = new RegExp(`(${token})`, 'g');
    normalized = normalized.replace(pattern, ' $1 ');
  }
  
  return normalized.replace(/\s+/g, ' ').trim();
}

/**
 * Normaliza aliases (sneaker → tenis)
 */
export function normalizeProductAliases(query: string): string {
  // Aplica smart normalize primeiro
  let normalized = smartNormalize(query);
  
  // Depois aplica aliases
  for (const [canonical, aliases] of Object.entries(PRODUCT_ALIASES)) {
    for (const alias of aliases) {
      const pattern = new RegExp(`\\b${alias}\\b`, 'gi');
      normalized = normalized.replace(pattern, canonical);
    }
  }
  return normalized;
}

/**
 * Detecta versão (iPhone 13, Galaxy S23)
 */
export function detectProductVersion(query: string): { product?: string; version?: string; variant?: string } {
  const normalized = query.toLowerCase();
  
  const iphoneMatch = normalized.match(VERSION_PATTERNS.iphone);
  if (iphoneMatch) {
    return {
      product: 'iphone',
      version: iphoneMatch[1],
      variant: [iphoneMatch[2], iphoneMatch[3]].filter(Boolean).join(' ') || undefined
    };
  }
  
  const galaxyMatch = normalized.match(VERSION_PATTERNS.galaxy);
  if (galaxyMatch) {
    return {
      product: 'galaxy',
      version: `${galaxyMatch[1] || ''}${galaxyMatch[2] || ''}`.trim(),
      variant: galaxyMatch[3] || undefined
    };
  }
  
  return {};
}

/**
 * Detecta intenção (preço, premium, features)
 */
export function detectSearchIntent(query: string): SearchIntent {
  const normalized = query.toLowerCase();
  const intent: SearchIntent = {};
  
  if (INTENT_KEYWORDS.priceSensitive.some(kw => normalized.includes(kw))) {
    intent.priceSensitive = true;
  }
  
  if (INTENT_KEYWORDS.premium.some(kw => normalized.includes(kw))) {
    intent.premium = true;
  }
  
  for (const feature of INTENT_KEYWORDS.features) {
    if (normalized.includes(feature)) {
      intent.feature = feature;
      break;
    }
  }
  
  return intent;
}

/**
 * Detecta produto específico (iPhone, MacBook, PS5, etc)
 */
export function detectProductEntity(query: string): { brand?: string; category?: string } {
  const normalized = query.toLowerCase();
  
  for (const [productKey, productInfo] of Object.entries(PRODUCT_ENTITIES)) {
    const pattern = new RegExp(`\\b${productKey}\\b`, 'i');
    if (pattern.test(normalized)) {
      return {
        brand: productInfo.brand,
        category: productInfo.category
      };
    }
  }
  
  return {};
}

/**
 * Detecta modelo e marca usando Product Knowledge Graph
 * Usa word boundary e ordenação por tamanho
 * Captura versão logo após o modelo com validação
 */
export function detectModelAndBrand(query: string): { brand?: string; model?: string; category?: string } {
  const normalized = query.toLowerCase();
  
  // Busca no knowledge graph (modelos mais específicos primeiro)
  for (const [modelKey, modelInfo] of SORTED_MODELS) {
    const pattern = new RegExp(`\\b${modelKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (pattern.test(normalized)) {
      let fullModel = modelInfo.fullName;
      
      // Captura versão logo após o modelo (evita anos/tamanhos distantes)
      const versionPattern = new RegExp(`${modelKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(\\d{1,4})`, 'i');
      const versionMatch = normalized.match(versionPattern);
      if (versionMatch && versionMatch[1]) {
        // Valida se é versão válida para essa linha de produto
        const validVersions = VALID_VERSIONS[modelKey];
        if (!validVersions || validVersions.includes(versionMatch[1])) {
          fullModel = `${modelInfo.fullName} ${versionMatch[1]}`;
        }
      }
      
      return {
        brand: modelInfo.brand,
        model: fullModel,
        category: modelInfo.category
      };
    }
  }
  
  return {};
}

/**
 * Detecta condição automaticamente (usado/novo)
 * IMPORTANTE: Remove da query para evitar duplicação
 */
export function detectCondition(query: string): 'novo' | 'usado' | undefined {
  const normalized = query.toLowerCase();
  
  // Detecta "usado" e variações
  if (/\b(usado|usada|usados|usadas|seminovo|seminova|semi-novo|semi-nova)\b/i.test(normalized)) {
    return 'usado';
  }
  
  // Detecta "novo" e variações
  if (/\b(novo|nova|novos|novas|lacrado|lacrada|na caixa|zero|0km)\b/i.test(normalized)) {
    return 'novo';
  }
  
  return undefined;
}

/**
 * Remove condição da query (evita duplicação)
 */
function removeCondition(query: string): string {
  return query.replace(/\b(novo|nova|novos|novas|usado|usada|usados|usadas|seminovo|seminova|lacrado|lacrada)\b/gi, '').replace(/\s+/g, ' ').trim();
}

/**
 * Enriquece a query com informações contextuais
 */
export function enrichProductQuery(query: string): ProductEnrichment {
  // 0. Normaliza aliases
  const normalizedQuery = normalizeProductAliases(query);
  
  // Remove condição para evitar duplicação no modelo
  const queryWithoutCondition = removeCondition(normalizedQuery);
  const normalized = queryWithoutCondition.toLowerCase();
  
  // 1. Detecta versão
  const versionInfo = detectProductVersion(query);
  
  // 2. Detecta produto específico
  const productEntity = detectProductEntity(query);
  
  // 3. Detecta modelo e marca (usa query sem condição)
  const modelDetection = detectModelAndBrand(queryWithoutCondition);
  
  const detectedBrand = modelDetection.brand || productEntity.brand;
  let detectedModel = modelDetection.model;
  
  // Enriquece com versão
  if (versionInfo.version) {
    const versionStr = [versionInfo.version, versionInfo.variant].filter(Boolean).join(' ');
    detectedModel = detectedModel ? `${detectedModel} ${versionStr}` : versionStr;
  }
  
  const category = modelDetection.category || productEntity.category;
  
  // 4. Detecta condição (da query original)
  const condition = detectCondition(query);
  
  // 5. Detecta intenção
  const intent = detectSearchIntent(query);
  
  // 6. Verifica gênero
  const needsGenderQuestion = GENDER_PRODUCT_REGEX.test(normalized);
  
  // 7. Verifica condição
  const needsConditionQuestion = !condition;
  
  // 8. Constrói query enriquecida (sem condição)
  let enrichedQuery = queryWithoutCondition;
  
  if (detectedBrand && !normalized.includes(detectedBrand.toLowerCase())) {
    enrichedQuery = `${detectedBrand} ${enrichedQuery}`;
  }
  
  if (category && !normalized.includes(category)) {
    enrichedQuery = `${enrichedQuery} ${category}`;
  }
  
  return {
    detectedBrand,
    detectedModel,
    category,
    condition,
    needsGenderQuestion,
    needsConditionQuestion,
    enrichedQuery: enrichedQuery.trim(),
    intent
  };
}

/**
 * Melhora a ordem das palavras na query final
 * ORDEM CORRETA: produto > marca > modelo > atributos > gênero > condição
 */
export function optimizeQueryOrder(parts: {
  brand?: string;
  model?: string;
  product?: string;
  attributes?: string[];
  gender?: string;
  condition?: string;
}): string {
  const ordered: string[] = [];
  
  // 1. PRODUTO PRIMEIRO (tenis, celular, notebook)
  if (parts.product) {
    ordered.push(parts.product);
  }
  // Se não tem produto mas tem modelo de tênis, adiciona "tenis" ANTES
  else if (!parts.product && parts.model && /air|jordan|ultra|gel|990|574|suede|nmd|yeezy/i.test(parts.model)) {
    ordered.push('tenis');
  }
  
  // 2. MARCA (nike, adidas, samsung)
  if (parts.brand) {
    ordered.push(parts.brand);
  }
  
  // 3. MODELO (air max 97, iphone 15)
  if (parts.model) {
    // Só adiciona se não estiver duplicado no produto
    if (!parts.product || !parts.model.toLowerCase().includes(parts.product.toLowerCase())) {
      ordered.push(parts.model);
    } else {
      ordered.push(parts.model);
    }
  }
  
  // 4. ATRIBUTOS (256gb, preto, gamer)
  if (parts.attributes) {
    for (const attr of parts.attributes) {
      // Só adiciona atributos que não estão no modelo
      if (!parts.model || !parts.model.toLowerCase().includes(attr.toLowerCase())) {
        ordered.push(attr);
      }
    }
  }
  
  // 5. GÊNERO (masculino, feminino)
  if (parts.gender) {
    ordered.push(parts.gender);
  }
  
  // 6. CONDIÇÃO (novo, usado) - NÃO ADICIONA AQUI, vai no buildGoogleSearchQuery
  // Condição é filtro, não parte da query base
  
  return ordered.join(' ').trim();
}

/**
 * Gera pergunta inteligente baseada na marca detectada
 */
export function generateSmartBrandQuestion(detectedBrand: string, originalQuery: string): {
  question: string;
  options: string[];
} {
  const normalized = originalQuery.toLowerCase();
  
  // Se detectou On Running
  if (detectedBrand === 'on running') {
    return {
      question: `Detectei que você quer um ${detectedBrand}. Confirma?`,
      options: [
        'Sim, quero On Running',
        'Não, qualquer marca serve'
      ]
    };
  }
  
  // Pergunta genérica
  return {
    question: `Detectei a marca ${detectedBrand}. Está correto?`,
    options: [
      `Sim, ${detectedBrand}`,
      'Não, outra marca'
    ]
  };
}
