import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MercadoLivreService {
  private readonly logger = new Logger(MercadoLivreService.name);
  private readonly apiToken: string;
  private readonly actorId = 'karamelo~mercadolivre-scraper-brasil-portugues';

  constructor(private configService: ConfigService) {
    this.apiToken = this.configService.get('APIFY_API_KEY');
  }

  private sanitizeForLog(value: string): string {
    return String(value).replace(/[\r\n\t]/g, ' ').replace(/[\x00-\x1f\x7f]/g, '').slice(0, 200);
  }

  private normalizeText(value: string): string {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private mapSortByLabel(sortBy: string): string {
    const map: Record<string, string> = {
      RELEVANCE: 'Mais relevante',
      BEST_MATCH: 'Mais relevante',
      LOWEST_PRICE: 'Menor preço',
      HIGHEST_PRICE: 'Maior preço',
      TOP_RATED: 'Mais avaliados',
    };

    return map[sortBy] || map.BEST_MATCH;
  }

  private parseRating(value: string | number | undefined): number {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const normalized = String(value).replace(',', '.').match(/\d+(\.\d+)?/);
    return normalized ? parseFloat(normalized[0]) : 0;
  }

  private applyLocalSort(results: any[], sortBy: string): any[] {
    if (!Array.isArray(results) || results.length === 0) return results;

    if (sortBy === 'LOWEST_PRICE') {
      return [...results].sort((a, b) => (a.price || 0) - (b.price || 0));
    }

    if (sortBy === 'HIGHEST_PRICE') {
      return [...results].sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    if (sortBy === 'TOP_RATED') {
      return [...results].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return results;
  }

  async search(
    query: string,
    limit = 20,
    sortBy: 'BEST_MATCH' | 'RELEVANCE' | 'LOWEST_PRICE' | 'HIGHEST_PRICE' | 'TOP_RATED' = 'BEST_MATCH',
    classification?: any,
  ): Promise<{ results: any[]; searchedNationally: boolean }> {
    try {
      const isVehicle = classification?.category === 'car' || classification?.category === 'motorcycle';
      const sortLabel = this.mapSortByLabel(sortBy);

      // Para veículos: construir query específica para evitar retornar peças
      let searchQuery = query;
      let fallbackQueries: string[] = [];
      if (isVehicle && classification) {
        const brand = classification.detected_brand || '';
        const model = classification.detected_model || '';
        const year  = classification.detected_year  || '';
        const transmission = classification.detected_transmission || '';
        const queryNormalized = this.normalizeText(query);
        const currentYear = new Date().getFullYear();
        const isOldYear = Number(year) > 0 && Number(year) < currentYear - 1;
        const cond = classification.condition === 'used'
          ? 'usado'
          : classification.condition === 'new' && !isOldYear
            ? '0km'
            : '';

        const manualToken = /(\bmanual\b)/.test(queryNormalized) ? 'manual' : '';
        const automaticToken = /(\bautomatico\b|\bautomatica\b|\bauto\b|\bcvt\b)/.test(queryNormalized) ? 'automatico' : '';
        const transmissionToken = transmission || manualToken || automaticToken;

        const parts = [brand, model, year, transmissionToken, cond].filter(Boolean);
        if (parts.length >= 2) {
          searchQuery = parts.join(' ');
          this.logger.log(`🚗 [MERCADOLIVRE] Query de veículo construída: "${searchQuery}"`);

          const withoutTransmission = [brand, model, year, cond].filter(Boolean).join(' ');
          const withoutYear = [brand, model, transmissionToken, cond].filter(Boolean).join(' ');
          const compact = [brand, model, cond].filter(Boolean).join(' ');

          fallbackQueries = [withoutTransmission, withoutYear, compact]
            .map((value) => value.trim())
            .filter((value) => value.length > 0 && value !== searchQuery);
        }
      } else if (classification) {
        // Produtos gerais: enriquecer query com filtros
        searchQuery = this.buildEnrichedQuery(query, classification);
        this.logger.log(`🛠️ [MERCADOLIVRE] Query enriquecida: "${searchQuery}"`);
      }

      const safeQuery = this.sanitizeForLog(searchQuery);
      this.logger.log(`🛒 [MERCADOLIVRE] Buscando: "${safeQuery}" (limit: ${limit}, sortBy: ${sortBy} -> ${sortLabel})`);

      const scrapeOfertas = Boolean((classification as any)?.ml_scrape_ofertas);
      const includePromoted = Boolean((classification as any)?.ml_promoted);

      const input = {
        ...(scrapeOfertas ? {} : { keyword: searchQuery }),
        maxPages: 1, // 1 página = ~48 itens, limitamos no slice
        maxPagesOfertas: 1,
        promoted: includePromoted,
        scrapeOfertas,
      };

      this.logger.log(`📤 [MERCADOLIVRE] Input: keyword="${scrapeOfertas ? '(ofertas-mode)' : safeQuery}", maxPages=${input.maxPages}, maxPagesOfertas=${input.maxPagesOfertas}, promoted=${input.promoted}, scrapeOfertas=${input.scrapeOfertas}`);

      const fetchItems = async (keyword: string): Promise<any[]> => {
        const requestInput = {
          ...input,
          ...(scrapeOfertas ? {} : { keyword }),
        };

        const response = await fetch(
          `https://api.apify.com/v2/acts/${this.actorId}/run-sync-get-dataset-items?token=${this.apiToken}&timeout=60`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestInput),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          this.logger.error(`❌ [MERCADOLIVRE] Apify API error ${response.status}: ${errorText}`);
          throw new Error(`MercadoLivre Apify API error: ${response.status}`);
        }

        const raw: any[] = await response.json();
        return Array.isArray(raw) ? raw : [];
      };

      let items = await fetchItems(searchQuery);

      if (!scrapeOfertas && items.length === 0 && fallbackQueries.length > 0) {
        for (const fallback of fallbackQueries) {
          const safeFallback = this.sanitizeForLog(fallback);
          this.logger.warn(`🔁 [MERCADOLIVRE] 0 resultados com "${safeQuery}". Tentando fallback: "${safeFallback}"`);
          items = await fetchItems(fallback);
          if (items.length > 0) {
            this.logger.log(`✅ [MERCADOLIVRE] Fallback funcionou com "${safeFallback}" (${items.length} itens brutos)`);
            break;
          }
        }
      }

      if (items.length === 0) {
        this.logger.warn(`⚠️ [MERCADOLIVRE] Nenhum resultado para: "${safeQuery}"`);
        return { results: [], searchedNationally: false };
      }

      this.logger.log(`✅ [MERCADOLIVRE] ${items.length} resultados encontrados`);

      const mapped = items.map((item: any, index: number) => {
        const price = this.parsePrice(item.novoPreco);
        const originalPrice = this.parsePrice(item.precoAnterior);
        const percentOff = item.precoDiscount || null;
        const title = item.eTituloProduto || '';
        // Limpar highlight: remover template literals do ML (ex: "{black_friday_icon}")
        const highlight = item.highlight
          ? item.highlight.replace(/\{[^}]+\}/g, '').trim() || null
          : null;

        return {
          id: item.SKU || `ml-${index}`,
          title,
          price,
          originalPrice: originalPrice || null,
          percentOff,
          images: item.imagemLink ? [item.imagemLink] : [],
          source: 'MercadoLivre',
          sourceUrl: item.zProdutoLink || null,
          condition: this.inferCondition(title),
          category: item.produtoDomainID || 'general',
          brand: item.produtoMarca || null,
          seller: item.Vendedor ? { name: item.Vendedor } : null,
          shipping: item.envio || null,
          isInternational: item.eCompraInternacional ?? false,
          shippedFrom: item.enviadoDe || null,
          highlight,
          installments: item.installments || null,
          rating: this.parseRating(item.produtoReviews),
          sku: item.SKU || null,
          scrapedAt: item.Tempo || new Date().toISOString(),
        };
      });

      const sorted = this.applyLocalSort(mapped, sortBy);
      return { results: sorted.slice(0, limit), searchedNationally: false };
    } catch (error) {
      this.logger.error(`❌ [MERCADOLIVRE] Erro: ${error.message}`);
      return { results: [], searchedNationally: false };
    }
  }

  /** Enriquece a query com filtros da classificação para produtos gerais */
  private buildEnrichedQuery(query: string, classification: any): string {
    // #8 (mesmo padrão do Google Shopping): usar search_query se já enriquecida
    if (classification.search_query && classification.search_query.trim()) {
      return classification.search_query.trim();
    }

    const parts: string[] = [query];
    const cat = classification.category;
    const base = query.toLowerCase();
    const addIfAbsent = (token: string) => {
      if (token && !base.includes(token.toLowerCase())) parts.push(token);
    };

    if (classification.condition === 'new') addIfAbsent('novo');
    else if (classification.condition === 'used') addIfAbsent('usado');

    if (cat === 'fashion') {
      if (classification.detected_gender) addIfAbsent(classification.detected_gender);
      if (classification.detected_size)   addIfAbsent(classification.detected_size);
      if (classification.detected_shoe_type) addIfAbsent(classification.detected_shoe_type);
    }

    // #4: adicionar size/gender para categoria general também (ex: colchão casal)
    if (cat === 'general' || cat === 'furniture' || cat === 'appliance') {
      if (classification.detected_size)   addIfAbsent(classification.detected_size);
      if (classification.detected_gender) addIfAbsent(classification.detected_gender);
    }

    if (classification.detected_storage) addIfAbsent(classification.detected_storage);
    if (classification.detected_brand)   addIfAbsent(classification.detected_brand);

    return parts.filter(Boolean).join(' ');
  }

  /** Infere condição pelo título do produto */
  private inferCondition(title: string): 'new' | 'used' {
    const t = title.toLowerCase();
    if (/recondicionado|usado|seminovo|semi novo|semi-novo|segunda.?m[aã]o|com detalhe|bateria\s*\d+%/.test(t)) return 'used';
    if (/novo|lacrado|0\s*km|na caixa|caixa aberta|caixa fechada|lacrada/.test(t)) return 'new';
    // #5: retornar 'new' como padrão em vez de undefined para não ser filtrado fora
    return 'new';
  }

  private parsePrice(value: string | undefined): number {
    if (!value) return 0;
    // Suporta: "6499", "173,76", "1.234,56"
    const str = String(value).trim();
    // Se não tem vírgula, é inteiro direto
    if (!str.includes(',')) return parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
    // Formato BR: remover pontos de milhar, trocar vírgula decimal por ponto
    return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
  }
}
