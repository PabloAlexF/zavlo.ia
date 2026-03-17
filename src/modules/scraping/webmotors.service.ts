import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebmotorsService {
  private readonly logger = new Logger(WebmotorsService.name);
  private readonly apiToken: string;
  private readonly actorId = 'ribtools~webmotors-scraper';

  constructor(private configService: ConfigService) {
    this.apiToken = this.configService.get('APIFY_API_KEY');
  }

  /**
   * Busca veículos no Webmotors usando o scraper Apify
   * @param query - Termo de busca (ex: "Toyota Corolla")
   * @param limit - Número máximo de resultados
   */
  async search(query: string, limit = 20, classification?: any): Promise<any[]> {
    try {
      this.logger.log(`🚙 [WEBMOTORS] Buscando: "${query}" (limit: ${limit})`);

      // Construir URL de busca do Webmotors
      const searchUrl = this.buildSearchUrl(query);

      const input = {
        startUrls: [{ url: searchUrl }],
        proxy: {
          useApifyProxy: true,
          apifyProxyGroups: ['RESIDENTIAL'],
          apifyProxyCountry: 'BR',
        },
        maxItems: limit,
      };

      this.logger.log(`📤 [WEBMOTORS] Input Apify: ${JSON.stringify(input)}`);
      this.logger.log(`📤 [WEBMOTORS] Search URL: ${searchUrl}`);

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

      this.logger.log(`📊 [WEBMOTORS] Raw results:`, JSON.stringify(results).substring(0, 500));

      if (!Array.isArray(results) || results.length === 0) {
        this.logger.warn(`⚠️ [WEBMOTORS] Nenhum resultado encontrado para: ${query}`);
        return [];
      }

      this.logger.log(`✅ [WEBMOTORS] ${results.length} resultados encontrados`);

      // Mapear para formato Zavlo.ia
      const mapped = results.slice(0, limit).map((item: any, index: number) => ({
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
        
        // Campos específicos de veículos
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
        
        // Preço FIPE
        fipePrice: item.fipe_price,
        
        // Dealer info
        dealer: item.seller?.name || item.dealer,
        dealerLocation: item.seller ? 
          `${item.seller.city}, ${item.seller.state}` : item.location,
        dealerCNPJ: item.seller?.cnpj,
        dealerPhones: item.seller?.phones || [],
        
        // Extras
        optionals: item.optionals || [],
        attributes: item.attributes || [],
        view360Url: item.view_360_url,
      }));

      return mapped;
    } catch (error) {
      this.logger.error(`❌ [WEBMOTORS] Erro: ${error.message}`);
      this.logger.error(`❌ [WEBMOTORS] Stack: ${error.stack}`);
      return [];
    }
  }

  private buildTitle(item: any): string {
    const parts = [];
    if (item.make || item.brand) parts.push(item.make || item.brand);
    if (item.model) parts.push(item.model);
    if (item.version) parts.push(item.version);
    if (item.year || item.fabrication_year) parts.push(item.year || item.fabrication_year);
    return parts.join(' ') || 'Veículo';
  }

  private extractPrice(priceStr: any): number {
    if (typeof priceStr === 'number') return priceStr;
    if (!priceStr) return 0;
    const cleaned = String(priceStr).replace(/[^0-9]/g, '');
    return parseInt(cleaned) || 0;
  }

  private buildSearchUrl(query: string): string {
    // Normalizar query para URL
    const normalized = query
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
    
    // Detectar se é carro ou moto
    const isMoto = /\b(moto|motocicleta|scooter)\b/i.test(query);
    const vehicleType = isMoto ? 'motos' : 'carros';
    
    // URL base do Webmotors com busca
    return `https://www.webmotors.com.br/comprar/${vehicleType}?q=${encodeURIComponent(normalized)}`;
  }
}
