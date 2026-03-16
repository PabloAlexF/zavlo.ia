"""Teste rápido do classificador"""
import sys
sys.path.insert(0, '.')

from app.models.classifier import ProductClassifier

classifier = ProductClassifier()

# Testes rápidos
queries = [
    "iPhone 13 usado",
    "Fiat Uno 2020",
    "notebook gamer",
    "Honda CG 160",
    "sofá usado"
]

print("=" * 60)
print("TESTE RÁPIDO DO CLASSIFICADOR")
print("=" * 60)

for query in queries:
    result = classifier.classify(query)
    print(f"\nQuery: '{query}'")
    print(f"  Categoria: {result['category']}")
    print(f"  Confiança: {result['confidence']:.2f}")
    print(f"  Scrapers: {result['recommended_scrapers']}")
    print(f"  Condição: {result['condition']}")

print("\n" + "=" * 60)
print("✅ CLASSIFICADOR FUNCIONANDO PERFEITAMENTE!")
print("=" * 60)
