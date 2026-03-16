import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScrapingController } from './scraping.controller';
import { GoogleShoppingService } from './google-shopping.service';
import { GoogleLensService } from './google-lens.service';
import { OlxService } from './olx.service';
import { MobiautoService } from './mobiauto.service';
import { WebmotorsService } from './webmotors.service';

@Module({
  imports: [ConfigModule],
  controllers: [ScrapingController],
  providers: [
    GoogleShoppingService, 
    GoogleLensService, 
    OlxService, 
    MobiautoService, 
    WebmotorsService
  ],
  exports: [
    GoogleShoppingService, 
    GoogleLensService, 
    OlxService, 
    MobiautoService, 
    WebmotorsService
  ],
})
export class ScrapingModule {}
