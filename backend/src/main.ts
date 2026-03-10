import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Aumentar limite do body parser para aceitar imagens base64
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // Configurar filtro global de exceções
  app.useGlobalFilters(new AllExceptionsFilter());

  // Configurar CORS - aceitar múltiplas origens para desenvolvimento e produção
  const corsOrigin = configService.get('CORS_ORIGIN') || '*';
  const allowedOrigins = corsOrigin === '*' 
    ? true 
    : corsOrigin.split(',').map(o => o.trim());
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  });

  // Configurar prefixo global da API (excluir raiz para health checks do load balancer)
  app.setGlobalPrefix(configService.get('API_PREFIX') || 'api/v1', {
    exclude: ['/'],
  });

  // Configurar validação global - allow extra fields
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Allow extra fields like 'limit'
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = configService.get('PORT') || 3001;
  await app.listen(port);

  console.log(`🚀 Zavlo.ia Backend rodando na porta ${port}`);
  console.log(`📍 API disponível em: http://localhost:${port}/${configService.get('API_PREFIX')}`);
}

bootstrap();

