"""
Suite Completa de Testes - Zavlo.ia Classification Service
Execute: python run_all_tests.py
"""
import sys
import json
from typing import List, Dict
from app.models.classifier import ProductClassifier

class TestRunner:
    def __init__(self):
        self.classifier = ProductClassifier()
        self.passed = 0
        self.failed = 0
        self.results = []
    
    def assert_equal(self, actual, expected, test_name):
        """Verifica se valores são iguais"""
        if actual == expected:
            self.passed += 1
            self.results.append({
                "test": test_name,
                "status": "✅ PASS",
                "expected": expected,
                "actual": actual
            })
            return True
        else:
            self.failed += 1
            self.results.append({
                "test": test_name,
                "status": "❌ FAIL",
                "expected": expected,
                "actual": actual
            })
            return False
    
    def assert_in(self, item, collection, test_name):
        """Verifica se item está na coleção"""
        if item in collection:
            self.passed += 1
            self.results.append({
                "test": test_name,
                "status": "✅ PASS",
                "expected": f"{item} in {collection}",
                "actual": "Found"
            })
            return True
        else:
            self.failed += 1
            self.results.append({
                "test": test_name,
                "status": "❌ FAIL",
                "expected": f"{item} in {collection}",
                "actual": "Not found"
            })
            return False
    
    def assert_greater(self, actual, threshold, test_name):
        """Verifica se valor é maior que threshold"""
        if actual > threshold:
            self.passed += 1
            self.results.append({
                "test": test_name,
                "status": "✅ PASS",
                "expected": f"> {threshold}",
                "actual": actual
            })
            return True
        else:
            self.failed += 1
            self.results.append({
                "test": test_name,
                "status": "❌ FAIL",
                "expected": f"> {threshold}",
                "actual": actual
            })
            return False
    
    def print_summary(self):
        """Imprime resumo dos testes"""
        print("\n" + "=" * 80)
        print("📊 RESUMO DOS TESTES")
        print("=" * 80)
        print(f"✅ Passou: {self.passed}")
        print(f"❌ Falhou: {self.failed}")
        print(f"📈 Taxa de sucesso: {(self.passed / (self.passed + self.failed) * 100):.1f}%")
        print("=" * 80)
        
        if self.failed > 0:
            print("\n❌ TESTES QUE FALHARAM:")
            for result in self.results:
                if result["status"] == "❌ FAIL":
                    print(f"  • {result['test']}")
                    print(f"    Esperado: {result['expected']}")
                    print(f"    Obtido: {result['actual']}")
        
        return self.failed == 0

def test_car_classification(runner: TestRunner):
    """Testa classificação de carros"""
    print("\n🚗 TESTE 1: Classificação de Carros")
    print("-" * 80)
    
    test_cases = [
        ("Fiat Uno 2020", "car", ["webmotors", "mercadolivre"]),
        ("Toyota Corolla usado", "car", ["webmotors", "mercadolivre"]),
        ("Chevrolet Onix seminovo", "car", ["webmotors", "mercadolivre"]),
        ("Honda Civic 2023 novo", "car", ["webmotors", "mercadolivre"]),
        ("Volkswagen Gol", "car", ["webmotors", "mercadolivre"]),
    ]
    
    for query, expected_category, expected_scrapers in test_cases:
        result = runner.classifier.classify(query)
        print(f"\n  Query: '{query}'")
        print(f"  Categoria: {result['category']} (confiança: {result['confidence']:.2f})")
        print(f"  Scrapers: {result['recommended_scrapers']}")
        
        runner.assert_equal(
            result['category'], 
            expected_category, 
            f"Categoria de '{query}'"
        )
        
        for scraper in expected_scrapers:
            runner.assert_in(
                scraper,
                result['recommended_scrapers'],
                f"Scraper '{scraper}' para '{query}'"
            )

def test_motorcycle_classification(runner: TestRunner):
    """Testa classificação de motos"""
    print("\n🏍️ TESTE 2: Classificação de Motos")
    print("-" * 80)
    
    test_cases = [
        ("Honda CG 160", "motorcycle", ["webmotors", "mercadolivre"]),
        ("Yamaha Fazer 250 usada", "motorcycle", ["webmotors", "mercadolivre"]),
        ("Suzuki GSX-R", "motorcycle", ["webmotors", "mercadolivre"]),
    ]
    
    for query, expected_category, expected_scrapers in test_cases:
        result = runner.classifier.classify(query)
        print(f"\n  Query: '{query}'")
        print(f"  Categoria: {result['category']} (confiança: {result['confidence']:.2f})")
        
        runner.assert_equal(
            result['category'], 
            expected_category, 
            f"Categoria de '{query}'"
        )

def test_smartphone_classification(runner: TestRunner):
    """Testa classificação de smartphones"""
    print("\n📱 TESTE 3: Classificação de Smartphones")
    print("-" * 80)
    
    test_cases = [
        ("iPhone 13 Pro", "smartphone", ["google_shopping", "olx"]),
        ("Samsung Galaxy S23 usado", "smartphone", ["olx", "google_shopping"]),
        ("Xiaomi Redmi Note 12", "smartphone", ["google_shopping", "olx"]),
        ("Motorola Edge 30", "smartphone", ["google_shopping", "olx"]),
    ]
    
    for query, expected_category, expected_scrapers in test_cases:
        result = runner.classifier.classify(query)
        print(f"\n  Query: '{query}'")
        print(f"  Categoria: {result['category']} (confiança: {result['confidence']:.2f})")
        print(f"  Condição: {result['condition']}")
        
        runner.assert_equal(
            result['category'], 
            expected_category, 
            f"Categoria de '{query}'"
        )
        
        # Verificar se pelo menos um scraper esperado está presente
        has_scraper = any(s in result['recommended_scrapers'] for s in expected_scrapers)
        if has_scraper:
            runner.passed += 1
        else:
            runner.failed += 1

def test_electronics_classification(runner: TestRunner):
    """Testa classificação de eletrônicos"""
    print("\n💻 TESTE 4: Classificação de Eletrônicos")
    print("-" * 80)
    
    test_cases = [
        ("notebook gamer i7", "electronics"),
        ("TV 50 polegadas smart", "electronics"),
        ("PlayStation 5", "electronics"),
        ("iPad Pro 2023", "electronics"),
        ("monitor 27 polegadas", "electronics"),
    ]
    
    for query, expected_category in test_cases:
        result = runner.classifier.classify(query)
        print(f"\n  Query: '{query}'")
        print(f"  Categoria: {result['category']} (confiança: {result['confidence']:.2f})")
        
        runner.assert_equal(
            result['category'], 
            expected_category, 
            f"Categoria de '{query}'"
        )

def test_condition_detection(runner: TestRunner):
    """Testa detecção de condição (novo/usado)"""
    print("\n🏷️ TESTE 5: Detecção de Condição")
    print("-" * 80)
    
    test_cases = [
        ("iPhone 13 usado", "used"),
        ("Samsung Galaxy novo", "new"),
        ("notebook seminovo", "used"),
        ("TV lacrada", "new"),
        ("carro 0km", "new"),
        ("moto segunda mão", "used"),
        ("PlayStation 5", "unknown"),  # Sem condição especificada
    ]
    
    for query, expected_condition in test_cases:
        result = runner.classifier.classify(query)
        print(f"\n  Query: '{query}'")
        print(f"  Condição detectada: {result['condition']}")
        
        runner.assert_equal(
            result['condition'], 
            expected_condition, 
            f"Condição de '{query}'"
        )

def test_used_product_priority(runner: TestRunner):
    """Testa se produtos usados priorizam OLX"""
    print("\n🔄 TESTE 6: Priorização OLX para Produtos Usados")
    print("-" * 80)
    
    test_cases = [
        "iPhone 13 usado",
        "notebook gamer usado",
        "TV 50 polegadas usada",
        "sofá usado",
    ]
    
    for query in test_cases:
        result = runner.classifier.classify(query)
        print(f"\n  Query: '{query}'")
        print(f"  Scrapers: {result['recommended_scrapers']}")
        
        # OLX deve estar na lista
        runner.assert_in(
            "olx",
            result['recommended_scrapers'],
            f"OLX para '{query}'"
        )
        
        # OLX deve ser o primeiro (prioridade)
        if result['recommended_scrapers'][0] == "olx":
            runner.passed += 1
            print(f"  ✅ OLX é prioritário")
        else:
            runner.failed += 1
            print(f"  ❌ OLX não é prioritário (esperado primeiro)")

def test_confidence_scores(runner: TestRunner):
    """Testa se scores de confiança são razoáveis"""
    print("\n📊 TESTE 7: Scores de Confiança")
    print("-" * 80)
    
    test_cases = [
        ("Fiat Uno 2020", 0.7),  # Deve ter alta confiança
        ("iPhone 13 Pro", 0.7),
        ("notebook gamer", 0.6),
        ("produto qualquer", 0.3),  # Deve ter baixa confiança
    ]
    
    for query, min_confidence in test_cases:
        result = runner.classifier.classify(query)
        print(f"\n  Query: '{query}'")
        print(f"  Confiança: {result['confidence']:.2f} (mínimo esperado: {min_confidence})")
        
        runner.assert_greater(
            result['confidence'],
            min_confidence,
            f"Confiança de '{query}' > {min_confidence}"
        )

def test_furniture_classification(runner: TestRunner):
    """Testa classificação de móveis"""
    print("\n🛋️ TESTE 8: Classificação de Móveis")
    print("-" * 80)
    
    test_cases = [
        ("sofá 3 lugares", "furniture"),
        ("mesa de jantar", "furniture"),
        ("guarda-roupa", "furniture"),
        ("cama box casal", "furniture"),
    ]
    
    for query, expected_category in test_cases:
        result = runner.classifier.classify(query)
        print(f"\n  Query: '{query}'")
        print(f"  Categoria: {result['category']} (confiança: {result['confidence']:.2f})")
        
        runner.assert_equal(
            result['category'], 
            expected_category, 
            f"Categoria de '{query}'"
        )

def test_appliance_classification(runner: TestRunner):
    """Testa classificação de eletrodomésticos"""
    print("\n🏠 TESTE 9: Classificação de Eletrodomésticos")
    print("-" * 80)
    
    test_cases = [
        ("geladeira frost free", "appliance"),
        ("fogão 5 bocas", "appliance"),
        ("microondas", "appliance"),
        ("lavadora de roupas", "appliance"),
    ]
    
    for query, expected_category in test_cases:
        result = runner.classifier.classify(query)
        print(f"\n  Query: '{query}'")
        print(f"  Categoria: {result['category']} (confiança: {result['confidence']:.2f})")
        
        runner.assert_equal(
            result['category'], 
            expected_category, 
            f"Categoria de '{query}'"
        )

def test_fashion_classification(runner: TestRunner):
    """Testa classificação de moda"""
    print("\n👟 TESTE 10: Classificação de Moda")
    print("-" * 80)
    
    test_cases = [
        ("tênis Nike Air Max", "fashion"),
        ("jaqueta de couro", "fashion"),
        ("sapato social", "fashion"),
        ("camisa polo", "fashion"),
    ]
    
    for query, expected_category in test_cases:
        result = runner.classifier.classify(query)
        print(f"\n  Query: '{query}'")
        print(f"  Categoria: {result['category']} (confiança: {result['confidence']:.2f})")
        
        runner.assert_equal(
            result['category'], 
            expected_category, 
            f"Categoria de '{query}'"
        )

def test_normalization(runner: TestRunner):
    """Testa normalização de texto"""
    print("\n🔤 TESTE 11: Normalização de Texto")
    print("-" * 80)
    
    test_cases = [
        ("Sofá", "sofa"),
        ("Geladeira", "geladeira"),
        ("Móvel", "movel"),
        ("Veículo", "veiculo"),
        ("Televisão", "televisao"),
    ]
    
    for original, expected in test_cases:
        normalized = runner.classifier.normalize_query(original)
        print(f"\n  Original: '{original}'")
        print(f"  Normalizado: '{normalized}'")
        
        runner.assert_equal(
            normalized,
            expected,
            f"Normalização de '{original}'"
        )

def test_edge_cases(runner: TestRunner):
    """Testa casos extremos"""
    print("\n⚠️ TESTE 12: Casos Extremos")
    print("-" * 80)
    
    test_cases = [
        ("", "general"),  # Query vazia
        ("   ", "general"),  # Apenas espaços
        ("xyz123", "general"),  # Texto sem sentido
        ("a", "general"),  # Texto muito curto
    ]
    
    for query, expected_category in test_cases:
        try:
            result = runner.classifier.classify(query)
            print(f"\n  Query: '{query}' (vazia/inválida)")
            print(f"  Categoria: {result['category']}")
            
            runner.assert_equal(
                result['category'],
                expected_category,
                f"Fallback para query '{query}'"
            )
        except Exception as e:
            print(f"\n  Query: '{query}'")
            print(f"  ❌ Erro: {str(e)}")
            runner.failed += 1

def test_real_world_queries(runner: TestRunner):
    """Testa queries do mundo real (como usuários digitariam)"""
    print("\n🌍 TESTE 13: Queries do Mundo Real")
    print("-" * 80)
    
    test_cases = [
        "quero comprar um iphone 13 usado",
        "preciso de um carro fiat uno",
        "to procurando notebook gamer barato",
        "onde acho tv 50 polegadas",
        "moto honda cg 160 seminova",
    ]
    
    for query in test_cases:
        result = runner.classifier.classify(query)
        print(f"\n  Query: '{query}'")
        print(f"  Categoria: {result['category']} (confiança: {result['confidence']:.2f})")
        print(f"  Scrapers: {result['recommended_scrapers']}")
        
        # Apenas verificar se não deu erro e retornou algo válido
        if result['category'] and result['recommended_scrapers']:
            runner.passed += 1
        else:
            runner.failed += 1

def main():
    """Executa todos os testes"""
    print("=" * 80)
    print("🧪 ZAVLO.IA - SUITE COMPLETA DE TESTES")
    print("=" * 80)
    
    runner = TestRunner()
    
    # Executar todos os testes
    test_car_classification(runner)
    test_motorcycle_classification(runner)
    test_smartphone_classification(runner)
    test_electronics_classification(runner)
    test_condition_detection(runner)
    test_used_product_priority(runner)
    test_confidence_scores(runner)
    test_furniture_classification(runner)
    test_appliance_classification(runner)
    test_fashion_classification(runner)
    test_normalization(runner)
    test_edge_cases(runner)
    test_real_world_queries(runner)
    
    # Imprimir resumo
    success = runner.print_summary()
    
    # Retornar código de saída
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
