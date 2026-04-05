import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  private resolveUserId(user: any): string | undefined {
    return user?.userId || user?.id;
  }

  @Get()
  async getUserNotifications(@Request() req) {
    return this.notificationsService.getUserNotifications(this.resolveUserId(req.user));
  }

  @Post(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }
}
