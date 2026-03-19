"""
Zavlo.ia - Serviço de Classificação Inteligente
FastAPI service para classificar queries e rotear scrapers
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional
import logging

from app.models.classifier import ProductClassifier
from app.utils.keyword_learner import KeywordLearner

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

import os

# CORS (permitir requisições do NestJS)
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

# Inicializar classificador (carrega config/categories.json)
logger.info("Inicializando ProductClassifier...")

# Inicializar sistema de aprendizado PRIMEIRO
logger.info("Inicializando KeywordLearner...")
learner = KeywordLearner()
stats = learner.get_stats()
logger.info(f"Learner pronto! Keywords aprendidas: {stats['total_learned_keywords']}, Buscas únicas: {stats['total_unique_searches']}")

# Passar learner para o classificador
classifier = ProductClassifier(learner=learner)
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
        "scrapers": ["google_shopping", "webmotors", "olx", "mercadolivre"]
    }

@app.post("/api/classify")
async def classify_query(request: dict):
    """Classifica a query do usuário"""
    try:
        query = request.get("query", "")
        context = request.get("context", {})  # 🆕 RECEBER CONTEXTO DO USUÁRIO
        
        if not query or not query.strip():
            raise HTTPException(status_code=400, detail="Query não pode ser vazia")
        
        # 🆕 PASSAR CONTEXTO PARA O CLASSIFICADOR
        result = classifier.classify(query, user_context=context)
        
        logger.info(f"✅ Classificação: {result['category']} (confiança: {result['confidence']})")
        if context.get('location'):
            logger.info(f"📍 Localização do usuário: {context['location']}")
        
        # 🎓 APRENDIZADO AUTOMÁTICO: Registrar busca
        if not result.get('is_question') and not result.get('is_greeting'):
            learner.record_search(
                query=query,
                category=result['category'],
                confidence=result['confidence']
            )
        
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

@app.get("/api/learning/stats")
async def get_learning_stats():
    """🎓 Retorna estatísticas do aprendizado automático"""
    return learner.get_stats()

@app.get("/api/learning/top-searches")
async def get_top_searches(limit: int = 20):
    """🔥 Retorna as buscas mais frequentes"""
    return {
        "top_searches": learner.get_top_searches(limit=limit)
    }

@app.get("/api/learning/learned-keywords")
async def get_learned_keywords(category: Optional[str] = None):
    """🎯 Retorna keywords aprendidas automaticamente"""
    keywords = learner.get_learned_keywords(category=category)
    return {
        "category": category or "all",
        "count": len(keywords),
        "keywords": keywords
    }

@app.post("/api/learning/export")
async def export_learned_keywords():
    """📤 Exporta keywords aprendidas para categories.json (ADMIN)"""
    try:
        learned_by_category = {}
        
        # Agrupar por categoria
        for kw, data in learner.data["learned_keywords"].items():
            if data["status"] != "active":
                continue
            
            category = data["category"]
            if category not in learned_by_category:
                learned_by_category[category] = []
            
            learned_by_category[category].append({
                "keyword": kw,
                "frequency": data["frequency"],
                "learned_at": data["learned_at"]
            })
        
        return {
            "status": "success",
            "learned_by_category": learned_by_category,
            "total_keywords": sum(len(kws) for kws in learned_by_category.values()),
            "message": "Revise e adicione manualmente em config/categories.json"
        }
    except Exception as e:
        logger.error(f"❌ Erro ao exportar: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/learning/reset")
async def reset_learning():
    """⚠️ Reseta todo o aprendizado (usar com cuidado!)"""
    learner.reset_learning()
    return {
        "status": "success",
        "message": "Aprendizado resetado"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
