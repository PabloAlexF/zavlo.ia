"""
Teste de Integração - ConfigLoader + ProductClassifier
"""
import sys
import os

# Adicionar path do projeto
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.models.classifier import ProductClassifier

def test_classifier_with_config():
    """Testa classificador carregando configurações do JSON"""
    
    print("=" * 60)
    print("TESTE: ProductClassifier com ConfigLoader")
    print("=" * 60)
    
    # Inicializar classificador (carrega JSON automaticamente)
    classifier = ProductClassifier()
    
    print("\n[OK] Classificador inicializado com sucesso!")
    print(f"   - Categorias carregadas: {len(classifier.categories)}")
    print(f"   - Sinonimos carregados: {len(classifier.synonyms)}")
    print(f"   - Marcas de carros: {len(classifier.car_brands)}")
    print(f"   - Marcas de motos: {len(classifier.moto_brands)}")
    
    # Teste 1: Honda Civic 2011 manual
    print("\n" + "=" * 60)
    print("TESTE 1: honda civic 2011 manual")
    print("=" * 60)
    result = classifier.classify("honda civic 2011 manual")
    print(f"Categoria: {result['category']}")
    print(f"Confiança: {result['confidence']}")
    print(f"Scrapers: {result['recommended_scrapers']}")
    print(f"Ano detectado: {result.get('detected_year')}")
    print(f"Marca detectada: {result.get('detected_brand')}")
    print(f"Campos faltantes: {result['missing_fields']}")
    print(f"Pergunta sugerida: {result['suggested_question']}")
    
    # Teste 2: 15 resultados de iphone usado
    print("\n" + "=" * 60)
    print("TESTE 2: 15 resultados de iphone usado")
    print("=" * 60)
    result = classifier.classify("15 resultados de iphone usado")
    print(f"Categoria: {result['category']}")
    print(f"Confiança: {result['confidence']}")
    print(f"Scrapers: {result['recommended_scrapers']}")
    print(f"Condição: {result['condition']}")
    print(f"Limite de resultados: {result.get('result_limit')}")
    print(f"Campos faltantes: {result['missing_fields']}")
    
    # Teste 3: Sinônimo (celular → smartphone)
    print("\n" + "=" * 60)
    print("TESTE 3: celular samsung galaxy")
    print("=" * 60)
    result = classifier.classify("celular samsung galaxy")
    print(f"Query normalizada: {result['normalized_query']}")
    print(f"Categoria: {result['category']}")
    print(f"Confiança: {result['confidence']}")
    print(f"Modelo detectado: {result.get('detected_model')}")
    
    # Teste 4: Hot-reload
    print("\n" + "=" * 60)
    print("TESTE 4: Hot-reload de configurações")
    print("=" * 60)
    try:
        classifier.reload_config()
        print("[OK] Configuracoes recarregadas com sucesso!")
    except Exception as e:
        print(f"[ERRO] Erro ao recarregar: {e}")
    
    print("\n" + "=" * 60)
    print("TODOS OS TESTES CONCLUIDOS!")
    print("=" * 60)

if __name__ == "__main__":
    test_classifier_with_config()
