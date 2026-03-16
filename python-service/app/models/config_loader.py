"""
Config Loader - Carrega categorias, marcas e sinônimos de arquivo JSON
"""
import json
import os
from typing import Dict

class ConfigLoader:
    """Carrega configurações de categorias de arquivo JSON"""
    
    def __init__(self, config_path: str = None):
        if config_path is None:
            # Caminho padrão relativo ao arquivo
            current_dir = os.path.dirname(os.path.abspath(__file__))
            # Subir 2 níveis: models -> app -> python-service
            config_path = os.path.join(current_dir, "..", "..", "config", "categories.json")
        
        self.config_path = os.path.abspath(config_path)
        self.config = self._load_config()
    
    def _load_config(self) -> Dict:
        """Carrega arquivo JSON de configuração"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            raise FileNotFoundError(f"Arquivo de configuração não encontrado: {self.config_path}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Erro ao parsear JSON: {e}")
    
    def get_categories(self) -> Dict:
        """Retorna dicionário de categorias"""
        return self.config.get("categories", {})
    
    def get_brands(self) -> Dict:
        """Retorna dicionário de marcas"""
        return self.config.get("brands", {})
    
    def get_synonyms(self) -> Dict:
        """Retorna dicionário de sinônimos"""
        return self.config.get("synonyms", {})
    
    def reload(self):
        """Recarrega configuração do arquivo (útil para hot-reload)"""
        self.config = self._load_config()
