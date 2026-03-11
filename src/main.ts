import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import * as bodyParser from 'body-parser';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Servir arquivos estáticos do frontend (se existirem)
  const publicPath = join(__dirname, '..', 'public');
  app.useStaticAssets(publicPath, {
    prefix: '/',
    index: false, // Não servir index.html automaticamente
  });

  // Aumentar limite do body parser para aceitar imagens base64
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // Configurar filtro global de exceções
  app.useGlobalFilters(new AllExceptionsFilter());

  // Configurar CORS - aceitar múltiplas origens para desenvolvimento e produção
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://zavloia.com.br',
    'https://www.zavloia.com.br',
    'https://zavlo-ia.vercel.app',
    'https://zavlo-ia-*.vercel.app', // Preview deployments
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requisições sem origin (mobile apps, Postman, etc)
      if (!origin) return callback(null, true);
      
      // Verificar se a origin está na lista ou é um preview do Vercel
      if (allowedOrigins.some(allowed => 
        origin === allowed || 
        (allowed.includes('*') && origin.includes('vercel.app'))
      )) {
        callback(null, true);
      } else {
        console.warn(`❌ CORS blocked origin: ${origin}`);
        callback(null, true); // Temporariamente permitir todas até debug
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 86400,
  });

  // Configurar prefixo global da API (excluir raiz para health checks do load balancer)
  app.setGlobalPrefix(configService.get('API_PREFIX') || 'api/v1', {
    exclude: ['/', 'health'],
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
  console.log(`🌐 Frontend servido em: http://localhost:${port}`);
}

bootstrap();

