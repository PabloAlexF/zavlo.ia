"""
Classificador de Produtos - Baseado em Keywords
Abordagem pragmática sem ML pesado
"""
import re
from typing import Dict, List, Tuple
import logging
from .config_loader import ConfigLoader
from .price_extractor import extract_price_range

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
        
        # Pré-compilar patterns de localização (evita recriar por request)
        self.location_patterns = [
            re.compile(rf'\b{re.escape(loc)}\b') for loc in self.estados + self.cidades
        ]
    
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
            re.compile(r'\buso\b(?!\s+(?:domestico|profissional|pessoal|geral|diario|comum))'), re.compile(r'\bde uso\b'), 
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
        
        # Padrão de ano para veículos (cobre 1980-2029 — alinhado com detect_year)
        self.year_pattern_compiled = re.compile(r'\b(19[8-9]\d|20[0-2]\d)\b')
        
        # Padrões de despedida
        self.farewell_patterns_compiled = [
            re.compile(r'^(tchau|adeus|ate logo|ate mais|falou|flw|bye|xau)\b'),
            re.compile(r'\b(obrigado|obrigada|valeu|muito obrigado|muito obrigada)\b'),
        ]
        
        # Padrões de saudação
        self.greeting_patterns_compiled = [
            re.compile(r'^ola\b'), re.compile(r'^oi\b'), 
            re.compile(r'^hey\b'), re.compile(r'^e ai\b'),
            re.compile(r'^eai\b'), re.compile(r'^opa\b'),
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
            re.compile(r'\bajuda\b(?!\s+(?:para\s+)?(?:encontrar|buscar|achar|comprar|procurar))'),
            re.compile(r'\bhelp\b(?!\s+(?:me\s+)?(?:find|search|buy|get))'),
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
            re.compile(r'\bsaldo\b.*\b(de\s+)?creditos?\b'),  # exige contexto de créditos
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
        
        # Remover pontuação (mantém espaços e alfanuméricos)
        query = re.sub(r'[^\w\s]', ' ', query)
        query = ' '.join(query.split())
        
        # Aplicar sinônimos
        words = query.split()
        normalized_words = [self.synonyms.get(word, word) for word in words]
        query = " ".join(normalized_words)
        
        return query
    
    def keyword_match(self, keyword: str, text: str) -> bool:
        """Match de keyword com word boundary"""
        return keyword in (text if isinstance(text, list) else text.split())
    
    def detect_brand(self, normalized: str) -> str | None:
        """Detecta marca do produto — prioriza primeira ocorrência na query"""
        words = normalized.split()
        # Iterar na ordem das palavras para retornar a primeira marca encontrada
        for word in words:
            if word in self.car_brands:
                return word
            if word in self.moto_brands:
                return word
        return None
    
    def detect_model(self, normalized: str, brand: str = None, category: str = None) -> tuple:
        """Detecta modelo e versão do produto. Retorna (model, version)."""
        
        # Modelos de carros por marca
        car_models = {
            'honda':      ['civic', 'fit', 'hrv', 'hr-v', 'crv', 'cr-v', 'city', 'accord', 'pilot', 'odyssey'],
            'toyota':     ['corolla', 'hilux', 'yaris', 'etios', 'sw4', 'rav4', 'camry', 'prius', 'land cruiser'],
            'chevrolet':  ['onix', 'cruze', 'tracker', 'spin', 'cobalt', 'prisma', 'equinox', 's10', 'trailblazer', 'montana'],
            'volkswagen': ['gol', 'polo', 'virtus', 'voyage', 'fox', 'up', 'tiguan', 't-cross', 'amarok', 'saveiro'],
            'fiat':       ['uno', 'palio', 'siena', 'strada', 'toro', 'argo', 'cronos', 'mobi', 'pulse', 'fastback', 'doblo'],
            'ford':       ['ka', 'fiesta', 'focus', 'fusion', 'ranger', 'ecosport', 'edge', 'bronco', 'maverick'],
            'hyundai':    ['hb20', 'creta', 'tucson', 'ix35', 'elantra', 'sonata', 'santa fe'],
            'nissan':     ['kicks', 'versa', 'sentra', 'frontier', 'march', 'tiida'],
            'renault':    ['kwid', 'sandero', 'logan', 'duster', 'captur', 'oroch', 'master'],
            'jeep':       ['renegade', 'compass', 'commander', 'wrangler', 'gladiator'],
            'mitsubishi': ['asx', 'outlander', 'pajero', 'eclipse cross', 'l200'],
            'kia':        ['sportage', 'cerato', 'soul', 'stinger', 'sorento', 'carnival'],
            'bmw':        ['320i', '328i', '118i', '320', 'x1', 'x3', 'x5', 'x6', 'm3', 'm5'],
            'mercedes':   ['c180', 'c200', 'c300', 'a200', 'gla', 'glc', 'gle', 'cla'],
            'audi':       ['a3', 'a4', 'a5', 'q3', 'q5', 'q7', 'tt', 'r8'],
        }
        
        version_keywords = [
            'touring', 'sport', 'lx', 'ex', 'exl', 'xei', 'gli', 'gls', 'glx',
            'xls', 'xlt', 'limited', 'platinum', 'titanium', 'se', 'sel',
            'm sport', 'amg', 's line', 'r-line', 'black edition',
        ]

        detected_model = None
        detected_version = None

        if brand and brand.lower() in car_models:
            for model in car_models[brand.lower()]:
                if model in normalized:
                    detected_model = model
                    break

        if not detected_model and (category in ('car', 'motorcycle') or brand):
            for brand_models in car_models.values():
                for model in brand_models:
                    if model in normalized:
                        detected_model = model
                        break
                if detected_model:
                    break

        if detected_model:
            after_model = normalized.split(detected_model, 1)[-1].strip()
            for ver in version_keywords:
                if ver in after_model:
                    detected_version = ver
                    break
            return detected_model, detected_version

        match = re.search(r'iphone\s*(\d+|x|xs|xr|se|pro|max|plus|mini)', normalized)
        if match:
            return match.group(0), None

        match = re.search(r'galaxy\s*(s\d+|a\d+|note\d+|z\s*flip|z\s*fold)', normalized)
        if match:
            return match.group(0), None

        match = re.search(r'(redmi|poco|mi)\s*(note\s*)?\d+', normalized)
        if match:
            return match.group(0), None

        return None, None
    
    def detect_transmission(self, normalized: str) -> str | None:
        """Detecta transmissão do veículo"""
        if re.search(r'\b(automatico|automatica|auto|cvt|dsg|tiptronic)\b', normalized):
            return 'automatic'
        if re.search(r'\b(manual|mecanico|mecanica)\b', normalized):
            return 'manual'
        return None

    def detect_fuel(self, normalized: str) -> str | None:
        """Detecta tipo de combustível"""
        m = re.search(r'\b(flex|alcool|etanol|gasolina|gas)\b', normalized)
        if m:
            return m.group(0)
        if re.search(r'\b(diesel|turbo diesel)\b', normalized):
            return 'diesel'
        if re.search(r'\b(eletrico|hibrido|hybrid|ev)\b', normalized):
            return 'electric'
        return None

    def detect_body_type(self, normalized: str) -> str | None:
        """Detecta carroceria do veículo"""
        types = {
            'hatch': r'\b(hatch|hatchback)\b',
            'sedan': r'\bsedan\b',
            'suv':   r'\b(suv|crossover)\b',
            'pickup': r'\b(pickup|caminhonete|picape)\b',
            'van':   r'\b(van|minivan|furgao)\b',
            'coupe': r'\b(coupe|coupe)\b',
            'convertible': r'\b(cabrio|conversivel|descapotavel)\b',
        }
        for body, pattern in types.items():
            if re.search(pattern, normalized):
                return body
        return None

    def detect_color(self, normalized: str) -> str | None:
        """Detecta cor do veículo"""
        colors = ['branco', 'preto', 'prata', 'cinza', 'vermelho', 'azul', 'verde', 'amarelo', 'laranja', 'marrom', 'bege']
        for color in colors:
            if re.search(rf'\b{color}\b', normalized):
                return color
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
        
        # Remover expressões de localização (cobre múltiplas palavras: "em sao paulo")
        normalized = re.sub(r'\bem\s+(?:\w+\s*){1,3}', '', normalized)
        
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
        return any(p.search(normalized) for p in self.location_patterns)
    
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
    
    def is_farewell(self, normalized: str) -> bool:
        """Detecta despedidas e agradecimentos"""
        for pattern in self.farewell_patterns_compiled:
            if pattern.search(normalized):
                return True
        return False
    
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
        normalized_words = normalized.split()
        
        # 🆕 DETECTAR PERGUNTAS E SAUDAÇÕES
        is_question = self.is_question_about_usage(normalized)
        is_greeting = self.is_greeting(normalized)
        is_farewell = self.is_farewell(normalized)
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
        
        if is_greeting or is_farewell:
            logger.info("Saudação/despedida detectada!")
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
                "scrapers": [{"name": "google_shopping", "score": 0.6}],
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
        
        # Calcular confiança — penaliza competição, boost por sessão
        total_score = sum(scores.values())
        raw_confidence = min(max_score / (total_score + 0.1), 1.0) if total_score > 0 else 0.5
        confidence = min(raw_confidence * (1 + len(scores) * 0.05), 1.0)
        if user_context.get('last_category') == best_category:
            confidence = min(confidence + 0.1, 1.0)

        # Normalizar scores para retorno
        normalized_scores = {k: v / total_score for k, v in scores.items()} if total_score > 0 else scores

        # Scrapers com score de prioridade
        scraper_base_scores = {'olx': 0.7, 'webmotors': 0.8, 'mercadolivre': 0.85, 'google_shopping': 0.6}
        if condition == 'used':
            scraper_base_scores['olx'] = 0.95
        scrapers = self.categories[best_category]["scrapers"].copy()
        scrapers_priority = sorted(
            [{'name': s, 'score': scraper_base_scores.get(s, 0.5)} for s in scrapers],
            key=lambda x: x['score'], reverse=True
        )
        scrapers = [s['name'] for s in scrapers_priority]
        
        # 🆕 DETECTAR MARCA, MODELO E ANO (MOVER PARA CIMA - ANTES DE USAR)
        detected_brand = self.detect_brand(normalized)
        detected_model, detected_version = self.detect_model(normalized, brand=detected_brand, category=best_category)
        detected_year = self.detect_year(normalized) if best_category in ["car", "motorcycle"] else None
        detected_transmission = self.detect_transmission(normalized) if best_category in ["car", "motorcycle"] else None
        detected_fuel = self.detect_fuel(normalized) if best_category in ["car", "motorcycle"] else None
        detected_body_type = self.detect_body_type(normalized) if best_category in ["car", "motorcycle"] else None
        detected_color = self.detect_color(normalized) if best_category in ["car", "motorcycle"] else None
        # Campos para categorias não-veículo
        detected_gender  = self._detect_gender(normalized)  if best_category == 'fashion' else None
        detected_size    = self._detect_size(normalized)    if best_category == 'fashion' else None
        detected_storage = self._detect_storage(normalized) if best_category in ('smartphone', 'electronics') else None
        
        # 🆕 DETECTAR CAMPOS FALTANTES (ORDEM DE PRIORIDADE)
        missing_fields = []
        first_missing = None
        suggested_question = None
        
        # Extrair preço uma única vez
        price_range_data = extract_price_range(normalized) if best_category in ['car', 'motorcycle'] else None
        has_price_range = price_range_data is not None

        # Para VEÍCULOS: Verificar CONDIÇÃO, ANO, LOCALIZAÇÃO e FAIXA DE PREÇO
        if best_category in ['car', 'motorcycle']:
            has_location = self.detect_location(normalized)
            logger.info(f"🔍 condition={condition} year={detected_year} location={has_location} price={has_price_range}")
            
            # Prioridade dinâmica por categoria
            if best_category == 'car':
                priority_order = ['price_range', 'year', 'condition', 'location', 'transmission', 'fuel', 'body_type']
            else:  # motorcycle
                priority_order = ['price_range', 'condition', 'year', 'location', 'transmission', 'fuel']

            checks = {
                'price_range':  not has_price_range and not user_context.get('price_range') and not user_context.get('last_filters', {}).get('price_range'),
                'condition':    condition == 'unknown' and not user_context.get('condition') and not user_context.get('last_filters', {}).get('condition'),
                'year':         not detected_year and not user_context.get('year') and not user_context.get('last_filters', {}).get('year'),
                'location':     not has_location and not user_context.get('location') and not user_context.get('last_filters', {}).get('location'),
                'transmission': not detected_transmission and not user_context.get('last_filters', {}).get('transmission'),
                'fuel':         not detected_fuel and not user_context.get('last_filters', {}).get('fuel'),
                'body_type':    best_category == 'car' and not detected_body_type and not user_context.get('last_filters', {}).get('body_type'),
            }
            # Herdar filtros da sessão anterior se disponíveis
            last_filters = user_context.get('last_filters', {})
            if not has_price_range and last_filters.get('price_range'):
                price_range_data = last_filters['price_range']
                checks['price_range'] = False
            for field in priority_order:
                if checks.get(field):
                    missing_fields.append(field)
                    logger.info(f"📝 [FIELDS] Campo faltante adicionado: {field}")

            # Auto-skip: alta confiança só pergunta o primeiro campo
            if confidence > 0.9 and len(missing_fields) > 1:
                missing_fields = missing_fields[:1]
            
            logger.info(f"📋 [FIELDS] Total de campos faltantes: {len(missing_fields)} - {missing_fields}")
            
            # ✅ GERAR PERGUNTA APENAS PARA O PRIMEIRO CAMPO FALTANTE
            if missing_fields:
                first_missing = missing_fields[0]
                
                if first_missing == "condition":
                    suggested_question = "Você prefere novo ou usado?"
                elif first_missing == "year":
                    suggested_question = "De qual ano você está procurando? (Ex: 2020, 2018-2022)"
                elif first_missing == "location":
                    user_location = user_context.get('location', {})
                    user_city = user_location.get('city')
                    user_state = user_location.get('state')
                    if user_city and user_state:
                        suggested_question = f"Vi que você mora em {user_city}, {user_state}. Quer pesquisar nessa região ou em outro lugar?"
                    elif user_city:
                        suggested_question = f"Vi que você mora em {user_city}. Quer pesquisar aí ou em outro lugar?"
                    else:
                        suggested_question = "Em qual cidade ou estado você está procurando?"
                elif first_missing == "price_range":
                    suggested_question = self.generate_smart_price_question(
                        detected_brand, detected_model, detected_year, condition, user_context
                    )
                elif first_missing == "transmission":
                    suggested_question = {
                        'question': 'Qual câmbio você prefere?',
                        'suggestions': [
                            {'label': '⚙️ Manual',     'value': 'manual'},
                            {'label': '🤖 Automático', 'value': 'automatico'},
                            {'label': '🔀 Tanto faz',  'value': 'qualquer'},
                        ]
                    }
                elif first_missing == "fuel":
                    suggested_question = {
                        'question': 'Qual combustível você prefere?',
                        'suggestions': [
                            {'label': '⛽ Flex',      'value': 'flex'},
                            {'label': '🛢️ Diesel',    'value': 'diesel'},
                            {'label': '⚡ Elétrico',  'value': 'eletrico'},
                            {'label': '🔀 Tanto faz', 'value': 'qualquer'},
                        ]
                    }
                elif first_missing == "body_type":
                    suggested_question = {
                        'question': 'Qual estilo de carroceria?',
                        'suggestions': [
                            {'label': '🚗 Hatch',   'value': 'hatch'},
                            {'label': '🚙 Sedan',   'value': 'sedan'},
                            {'label': '🛻 SUV',     'value': 'suv'},
                            {'label': '🚐 Pickup',  'value': 'pickup'},
                            {'label': '🔀 Tanto faz','value': 'qualquer'},
                        ]
                    }
                
                logger.info(f"✅ [FIELDS] Pergunta gerada: {suggested_question}")
        elif best_category == 'smartphone':
            last_filters = user_context.get('last_filters', {})
            # 1. Condição
            if condition == 'unknown' and not user_context.get('condition') and not last_filters.get('condition'):
                missing_fields.append('condition')
                suggested_question = 'Você prefere novo ou usado?'
            # 2. Faixa de preço
            price_range_data = extract_price_range(normalized)
            if not price_range_data and not last_filters.get('price_range'):
                missing_fields.append('price_range')
                if not suggested_question:
                    suggested_question = {
                        'question': 'Qual sua faixa de preço?',
                        'suggestions': [
                            {'label': 'Até 1.500', 'max': 1500},
                            {'label': 'Entre 1.500 e 3.000', 'min': 1500, 'max': 3000},
                            {'label': 'Entre 3.000 e 6.000', 'min': 3000, 'max': 6000},
                            {'label': 'Acima de 6.000', 'min': 6000},
                        ]
                    }
            # 3. Armazenamento/capacidade (ex: 128GB, 256GB)
            if not detected_storage and not last_filters.get('storage'):
                missing_fields.append('storage')
                if not suggested_question:
                    suggested_question = {
                        'question': 'Qual capacidade de armazenamento você precisa?',
                        'suggestions': [
                            {'label': '64 GB',  'value': '64gb'},
                            {'label': '128 GB', 'value': '128gb'},
                            {'label': '256 GB', 'value': '256gb'},
                            {'label': '512 GB', 'value': '512gb'},
                        ]
                    }
            # Perguntar só o primeiro campo
            if missing_fields:
                missing_fields = missing_fields[:1]

        elif best_category == 'electronics':
            last_filters = user_context.get('last_filters', {})
            # 1. Marca (se não detectada e não na query)
            if not detected_brand and not last_filters.get('brand'):
                missing_fields.append('brand')
                suggested_question = {
                    'question': 'Tem preferência de marca?',
                    'suggestions': [
                        {'label': 'Dell',    'value': 'dell'},
                        {'label': 'Lenovo',  'value': 'lenovo'},
                        {'label': 'Samsung', 'value': 'samsung'},
                        {'label': 'Apple',   'value': 'apple'},
                        {'label': '🔀 Sem preferência', 'value': 'qualquer'},
                    ]
                }
            # 2. Condição
            if condition == 'unknown' and not user_context.get('condition') and not last_filters.get('condition'):
                missing_fields.append('condition')
                if not suggested_question:
                    suggested_question = 'Você prefere novo ou usado?'
            # 3. Faixa de preço
            price_range_data = extract_price_range(normalized)
            if not price_range_data and not last_filters.get('price_range'):
                missing_fields.append('price_range')
                if not suggested_question:
                    suggested_question = {
                        'question': 'Qual sua faixa de preço?',
                        'suggestions': [
                            {'label': 'Até 2.000',              'max': 2000},
                            {'label': 'Entre 2.000 e 5.000',   'min': 2000, 'max': 5000},
                            {'label': 'Entre 5.000 e 10.000',  'min': 5000, 'max': 10000},
                            {'label': 'Acima de 10.000',        'min': 10000},
                        ]
                    }
            if missing_fields:
                missing_fields = missing_fields[:1]

        elif best_category == 'fashion':
            last_filters = user_context.get('last_filters', {})
            # 1. Gênero (já detectado acima, reusar)
            if not detected_gender and not last_filters.get('gender'):
                missing_fields.append('gender')
                suggested_question = {
                    'question': 'Para quem é?',
                    'suggestions': [
                        {'label': '👨 Masculino', 'value': 'masculino'},
                        {'label': '👩 Feminino',  'value': 'feminino'},
                        {'label': '🧒 Infantil',  'value': 'infantil'},
                        {'label': '🔀 Unissex',   'value': 'unissex'},
                    ]
                }
            # 2. Tamanho (já detectado acima, reusar)
            if not detected_size and not last_filters.get('size'):
                missing_fields.append('size')
                if not suggested_question:
                    suggested_question = {
                        'question': 'Qual tamanho/número você precisa?',
                        'suggestions': [
                            {'label': 'P / 36-37',  'value': 'P 36'},
                            {'label': 'M / 38-39',  'value': 'M 38'},
                            {'label': 'G / 40-41',  'value': 'G 40'},
                            {'label': 'GG / 42-43', 'value': 'GG 42'},
                        ]
                    }
            # 3. Tipo de calçado (se a query contém calçado genérico sem tipo)
            shoe_keywords = ['tenis', 'sapato', 'calcado', 'calçado']
            has_shoe = any(kw in normalized for kw in shoe_keywords)
            shoe_type_keywords = ['tenis', 'bota', 'sandalia', 'mocassim', 'oxford', 'sapatilha', 'chinelo']
            has_shoe_type = any(kw in normalized for kw in shoe_type_keywords)
            if has_shoe and not has_shoe_type and not last_filters.get('shoe_type'):
                missing_fields.append('shoe_type')
                if not suggested_question:
                    suggested_question = {
                        'question': 'Que tipo de calçado?',
                        'suggestions': [
                            {'label': '👟 Tênis',    'value': 'tenis'},
                            {'label': '👢 Bota',     'value': 'bota'},
                            {'label': '👡 Sandália', 'value': 'sandalia'},
                            {'label': '🥿 Sapatilha','value': 'sapatilha'},
                        ]
                    }
            # 4. Faixa de preço
            price_range_data = extract_price_range(normalized)
            if not price_range_data and not last_filters.get('price_range'):
                missing_fields.append('price_range')
                if not suggested_question:
                    suggested_question = {
                        'question': 'Qual sua faixa de preço?',
                        'suggestions': [
                            {'label': 'Até 150',           'max': 150},
                            {'label': 'Entre 150 e 400',   'min': 150, 'max': 400},
                            {'label': 'Entre 400 e 800',   'min': 400, 'max': 800},
                            {'label': 'Acima de 800',       'min': 800},
                        ]
                    }
            if missing_fields:
                missing_fields = missing_fields[:1]

        elif best_category == 'appliance':
            last_filters = user_context.get('last_filters', {})
            # 1. Marca (se não detectada)
            if not detected_brand and not last_filters.get('brand'):
                missing_fields.append('brand')
                suggested_question = {
                    'question': 'Tem preferência de marca?',
                    'suggestions': [
                        {'label': 'Brastemp',  'value': 'brastemp'},
                        {'label': 'Electrolux','value': 'electrolux'},
                        {'label': 'Samsung',   'value': 'samsung'},
                        {'label': 'LG',        'value': 'lg'},
                        {'label': '🔀 Sem preferência', 'value': 'qualquer'},
                    ]
                }
            # 2. Condição
            if condition == 'unknown' and not user_context.get('condition') and not last_filters.get('condition'):
                missing_fields.append('condition')
                if not suggested_question:
                    suggested_question = 'Você prefere novo ou usado?'
            # 3. Faixa de preço
            price_range_data = extract_price_range(normalized)
            if not price_range_data and not last_filters.get('price_range'):
                missing_fields.append('price_range')
                if not suggested_question:
                    suggested_question = {
                        'question': 'Qual sua faixa de preço?',
                        'suggestions': [
                            {'label': 'Até 1.000',            'max': 1000},
                            {'label': 'Entre 1.000 e 3.000',  'min': 1000, 'max': 3000},
                            {'label': 'Entre 3.000 e 6.000',  'min': 3000, 'max': 6000},
                            {'label': 'Acima de 6.000',        'min': 6000},
                        ]
                    }
            if missing_fields:
                missing_fields = missing_fields[:1]

        elif best_category == 'furniture':
            last_filters = user_context.get('last_filters', {})
            if condition == 'unknown' and not user_context.get('condition') and not last_filters.get('condition'):
                missing_fields.append('condition')
                suggested_question = 'Você prefere novo ou usado?'
            price_range_data = extract_price_range(normalized)
            if not price_range_data and not last_filters.get('price_range'):
                missing_fields.append('price_range')
                if not suggested_question:
                    suggested_question = {
                        'question': 'Qual sua faixa de preço?',
                        'suggestions': [
                            {'label': 'Até 500',            'max': 500},
                            {'label': 'Entre 500 e 1.500',  'min': 500,  'max': 1500},
                            {'label': 'Entre 1.500 e 4.000','min': 1500, 'max': 4000},
                            {'label': 'Acima de 4.000',      'min': 4000},
                        ]
                    }
            if missing_fields:
                missing_fields = missing_fields[:1]

        elif best_category == 'marketplace_used':
            last_filters = user_context.get('last_filters', {})
            user_location = user_context.get('location', {})
            has_location = self.detect_location(normalized)
            if not has_location and not user_context.get('location') and not last_filters.get('location'):
                missing_fields.append('location')
                user_city = user_location.get('city') if isinstance(user_location, dict) else None
                if user_city:
                    suggested_question = f'Vi que você mora em {user_city}. Quer buscar perto de você ou em todo o Brasil?'
                else:
                    suggested_question = 'Em qual cidade você quer buscar?'
            if missing_fields:
                missing_fields = missing_fields[:1]
        # Para 'general': não perguntar (produto desconhecido)
        
        # Incluir localização do usuário no resultado
        user_location = user_context.get('location', {})
        normalized_for_scraper = self.normalize_query_for_scraper(query, best_category)

        result = {
            "category": best_category,
            "confidence": round(confidence, 2),
            "scrapers": scrapers_priority,
            "condition": condition,
            "all_scores": {k: round(v, 2) for k, v in normalized_scores.items()},
            "missing_fields": missing_fields,
            "suggested_question": suggested_question,
            "is_question": is_question,
            "is_greeting": is_greeting,
            "extracted_product": extracted_product,
            "detected_brand": detected_brand,
            "detected_model": detected_model,
            "detected_version": detected_version,
            "detected_year": detected_year,
            "detected_transmission": detected_transmission,
            "detected_fuel": detected_fuel,
            "detected_body_type": detected_body_type,
            "detected_color": detected_color,
            "detected_gender": detected_gender,
            "detected_size": detected_size,
            "detected_storage": detected_storage,
            "normalized_query": normalized_for_scraper,
            "search_query": " ".join(filter(None, [
                normalized_for_scraper,
                str(detected_year) if detected_year else None,
                condition if condition != 'unknown' else None,
                " ".join(filter(None, [user_location.get('city'), user_location.get('state')])) or None if user_location else None
            ])),
            "last_filters": {
                "price_range": price_range_data,
                "condition": condition if condition != 'unknown' else None,
                "location": user_location or None,
                "gender": detected_gender,
                "size": detected_size,
                "storage": detected_storage,
                "transmission": detected_transmission,
                "fuel": detected_fuel,
                "body_type": detected_body_type,
                "brand": detected_brand,
                "shoe_type": None,  # preenchido pelo frontend via answers
            },
            "price_range": price_range_data,
            "question_type": first_missing if missing_fields else None
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

    def _detect_gender(self, normalized: str) -> str | None:
        """Detecta gênero em produtos de moda"""
        if re.search(r'\b(masculino|masculina|homem|homen|masc|male)\b', normalized):
            return 'masculino'
        if re.search(r'\b(feminino|feminina|mulher|fem|female)\b', normalized):
            return 'feminino'
        if re.search(r'\b(infantil|crianca|criança|menino|menina|kids|bebe|bebê)\b', normalized):
            return 'infantil'
        if re.search(r'\b(unissex|unisex)\b', normalized):
            return 'unissex'
        return None

    def _detect_size(self, normalized: str) -> str | None:
        """Detecta tamanho/número em produtos de moda"""
        # Número de calçado (ex: 38, 39, 40)
        m = re.search(r'\b(n[\u00ba\u00b0]?\s*)?(3[4-9]|4[0-9]|[pPmMgG]{1,2})\b', normalized)
        if m:
            return m.group(0).strip()
        # Tamanho por letra
        m = re.search(r'\b(pp|gg|xgg|xg|xl|xxl|[pPmMgG])\b', normalized)
        if m:
            return m.group(0).upper()
        return None

    def _detect_storage(self, normalized: str) -> str | None:
        """Detecta capacidade de armazenamento (ex: 128gb, 256gb)"""
        m = re.search(r'\b(\d+)\s*(gb|tb)\b', normalized)
        if m:
            return f"{m.group(1)}{m.group(2)}"
        return None

    def generate_smart_price_question(self, brand: str, model: str, year: int, condition: str, user_context: dict = None) -> dict:
        """Gera pergunta de preço inteligente com sugestões estruturadas"""
        from datetime import datetime
        user_context = user_context or {}
        location_state = ''
        loc = user_context.get('location', {})
        if isinstance(loc, dict):
            location_state = loc.get('state', '').lower()
        
        # Categorização por marca/modelo (mais precisa que string matching)
        premium_brands = {'bmw', 'mercedes', 'audi', 'volvo', 'porsche', 'land rover', 'jaguar', 'lexus'}
        popular_models = {'gol', 'uno', 'palio', 'celta', 'ka', 'mobi', 'kwid', 'argo', 'cronos'}
        medio_models = {'civic', 'corolla', 'cruze', 'jetta', 'sentra', 'cerato', 'elantra'}
        suv_models = {'tucson', 'tiguan', 'hrv', 'hr-v', 'creta', 't-cross', 'compass', 'renegade', 'kicks', 'tracker'}
        moto_brands = {'yamaha', 'kawasaki', 'suzuki', 'ducati', 'harley', 'triumph', 'ktm'}
        
        brand_lower = (brand or '').lower()
        model_lower = (model or '').lower()
        
        # Detectar categoria
        if brand_lower in premium_brands:
            category = 'premium'
            base_min, base_max = 80000, 250000
        elif brand_lower in moto_brands or brand_lower == 'honda' and any(m in model_lower for m in ['cg', 'cb', 'xre', 'biz', 'fan']):
            category = 'moto'
            base_min, base_max = 8000, 35000
        elif model_lower in suv_models:
            category = 'suv'
            base_min, base_max = 60000, 160000
        elif model_lower in medio_models:
            category = 'medio'
            base_min, base_max = 40000, 90000
        elif model_lower in popular_models:
            category = 'popular'
            base_min, base_max = 12000, 45000
        else:
            category = 'medio'
            base_min, base_max = 35000, 90000
        
        # Ajuste regional de preço
        location_state = user_context.get('location', {}).get('state', '').lower() if isinstance(user_context.get('location'), dict) else ''
        if location_state in ('sp', 'rj'):
            base_max = int(base_max * 1.15)
        elif location_state in ('mg', 'rs'):
            base_max = int(base_max * 1.05)

        # Depreciação realista (85% ao ano = mercado real)
        if year:
            age = datetime.now().year - year
            depreciation = 0.85 ** age
            depreciation = max(depreciation, 0.25)  # mínimo 25%
            base_min = int(base_min * depreciation)
            base_max = int(base_max * depreciation)
        
        # Ajuste por condição
        if condition == 'new':
            base_min = int(base_min * 1.4)
            base_max = int(base_max * 1.6)
        
        # Arredondar para múltiplos de 5mil
        def round5k(v): return max(5000, round(v / 5000) * 5000)
        
        low = round5k(base_min)
        mid = round5k((base_min + base_max) / 2)
        high = round5k(base_max)
        
        def fmt(v): return f"{v/1000:.0f} mil" if v % 1000 == 0 else f"{v/1000:.1f} mil"
        
        suggestions = [
            {"label": f"Até {fmt(mid)}",                        "max": mid},
            {"label": f"Entre {fmt(low)} e {fmt(high)}",        "min": low, "max": high},
            {"label": f"Acima de {fmt(high)}",                  "min": high},
        ]
        
        vehicle_name = f"{brand} {model}".strip() if brand and model else (model or brand or 'o veículo')
        return {
            "question": f"Qual sua faixa de preço para {vehicle_name}?",
            "suggestions": suggestions
        }
