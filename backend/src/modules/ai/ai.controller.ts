import { Controller, Post, Body } from '@nestjs/common';
import { ImageAIService } from './services/image-ai.service';
import { TextAIService } from './services/text-ai.service';

@Controller('ai')
export class AIController {
  constructor(
    private imageAIService: ImageAIService,
    private textAIService: TextAIService,
  ) {}

  @Post('classify-image')
  async classifyImage(@Body() body: { imageUrl: string }) {
    return this.imageAIService.classifyImage(body.imageUrl);
  }

  @Post('classify-text')
  async classifyText(@Body() body: { text: string }) {
    return this.textAIService.classifyText(body.text);
  }

  @Post('detect-fraud')
  async detectFraud(@Body() body: { title: string; description: string; price: number }) {
    const isFraud = await this.textAIService.detectFraud(
      body.title,
      body.description,
      body.price,
    );
    return { isFraud, confidence: isFraud ? 0.75 : 0.25 };
  }

  @Post('generate-embedding')
  async generateEmbedding(@Body() body: { text?: string; imageUrl?: string }) {
    if (body.imageUrl) {
      return this.imageAIService.generateEmbedding(body.imageUrl);
    }
    if (body.text) {
      return this.textAIService.generateTextEmbedding(body.text);
    }
    return { error: 'Forneça text ou imageUrl' };
  }
}
