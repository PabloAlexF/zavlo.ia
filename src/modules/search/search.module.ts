import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { IpLimitService } from './ip-limit.service';
import { IpLimitAdminController } from './ip-limit-admin.controller';
import { FirebaseService } from '@config/firebase.service';
import { RedisService } from '@config/redis.service';
import { ScrapingModule } from '../scraping/scraping.module';
import { UsersModule } from '../users/users.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [ScrapingModule, UsersModule, AnalyticsModule],
  controllers: [SearchController, IpLimitAdminController],
  providers: [
    SearchService,
    IpLimitService,
    FirebaseService,
    RedisService,
  ],
  exports: [SearchService, IpLimitService],
})
export class SearchModule {}
