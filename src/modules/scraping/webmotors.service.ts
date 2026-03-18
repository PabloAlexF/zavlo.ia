import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

const KNOWN_BRANDS = ['honda','toyota','chevrolet','volkswagen','fiat','ford','hyundai','nissan','renault','jeep','mitsubishi','kia','bmw','mercedes','audi','yamaha','kawasaki','suzuki'];

@Injectable()
export class WebmotorsService {
  private readonly logger = new Logger(WebmotorsService.name);
  private readonly apiToken: string;
  private readonly actorId = 'ribtools~webmotors-scraper';
  private readonly cache = new Map<string, { data: any[]; expiresAt: number }>();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000;

  constructor(private configService: ConfigService) {
    this.apiToken = this.configService.get('APIFY_API_KEY');
  }

  async search(query: string, limit = 20, classification?: any): Promise<any[]> {
    try {
      const safeQuery = query.replace(/[\r\n]/g, ' ');
      this.logger.log(`🚙 [WEBMOTORS] Buscando: "${safeQuery}" (limit: ${limit})`);

      const searchUrl = this.buildSearchUrl(query, classification);

      const cacheKey = crypto.createHash('md5').update(searchUrl).digest('hex');
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        this.logger.log(`⚡ [WEBMOTORS] Cache hit: ${cacheKey}`);
        return cached.data.slice(0, limit);
      }

      const input = {
        startUrls: [{ url: searchUrl }],
        proxy: {
          useApifyProxy: true,
          apifyProxyGroups: ['RESIDENTIAL'],
          apifyProxyCountry: 'BR',
        },
        maxItems: limit,
      };

      this.logger.log(`📤 [WEBMOTORS] URL: ${searchUrl}`);

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
        this.logger.error(`❌ [WEBMOTORS] Apify API error ${response.status}: ${errorText}`);
        throw new Error(`Webmotors Apify API error: ${response.status}`);
      }

      const results = await response.json();

      if (!Array.isArray(results) || results.length === 0) {
        this.logger.warn(`⚠️ [WEBMOTORS] Nenhum resultado para: ${safeQuery}`);
        return [];
      }

      this.logger.log(`✅ [WEBMOTORS] ${results.length} resultados encontrados`);

      const mapped = results.map((item: any, index: number) => ({
        id: item.id || `webmotors-${index}`,
        title: item.title || this.buildTitle(item),
        price: this.extractPrice(item.price) || 0,
        image: item.photos?.[0] || item.image || '',
        images: item.photos || (item.image ? [item.image] : []),
        source: 'Webmotors',
        url: item.url || item.link,
        sourceUrl: item.url || item.link,
        condition: item.km === 0 || item.vehicle_type === 'new' ? 'new' : 'used',
        category: 'vehicle',
        scrapedAt: new Date().toISOString(),
        make: item.make || item.brand,
        model: item.model,
        version: item.version,
        year: item.fabrication_year || item.year,
        modelYear: item.model_year,
        km: item.km || item.mileage,
        fuelType: item.fuel_type || item.fuel,
        transmission: item.transmission,
        bodyType: item.body_type,
        color: item.color,
        doors: item.number_of_doors || item.doors,
        finalPlate: item.final_plate,
        isArmored: item.is_armored,
        fipePrice: item.fipe_price,
        dealer: item.seller?.name || item.dealer,
        dealerLocation: item.seller
          ? `${item.seller.city}, ${item.seller.state}`
          : item.location,
        dealerCNPJ: item.seller?.cnpj,
        dealerPhones: item.seller?.phones || [],
        optionals: item.optionals || [],
        attributes: item.attributes || [],
        view360Url: item.view_360_url,
      }));

      const ranked = this.rankResults(mapped, classification);
      this.cache.set(cacheKey, { data: ranked, expiresAt: Date.now() + this.CACHE_TTL_MS });
      return ranked.slice(0, limit);
    } catch (error) {
      this.logger.error(`❌ [WEBMOTORS] Erro: ${error.message}`);
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
        if ((a.make || a.brand)?.toLowerCase() === brand) sA += 3;
        if ((b.make || b.brand)?.toLowerCase() === brand) sB += 3;
      }
      if (model) {
        if (a.model?.toLowerCase().includes(model)) sA += 2;
        if (b.model?.toLowerCase().includes(model)) sB += 2;
      }
      if (a.image || a.photos?.[0]) sA += 1;
      if (b.image || b.photos?.[0]) sB += 1;
      return sB - sA;
    });
  }

  private buildSearchUrl(query: string, classification?: any): string {
    const isMoto = classification?.category === 'motorcycle' || /\b(moto|motocicleta|scooter)\b/i.test(query);
    const vehicleType = isMoto ? 'motos' : 'carros';
    const base = `https://www.webmotors.com.br/comprar/${vehicleType}`;

    // Fallback inteligente: extrai brand da query se classification incompleta
    const brand = classification?.detected_brand || this.extractBrandFromQuery(query);

    if (!classification && !brand) {
      return `${base}?q=${encodeURIComponent(query.toLowerCase().trim())}`;
    }

    const params = new URLSearchParams();
    const c = classification || {};

    if (brand)                        params.set('marca',   brand);
    if (c.detected_model) {
      const version = c.detected_version;
      params.set('modelo', version ? `${c.detected_model} ${version}` : c.detected_model);
    }
    if (c.detected_year) {
      params.set('anoInicio', String(c.detected_year));
      params.set('anoFim',    String(c.detected_year));
    }
    if (c.condition === 'new')        params.set('tipoVeiculo', 'new');
    else if (c.condition === 'used')  params.set('tipoVeiculo', 'used');
    if (c.detected_transmission)      params.set('cambio',      c.detected_transmission);
    if (c.detected_fuel)              params.set('combustivel', c.detected_fuel);

    // Encoding explícito para cidade/estado (evita espaços quebrando URL)
    if (c.user_location?.state) params.set('estado', encodeURIComponent(c.user_location.state));
    if (c.user_location?.city)  params.set('cidade', encodeURIComponent(c.user_location.city));

    if (c.price_range?.min_price) params.set('precoMinimo', String(c.price_range.min_price));
    if (c.price_range?.max_price) params.set('precoMaximo', String(c.price_range.max_price));

    const qs  = params.toString();
    const url = qs ? `${base}?${qs}` : `${base}?q=${encodeURIComponent(query)}`;
    this.logger.log(`🔗 [WEBMOTORS] URL: ${url}`);
    return url;
  }

  /** Extrai marca conhecida da query como fallback quando classification não tem detected_brand */
  private extractBrandFromQuery(query: string): string | null {
    const q = query.toLowerCase();
    return KNOWN_BRANDS.find(b => q.includes(b)) ?? null;
  }

  private buildTitle(item: any): string {
    const parts = [];
    if (item.make || item.brand)              parts.push(item.make || item.brand);
    if (item.model)                           parts.push(item.model);
    if (item.version)                         parts.push(item.version);
    if (item.year || item.fabrication_year)   parts.push(item.year || item.fabrication_year);
    return parts.join(' ') || 'Veículo';
  }

  private extractPrice(priceStr: any): number {
    if (typeof priceStr === 'number') return priceStr;
    if (!priceStr) return 0;
    return parseInt(String(priceStr).replace(/[^0-9]/g, '')) || 0;
  }
}
