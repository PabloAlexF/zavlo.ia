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
import { ClassificationData, ClassifyQueryRequest, ClassifyQueryResponse } from '@shared/contracts/classification.contract';
import { orderQuestionFields, filterMissingFieldsByScraper, getQuestionForField } from '@shared/chat/questionRules';

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

  private sanitizeLog(value: string): string {
    return String(value)
      .replace(/[\r\n\t]/g, ' ')
      .replace(/[\x00-\x1F\x7F]/g, '')
      .slice(0, 200);
  }

  @Post('classify')
  @UseGuards(OptionalJwtAuthGuard)
  async classifyQuery(
    @Body() body: ClassifyQueryRequest,
    @CurrentUser() user?: any,
  ): Promise<ClassifyQueryResponse> {
    const { query, answers, prevClassification } = body;
    const answersStr = answers
      ? Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)]))
      : undefined;

    // Se vieram respostas + prevClassification, usar prevClassification como base
    // e pular reclassificação do Python para evitar missing_fields inconsistentes
    if (answersStr && prevClassification) {
      return this.enrichClassification(prevClassification, answersStr);
    }

    const result = await this.searchService.classifyQueryOnly(query, user?.id);

    if (result.classification?.missing_fields?.length) {
      const orderedFields = orderQuestionFields(result.classification.missing_fields, result.classification);
      const compatibleFields = filterMissingFieldsByScraper(orderedFields, result.classification);
      result.classification.missing_fields = compatibleFields;
      result.missingFields = compatibleFields;
      result.question = compatibleFields.length > 0
        ? getQuestionForField(compatibleFields[0], result.classification, result.classification.suggested_question)
        : undefined;
      result.needsQuestion = compatibleFields.length > 0;
    }

    // Fallback: answers sem prevClassification — enriquecer sobre a nova classificação
    if (answersStr && result.classification) {
      return this.enrichClassification(result.classification, answersStr);
    }

    return result;
  }

  private enrichClassification(
    base: ClassificationData,
    answersStr: Record<string, string>,
  ): ClassifyQueryResponse {
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
    if (answersStr.price_range) enriched.price_range = this.parsePriceInput(answersStr.price_range);
    if (answersStr.year) {
      const y = parseInt(answersStr.year);
      if (!isNaN(y)) enriched.detected_year = y;
    }
    if (answersStr.gender)   enriched.detected_gender   = answersStr.gender;
    if (answersStr.size)     enriched.detected_size     = answersStr.size;
    if (answersStr.storage)  enriched.detected_storage  = answersStr.storage;
    if (answersStr.transmission && answersStr.transmission !== 'qualquer') enriched.detected_transmission = answersStr.transmission;
    if (answersStr.fuel      && answersStr.fuel      !== 'qualquer') enriched.detected_fuel      = answersStr.fuel;
    if (answersStr.body_type && answersStr.body_type !== 'qualquer') enriched.detected_body_type = answersStr.body_type;
    if (answersStr.brand     && answersStr.brand     !== 'qualquer') enriched.detected_brand     = answersStr.brand;
    if (answersStr.shoe_type) {
      enriched.detected_shoe_type = answersStr.shoe_type;
      enriched.last_filters = { ...(base.last_filters || {}), shoe_type: answersStr.shoe_type };
    }

    // 🌟 Nova lógica: minimum_rating
    if (answersStr.minimum_rating) {
      const ratingMap: Record<string, number> = {
        'bom': 4.0, '4': 4.0, '4.0': 4.0, '4+': 4.0,
        'muito bom': 4.5, '4.5': 4.5, '4.5+': 4.5,
        'excelente': 4.8, '5': 4.8, '5 estrelas': 4.8,
      };
      const ratingKey = answersStr.minimum_rating.toLowerCase().trim();
      const parsed = ratingMap[ratingKey] ?? parseFloat(ratingKey);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 5) {
        enriched.minimum_rating = parsed;
      }
    }

    // 🚚 Nova lógica: require_free_shipping
    if (answersStr.require_free_shipping) {
      const freightKey = answersStr.require_free_shipping.toLowerCase().trim();
      enriched.require_free_shipping = 
        ['sim', 'yes', 's', 'ok', 'grátis', 'gratuito', 'frete grátis'].some(w => freightKey.includes(w));
    }

    // 💳 Nova lógica: prefer_installments (Mercadolivre parcelamento sem juros)
    if (answersStr.prefer_installments) {
      const installKey = answersStr.prefer_installments.toLowerCase().trim();
      enriched.prefer_installments = 
        ['sim', 'yes', 's', 'ok', 'parcelado', 'parcels', 'sem juros', 'parcelamento'].some(w => installKey.includes(w));
    }

    // 🎉 Nova lógica: priority_discounted (promoções/descontos)
    if (answersStr.priority_discounted) {
      const promoKey = answersStr.priority_discounted.toLowerCase().trim();
      enriched.priority_discounted = 
        ['sim', 'yes', 's', 'ok', 'promoção', 'promocao', 'oferta', 'desconto', 'off'].some(w => promoKey.includes(w));
    }

    // 📍 Nova lógica: prefer_proximity_olx (proximidade em OLX)
    if (answersStr.prefer_proximity_olx) {
      const proximityKey = answersStr.prefer_proximity_olx.toLowerCase().trim();
      if (['sim', 'yes', 's', 'ok', 'perto', 'próximo', 'proximo', 'saída'].some(w => proximityKey.includes(w))) {
        enriched.prefer_proximity_olx = 'nearby';
      } else {
        enriched.prefer_proximity_olx = 'any';
      }
    }

    // 👤 Nova lógica: seller_type_preference (tipo de vendedor)
    if (answersStr.seller_type_preference) {
      const sellerKey = answersStr.seller_type_preference.toLowerCase().trim();
      if (['loja', 'profissional', 'empresa', 'business', 'verificado'].some(w => sellerKey.includes(w))) {
        enriched.seller_type_preference = 'business';
      } else if (['particular', 'individual', 'pessoa', 'usuário', 'usuario', 'comum'].some(w => sellerKey.includes(w))) {
        enriched.seller_type_preference = 'individual';
      } else {
        enriched.seller_type_preference = 'any';
      }
    }

    // 📦 Nova lógica: availability_preference (disponibilidade)
    if (answersStr.availability_preference) {
      const availKey = answersStr.availability_preference.toLowerCase().trim();
      if (['nao', 'não', 'no', 'n', 'agora', 'imediato', 'estoque'].some(w => availKey.includes(w))) {
        enriched.availability_preference = 'in_stock';
      } else {
        enriched.availability_preference = 'flexible';
      }
    }

    // 📉 Nova lógica: prefer_price_drop (priorizar produtos em queda recente)
    if (answersStr.prefer_price_drop) {
      const trendKey = answersStr.prefer_price_drop.toLowerCase().trim();
      enriched.prefer_price_drop =
        ['sim', 'yes', 's', 'ok', 'queda', 'caindo', 'oferta'].some(w => trendKey.includes(w));
    }

    if (answersStr.ml_scrape_ofertas) {
      const key = answersStr.ml_scrape_ofertas.toLowerCase().trim();
      enriched.ml_scrape_ofertas =
        ['sim', 'yes', 's', 'ok', 'oferta', 'ofertas'].some((w) => key.includes(w));
    }

    if (answersStr.ml_promoted) {
      const key = answersStr.ml_promoted.toLowerCase().trim();
      enriched.ml_promoted =
        ['sim', 'yes', 's', 'ok', 'patrocin', 'anúncio', 'anuncio'].some((w) => key.includes(w));
    }

    if (answersStr.olx_max_pages) {
      const parsed = Number(answersStr.olx_max_pages);
      if (Number.isFinite(parsed)) {
        enriched.olx_max_pages = Math.min(Math.max(parsed, 1), 3);
      }
    }

    if (answersStr.webmotors_seller_data_addon) {
      const key = answersStr.webmotors_seller_data_addon.toLowerCase().trim();
      enriched.webmotors_seller_data_addon =
        ['sim', 'yes', 's', 'ok', 'vendedor', 'cnpj', 'telefone'].some((w) => key.includes(w));
    }

    if (answersStr.webmotors_max_requests) {
      const parsed = Number(answersStr.webmotors_max_requests);
      if (Number.isFinite(parsed)) {
        enriched.webmotors_max_requests = Math.min(Math.max(parsed, 1), 30);
      }
    }

    if (answersStr.google_country) {
      enriched.google_country = answersStr.google_country.toLowerCase().trim().slice(0, 2);
    }

    if (answersStr.google_language) {
      enriched.google_language = answersStr.google_language.toLowerCase().trim().slice(0, 2);
    }

    if (answersStr.google_limit) {
      const parsed = Number(answersStr.google_limit);
      if (Number.isFinite(parsed)) {
        enriched.google_limit = Math.min(Math.max(parsed, 20), 100);
      }
    }

    const final = { ...base, ...enriched };

    // Reconstruir search_query em português para os scrapers
    const condLabel = final.condition === 'new' ? 'novo' : final.condition === 'used' ? 'usado' : null;
    const sq = [
      final.normalized_query || base.normalized_query || '',
      final.detected_year ? String(final.detected_year) : null,
      condLabel,
      final.detected_brand     && final.detected_brand     !== 'qualquer' ? final.detected_brand     : null,
      final.detected_gender    && final.detected_gender    !== 'qualquer' ? final.detected_gender    : null,
      final.detected_size      && final.detected_size      !== 'qualquer' ? final.detected_size      : null,
      final.detected_storage   && final.detected_storage   !== 'qualquer' ? final.detected_storage   : null,
      final.detected_transmission && final.detected_transmission !== 'qualquer' ? final.detected_transmission : null,
      final.detected_fuel      && final.detected_fuel      !== 'qualquer' ? final.detected_fuel      : null,
      final.detected_body_type && final.detected_body_type !== 'qualquer' ? final.detected_body_type : null,
      final.user_location?.city ?? null,
    ].filter(Boolean).join(' ');
    if (sq.trim()) enriched.search_query = sq.trim();

    // Limpar missing_fields: remover campos já respondidos ou já preenchidos
    const alreadyFilled = (f: string) => {
      if (answersStr[f] !== undefined)                              return true;
      if (f === 'year'         && final.detected_year)              return true;
      if (f === 'condition'    && final.condition !== 'unknown')    return true;
      if (f === 'location'     && final.user_location !== undefined) return true;
      if (f === 'price_range'  && final.price_range)                return true;
      if (f === 'brand'        && final.detected_brand)             return true;
      if (f === 'gender'       && final.detected_gender)            return true;
      if (f === 'size'         && final.detected_size)              return true;
      if (f === 'storage'      && final.detected_storage)           return true;
      if (f === 'transmission' && final.detected_transmission)      return true;
      if (f === 'fuel'         && final.detected_fuel)              return true;
      if (f === 'body_type'    && final.detected_body_type)         return true;
      if (f === 'ml_scrape_ofertas' && final.ml_scrape_ofertas !== undefined) return true;
      if (f === 'ml_promoted'       && final.ml_promoted !== undefined)       return true;
      if (f === 'olx_max_pages'     && final.olx_max_pages !== undefined)     return true;
      if (f === 'webmotors_seller_data_addon' && final.webmotors_seller_data_addon !== undefined) return true;
      if (f === 'webmotors_max_requests'      && final.webmotors_max_requests !== undefined)      return true;
      if (f === 'google_country'    && final.google_country !== undefined)    return true;
      if (f === 'google_language'   && final.google_language !== undefined)   return true;
      if (f === 'google_limit'      && final.google_limit !== undefined)      return true;
      return false;
    };
    const orderedMissingFields = orderQuestionFields(
      (base.missing_fields || []).filter((f: string) => !alreadyFilled(f)),
      final as ClassificationData,
    );
    enriched.missing_fields = filterMissingFieldsByScraper(orderedMissingFields, final as ClassificationData);

    const finalClassification = { ...base, ...enriched };
    const stillNeedsQuestion = enriched.missing_fields.length > 0;
    let nextQuestion: any = undefined;
    if (stillNeedsQuestion) {
      const nextField = enriched.missing_fields[0];
      const pythonQ = finalClassification.suggested_question;
      nextQuestion = getQuestionForField(nextField, finalClassification, pythonQ);
    }
    return {
      classification: finalClassification,
      needsQuestion: stillNeedsQuestion || undefined,
      question: nextQuestion,
      missingFields: stillNeedsQuestion ? enriched.missing_fields : undefined,
    };
  }

  private parseLocation(value: string): { city: string; state: string } {
    const ufSet = new Set(['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']);
    const raw = value.trim();
    const upper = raw.toUpperCase();
    if (/^[A-Z]{2}$/.test(upper) && ufSet.has(upper)) {
      return { city: '', state: upper };
    }

    const cityUfMatch = raw.match(/^(.+?)\s*[-/,]\s*([A-Za-z]{2})$/);
    if (cityUfMatch) {
      const parsedState = cityUfMatch[2].toUpperCase();
      if (ufSet.has(parsedState)) {
        return { city: cityUfMatch[1].trim(), state: parsedState };
      }
    }

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
    const key = raw.toLowerCase();
    return { city: raw, state: cityStateMap[key] || '' };
  }

  private parsePriceInput(value: string): { min_price?: number; max_price?: number } {
    // Formato JSON de sugestões do frontend: {"value":{"min":X,"max":Y}} ou {"label":"...","value":{...}}
    try {
      const parsed = JSON.parse(value);
      const v = parsed?.value ?? parsed;
      if (v && typeof v === 'object' && ('min' in v || 'max' in v)) {
        return {
          min_price: typeof v.min === 'number' ? v.min : undefined,
          max_price: typeof v.max === 'number' ? v.max : undefined,
        };
      }
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

    this.logger.log(`[SEARCH] query="${this.sanitizeLog(query)}" user=${this.sanitizeLog(user?.id ?? 'anonymous')} ip=${this.sanitizeLog(clientIp)}`);

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
      sortBy: sortBy || 'BEST_MATCH',
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      providedClassification: classification // ✅ Passar para service
    };

    // Usuário autenticado com créditos deve seguir fluxo pago (sem freeMode)
    if (user?.id && Number(user.credits || 0) > 0) {
      return this.searchService.searchByText(
        query,
        { ...searchFilters, useRealScraping: useRealScraping === 'true', limit: limit || 50 },
        user.id,
      );
    }

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
    if (user.plan === 'free') {
      throw new ForbiddenException({
        error: 'FEATURE_NOT_AVAILABLE',
        message: 'Busca por imagem disponível apenas para planos pagos.',
        action: 'upgrade_plan',
      });
    }

    if (!body.imageData && !body.imageUrl) {
      throw new BadRequestException({
        error: 'MISSING_IMAGE',
        message: 'Forneça uma imagem (imageUrl ou imageData)',
      });
    }

    // Se recebeu base64, fazer upload para Cloudinary para obter URL pública
    let imageUrl: string;
    if (body.imageData) {
      imageUrl = await this.cloudinaryService.uploadBase64(body.imageData);
    } else {
      imageUrl = body.imageUrl!;
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
    @Body() body: { productName: string; sortBy?: string; classification?: any },
    @CurrentUser() user: any,
  ) {
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

    return this.searchService.searchProductPrices(body.productName, user.id, body.sortBy, body.classification);
  }

  @Get('suggestions')
  async getSuggestions(@Query('q') query: string) {
    return this.searchService.getSuggestions(query);
  }
}

