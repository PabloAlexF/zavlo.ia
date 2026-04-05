import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  private resolveUserId(user: any): string | undefined {
    return user?.userId || user?.id;
  }

  @Get('metrics')
  async getMetrics(
    @CurrentUser() user: any,
    @Query('days') days?: string,
  ) {
    const daysNum = days ? parseInt(days) : 7;
    return this.analyticsService.getSearchMetrics(daysNum, this.resolveUserId(user));
  }

  @Get('history')
  async getUserHistory(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
  ): Promise<any> {
    const limitNum = limit ? parseInt(limit) : 20;
    return this.analyticsService.getUserSearchHistory(this.resolveUserId(user), limitNum);
  }
}