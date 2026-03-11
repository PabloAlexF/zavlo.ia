import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PriceAlertsService } from './price-alerts.service';
import { PriceAlertsController } from './price-alerts.controller';
import { FirebaseService } from '@config/firebase.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { ScrapingModule } from '../scraping/scraping.module';

@Module({
  imports: [ScheduleModule.forRoot(), NotificationsModule, ScrapingModule],
  controllers: [PriceAlertsController],
  providers: [PriceAlertsService, FirebaseService],
  exports: [PriceAlertsService],
})
export class PriceAlertsModule {}
