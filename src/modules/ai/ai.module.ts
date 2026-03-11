import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { ImageAIService } from './services/image-ai.service';
import { TextAIService } from './services/text-ai.service';

@Module({
  controllers: [AIController],
  providers: [ImageAIService, TextAIService],
  exports: [ImageAIService, TextAIService],
})
export class AIModule {}
