import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PixSimpleService } from './pix-simple.service';
import { FirebaseService } from '../../config/firebase.service';
import { ConfigModule } from '../../config/config.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ConfigModule, UsersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PixSimpleService, FirebaseService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
