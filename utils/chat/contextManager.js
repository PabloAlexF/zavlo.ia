import { detectContextChange } from './contextChangeDetector';
class ContextManager {
    constructor() {
        this.context = {
            conversationHistory: []
        };
        this.STOPWORDS = [
            'quero', 'buscar', 'procuro', 'preciso', 'comprar', 'ver', 'mostrar',
            'gostaria', 'queria', 'estou', 'querendo', 'buscando', 'procurando',
            'barato', 'caro', 'promoção', 'promo', 'oferta', 'melhor', 'preço',
            'bom', 'boa', 'top', 'legal', 'muito', 'mais', 'menos'
        ];
        this.CONDITION_MAP = {
            'novo': 'new',
            'nova': 'new',
            'usado': 'used',
            'usada': 'used',
            'seminovo': 'used',
            'seminova': 'used'
        };
    }
    update(data) {
        this.context = Object.assign(Object.assign({}, this.context), data);
    }
    get() {
        return Object.assign({}, this.context);
    }
    clear() {
        this.context = { conversationHistory: [] };
    }
    addToHistory(message) {
        this.context.conversationHistory.push(message);
        // Mantém apenas últimas 10 mensagens
        if (this.context.conversationHistory.length > 10) {
            this.context.conversationHistory.shift();
        }
    }
    extractProduct(query) {
        const words = query
            .toLowerCase()
            .split(/\s+/)
            .filter(w => w.length > 2 &&
            !this.STOPWORDS.includes(w) &&
            !/^\d+$/.test(w));
        if (words.length === 0)
            return null;
        const invalidStart = ['comprar', 'buscar', 'ver', 'mostrar', 'querer'];
        if (invalidStart.includes(words[0]))
            return null;
        const product = words.slice(0, 3).join(' ');
        return product.trim();
    }
    applyContext(query) {
        const lower = query.toLowerCase().trim();
        const ctx = this.context;
        // Detecta mudança de contexto ANTES de adicionar ao histórico
        const change = detectContextChange(query, ctx.conversationHistory);
        // Agora adiciona ao histórico
        this.addToHistory(query);
        if (change.hasChange && change.type === 'correction') {
            // Usuário corrigiu - usar nova informação
            if (change.newProduct)
                ctx.lastProduct = change.newProduct;
            if (change.newBrand)
                ctx.lastBrand = change.newBrand;
            if (change.newCondition)
                ctx.lastCondition = change.newCondition;
            if (change.newLocation)
                ctx.lastLocation = change.newLocation;
            // Retorna a query limpa com as novas informações
            const parts = [];
            if (change.newProduct)
                parts.push(change.newProduct);
            if (change.newBrand)
                parts.push(change.newBrand);
            if (change.newCondition)
                parts.push(change.newCondition);
            if (change.newLocation)
                parts.push(change.newLocation);
            return parts.join(' ').trim() || query;
        }
        // Detecta produto automaticamente se não existe
        const possibleProduct = this.extractProduct(query);
        if (possibleProduct && possibleProduct !== ctx.lastProduct) {
            // Produto mudou - resetar contexto
            ctx.lastProduct = possibleProduct;
            ctx.lastBrand = undefined;
            ctx.lastCondition = undefined;
            ctx.lastPriceMax = undefined;
            ctx.lastLocation = undefined;
        }
        else if (possibleProduct && !ctx.lastProduct) {
            // Primeiro produto
            ctx.lastProduct = possibleProduct;
        }
        if (!ctx.lastProduct)
            return query;
        // Condição simples
        if (/^(novo|nova|usado|usada|seminovo|seminova)$/i.test(lower)) {
            const normalized = this.CONDITION_MAP[lower];
            if (normalized) {
                ctx.lastCondition = normalized;
                return `${ctx.lastProduct} ${lower}`;
            }
        }
        // Preço (melhorado - aceita mais variações incluindo k e mil)
        const priceMatch = lower.match(/(até|abaixo de|menos de|menor que|max|maximo|máximo)\s*(\d+(?:[.,]\d+)?)(k|mil)?/i);
        if (priceMatch) {
            let price = parseFloat(priceMatch[2].replace(',', '.'));
            // Converte k ou mil para milhares
            if (priceMatch[3] && (priceMatch[3].toLowerCase() === 'k' || priceMatch[3].toLowerCase() === 'mil')) {
                price *= 1000;
            }
            // Arredonda para inteiro (padrão e-commerce)
            ctx.lastPriceMax = Math.round(price);
            return `${ctx.lastProduct} até ${Math.round(price)}`;
        }
        // Refinamento semântico ("o pro max", "a versão pro")
        if (/^(o|a|os|as)\s+(.+)$/i.test(lower)) {
            const match = lower.match(/^(o|a|os|as)\s+(.+)$/i);
            if (match) {
                return `${ctx.lastProduct} ${match[2]}`;
            }
        }
        // Refinamento de marca
        if (/^(só|apenas|somente)\s+(da|do)\s+(.+)$/i.test(lower)) {
            const match = lower.match(/^(só|apenas|somente)\s+(da|do)\s+(.+)$/i);
            if (match) {
                return `${ctx.lastProduct} ${match[3]}`;
            }
        }
        // Mais barato (retorna query natural)
        if (/(qual o )?(mais barato|menor preço)/i.test(lower)) {
            return `${ctx.lastProduct} mais barato`;
        }
        // Mudar condição com palavras extras
        if (/(agora|prefiro|quero|procura|buscar)?\s*(novo|nova|usado|usada|seminovo|seminova)/i.test(lower)) {
            const condMatch = lower.match(/(novo|nova|usado|usada|seminovo|seminova)/i);
            if (condMatch) {
                const normalized = this.CONDITION_MAP[condMatch[1]];
                if (normalized) {
                    ctx.lastCondition = normalized;
                }
            }
            return `${ctx.lastProduct} ${query}`;
        }
        // Mudar localização
        if (/(em|na|no|perto de)\s+(.+)/i.test(lower)) {
            const locMatch = lower.match(/(em|na|no|perto de)\s+(.+)/i);
            if (locMatch) {
                ctx.lastLocation = locMatch[2].trim();
            }
            return `${ctx.lastProduct} ${query}`;
        }
        return query;
    }
}
export const contextManager = new ContextManager();
