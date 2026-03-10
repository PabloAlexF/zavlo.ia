import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface TextClassificationResult {
  category: string;
  confidence: number;
  keywords: string[];
  sentiment?: string;
}

@Injectable()
export class TextAIService {
  private readonly huggingFaceToken: string;

  constructor(private configService: ConfigService) {
    this.huggingFaceToken = this.configService.get('HUGGINGFACE_API_TOKEN');
  }

  async classifyText(text: string): Promise<TextClassificationResult> {
    try {
      const keywords = this.extractKeywords(text);
      const category = this.detectCategory(text, keywords);

      return {
        category,
        confidence: 0.85,
        keywords,
        sentiment: 'neutral',
      };
    } catch (error) {
      console.error('Erro na classificação de texto:', error);
      return {
        category: 'outros',
        confidence: 0,
        keywords: [],
      };
    }
  }

  async generateTextEmbedding(text: string): Promise<number[]> {
    try {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
        { inputs: text },
        {
          headers: {
            Authorization: `Bearer ${this.huggingFaceToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao gerar embedding de texto:', error);
      return [];
    }
  }

  async detectFraud(title: string, description: string, price: number): Promise<boolean> {
    // Detecção simples de fraude
    const suspiciousKeywords = [
      'urgente', 'imperdível', 'última chance', 'ganhe dinheiro',
      'trabalhe em casa', 'renda extra garantida'
    ];

    const text = `${title} ${description}`.toLowerCase();
    const hasSuspiciousWords = suspiciousKeywords.some(keyword => text.includes(keyword));

    // Preço muito baixo pode ser suspeito
    const isSuspiciousPrice = price < 10;

    return hasSuspiciousWords || isSuspiciousPrice;
  }

  private extractKeywords(text: string): string[] {
    const stopWords = ['de', 'da', 'do', 'em', 'para', 'com', 'por', 'o', 'a', 'os', 'as'];
    const words = text
      .toLowerCase()
      .replace(/[^\w\sáàâãéèêíïóôõöúçñ]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));

    // Retornar palavras únicas
    return [...new Set(words)].slice(0, 10);
  }

  private detectCategory(text: string, keywords: string[]): string {
    const categoryPatterns = {
      eletronicos: ['celular', 'iphone', 'samsung', 'tv', 'notebook', 'computador', 'tablet', 'fone', 'geladeira'],
      veiculos: ['carro', 'moto', 'caminhão', 'veículo', 'honda', 'ford', 'chevrolet', 'volkswagen'],
      imoveis: ['casa', 'apartamento', 'terreno', 'imóvel', 'aluguel', 'venda', 'quarto'],
      moveis: ['sofá', 'mesa', 'cadeira', 'armário', 'cama', 'guarda-roupa', 'estante'],
      moda: ['roupa', 'camisa', 'calça', 'vestido', 'sapato', 'tênis', 'bolsa'],
      esportes: ['bicicleta', 'bike', 'academia', 'futebol', 'tênis', 'corrida'],
      livros: ['livro', 'revista', 'apostila', 'curso'],
      agro: ['fazenda', 'sítio', 'chácara', 'trator', 'gado', 'plantação'],
    };

    const lowerText = text.toLowerCase();

    for (const [category, patterns] of Object.entries(categoryPatterns)) {
      if (patterns.some(pattern => lowerText.includes(pattern) || keywords.includes(pattern))) {
        return category;
      }
    }

    return 'outros';
  }
}
