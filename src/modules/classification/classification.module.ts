import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClassificationService } from './classification.service';
import { ClassificationController } from './classification.controller';

@Module({
  imports: [ConfigModule],
  controllers: [ClassificationController],
  providers: [ClassificationService],
  exports: [ClassificationService],
})
export class ClassificationModule {}
