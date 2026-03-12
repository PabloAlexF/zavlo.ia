import { detectContextChange } from './contextChangeDetector';

// ✅ Tipagem forte para resultados de busca
export interface SearchResult {
  id: string;
  title: string;
  price: number;
  brand?: string;
  condition?: 'new' | 'used';
  location?: string;
}

interface ConversationContext {
  lastProduct?: string;
  lastBrand?: string;
  lastLocation?: string;
  lastCondition?: 'new' | 'used';
  lastPriceMax?: number;
  lastResults?: SearchResult[];
  conversationHistory: string[];
}

class ContextManager {
  private context: ConversationContext = {
    conversationHistory: []
  };

  // ✅ Constantes pré-compiladas (performance)
  private readonly MAX_HISTORY = 10;
  
  private readonly STOPWORDS = new Set([
    'quero', 'buscar', 'procuro', 'preciso', 'comprar', 'ver', 'mostrar',
    'gostaria', 'queria', 'estou', 'querendo', 'buscando', 'procurando',
    'barato', 'caro', 'promocao', 'promo', 'oferta', 'melhor', 'preco',
    'bom', 'boa', 'top', 'legal', 'muito', 'mais', 'menos'
  ]);

  private readonly CONDITION_MAP: Record<string, 'new' | 'used'> = {
    'novo': 'new',
    'nova': 'new',
    'usado': 'used',
    'usada': 'used',
    'seminovo': 'used',
    'seminova': 'used'
  };

  // ✅ Regex pré-compilados
  private readonly PRICE_REGEX = /(ate|até|abaixo de|menos de|menor que|max|maximo|máximo)\s*(\d+(?:[.,]\d+)?)(k|mil)?/i;
  private readonly LOCATION_REGEX = /(em|na|no|perto de)\s+(.+)/i;
  private readonly CONDITION_REGEX = /(novo|nova|usado|usada|seminovo|seminova)/i;
  private readonly SEMANTIC_REFINEMENT_REGEX = /^(o|a|os|as)\s+(.+)$/i;
  private readonly BRAND_REFINEMENT_REGEX = /^(so|só|apenas|somente)\s+(?:da|do)?\s*(.+)$/i;
  private readonly CHEAPER_REGEX = /(qual o )?(mais barato|menor preco|menor preço)/i;
  private readonly SORT_REGEX = /(ordenar|ordenado|ordem|classificar)\s+(por\s+)?(preco|preço|relevancia|relevância)/i;
  private readonly EXPENSIVE_REGEX = /(mais caro|maior preco|maior preço)/i;
  private readonly RECENT_REGEX = /(mais recente|recentes|novos anuncios|novos anúncios)/i;
  private readonly REMOVE_FILTER_REGEX = /(remover|tirar|sem)\s+(filtro|preco|preço|condicao|condição)/i;
  private readonly ANY_PRICE_REGEX = /(qualquer preco|qualquer preço|sem preco|sem preço)/i;
  private readonly CHANGE_PRODUCT_REGEX = /^(agora|mudar para|trocar para)\s+(.+)$/i;
  
  private readonly GENERIC_WORDS = new Set([
    'celular', 'telefone', 'notebook', 'laptop', 'produto', 'item', 'coisa'
  ]);

  // ✅ Helper para atualização imutável
  private setContext(data: Partial<ConversationContext>) {
    this.context = { ...this.context, ...data };
  }

  update(data: Partial<ConversationContext>) {
    this.setContext(data);
  }

  // ✅ Get com deep copy (protege arrays)
  get(): ConversationContext {
    return {
      ...this.context,
      conversationHistory: [...this.context.conversationHistory],
      lastResults: this.context.lastResults
        ? [...this.context.lastResults]
        : undefined
    };
  }

  clear() {
    this.context = {
      conversationHistory: [],
      lastProduct: undefined,
      lastBrand: undefined,
      lastLocation: undefined,
      lastCondition: undefined,
      lastPriceMax: undefined,
      lastResults: undefined
    };
  }

  // ✅ Histórico como fila otimizada
  addToHistory(message: string) {
    const history = [...this.context.conversationHistory, message];
    this.context.conversationHistory = history.slice(-this.MAX_HISTORY);
  }

  // ✅ Normalização centralizada
  private normalize(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
  }

  // ✅ Normalização de preço extraída
  private normalizePrice(value: string, unit?: string): number {
    let price = parseFloat(value.replace(',', '.'));
    
    if (unit && ['k', 'mil'].includes(unit.toLowerCase())) {
      price *= 1000;
    }
    
    return Math.round(price);
  }

  // ✅ Extração de produto melhorada (permite números, remove genéricos)
  private extractProduct(query: string): string | null {
    const cleaned = query
      .toLowerCase()
      .replace(/[^\w\s]/g, '');

    const words = cleaned.split(/\s+/);

    const filtered = words.filter(w => {
      if (w.length <= 1) return false;
      if (this.STOPWORDS.has(w)) return false;
      if (this.GENERIC_WORDS.has(w)) return false; // Remove genéricos
      
      // ✅ Permite números em produtos (iphone 15, ps5, gopro 12)
      const hasLetter = /[a-z]/i.test(w);
      const isShortNumber = /^\d{1,3}$/.test(w);
      
      return hasLetter || isShortNumber;
    });

    if (!filtered.length) return null;

    // Até 4 palavras para cobrir "iphone 15 pro max"
    return filtered.slice(0, 4).join(' ');
  }

  // ✅ Handler: Correção de contexto
  private handleCorrection(query: string, history: string[]): string | null {
    const change = detectContextChange(query, history);
    
    if (!change.hasChange || change.type !== 'correction') return null;

    // Atualiza contexto com correções
    const updates: Partial<ConversationContext> = {};
    if (change.newProduct) updates.lastProduct = change.newProduct;
    if (change.newBrand) updates.lastBrand = change.newBrand;
    if (change.newCondition) updates.lastCondition = change.newCondition as 'new' | 'used';
    if (change.newLocation) updates.lastLocation = change.newLocation;
    
    this.setContext(updates);

    // Retorna query limpa
    const parts = [
      change.newProduct,
      change.newBrand,
      change.newCondition,
      change.newLocation
    ].filter(Boolean);

    return parts.join(' ').trim() || query;
  }

  // ✅ Handler: Detecção de produto
  private handleProductDetection(query: string): string | null {
    const possibleProduct = this.extractProduct(query);
    
    if (!possibleProduct) return null;

    if (possibleProduct !== this.context.lastProduct) {
      // Produto mudou - resetar contexto
      this.setContext({
        lastProduct: possibleProduct,
        lastBrand: undefined,
        lastCondition: undefined,
        lastPriceMax: undefined,
        lastLocation: undefined
      });
    } else if (!this.context.lastProduct) {
      // Primeiro produto
      this.setContext({ lastProduct: possibleProduct });
    }

    return possibleProduct;
  }

  // ✅ Handler: Condição simples
  private handleCondition(normalized: string): string | null {
    if (!/^(novo|nova|usado|usada|seminovo|seminova)$/i.test(normalized)) {
      return null;
    }

    const condition = this.CONDITION_MAP[normalized];
    if (!condition) return null;

    this.setContext({ lastCondition: condition });
    return `${this.context.lastProduct} ${normalized}`;
  }

  // ✅ Handler: Preço
  private handlePrice(normalized: string): string | null {
    const match = normalized.match(this.PRICE_REGEX); // Mais seguro que exec()
    if (!match) return null;

    const price = this.normalizePrice(match[2], match[3]);
    this.setContext({ lastPriceMax: price });

    return this.buildQuery();
  }

  // ✅ Handler: Refinamento semântico
  private handleSemanticRefinement(normalized: string): string | null {
    const match = this.SEMANTIC_REFINEMENT_REGEX.exec(normalized);
    if (!match) return null;

    return `${this.context.lastProduct} ${match[2]}`;
  }

  // ✅ Handler: Refinamento de marca (aceita "só samsung" sem "da/do")
  private handleBrand(normalized: string): string | null {
    const match = normalized.match(this.BRAND_REFINEMENT_REGEX);
    if (!match) return null;

    this.setContext({ lastBrand: match[2] }); // FIX: match[2] não match[3]
    return this.buildQuery();
  }

  // ✅ Handler: Mais barato
  private handleCheaper(normalized: string): string | null {
    if (!this.CHEAPER_REGEX.test(normalized)) return null;
    return this.buildQuery() + ' mais barato';
  }

  // ✅ Handler: Ordenação
  private handleSort(normalized: string): string | null {
    const match = normalized.match(this.SORT_REGEX);
    if (!match) return null;
    
    const sortType = match[3];
    return this.buildQuery() + ` ordenar por ${sortType}`;
  }

  // ✅ Handler: Mais caro
  private handleExpensive(normalized: string): string | null {
    if (!this.EXPENSIVE_REGEX.test(normalized)) return null;
    return this.buildQuery() + ' mais caro';
  }

  // ✅ Handler: Mais recente
  private handleRecent(normalized: string): string | null {
    if (!this.RECENT_REGEX.test(normalized)) return null;
    return this.buildQuery() + ' mais recente';
  }

  // ✅ Handler: Remover filtro
  private handleRemoveFilter(normalized: string): string | null {
    if (!this.REMOVE_FILTER_REGEX.test(normalized)) return null;
    
    if (/preco|preço/.test(normalized)) {
      this.setContext({ lastPriceMax: undefined });
    }
    if (/condicao|condição/.test(normalized)) {
      this.setContext({ lastCondition: undefined });
    }
    
    return this.buildQuery();
  }

  // ✅ Handler: Qualquer preço
  private handleAnyPrice(normalized: string): string | null {
    if (!this.ANY_PRICE_REGEX.test(normalized)) return null;
    
    this.setContext({ lastPriceMax: undefined });
    return this.buildQuery();
  }

  // ✅ Handler: Mudar produto
  private handleChangeProduct(normalized: string): string | null {
    const match = normalized.match(this.CHANGE_PRODUCT_REGEX);
    if (!match) return null;
    
    const newProduct = this.extractProduct(match[2]);
    if (!newProduct) return null;
    
    // Reset contexto com novo produto
    this.setContext({
      lastProduct: newProduct,
      lastBrand: undefined,
      lastCondition: undefined,
      lastPriceMax: undefined,
      lastLocation: undefined
    });
    
    return newProduct;
  }

  // ✅ Handler: Mudança de condição com palavras extras (evita duplicação)
  private handleConditionChange(normalized: string, query: string): string | null {
    // ✅ Evita processar se já foi tratado como condição simples
    if (/^(novo|nova|usado|usada|seminovo|seminova)$/i.test(normalized)) {
      return null;
    }
    
    const match = normalized.match(this.CONDITION_REGEX);
    if (!match) return null;

    const condition = this.CONDITION_MAP[match[1]];
    if (condition) {
      this.setContext({ lastCondition: condition });
    }

    return this.buildQuery();
  }

  // ✅ Handler: Localização
  private handleLocation(normalized: string, query: string): string | null {
    const match = normalized.match(this.LOCATION_REGEX);
    if (!match) return null;

    this.setContext({ lastLocation: match[2].trim() });
    return this.buildQuery();
  }

  // ✅ Reconstrói query completa com todo o contexto
  private buildQuery(): string {
    const ctx = this.context;

    return [
      ctx.lastProduct,
      ctx.lastBrand,
      ctx.lastCondition === 'new' ? 'novo' : ctx.lastCondition === 'used' ? 'usado' : null,
      ctx.lastPriceMax ? `até ${ctx.lastPriceMax}` : null,
      ctx.lastLocation ? `em ${ctx.lastLocation}` : null
    ].filter(Boolean).join(' ');
  }

  // ✅ Pipeline principal (modular e testável)
  applyContext(query: string): string {
    const normalized = this.normalize(query);
    
    // ✅ Correção ANTES de adicionar ao histórico (usa histórico atual)
    const history = this.context.conversationHistory;
    const correction = this.handleCorrection(query, history);
    
    // Adiciona ao histórico DEPOIS da correção
    this.addToHistory(query);
    
    if (correction) return correction;

    // 2. Detecta produto (usa texto normalizado)
    const product = this.handleProductDetection(normalized);
    if (!product) return query;

    // 3. Pipeline de handlers (ordem de prioridade, extensível)
    const handlers = [
      () => this.handleCondition(normalized),
      () => this.handlePrice(normalized),
      () => this.handleSemanticRefinement(normalized),
      () => this.handleBrand(normalized),
      () => this.handleCheaper(normalized),
      () => this.handleSort(normalized),
      () => this.handleExpensive(normalized),
      () => this.handleRecent(normalized),
      () => this.handleRemoveFilter(normalized),
      () => this.handleAnyPrice(normalized),
      () => this.handleChangeProduct(normalized),
      () => this.handleConditionChange(normalized, query),
      () => this.handleLocation(normalized, query)
    ];

    for (const handler of handlers) {
      const result = handler();
      if (result) return result;
    }

    return query;
  }
}

export const contextManager = new ContextManager();
