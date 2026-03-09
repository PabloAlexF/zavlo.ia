import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsageResetService } from './usage-reset.service';
import { PlanExpirationService } from './plan-expiration.service';
import { FirebaseService } from '@config/firebase.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsageResetService, PlanExpirationService, FirebaseService],
  exports: [UsersService],
})
export class UsersModule {}
