"""
Teste de Detecção de Perguntas - Chatbot Intelligence
Valida se o classificador detecta corretamente perguntas sobre:
- Créditos
- Recarga
- Planos
- Uso do sistema
"""

import sys
import os

# Adicionar path do projeto
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.models.classifier import ProductClassifier

def test_credits_questions():
    """Testa detecção de perguntas sobre créditos"""
    print("\n" + "="*60)
    print("TESTE: Perguntas sobre Creditos")
    print("="*60)
    
    classifier = ProductClassifier()
    
    test_cases = [
        "quantos creditos tenho?",
        "qual meu saldo?",
        "meus creditos",
        "ver creditos",
        "consultar creditos",
        "quanto de credito tenho?",
        "creditos restantes",
        "saldo de creditos"
    ]
    
    passed = 0
    failed = 0
    
    for query in test_cases:
        result = classifier.classify(query)
        is_correct = result.get('question_type') == 'credits'
        
        status = "PASS" if is_correct else "FAIL"
        print(f"{status} | '{query}' -> {result.get('question_type', 'N/A')}")
        
        if is_correct:
            passed += 1
        else:
            failed += 1
    
    print(f"\nResultado: {passed}/{len(test_cases)} passaram")
    return failed == 0

def test_recharge_questions():
    """Testa detecção de perguntas sobre recarga"""
    print("\n" + "="*60)
    print("TESTE: Perguntas sobre Recarga")
    print("="*60)
    
    classifier = ProductClassifier()
    
    test_cases = [
        "como compro creditos?",
        "onde faco recarga?",
        "comprar mais creditos",
        "preciso de creditos",
        "quero mais creditos",
        "como recarregar?",
        "onde comprar creditos?",
        "adquirir creditos"
    ]
    
    passed = 0
    failed = 0
    
    for query in test_cases:
        result = classifier.classify(query)
        is_correct = result.get('question_type') == 'recharge'
        
        status = "PASS" if is_correct else "FAIL"
        print(f"{status} | '{query}' -> {result.get('question_type', 'N/A')}")
        
        if is_correct:
            passed += 1
        else:
            failed += 1
    
    print(f"\nResultado: {passed}/{len(test_cases)} passaram")
    return failed == 0

def test_plans_questions():
    """Testa detecção de perguntas sobre planos"""
    print("\n" + "="*60)
    print("TESTE: Perguntas sobre Planos")
    print("="*60)
    
    classifier = ProductClassifier()
    
    test_cases = [
        "quais sao os planos?",
        "quanto custa o plano?",
        "como assinar?",
        "plano mensal",
        "contratar plano",
        "planos disponiveis",
        "valor do plano",
        "assinar plano pro",
        "upgrade de plano"
    ]
    
    passed = 0
    failed = 0
    
    for query in test_cases:
        result = classifier.classify(query)
        is_correct = result.get('question_type') == 'plans'
        
        status = "PASS" if is_correct else "FAIL"
        print(f"{status} | '{query}' -> {result.get('question_type', 'N/A')}")
        
        if is_correct:
            passed += 1
        else:
            failed += 1
    
    print(f"\nResultado: {passed}/{len(test_cases)} passaram")
    return failed == 0

def test_usage_questions():
    """Testa detecção de perguntas sobre uso do sistema"""
    print("\n" + "="*60)
    print("TESTE: Perguntas sobre Uso do Sistema")
    print("="*60)
    
    classifier = ProductClassifier()
    
    test_cases = [
        "como funciona?",
        "como buscar produtos?",
        "ajuda",
        "estou perdido",
        "como usar?",
        "o que fazer?",
        "help"
    ]
    
    passed = 0
    failed = 0
    
    for query in test_cases:
        result = classifier.classify(query)
        is_correct = result.get('question_type') == 'usage'
        
        status = "PASS" if is_correct else "FAIL"
        print(f"{status} | '{query}' -> {result.get('question_type', 'N/A')}")
        
        if is_correct:
            passed += 1
        else:
            failed += 1
    
    print(f"\nResultado: {passed}/{len(test_cases)} passaram")
    return failed == 0

def test_product_search_not_confused():
    """Testa que buscas de produtos não são confundidas com perguntas"""
    print("\n" + "="*60)
    print("TESTE: Buscas de Produtos (nao devem ser perguntas)")
    print("="*60)
    
    classifier = ProductClassifier()
    
    test_cases = [
        "iphone 13",
        "honda civic 2020",
        "notebook dell",
        "samsung galaxy s23",
        "fogao industrial"
    ]
    
    passed = 0
    failed = 0
    
    for query in test_cases:
        result = classifier.classify(query)
        is_correct = not result.get('is_question', False)
        
        status = "PASS" if is_correct else "FAIL"
        print(f"{status} | '{query}' -> is_question={result.get('is_question', False)}")
        
        if is_correct:
            passed += 1
        else:
            failed += 1
    
    print(f"\nResultado: {passed}/{len(test_cases)} passaram")
    return failed == 0

def run_all_tests():
    """Executa todos os testes"""
    print("\n" + "="*60)
    print("INICIANDO TESTES DE INTELIGENCIA DO CHATBOT")
    print("="*60)
    
    results = []
    
    results.append(("Creditos", test_credits_questions()))
    results.append(("Recarga", test_recharge_questions()))
    results.append(("Planos", test_plans_questions()))
    results.append(("Uso", test_usage_questions()))
    results.append(("Produtos", test_product_search_not_confused()))
    
    print("\n" + "="*60)
    print("RESUMO FINAL")
    print("="*60)
    
    for test_name, passed in results:
        status = "PASSOU" if passed else "FALHOU"
        print(f"{status} | {test_name}")
    
    all_passed = all(result[1] for result in results)
    
    if all_passed:
        print("\nTODOS OS TESTES PASSARAM!")
        return 0
    else:
        print("\nALGUNS TESTES FALHARAM")
        return 1

if __name__ == "__main__":
    exit_code = run_all_tests()
    sys.exit(exit_code)
