import { Controller, Post, Get, Body, Logger } from '@nestjs/common';
import { ClassificationService } from './classification.service';
import { ClassificationRequest } from './classification.interface';

@Controller('classification')
export class ClassificationController {
  private readonly logger = new Logger(ClassificationController.name);

  constructor(private classificationService: ClassificationService) {}

  /**
   * Endpoint para classificar query
   * POST /classification/classify
   */
  @Post('classify')
  async classify(@Body() request: ClassificationRequest) {
    this.logger.log(`📥 Request de classificação: "${request.query}"`);
    
    const result = await this.classificationService.classifyQuery(
      request.query,
      request.context
    );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Health check do serviço Python
   * GET /classification/health
   */
  @Get('health')
  async health() {
    const isHealthy = await this.classificationService.healthCheck();

    return {
      python_service: isHealthy ? 'online' : 'offline',
      status: isHealthy ? 'healthy' : 'degraded',
    };
  }

  /**
   * Lista categorias disponíveis
   * GET /classification/categories
   */
  @Get('categories')
  async categories() {
    const categories = await this.classificationService.getCategories();

    return {
      success: true,
      data: categories,
    };
  }

  /**
   * Endpoint de teste para múltiplas queries
   * POST /classification/test
   */
  @Post('test')
  async test(@Body() body: { queries: string[] }) {
    const results = [];

    for (const query of body.queries) {
      try {
        const result = await this.classificationService.classifyQuery(query);
        results.push({
          query,
          result,
        });
      } catch (error) {
        results.push({
          query,
          error: error.message,
        });
      }
    }

    return {
      success: true,
      total: body.queries.length,
      results,
    };
  }
}
