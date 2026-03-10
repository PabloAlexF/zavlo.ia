import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface ImageClassificationResult {
  category: string;
  confidence: number;
  keywords: string[];
  suggestedPrice?: number;
}

@Injectable()
export class ImageAIService {
  private readonly huggingFaceToken: string;

  constructor(private configService: ConfigService) {
    this.huggingFaceToken = this.configService.get('HUGGINGFACE_API_TOKEN');
  }

  async classifyImage(imageUrl: string): Promise<ImageClassificationResult> {
    try {
      // Usar Hugging Face Inference API para classificação
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/google/vit-base-patch16-224',
        { inputs: imageUrl },
        {
          headers: {
            Authorization: `Bearer ${this.huggingFaceToken}`,
          },
        }
      );

      const predictions = response.data;
      const topPrediction = predictions[0];

      return {
        category: this.mapToCategory(topPrediction.label),
        confidence: topPrediction.score,
        keywords: this.extractKeywords(topPrediction.label),
        suggestedPrice: null,
      };
    } catch (error) {
      console.error('Erro na classificação de imagem:', error);
      return {
        category: 'outros',
        confidence: 0,
        keywords: [],
      };
    }
  }

  async generateEmbedding(imageUrl: string): Promise<number[]> {
    try {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32',
        { inputs: imageUrl },
        {
          headers: {
            Authorization: `Bearer ${this.huggingFaceToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao gerar embedding:', error);
      return [];
    }
  }

  private mapToCategory(label: string): string {
    const categoryMap = {
      'mobile phone': 'eletronicos',
      'laptop': 'eletronicos',
      'television': 'eletronicos',
      'refrigerator': 'eletronicos',
      'car': 'veiculos',
      'motorcycle': 'veiculos',
      'furniture': 'moveis',
      'chair': 'moveis',
      'table': 'moveis',
      'clothing': 'moda',
      'shoe': 'moda',
    };

    const lowerLabel = label.toLowerCase();
    for (const [key, value] of Object.entries(categoryMap)) {
      if (lowerLabel.includes(key)) {
        return value;
      }
    }

    return 'outros';
  }

  private extractKeywords(label: string): string[] {
    return label.toLowerCase().split(/[\s,]+/).filter(k => k.length > 2);
  }
}
