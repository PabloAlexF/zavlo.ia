import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScrapingController } from './scraping.controller';
import { GoogleShoppingService } from './google-shopping.service';
import { GoogleLensService } from './google-lens.service';
import { OlxService } from './olx.service';
import { WebmotorsService } from './webmotors.service';
import { MercadoLivreService } from './mercadolivre.service';

@Module({
  imports: [ConfigModule],
  controllers: [ScrapingController],
  providers: [
    GoogleShoppingService,
    GoogleLensService,
    OlxService,
    WebmotorsService,
    MercadoLivreService,
  ],
  exports: [
    GoogleShoppingService,
    GoogleLensService,
    OlxService,
    WebmotorsService,
    MercadoLivreService,
  ],
})
export class ScrapingModule {}
