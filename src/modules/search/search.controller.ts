import { Controller, Get, Post, Body, Query, Req, ForbiddenException, UseGuards, BadRequestException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { SearchService } from './search.service';
import { CloudinaryService } from './cloudinary.service';
import { IpLimitService } from './ip-limit.service';
import { SearchTextDto, SearchImageDto } from './dto/search.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Controller('search')
export class SearchController {
  constructor(
    private searchService: SearchService,
    private cloudinaryService: CloudinaryService,
    private ipLimitService: IpLimitService,
  ) {}

  /**
   * Extrai o IP real do request (considera proxies)
   */
  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return (forwarded as string).split(',')[0].trim();
    }
    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  @Post('classify')
  @UseGuards(OptionalJwtAuthGuard)
  async classifyQuery(
    @Body() body: { query: string },
    @CurrentUser() user?: any,
  ) {
    const { query } = body;

    console.log(`🔍 [CLASSIFY] Classifying query: ${query}`);
    console.log(`   - user: ${user ? `${user.id} (${user.plan})` : 'anonymous'}`);

    // ✅ APENAS CLASSIFICAR - NÃO CONSUMIR CRÉDITOS
    const classification = await this.searchService.classifyQueryOnly(query, user?.id);

    console.log(`✅ [CLASSIFY] Classification result:`, classification);

    return classification;
  }

  @Get('text')
  @UseGuards(OptionalJwtAuthGuard)
  async searchByText(
    @Query() searchDto: SearchTextDto,
    @Query('sortBy') sortBy: 'RELEVANCE' | 'LOWEST_PRICE' | 'HIGHEST_PRICE' | undefined,
    @Query('minPrice') minPrice: number | undefined,
    @Query('maxPrice') maxPrice: number | undefined,
    @Query('classification') classificationStr: string | undefined, // ✅ Receber classificação do frontend
    @Req() req: Request,
    @CurrentUser() user?: any,
  ) {
    const { query, useRealScraping, limit, ...filters } = searchDto;
    const clientIp = this.getClientIp(req);

    console.log(`🔍 [CONTROLLER DEBUG] Search request:`);
    console.log(`   - query: ${query}`);
    console.log(`   - sortBy: ${sortBy}`);
    console.log(`   - minPrice: ${minPrice}`);
    console.log(`   - maxPrice: ${maxPrice}`);
    console.log(`   - classification provided: ${!!classificationStr}`);
    console.log(`   - user: ${user ? `${user.id} (${user.plan})` : 'anonymous'}`);
    console.log(`   - clientIp: ${clientIp}`);
    console.log(`   - filters:`, filters);

    // ✅ Parse classificação se fornecida
    let classification;
    if (classificationStr) {
      try {
        classification = JSON.parse(classificationStr);
        console.log(`✅ [CONTROLLER] Using provided classification, skipping re-classification`);
      } catch (error) {
        console.warn(`⚠️ [CONTROLLER] Invalid classification JSON, will re-classify`);
      }
    }

    // Adiciona sortBy e filtros de preço
    const searchFilters = {
      ...filters,
      sortBy: sortBy || 'RELEVANCE',
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      providedClassification: classification // ✅ Passar para service
    };

    // ============================================
    // REGRA: 1 BUSCA DE TEXTO GRATUITA POR IP
    // ============================================
    const hasUsed = await this.ipLimitService.hasUsedFreeSearch(clientIp);
    console.log(`🔍 [CONTROLLER DEBUG] IP ${clientIp} hasUsed free search: ${hasUsed}`);

    if (!hasUsed) {
      // IP ainda não usou = busca gratuita
      console.log(`✅ [CONTROLLER DEBUG] Using free search for IP ${clientIp}`);
      await this.ipLimitService.markFreeSearchUsed(clientIp);
      return this.searchService.searchByText(
        query,
        { ...searchFilters, useRealScraping: true, freeMode: true, limit: limit || 10 },
        user?.id,
      );
    }

    // IP já usou a busca gratuita
    if (!user) {
      console.log(`❌ [CONTROLLER DEBUG] IP ${clientIp} already used free search and no user logged in`);
      throw new ForbiddenException({
        error: 'FREE_LIMIT_EXCEEDED',
        message: 'Você já fez sua busca gratuita. Faça login ou assine um plano para continuar.',
        action: 'login_or_upgrade',
      });
    }

    console.log(`🔍 [CONTROLLER DEBUG] User ${user.id} with plan ${user.plan} proceeding with search`);

    // Usuário logado - usa créditos/plano
    if (user.plan === 'free') {
      console.log(`🔍 [CONTROLLER DEBUG] Free plan user - using freeMode`);
      return this.searchService.searchByText(
        query,
        { ...searchFilters, useRealScraping: true, freeMode: true, limit: limit || 10 },
        user.id,
      );
    }

    console.log(`🔍 [CONTROLLER DEBUG] Paid plan user - using full search`);
    return this.searchService.searchByText(
      query,
      { ...searchFilters, useRealScraping: useRealScraping === 'true', limit: limit || 50 },
      user.id,
    );
  }

  @Get('real')
  @UseGuards(JwtAuthGuard)
  async searchReal(
    @Query('query') query: string,
    @CurrentUser() user: any,
  ) {
    // Scraping real só para planos pagos
    if (user.plan === 'free') {
      throw new ForbiddenException({
        error: 'FEATURE_NOT_AVAILABLE',
        message: 'Scraping em tempo real disponível apenas para planos pagos.',
        action: 'upgrade_plan',
      });
    }

    return this.searchService.searchByText(query, { useRealScraping: true }, user.id);
  }

  @Post('image')
  @UseGuards(JwtAuthGuard)
  async searchByImage(
    @Body() body: { imageUrl?: string; imageData?: string },
    @CurrentUser() user: any,
  ) {
    // Busca por imagem NÃO disponível no plano free
    if (user.plan === 'free') {
      throw new ForbiddenException({
        error: 'FEATURE_NOT_AVAILABLE',
        message: 'Busca por imagem disponível apenas para planos pagos.',
        action: 'upgrade_plan',
      });
    }

    // Usar imageData se fornecido (enviado diretamente), ou imageUrl como fallback
    const imageUrl = body.imageData || body.imageUrl;

    if (!imageUrl) {
      throw new BadRequestException({
        error: 'MISSING_IMAGE',
        message: 'Forneça uma imagem (imageUrl ou imageData)',
      });
    }

    return this.searchService.searchByImage(imageUrl, user.id);
  }

  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: any,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    // ✅ PROBLEMA 6 CORRIGIDO: Usar CloudinaryService
    const imageUrl = await this.cloudinaryService.uploadImage(file);
    return { imageUrl };
  }

  @Post('prices')
  @UseGuards(JwtAuthGuard)
  async searchProductPrices(
    @Body() body: { productName: string },
    @CurrentUser() user: any,
  ) {
    // Busca de preços NÃO disponível no plano free
    if (user.plan === 'free') {
      throw new ForbiddenException({
        error: 'FEATURE_NOT_AVAILABLE',
        message: 'Busca de preços disponível apenas para planos pagos.',
        action: 'upgrade_plan',
      });
    }

    if (!body.productName) {
      throw new BadRequestException({
        error: 'MISSING_PRODUCT_NAME',
        message: 'Nome do produto é obrigatório',
      });
    }

    return this.searchService.searchProductPrices(body.productName, user.id);
  }

  @Get('debug/credits')
  @UseGuards(JwtAuthGuard)
  async debugCredits(@CurrentUser() user: any) {
    console.log(`🔍 [DEBUG] Checking credits for user ${user.id}`);
    
    const userDetails = await this.searchService.getUserDetails(user.id);
    
    console.log(`🔍 [DEBUG] User details:`, userDetails);
    
    return {
      userId: user.id,
      userDetails,
      timestamp: new Date().toISOString()
    };
  }

  @Post('debug/use-credit')
  @UseGuards(JwtAuthGuard)
  async debugUseCredit(@CurrentUser() user: any) {
    console.log(`🔍 [DEBUG] Manually using 1 credit for user ${user.id}`);
    
    try {
      const result = await this.searchService.debugUseCredit(user.id);
      console.log(`✅ [DEBUG] Credit used successfully:`, result);
      return result;
    } catch (error) {
      console.error(`❌ [DEBUG] Error using credit:`, error);
      throw error;
    }
  }

  @Get('suggestions')
  async getSuggestions(@Query('q') query: string) {
    return this.searchService.getSuggestions(query);
  }
}

