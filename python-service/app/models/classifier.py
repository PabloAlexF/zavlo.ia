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
        # Dicionário de categorias e keywords
        self.categories = {
            "car": {
                "keywords": [
                    "carro", "carros", "veiculo", "veículo", "automovel", "automóvel",
                    "toyota", "honda", "fiat", "chevrolet", "ford", "volkswagen", "vw",
                    "hyundai", "nissan", "renault", "peugeot", "citroen", "jeep",
                    "sedan", "suv", "hatch", "pickup", "caminhonete"
                ],
                "scrapers": ["webmotors", "mobiauto"],
                "priority": 10
            },
            "motorcycle": {
                "keywords": [
                    "moto", "motos", "motocicleta", "motocicletas", "scooter",
                    "honda", "yamaha", "suzuki", "kawasaki", "harley",
                    "cg", "fazer", "cb", "xre", "bros", "titan", "fan"
                ],
                "scrapers": ["webmotors", "mobiauto"],
                "priority": 9
            },
            "smartphone": {
                "keywords": [
                    "iphone", "samsung", "xiaomi", "motorola", "lg", "asus",
                    "smartphone", "celular", "telefone", "galaxy", "redmi",
                    "poco", "realme", "oneplus"
                ],
                "scrapers": ["google_shopping", "olx"],
                "priority": 8
            },
            "electronics": {
                "keywords": [
                    "notebook", "laptop", "computador", "pc", "desktop",
                    "tablet", "ipad", "monitor", "tv", "televisão", "televisao",
                    "playstation", "xbox", "nintendo", "switch", "ps5", "ps4",
                    "camera", "câmera", "fone", "headphone", "airpods"
                ],
                "scrapers": ["google_shopping", "olx"],
                "priority": 7
            },
            "furniture": {
                "keywords": [
                    "sofa", "sofá", "mesa", "cadeira", "cama", "guarda-roupa",
                    "armario", "armário", "estante", "rack", "criado-mudo",
                    "movel", "móvel", "moveis", "móveis"
                ],
                "scrapers": ["olx", "google_shopping"],
                "priority": 6
            },
            "appliance": {
                "keywords": [
                    "geladeira", "fogao", "fogão", "microondas", "lavadora",
                    "secadora", "freezer", "ar-condicionado", "ventilador",
                    "liquidificador", "batedeira", "aspirador"
                ],
                "scrapers": ["google_shopping", "olx"],
                "priority": 6
            },
            "fashion": {
                "keywords": [
                    "tenis", "tênis", "sapato", "bota", "sandalia", "sandália",
                    "camisa", "camiseta", "calça", "calca", "jaqueta", "casaco",
                    "vestido", "saia", "short", "bermuda", "nike", "adidas",
                    "puma", "reebok", "vans", "converse"
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
        """Normaliza a query removendo acentos e convertendo para lowercase"""
        query = query.lower().strip()
        
        # Remover acentos
        replacements = {
            'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a',
            'é': 'e', 'ê': 'e',
            'í': 'i',
            'ó': 'o', 'ô': 'o', 'õ': 'o',
            'ú': 'u', 'ü': 'u',
            'ç': 'c'
        }
        
        for old, new in replacements.items():
            query = query.replace(old, new)
        
        return query
    
    def detect_condition(self, query: str) -> str:
        """Detecta se o produto é novo ou usado"""
        normalized = self.normalize_query(query)
        
        # Padrões de usado
        used_patterns = [
            r'\busado\b', r'\busada\b', r'\busados\b', r'\busadas\b',
            r'\bseminovo\b', r'\bseminova\b', r'\bsemi-novo\b',
            r'\bsegunda mao\b', r'\bsegunda-mao\b'
        ]
        
        # Padrões de novo
        new_patterns = [
            r'\bnovo\b', r'\bnova\b', r'\bnovos\b', r'\bnovas\b',
            r'\blacrado\b', r'\blacrada\b', r'\b0km\b', r'\bzero km\b'
        ]
        
        for pattern in used_patterns:
            if re.search(pattern, normalized):
                return "used"
        
        for pattern in new_patterns:
            if re.search(pattern, normalized):
                return "new"
        
        return "unknown"
    
    def detect_location(self, query: str) -> bool:
        """Detecta se a query contém informação de localização"""
        normalized = self.normalize_query(query)
        
        # Padrões de localização
        location_patterns = [
            r'\bem\s+\w+',  # "em São Paulo", "em SP"
            r'\bsp\b', r'\brj\b', r'\bmg\b', r'\brs\b',  # Estados
            r'\bsao paulo\b', r'\brio de janeiro\b', r'\bbelo horizonte\b',
            r'\bcidade\b', r'\bestado\b', r'\bregiao\b'
        ]
        
        for pattern in location_patterns:
            if re.search(pattern, normalized):
                return True
        return False
    
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
                "suggested_question": str | None
            }
        """
        normalized = self.normalize_query(query)
        condition = self.detect_condition(query)
        
        logger.info(f"Classificando query: '{query}' (normalizada: '{normalized}')")
        
        # Calcular scores para cada categoria
        scores = {}
        
        for category, data in self.categories.items():
            if category == "general":
                continue  # Pular fallback
            
            score = 0.0
            matches = []
            
            # Contar keywords encontradas
            for keyword in data["keywords"]:
                if keyword in normalized:
                    score += 1.0
                    matches.append(keyword)
            
            # Boost para categorias específicas
            if category == "car" and any(brand in normalized for brand in self.car_brands):
                score += 2.0
                matches.append("car_brand_detected")
            
            if category == "motorcycle" and any(brand in normalized for brand in self.moto_brands):
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
                "all_scores": {"general": 0.5}
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
        
        # 🆕 DETECTAR CAMPOS FALTANTES
        missing_fields = []
        suggested_question = None
        
        # 1. Verificar condição (novo/usado)
        if condition == "unknown":
            missing_fields.append("condition")
            suggested_question = "Você prefere **novo ou usado**?"
        
        # 2. Verificar localização (apenas para carros/motos)
        if best_category in ["car", "motorcycle"]:
            has_location = self.detect_location(query)
            if not has_location:
                missing_fields.append("location")
                # Se já tem pergunta de condição, não sobrescrever
                if not suggested_question:
                    suggested_question = "Em qual **cidade ou estado** você está procurando?"
        
        result = {
            "category": best_category,
            "confidence": round(confidence, 2),
            "recommended_scrapers": scrapers,
            "condition": condition,
            "all_scores": {k: round(v, 2) for k, v in normalized_scores.items()},
            "missing_fields": missing_fields,
            "suggested_question": suggested_question
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
