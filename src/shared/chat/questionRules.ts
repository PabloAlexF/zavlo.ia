import type { ClassificationData, ClassificationQuestion } from '@shared/contracts/classification.contract';

export type QuestionPayload = string | ClassificationQuestion;

const SCRAPER_SPECIFIC_FIELDS = new Set([
  'ml_scrape_ofertas',
  'ml_promoted',
  'olx_max_pages',
  'webmotors_seller_data_addon',
  'webmotors_max_requests',
  'google_country',
  'google_language',
  'google_limit',
]);

const GENERIC_FIELDS = new Set([
  'condition',
  'year',
  'location',
  'price_range',
  'brand',
  'gender',
  'size',
  'storage',
  'transmission',
  'fuel',
  'body_type',
  'shoe_type',
]);

const FIELD_SCRAPER_SUPPORT: Record<string, string[]> = {
  ml_scrape_ofertas: ['mercadolivre'],
  ml_promoted: ['mercadolivre'],
  olx_max_pages: ['olx'],
  webmotors_seller_data_addon: ['webmotors'],
  webmotors_max_requests: ['webmotors'],
  google_country: ['google_shopping'],
  google_language: ['google_shopping'],
  google_limit: ['google_shopping'],
  minimum_rating: ['google_shopping', 'mercadolivre'],
  require_free_shipping: ['google_shopping', 'mercadolivre'],
  prefer_installments: ['mercadolivre'],
  priority_discounted: ['google_shopping', 'mercadolivre'],
  prefer_proximity_olx: ['olx'],
  seller_type_preference: ['olx'],
  availability_preference: ['google_shopping', 'olx'],
  prefer_price_drop: ['google_shopping', 'mercadolivre', 'olx', 'webmotors'],
};

const QUESTION_PRIORITY: Record<string, string[]> = {
  car: ['condition', 'year', 'location', 'price_range', 'transmission', 'fuel', 'body_type', 'brand', 'webmotors_seller_data_addon', 'webmotors_max_requests', 'ml_scrape_ofertas', 'ml_promoted', 'olx_max_pages'],
  motorcycle: ['condition', 'year', 'location', 'price_range', 'brand', 'webmotors_seller_data_addon', 'webmotors_max_requests', 'ml_scrape_ofertas', 'ml_promoted', 'olx_max_pages'],
  smartphone: ['storage', 'condition', 'price_range', 'brand'],
  electronics: ['brand', 'condition', 'price_range', 'storage', 'location'],
  appliance: ['brand', 'condition', 'price_range', 'location'],
  furniture: ['condition', 'price_range', 'location', 'brand'],
  fashion: ['gender', 'size', 'condition', 'price_range', 'brand', 'shoe_type'],
  marketplace_used: ['condition', 'location', 'price_range', 'brand'],
  general: ['condition', 'location', 'price_range', 'brand'],
};

export function isVehicleClassification(classification?: ClassificationData | null): boolean {
  return classification?.category === 'car' || classification?.category === 'motorcycle';
}

export function isScraperSpecificField(field?: string | null): boolean {
  return !!field && SCRAPER_SPECIFIC_FIELDS.has(field);
}

export function getVehiclePrimaryScraperByCondition(
  classification?: ClassificationData | null,
): 'mercadolivre' | 'olx' {
  const normalizedCondition = String(classification?.condition || '').toLowerCase();
  return normalizedCondition === 'new' ? 'mercadolivre' : 'olx';
}

export function getDefaultScraperNamesForClassification(classification?: ClassificationData | null): string[] {
  if (isVehicleClassification(classification)) {
    const primary = getVehiclePrimaryScraperByCondition(classification);
    return primary === 'mercadolivre'
      ? ['mercadolivre', 'olx', 'webmotors']
      : ['olx', 'mercadolivre', 'webmotors'];
  }

  return ['google_shopping', 'mercadolivre', 'olx'];
}

export function resolveScraperNames(classification?: ClassificationData | null): string[] {
  const rawScrapers = (classification as any)?.scrapers;
  const parsed = Array.isArray(rawScrapers)
    ? rawScrapers
        .map((item: any) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object' && typeof item.name === 'string') return item.name;
          return null;
        })
        .filter((name: string | null): name is string => !!name)
        .map((name) => name.toLowerCase())
    : [];

  if (parsed.length > 0) {
    if (!isVehicleClassification(classification)) return parsed;
    const primary = getVehiclePrimaryScraperByCondition(classification);
    return [...new Set([primary, ...parsed.filter((name) => name !== primary)])];
  }

  return getDefaultScraperNamesForClassification(classification);
}

export function getPrimaryScraperForFlow(classification?: ClassificationData | null): string | undefined {
  const scraperNames = resolveScraperNames(classification);
  if (scraperNames.length === 1) return scraperNames[0];

  if (isVehicleClassification(classification)) {
    const normalizedCondition = String(classification?.condition || '').toLowerCase();
    if (normalizedCondition === 'new' || normalizedCondition === 'used') {
      return getVehiclePrimaryScraperByCondition(classification);
    }
    return scraperNames[0];
  }

  return scraperNames.length > 0 ? scraperNames[0] : undefined;
}

export function shouldAskWebmotorsSellerAddon(classification?: ClassificationData | null): boolean {
  if (!classification) return false;
  const text = [
    classification.search_query,
    classification.normalized_query,
    (classification as any)?.query,
  ]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join(' ')
    .toLowerCase();

  if (!text) return false;

  return /(lojista|revenda|concession[aá]ria|dealer|frota|frotista|estoque|invent[aá]rio|cnpj|telefone|contato|fornecedor|pesquisa\s*de\s*mercado|market\s*research|benchmark)/i.test(text);
}

export function filterMissingFieldsByScraper(
  fields: string[] = [],
  classification?: ClassificationData | null,
): string[] {
  const scraperNames = resolveScraperNames(classification);
  if (scraperNames.length === 0) return fields;

  return fields.filter((field) => {
    if (GENERIC_FIELDS.has(field)) return true;
    if (field === 'webmotors_seller_data_addon' && !shouldAskWebmotorsSellerAddon(classification)) {
      return false;
    }
    const supportedScrapers = FIELD_SCRAPER_SUPPORT[field];
    if (!supportedScrapers) return true;
    return supportedScrapers.some((scraper) => scraperNames.includes(scraper));
  });
}

export function orderQuestionFields(
  fields: string[] = [],
  classification?: ClassificationData | null,
): string[] {
  const uniqueFields = [...new Set(fields)];
  const priority = QUESTION_PRIORITY[classification?.category || ''] || QUESTION_PRIORITY.general;

  const indexOf = (field: string) => {
    const index = priority.indexOf(field);
    return index === -1 ? priority.length + 100 : index;
  };

  return uniqueFields.sort((a, b) => indexOf(a) - indexOf(b) || a.localeCompare(b));
}

export function getVehicleDisplayLabel(classification?: ClassificationData | null): string | null {
  if (!isVehicleClassification(classification)) return null;
  const anyClassification = classification as any;
  const brand = typeof classification?.detected_brand === 'string' ? classification.detected_brand : '';
  const model = typeof anyClassification?.detected_model === 'string' ? anyClassification.detected_model : '';
  const year = classification?.detected_year ? String(classification.detected_year) : '';
  const composed = [brand, model, year].filter(Boolean).join(' ').trim();

  if (composed) return composed;

  const fallback = String(classification?.search_query || classification?.normalized_query || '').trim();
  return fallback || null;
}

export function getQuestionForField(
  field: string,
  classification?: ClassificationData | null,
  pythonQuestion?: string | ClassificationQuestion | null,
): QuestionPayload {
  if (field === 'ml_scrape_ofertas') {
    return {
      question: 'Quer buscar em ofertas do dia do Mercado Livre? (ignora palavra-chave)',
      suggestions: [
        { label: '🔥 Sim, ofertas do dia', value: 'sim' },
        { label: '🔎 Não, busca normal', value: 'não' },
      ],
    };
  }
  if (field === 'ml_promoted') {
    return {
      question: 'Deseja incluir produtos patrocinados do Mercado Livre?',
      suggestions: [
        { label: '📣 Sim, incluir patrocinados', value: 'sim' },
        { label: '🚫 Não, apenas orgânicos', value: 'não' },
      ],
    };
  }
  if (field === 'olx_max_pages') {
    return {
      question: 'Na OLX, quantas páginas devo buscar? (mais páginas = mais créditos)',
      suggestions: [
        { label: '1 página (~50 anúncios) • custo normal', value: '1' },
        { label: '2 páginas (~100 anúncios) • +1 crédito OLX', value: '2' },
        { label: '3 páginas (~150 anúncios) • +2 créditos OLX', value: '3' },
      ],
    };
  }
  if (field === 'webmotors_seller_data_addon') {
    return {
      question: 'Na Webmotors, deseja buscar também dados completos do vendedor? ⚠️ CNPJ e telefone podem consumir créditos extras.',
      suggestions: [
        { label: '👤 Sim, trazer dados do vendedor', value: 'sim' },
        { label: '🚫 Não, apenas dados do veículo', value: 'não' },
      ],
    };
  }
  if (field === 'webmotors_max_requests') {
    return {
      question: 'Na Webmotors, até quantas páginas/requests devo percorrer? ⚠️ Mais profundidade pode aumentar tempo e créditos.',
      suggestions: [
        { label: '5 requests • busca mais rápida', value: '5' },
        { label: '10 requests • padrão da Webmotors', value: '10' },
        { label: '20 requests • cobertura maior e mais créditos', value: '20' },
      ],
    };
  }
  if (field === 'google_country') {
    return {
      question: 'Em qual país você quer buscar no Google Shopping?',
      suggestions: [
        { label: '🇧🇷 Brasil (br)', value: 'br' },
        { label: '🇺🇸 EUA (us)', value: 'us' },
        { label: '🇬🇧 Reino Unido (gb)', value: 'gb' },
        { label: '🇩🇪 Alemanha (de)', value: 'de' },
      ],
    };
  }
  if (field === 'google_language') {
    return {
      question: 'Qual idioma dos resultados do Google Shopping?',
      suggestions: [
        { label: 'Português (pt)', value: 'pt' },
        { label: 'Inglês (en)', value: 'en' },
        { label: 'Espanhol (es)', value: 'es' },
        { label: 'Francês (fr)', value: 'fr' },
      ],
    };
  }
  if (field === 'google_limit') {
    return {
      question: 'Quantos resultados por página no Google Shopping? ⚠️ Quanto mais resultados, mais créditos esta busca pode consumir.',
      suggestions: [
        { label: '20 resultados • menor consumo de créditos', value: '20' },
        { label: '50 resultados • consumo intermediário', value: '50' },
        { label: '100 resultados • maior consumo de créditos', value: '100' },
      ],
    };
  }
  if (field === 'condition') return 'Você prefere novo ou usado?';
  if (field === 'year') return 'De qual ano? (Ex: 2020, 2018-2022)';
  if (field === 'location') {
    const vehicleLabel = getVehicleDisplayLabel(classification);
    if (vehicleLabel) {
      return `Em qual cidade/estado você está procurando por ${vehicleLabel}? (ou "todo o Brasil")`;
    }
    return 'Em qual cidade/estado você está procurando? (ou "todo o Brasil")';
  }
  if (field === 'price_range') {
    return (pythonQuestion && typeof pythonQuestion === 'object') ? pythonQuestion : {
      question: 'Qual sua faixa de preço?',
      suggestions: [
        { label: 'até 30mil', max: 30000 },
        { label: 'até 50mil', max: 50000 },
        { label: 'até 80mil', max: 80000 },
        { label: 'acima de 80mil', min: 80000 },
      ],
    };
  }
  if (field === 'minimum_rating') {
    return {
      question: 'Prefere priorizar produtos bem avaliados?',
      suggestions: [
        { label: '⭐⭐⭐⭐⭐ Excelente (4.8+)', value: 'excelente' },
        { label: '⭐⭐⭐⭐ Muito bom (4.5+)', value: 'muito bom' },
        { label: '⭐⭐⭐ Bom (4.0+)', value: 'bom' },
        { label: 'Qualquer um', value: 'qualquer' },
      ],
    };
  }
  if (field === 'require_free_shipping') {
    return {
      question: 'Frete grátis é importante para você?',
      suggestions: [
        { label: '🎁 Sim, frete grátis', value: 'sim' },
        { label: 'Preço final importa mais', value: 'não' },
      ],
    };
  }
  if (field === 'prefer_installments') {
    return {
      question: 'Prefere parcelamento sem juros?',
      suggestions: [
        { label: '💳 Sim, sem juros (Mercadolivre)', value: 'sim' },
        { label: 'Qualquer forma de pagamento', value: 'não' },
      ],
    };
  }
  if (field === 'priority_discounted') {
    return {
      question: 'Quer ver ofertas com promoção primeiro?',
      suggestions: [
        { label: '🎉 Sim, com desconto (prioritário)', value: 'sim' },
        { label: 'Preço relevante importa mais', value: 'não' },
      ],
    };
  }
  if (field === 'prefer_proximity_olx') {
    return {
      question: 'Quer priorizar ofertas perto de você? (OLX)',
      suggestions: [
        { label: '📍 Sim, mais próximo', value: 'sim' },
        { label: 'Por todo o Brasil', value: 'não' },
      ],
    };
  }
  if (field === 'seller_type_preference') {
    return {
      question: 'Qual tipo de vendedor você confia mais?',
      suggestions: [
        { label: '🏢 Lojas profissionais', value: 'profissional' },
        { label: '👤 Usuários particulares', value: 'particular' },
        { label: 'Qualquer um', value: 'qualquer' },
      ],
    };
  }
  if (field === 'availability_preference') {
    return {
      question: 'Preferência de disponibilidade:',
      suggestions: [
        { label: '✅ Em estoque agora', value: 'agora' },
        { label: 'Sob encomenda OK', value: 'flexível' },
      ],
    };
  }
  if (field === 'prefer_price_drop') {
    return {
      question: 'Quer priorizar produtos com preço em queda recente?',
      suggestions: [
        { label: '📉 Sim, em queda', value: 'sim' },
        { label: 'Tanto faz', value: 'não' },
      ],
    };
  }

  if (['gender', 'size', 'storage', 'transmission', 'fuel', 'body_type', 'brand', 'shoe_type'].includes(field)) {
    if (pythonQuestion && typeof pythonQuestion === 'object') return pythonQuestion;
    const fallbacks: Record<string, ClassificationQuestion> = {
      gender: { question: 'Para quem é?', suggestions: [
        { label: '👨 Masculino', value: 'masculino' },
        { label: '👩 Feminino', value: 'feminino' },
        { label: '🧒 Infantil', value: 'infantil' },
        { label: '🔀 Unissex', value: 'unissex' },
      ]},
      size: { question: 'Qual tamanho/número?', suggestions: [
        { label: 'P / 36-37', value: 'P 36' },
        { label: 'M / 38-39', value: 'M 38' },
        { label: 'G / 40-41', value: 'G 40' },
        { label: 'GG / 42+', value: 'GG 42' },
      ]},
      storage: { question: 'Qual capacidade de armazenamento?', suggestions: [
        { label: '64 GB', value: '64gb' },
        { label: '128 GB', value: '128gb' },
        { label: '256 GB', value: '256gb' },
        { label: '512 GB', value: '512gb' },
      ]},
      transmission: { question: 'Qual câmbio você prefere?', suggestions: [
        { label: '⚙️ Manual', value: 'manual' },
        { label: '🤖 Automático', value: 'automatico' },
        { label: '🔀 Tanto faz', value: 'qualquer' },
      ]},
      fuel: { question: 'Qual combustível você prefere?', suggestions: [
        { label: '⛽ Flex', value: 'flex' },
        { label: '🛢️ Diesel', value: 'diesel' },
        { label: '⚡ Elétrico', value: 'eletrico' },
        { label: '🔀 Tanto faz', value: 'qualquer' },
      ]},
      body_type: { question: 'Qual estilo de carroceria?', suggestions: [
        { label: '🚗 Hatch', value: 'hatch' },
        { label: '🚙 Sedan', value: 'sedan' },
        { label: '🛻 SUV', value: 'suv' },
        { label: '🚐 Pickup', value: 'pickup' },
        { label: '🔀 Tanto faz', value: 'qualquer' },
      ]},
      brand: { question: 'Tem preferência de marca?', suggestions: [
        { label: '🔀 Sem preferência', value: 'qualquer' },
      ]},
      shoe_type: { question: 'Que tipo de calçado?', suggestions: [
        { label: '👟 Tênis', value: 'tenis' },
        { label: '👢 Bota', value: 'bota' },
        { label: '👡 Sandália', value: 'sandalia' },
        { label: '🥿 Sapatilha', value: 'sapatilha' },
      ]},
    };
    return fallbacks[field] ?? field;
  }

  return pythonQuestion || field;
}

export function isQuestionPayload(value: unknown): value is QuestionPayload {
  if (typeof value === 'string') return value.trim().length > 0;
  if (!value || typeof value !== 'object') return false;
  const questionValue = (value as { question?: unknown }).question;
  return typeof questionValue === 'string' && questionValue.trim().length > 0;
}

export function isRawFieldToken(value: string): boolean {
  return /^[a-z_]+$/.test(value.trim());
}

export function resolveQuestionForField(
  field: string,
  candidate: unknown,
  classification?: ClassificationData | null,
  pythonQuestion?: string | ClassificationQuestion | null,
): QuestionPayload {
  if (!isQuestionPayload(candidate)) return getQuestionForField(field, classification, pythonQuestion);
  if (typeof candidate === 'string' && isRawFieldToken(candidate)) {
    return getQuestionForField(field, classification, pythonQuestion);
  }
  return candidate;
}

export function getMercadoLivreQuestionFields(
  classification?: ClassificationData | null,
  answers: Record<string, string> = {},
): string[] {
  if (getPrimaryScraperForFlow(classification) !== 'mercadolivre') return [];
  const classificationAny = classification as any;
  const fields: string[] = [];

  if (answers.ml_scrape_ofertas === undefined && classificationAny?.ml_scrape_ofertas === undefined) {
    fields.push('ml_scrape_ofertas');
  }
  if (answers.ml_promoted === undefined && classificationAny?.ml_promoted === undefined) {
    fields.push('ml_promoted');
  }

  return fields;
}

export function getOlxQuestionFields(
  classification?: ClassificationData | null,
  answers: Record<string, string> = {},
): string[] {
  if (getPrimaryScraperForFlow(classification) !== 'olx') return [];
  const classificationAny = classification as any;
  if (answers.olx_max_pages !== undefined || classificationAny?.olx_max_pages !== undefined) return [];
  return ['olx_max_pages'];
}

export function getGoogleShoppingQuestionFields(
  classification?: ClassificationData | null,
  answers: Record<string, string> = {},
): string[] {
  if (getPrimaryScraperForFlow(classification) !== 'google_shopping') return [];
  const classificationAny = classification as any;
  const fields: string[] = [];

  if (answers.google_country === undefined && classificationAny?.google_country === undefined) {
    fields.push('google_country');
  }
  if (answers.google_language === undefined && classificationAny?.google_language === undefined) {
    fields.push('google_language');
  }
  if (answers.google_limit === undefined && classificationAny?.google_limit === undefined) {
    fields.push('google_limit');
  }

  return fields;
}

export function getWebmotorsQuestionFields(
  classification?: ClassificationData | null,
  answers: Record<string, string> = {},
): string[] {
  if (getPrimaryScraperForFlow(classification) !== 'webmotors') return [];
  const classificationAny = classification as any;
  const fields: string[] = [];

  if (
    shouldAskWebmotorsSellerAddon(classification)
    && answers.webmotors_seller_data_addon === undefined
    && classificationAny?.webmotors_seller_data_addon === undefined
  ) {
    fields.push('webmotors_seller_data_addon');
  }

  if (answers.webmotors_max_requests === undefined && classificationAny?.webmotors_max_requests === undefined) {
    fields.push('webmotors_max_requests');
  }

  return fields;
}
