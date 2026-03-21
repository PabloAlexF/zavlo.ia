import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from '@config/firebase.service';
import { ClassificationResult, ClassificationRequest } from './classification.interface';

@Injectable()
export class ClassificationService {
  private readonly logger = new Logger(ClassificationService.name);
  private readonly pythonServiceUrl: string;

  constructor(
    private configService: ConfigService,
    private firebaseService: FirebaseService,
  ) {
    this.pythonServiceUrl = this.configService.get<string>(
      'PYTHON_SERVICE_URL',
      'http://localhost:8001'
    );
    this.logger.log(`🐍 Python Service URL: ${this.pythonServiceUrl}`);
  }

  /**
   * Classifica a query do usuário usando o serviço Python
   */
  async classifyQuery(query: string, context?: Record<string, any>, userId?: string): Promise<ClassificationResult> {
    try {
      this.logger.log(`📥 Classificando query: "${query}"`);

      // 🆕 BUSCAR LOCALIZAÇÃO E PREFERÊNCIAS DO USUÁRIO SE DISPONÍVEL
      let userLocation: { city?: string; state?: string } | undefined;
      let userPreferences: Record<string, any> = {};
      if (userId) {
        try {
          const firestore = this.firebaseService.getFirestore();
          const userDoc = await firestore.collection('users').doc(userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            if (userData?.location) {
              userLocation = { city: userData.location.city, state: userData.location.state };
              this.logger.log(`📍 Localização do usuário: ${userLocation.city}, ${userLocation.state}`);
            }
            if (userData?.preferences) {
              userPreferences = userData.preferences;
              this.logger.log(`🧠 Preferências do usuário carregadas: ${JSON.stringify(userPreferences)}`);
            }
          }
        } catch (locationError) {
          this.logger.warn(`⚠️ Erro ao buscar dados do usuário: ${locationError.message}`);
        }
      }

      const request: ClassificationRequest = {
        query,
        context: {
          ...context,
          location: userLocation,
          last_filters: userPreferences.last_filters ?? {},
          last_category: userPreferences.last_category ?? null,
        },
      };

      const response = await fetch(`${this.pythonServiceUrl}/api/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(15000), // 15s timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`❌ Erro na classificação: ${response.status} - ${errorText.substring(0, 200)}`);
        // Para 502/503 (serviço hibernando), usar fallback em vez de lançar erro
        if (response.status === 502 || response.status === 503 || response.status === 504) {
          this.logger.warn(`⚠️ Python service indisponível (${response.status}), usando fallback`);
          return {
            category: 'general',
            confidence: 0.5,
            scrapers: [{ name: 'google_shopping', score: 0.6 }],
            condition: 'unknown',
            all_scores: { general: 0.5 },
            missing_fields: [],
            suggested_question: null,
          };
        }
        throw new HttpException(
          `Erro no serviço de classificação: ${errorText}`,
          response.status
        );
      }

      const result: ClassificationResult = await response.json();

      this.logger.log(
        `✅ Classificação concluída: categoria="${result.category}", confiança=${result.confidence}, scrapers=${result.scrapers?.map(s => s.name).join(', ')}`
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
        scrapers: [{ name: 'google_shopping', score: 0.6 }],
        condition: 'unknown',
        all_scores: { general: 0.5 },
        missing_fields: [],
        suggested_question: null,
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
      webmotors: 'webmotors-scraper',
      mercadolivre: 'karamelo~mercadolivre-scraper-brasil-portugues',
      olx: 'olx-scraper',
    };

    return scrapers
      .map(scraper => actorMap[scraper])
      .filter(Boolean);
  }

  /**
   * Determina prioridade de execução dos scrapers
   */
  getScraperPriority(category: string, condition: string): string[] {
    // Carros e motos → Webmotors + MercadoLivre
    if (category === 'car' || category === 'motorcycle') {
      return ['webmotors', 'mercadolivre'];
    }

    // Produtos usados → OLX primeiro
    if (condition === 'used' || category === 'marketplace_used') {
      return ['olx', 'google_shopping'];
    }

    // Produtos novos → Google Shopping primeiro
    return ['google_shopping', 'olx'];
  }
}
