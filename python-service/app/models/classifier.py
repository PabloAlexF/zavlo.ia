"""
Classificador de Produtos - Baseado em Keywords
Abordagem pragmática sem ML pesado
"""
import re
from typing import Dict, List, Tuple
import logging
from .config_loader import ConfigLoader

logger = logging.getLogger(__name__)

class ProductClassifier:
    """
    Classificador inteligente baseado em keywords e padrões
    Decide qual categoria e quais scrapers usar
    """
    
    def __init__(self, config_path: str = None, learner = None):
        # Carregar configurações do JSON
        self.config_loader = ConfigLoader(config_path)
        
        # Sistema de sinônimos para melhorar precisão
        self.synonyms = self.config_loader.get_synonyms()
        
        # Dicionário de categorias e keywords
        self.categories = self.config_loader.get_categories()
        
        # Marcas de carros e motos
        brands = self.config_loader.get_brands()
        self.car_brands = set(brands.get("car", []))
        self.moto_brands = set(brands.get("motorcycle", []))
        
        # 🎓 APRENDIZADO: Referência ao learner (opcional)
        self.learner = learner
        
        # 🚀 OTIMIZAÇÃO: Listas de localização (evita recriar a cada chamada)
        self.estados = [
            'sp', 'rj', 'mg', 'rs', 'pr', 'sc', 'ba', 'pe', 'ce', 'pa', 'go', 'df',
            'es', 'ma', 'pb', 'rn', 'al', 'se', 'pi', 'mt', 'ms', 'ac', 'ro', 'rr', 'ap', 'am', 'to',
            'sao paulo', 'rio de janeiro', 'minas gerais', 'rio grande do sul',
            'parana', 'santa catarina', 'bahia', 'pernambuco', 'ceara'
        ]
        
        self.cidades = [
            'sao paulo', 'rio de janeiro', 'belo horizonte', 'brasilia',
            'curitiba', 'porto alegre', 'salvador', 'recife', 'fortaleza',
            'manaus', 'campinas', 'guarulhos', 'santo andre', 'sao bernardo',
            'goiania', 'belem', 'natal', 'joao pessoa', 'maceio'
        ]
        
        # Cache de regex compiladas (performance)
        self._compile_regex_patterns()
    
    def _compile_regex_patterns(self):
        """Pré-compila regex patterns para melhor performance"""
        # Padrões de condição
        self.used_patterns_compiled = [
            re.compile(r'\busado\b'), re.compile(r'\busada\b'), 
            re.compile(r'\busados\b'), re.compile(r'\busadas\b'),
            re.compile(r'\bseminovo\b'), re.compile(r'\bseminova\b'), 
            re.compile(r'\bsemi-novo\b'), re.compile(r'\bsemi novo\b'),
            re.compile(r'\bsegunda mao\b'), re.compile(r'\bsegunda-mao\b'), 
            re.compile(r'\b2a mao\b'),
            re.compile(r'\buso\b'), re.compile(r'\bde uso\b'), 
            re.compile(r'\bja usado\b'), re.compile(r'\bjá usado\b')
        ]
        
        self.new_patterns_compiled = [
            re.compile(r'\bnovo\b'), re.compile(r'\bnova\b'), 
            re.compile(r'\bnovos\b'), re.compile(r'\bnovas\b'),
            re.compile(r'\blacrado\b'), re.compile(r'\blacrada\b'), 
            re.compile(r'\b0km\b'), re.compile(r'\bzero km\b'),
            re.compile(r'\bna caixa\b'), re.compile(r'\bnunca usado\b'), 
            re.compile(r'\bsem uso\b'),
            re.compile(r'\bnovo na caixa\b'), re.compile(r'\bnovo lacrado\b')
        ]
        
        # Padrão de limite de resultados
        self.limit_pattern_compiled = re.compile(r'(?<!\d)(\d+)(?!\d)\s*(resultados|produtos|itens)')
        
        # Padrão de ano para veículos
        self.year_pattern_compiled = re.compile(r'\b(19[89]\d|20[0-2]\d)\b')
        
        # Padrões de saudação
        self.greeting_patterns_compiled = [
            re.compile(r'^ola\b'), re.compile(r'^oi\b'), 
            re.compile(r'^hey\b'), re.compile(r'^e ai\b'),
            re.compile(r'^bom dia\b'), re.compile(r'^boa tarde\b'), 
            re.compile(r'^boa noite\b'),
            re.compile(r'^hello\b'), re.compile(r'^hi\b')
        ]
        
        # Padrões de perguntas sobre sistema
        self.system_question_patterns_compiled = [
            re.compile(r'\bcomo\b.*\b(buscar|procurar|encontrar|achar)\b.*\b(produto|item|coisa)\b'),
            re.compile(r'\bcomo\b.*\b(buscar|procurar)\b'),  # "como buscar produtos?"
            re.compile(r'\bcomo\b.*\bfunciona\b'),
            re.compile(r'\bcomo\b.*\busar\b'),  # "como usar?"
            re.compile(r'\bcomo\b.*\busar\b.*\b(sistema|site|app|zavlo)\b'),
            re.compile(r'\bcomo\b.*\bfazer\b.*\b(busca|pesquisa)\b'),
            re.compile(r'\bque\b.*\bfazer\b.*\b(buscar|procurar)\b'),
            re.compile(r'\bo que\b.*\bdigitar\b'),
            re.compile(r'\bposso\b.*\bbuscar\b.*\b(por|um)\b'),
            re.compile(r'\bajuda\b'),
            re.compile(r'\bhelp\b'),
            re.compile(r'\bensinar\b'),
            re.compile(r'\bexplicar\b.*\b(como|funciona)\b'),
            re.compile(r'\bnao sei\b.*\b(o que|como)\b'),
            re.compile(r'\bestou perdido\b'),
            re.compile(r'\be agora\b'),
            re.compile(r'^o que.*fazer'),
            re.compile(r'\bconfuso\b'),
            re.compile(r'\bduvida\b')
        ]
        
        # Padrões de perguntas sobre créditos
        self.credits_question_patterns_compiled = [
            re.compile(r'\b(quantos?|quanto)\b.*\bcreditos?\b'),
            re.compile(r'\bcreditos?\b.*\b(tenho|restantes?|sobrando|disponiveis?)\b'),
            re.compile(r'\bmeus?\b.*\bcreditos?\b'),
            re.compile(r'\bsaldo\b.*\b(de\s+)?creditos?\b'),
            re.compile(r'\bsaldo\b'),  # "qual meu saldo?"
            re.compile(r'\bver\b.*\bcreditos?\b'),
            re.compile(r'\bconsultar\b.*\bcreditos?\b'),
            re.compile(r'\bcreditos?\b.*\b(restam|faltam)\b')
        ]
        
        # Padrões de perguntas sobre recarga/compra de créditos
        self.recharge_question_patterns_compiled = [
            re.compile(r'\b(como|onde)\b.*\b(comprar|compro|adquirir|adquiro)\b.*\bcreditos?\b'),
            re.compile(r'\b(como|onde)\b.*\b(fazer|faco|realizar)\b.*\b(recarga|recarregar)\b'),
            re.compile(r'\brecarga\b.*\b(de\s+)?creditos?\b'),
            re.compile(r'\brecarregar\b'),  # "como recarregar?"
            re.compile(r'\bcomprar\b.*\b(mais\s+)?creditos?\b'),
            re.compile(r'\badquirir\b.*\bcreditos?\b'),
            re.compile(r'\bcreditos?\b.*\b(avulsos?|extras?|adicionais?)\b'),
            re.compile(r'\bpreciso\b.*\b(de\s+)?(mais\s+)?creditos?\b'),
            re.compile(r'\bquero\b.*\b(mais\s+)?creditos?\b')
        ]
        
        # Padrões de perguntas sobre planos/assinatura
        self.plans_question_patterns_compiled = [
            re.compile(r'\b(quais?|que)\b.*\bplanos?\b'),
            re.compile(r'\bplanos?\b.*\b(disponiveis?|existem|tem|ha)\b'),
            re.compile(r'\b(como|onde)\b.*\b(assinar|assino|contratar|contrato)\b.*\bplano\b'),
            re.compile(r'\b(como|onde)\b.*\bassinar\b'),  # "como assinar?"
            re.compile(r'\bassinatura\b'),
            re.compile(r'\bassinar\b.*\b(plano|servico)\b'),
            re.compile(r'\bcontratar\b.*\bplano\b'),
            re.compile(r'\bplano\b.*\b(mensal|anual|pago)\b'),
            re.compile(r'\b(preco|valor|custo)\b.*\b(do\s+)?plano\b'),
            re.compile(r'\bplano\b.*\b(preco|valor|custo)\b'),
            re.compile(r'\bquanto\b.*\b(custa|vale|sai)\b.*\bplano\b'),
            re.compile(r'\bplano\b.*\b(basico|pro|business|premium)\b'),
            re.compile(r'\bupgrade\b.*\bplano\b'),
            re.compile(r'\bmudar\b.*\bplano\b')
        ]
    
    def normalize_query(self, query: str) -> str:
        """Normaliza a query removendo acentos e convertendo para lowercase (MELHORADO)"""
        import unicodedata
        
        query = query.lower().strip()
        
        # Remover acentos usando unicodedata (mais robusto)
        query = unicodedata.normalize("NFKD", query)
        query = "".join(c for c in query if not unicodedata.combining(c))
        
        # Aplicar sinônimos
        words = query.split()
        normalized_words = [self.synonyms.get(word, word) for word in words]
        query = " ".join(normalized_words)
        
        return query
    
    def keyword_match(self, keyword: str, text: str) -> bool:
        """Match de keyword com word boundary (otimizado - sem regex)"""
        # 🚀 OTIMIZAÇÃO: Usa string matching ao invés de regex (mais rápido)
        # Como tudo já está normalizado, podemos usar espaços como boundary
        return f" {keyword} " in f" {text} "
    
    def detect_brand(self, normalized: str) -> str | None:
        """Detecta marca do produto (otimizado com set intersection)"""
        # 🚀 OTIMIZAÇÃO: Usa set intersection ao invés de loops
        words = set(normalized.split())
        
        # Verificar marcas de carros
        car_match = words & self.car_brands
        if car_match:
            return car_match.pop()
        
        # Verificar marcas de motos
        moto_match = words & self.moto_brands
        if moto_match:
            return moto_match.pop()
        
        return None
    
    def detect_model(self, normalized: str) -> str | None:
        """Detecta modelo do produto (smartphones principalmente)"""
        
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
    
    def detect_year(self, normalized: str) -> int | None:
        """Detecta ano do veículo (1980-2029)"""
        match = self.year_pattern_compiled.search(normalized)
        if match:
            year = int(match.group(1))
            # Validar ano razoável
            if 1980 <= year <= 2029:
                return year
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
    
    def detect_condition(self, normalized: str) -> str:
        """Detecta se o produto é novo ou usado (usando regex compiladas)"""
        for pattern in self.used_patterns_compiled:
            if pattern.search(normalized):
                return "used"
        
        for pattern in self.new_patterns_compiled:
            if pattern.search(normalized):
                return "new"
        
        return "unknown"
    
    def detect_location(self, normalized: str) -> bool:
        """Detecta se a query contém informação de localização (OTIMIZADO)"""
        # 🚀 OTIMIZAÇÃO: Usa listas pré-carregadas do __init__
        
        # Verificar padrão "em [localização]"
        for estado in self.estados:
            if re.search(rf'\bem\s+{re.escape(estado)}\b', normalized):
                return True
        
        for cidade in self.cidades:
            if re.search(rf'\bem\s+{re.escape(cidade)}\b', normalized):
                return True
        
        # Verificar estados/cidades sozinhos (com word boundary)
        for estado in self.estados:
            if self.keyword_match(estado, normalized):
                return True
        
        for cidade in self.cidades:
            if self.keyword_match(cidade, normalized):
                return True
        
        return False
    
    def is_question_about_usage(self, normalized: str) -> bool:
        """Detecta se o usuário está perguntando como usar o sistema (usando regex compiladas)"""
        for pattern in self.system_question_patterns_compiled:
            if pattern.search(normalized):
                return True
        return False
    
    def is_credits_question(self, normalized: str) -> bool:
        """Detecta se o usuário está perguntando sobre créditos"""
        for pattern in self.credits_question_patterns_compiled:
            if pattern.search(normalized):
                return True
        return False
    
    def is_recharge_question(self, normalized: str) -> bool:
        """Detecta se o usuário está perguntando sobre recarga/compra de créditos"""
        for pattern in self.recharge_question_patterns_compiled:
            if pattern.search(normalized):
                return True
        return False
    
    def is_plans_question(self, normalized: str) -> bool:
        """Detecta se o usuário está perguntando sobre planos/assinatura"""
        for pattern in self.plans_question_patterns_compiled:
            if pattern.search(normalized):
                return True
        return False
    
    def has_result_limit(self, normalized: str) -> bool:
        """Detecta se o usuário especificou quantidade de resultados"""
        return self.limit_pattern_compiled.search(normalized) is not None
    
    def extract_result_limit(self, normalized: str) -> int | None:
        """Extrai quantidade de resultados da query"""
        match = self.limit_pattern_compiled.search(normalized)
        
        if match:
            limit = int(match.group(1))
            # Limitar entre 1 e 50
            return min(max(limit, 1), 50)
        
        # Palavras por extenso
        if re.search(r'\bdez\s*(resultados|produtos|itens)', normalized):
            return 10
        if re.search(r'\bvinte\s*(resultados|produtos|itens)', normalized):
            return 20
        
        return None
    
    def is_greeting(self, normalized: str) -> bool:
        """Detecta saudações (usando regex compiladas)"""
        for pattern in self.greeting_patterns_compiled:
            if pattern.search(normalized):
                return True
        return False
    
    def extract_partial_intent(self, normalized: str) -> Dict[str, any]:
        """Extrai intenção parcial quando usuário está perdido"""
        
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
    
    def generate_guided_question(self, normalized: str) -> str | None:
        """Gera pergunta guiada baseada no contexto"""
        partial_intent = self.extract_partial_intent(normalized)
        
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
    
    def classify(self, query: str, user_context: Dict = None) -> Dict:
        """
        Classifica a query e retorna categoria + scrapers recomendados + campos faltantes
        
        Args:
            query: Query do usuário
            user_context: Contexto do usuário (location: {city, state})
        
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
                "extracted_product": str | None,
                "user_location": Dict | None
            }
        """
        user_context = user_context or {}
        # 🚀 OTIMIZAÇÃO: Limitar tamanho da query (evita queries gigantes)
        MAX_TOKENS = 20
        tokens = query.split()
        if len(tokens) > MAX_TOKENS:
            logger.warning(f"Query muito longa ({len(tokens)} tokens), truncando para {MAX_TOKENS}")
            query = " ".join(tokens[:MAX_TOKENS])
        
        # NORMALIZAR APENAS UMA VEZ (performance)
        normalized = self.normalize_query(query)
        
        # 🆕 DETECTAR PERGUNTAS E SAUDAÇÕES
        is_question = self.is_question_about_usage(normalized)
        is_greeting = self.is_greeting(normalized)
        is_credits_question = self.is_credits_question(normalized)
        is_recharge_question = self.is_recharge_question(normalized)
        is_plans_question = self.is_plans_question(normalized)
        extracted_product = None
        
        # 💳 PERGUNTAS SOBRE CRÉDITOS
        if is_credits_question:
            logger.info("Pergunta sobre créditos detectada!")
            return {
                "category": "general",
                "confidence": 1.0,
                "recommended_scrapers": [],
                "condition": "unknown",
                "all_scores": {},
                "missing_fields": [],
                "suggested_question": None,
                "is_question": True,
                "is_greeting": False,
                "is_credits_question": True,
                "is_recharge_question": False,
                "is_plans_question": False,
                "extracted_product": None,
                "detected_brand": None,
                "detected_model": None,
                "normalized_query": "",
                "question_type": "credits"
            }
        
        # 🔄 PERGUNTAS SOBRE RECARGA
        if is_recharge_question:
            logger.info("Pergunta sobre recarga detectada!")
            return {
                "category": "general",
                "confidence": 1.0,
                "recommended_scrapers": [],
                "condition": "unknown",
                "all_scores": {},
                "missing_fields": [],
                "suggested_question": None,
                "is_question": True,
                "is_greeting": False,
                "is_credits_question": False,
                "is_recharge_question": True,
                "is_plans_question": False,
                "extracted_product": None,
                "detected_brand": None,
                "detected_model": None,
                "normalized_query": "",
                "question_type": "recharge"
            }
        
        # 📊 PERGUNTAS SOBRE PLANOS
        if is_plans_question:
            logger.info("Pergunta sobre planos detectada!")
            return {
                "category": "general",
                "confidence": 1.0,
                "recommended_scrapers": [],
                "condition": "unknown",
                "all_scores": {},
                "missing_fields": [],
                "suggested_question": None,
                "is_question": True,
                "is_greeting": False,
                "is_credits_question": False,
                "is_recharge_question": False,
                "is_plans_question": True,
                "extracted_product": None,
                "detected_brand": None,
                "detected_model": None,
                "normalized_query": "",
                "question_type": "plans"
            }
        
        # ❓ PERGUNTAS SOBRE USO DO SISTEMA
        if is_question:
            logger.info("Pergunta sobre o sistema detectada!")
            
            # Tentar gerar pergunta guiada
            guided_question = self.generate_guided_question(normalized)
            
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
                "is_credits_question": False,
                "is_recharge_question": False,
                "is_plans_question": False,
                "extracted_product": None,
                "detected_brand": None,
                "detected_model": None,
                "normalized_query": "",
                "guided_response": guided_question,
                "question_type": "usage"
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
        
        condition = self.detect_condition(normalized)
        
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
            
            # 🎓 APRENDIZADO: Verificar keywords aprendidas
            if self.learner:
                learned_kws = self.learner.get_learned_keywords(category=category)
                for learned_kw in learned_kws:
                    if self.keyword_match(learned_kw, normalized):
                        score += 1.5  # Boost para keywords aprendidas
                        matches.append(f"learned:{learned_kw}")
                        logger.debug(f"  🎓 Keyword aprendida detectada: {learned_kw}")
            
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
        
        # Pegar scrapers recomendados (CÓPIA para evitar efeitos colaterais)
        scrapers = self.categories[best_category]["scrapers"].copy()
        
        # Se condição é "usado", priorizar OLX
        if condition == "used" and "olx" in scrapers:
            scrapers.remove("olx")
            scrapers.insert(0, "olx")
        
        # 🆕 DETECTAR CAMPOS FALTANTES (ORDEM DE PRIORIDADE)
        missing_fields = []
        suggested_question = None
        
        # 1. Verificar condição (novo/usado) - PRIMEIRA PRIORIDADE
        if condition == "unknown":
            missing_fields.append("condition")
            suggested_question = "Você prefere novo ou usado?"
        
        # 2. Verificar localização (apenas para carros/motos) - APENAS SE JÁ TEM CONDIÇÃO
        elif best_category in ["car", "motorcycle"]:
            has_location = self.detect_location(normalized)
            if not has_location:
                missing_fields.append("location")
                
                # 🆕 USAR LOCALIZAÇÃO DO USUÁRIO SE DISPONÍVEL
                user_location = user_context.get('location', {})
                user_city = user_location.get('city')
                user_state = user_location.get('state')
                
                if user_city and user_state:
                    suggested_question = f"Vi que você mora em {user_city}, {user_state}. Quer pesquisar nessa região ou em outro lugar?"
                elif user_city:
                    suggested_question = f"Vi que você mora em {user_city}. Quer pesquisar aí ou em outro lugar?"
                else:
                    suggested_question = "Em qual cidade ou estado você está procurando?"
        
        # 🆕 DETECTAR MARCA, MODELO E ANO
        detected_brand = self.detect_brand(normalized)
        detected_model = self.detect_model(normalized)
        detected_year = self.detect_year(normalized) if best_category in ["car", "motorcycle"] else None
        normalized_for_scraper = self.normalize_query_for_scraper(query, best_category)
        
        # 🆕 INCLUIR LOCALIZAÇÃO DO USUÁRIO NO RESULTADO
        user_location = user_context.get('location', {})
        
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
            "detected_year": detected_year,
            "normalized_query": normalized_for_scraper,
            "user_location": user_location if user_location else None
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
    
    def reload_config(self):
        """
        Recarrega configurações do JSON sem reiniciar o servidor
        Útil para atualizar categorias/keywords em produção
        """
        logger.info("Recarregando configurações do JSON...")
        self.config_loader.reload()
        
        # Atualizar referências
        self.synonyms = self.config_loader.get_synonyms()
        self.categories = self.config_loader.get_categories()
        
        brands = self.config_loader.get_brands()
        self.car_brands = set(brands.get("car", []))
        self.moto_brands = set(brands.get("motorcycle", []))
        
        logger.info("Configurações recarregadas com sucesso!")
