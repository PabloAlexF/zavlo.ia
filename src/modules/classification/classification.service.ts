import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClassificationResult, ClassificationRequest } from './classification.interface';

@Injectable()
export class ClassificationService {
  private readonly logger = new Logger(ClassificationService.name);
  private readonly pythonServiceUrl: string;

  constructor(private configService: ConfigService) {
    this.pythonServiceUrl = this.configService.get<string>(
      'PYTHON_SERVICE_URL',
      'http://localhost:8001'
    );
    this.logger.log(`🐍 Python Service URL: ${this.pythonServiceUrl}`);
  }

  /**
   * Classifica a query do usuário usando o serviço Python
   */
  async classifyQuery(query: string, context?: Record<string, any>): Promise<ClassificationResult> {
    try {
      this.logger.log(`📥 Classificando query: "${query}"`);

      const request: ClassificationRequest = {
        query,
        context,
      };

      const response = await fetch(`${this.pythonServiceUrl}/api/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`❌ Erro na classificação: ${response.status} - ${errorText}`);
        throw new HttpException(
          `Erro no serviço de classificação: ${errorText}`,
          response.status
        );
      }

      const result: ClassificationResult = await response.json();

      this.logger.log(
        `✅ Classificação concluída: categoria="${result.category}", confiança=${result.confidence}, scrapers=${result.recommended_scrapers.join(', ')}`
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(`❌ Erro ao conectar com serviço Python: ${error.message}`);
      
      // Fallback: retornar classificação padrão
      this.logger.warn('⚠️ Usando classificação fallback (Google Shopping)');
      return {
        category: 'general',
        confidence: 0.5,
        recommended_scrapers: ['google_shopping'],
        condition: 'unknown',
        all_scores: { general: 0.5 },
      };
    }
  }

  /**
   * Verifica se o serviço Python está online
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.pythonServiceUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 segundos timeout
      });

      const isHealthy = response.ok;
      
      if (isHealthy) {
        this.logger.log('✅ Serviço Python está online');
      } else {
        this.logger.warn('⚠️ Serviço Python retornou status não-OK');
      }

      return isHealthy;
    } catch (error) {
      this.logger.error(`❌ Serviço Python está offline: ${error.message}`);
      return false;
    }
  }

  /**
   * Retorna lista de categorias disponíveis
   */
  async getCategories(): Promise<any> {
    try {
      const response = await fetch(`${this.pythonServiceUrl}/api/categories`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`❌ Erro ao buscar categorias: ${error.message}`);
      return null;
    }
  }

  /**
   * Mapeia scrapers recomendados para IDs de actors Apify
   */
  getApifyActorIds(scrapers: string[]): string[] {
    const actorMap: Record<string, string> = {
      google_shopping: 'burbn~google-shopping-scraper',
      webmotors: 'webmotors-scraper', // TODO: Adicionar actor ID real
      mobiauto: 'mobiauto-scraper',   // TODO: Adicionar actor ID real
      olx: 'olx-scraper',             // TODO: Adicionar actor ID real
    };

    return scrapers
      .map(scraper => actorMap[scraper])
      .filter(Boolean);
  }

  /**
   * Determina prioridade de execução dos scrapers
   */
  getScraperPriority(category: string, condition: string): string[] {
    // Carros e motos → Webmotors + Mobiauto
    if (category === 'car' || category === 'motorcycle') {
      return ['webmotors', 'mobiauto'];
    }

    // Produtos usados → OLX primeiro
    if (condition === 'used' || category === 'marketplace_used') {
      return ['olx', 'google_shopping'];
    }

    // Produtos novos → Google Shopping primeiro
    return ['google_shopping', 'olx'];
  }
}
