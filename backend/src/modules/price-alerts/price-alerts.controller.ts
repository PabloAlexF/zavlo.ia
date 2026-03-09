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

@Controller('api/v1/price-alerts')
@UseGuards(JwtAuthGuard)
export class PriceAlertsController {
  constructor(private readonly priceAlertsService: PriceAlertsService) {}

  @Post()
  async createAlert(@Request() req, @Body() body: any) {
    return this.priceAlertsService.createAlert(req.user.uid, body);
  }

  @Get()
  async getUserAlerts(@Request() req) {
    return this.priceAlertsService.getUserAlerts(req.user.uid);
  }

  @Get('stats')
  async getStats(@Request() req) {
    return this.priceAlertsService.getAlertStats(req.user.uid);
  }

  @Delete(':id')
  async deleteAlert(@Request() req, @Param('id') id: string) {
    await this.priceAlertsService.deleteAlert(id, req.user.uid);
    return { message: 'Alert deleted successfully' };
  }
}
