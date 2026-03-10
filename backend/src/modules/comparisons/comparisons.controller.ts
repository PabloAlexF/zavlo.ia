import { Controller, Get, Query, Param } from '@nestjs/common';
import { ComparisonsService } from './comparisons.service';

@Controller('comparisons')
export class ComparisonsController {
  constructor(private comparisonsService: ComparisonsService) {}

  @Get('compare')
  async compareProduct(@Query('title') title: string): Promise<any> {
    return this.comparisonsService.compareProduct(title);
  }

  @Get('history/:productId')
  async getPriceHistory(@Param('productId') productId: string, @Query('days') days?: string) {
    return this.comparisonsService.getPriceHistory(productId, days ? parseInt(days) : 30);
  }

  @Get('best-deals')
  async getBestDeals(@Query('category') category?: string, @Query('limit') limit?: string) {
    return this.comparisonsService.getBestDeals(category, limit ? parseInt(limit) : 10);
  }
}
