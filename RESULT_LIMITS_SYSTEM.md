# Sistema de Limites de Resultados - Zavlo.IA

## 📊 Custos Internos (CONFIDENCIAL - NÃO EXIBIR AO USUÁRIO)

**Custos Apify por busca**:
- **10 resultados**: R$ 0,23
- **20 resultados**: R$ 0,43

**Margem de lucro**: Cobrada via sistema de créditos dos planos

## 🎯 Fluxo de Perguntas (Ordem de Prioridade)

### 1️⃣ QUANTIDADE DE RESULTADOS (SEMPRE PRIMEIRO)
**Pergunta**: "Quantos resultados você quer ver?"
- 💰 **10 resultados** (R$ 0,23) - Busca rápida
- 💎 **20 resultados** (R$ 0,43) - Busca completa

**Detecção**:
- Método: `has_result_limit(query)`
- Padrões: "10 resultados", "20 produtos", "dez itens", "vinte"
- Extração: `extract_result_limit(query)` → retorna 10 ou 20

### 2️⃣ CONDIÇÃO (NOVO/USADO)
**Pergunta**: "Você prefere **novo ou usado**?"
- Só pergunta DEPOIS que o usuário escolheu a quantidade
- Detecta: "usado", "seminovo", "novo", "lacrado"

### 3️⃣ LOCALIZAÇÃO (APENAS VEÍCULOS)
**Pergunta**: "Em qual **cidade ou estado** você está procurando?"
- Só pergunta DEPOIS de quantidade + condição
- Apenas para categorias: `car`, `motorcycle`
- Detecta: estados (SP, RJ, MG...), cidades (São Paulo, Rio...)

## 🔄 Exemplo de Fluxo Completo

```
Usuário: "quero um iPhone 13"
Bot: "Quantos resultados você quer ver?"
     📊 10 resultados - Busca rápida
     🎯 20 resultados - Busca completa

Usuário: "20"
Bot: "Você prefere **novo ou usado**?"

Usuário: "usado"
Bot: [Executa busca com 20 resultados de iPhones usados]
```

## 🛠️ Implementação Técnica

### Backend Python (classifier.py)

```python
def has_result_limit(query: str) -> bool:
    """Detecta se usuário especificou quantidade"""
    patterns = [
        r'\b10\s*(resultados|produtos|itens)?\b',
        r'\b20\s*(resultados|produtos|itens)?\b',
        r'\bdez\s*(resultados|produtos|itens)?\b',
        r'\bvinte\s*(resultados|produtos|itens)?\b',
    ]
    return any(re.search(p, query) for p in patterns)

def extract_result_limit(query: str) -> int | None:
    """Extrai quantidade (10 ou 20)"""
    if re.search(r'\b10\b', query) or re.search(r'\bdez\b', query):
        return 10
    if re.search(r'\b20\b', query) or re.search(r'\bvinte\b', query):
        return 20
    return None
```

### Ordem de Prioridade no classify()

```python
missing_fields = []
suggested_question = None

# 1. QUANTIDADE (SEMPRE PRIMEIRO)
if not self.has_result_limit(query):
    missing_fields.append("result_limit")
    suggested_question = "Quantos resultados você quer ver?\n\n📊 **10 resultados** - Busca rápida\n🎯 **20 resultados** - Busca completa"

# 2. CONDIÇÃO (SÓ SE JÁ TEM LIMITE)
elif condition == "unknown":
    missing_fields.append("condition")
    suggested_question = "Você prefere **novo ou usado**?"

# 3. LOCALIZAÇÃO (SÓ SE JÁ TEM LIMITE + CONDIÇÃO)
elif best_category in ["car", "motorcycle"]:
    if not self.detect_location(query):
        missing_fields.append("location")
        suggested_question = "Em qual **cidade ou estado** você está procurando?"
```

### Backend NestJS (search.service.ts)

```typescript
const resultLimit = classification.result_limit || 20; // Padrão 20

// Usar em todos os scrapers
this.googleShoppingService.search(query, resultLimit, sortBy)
this.olxService.search(query, resultLimit)
this.webmotorsService.search(query, resultLimit)
```

### Frontend (QuestionModal.tsx)

```tsx
const isResultLimitQuestion = missingFields.includes('result_limit');

{isResultLimitQuestion && (
  <>
    {[
      { value: '10', label: '10 resultados', price: 'R$ 0,23', desc: 'Busca rápida' },
      { value: '20', label: '20 resultados', price: 'R$ 0,43', desc: 'Busca completa' }
    ].map((option) => (
      <button onClick={() => setSelectedAnswer(option.value)}>
        {option.label} - {option.price}
      </button>
    ))}
  </>
)}
```

## 📋 Checklist de Implementação

✅ **Backend Python**:
- [x] Método `has_result_limit()`
- [x] Método `extract_result_limit()`
- [x] Prioridade 1: pergunta de quantidade
- [x] Campo `result_limit` no retorno
- [x] Campo `guided_response` no retorno

✅ **Backend NestJS**:
- [x] Interface `ClassificationResult` atualizada
- [x] SearchService usando `result_limit`
- [x] Todos scrapers respeitando limite

✅ **Frontend**:
- [x] QuestionModal com opção de quantidade
- [x] Exibição de preços (R$ 0,23 / R$ 0,43)
- [x] Ícone 📊 para pergunta de quantidade
- [x] Integração com fluxo híbrido

## 🎨 UI/UX

**Modal de Quantidade**:
```
📊 Quantos resultados você quer ver?

┌─────────────────────────────────────┐
│ 10 resultados                     ✓  │
│ Busca rápida                        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 20 resultados                      │
│ Busca completa                     │
└─────────────────────────────────────┘

[Pular]  [Continuar]
```

## 💰 Controle de Custos (INTERNO)

**Objetivo**: Limitar custos do Apify mantendo margem de lucro

**Custos Apify (CONFIDENCIAL)**:
- 10 resultados: R$ 0,23
- 20 resultados: R$ 0,43

**Cobrança**: Via sistema de créditos dos planos (não exibir custos diretos)

**Benefícios**:
1. Usuário escolhe quantidade sem ver custos internos
2. Controle de custos operacionais
3. Margem de lucro garantida via planos
4. Transparência: usuário sabe quantos resultados terá
