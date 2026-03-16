"""
Script de teste para validar o classificador
Execute: python test_classifier.py
"""
from app.models.classifier import ProductClassifier

def test_classifier():
    """Testa o classificador com queries reais"""
    
    classifier = ProductClassifier()
    
    # Casos de teste
    test_cases = [
        # Carros
        "Fiat Uno 2020 usado",
        "Toyota Corolla 2023 novo",
        "Chevrolet Onix seminovo",
        
        # Motos
        "Honda CG 160 2022",
        "Yamaha Fazer 250 usada",
        
        # Smartphones
        "iPhone 13 Pro usado",
        "Samsung Galaxy S23 novo",
        "Xiaomi Redmi Note 12",
        
        # Eletrônicos
        "notebook gamer i7 16gb",
        "TV 50 polegadas smart",
        "PlayStation 5 usado",
        
        # Móveis
        "sofá 3 lugares usado",
        "mesa de jantar 6 cadeiras",
        
        # Eletrodomésticos
        "geladeira frost free",
        "fogão 5 bocas novo",
        
        # Moda
        "tênis Nike Air Max usado",
        "jaqueta de couro masculina",
        
        # Genérico
        "produto qualquer",
        "alguma coisa"
    ]
    
    print("=" * 80)
    print("🧪 TESTE DO CLASSIFICADOR")
    print("=" * 80)
    print()
    
    for i, query in enumerate(test_cases, 1):
        result = classifier.classify(query)
        
        print(f"{i}. Query: '{query}'")
        print(f"   ├─ Categoria: {result['category']}")
        print(f"   ├─ Confiança: {result['confidence']:.2f}")
        print(f"   ├─ Condição: {result['condition']}")
        print(f"   └─ Scrapers: {', '.join(result['recommended_scrapers'])}")
        print()
    
    print("=" * 80)
    print("✅ Teste concluído!")
    print("=" * 80)

if __name__ == "__main__":
    test_classifier()
