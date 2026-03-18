import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

const KNOWN_BRANDS = ['honda','toyota','chevrolet','volkswagen','fiat','ford','hyundai','nissan','renault','jeep','mitsubishi','kia','bmw','mercedes','audi','yamaha','kawasaki','suzuki','honda'];

@Injectable()
export class MobiautoService {
  private readonly logger = new Logger(MobiautoService.name);
  private readonly apiToken: string;
  private readonly actorId = 'ecomscrape~mobiauto-cars-search-scraper';
  private readonly cache = new Map<string, { data: any[]; expiresAt: number }>();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000;

  constructor(private configService: ConfigService) {
    this.apiToken = this.configService.get('APIFY_API_KEY');
  }

  async search(query: string, limit = 20, classification?: any): Promise<any[]> {
    try {
      const safeQuery = query.replace(/[\r\n]/g, ' ');
      this.logger.log(`🚗 [MOBIAUTO] Buscando: "${safeQuery}" (limit: ${limit})`);

      const searchUrl = this.buildSearchUrl(query, classification);

      const cacheKey = crypto.createHash('md5').update(searchUrl).digest('hex');
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        this.logger.log(`⚡ [MOBIAUTO] Cache hit: ${cacheKey}`);
        return cached.data.slice(0, limit);
      }

      const input = {
        urls: [searchUrl],
        max_items_per_url: limit,
        ignore_url_failures: true,
        max_retries_per_url: 2,
        proxy: {
          useApifyProxy: true,
          apifyProxyGroups: ['RESIDENTIAL'],
          apifyProxyCountry: 'BR',
        },
      };

      this.logger.log(`📤 [MOBIAUTO] URL: ${searchUrl}`);

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
        this.logger.error(`❌ [MOBIAUTO] Apify API error ${response.status}: ${errorText}`);
        throw new Error(`Mobiauto Apify API error: ${response.status}`);
      }

      const results = await response.json();

      if (!Array.isArray(results) || results.length === 0) {
        this.logger.warn(`⚠️ [MOBIAUTO] Nenhum resultado para: ${safeQuery}`);
        return [];
      }

      this.logger.log(`✅ [MOBIAUTO] ${results.length} resultados encontrados`);

      const mapped = results.map((item: any, index: number) => ({
        id: item.id || `mobiauto-${index}`,
        title: this.buildTitle(item),
        price: item.price || 0,
        image: this.getImageUrl(item.images?.[0]),
        images: item.images?.map((img: any) => this.getImageUrl(img)) || [],
        source: 'Mobiauto',
        url: `https://www.mobiauto.com.br/comprar/${item.id}`,
        sourceUrl: item.from_url,
        condition: item.km === 0 ? 'new' : 'used',
        category: 'vehicle',
        scrapedAt: new Date().toISOString(),
        make: item.trim?.make?.name,
        model: item.trim?.model?.name,
        version: item.trim?.name,
        year: item.trim?.production_year,
        modelYear: item.trim?.model?.year,
        km: item.km,
        fuelType: item.trim?.fuel?.name,
        transmission: item.trim?.transmission?.name,
        bodyType: item.trim?.bodystyle?.name,
        doors: item.trim?.doors,
        dealer: item.dealer?.name,
        dealerLocation: item.dealer?.location
          ? `${item.dealer.location.city}, ${item.dealer.location.state}`
          : null,
        hasWarranty: item.has_mechanical_warranty,
        hasAssistance: item.has_repair_assistance,
        isOEM: item.oem,
      }));

      const ranked = this.rankResults(mapped, classification);
      this.cache.set(cacheKey, { data: ranked, expiresAt: Date.now() + this.CACHE_TTL_MS });
      return ranked.slice(0, limit);
    } catch (error) {
      this.logger.error(`❌ [MOBIAUTO] Erro: ${error.message}`);
      return [];
    }
  }

  private rankResults(results: any[], classification?: any): any[] {
    const brand = classification?.detected_brand?.toLowerCase();
    const model = classification?.detected_model?.toLowerCase();
    return results.sort((a, b) => {
      let sA = 0, sB = 0;
      if (a.price > 0) sA += 2;
      if (b.price > 0) sB += 2;
      if (brand) {
        if (a.make?.toLowerCase() === brand) sA += 3;
        if (b.make?.toLowerCase() === brand) sB += 3;
      }
      if (model) {
        if (a.model?.toLowerCase().includes(model)) sA += 2;
        if (b.model?.toLowerCase().includes(model)) sB += 2;
      }
      if (a.image) sA += 1;
      if (b.image) sB += 1;
      return sB - sA;
    });
  }

  private buildSearchUrl(query: string, classification?: any): string {
    const isMoto = classification?.category === 'motorcycle';
    const vehicleType = isMoto ? 'motos' : 'carros';
    const base = `https://www.mobiauto.com.br/comprar/${vehicleType}`;

    // Fallback inteligente: extrai brand da query se classification incompleta
    const brand = classification?.detected_brand || this.extractBrandFromQuery(query);
    const model = classification?.detected_model;

    if (!brand && !classification) {
      return `${base}/brasil?q=${encodeURIComponent(query)}`;
    }

    const parts: string[] = [base];
    if (brand) {
      parts.push(this.normalizeForUrl(brand));
      if (model) {
        const version = classification?.detected_version;
        parts.push(this.normalizeForUrl(version ? `${model}-${version}` : model));
      }
    }

    const loc = classification?.user_location;
    if (loc?.city && loc?.state) {
      parts.push(`${this.normalizeForUrl(loc.city)}-${this.normalizeForUrl(loc.state)}`);
    } else {
      parts.push('brasil');
    }

    const params = new URLSearchParams();
    const c = classification || {};
    if (c.detected_year)          { params.set('anoInicio', String(c.detected_year)); params.set('anoFim', String(c.detected_year)); }
    if (c.condition === 'new')    params.set('tipoAnuncio', 'new');
    if (c.condition === 'used')   params.set('tipoAnuncio', 'used');
    if (c.detected_transmission)  params.set('cambio',      c.detected_transmission);
    if (c.detected_fuel)          params.set('combustivel', c.detected_fuel);
    if (c.detected_body_type)     params.set('carroceria',  c.detected_body_type);
    if (c.detected_color)         params.set('cor',         c.detected_color);
    if (c.price_range?.min_price) params.set('precoMinimo', String(c.price_range.min_price));
    if (c.price_range?.max_price) params.set('precoMaximo', String(c.price_range.max_price));

    const qs  = params.toString();
    const url = qs ? `${parts.join('/')}?${qs}` : parts.join('/');
    this.logger.log(`🔗 [MOBIAUTO] URL: ${url}`);
    return url;
  }

  /** Extrai marca conhecida da query como fallback quando classification não tem detected_brand */
  private extractBrandFromQuery(query: string): string | null {
    const q = query.toLowerCase();
    return KNOWN_BRANDS.find(b => q.includes(b)) ?? null;
  }

  /** Converte string para slug de URL: remove acentos, substitui espaços/especiais por hífens */
  private normalizeForUrl(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private buildTitle(item: any): string {
    const parts = [];
    if (item.trim?.make?.name)       parts.push(item.trim.make.name);
    if (item.trim?.model?.name)      parts.push(item.trim.model.name);
    if (item.trim?.name)             parts.push(item.trim.name);
    if (item.trim?.production_year)  parts.push(item.trim.production_year);
    return parts.join(' ') || 'Veículo';
  }

  private getImageUrl(imageObj: any): string {
    if (!imageObj) return '';
    if (typeof imageObj === 'string') return imageObj;
    if (imageObj.image_id) return `https://image.mobiauto.com.br/${imageObj.image_id}/1gg.jpg`;
    return '';
  }
}
