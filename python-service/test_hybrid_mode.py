"""
Teste do Modo Híbrido Inteligente
Valida detecção de campos faltantes e geração de perguntas
"""

from app.models.classifier import ProductClassifier

def test_hybrid_mode():
    classifier = ProductClassifier()
    
    print("=" * 80)
    print("TESTE DO MODO HÍBRIDO INTELIGENTE")
    print("=" * 80)
    
    test_cases = [
        # Caso 1: Query completa (não precisa perguntar)
        {
            "query": "iPhone 13 usado 256gb",
            "expected_missing": [],
            "expected_question": None
        },
        # Caso 2: Falta condição
        {
            "query": "iPhone 13",
            "expected_missing": ["condition"],
            "expected_question": "Você prefere **novo ou usado**?"
        },
        # Caso 3: Carro sem localização
        {
            "query": "Honda Civic 2020",
            "expected_missing": ["condition", "location"],
            "expected_question": "Você prefere **novo ou usado**?"
        },
        # Caso 4: Carro com condição mas sem localização
        {
            "query": "Honda Civic 2020 usado",
            "expected_missing": ["location"],
            "expected_question": "Em qual **cidade ou estado** você está procurando?"
        },
        # Caso 5: Carro completo
        {
            "query": "Honda Civic 2020 usado em São Paulo",
            "expected_missing": [],
            "expected_question": None
        },
        # Caso 6: Moto sem localização
        {
            "query": "Honda CG 160",
            "expected_missing": ["condition", "location"],
            "expected_question": "Você prefere **novo ou usado**?"
        },
        # Caso 7: Smartphone (não precisa localização)
        {
            "query": "Samsung Galaxy S23",
            "expected_missing": ["condition"],
            "expected_question": "Você prefere **novo ou usado**?"
        },
        # Caso 8: Produto usado genérico
        {
            "query": "notebook usado",
            "expected_missing": [],
            "expected_question": None
        }
    ]
    
    passed = 0
    failed = 0
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n{'-' * 80}")
        print(f"TESTE {i}: {test['query']}")
        print(f"{'-' * 80}")
        
        result = classifier.classify(test['query'])
        
        print(f"Categoria: {result['category']}")
        print(f"Condicao: {result['condition']}")
        print(f"Scrapers: {', '.join(result['recommended_scrapers'])}")
        print(f"Campos faltantes: {result['missing_fields']}")
        print(f"Pergunta sugerida: {result['suggested_question']}")
        
        # Validar
        missing_ok = result['missing_fields'] == test['expected_missing']
        question_ok = result['suggested_question'] == test['expected_question']
        
        if missing_ok and question_ok:
            print("PASSOU")
            passed += 1
        else:
            print("FALHOU")
            if not missing_ok:
                print(f"   Esperado missing_fields: {test['expected_missing']}")
                print(f"   Recebido missing_fields: {result['missing_fields']}")
            if not question_ok:
                print(f"   Esperado question: {test['expected_question']}")
                print(f"   Recebido question: {result['suggested_question']}")
            failed += 1
    
    print(f"\n{'=' * 80}")
    print(f"RESULTADO FINAL: {passed}/{len(test_cases)} testes passaram")
    print(f"Taxa de sucesso: {(passed/len(test_cases)*100):.1f}%")
    print(f"{'=' * 80}")

if __name__ == "__main__":
    test_hybrid_mode()
