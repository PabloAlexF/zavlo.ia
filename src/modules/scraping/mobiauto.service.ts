import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MobiautoService {
  private readonly logger = new Logger(MobiautoService.name);
  private readonly apiToken: string;
  private readonly actorId = 'ecomscrape~mobiauto-cars-search-scraper';

  constructor(private configService: ConfigService) {
    this.apiToken = this.configService.get('APIFY_API_KEY');
  }

  /**
   * Busca veículos no Mobiauto usando o scraper Apify
   * @param query - Termo de busca (ex: "Fiat Uno 2020")
   * @param limit - Número máximo de resultados
   * @param classification - Classificação com dados estruturados (marca, modelo, ano, localização)
   */
  async search(query: string, limit = 20, classification?: any): Promise<any[]> {
    try {
      this.logger.log(`🚗 [MOBIAUTO] Buscando: "${query}" (limit: ${limit})`);

      // Construir URL de busca do Mobiauto usando dados estruturados
      const searchUrl = this.buildSearchUrl(query, classification);

      const input = {
        urls: [searchUrl],
        max_items_per_url: limit,
        ignore_url_failures: true,
        max_retries_per_url: 2,
        proxy: {
          useApifyProxy: true,
          apifyProxyGroups: ['RESIDENTIAL'],
          apifyProxyCountry: 'BR', // Proxy brasileiro
        },
      };

      this.logger.log(`📤 [MOBIAUTO] Input Apify: ${JSON.stringify(input)}`);

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
        this.logger.warn(`⚠️ [MOBIAUTO] Nenhum resultado encontrado para: ${query}`);
        return [];
      }

      this.logger.log(`✅ [MOBIAUTO] ${results.length} resultados encontrados`);

      // Mapear para formato Zavlo.ia
      const mapped = results.slice(0, limit).map((item: any, index: number) => ({
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
        
        // Campos específicos de veículos
        make: item.trim?.make?.name,
        model: item.trim?.model?.name,
        year: item.trim?.production_year,
        modelYear: item.trim?.model?.year,
        km: item.km,
        fuelType: item.trim?.fuel?.name,
        transmission: item.trim?.transmission?.name,
        bodyType: item.trim?.bodystyle?.name,
        doors: item.trim?.doors,
        
        // Dealer info
        dealer: item.dealer?.name,
        dealerLocation: item.dealer?.location ? 
          `${item.dealer.location.city}, ${item.dealer.location.state}` : null,
        
        // Extras
        hasWarranty: item.has_mechanical_warranty,
        hasAssistance: item.has_repair_assistance,
        isOEM: item.oem,
      }));

      return mapped;
    } catch (error) {
      this.logger.error(`❌ [MOBIAUTO] Erro: ${error.message}`);
      return [];
    }
  }

  private buildSearchUrl(query: string, classification?: any): string {
    // Se temos classificação com dados estruturados, construir URL de busca
    if (classification) {
      const parts = ['https://www.mobiauto.com.br/comprar/carros'];
      
      // Marca
      if (classification.detected_brand) {
        parts.push(this.normalizeForUrl(classification.detected_brand));
        
        // Modelo (extrair da query)
        const model = this.extractModel(query, classification.detected_brand);
        if (model) {
          parts.push(this.normalizeForUrl(model));
        }
      }
      
      // Localização: cidade-estado OU brasil
      if (classification.user_location?.city && classification.user_location?.state) {
        const city = this.normalizeForUrl(classification.user_location.city);
        const state = this.normalizeForUrl(classification.user_location.state);
        parts.push(`${city}-${state}`);
      } else {
        parts.push('brasil');
      }
      
      const url = parts.join('/');
      this.logger.log(`🔗 [MOBIAUTO] URL estruturada: ${url}`);
      return url;
    }
    
    // Fallback: busca simples
    return `https://www.mobiauto.com.br/comprar/carros/brasil?q=${encodeURIComponent(query)}`;
  }
  
  private normalizeForUrl(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }
  
  private extractModel(query: string, brand?: string): string | null {
    let normalized = query.toLowerCase();
    
    // Remover marca da query
    if (brand) {
      normalized = normalized.replace(new RegExp(brand, 'gi'), '').trim();
    }
    
    // Remover palavras comuns
    const stopWords = ['novo', 'usado', 'seminovo', 'ate', 'em', 'manual', 'automatico'];
    const words = normalized.split(/\s+/).filter(w => !stopWords.includes(w) && !/^\d{4}$/.test(w));
    
    return words[0] || null;
  }

  private buildTitle(item: any): string {
    const parts = [];
    
    if (item.trim?.make?.name) parts.push(item.trim.make.name);
    if (item.trim?.model?.name) parts.push(item.trim.model.name);
    if (item.trim?.name) parts.push(item.trim.name);
    if (item.trim?.production_year) parts.push(item.trim.production_year);
    
    return parts.join(' ') || 'Veículo';
  }

  private getImageUrl(imageObj: any): string {
    if (!imageObj) return '';
    if (typeof imageObj === 'string') return imageObj;
    if (imageObj.image_id) {
      return `https://image.mobiauto.com.br/${imageObj.image_id}/1gg.jpg`;
    }
    return '';
  }
}
