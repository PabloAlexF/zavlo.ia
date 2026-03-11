import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { FirebaseService } from './firebase.service';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [NestConfigModule],
  providers: [FirebaseService, RedisService],
  exports: [FirebaseService, RedisService, NestConfigModule],
})
export class ConfigModule {}
