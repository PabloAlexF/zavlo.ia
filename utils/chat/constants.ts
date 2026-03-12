// Stop words expandidas para melhor filtragem
export const STOP_WORDS = new Set([
  'entao', 'então', 'comprar', 'eu', 'de', 'para', 'com', 'por', 'o', 'a', 'os', 'as',
  'um', 'uma', 'uns', 'umas', 'do', 'da', 'dos', 'das', 'no', 'na', 'nos', 'nas',
  'ao', 'à', 'aos', 'às', 'pelo', 'pela', 'pelos', 'pelas', 'em', 'que', 'se',
  'te', 'me', 'lhe', 'nos', 'vos', 'lhes', 'meu', 'minha', 'meus', 'minhas',
  'teu', 'tua', 'teus', 'tuas', 'seu', 'sua', 'seus', 'suas', 'nosso', 'nossa',
  'nossos', 'nossas', 'vosso', 'vossa', 'vossos', 'vossas', 'este', 'esta',
  'estes', 'estas', 'esse', 'essa', 'esses', 'essas', 'aquele', 'aquela',
  'aqueles', 'aquelas', 'isto', 'isso', 'aquilo', 'quero', 'preciso', 'busco',
  'procuro', 'gostaria', 'estou', 'sou', 'tenho', 'vou', 'vai', 'pode', 'posso',
  'querendo', 'buscando', 'procurando', 'interessado', 'interessada'
]);

// Palavras que indicam perguntas (não são produtos)
export const QUESTION_WORDS = new Set([
  'como', 'quando', 'onde', 'porque', 'por que', 'qual', 'quais', 'quanto',
  'quantos', 'quantas', 'quem', 'o que', 'que', 'funciona', 'serve', 'é',
  'são', 'tem', 'existe', 'posso', 'pode', 'consegue', 'faz', 'fazem'
]);

// Palavras que claramente não são produtos
export const NON_PRODUCT_WORDS = new Set([
  'obrigado', 'obrigada', 'obg', 'vlw', 'valeu', 'tchau', 'bye', 'falou',
  'beleza', 'ok', 'certo', 'entendi', 'sim', 'não', 'nao', 'talvez',
  'oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'tudo bem',
  'como vai', 'e ai', 'eai', 'salve', 'fala', 'help', 'ajuda', 'socorro'
]);

// Palavras comuns que não são produtos
export const COMMON_NON_PRODUCTS = new Set([
  'mesa', 'cadeira', 'sofa', 'sofá', 'cama', 'armario', 'armário', 'guarda', 'roupa',
  'porta', 'janela', 'parede', 'teto', 'chao', 'chão'
]);

// Marcas conhecidas para fuzzy matching (normalizado)
export const BRAND_SET = new Set([
  // Eletrônicos
  'samsung', 'apple', 'xiaomi', 'motorola', 'lg', 'sony', 'huawei', 'nokia',
  'realme', 'oneplus', 'oppo', 'vivo', 'asus', 'acer', 'dell', 'hp', 'lenovo',
  'microsoft', 'intel', 'amd', 'nvidia', 'canon', 'nikon', 'panasonic',
  
  // Eletrodomésticos
  'brastemp', 'consul', 'electrolux', 'ge', 'bosch', 'fischer', 'midea',
  'philco', 'britania', 'mondial', 'cadence', 'oster', 'hamilton beach',
  'kitchenaid', 'arno', 'black decker', 'tramontina',
  
  // Moda/Calçados
  'nike', 'adidas', 'puma', 'vans', 'converse', 'fila', 'mizuno', 'asics',
  'new balance', 'reebok', 'under armour', 'lacoste', 'polo', 'tommy',
  'calvin klein', 'guess', 'zara', 'hm', 'c&a', 'renner', 'riachuelo',
  'on', 'on running', 'hoka', 'brooks', 'saucony', 'olympikus',
  
  // Automotivo
  'volkswagen', 'ford', 'chevrolet', 'fiat', 'toyota', 'honda', 'hyundai',
  'nissan', 'renault', 'peugeot', 'citroen', 'bmw', 'mercedes', 'audi',
  'jeep', 'mitsubishi', 'kia', 'suzuki', 'volvo', 'land rover',
  
  // Casa/Móveis
  'tok stok', 'casas bahias', 'magazine luiza', 'leroy merlin', 'telhanorte',
  'madeira madeira', 'mobly', 'westwing', 'etna', 'deca', 'docol', 'tigre'
]);

// Dicionário de modelos conhecidos (modelo → marca)
export const MODEL_DICTIONARY: Record<string, string> = {
  // Apple
  'iphone': 'apple',
  'ipad': 'apple',
  'macbook': 'apple',
  'airpods': 'apple',
  'apple watch': 'apple',
  
  // Samsung
  'galaxy': 'samsung',
  'galaxy s': 'samsung',
  'galaxy a': 'samsung',
  'galaxy note': 'samsung',
  'galaxy z': 'samsung',
  
  // Nike
  'air max': 'nike',
  'air force': 'nike',
  'air jordan': 'nike',
  'dunk': 'nike',
  'blazer': 'nike',
  
  // Adidas
  'ultraboost': 'adidas',
  'superstar': 'adidas',
  'stan smith': 'adidas',
  'yeezy': 'adidas',
  
  // Xiaomi
  'redmi': 'xiaomi',
  'poco': 'xiaomi',
  'mi': 'xiaomi',
  
  // Motorola
  'moto g': 'motorola',
  'moto e': 'motorola',
  'edge': 'motorola',
  
  // PlayStation
  'playstation': 'sony',
  'ps5': 'sony',
  'ps4': 'sony',
  'ps3': 'sony'
};

// Produtos genéricos que precisam de refinamento
export const GENERIC_PRODUCTS = {
  'celular': ['iPhone', 'Samsung Galaxy', 'Xiaomi Redmi', 'Motorola Moto', 'LG'],
  'smartphone': ['iPhone', 'Samsung Galaxy', 'Xiaomi Redmi', 'Motorola Moto', 'LG'],
  'telefone': ['iPhone', 'Samsung Galaxy', 'Xiaomi Redmi', 'Motorola Moto', 'LG'],
  'geladeira': ['Brastemp', 'Consul', 'Electrolux', 'LG', 'Samsung'],
  'fogao': ['Brastemp', 'Consul', 'Electrolux', 'Fischer', 'Dako'],
  'fogão': ['Brastemp', 'Consul', 'Electrolux', 'Fischer', 'Dako'],
  'tv': ['Samsung', 'LG', 'Sony', 'Philco', 'TCL'],
  'televisao': ['Samsung', 'LG', 'Sony', 'Philco', 'TCL'],
  'televisão': ['Samsung', 'LG', 'Sony', 'Philco', 'TCL'],
  'notebook': ['Dell', 'HP', 'Lenovo', 'Asus', 'Acer'],
  'laptop': ['Dell', 'HP', 'Lenovo', 'Asus', 'Acer'],
  'carro': ['Volkswagen', 'Ford', 'Chevrolet', 'Fiat', 'Toyota'],
  'veiculo': ['Volkswagen', 'Ford', 'Chevrolet', 'Fiat', 'Toyota'],
  'veículo': ['Volkswagen', 'Ford', 'Chevrolet', 'Fiat', 'Toyota'],
  'moto': ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'BMW'],
  'motocicleta': ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'BMW'],
  'tenis': ['Nike', 'Adidas', 'Puma', 'Vans', 'Converse'],
  'tênis': ['Nike', 'Adidas', 'Puma', 'Vans', 'Converse'],
  'sapato': ['Nike', 'Adidas', 'Puma', 'Vans', 'Converse'],
  'bicicleta': ['Caloi', 'Oggi', 'Sense', 'Specialized', 'Trek'],
  'bike': ['Caloi', 'Oggi', 'Sense', 'Specialized', 'Trek'],
  'relogio': ['Apple Watch', 'Samsung Galaxy Watch', 'Garmin', 'Fossil', 'Casio'],
  'relógio': ['Apple Watch', 'Samsung Galaxy Watch', 'Garmin', 'Fossil', 'Casio']
};

// Tokens com posição (para ranking futuro)
export interface TokenWithPosition {
  token: string;
  position: number;
  isNumeric: boolean;
  isAlpha: boolean;
}