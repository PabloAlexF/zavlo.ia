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
  async search(query: string, limit = 20): Promise<any[]> {
    try {
      this.logger.log(`🚙 [WEBMOTORS] Buscando: "${query}" (limit: ${limit})`);

      // Construir URL de busca do Webmotors
      const searchUrl = this.buildSearchUrl(query);

      const input = {
        startUrls: [searchUrl],
        proxyConfiguration: {
          useApifyProxy: true,
          apifyProxyGroups: ['RESIDENTIAL'],
        },
        maxResults: limit,
      };

      this.logger.log(`📤 [WEBMOTORS] Input Apify: ${JSON.stringify(input)}`);

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
        this.logger.error(`❌ [WEBMOTORS] Apify API error ${response.status}: ${errorText}`);
        throw new Error(`Webmotors Apify API error: ${response.status}`);
      }

      const results = await response.json();

      if (!Array.isArray(results) || results.length === 0) {
        this.logger.warn(`⚠️ [WEBMOTORS] Nenhum resultado encontrado para: ${query}`);
        return [];
      }

      this.logger.log(`✅ [WEBMOTORS] ${results.length} resultados encontrados`);

      // Mapear para formato Zavlo.ia
      const mapped = results.slice(0, limit).map((item: any, index: number) => ({
        id: item.id || `webmotors-${index}`,
        title: item.title,
        price: item.price || 0,
        image: item.photos?.[0] || '',
        images: item.photos || [],
        source: 'Webmotors',
        url: item.url,
        sourceUrl: item.url,
        condition: item.km === 0 || item.vehicle_type === 'new' ? 'new' : 'used',
        category: 'vehicle',
        scrapedAt: new Date().toISOString(),
        
        // Campos específicos de veículos
        make: item.make,
        model: item.model,
        version: item.version,
        year: item.fabrication_year,
        modelYear: item.model_year,
        km: item.km,
        fuelType: item.fuel_type,
        transmission: item.transmission,
        bodyType: item.body_type,
        color: item.color,
        doors: item.number_of_doors,
        finalPlate: item.final_plate,
        isArmored: item.is_armored,
        
        // Preço FIPE
        fipePrice: item.fipe_price,
        
        // Dealer info
        dealer: item.seller?.name,
        dealerLocation: item.seller ? 
          `${item.seller.city}, ${item.seller.state}` : null,
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
      return [];
    }
  }

  private buildSearchUrl(query: string): string {
    // Normalizar query para URL
    const normalized = query
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
    
    // Detectar se é carro ou moto
    const isMoto = /\b(moto|motocicleta|scooter|honda|yamaha|suzuki)\b/i.test(query);
    const vehicleType = isMoto ? 'motos-usadas' : 'carros-usados';
    
    // URL base do Webmotors com busca
    return `https://www.webmotors.com.br/${vehicleType}/sp?lkid=1000&tipoveiculo=${vehicleType}&estadocidade=São%20Paulo&q=${encodeURIComponent(normalized)}`;
  }
}
