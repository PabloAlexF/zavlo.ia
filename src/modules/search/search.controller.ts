import { Controller, Get, Post, Body, Query, Req, ForbiddenException, UseGuards, BadRequestException, UploadedFile, UseInterceptors, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(SearchController.name);

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
    @Body() body: { query: string; answers?: Record<string, string | { value: any }> },
    @CurrentUser() user?: any,
  ) {
    const { query, answers } = body;
    const answersStr = answers
      ? Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)]))
      : undefined;

    const classification = await this.searchService.classifyQueryOnly(query, user?.id);

    // Se vieram respostas do modal, enriquecer a classification no backend (imutável)
    if (answersStr && classification.classification) {
      const base = classification.classification as any;
      const enriched: Record<string, any> = {};

      if (answersStr.location) {
        const isBrazil = /^(brasil|todo(\s+o)?\s+brasil|qualquer|nacional|todo\s+o\s+pa[ií]s)$/i.test(answersStr.location.trim());
        enriched.user_location = isBrazil ? null : this.parseLocation(answersStr.location);
      }

      if (answersStr.condition) {
        const v = answersStr.condition.toLowerCase();
        enriched.condition = v.includes('novo') || v.includes('new') ? 'new'
          : v.includes('usado') || v.includes('used') ? 'used'
          : 'unknown';
      }

      if (answersStr.price_range) {
        enriched.price_range = this.parsePriceInput(answersStr.price_range);
      }

      if (answersStr.year) {
        const y = parseInt(answersStr.year);
        if (!isNaN(y)) enriched.detected_year = y;
      }

      enriched.missing_fields = (base.missing_fields || []).filter(
        (f: string) => !answersStr[f]
      );

      classification.classification = { ...base, ...enriched };
    }

    return classification;
  }

  private parseLocation(value: string): { city: string; state: string } {
    const cityStateMap: Record<string, string> = {
      'sao paulo': 'SP', 'são paulo': 'SP', 'rio de janeiro': 'RJ',
      'belo horizonte': 'MG', 'curitiba': 'PR', 'porto alegre': 'RS',
      'brasilia': 'DF', 'brasília': 'DF', 'salvador': 'BA',
      'fortaleza': 'CE', 'recife': 'PE', 'manaus': 'AM',
      'goiania': 'GO', 'goiânia': 'GO', 'campinas': 'SP',
      'santos': 'SP', 'ribeirao preto': 'SP', 'ribeirão preto': 'SP',
      'natal': 'RN', 'maceio': 'AL', 'maceió': 'AL',
      'joao pessoa': 'PB', 'joão pessoa': 'PB', 'florianopolis': 'SC',
      'florianópolis': 'SC', 'vitoria': 'ES', 'vitória': 'ES',
      'campo grande': 'MS', 'cuiaba': 'MT', 'cuiabá': 'MT',
      'porto velho': 'RO', 'macapa': 'AP', 'macapá': 'AP',
      'boa vista': 'RR', 'palmas': 'TO', 'rio branco': 'AC',
      'aracaju': 'SE', 'teresina': 'PI', 'belem': 'PA', 'belém': 'PA',
    };
    const key = value.toLowerCase().trim();
    return { city: value, state: cityStateMap[key] || '' };
  }

  private parsePriceInput(value: string): { min_price?: number; max_price?: number } {
    try {
      const parsed = JSON.parse(value);
      if (parsed?.value) return { min_price: parsed.value.min, max_price: parsed.value.max };
    } catch {}

    const clean = value.replace(/r\$\s?/gi, '');
    const isAbove = /acima|mais de|a partir|m[ií]nimo/i.test(clean);

    const parseMonetary = (s: string): number => {
      if (/\d{1,3}(\.\d{3})+(,\d+)?$/.test(s))
        return parseFloat(s.replace(/\./g, '').replace(',', '.'));
      return parseFloat(s.replace(',', '.'));
    };

    // Processar multiplicador por token individual (evita aplicar "mil" global)
    const tokenRegex = /([\d]{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?|\d+)\s*(milh[aã]o|milh[oõ]es|mil|k)?/gi;
    const nums: number[] = [];
    let match: RegExpExecArray | null;
    while ((match = tokenRegex.exec(clean)) !== null) {
      const n = parseMonetary(match[1]);
      if (isNaN(n)) continue;
      const unit = (match[2] || '').toLowerCase();
      if (unit.startsWith('milh'))   nums.push(n * 1_000_000);
      else if (unit === 'mil' || unit === 'k') nums.push(n * 1_000);
      else nums.push(n);
    }

    if (nums.length >= 2) return { min_price: Math.min(nums[0], nums[1]), max_price: Math.max(nums[0], nums[1]) };
    if (nums.length === 1) return isAbove ? { min_price: nums[0] } : { max_price: nums[0] };
    return {};
  }

  @Get('text')
  @UseGuards(OptionalJwtAuthGuard)
  async searchByText(
    @Query() searchDto: SearchTextDto,
    @Query('sortBy') sortBy: 'RELEVANCE' | 'BEST_MATCH' | 'LOWEST_PRICE' | 'HIGHEST_PRICE' | 'TOP_RATED' | undefined,
    @Query('minPrice') minPrice: number | undefined,
    @Query('maxPrice') maxPrice: number | undefined,
    @Query('classification') classificationStr: string | undefined, // ✅ Receber classificação do frontend
    @Req() req: Request,
    @CurrentUser() user?: any,
  ) {
    const { query, useRealScraping, limit, ...filters } = searchDto;
    const clientIp = this.getClientIp(req);

    this.logger.log(`[SEARCH] query="${query}" user=${user?.id ?? 'anonymous'} ip=${clientIp}`);

    // ✅ Parse classificação se fornecida
    let classification;
    if (classificationStr) {
      try {
        classification = JSON.parse(classificationStr);
      } catch {
        this.logger.warn('[SEARCH] Invalid classification JSON, will re-classify');
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

    if (!hasUsed) {
      await this.ipLimitService.markFreeSearchUsed(clientIp);
      return this.searchService.searchByText(
        query,
        { ...searchFilters, useRealScraping: true, freeMode: true, limit: limit || 10 },
        user?.id,
      );
    }

    // IP já usou a busca gratuita
    if (!user) {
      throw new ForbiddenException({
        error: 'FREE_LIMIT_EXCEEDED',
        message: 'Você já fez sua busca gratuita. Faça login ou assine um plano para continuar.',
        action: 'login_or_upgrade',
      });
    }

    // Usuário free SEM créditos avulsos → freeMode (resultados limitados)
    // Usuário free COM créditos avulsos → tratado como pago (crédito deduzido normalmente)
    if (user.plan === 'free' && (!user.credits || user.credits <= 0)) {
      return this.searchService.searchByText(
        query,
        { ...searchFilters, useRealScraping: true, freeMode: true, limit: limit || 10 },
        user.id,
      );
    }

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

  @Get('suggestions')
  async getSuggestions(@Query('q') query: string) {
    return this.searchService.getSuggestions(query);
  }
}

