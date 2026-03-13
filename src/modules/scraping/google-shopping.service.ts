import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleShoppingService {
  private readonly logger = new Logger(GoogleShoppingService.name);
  private readonly apiToken: string;
  private readonly actorId = 'burbn~google-shopping-scraper';

  constructor(private configService: ConfigService) {
    this.apiToken = this.configService.get('APIFY_API_KEY');
  }

  async search(query: string, limit = 50, sortBy: 'RELEVANCE' | 'LOWEST_PRICE' | 'HIGHEST_PRICE' = 'RELEVANCE'): Promise<any[]> {
    try {
      this.logger.log(`Buscando no Google Shopping: ${query} (sortBy: ${sortBy})`);

      // Aumentar limite para 100 (máximo do Apify)
      const maxLimit = Math.min(limit, 100);

      const input = {
        country: 'BR',
        language: 'pt-BR',
        limit: maxLimit,
        searchQuery: query,
        sortBy: sortBy,
      };

      this.logger.log(`Input Apify: ${JSON.stringify(input)}`);

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
        this.logger.error(`Apify API error ${response.status}: ${errorText}`);
        throw new Error(`Apify API error: ${response.status}`);
      }

      const results = await response.json();

      if (!Array.isArray(results) || results.length === 0) {
        this.logger.warn(`Nenhum resultado encontrado para: ${query}`);
        return [];
      }

      this.logger.log(`Resultados recebidos: ${results.length}`);
      this.logger.log(`Primeiro resultado: ${JSON.stringify(results[0]?.productTitle || 'N/A')}`);
      
      if (results.length > 0) {
        this.logger.log('Primeiros 3 titulos:');
        results.slice(0, 3).forEach((item, i) => {
          this.logger.log(`  ${i + 1}. ${item.productTitle}`);
        });
      }

      // Filtro mais flexível - aceita se tiver pelo menos 1 palavra-chave importante
      const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      const importantWords = queryWords.filter(w => w.length > 3); // Palavras com mais de 3 letras
      const filtered = results.filter((item: any) => {
        const title = (item.productTitle || '').toLowerCase();
        // Aceita se tiver pelo menos 1 palavra importante OU 2 palavras quaisquer
        const hasImportantWord = importantWords.some(word => title.includes(word));
        const matchCount = queryWords.filter(word => title.includes(word)).length;
        return hasImportantWord || matchCount >= 2;
      });

      this.logger.log(`Resultados filtrados: ${filtered.length}`);
      
      if (filtered.length > 0) {
        this.logger.log('Primeiros 3 filtrados:');
        filtered.slice(0, 3).forEach((item, i) => {
          this.logger.log(`  ${i + 1}. ${item.productTitle}`);
        });
      }

      // Mapear para formato Zavlo.ia
      const mapped = filtered.map((item: any, index: number) => ({
        id: item.offerId || item.productId || `product-${index}`,
        title: item.productTitle,
        price: this.parsePrice(item.price),
        image: item.productPhotos?.[0] || '',
        images: item.productPhotos || [],
        source: item.storeName || 'Google Shopping',
        url: item.offerPageUrl,
        sourceUrl: item.offerPageUrl,
        rating: item.productRating,
        reviews: item.productNumReviews,
        condition: this.detectCondition(item),
        category: 'geral',
        scrapedAt: new Date().toISOString(),
        
        // Campos que a API realmente retorna
        storeRating: item.storeRating || null,
        storeReviews: item.storeReviewCount || null,
        
        // Shipping (se existir)
        shipping: item.shipping ? {
          price: 0,
          time: item.shipping,
          free: this.isFreeShipping(item)
        } : null,
        
        // Campos que podem não existir
        originalPrice: item.originalPrice ? this.parsePrice(item.originalPrice) : null,
        onSale: item.onSale || false,
        percentOff: item.percentOff || null,
        
        // Especificações (se existirem)
        brand: item.brand || null,
        description: item.productDescription || null,
        
        // Disponibilidade
        inStock: item.productCondition !== 'out_of_stock',
        
        // Confiabilidade
        verified: false, // API não retorna isso
        
        // Ofertas
        numOffers: item.productNumOffers || null,
      }));
      
      // Ordenar manualmente se necessário (garantia)
      if (sortBy === 'LOWEST_PRICE') {
        mapped.sort((a, b) => a.price - b.price);
        this.logger.log('✅ Ordenado manualmente por MENOR PREÇO');
        this.logger.log(`Primeiros 3 preços: ${mapped.slice(0, 3).map(p => `R$ ${p.price.toFixed(2)}`).join(', ')}`);
      } else if (sortBy === 'HIGHEST_PRICE') {
        mapped.sort((a, b) => b.price - a.price);
        this.logger.log('✅ Ordenado manualmente por MAIOR PREÇO');
        this.logger.log(`Primeiros 3 preços: ${mapped.slice(0, 3).map(p => `R$ ${p.price.toFixed(2)}`).join(', ')}`);
      }
      
      return mapped;
    } catch (error) {
      this.logger.error(`Erro no Google Shopping: ${error.message}`);
      return [];
    }
  }

  private detectCondition(item: any): 'new' | 'used' {
    const title = (item.productTitle || '').toLowerCase();
    const condition = (item.productCondition || '').toLowerCase();
    const source = (item.storeName || '').toLowerCase();

    // Se tem campo productCondition
    if (condition.includes('used') || condition === 'usado') return 'used';
    if (condition.includes('new') || condition === 'novo') return 'new';

    // Se é da OLX, provavelmente é usado
    if (source.includes('olx')) return 'used';

    // Se o título menciona usado
    if (title.includes('usado') || title.includes('seminovo') || title.includes('refurbished')) {
      return 'used';
    }

    // Padrão: novo
    return 'new';
  }

  private parsePrice(priceStr: string): number {
    if (!priceStr) return 0;
    // Remove R$, pontos e converte vírgula para ponto
    const cleaned = priceStr.replace(/[R$\s.]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }
  
  private isFreeShipping(item: any): boolean {
    const shipping = (item.shipping || '').toLowerCase();
    const shippingPrice = item.shippingPrice || '';
    
    return shipping.includes('grátis') || 
           shipping.includes('free') || 
           shippingPrice === '0' || 
           shippingPrice === 'R$ 0,00';
  }
  
  private calculateDiscount(currentPrice: string, originalPrice: string): number {
    if (!currentPrice || !originalPrice) return 0;
    
    const current = this.parsePrice(currentPrice);
    const original = this.parsePrice(originalPrice);
    
    if (original <= current) return 0;
    
    return Math.round(((original - current) / original) * 100);
  }
}
