import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OlxService {
  private readonly logger = new Logger(OlxService.name);
  private readonly apiToken: string;
  private readonly actorId = 'daddyapi~olx-brazil-scraper';

  constructor(private configService: ConfigService) {
    this.apiToken = this.configService.get('APIFY_API_KEY');
  }

  /**
   * Busca produtos na OLX usando o scraper Apify
   * @param query - Termo de busca (ex: "iPhone 13 usado")
   * @param limit - Número máximo de resultados
   */
  private sanitizeForLog(v: string): string {
    return String(v).replace(/[\r\n\t]/g, ' ').replace(/[\x00-\x1f\x7f]/g, '').slice(0, 200);
  }

  private clamp(value: number, min: number, max: number): number {
    if (!Number.isFinite(value)) return min;
    return Math.min(Math.max(value, min), max);
  }

  private resolveOlxSort(sortBy: string): 'newest' | 'cheapest' | 'expensive' | 'relevance' {
    const sortByMap: Record<string, 'newest' | 'cheapest' | 'expensive' | 'relevance'> = {
      RELEVANCE: 'relevance',
      BEST_MATCH: 'relevance',
      LOWEST_PRICE: 'cheapest',
      HIGHEST_PRICE: 'expensive',
      TOP_RATED: 'relevance',
      NEWEST: 'newest',
    };

    return sortByMap[sortBy] || 'newest';
  }

  async search(query: string, limit = 20, sortBy: string = 'RELEVANCE', classification?: any): Promise<any[]> {
    try {
      const searchQuery = classification
        ? this.buildEnrichedQuery(query, classification)
        : query;
      this.logger.log(`🛒 [OLX] Buscando: "${this.sanitizeForLog(searchQuery)}" (limit: ${limit}, sortBy: ${sortBy})`);

      const olxSortBy = this.resolveOlxSort(sortBy);
      const requestedPages = Number((classification as any)?.olx_max_pages);
      const maxPages = Number.isFinite(requestedPages)
        ? this.clamp(requestedPages, 1, 50)
        : this.clamp(Math.ceil(limit / 50), 1, 50);
      const requestedMaxRequests = Number((classification as any)?.olx_max_requests);
      const maxRequestsPerCrawl = Number.isFinite(requestedMaxRequests)
        ? this.clamp(requestedMaxRequests, 20, 1000)
        : 100;

      const input = {
        searchQuery: searchQuery,
        olxDomain: 'olx.com.br',
        sortBy: olxSortBy,
        maxPages,
        maxRequestsPerCrawl,
        proxyConfiguration: {
          useApifyProxy: true,
          apifyProxyGroups: ['RESIDENTIAL'],
          apifyProxyCountry: 'BR',
        },
      };

      this.logger.log(`📤 [OLX] Input: query="${this.sanitizeForLog(searchQuery)}", domain=${input.olxDomain}, sortBy=${input.sortBy}, maxPages=${input.maxPages}, maxRequests=${input.maxRequestsPerCrawl}, proxy=RESIDENTIAL`);

      // Disparar run assíncrono (evita timeout de 30s do Render Free)
      const runRes = await fetch(
        `https://api.apify.com/v2/acts/${this.actorId}/runs?token=${this.apiToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }
      );

      if (!runRes.ok) {
        const errorText = await runRes.text();
        this.logger.error(`❌ [OLX] Apify run error ${runRes.status}: ${errorText}`);
        throw new Error(`OLX Apify run error: ${runRes.status}`);
      }

      const runData = await runRes.json();
      const runId = runData?.data?.id;
      if (!runId) throw new Error('OLX Apify: runId não retornado');
      this.logger.log(`🚀 [OLX] Run iniciado: ${runId}`);

      // #7: MAX_WAIT reduzido para 100s para dar margem ao timeout de 120s do service
      const POLL_INTERVAL = 5000;
      const MAX_WAIT = 100000;
      const deadline = Date.now() + MAX_WAIT;
      let status = 'RUNNING';

      while (Date.now() < deadline && (status === 'RUNNING' || status === 'READY' || status === 'ABORTING')) {
        await new Promise(r => setTimeout(r, POLL_INTERVAL));
        const statusRes = await fetch(
          `https://api.apify.com/v2/actor-runs/${runId}?token=${this.apiToken}`
        );
        const statusData = await statusRes.json();
        status = statusData?.data?.status ?? 'FAILED';
        this.logger.log(`⏳ [OLX] Run ${runId} status: ${status}`);
      }

      if (status !== 'SUCCEEDED') {
        this.logger.error(`❌ [OLX] Run terminou com status: ${status}`);
        throw new Error(`OLX Apify run ${status}`);
      }

      // Buscar dataset
      const datasetRes = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${this.apiToken}&limit=${limit}`
      );
      if (!datasetRes.ok) throw new Error(`OLX dataset fetch error: ${datasetRes.status}`);
      const results = await datasetRes.json();

      if (!Array.isArray(results) || results.length === 0) {
        this.logger.warn(`⚠️ [OLX] Nenhum resultado encontrado para: ${query}`);
        return [];
      }

      this.logger.log(`✅ [OLX] ${results.length} resultados encontrados`);

      // Mapear para formato Zavlo.ia
      const mapped = results.slice(0, limit).map((item: any, index: number) => ({
        id: item.id || `olx-${index}`,
        title: item.title,
        price: item.price?.amount ?? this.parsePrice(item.price?.display),
        image: item.photos?.[0] || '',
        images: item.photos || [],
        source: 'OLX',
        url: item.url,
        sourceUrl: item.url,
        location: item.location ? `${item.location.city}, ${item.location.region}` : null,
        dealerLocation: item.location?.city || null,
        // #6: usar 'new' como fallback quando condition é 'unknown'/undefined
        // para não filtrar fora produtos OLX em buscas sem condição especificada
        condition: classification?.condition === 'new' ? 'new'
          : classification?.condition === 'used' ? 'used'
          : 'new',
        category: 'marketplace',
        scrapedAt: new Date().toISOString(),
        postedAt: item.postedAt,
        isPromoted: item.isPromoted || false,
        isBusiness: item.isBusiness || false,
        description: item.description,
      }));

      return mapped;
    } catch (error) {
      this.logger.error(`❌ [OLX] Erro: ${error.message}`);
      return [];
    }
  }

  private buildEnrichedQuery(query: string, classification: any): string {
    const parts: string[] = [query];
    const cat = classification.category;

    if (cat === 'car' || cat === 'motorcycle') {
      if (classification.detected_brand && !query.toLowerCase().includes(classification.detected_brand))
        parts.push(classification.detected_brand);
      if (classification.detected_model && !query.toLowerCase().includes(classification.detected_model))
        parts.push(classification.detected_model);
      if (classification.detected_year) parts.push(String(classification.detected_year));
      if (classification.condition === 'new') parts.push('0km');
      else if (classification.condition === 'used') parts.push('usado');
      if (classification.detected_transmission === 'automatic') parts.push('automatico');
      else if (classification.detected_transmission === 'manual') parts.push('manual');
      if (classification.detected_fuel && classification.detected_fuel !== 'qualquer') parts.push(classification.detected_fuel);
      if (classification.detected_body_type && classification.detected_body_type !== 'qualquer') parts.push(classification.detected_body_type);
      return parts.filter(Boolean).join(' ');
    }

    if (classification.condition === 'new') parts.push('novo');
    else if (classification.condition === 'used') parts.push('usado');

    if (cat === 'fashion') {
      if (classification.detected_gender) parts.push(classification.detected_gender);
      if (classification.detected_size)   parts.push(classification.detected_size);
      if (classification.detected_shoe_type) parts.push(classification.detected_shoe_type);
    }
    if (classification.detected_storage) parts.push(classification.detected_storage);
    if (classification.detected_brand && !query.toLowerCase().includes(classification.detected_brand)) {
      parts.push(classification.detected_brand);
    }
    return parts.filter(Boolean).join(' ');
  }

  private parsePrice(priceStr: any): number {
    if (typeof priceStr === 'number') return priceStr;
    if (!priceStr) return 0;
    
    const cleaned = String(priceStr).replace(/[^0-9.,]/g, '');
    const normalized = cleaned.replace(/\./g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  }
}
