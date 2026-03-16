# Modo Híbrido Inteligente - Documentação

## 📋 Visão Geral

O **Modo Híbrido Inteligente** combina busca direta com perguntas contextuais, oferecendo a melhor experiência para o usuário:

- ✅ **Busca direta** quando a query tem informação suficiente
- ❓ **Perguntas curtas** quando falta informação relevante
- 🎯 **Máximo 1-2 perguntas** para não quebrar o fluxo

## 🎯 Comportamento

### 1. Query Completa → Busca Direta

**Exemplo:**
```
Usuário: "iPhone 13 usado 256gb"

Python retorna:
{
  "category": "smartphone",
  "condition": "used",
  "recommended_scrapers": ["olx"],
  "missing_fields": [],
  "suggested_question": null
}

✅ Sistema executa scrapers diretamente
```

### 2. Falta Condição → Pergunta

**Exemplo:**
```
Usuário: "iPhone 13"

Python retorna:
{
  "category": "smartphone",
  "condition": "unknown",
  "recommended_scrapers": ["google_shopping", "olx"],
  "missing_fields": ["condition"],
  "suggested_question": "Você prefere **novo ou usado**?"
}

❓ Bot pergunta antes de buscar
```

### 3. Veículos sem Localização → Pergunta

**Exemplo:**
```
Usuário: "Honda Civic 2020 usado"

Python retorna:
{
  "category": "car",
  "condition": "used",
  "recommended_scrapers": ["webmotors", "mobiauto"],
  "missing_fields": ["location"],
  "suggested_question": "Em qual **cidade ou estado** você está procurando?"
}

❓ Bot pergunta localização
```

## 🔍 Prioridade de Perguntas

O sistema segue esta ordem de prioridade:

1. **Condição (novo/usado)** - Mais importante para direcionar scrapers
2. **Localização** - Apenas para veículos (carros/motos)

**Regra:** Máximo 1 pergunta por vez para não sobrecarregar o usuário.

## 📊 Campos Detectados

### `missing_fields`

Array de strings indicando o que falta:
- `"condition"` - Não detectou se é novo ou usado
- `"location"` - Não detectou cidade/estado (apenas para veículos)

### `suggested_question`

String com a pergunta formatada para o usuário, ou `null` se não precisa perguntar.

## 🚀 Fluxo de Integração

### Backend (NestJS)

```typescript
// SearchService.searchByText()

const classification = await this.classificationService.classifyQuery(query);

// Verificar se precisa fazer pergunta
if (classification.missing_fields && classification.missing_fields.length > 0) {
  return {
    results: [],
    total: 0,
    needsQuestion: true,
    question: classification.suggested_question,
    missingFields: classification.missing_fields,
    classification: classification
  };
}

// Caso contrário, executar scrapers normalmente
const scrapers = classification.recommended_scrapers;
// ... executar scrapers em paralelo
```

### Frontend (React/Next.js)

```typescript
const response = await searchAPI(query);

if (response.needsQuestion) {
  // Mostrar pergunta ao usuário
  showQuestion(response.question);
  
  // Aguardar resposta do usuário
  const userAnswer = await waitForUserAnswer();
  
  // Refazer busca com informação adicional
  const newQuery = `${query} ${userAnswer}`;
  const finalResponse = await searchAPI(newQuery);
  
  // Mostrar resultados
  showResults(finalResponse.results);
} else {
  // Mostrar resultados diretamente
  showResults(response.results);
}
```

## 🧪 Testes

### Casos de Teste Validados (100% de sucesso)

| Query | Categoria | Condição | Missing Fields | Pergunta |
|-------|-----------|----------|----------------|----------|
| "iPhone 13 usado 256gb" | smartphone | used | [] | null |
| "iPhone 13" | smartphone | unknown | ["condition"] | "Você prefere **novo ou usado**?" |
| "Honda Civic 2020" | car | unknown | ["condition", "location"] | "Você prefere **novo ou usado**?" |
| "Honda Civic 2020 usado" | car | used | ["location"] | "Em qual **cidade ou estado** você está procurando?" |
| "Honda Civic 2020 usado em São Paulo" | car | used | [] | null |
| "Honda CG 160" | motorcycle | unknown | ["condition", "location"] | "Você prefere **novo ou usado**?" |
| "Samsung Galaxy S23" | smartphone | unknown | ["condition"] | "Você prefere **novo ou usado**?" |
| "notebook usado" | marketplace_used | used | [] | null |

### Executar Testes

```bash
cd python-service
python test_hybrid_mode.py
```

## 📝 Detecção de Localização

O sistema detecta localização através de padrões:

- Estados: `sp`, `rj`, `mg`, `rs`, etc.
- Cidades: `são paulo`, `rio de janeiro`, `belo horizonte`, etc.
- Padrões: `em [cidade]`, `em [estado]`

**Exemplos:**
- ✅ "Honda Civic em SP" → localização detectada
- ✅ "Honda Civic São Paulo" → localização detectada
- ❌ "Honda Civic" → localização NÃO detectada

## 🎨 Formatação de Perguntas

As perguntas usam **markdown bold** para destacar opções:

- "Você prefere **novo ou usado**?"
- "Em qual **cidade ou estado** você está procurando?"

Isso permite que o frontend renderize com destaque visual.

## 🔄 Fluxo Completo

```
1. Usuário digita query
   ↓
2. Backend classifica via Python
   ↓
3. Python retorna classification com missing_fields
   ↓
4. Backend verifica missing_fields
   ↓
5a. Se vazio → Executar scrapers
5b. Se não vazio → Retornar pergunta
   ↓
6. Frontend mostra pergunta (se necessário)
   ↓
7. Usuário responde
   ↓
8. Nova busca com query enriquecida
   ↓
9. Mostrar resultados
```

## 🚀 Próximos Passos

1. ✅ Python classifier com missing_fields (CONCLUÍDO)
2. ✅ NestJS SearchService adaptado (CONCLUÍDO)
3. ✅ Interfaces TypeScript atualizadas (CONCLUÍDO)
4. ⏳ Frontend para mostrar perguntas (PENDENTE)
5. ⏳ Gerenciamento de contexto conversacional (PENDENTE)

## 📊 Métricas de Sucesso

- **Taxa de acerto:** 100% (8/8 testes)
- **Perguntas por busca:** Máximo 1-2
- **Tempo de resposta:** < 2s (classificação + scrapers)
- **Satisfação do usuário:** A medir após implementação frontend

## 🔧 Configuração

Nenhuma configuração adicional necessária. O sistema funciona automaticamente com:

- Python service rodando em `http://localhost:8001`
- NestJS backend rodando em `http://localhost:3001`

## 📚 Referências

- [classifier.py](./python-service/app/models/classifier.py) - Lógica de classificação
- [classification.interface.ts](./src/modules/classification/classification.interface.ts) - Interfaces TypeScript
- [search.service.ts](./src/modules/search/search.service.ts) - Integração NestJS
- [test_hybrid_mode.py](./python-service/test_hybrid_mode.py) - Testes automatizados
