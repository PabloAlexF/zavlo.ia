import { Module, forwardRef } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { FirebaseService } from '@config/firebase.service';
import { RedisService } from '@config/redis.service';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [forwardRef(() => SearchModule)],
  controllers: [ProductsController],
  providers: [ProductsService, FirebaseService, RedisService],
  exports: [ProductsService],
})
export class ProductsModule {}
