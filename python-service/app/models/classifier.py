"""
Classificador de Produtos - Baseado em Keywords
Abordagem pragmática sem ML pesado
"""
import re
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)

class ProductClassifier:
    """
    Classificador inteligente baseado em keywords e padrões
    Decide qual categoria e quais scrapers usar
    """
    
    def __init__(self):
        # Dicionário de categorias e keywords (EXPANDIDO)
        self.categories = {
            "car": {
                "keywords": [
                    "carro", "carros", "veiculo", "veículo", "automovel", "automóvel",
                    "toyota", "honda", "fiat", "chevrolet", "ford", "volkswagen", "vw",
                    "hyundai", "nissan", "renault", "peugeot", "citroen", "jeep",
                    "sedan", "suv", "hatch", "pickup", "caminhonete",
                    "corolla", "civic", "onix", "gol", "polo", "hb20", "creta",
                    "compass", "renegade", "kicks", "tracker", "t-cross"
                ],
                "scrapers": ["webmotors", "mobiauto"],
                "priority": 10
            },
            "motorcycle": {
                "keywords": [
                    "moto", "motos", "motocicleta", "motocicletas", "scooter",
                    "honda", "yamaha", "suzuki", "kawasaki", "harley",
                    "cg", "fazer", "cb", "xre", "bros", "titan", "fan",
                    "biz", "pcx", "nmax", "mt", "r1", "ninja", "z"
                ],
                "scrapers": ["webmotors", "mobiauto"],
                "priority": 9
            },
            "smartphone": {
                "keywords": [
                    "iphone", "samsung", "xiaomi", "motorola", "lg", "asus",
                    "smartphone", "celular", "telefone", "galaxy", "redmi",
                    "poco", "realme", "oneplus", "pixel", "moto g", "moto e",
                    "note", "pro max", "ultra", "fold", "flip"
                ],
                "scrapers": ["google_shopping", "olx"],
                "priority": 8
            },
            "electronics": {
                "keywords": [
                    "notebook", "laptop", "computador", "pc", "desktop",
                    "tablet", "ipad", "monitor", "tv", "televisão", "televisao",
                    "playstation", "xbox", "nintendo", "switch", "ps5", "ps4",
                    "camera", "câmera", "fone", "headphone", "airpods",
                    "macbook", "dell", "lenovo", "acer", "asus", "gamer",
                    "rtx", "gtx", "ryzen", "intel", "i5", "i7", "i9"
                ],
                "scrapers": ["google_shopping", "olx"],
                "priority": 7
            },
            "furniture": {
                "keywords": [
                    "sofa", "sofá", "mesa", "cadeira", "cama", "guarda-roupa",
                    "armario", "armário", "estante", "rack", "criado-mudo",
                    "movel", "móvel", "moveis", "móveis", "colchao", "colchão"
                ],
                "scrapers": ["olx", "google_shopping"],
                "priority": 6
            },
            "appliance": {
                "keywords": [
                    "geladeira", "fogao", "fogão", "microondas", "lavadora",
                    "secadora", "freezer", "ar-condicionado", "ventilador",
                    "liquidificador", "batedeira", "aspirador", "ferro de passar"
                ],
                "scrapers": ["google_shopping", "olx"],
                "priority": 6
            },
            "fashion": {
                "keywords": [
                    "tenis", "tênis", "sapato", "bota", "sandalia", "sandália",
                    "camisa", "camiseta", "calça", "calca", "jaqueta", "casaco",
                    "vestido", "saia", "short", "bermuda", "nike", "adidas",
                    "puma", "reebok", "vans", "converse", "air max", "jordan",
                    "yeezy", "ultraboost", "roupa", "roupas"
                ],
                "scrapers": ["google_shopping", "olx"],
                "priority": 5
            },
            "marketplace_used": {
                "keywords": [
                    "usado", "usada", "usados", "usadas", "seminovo", "seminova",
                    "segunda mao", "segunda mão", "usado em bom estado"
                ],
                "scrapers": ["olx"],
                "priority": 8
            },
            "general": {
                "keywords": [],  # Fallback
                "scrapers": ["google_shopping"],
                "priority": 1
            }
        }
        
        # Marcas de carros (para aumentar confiança)
        self.car_brands = {
            "toyota", "honda", "fiat", "chevrolet", "ford", "volkswagen", "vw",
            "hyundai", "nissan", "renault", "peugeot", "citroen", "jeep",
            "bmw", "mercedes", "audi", "volvo", "mitsubishi", "kia"
        }
        
        # Marcas de motos
        self.moto_brands = {
            "honda", "yamaha", "suzuki", "kawasaki", "harley", "ducati",
            "triumph", "bmw", "ktm", "cg", "fazer", "cb", "xre"
        }
    
    def normalize_query(self, query: str) -> str:
        """Normaliza a query removendo acentos e convertendo para lowercase (MELHORADO)"""
        import unicodedata
        
        query = query.lower().strip()
        
        # Remover acentos usando unicodedata (mais robusto)
        query = unicodedata.normalize("NFKD", query)
        query = "".join(c for c in query if not unicodedata.combining(c))
        
        return query
    
    def keyword_match(self, keyword: str, text: str) -> bool:
        """Match de keyword com word boundary (evita falsos positivos)"""
        return bool(re.search(rf'\b{re.escape(keyword)}\b', text))
    
    def detect_brand(self, query: str) -> str | None:
        """Detecta marca do produto"""
        normalized = self.normalize_query(query)
        
        # Verificar marcas de carros
        for brand in self.car_brands:
            if self.keyword_match(brand, normalized):
                return brand
        
        # Verificar marcas de motos
        for brand in self.moto_brands:
            if self.keyword_match(brand, normalized):
                return brand
        
        return None
    
    def detect_model(self, query: str) -> str | None:
        """Detecta modelo do produto (smartphones principalmente)"""
        normalized = self.normalize_query(query)
        
        # Padrões de modelos de iPhone
        iphone_pattern = r'iphone\s*(\d+|x|xs|xr|se|pro|max|plus|mini)'
        match = re.search(iphone_pattern, normalized)
        if match:
            return match.group(0)
        
        # Padrões de modelos Samsung Galaxy
        galaxy_pattern = r'galaxy\s*(s\d+|a\d+|note\d+|z\s*flip|z\s*fold)'
        match = re.search(galaxy_pattern, normalized)
        if match:
            return match.group(0)
        
        # Padrões de modelos Xiaomi
        xiaomi_pattern = r'(redmi|poco|mi)\s*(note\s*)?\d+'
        match = re.search(xiaomi_pattern, normalized)
        if match:
            return match.group(0)
        
        return None
    
    def normalize_query_for_scraper(self, query: str, category: str) -> str:
        """Normaliza query para enviar ao scraper (remove palavras desnecessárias)"""
        normalized = self.normalize_query(query)
        
        # Remover palavras de condição
        condition_words = ['usado', 'usada', 'novo', 'nova', 'seminovo', 'seminova', 'lacrado']
        for word in condition_words:
            normalized = re.sub(rf'\b{word}\b', '', normalized)
        
        # Remover palavras de localização
        normalized = re.sub(r'\bem\s+\w+', '', normalized)
        
        # Remover espaços extras
        normalized = ' '.join(normalized.split())
        
        return normalized.strip()
    
    def detect_condition(self, query: str) -> str:
        """Detecta se o produto é novo ou usado"""
        normalized = self.normalize_query(query)
        
        # Padrões de usado (EXPANDIDO)
        used_patterns = [
            r'\busado\b', r'\busada\b', r'\busados\b', r'\busadas\b',
            r'\bseminovo\b', r'\bseminova\b', r'\bsemi-novo\b', r'\bsemi novo\b',
            r'\bsegunda mao\b', r'\bsegunda-mao\b', r'\b2a mao\b',
            r'\buso\b', r'\bde uso\b', r'\bja usado\b', r'\bjá usado\b'
        ]
        
        # Padrões de novo (EXPANDIDO)
        new_patterns = [
            r'\bnovo\b', r'\bnova\b', r'\bnovos\b', r'\bnovas\b',
            r'\blacrado\b', r'\blacrada\b', r'\b0km\b', r'\bzero km\b',
            r'\bna caixa\b', r'\bnunca usado\b', r'\bsem uso\b',
            r'\bnovo na caixa\b', r'\bnovo lacrado\b'
        ]
        
        for pattern in used_patterns:
            if re.search(pattern, normalized):
                return "used"
        
        for pattern in new_patterns:
            if re.search(pattern, normalized):
                return "new"
        
        return "unknown"
    
    def detect_location(self, query: str) -> bool:
        """Detecta se a query contém informação de localização (MELHORADO - evita falsos positivos)"""
        normalized = self.normalize_query(query)
        
        # Estados brasileiros (siglas e nomes) - lista explícita
        estados = [
            'sp', 'rj', 'mg', 'rs', 'pr', 'sc', 'ba', 'pe', 'ce', 'pa', 'go', 'df',
            'es', 'ma', 'pb', 'rn', 'al', 'se', 'pi', 'mt', 'ms', 'ac', 'ro', 'rr', 'ap', 'am', 'to',
            'sao paulo', 'rio de janeiro', 'minas gerais', 'rio grande do sul',
            'parana', 'santa catarina', 'bahia', 'pernambuco', 'ceara'
        ]
        
        # Cidades principais
        cidades = [
            'sao paulo', 'rio de janeiro', 'belo horizonte', 'brasilia',
            'curitiba', 'porto alegre', 'salvador', 'recife', 'fortaleza',
            'manaus', 'campinas', 'guarulhos', 'santo andre', 'sao bernardo',
            'goiania', 'belem', 'natal', 'joao pessoa', 'maceio'
        ]
        
        # Verificar padrão "em [localização]"
        for estado in estados:
            if re.search(rf'\bem\s+{re.escape(estado)}\b', normalized):
                return True
        
        for cidade in cidades:
            if re.search(rf'\bem\s+{re.escape(cidade)}\b', normalized):
                return True
        
        # Verificar estados/cidades sozinhos (com word boundary)
        for estado in estados:
            if self.keyword_match(estado, normalized):
                return True
        
        for cidade in cidades:
            if self.keyword_match(cidade, normalized):
                return True
        
        return False
    
    def is_question_about_usage(self, query: str) -> bool:
        """Detecta se o usuário está perguntando como usar o sistema"""
        normalized = self.normalize_query(query)
        
        # Padrões que indicam pergunta sobre o SISTEMA (não sobre produto)
        system_question_patterns = [
            r'\bcomo\b.*\b(buscar|procurar|encontrar|achar)\b.*\b(produto|item|coisa)\b',
            r'\bcomo\b.*\bfunciona\b',
            r'\bcomo\b.*\busar\b.*\b(sistema|site|app|zavlo)\b',
            r'\bcomo\b.*\bfazer\b.*\b(busca|pesquisa)\b',
            r'\bque\b.*\bfazer\b.*\b(buscar|procurar)\b',
            r'\bo que\b.*\bdigitar\b',
            r'\bposso\b.*\bbuscar\b.*\b(por|um)\b',
            r'\bajuda\b',
            r'\bhelp\b',
            r'\bensinar\b',
            r'\bexplicar\b.*\b(como|funciona)\b',
            r'\bnao sei\b.*\b(o que|como)\b',
            r'\bestou perdido\b',
            r'\be agora\b',
            r'^o que.*fazer',
            r'\bconfuso\b',
            r'\bduvida\b'
        ]
        
        for pattern in system_question_patterns:
            if re.search(pattern, normalized):
                return True
        return False
    
    def has_result_limit(self, query: str) -> bool:
        """Detecta se o usuário especificou quantidade de resultados"""
        normalized = self.normalize_query(query)
        
        # Padrões que indicam quantidade
        limit_patterns = [
            r'\b10\s*(resultados|produtos|itens)?\b',
            r'\b20\s*(resultados|produtos|itens)?\b',
            r'\bdez\s*(resultados|produtos|itens)?\b',
            r'\bvinte\s*(resultados|produtos|itens)?\b',
        ]
        
        for pattern in limit_patterns:
            if re.search(pattern, normalized):
                return True
        return False
    
    def extract_result_limit(self, query: str) -> int | None:
        """Extrai quantidade de resultados da query"""
        normalized = self.normalize_query(query)
        
        # Verificar números explícitos
        if re.search(r'\b10\b', normalized) or re.search(r'\bdez\b', normalized):
            return 10
        if re.search(r'\b20\b', normalized) or re.search(r'\bvinte\b', normalized):
            return 20
        
        return None
    
    def is_greeting(self, query: str) -> bool:
        """Detecta saudações"""
        normalized = self.normalize_query(query)
        
        greetings = [
            r'^ola\b', r'^oi\b', r'^hey\b', r'^e ai\b',
            r'^bom dia\b', r'^boa tarde\b', r'^boa noite\b',
            r'^hello\b', r'^hi\b'
        ]
        
        for pattern in greetings:
            if re.search(pattern, normalized):
                return True
        return False
    
    def extract_partial_intent(self, query: str) -> Dict[str, any]:
        """Extrai intenção parcial quando usuário está perdido"""
        normalized = self.normalize_query(query)
        
        # Detectar se mencionou alguma categoria vagamente
        vague_intents = {
            'vehicle': ['carro', 'moto', 'veiculo', 'automovel'],
            'electronics': ['celular', 'notebook', 'computador', 'eletronico'],
            'general': ['produto', 'coisa', 'item', 'algo']
        }
        
        for intent_type, keywords in vague_intents.items():
            for keyword in keywords:
                if self.keyword_match(keyword, normalized):
                    return {
                        'has_partial_intent': True,
                        'intent_type': intent_type,
                        'keyword': keyword
                    }
        
        return {'has_partial_intent': False}
    
    def extract_product_from_question(self, query: str) -> str:
        """Extrai o produto de perguntas como 'como buscar iphone?'"""
        normalized = self.normalize_query(query)
        
        # Remover palavras de pergunta
        question_words = [
            'como', 'buscar', 'procurar', 'encontrar', 'achar',
            'funciona', 'usar', 'fazer', 'que', 'qual', 'onde',
            'posso', 'consigo', 'quero', 'preciso', 'gostaria'
        ]
        
        words = normalized.split()
        product_words = [w for w in words if w not in question_words and len(w) > 2]
        
        return ' '.join(product_words).strip()
    
    def generate_guided_question(self, query: str) -> str | None:
        """Gera pergunta guiada baseada no contexto"""
        normalized = self.normalize_query(query)
        partial_intent = self.extract_partial_intent(query)
        
        # Se usuário mencionou categoria vaga, perguntar especificamente
        if partial_intent['has_partial_intent']:
            intent_type = partial_intent['intent_type']
            
            if intent_type == 'vehicle':
                return "Entendi que você quer um veículo! 🚗\n\nÉ um **carro** ou uma **moto**? E qual marca/modelo você prefere?"
            elif intent_type == 'electronics':
                return "Certo, eletrônicos! 📱\n\nVocê procura:\n• Smartphone\n• Notebook\n• Tablet\n• Outro?"
            elif intent_type == 'general':
                return "Vou te ajudar! 😊\n\nQue tipo de produto você procura?\n\n💡 Exemplos:\n• iPhone 13\n• Honda Civic\n• Notebook Dell"
        
        return None
    
    def classify(self, query: str) -> Dict:
        """
        Classifica a query e retorna categoria + scrapers recomendados + campos faltantes
        
        Returns:
            {
                "category": str,
                "confidence": float,
                "recommended_scrapers": List[str],
                "condition": str,
                "all_scores": Dict[str, float],
                "missing_fields": List[str],
                "suggested_question": str | None,
                "is_question": bool,
                "is_greeting": bool,
                "extracted_product": str | None
            }
        """
        normalized = self.normalize_query(query)
        
        # 🆕 DETECTAR PERGUNTAS E SAUDAÇÕES
        is_question = self.is_question_about_usage(query)
        is_greeting = self.is_greeting(query)
        extracted_product = None
        
        if is_question:
            logger.info("Pergunta sobre o sistema detectada!")
            
            # Tentar gerar pergunta guiada
            guided_question = self.generate_guided_question(query)
            
            # Perguntas sobre o sistema não devem buscar produtos
            return {
                "category": "general",
                "confidence": 1.0,
                "recommended_scrapers": [],
                "condition": "unknown",
                "all_scores": {},
                "missing_fields": [],
                "suggested_question": guided_question,
                "is_question": True,
                "is_greeting": False,
                "extracted_product": None,
                "detected_brand": None,
                "detected_model": None,
                "normalized_query": "",
                "guided_response": guided_question
            }
        
        if is_greeting:
            logger.info("Saudação detectada!")
            return {
                "category": "general",
                "confidence": 1.0,
                "recommended_scrapers": [],
                "condition": "unknown",
                "all_scores": {},
                "missing_fields": [],
                "suggested_question": None,
                "is_question": False,
                "is_greeting": True,
                "extracted_product": None
            }
        
        condition = self.detect_condition(query)
        
        logger.info(f"Classificando query: '{query}' (normalizada: '{normalized}')")
        
        # Calcular scores para cada categoria
        scores = {}
        
        for category, data in self.categories.items():
            if category == "general":
                continue  # Pular fallback
            
            score = 0.0
            matches = []
            
            # Contar keywords encontradas (COM WORD BOUNDARY)
            for keyword in data["keywords"]:
                if self.keyword_match(keyword, normalized):
                    score += 1.0
                    matches.append(keyword)
            
            # Boost para categorias específicas
            if category == "car":
                # Boost para marcas de carro
                if any(self.keyword_match(brand, normalized) for brand in self.car_brands):
                    score += 2.0
                    matches.append("car_brand_detected")
                
                # Boost extra para modelos específicos de carro
                car_models = ['civic', 'corolla', 'onix', 'hb20', 'polo', 'gol', 'compass', 'renegade']
                if any(self.keyword_match(model, normalized) for model in car_models):
                    score += 3.0  # Boost alto para evitar confusão com motos
                    matches.append("car_model_detected")
            
            if category == "motorcycle":
                # Boost para marcas de moto
                if any(self.keyword_match(brand, normalized) for brand in self.moto_brands):
                    score += 2.0
                    matches.append("moto_brand_detected")
            
            # Boost para condição "usado" → marketplace (mas não sobrepor categorias específicas)
            if condition == "used" and category == "marketplace_used":
                score += 1.5  # Reduzido de 3.0 para 1.5
                matches.append("used_condition")
            
            # Normalizar score pela prioridade
            if score > 0:
                score = score * data["priority"]
                scores[category] = score
                logger.debug(f"  {category}: score={score:.2f}, matches={matches}")
        
        # Se nenhuma categoria teve score, usar fallback
        if not scores:
            logger.info("  Nenhuma categoria específica detectada, usando 'general'")
            return {
                "category": "general",
                "confidence": 0.5,
                "recommended_scrapers": ["google_shopping"],
                "condition": condition,
                "all_scores": {"general": 0.5},
                "missing_fields": [],
                "suggested_question": None,
                "is_question": is_question,
                "is_greeting": is_greeting,
                "extracted_product": extracted_product,
                "detected_brand": None,
                "detected_model": None,
                "normalized_query": self.normalize_query_for_scraper(query, "general")
            }
        
        # Pegar categoria com maior score
        best_category = max(scores, key=scores.get)
        max_score = scores[best_category]
        
        # Calcular confiança (0-1)
        total_score = sum(scores.values())
        confidence = min(max_score / total_score, 1.0) if total_score > 0 else 0.5
        
        # Normalizar scores para retorno
        normalized_scores = {k: v / total_score for k, v in scores.items()} if total_score > 0 else scores
        
        # Pegar scrapers recomendados
        scrapers = self.categories[best_category]["scrapers"]
        
        # Se condição é "usado", priorizar OLX
        if condition == "used" and "olx" in scrapers:
            scrapers = ["olx"] + [s for s in scrapers if s != "olx"]
        
        # 🆕 DETECTAR CAMPOS FALTANTES (ORDEM DE PRIORIDADE)
        missing_fields = []
        suggested_question = None
        
        # 1. QUANTIDADE DE RESULTADOS (SEMPRE PERGUNTAR PRIMEIRO)
        if not self.has_result_limit(query):
            missing_fields.append("result_limit")
            suggested_question = "Quantos resultados você quer ver?\n\n📊 **10 resultados** - Busca rápida\n🎯 **20 resultados** - Busca completa"
        
        # 2. Verificar condição (novo/usado) - APENAS SE JÁ TEM LIMITE
        elif condition == "unknown":
            missing_fields.append("condition")
            suggested_question = "Você prefere **novo ou usado**?"
        
        # 3. Verificar localização (apenas para carros/motos) - APENAS SE JÁ TEM LIMITE E CONDIÇÃO
        elif best_category in ["car", "motorcycle"]:
            has_location = self.detect_location(query)
            if not has_location:
                missing_fields.append("location")
                suggested_question = "Em qual **cidade ou estado** você está procurando?"
        
        # 🆕 DETECTAR MARCA E MODELO
        detected_brand = self.detect_brand(query)
        detected_model = self.detect_model(query)
        normalized_for_scraper = self.normalize_query_for_scraper(query, best_category)
        result_limit = self.extract_result_limit(query)
        
        result = {
            "category": best_category,
            "confidence": round(confidence, 2),
            "recommended_scrapers": scrapers,
            "condition": condition,
            "all_scores": {k: round(v, 2) for k, v in normalized_scores.items()},
            "missing_fields": missing_fields,
            "suggested_question": suggested_question,
            "is_question": is_question,
            "is_greeting": is_greeting,
            "extracted_product": extracted_product,
            "detected_brand": detected_brand,
            "detected_model": detected_model,
            "normalized_query": normalized_for_scraper,
            "result_limit": result_limit
        }
        
        logger.info(f"  Resultado: {result}")
        
        return result
    
    def get_scraper_priority(self, category: str, condition: str) -> List[str]:
        """
        Retorna lista de scrapers ordenados por prioridade
        baseado na categoria e condição
        """
        if category not in self.categories:
            return ["google_shopping"]
        
        scrapers = self.categories[category]["scrapers"].copy()
        
        # Reordenar baseado na condição
        if condition == "used" and "olx" in scrapers:
            scrapers.remove("olx")
            scrapers.insert(0, "olx")
        elif condition == "new" and "google_shopping" in scrapers:
            scrapers.remove("google_shopping")
            scrapers.insert(0, "google_shopping")
        
        return scrapers
