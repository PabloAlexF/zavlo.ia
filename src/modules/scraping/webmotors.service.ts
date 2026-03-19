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

  async search(query: string, limit = 20, classification?: any): Promise<{ results: any[]; searchedNationally: boolean }> {
    try {
      const safeQuery = query.replace(/[\r\n]/g, ' ');
      this.logger.log(`🚙 [WEBMOTORS] Buscando: "${safeQuery}" (limit: ${limit})`);

      const searchUrl = this.buildSearchUrl(query, classification);

      const cacheKey = crypto.createHash('md5').update(searchUrl).digest('hex');
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        this.logger.log(`⚡ [WEBMOTORS] Cache hit: ${cacheKey}`);
        return { results: cached.data.slice(0, limit), searchedNationally: false };
      }

      let results = await this.runApify(searchUrl, limit);
      let searchedNationally = false;

      // Fallback nacional se busca com cidade retornou vazio
      if (results.length === 0 && classification?.user_location?.city) {
        this.logger.warn(`⚠️ [WEBMOTORS] 0 resultados em ${classification.user_location.city} — tentando busca nacional`);
        const nationalUrl = this.buildSearchUrl(query, { ...classification, user_location: null });
        results = await this.runApify(nationalUrl, limit);
        if (results.length > 0) searchedNationally = true;
      }

      if (results.length === 0) {
        this.logger.warn(`⚠️ [WEBMOTORS] Nenhum resultado para: ${safeQuery}`);
        return { results: [], searchedNationally };
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
        km: item.km ?? item.mileage,
        fuelType: item.fuel_type || item.fuel,
        transmission: item.transmission,
        bodyType: item.body_type,
        color: item.color,
        doors: item.number_of_doors || item.doors,
        finalPlate: item.final_plate,
        isArmored: item.is_armored,
        fipePrice: item.fipe_price,
        dealer: item.seller?.name || item.dealer,
        dealerLocation: item.seller?.city
          ? `${item.seller.city}, ${item.seller.state}`
          : (item.location || null),
        dealerCNPJ: item.seller?.cnpj,
        dealerPhones: item.seller?.phones || [],
        optionals: item.optionals || [],
        attributes: item.attributes || [],
        view360Url: item.view_360_url,
      }));

      const ranked = this.rankResults(mapped, classification);
      this.cache.set(cacheKey, { data: ranked, expiresAt: Date.now() + this.CACHE_TTL_MS });
      return { results: ranked.slice(0, limit), searchedNationally };
    } catch (error) {
      this.logger.error(`❌ [WEBMOTORS] Erro: ${error.message}`);
      return { results: [], searchedNationally: false };
    }
  }

  private async runApify(searchUrl: string, limit: number): Promise<any[]> {
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
      `https://api.apify.com/v2/acts/${this.actorId}/run-sync-get-dataset-items?token=${this.apiToken}&timeout=90`,
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
    return Array.isArray(results) ? results : [];
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
    const c = classification || {};
    const brand = c.detected_brand || this.extractBrandFromQuery(query);
    const model = c.detected_model;
    const city  = c.user_location?.city;
    const state = c.user_location?.state;

    // Formato aceito pelo scraper (doc oficial):
    // /carros/{local}/{marca}/{modelo}?tipoveiculo=carros&marca1=X&modelo1=Y
    // /carros-usados/{local}?tipoveiculo=carros-usados&estadocidade=X
    // /carros-novos/{local}?tipoveiculo=carros-novos&estadocidade=X
    //
    // Regra: quando há marca+modelo, sempre usar path /carros/{local}/{marca}/{modelo}
    // com tipoveiculo=carros|carros-novos|carros-usados conforme condição.
    // O path base é sempre /carros (não /carros-novos) quando há filtro de marca.
    const vehicleWord = isMoto ? 'motos' : 'carros';
    // Sem cidade = busca nacional, omitir slug de localização
    const locationSlug = city ? this.buildLocationSlug(city, state) : '';

    const params = new URLSearchParams();
    params.set('tipoveiculo', vehicleWord);
    params.set('lkid', '1000');

    let pathBase: string;
    if (brand && model) {
      const locPart = locationSlug ? `/${locationSlug}` : '';
      pathBase = `https://www.webmotors.com.br/${vehicleWord}${locPart}/${brand.toLowerCase()}/${model.toLowerCase()}`;
      params.set('marca1',  brand.toUpperCase());
      params.set('modelo1', model.toUpperCase());
      if (c.detected_year) {
        params.set('anoInicio', String(c.detected_year - 1));
        params.set('anoFim',    String(c.detected_year + 1));
      }
      if (c.price_range?.min_price) params.set('precoMinimo', String(c.price_range.min_price));
      if (c.price_range?.max_price) params.set('precoMaximo', String(c.price_range.max_price));
    } else if (brand) {
      const locPart = locationSlug ? `/${locationSlug}` : '';
      pathBase = `https://www.webmotors.com.br/${vehicleWord}${locPart}/${brand.toLowerCase()}`;
      params.set('marca1', brand.toUpperCase());
    } else {
      pathBase = `https://www.webmotors.com.br/${vehicleWord}/${locationSlug || 'sp'}`;
    }

    if (city) params.set('estadocidade', this.normalizeCityName(city));

    const url = `${pathBase}?${params.toString()}`;
    this.logger.log(`🔗 [WEBMOTORS] URL: ${url}`);
    return url;
  }

  /** Normaliza nome da cidade para o parâmetro estadocidade do Webmotors */
  private normalizeCityName(city: string): string {
    // Mapa para nomes oficiais usados pelo Webmotors
    const officialNames: Record<string, string> = {
      'sao paulo': 'São Paulo', 'são paulo': 'São Paulo',
      'rio de janeiro': 'Rio de Janeiro',
      'belo horizonte': 'Belo Horizonte',
      'curitiba': 'Curitiba',
      'porto alegre': 'Porto Alegre',
      'brasilia': 'Brasília', 'brasília': 'Brasília',
      'salvador': 'Salvador',
      'fortaleza': 'Fortaleza',
      'recife': 'Recife',
      'manaus': 'Manaus',
      'goiania': 'Goiânia', 'goiânia': 'Goiânia',
      'campinas': 'Campinas',
      'santos': 'Santos',
      'ribeirao preto': 'Ribeirão Preto', 'ribeirão preto': 'Ribeirão Preto',
      'natal': 'Natal',
      'maceio': 'Maceió', 'maceió': 'Maceió',
      'florianopolis': 'Florianópolis', 'florianópolis': 'Florianópolis',
      'vitoria': 'Vitória', 'vitória': 'Vitória',
      'campo grande': 'Campo Grande',
      'joao pessoa': 'João Pessoa', 'joão pessoa': 'João Pessoa',
    };
    const key = city.toLowerCase().trim();
    return officialNames[key] ?? city;
  }

  /** Monta slug de localização: "sp-sao-paulo", "mg-belo-horizonte", etc. */
  private buildLocationSlug(city?: string, state?: string): string {
    // Mapa de cidades conhecidas → slug do Webmotors
    const cityMap: Record<string, string> = {
      'sao paulo':       'sp-sao-paulo',
      'são paulo':       'sp-sao-paulo',
      'rio de janeiro':  'rj-rio-de-janeiro',
      'belo horizonte':  'mg-belo-horizonte',
      'curitiba':        'pr-curitiba',
      'porto alegre':    'rs-porto-alegre',
      'brasilia':        'df-brasilia',
      'brasília':        'df-brasilia',
      'salvador':        'ba-salvador',
      'fortaleza':       'ce-fortaleza',
      'recife':          'pe-recife',
      'manaus':          'am-manaus',
      'goiania':         'go-goiania',
      'goiânia':         'go-goiania',
      'campinas':        'sp-campinas',
      'santos':          'sp-santos',
      'ribeirao preto':  'sp-ribeirao-preto',
      'ribeirão preto':  'sp-ribeirao-preto',
    };

    if (city) {
      const key = city.toLowerCase().trim();
      if (cityMap[key]) return cityMap[key];
      // Fallback: normalizar cidade + estado
      const slug = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
      const stateSlug = state?.toLowerCase().slice(0, 2) || 'br';
      return `${stateSlug}-${slug}`;
    }

    // Sem localização: usar SP como padrão (maior mercado)
    return 'sp';
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
