"""
Sistema de Aprendizado Automático de Keywords
Aprende novas keywords baseado em buscas dos usuários
"""
import json
import os
from datetime import datetime
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class KeywordLearner:
    """
    Aprende automaticamente novas keywords baseado em:
    - Frequência de buscas
    - Produtos não reconhecidos
    - Padrões emergentes
    """
    
    def __init__(self, learned_path: str = None):
        if learned_path is None:
            base_dir = os.path.dirname(os.path.dirname(__file__))
            learned_path = os.path.join(base_dir, "config", "learned_keywords.json")
        
        self.learned_path = learned_path
        self.data = self._load_learned_data()
        
        # Thresholds para aprendizado
        self.MIN_FREQUENCY = 5  # Mínimo de buscas para considerar
        self.CONFIDENCE_THRESHOLD = 0.7  # Confiança mínima
    
    def _load_learned_data(self) -> Dict:
        """Carrega dados de keywords aprendidas"""
        try:
            if os.path.exists(self.learned_path):
                with open(self.learned_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            return {
                "learned_keywords": {},
                "search_frequency": {},
                "last_updated": None
            }
        except Exception as e:
            logger.error(f"Erro ao carregar learned_keywords.json: {e}")
            return {
                "learned_keywords": {},
                "search_frequency": {},
                "last_updated": None
            }
    
    def _save_learned_data(self):
        """Salva dados de keywords aprendidas"""
        try:
            self.data["last_updated"] = datetime.now().isoformat()
            with open(self.learned_path, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, indent=2, ensure_ascii=False)
            logger.info(f"✅ Learned keywords salvas: {len(self.data['learned_keywords'])} keywords")
        except Exception as e:
            logger.error(f"❌ Erro ao salvar learned_keywords.json: {e}")
    
    def record_search(self, query: str, category: str, confidence: float):
        """
        Registra uma busca para aprendizado futuro
        
        Args:
            query: Query do usuário
            category: Categoria detectada
            confidence: Confiança da classificação
        """
        normalized_query = query.lower().strip()
        
        # Incrementar frequência
        if normalized_query not in self.data["search_frequency"]:
            self.data["search_frequency"][normalized_query] = {
                "count": 0,
                "category": category,
                "confidence": confidence,
                "first_seen": datetime.now().isoformat()
            }
        
        self.data["search_frequency"][normalized_query]["count"] += 1
        self.data["search_frequency"][normalized_query]["last_seen"] = datetime.now().isoformat()
        
        # Se atingiu threshold, aprender keyword
        freq_data = self.data["search_frequency"][normalized_query]
        if freq_data["count"] >= self.MIN_FREQUENCY and confidence >= self.CONFIDENCE_THRESHOLD:
            self._learn_keyword(normalized_query, category, freq_data["count"])
        
        # Salvar a cada 10 buscas (evita I/O excessivo)
        total_searches = sum(item["count"] for item in self.data["search_frequency"].values())
        if total_searches % 10 == 0:
            self._save_learned_data()
    
    def _learn_keyword(self, query: str, category: str, frequency: int):
        """Aprende uma nova keyword"""
        if query not in self.data["learned_keywords"]:
            self.data["learned_keywords"][query] = {
                "category": category,
                "frequency": frequency,
                "learned_at": datetime.now().isoformat(),
                "status": "active"
            }
            logger.info(f"🎓 Nova keyword aprendida: '{query}' → {category} (freq: {frequency})")
            self._save_learned_data()
    
    def get_learned_keywords(self, category: str = None) -> List[str]:
        """Retorna keywords aprendidas (opcionalmente filtradas por categoria)"""
        if category:
            return [
                kw for kw, data in self.data["learned_keywords"].items()
                if data["category"] == category and data["status"] == "active"
            ]
        return [
            kw for kw, data in self.data["learned_keywords"].items()
            if data["status"] == "active"
        ]
    
    def get_top_searches(self, limit: int = 10) -> List[Dict]:
        """Retorna as buscas mais frequentes"""
        sorted_searches = sorted(
            self.data["search_frequency"].items(),
            key=lambda x: x[1]["count"],
            reverse=True
        )
        return [
            {
                "query": query,
                "count": data["count"],
                "category": data["category"],
                "confidence": data["confidence"]
            }
            for query, data in sorted_searches[:limit]
        ]
    
    def get_stats(self) -> Dict:
        """Retorna estatísticas do aprendizado"""
        return {
            "total_learned_keywords": len(self.data["learned_keywords"]),
            "total_unique_searches": len(self.data["search_frequency"]),
            "total_searches": sum(item["count"] for item in self.data["search_frequency"].values()),
            "last_updated": self.data.get("last_updated"),
            "top_categories": self._get_top_categories()
        }
    
    def _get_top_categories(self) -> Dict[str, int]:
        """Retorna categorias mais buscadas"""
        categories = {}
        for data in self.data["search_frequency"].values():
            cat = data["category"]
            categories[cat] = categories.get(cat, 0) + data["count"]
        return dict(sorted(categories.items(), key=lambda x: x[1], reverse=True))
    
    def reset_learning(self):
        """Reseta todo o aprendizado (usar com cuidado!)"""
        self.data = {
            "learned_keywords": {},
            "search_frequency": {},
            "last_updated": None
        }
        self._save_learned_data()
        logger.warning("⚠️ Aprendizado resetado!")
