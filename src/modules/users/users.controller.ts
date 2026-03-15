import { Controller, Post, Body, UseGuards, Param, Get, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { PlanExpirationService } from './plan-expiration.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly planExpirationService: PlanExpirationService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    const userId = req.user.userId;
    return this.usersService.findById(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  async updateProfile(@Req() req: any, @Body() data: { name?: string; phone?: string; location?: { cep?: string; city?: string; state?: string } }) {
    const userId = req.user.userId;
    return this.usersService.updateProfile(userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('plan-status')
  async getPlanStatus(@Req() req: any) {
    const userId = req.user.userId;
    return this.planExpirationService.checkUserPlanStatus(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':userId/credits')
  async addCredits(
    @Param('userId') userId: string,
    @Body('credits') credits: number,
  ) {
    return this.usersService.addCredits(userId, credits);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':userId/credits/set')
  async setCredits(
    @Param('userId') userId: string,
    @Body('credits') credits: number,
  ) {
    return this.usersService.setCredits(userId, credits);
  }

  @UseGuards(JwtAuthGuard)
  @Get('usage')
  async getCurrentUsage(@Req() req: any) {
    const userId = req.user.userId;
    return this.usersService.getCurrentUsage(userId);
  }
}
