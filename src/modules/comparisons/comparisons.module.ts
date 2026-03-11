import { Module } from '@nestjs/common';
import { ComparisonsController } from './comparisons.controller';
import { ComparisonsService } from './comparisons.service';
import { FirebaseService } from '@config/firebase.service';
import { RedisService } from '@config/redis.service';

@Module({
  controllers: [ComparisonsController],
  providers: [ComparisonsService, FirebaseService, RedisService],
  exports: [ComparisonsService],
})
export class ComparisonsModule {}
