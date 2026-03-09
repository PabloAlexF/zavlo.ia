import { Controller, Get } from '@nestjs/common';
import { FirebaseService } from './config/firebase.service';
// import { RedisService } from './config/redis.service'; // Desabilitado

@Controller()
export class AppController {
  constructor(
    private firebaseService: FirebaseService,
    // private redisService: RedisService, // Desabilitado
  ) {}

  @Get('health')
  async health() {
    const checks = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        firebase: 'unknown',
      },
    };

    // Check Firebase
    try {
      const firestore = this.firebaseService.getFirestore();
      await firestore.collection('_health_check').limit(1).get();
      checks.services.firebase = 'ok';
    } catch (error) {
      checks.services.firebase = 'error';
      checks.status = 'degraded';
    }

    return checks;
  }

  @Get()
  root() {
    return {
      name: 'Zavlo.ia API',
      version: '1.0.0',
      description: 'Sistema Localizador de Produtos com IA',
      documentation: '/api/v1',
      health: '/health',
    };
  }
}
