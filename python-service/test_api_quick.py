"""
Teste Rápido da API - Modo Híbrido
"""

from app.models.classifier import ProductClassifier
import json

def test_api():
    classifier = ProductClassifier()
    
    print("=" * 80)
    print("TESTE RÁPIDO DA API - MODO HÍBRIDO")
    print("=" * 80)
    
    test_queries = [
        "iPhone 13",
        "iPhone 13 usado",
        "Honda Civic 2020",
        "Honda Civic 2020 usado em SP",
        "notebook",
    ]
    
    for query in test_queries:
        print(f"\n{'=' * 80}")
        print(f"Query: {query}")
        print(f"{'=' * 80}")
        
        result = classifier.classify(query)
        
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
        # Simular decisão do backend
        if result['missing_fields']:
            print(f"\nBOT: {result['suggested_question']}")
            print("AGUARDANDO RESPOSTA DO USUARIO...")
        else:
            print(f"\nEXECUTANDO SCRAPERS: {', '.join(result['recommended_scrapers'])}")

if __name__ == "__main__":
    test_api()
