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
  review?: boolean;
}

// Stopwords que devem ser removidos da query
const STOPWORDS = new Set([
  'quero', 'comprar', 'me', 'mostra', 'mostrar', 'buscar', 'procurar',
  'um', 'uma', 'o', 'a', 'de', 'para', 'com', 'por', 'favor', 'ai', 'pra', 'tipo', 'algum'
]);

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

// ✅ Categorias canônicas (consistência)
type CanonicalCategory = 'running_shoe' | 'sneaker' | 'smartphone' | 'laptop' | 'tablet' | 'console' | 'tv' | 'appliance' | 'vehicle';

// Product Knowledge Graph - Modelos específicos (ordenado por tamanho)
const MODEL_KNOWLEDGE: Record<string, ModelInfo & { canonical: CanonicalCategory }> = {
  'cloudrunner 2': { brand: 'on running', category: 'running shoe', fullName: 'On Cloudrunner 2', canonical: 'running_shoe' },
  'cloudrunner': { brand: 'on running', category: 'running shoe', fullName: 'On Cloudrunner', canonical: 'running_shoe' },
  'cloudflow': { brand: 'on running', category: 'running shoe', fullName: 'On Cloudflow', canonical: 'running_shoe' },
  'cloudswift': { brand: 'on running', category: 'running shoe', fullName: 'On Cloudswift', canonical: 'running_shoe' },
  'air max 270': { brand: 'nike', category: 'running shoe', fullName: 'Nike Air Max 270', canonical: 'running_shoe' },
  'air max 90': { brand: 'nike', category: 'running shoe', fullName: 'Nike Air Max 90', canonical: 'running_shoe' },
  'air max': { brand: 'nike', category: 'running shoe', fullName: 'Nike Air Max', canonical: 'running_shoe' },
  'air force 1': { brand: 'nike', category: 'sneaker', fullName: 'Nike Air Force 1', canonical: 'sneaker' },
  'air force': { brand: 'nike', category: 'sneaker', fullName: 'Nike Air Force', canonical: 'sneaker' },
  'jordan 1': { brand: 'nike', category: 'sneaker', fullName: 'Air Jordan 1', canonical: 'sneaker' },
  'jordan': { brand: 'nike', category: 'sneaker', fullName: 'Air Jordan', canonical: 'sneaker' },
  'ultraboost 22': { brand: 'adidas', category: 'running shoe', fullName: 'Adidas Ultraboost 22', canonical: 'running_shoe' },
  'ultraboost': { brand: 'adidas', category: 'running shoe', fullName: 'Adidas Ultraboost', canonical: 'running_shoe' },
  'nmd': { brand: 'adidas', category: 'sneaker', fullName: 'Adidas NMD', canonical: 'sneaker' },
  'superstar': { brand: 'adidas', category: 'sneaker', fullName: 'Adidas Superstar', canonical: 'sneaker' },
  'yeezy': { brand: 'adidas', category: 'sneaker', fullName: 'Adidas Yeezy', canonical: 'sneaker' },
  'suede': { brand: 'puma', category: 'sneaker', fullName: 'Puma Suede', canonical: 'sneaker' },
  'rs-x': { brand: 'puma', category: 'sneaker', fullName: 'Puma RS-X', canonical: 'sneaker' },
  'gel kayano': { brand: 'asics', category: 'running shoe', fullName: 'Asics Gel Kayano', canonical: 'running_shoe' },
  'gel nimbus': { brand: 'asics', category: 'running shoe', fullName: 'Asics Gel Nimbus', canonical: 'running_shoe' },
  'gel': { brand: 'asics', category: 'running shoe', fullName: 'Asics Gel', canonical: 'running_shoe' },
  '990v5': { brand: 'new balance', category: 'running shoe', fullName: 'New Balance 990v5', canonical: 'running_shoe' },
  '990': { brand: 'new balance', category: 'running shoe', fullName: 'New Balance 990', canonical: 'running_shoe' },
  '574': { brand: 'new balance', category: 'sneaker', fullName: 'New Balance 574', canonical: 'sneaker' }
};

// Versões válidas por linha de produto (evita capturar tamanhos/anos)
// ✅ BUG FIX: Chaves normalizadas para lookup correto
const VALID_VERSIONS: Record<string, string[]> = {
  'airmax': ['90', '95', '97', '98', '200', '270', '720', '2090'],
  'airforce': ['1', '07'],
  'jordan': ['1', '3', '4', '5', '6', '11', '12', '13'],
  'ultraboost': ['19', '20', '21', '22', '23'],
  'gel': ['1090', '1130'],
  '990': ['v3', 'v4', 'v5', 'v6']
};

/**
 * ✅ Extrai linha base do modelo para lookup de versões
 * "air max 270" -> "airmax"
 * "gel kayano" -> "gel"
 */
function getModelBaseline(modelKey: string): string {
  return modelKey.replace(/\s+/g, '').toLowerCase();
}

// ✅ Pré-compila regex para performance
const SORTED_MODELS = Object.entries(MODEL_KNOWLEDGE)
  .map(([key, value]) => ({
    key,
    value,
    regex: new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
  }))
  .sort((a, b) => b.key.length - a.key.length);

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

// ✅ Frases compostas para review intent (evita falsos positivos)
const REVIEW_PHRASES = [
  'vale a pena',
  'melhor que',
  'comparação',
  'comparacao',
  'opinião',
  'opiniao',
  'review'
];

/**
 * Normaliza query com split inteligente (Token Matching)
 * airmax97 -> air max 97
 * nikeairmax -> nike air max
 * ✅ BUG FIX: Negative lookahead/lookbehind para evitar quebrar palavras
 */
function smartNormalize(query: string): string {
  let normalized = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/([a-z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-z])/g, '$1 $2')
    .replace(/[^a-z0-9 ]/g, ' ');
  
  // ✅ BUG FIX: Negative lookahead/lookbehind para não quebrar palavras
  for (const token of KNOWN_TOKENS) {
    const pattern = new RegExp(`(?<![a-z])${token}(?![a-z])`, 'g');
    normalized = normalized.replace(pattern, ` ${token} `);
  }
  
  // Remove stopwords
  const words = normalized.split(/\s+/);
  const filtered = words.filter(w => !STOPWORDS.has(w));
  
  return filtered.join(' ').replace(/\s+/g, ' ').trim();
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
 * ✅ BUG FIX: Trim variant para evitar espaços extras
 */
export function detectProductVersion(query: string): { product?: string; version?: string; variant?: string } {
  const normalized = query.toLowerCase();
  
  const iphoneMatch = normalized.match(VERSION_PATTERNS.iphone);
  if (iphoneMatch) {
    return {
      product: 'iphone',
      version: iphoneMatch[1],
      variant: [iphoneMatch[2], iphoneMatch[3]].filter(Boolean).join(' ').trim() || undefined
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
 * Detecta intenção (preço, premium, features, review)
 * ✅ BUG FIX: Word boundary para evitar "melhorar" -> "premium"
 * ✅ BUG FIX: Review usa frases compostas para evitar falsos positivos
 */
export function detectSearchIntent(query: string): SearchIntent {
  const normalized = query.toLowerCase();
  const intent: SearchIntent = {};
  
  // ✅ BUG FIX: Word boundary
  if (INTENT_KEYWORDS.priceSensitive.some(kw => new RegExp(`\\b${kw}\\b`).test(normalized))) {
    intent.priceSensitive = true;
  }
  
  if (INTENT_KEYWORDS.premium.some(kw => new RegExp(`\\b${kw}\\b`).test(normalized))) {
    intent.premium = true;
  }
  
  for (const feature of INTENT_KEYWORDS.features) {
    if (new RegExp(`\\b${feature}\\b`).test(normalized)) {
      intent.feature = feature;
      break;
    }
  }
  
  // ✅ BUG FIX: Review usa frases compostas (evita "melhor qualidade" -> review)
  if (REVIEW_PHRASES.some(phrase => normalized.includes(phrase))) {
    intent.review = true;
  }
  
  return intent;
}

/**
 * Detecta produto específico (iPhone, MacBook, PS5, etc)
 * ✅ BUG FIX: Testa aliases além da chave principal
 * ✅ BUG FIX: Usa query normalizada para evitar problemas com acentos
 */
export function detectProductEntity(query: string): { brand?: string; category?: string } {
  const normalized = normalizeProductAliases(query).toLowerCase();
  
  for (const [productKey, productInfo] of Object.entries(PRODUCT_ENTITIES)) {
    // ✅ Testa chave principal
    const keyPattern = new RegExp(`\\b${productKey}\\b`, 'i');
    if (keyPattern.test(normalized)) {
      return {
        brand: productInfo.brand,
        category: productInfo.category
      };
    }
    
    // ✅ BUG FIX: Testa aliases
    for (const alias of productInfo.aliases) {
      const aliasPattern = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (aliasPattern.test(normalized)) {
        return {
          brand: productInfo.brand,
          category: productInfo.category
        };
      }
    }
  }
  
  return {};
}

/**
 * Detecta modelo e marca usando Product Knowledge Graph
 * Usa word boundary e ordenação por tamanho
 * Captura versão logo após o modelo com validação
 * ✅ BUG FIX: Valida categoria antes de capturar modelo
 * ✅ BUG FIX: Exige contexto mínimo para modelos genéricos (gel)
 * ✅ PERFORMANCE: Regex pré-compilado
 */
export function detectModelAndBrand(query: string): { brand?: string; model?: string; category?: string } {
  const normalized = query.toLowerCase();
  
  // ✅ BUG FIX: Detecta categoria da query primeiro
  const hasShoeContext = /\b(tenis|tênis|sapato|shoe|running|corrida)\b/i.test(normalized);
  const hasElectronicsContext = /\b(celular|smartphone|phone|tv|geladeira|notebook|laptop)\b/i.test(normalized);
  
  // ✅ PERFORMANCE: Usa regex pré-compilado
  for (const model of SORTED_MODELS) {
    if (model.regex.test(normalized)) {
      // ✅ BUG FIX: Valida categoria antes de retornar
      const isShoeModel = model.value.canonical === 'running_shoe' || model.value.canonical === 'sneaker';
      
      // Se query tem contexto de eletrônicos e modelo é de tênis, ignora
      if (hasElectronicsContext && isShoeModel) {
        continue;
      }
      
      // ✅ BUG FIX: Modelos genéricos (gel) exigem contexto de tênis
      const isGenericModel = ['gel', 'suede', 'nmd'].includes(model.key);
      if (isGenericModel && !hasShoeContext) {
        continue;
      }
      
      // Se query não tem contexto de tênis e modelo é de tênis, ignora (exceto se for único match)
      if (!hasShoeContext && isShoeModel && normalized.split(/\s+/).length > 2) {
        continue;
      }
      
      let fullModel = model.value.fullName;
      
      // Captura versão logo após o modelo (evita anos/tamanhos distantes)
      const versionPattern = new RegExp(`${model.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(\\d{1,4})`, 'i');
      const versionMatch = normalized.match(versionPattern);
      if (versionMatch && versionMatch[1]) {
        // ✅ BUG FIX: Usa baseline para lookup de versões
        const baseline = getModelBaseline(model.key);
        const validVersions = VALID_VERSIONS[baseline];
        if (!validVersions || validVersions.includes(versionMatch[1])) {
          fullModel = `${model.value.fullName} ${versionMatch[1]}`;
        }
      }
      
      return {
        brand: model.value.brand,
        model: fullModel,
        category: model.value.category
      };
    }
  }
  
  return {};
}

/**
 * Detecta condição automaticamente (usado/novo)
 * IMPORTANTE: Remove da query para evitar duplicação
 * ✅ BUG FIX: Regex mais específico para "zero" (zero km, 0km)
 */
export function detectCondition(query: string): 'novo' | 'usado' | undefined {
  const normalized = query.toLowerCase();
  
  // Detecta "usado" e variações
  if (/\b(usado|usada|usados|usadas|seminovo|seminova|semi-novo|semi-nova)\b/i.test(normalized)) {
    return 'usado';
  }
  
  // Detecta "novo" e variações (✅ BUG FIX: zero km específico)
  if (/\b(novo|nova|novos|novas|lacrado|lacrada|na caixa|zero\s*km|0km)\b/i.test(normalized)) {
    return 'novo';
  }
  
  return undefined;
}

/**
 * Remove condição da query (evita duplicação)
 * ✅ BUG FIX: Cobre mais variações (semi novo, semi-novo, usadinho)
 */
function removeCondition(query: string): string {
  return query
    .replace(/\b(novo|nova|novos|novas|usado|usada|usados|usadas|usadinho|usadinha)\b/gi, '')
    .replace(/\bsemi[- ]?novo\b/gi, '')
    .replace(/\bsemi[- ]?nova\b/gi, '')
    .replace(/\b(lacrado|lacrada|na caixa|zero\s*km|0km)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
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
  
  // 1. ✅ BUG FIX: Detecta versão com query normalizada
  const versionInfo = detectProductVersion(normalizedQuery);
  
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
  
  // 6. ✅ BUG FIX: Verifica gênero (só pergunta se não detectado)
  const hasGender = /\b(masculino|feminino|unissex)\b/i.test(normalized);
  const needsGenderQuestion = GENDER_PRODUCT_REGEX.test(normalized) && !hasGender;
  
  // 7. Verifica condição
  const needsConditionQuestion = !condition;
  
  // 8. Constrói query enriquecida (sem condição)
  let enrichedQuery = queryWithoutCondition;
  
  // ✅ BUG FIX: Word boundary para evitar duplicação
  if (detectedBrand) {
    const brandRegex = new RegExp(`\\b${detectedBrand.toLowerCase()}\\b`);
    if (!brandRegex.test(normalized)) {
      enrichedQuery = `${detectedBrand} ${enrichedQuery}`;
    }
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
 * ORDEM CORRETA: marca > produto > modelo > atributos > gênero
 * Exemplo: "apple iphone 15 pro max 256gb"
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
  
  // 1. MARCA PRIMEIRO (apple, samsung, nike)
  if (parts.brand) {
    ordered.push(parts.brand);
  }
  
  // 2. PRODUTO (iphone, galaxy, tenis)
  if (parts.product) {
    // Verifica se produto já não está no modelo
    const productLower = parts.product.toLowerCase();
    const modelLower = parts.model?.toLowerCase() || '';
    
    // Só adiciona se não estiver no modelo
    if (!modelLower.includes(productLower)) {
      ordered.push(parts.product);
    }
  }
  // Se não tem produto mas tem modelo de tênis, adiciona "tenis" ANTES do modelo
  else if (!parts.product && parts.model && /air|jordan|ultra|gel|990|574|suede|nmd|yeezy/i.test(parts.model)) {
    ordered.push('tenis');
  }
  
  // 3. MODELO (15 pro max, air max 270)
  if (parts.model) {
    // Remove marca do modelo se já foi adicionada
    let cleanModel = parts.model;
    if (parts.brand) {
      const brandLower = parts.brand.toLowerCase();
      const modelLower = cleanModel.toLowerCase();
      
      // Remove marca do início do modelo
      if (modelLower.startsWith(brandLower + ' ')) {
        cleanModel = cleanModel.substring(parts.brand.length + 1).trim();
      }
    }
    
    // Remove produto do modelo se já foi adicionado
    if (parts.product) {
      const productLower = parts.product.toLowerCase();
      const modelLower = cleanModel.toLowerCase();
      
      // Remove produto do início do modelo
      if (modelLower.startsWith(productLower + ' ')) {
        cleanModel = cleanModel.substring(parts.product.length + 1).trim();
      }
    }
    
    if (cleanModel) {
      ordered.push(cleanModel);
    }
  }
  
  // 4. ATRIBUTOS (256gb, preto, gamer)
  if (parts.attributes && parts.attributes.length > 0) {
    for (const attr of parts.attributes) {
      // Só adiciona atributos que não estão no modelo
      const attrLower = attr.toLowerCase();
      const modelLower = parts.model?.toLowerCase() || '';
      
      if (!modelLower.includes(attrLower)) {
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

// ✅ Configuração escalável para perguntas de marca
const SMART_BRAND_QUESTIONS: Record<string, { question: string; options: string[] }> = {
  'on running': {
    question: 'Detectei que você quer um On Running. Confirma?',
    options: ['Sim, quero On Running', 'Não, qualquer marca serve']
  },
  'nike': {
    question: 'Detectei a marca Nike. Está correto?',
    options: ['Sim, Nike', 'Não, outra marca']
  },
  'adidas': {
    question: 'Detectei a marca Adidas. Está correto?',
    options: ['Sim, Adidas', 'Não, outra marca']
  }
};

/**
 * Gera pergunta inteligente baseada na marca detectada
 * ✅ BUG FIX: Configuração escalável ao invés de if/else
 */
export function generateSmartBrandQuestion(detectedBrand: string, originalQuery: string): {
  question: string;
  options: string[];
} {
  const normalized = detectedBrand.toLowerCase();
  
  // ✅ Lookup na configuração
  const config = SMART_BRAND_QUESTIONS[normalized];
  if (config) {
    return config;
  }
  
  // Fallback genérico
  return {
    question: `Detectei a marca ${detectedBrand}. Está correto?`,
    options: [
      `Sim, ${detectedBrand}`,
      'Não, outra marca'
    ]
  };
}
