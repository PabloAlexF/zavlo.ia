import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScrapingController } from './scraping.controller';
import { GoogleShoppingService } from './google-shopping.service';
import { GoogleLensService } from './google-lens.service';

@Module({
  imports: [ConfigModule],
  controllers: [ScrapingController],
  providers: [GoogleShoppingService, GoogleLensService],
  exports: [GoogleShoppingService, GoogleLensService],
})
export class ScrapingModule {}
