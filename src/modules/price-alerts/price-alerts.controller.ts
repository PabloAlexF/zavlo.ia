import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PriceAlertsService } from './price-alerts.service';

@Controller('price-alerts')
@UseGuards(JwtAuthGuard)
export class PriceAlertsController {
  constructor(private readonly priceAlertsService: PriceAlertsService) {}

  @Post()
  async createAlert(@Request() req, @Body() body: any): Promise<any> {
    return this.priceAlertsService.createAlert(req.user.userId, body);
  }

  @Get()
  async getUserAlerts(@Request() req): Promise<any> {
    return this.priceAlertsService.getUserAlerts(req.user.userId);
  }

  @Get('stats')
  async getStats(@Request() req) {
    return this.priceAlertsService.getAlertStats(req.user.userId);
  }

  @Delete(':id')
  async deleteAlert(@Request() req, @Param('id') id: string) {
    await this.priceAlertsService.deleteAlert(id, req.user.userId);
    return { message: 'Alert deleted successfully' };
  }
}
