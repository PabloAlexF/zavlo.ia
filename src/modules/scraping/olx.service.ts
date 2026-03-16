import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OlxService {
  private readonly logger = new Logger(OlxService.name);
  private readonly apiToken: string;
  private readonly actorId = 'daddyapi~olx-search-scraper';

  constructor(private configService: ConfigService) {
    this.apiToken = this.configService.get('APIFY_API_KEY');
  }

  /**
   * Busca produtos na OLX usando o scraper Apify
   * @param query - Termo de busca (ex: "iPhone 13 usado")
   * @param limit - Número máximo de resultados
   */
  async search(query: string, limit = 20): Promise<any[]> {
    try {
      this.logger.log(`🛒 [OLX] Buscando: "${query}" (limit: ${limit})`);

      const input = {
        searchQuery: query,
        olxDomain: 'olx.com.br', // Brasil
        sortBy: 'newest', // Mais recentes primeiro
        maxPages: Math.ceil(limit / 40), // ~40 resultados por página
        maxRequestsPerCrawl: limit,
        proxyConfiguration: {
          useApifyProxy: true,
          apifyProxyGroups: ['RESIDENTIAL'], // Proxy residencial para melhor confiabilidade
        },
      };

      this.logger.log(`📤 [OLX] Input Apify: ${JSON.stringify(input)}`);

      const response = await fetch(
        `https://api.apify.com/v2/acts/${this.actorId}/run-sync-get-dataset-items?token=${this.apiToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`❌ [OLX] Apify API error ${response.status}: ${errorText}`);
        throw new Error(`OLX Apify API error: ${response.status}`);
      }

      const results = await response.json();

      if (!Array.isArray(results) || results.length === 0) {
        this.logger.warn(`⚠️ [OLX] Nenhum resultado encontrado para: ${query}`);
        return [];
      }

      this.logger.log(`✅ [OLX] ${results.length} resultados encontrados`);

      // Mapear para formato Zavlo.ia
      const mapped = results.slice(0, limit).map((item: any, index: number) => ({
        id: item.id || `olx-${index}`,
        title: item.title,
        price: this.parsePrice(item.price?.display || item.price?.amount),
        image: item.photos?.[0] || '',
        images: item.photos || [],
        source: 'OLX',
        url: item.url,
        sourceUrl: item.url,
        location: item.location ? `${item.location.city}, ${item.location.region}` : null,
        condition: 'used', // OLX é principalmente produtos usados
        category: 'marketplace',
        scrapedAt: new Date().toISOString(),
        
        // Campos específicos OLX
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

  private parsePrice(priceStr: any): number {
    if (typeof priceStr === 'number') return priceStr;
    if (!priceStr) return 0;
    
    const cleaned = String(priceStr).replace(/[^0-9.,]/g, '');
    const normalized = cleaned.replace(/\./g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  }
}
