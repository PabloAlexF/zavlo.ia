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

  // Configurar CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN') || '*',
    credentials: true,
  });

  // Configurar prefixo global da API
  app.setGlobalPrefix(configService.get('API_PREFIX') || 'api/v1');

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

