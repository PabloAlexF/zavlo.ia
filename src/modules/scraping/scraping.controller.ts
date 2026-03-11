import { Controller, Post, Body, Logger } from '@nestjs/common';
import { GoogleShoppingService } from './google-shopping.service';
import { GoogleLensService } from './google-lens.service';

@Controller('scraping')
export class ScrapingController {
  private readonly logger = new Logger(ScrapingController.name);
  
  constructor(
    private googleShoppingService: GoogleShoppingService,
    private googleLensService: GoogleLensService,
  ) {}

  @Post('google-shopping')
  async searchGoogleShopping(@Body() body: { query: string; limit?: number }) {
    this.logger.log(`📥 [CONTROLLER] Recebido: query="${body.query}", limit=${body.limit}`);
    
    const results = await this.googleShoppingService.search(body.query, body.limit || 20);
    
    this.logger.log(`📤 [CONTROLLER] Retornando ${results.length} produtos`);
    
    // Se não encontrou produtos, retornar erro
    if (!results || results.length === 0) {
      this.logger.warn(`❌ Nenhum produto encontrado para: ${body.query}`);
      return {
        error: 'NO_RESULTS',
        message: 'Nenhum produto encontrado. Tente outra busca.',
        results: [],
      };
    }
    
    return {
      results,
    };
  }

  @Post('identify-product')
  async identifyProduct(@Body() body: { imageUrl: string }) {
    this.logger.log('📸 Recebendo requisição de identificação de produto');
    this.logger.log(`📄 Tamanho da imagem base64: ${body.imageUrl?.length || 0} caracteres`);
    
    const result = await this.googleLensService.identifyProduct(body.imageUrl);
    
    this.logger.log(`✅ Produto identificado: ${result.productName}`);
    
    return {
      warning: 'Identificação consumiu 1 crédito. A busca consumirá +1 crédito (total: 2 créditos)',
      creditsUsed: 1,
      creditsForSearch: 1,
      totalCredits: 2,
      productName: result.productName,
      confidence: result.confidence,
    };
  }

  @Post('search-by-image')
  async searchByImage(@Body() body: { imageUrl?: string; productName?: string; limit?: number }) {
    let productName = body.productName;

    // Se não tem o nome, identifica pela imagem
    if (!productName && body.imageUrl) {
      const result = await this.googleLensService.identifyProduct(body.imageUrl);
      productName = result.productName;
    }

    // SEMPRE busca no Google Shopping (ordenado por menor preço)
    const results = await this.googleShoppingService.search(productName, body.limit || 20);
    
    return {
      warning: 'Busca concluída. Total de créditos consumidos: 2 (1 identificação + 1 busca)',
      creditsUsed: 2,
      identifiedProduct: productName,
      results,
    };
  }
}
