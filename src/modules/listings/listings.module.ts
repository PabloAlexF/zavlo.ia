import { Module } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { FirebaseService } from '../../config/firebase.service';
import { ConfigModule } from '../../config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [ListingsService, FirebaseService],
  controllers: [ListingsController],
  exports: [ListingsService],
})
export class ListingsModule {}
