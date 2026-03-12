// Categorias com detecção robusta
export const PRODUCT_CATEGORIES = {
    smartphone: {
        name: 'Smartphone',
        keywords: ['iphone', 'samsung', 'xiaomi', 'motorola', 'celular', 'smartphone', 'telefone', 'galaxy', 'redmi', 'cel', 'cell', 'android', 'ios'],
        patterns: [
            /\biphone\s?\d+/i,
            /\bgalaxy\s?(s\d+|note|a\d+|j\d+)/i,
            /\bredmi\s?(note|\d+)/i,
            /\bmoto\s?g\d+/i,
            /\bcelular\b/i,
            /\bsmartphone\b/i
        ],
        questions: [
            {
                id: 'storage',
                question: 'Qual capacidade de armazenamento?',
                type: 'choice',
                options: ['64GB', '128GB', '256GB', '512GB', '1TB', 'Tanto faz'],
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
        keywords: ['geladeira', 'fogao', 'microondas', 'secadora', 'freezer', 'brastemp', 'consul', 'electrolux'],
        patterns: [/\bgeladeira\b/i, /\bfog[aã]o\b/i, /\bmicroondas\b/i, /\blava[-\s]?(roupa|louça)/i],
        questions: [
            {
                id: 'brand_preference',
                question: 'Tem preferência de marca?',
                type: 'choice',
                options: ['Brastemp', 'Consul', 'Electrolux', 'LG', 'Samsung', 'Nenhuma dessas marcas'],
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
    movel: {
        name: 'Móvel',
        keywords: ['sofa', 'mesa', 'cadeira', 'cama', 'guarda', 'armario', 'estante', 'poltrona', 'banco', 'escrivaninha', 'rack', 'comoda', 'painel', 'criado', 'closet'],
        patterns: [/\bcadeira\s*(gamer|escritorio|office)/i, /\bmesa\s*(gamer|escritorio|jantar)/i, /\bsof[aá]\b/i, /\bcama\s*(box|solteiro|casal)/i, /\brack\s*(tv)?/i, /\bpainel\s*(tv)?/i],
        questions: [
            {
                id: 'type',
                question: 'Que tipo específico?',
                type: 'choice',
                options: ['Cadeira gamer', 'Cadeira escritório', 'Mesa gamer', 'Mesa escritório', 'Sofá', 'Cama', 'Outro'],
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
    veiculo: {
        name: 'Veículo',
        keywords: ['carro', 'motocicleta', 'bicicleta', 'bike', 'automovel', 'veiculo', 'moto'],
        patterns: [
            /\b(carro|automovel|veiculo)\b/i,
            /\b(moto|motocicleta)\b/i,
            /\bbicicleta\b/i,
            /\b(honda|toyota|ford|vw|chevrolet)\s+(civic|corolla|gol|onix|fit|city)/i,
            /\bcarro\s+(honda|toyota|ford|vw|chevrolet)/i,
            /\bmoto\s+(honda|yamaha|suzuki)/i
        ],
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
        keywords: ['televisao', 'monitor', 'fone', 'headset', 'mouse', 'teclado', 'camera', 'playstation', 'xbox', 'nintendo', 'airpods', 'ipad'],
        patterns: [
            /\b(tv|televisao)\s?\d{2}/i,
            /\bmonitor\s?\d{2}/i,
            /\bfone\s*(ouvido|bluetooth)?/i,
            /\b(playstation|xbox|nintendo)\b/i,
            /\b(airpods|ipad)\b/i,
            /\btv\b/i,
            /\bmonitor\b/i
        ],
        questions: [
            {
                id: 'type',
                question: 'Que tipo de eletrônico?',
                type: 'choice',
                options: ['TV/Monitor', 'Fone de ouvido', 'Periféricos', 'Console/Games', 'Outro'],
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
    calcado_roupa: {
        name: 'Calçado/Roupa',
        keywords: ['tenis', 'tênis', 'sapato', 'bota', 'sandalia', 'chinelo', 'camisa', 'camiseta', 'calça', 'jaqueta', 'blusa', 'vestido', 'saia', 'shorts', 'corrida', 'esporte', 'cloudrunner', 'waterproof', 'running', 'trail', 'casual', 'chuteira', 'sapatilha'],
        patterns: [
            /\bt[eê]nis\b/i,
            /\bt[eê]nis\s+(de\s+)?(corrida|esporte|caminhada|treino)/i,
            /\bsapato\b/i,
            /\bbota\b/i,
            /\bcamisa\b/i,
            /\bcamiseta\b/i,
            /\bcalça\b/i,
            /\b(cloudrunner|waterproof|running|trail)\b/i,
            /\bchuteira\b/i
        ],
        questions: [
            {
                id: 'condition',
                question: 'Produto novo ou usado?',
                type: 'choice',
                options: ['Novo', 'Usado', 'Tanto faz'],
                required: true
            },
            {
                id: 'sort_by',
                question: 'Como quer ordenar os resultados?',
                type: 'choice',
                options: ['Mais relevantes', 'Menor preço', 'Maior preço'],
                required: false
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
                required: true
            }
        ]
    }
};
import { normalizeAndTokenize, expandWithSynonyms } from './advancedNormalizer';
import { detectProductEntity } from './brandDetector';
// Modelos específicos de produtos (detecção prioritária)
const PRODUCT_MODEL_PATTERNS = {
    calcado_roupa: [
        /\bcloudrunner\s?\d*\b/i,
        /\bcloud\s?runner\s?\d*\b/i,
        /\bultraboost\s?\d*\b/i,
        /\bair\s?max\s?\d*\b/i,
        /\bpegasus\s?\d*\b/i,
        /\brevolution\s?\d*\b/i,
        /\breact\s?\d*\b/i
    ],
    smartphone: [
        /\biphone\s?(1[0-9]|[6-9])(\s?(pro|max|plus|mini))?\b/i,
        /\bgalaxy\s?s\d+(\s?(ultra|plus))?\b/i,
        /\bredmi\s?note\s?\d*\b/i
    ],
    notebook: [
        /\bmacbook(\s?(air|pro))?\b/i,
        /\bthinkpad\b/i,
        /\binspiron\b/i
    ]
};
// Marcas que não devem pontuar sozinhas
const BRAND_ONLY_KEYWORDS = new Set([
    'nike', 'adidas', 'puma', 'olympikus', 'samsung', 'lg', 'brastemp', 'consul'
]);
// Prioridade das categorias (maior = mais prioritário)
const CATEGORY_PRIORITY = {
    smartphone: 10,
    notebook: 9,
    veiculo: 8,
    calcado_roupa: 7,
    eletronico: 6,
    movel: 5,
    eletrodomestico: 4,
    generico: 1
};
// Detecta categoria com ranking (retorna top 3)
export function detectProductCategoryWithRanking(query) {
    // PRIORIDADE 0: Detecta categoria via entity (iPhone, PS5, MacBook)
    const entity = detectProductEntity(query);
    if (entity.category) {
        const categoryMap = {
            'smartphone': 'smartphone',
            'laptop': 'notebook',
            'tablet': 'eletronico',
            'console': 'eletronico'
        };
        const mappedCategory = categoryMap[entity.category];
        if (mappedCategory) {
            console.log('⭐ Entity category detected:', mappedCategory);
            return [{ category: mappedCategory, score: 100 }];
        }
    }
    // PRIORIDADE 1: Detecta modelos específicos primeiro
    for (const [category, patterns] of Object.entries(PRODUCT_MODEL_PATTERNS)) {
        for (const pattern of patterns) {
            if (pattern.test(query)) {
                console.log('⭐ Modelo específico detectado:', category, pattern);
                return [{ category, score: 50 }];
            }
        }
    }
    const { normalized, tokens } = normalizeAndTokenize(query);
    const expandedTokens = expandWithSynonyms(tokens);
    const DEBUG = process.env.NODE_ENV === 'development';
    if (DEBUG) {
        console.log('🔍 QUERY:', query);
        console.log('🔍 NORMALIZED:', normalized);
        console.log('🔍 TOKENS:', tokens);
        console.log('🔍 EXPANDED:', expandedTokens);
    }
    // Otimização: Set para O(1) lookup
    const tokenSet = new Set(expandedTokens);
    const scores = [];
    for (const [categoryId, category] of Object.entries(PRODUCT_CATEGORIES)) {
        if (categoryId === 'generico')
            continue;
        let score = 0;
        // Patterns regex (pontuação alta - aumentada para 10)
        for (const pattern of category.patterns) {
            if (pattern.test(normalized)) {
                score += 10;
                if (DEBUG)
                    console.log('✅ Pattern match:', categoryId, '+10 pontos');
                break;
            }
        }
        // Keywords com tokens - limitado
        let keywordMatches = 0;
        let hasBrandOnly = false;
        for (const keyword of category.keywords) {
            if (tokenSet.has(keyword)) {
                keywordMatches++;
                // Verifica se é apenas marca sem contexto
                if (BRAND_ONLY_KEYWORDS.has(keyword) && expandedTokens.length === 1) {
                    hasBrandOnly = true;
                }
            }
        }
        // Se é apenas marca, reduz pontuação
        if (hasBrandOnly && keywordMatches === 1) {
            score += 1;
            if (DEBUG)
                console.log('⚠️ Brand only:', categoryId, '+1 ponto');
        }
        else if (keywordMatches >= 2) {
            // Bonus para múltiplos matches
            score += keywordMatches * 4;
            if (DEBUG)
                console.log('✅ Keywords match:', categoryId, `+${keywordMatches * 4} pontos`);
        }
        else if (keywordMatches > 0) {
            score += keywordMatches * 3;
            if (DEBUG)
                console.log('✅ Keywords match:', categoryId, `+${keywordMatches * 3} pontos`);
        }
        // Bonus por prioridade
        const priorityBonus = CATEGORY_PRIORITY[categoryId] || 0;
        score += priorityBonus * 0.5;
        if (score > 0) {
            scores.push({ category: categoryId, score });
            if (DEBUG)
                console.log('🏆 CATEGORY:', categoryId, 'SCORE:', score);
        }
    }
    // Ordena por score e retorna top 3
    const ranking = scores.sort((a, b) => b.score - a.score).slice(0, 3);
    if (DEBUG) {
        console.log('🏆 Ranking final:', ranking);
    }
    return ranking;
}
// Detecta categoria do produto com confiança
export function detectProductCategory(query) {
    const ranking = detectProductCategoryWithRanking(query);
    if (ranking.length === 0)
        return 'generico';
    // Threshold mínimo de confiança
    if (ranking[0].score < 5) {
        console.log('⚠️ Score muito baixo, usando genérico');
        return 'generico';
    }
    // Se a diferença entre top 1 e top 2 for pequena, há incerteza
    if (ranking.length >= 2 && (ranking[0].score - ranking[1].score) < 2) {
        console.log('⚠️ Categoria incerta. Top 2:', ranking.slice(0, 2));
        // Por enquanto retorna a melhor, mas poderia perguntar ao usuário
    }
    return ranking[0].category;
}
// Verifica se a detecção de categoria é confiável
export function isCategoryConfident(query) {
    const ranking = detectProductCategoryWithRanking(query);
    if (ranking.length === 0)
        return false;
    if (ranking.length === 1)
        return true;
    // Confiante se diferença > 2 pontos
    return (ranking[0].score - ranking[1].score) >= 2;
}
export function formatCategoryQuestion(question) {
    return question.question;
}

// Retorna perguntas relevantes para uma categoria
export function getRelevantQuestions(category) {
    const categoryData = PRODUCT_CATEGORIES[category] || PRODUCT_CATEGORIES.generico;
    return categoryData.questions || [];
}
