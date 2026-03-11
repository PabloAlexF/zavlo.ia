import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { TestPixController } from './test-pix.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { SearchModule } from './modules/search/search.module';
import { LocationsModule } from './modules/locations/locations.module';
import { ScrapingModule } from './modules/scraping/scraping.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AIModule } from './modules/ai/ai.module';
import { ComparisonsModule } from './modules/comparisons/comparisons.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { ListingsModule } from './modules/listings/listings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PriceAlertsModule } from './modules/price-alerts/price-alerts.module';
import { ConfigModule } from './config/config.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    ScheduleModule.forRoot(),
    ConfigModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    SearchModule,
    LocationsModule,
    ScrapingModule,
    NotificationsModule,
    AIModule,
    ComparisonsModule,
    AnalyticsModule,
    FavoritesModule,
    ListingsModule,
    PaymentsModule,
    PriceAlertsModule,
  ],
  controllers: [AppController, TestPixController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
