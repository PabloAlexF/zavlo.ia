import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class MercadoLivreService {
  private readonly logger = new Logger(MercadoLivreService.name);
  private readonly apiToken: string;
  private readonly actorId = 'karamelo~mercadolivre-scraper-brasil-portugues';
  private readonly cache = new Map<string, { data: any[]; expiresAt: number }>();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000;

  constructor(private configService: ConfigService) {
    this.apiToken = this.configService.get('APIFY_API_KEY');
  }

  private sanitizeForLog(value: string): string {
    return String(value).replace(/[\r\n\t]/g, ' ').replace(/[\x00-\x1f\x7f]/g, '').slice(0, 200);
  }

  async search(query: string, limit = 20): Promise<{ results: any[]; searchedNationally: boolean }> {
    try {
      const safeQuery = this.sanitizeForLog(query);
      this.logger.log(`🛒 [MERCADOLIVRE] Buscando: "${safeQuery}" (limit: ${limit})`);

      const cacheKey = crypto.createHash('md5').update(`ml:${query}:${limit}`).digest('hex');
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        this.logger.log(`⚡ [MERCADOLIVRE] Cache hit: ${cacheKey}`);
        return { results: cached.data.slice(0, limit), searchedNationally: false };
      }

      const input = {
        keyword: query,
        maxPages: Math.ceil(limit / 48), // ~48 itens por página no ML
        maxPagesOfertas: 1,
        promoted: false,
        scrapeOfertas: false,
      };

      this.logger.log(`📤 [MERCADOLIVRE] Input: keyword="${safeQuery}", maxPages=${input.maxPages}`);

      const response = await fetch(
        `https://api.apify.com/v2/acts/${this.actorId}/run-sync-get-dataset-items?token=${this.apiToken}&timeout=60`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`❌ [MERCADOLIVRE] Apify API error ${response.status}: ${errorText}`);
        throw new Error(`MercadoLivre Apify API error: ${response.status}`);
      }

      const raw: any[] = await response.json();
      const items = Array.isArray(raw) ? raw : [];

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
          sku: item.SKU || null,
          scrapedAt: item.Tempo || new Date().toISOString(),
        };
      });

      this.cache.set(cacheKey, { data: mapped, expiresAt: Date.now() + this.CACHE_TTL_MS });
      return { results: mapped.slice(0, limit), searchedNationally: false };
    } catch (error) {
      this.logger.error(`❌ [MERCADOLIVRE] Erro: ${error.message}`);
      return { results: [], searchedNationally: false };
    }
  }

  /** Infere condição pelo título do produto */
  private inferCondition(title: string): 'new' | 'used' | undefined {
    const t = title.toLowerCase();
    if (/recondicionado|usado|seminovo|semi novo|semi-novo|segunda.?m[aã]o|com detalhe|bateria\s*\d+%/.test(t)) return 'used';
    if (/novo|lacrado|0\s*km|na caixa|caixa aberta|caixa fechada|lacrada/.test(t)) return 'new';
    return undefined;
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
