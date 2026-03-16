"""
Zavlo.ia - Serviço de Classificação Inteligente
FastAPI service para classificar queries e rotear scrapers
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional
import logging

from app.models.classifier import ProductClassifier

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Inicializar FastAPI
app = FastAPI(
    title="Zavlo.ia Classification Service",
    description="Serviço de classificação inteligente para roteamento de scrapers",
    version="1.0.0"
)

# CORS (permitir requisições do NestJS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar classificador (carrega config/categories.json)
logger.info("Inicializando ProductClassifier...")
classifier = ProductClassifier()
logger.info(f"Classificador pronto! Categorias: {len(classifier.categories)}, Sinônimos: {len(classifier.synonyms)}")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Zavlo.ia Classification Service",
        "status": "online",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Health check detalhado"""
    return {
        "status": "healthy",
        "classifier": "ready",
        "scrapers": ["google_shopping", "webmotors", "olx", "mobiauto"]
    }

@app.post("/api/classify")
async def classify_query(request: dict):
    """Classifica a query do usuário"""
    try:
        query = request.get("query", "")
        
        if not query or not query.strip():
            raise HTTPException(status_code=400, detail="Query não pode ser vazia")
        
        result = classifier.classify(query)
        
        logger.info(f"✅ Classificação: {result['category']} (confiança: {result['confidence']})")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/categories")
async def list_categories():
    """Lista todas as categorias disponíveis"""
    categories_info = {}
    
    for category, data in classifier.categories.items():
        categories_info[category] = {
            "scrapers": data["scrapers"],
            "priority": data["priority"],
            "keywords_count": len(data["keywords"])
        }
    
    return {
        "total_categories": len(categories_info),
        "categories": categories_info
    }

@app.post("/api/test-classify")
async def test_classify(queries: List[str]):
    """Testa múltiplas queries"""
    results = []
    
    for query in queries:
        try:
            result = classifier.classify(query)
            results.append({
                "query": query,
                "result": result
            })
        except Exception as e:
            results.append({
                "query": query,
                "error": str(e)
            })
    
    return {
        "total_queries": len(queries),
        "results": results
    }

@app.post("/api/reload-config")
async def reload_config():
    """Hot-reload de configurações sem reiniciar servidor"""
    try:
        classifier.reload_config()
        logger.info("✅ Configurações recarregadas com sucesso!")
        return {
            "status": "success",
            "message": "Configurações recarregadas",
            "categories": len(classifier.categories),
            "synonyms": len(classifier.synonyms)
        }
    except Exception as e:
        logger.error(f"❌ Erro ao recarregar: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
