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

  private resolveUserId(user: any): string | undefined {
    return user?.userId || user?.id;
  }

  @Post()
  async createAlert(@Request() req, @Body() body: any): Promise<any> {
    return this.priceAlertsService.createAlert(this.resolveUserId(req.user), body);
  }

  @Get()
  async getUserAlerts(@Request() req): Promise<any> {
    return this.priceAlertsService.getUserAlerts(this.resolveUserId(req.user));
  }

  @Get('stats')
  async getStats(@Request() req) {
    return this.priceAlertsService.getAlertStats(this.resolveUserId(req.user));
  }

  @Delete(':id')
  async deleteAlert(@Request() req, @Param('id') id: string) {
    await this.priceAlertsService.deleteAlert(id, this.resolveUserId(req.user));
    return { message: 'Alert deleted successfully' };
  }
}
