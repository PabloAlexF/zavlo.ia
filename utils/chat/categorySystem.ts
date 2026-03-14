// Sistema de categorização inteligente de produtos - V2 (Acessórios Prioritários)
export interface ProductCategory {
  name: string;
  keywords: string[];
  patterns: RegExp[];
  questions: CategoryQuestion[];
}

export interface CategoryQuestion {
  id: string;
  question: string;
  type: 'choice' | 'text' | 'number';
  options?: string[];
  required: boolean;
  conditions?: string[]; 
}

// Categorias com detecção robusta e PRIORIDADE ACESSÓRIOS
export const PRODUCT_CATEGORIES: Record<string, ProductCategory> = {
  acessorio: {
    name: 'Acessório',
    keywords: [
      'capinha', 'capa', 'case', 'cover', 'carcaça', 'carcaca', 'proteção',
      'carregador', 'fonte', 'adaptador', 'powerbank', 'carrega',
      'pelicula', 'película', 'vidro', 'protetor', 'templado',
      'cabo', 'fio', 'usb', 'tipo c', 'lightning',
      'suporte', 'base', 'tripé', 'fixador',
      'fone', 'fones', 'earphone', 'earbuds', 'headphone', 'headset',
      'mouse', 'mousepad', 'teclado', 'keyboard', 'kb'
    ],
    patterns: [
      /\b(capinha|capa|case|cover)\b/i,
      /\b(carregador|fonte|adaptador|powerbank)\b/i,
      /\b(pel[ií]cula|vidro|protetor|templado)\b/i,
      /\b(cabo|fio|usb|tipo\s?c)\b/i,
      /\b(fone|headphone|headset)\b/i,
      /\b(mouse|teclado)\b/i
    ],
    questions: [
      {
        id: 'condition',
        question: 'Produto novo ou usado?',
        type: 'choice',
        options: ['Novo', 'Usado', 'Tanto faz'],
        required: false
      }
    ]
  },

  smartphone: {
    name: 'Smartphone',
    keywords: ['iphone', 'samsung', 'xiaomi', 'motorola', 'celular', 'smartphone', 'telefone', 'galaxy', 'redmi'],
    patterns: [
      /\biphone\s\d+/i, 
      /\bgalaxy\s(s\d+|note|a\d+)/i, 
      /\bredmi\snote/i, 
      /\bmoto\s?g/i
    ],
    questions: [
      {
        id: 'storage',
        question: 'Qual capacidade de armazenamento?',
        type: 'choice',
        options: ['64GB', '128GB', '256GB', '512GB', '1TB', 'Tanto faz'],
        required: false,
        conditions: ['smartphone']
      },
      {
        id: 'condition',
        question: 'Produto novo ou usado?',
        type: 'choice',
        options: ['Novo', 'Usado', 'Tanto faz'],
        required: true
      }
    ]
  },

  notebook: {
    name: 'Notebook',
    keywords: ['notebook', 'laptop', 'macbook'],
    patterns: [/\bnotebook\b/i, /\blaptop\b/i, /\bmacbook\b/i],
    questions: [
      {
        id: 'usage',
        question: 'Para que você vai usar?',
        type: 'choice',
        options: ['Trabalho/Estudos', 'Jogos', 'Design/Edição', 'Uso básico'],
        required: false
      },
      {
        id: 'condition',
        question: 'Produto novo ou usado?',
        type: 'choice',
        options: ['Novo', 'Usado', 'Tanto faz'],
        required: true
      }
    ]
  },

  eletrodomestico: {
    name: 'Eletrodoméstico',
    keywords: ['geladeira', 'fogao', 'microondas', 'secadora', 'freezer'],
    patterns: [/\bgeladeira\b/i, /\bfog[aã]o\b/i, /\bmicroondas\b/i],
    questions: [
      {
        id: 'condition',
        question: 'Produto novo ou usado?',
        type: 'choice',
        options: ['Novo', 'Usado', 'Tanto faz'],
        required: true
      }
    ]
  },

  movel: {
    name: 'Móvel',
    keywords: ['sofa', 'mesa', 'cadeira', 'cama', 'guarda roupa', 'armario'],
    patterns: [/\bsofa\b/i, /\bmesa\b/i, /\bcadeira\b/i],
    questions: [
      {
        id: 'condition',
        question: 'Produto novo ou usado?',
        type: 'choice',
        options: ['Novo', 'Usado', 'Tanto faz'],
        required: true
      }
    ]
  },

  veiculo: {
    name: 'Veículo',
    keywords: ['carro', 'moto', 'bicicleta'],
    patterns: [/\bcarro\b/i, /\bmoto\b/i],
    questions: [
      {
        id: 'condition',
        question: 'Produto novo ou usado?',
        type: 'choice',
        options: ['Novo', 'Usado', 'Tanto faz'],
        required: true
      }
    ]
  },

  eletronico: {
    name: 'Eletrônico',
    keywords: ['tv', 'monitor', 'playstation', 'xbox'],
    patterns: [/\btv\b/i, /\bmonitor\b/i],
    questions: [
      {
        id: 'condition',
        question: 'Produto novo ou usado?',
        type: 'choice',
        options: ['Novo', 'Usado', 'Tanto faz'],
        required: true
      }
    ]
  },

  calcado_roupa: {
    name: 'Calçado/Roupa',
    keywords: ['tenis', 'sapato', 'camisa'],
    patterns: [/\btenis\b/i, /\bsapato\b/i],
    questions: [
      {
        id: 'gender',
        question: 'Para quem?',
        type: 'choice',
        options: ['Masculino', 'Feminino', 'Unissex'],
        required: false
      },
      {
        id: 'condition',
        question: 'Produto novo ou usado?',
        type: 'choice',
        options: ['Novo', 'Usado', 'Tanto faz'],
        required: true
      }
    ]
  },

  generico: {
    name: 'Produto',
    keywords: [],
    patterns: [],
    questions: [
      {
        id: 'condition',
        question: 'Produto novo ou usado?',
        type: 'choice',
        options: ['Novo', 'Usado', 'Tanto faz'],
        required: false
      }
    ]
  }
};

// Função detectProductCategory (mantida compatibilidade)
export function detectProductCategory(query: string): string {
  // Detecta acessório PRIMEIRO (prioridade máxima)
  for (const keyword of PRODUCT_CATEGORIES.acessorio.keywords) {
    if (query.toLowerCase().includes(keyword)) {
      console.log('🎯 Categoria: acessorio (prioridade máxima)');
      return 'acessorio';
    }
  }
  
  // Depois categorias normais
  for (const [category, data] of Object.entries(PRODUCT_CATEGORIES)) {
    for (const keyword of data.keywords) {
      if (query.toLowerCase().includes(keyword)) {
        console.log('🎯 Categoria detectada:', category);
        return category;
      }
    }
  }
  
  return 'generico';
}

export function formatCategoryQuestion(question: CategoryQuestion): string {
  return question.question;
}

// Outras funções existentes mantidas...
export { isCategoryConfident, getRelevantQuestions } from './categorySystem-utils';

