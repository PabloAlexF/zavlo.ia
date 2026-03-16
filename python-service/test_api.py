"""
Teste de API - Testa endpoints FastAPI
Requer servidor rodando em http://localhost:8001
Execute: python test_api.py
"""
import requests
import json
import sys
from typing import Dict, List

API_URL = "http://localhost:8001"

class APITester:
    def __init__(self):
        self.passed = 0
        self.failed = 0
    
    def test_health_check(self):
        """Testa endpoint de health check"""
        print("\n🏥 TESTE 1: Health Check")
        print("-" * 80)
        
        try:
            response = requests.get(f"{API_URL}/health", timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                print(f"  ✅ Status: {response.status_code}")
                print(f"  📊 Response: {json.dumps(data, indent=2)}")
                self.passed += 1
            else:
                print(f"  ❌ Status inesperado: {response.status_code}")
                self.failed += 1
        except Exception as e:
            print(f"  ❌ Erro: {str(e)}")
            self.failed += 1
    
    def test_classify_endpoint(self):
        """Testa endpoint de classificação"""
        print("\n🔍 TESTE 2: Endpoint /api/classify")
        print("-" * 80)
        
        test_cases = [
            {
                "query": "iPhone 13 usado",
                "expected_category": "smartphone",
                "expected_condition": "used"
            },
            {
                "query": "Fiat Uno 2020",
                "expected_category": "car",
                "expected_condition": "unknown"
            },
            {
                "query": "notebook gamer",
                "expected_category": "electronics",
                "expected_condition": "unknown"
            }
        ]
        
        for i, test_case in enumerate(test_cases, 1):
            print(f"\n  Teste {i}: '{test_case['query']}'")
            
            try:
                response = requests.post(
                    f"{API_URL}/api/classify",
                    json={"query": test_case["query"]},
                    headers={"Content-Type": "application/json"},
                    timeout=5
                )
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"    ✅ Status: {response.status_code}")
                    print(f"    📊 Categoria: {data['category']}")
                    print(f"    📊 Confiança: {data['confidence']}")
                    print(f"    📊 Condição: {data['condition']}")
                    print(f"    📊 Scrapers: {data['recommended_scrapers']}")
                    
                    # Validar resposta
                    if data['category'] == test_case['expected_category']:
                        print(f"    ✅ Categoria correta")
                        self.passed += 1
                    else:
                        print(f"    ❌ Categoria incorreta (esperado: {test_case['expected_category']})")
                        self.failed += 1
                    
                    if data['condition'] == test_case['expected_condition']:
                        print(f"    ✅ Condição correta")
                        self.passed += 1
                    else:
                        print(f"    ❌ Condição incorreta (esperado: {test_case['expected_condition']})")
                        self.failed += 1
                else:
                    print(f"    ❌ Status inesperado: {response.status_code}")
                    print(f"    📄 Response: {response.text}")
                    self.failed += 2
            except Exception as e:
                print(f"    ❌ Erro: {str(e)}")
                self.failed += 2
    
    def test_categories_endpoint(self):
        """Testa endpoint de listagem de categorias"""
        print("\n📋 TESTE 3: Endpoint /api/categories")
        print("-" * 80)
        
        try:
            response = requests.get(f"{API_URL}/api/categories", timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                print(f"  ✅ Status: {response.status_code}")
                print(f"  📊 Total de categorias: {data['total_categories']}")
                print(f"  📊 Categorias disponíveis:")
                
                for category, info in data['categories'].items():
                    print(f"    • {category}: {info['scrapers']}")
                
                self.passed += 1
            else:
                print(f"  ❌ Status inesperado: {response.status_code}")
                self.failed += 1
        except Exception as e:
            print(f"  ❌ Erro: {str(e)}")
            self.failed += 1
    
    def test_test_classify_endpoint(self):
        """Testa endpoint de teste em lote"""
        print("\n🧪 TESTE 4: Endpoint /api/test-classify")
        print("-" * 80)
        
        queries = [
            "iPhone 13",
            "Fiat Uno",
            "notebook gamer"
        ]
        
        try:
            response = requests.post(
                f"{API_URL}/api/test-classify",
                json=queries,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"  ✅ Status: {response.status_code}")
                print(f"  📊 Total de queries testadas: {data['total_queries']}")
                
                for result in data['results']:
                    print(f"\n    Query: '{result['query']}'")
                    if 'result' in result:
                        print(f"      Categoria: {result['result']['category']}")
                        print(f"      Scrapers: {result['result']['recommended_scrapers']}")
                    else:
                        print(f"      ❌ Erro: {result.get('error', 'Unknown')}")
                
                self.passed += 1
            else:
                print(f"  ❌ Status inesperado: {response.status_code}")
                self.failed += 1
        except Exception as e:
            print(f"  ❌ Erro: {str(e)}")
            self.failed += 1
    
    def test_invalid_requests(self):
        """Testa requisições inválidas"""
        print("\n⚠️ TESTE 5: Requisições Inválidas")
        print("-" * 80)
        
        # Query vazia
        print("\n  Teste 1: Query vazia")
        try:
            response = requests.post(
                f"{API_URL}/api/classify",
                json={"query": ""},
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            
            if response.status_code == 400:
                print(f"    ✅ Retornou erro 400 como esperado")
                self.passed += 1
            else:
                print(f"    ❌ Status inesperado: {response.status_code}")
                self.failed += 1
        except Exception as e:
            print(f"    ❌ Erro: {str(e)}")
            self.failed += 1
        
        # Sem campo query
        print("\n  Teste 2: Sem campo 'query'")
        try:
            response = requests.post(
                f"{API_URL}/api/classify",
                json={},
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            
            if response.status_code == 422:  # Validation error
                print(f"    ✅ Retornou erro 422 como esperado")
                self.passed += 1
            else:
                print(f"    ❌ Status inesperado: {response.status_code}")
                self.failed += 1
        except Exception as e:
            print(f"    ❌ Erro: {str(e)}")
            self.failed += 1
    
    def test_performance(self):
        """Testa performance da API"""
        print("\n⚡ TESTE 6: Performance")
        print("-" * 80)
        
        import time
        
        queries = [
            "iPhone 13",
            "Fiat Uno",
            "notebook gamer",
            "sofá usado",
            "geladeira"
        ]
        
        times = []
        
        for query in queries:
            try:
                start = time.time()
                response = requests.post(
                    f"{API_URL}/api/classify",
                    json={"query": query},
                    headers={"Content-Type": "application/json"},
                    timeout=5
                )
                end = time.time()
                
                elapsed = (end - start) * 1000  # ms
                times.append(elapsed)
                
                print(f"  Query: '{query}' - {elapsed:.2f}ms")
            except Exception as e:
                print(f"  ❌ Erro em '{query}': {str(e)}")
        
        if times:
            avg_time = sum(times) / len(times)
            print(f"\n  📊 Tempo médio: {avg_time:.2f}ms")
            
            if avg_time < 100:  # Menos de 100ms
                print(f"  ✅ Performance excelente!")
                self.passed += 1
            elif avg_time < 500:  # Menos de 500ms
                print(f"  ⚠️ Performance aceitável")
                self.passed += 1
            else:
                print(f"  ❌ Performance ruim (> 500ms)")
                self.failed += 1
    
    def print_summary(self):
        """Imprime resumo dos testes"""
        print("\n" + "=" * 80)
        print("📊 RESUMO DOS TESTES DE API")
        print("=" * 80)
        print(f"✅ Passou: {self.passed}")
        print(f"❌ Falhou: {self.failed}")
        
        if self.passed + self.failed > 0:
            success_rate = (self.passed / (self.passed + self.failed)) * 100
            print(f"📈 Taxa de sucesso: {success_rate:.1f}%")
        
        print("=" * 80)
        
        return self.failed == 0

def main():
    """Executa todos os testes de API"""
    print("=" * 80)
    print("🧪 ZAVLO.IA - TESTES DE API")
    print("=" * 80)
    print(f"🌐 URL: {API_URL}")
    print("=" * 80)
    
    # Verificar se servidor está rodando
    try:
        response = requests.get(f"{API_URL}/", timeout=5)
        print("✅ Servidor está rodando!")
    except Exception as e:
        print(f"❌ Servidor não está rodando!")
        print(f"   Erro: {str(e)}")
        print(f"\n💡 Inicie o servidor com: python main.py")
        sys.exit(1)
    
    tester = APITester()
    
    # Executar testes
    tester.test_health_check()
    tester.test_classify_endpoint()
    tester.test_categories_endpoint()
    tester.test_test_classify_endpoint()
    tester.test_invalid_requests()
    tester.test_performance()
    
    # Resumo
    success = tester.print_summary()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
