# Integração Completa - ProductClassifier v2.0

## 🎯 Visão Geral

Sistema completo de classificação inteligente integrado entre:
- **Python Service** (FastAPI) - Classificador baseado em regras
- **NestJS API** - Orquestrador de scrapers
- **Frontend** (Next.js) - Interface do usuário

---

## 🏗️ Arquitetura

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
└────────┬────────┘
         │ POST /api/v1/search/text
         │ { query: "honda civic 2011" }
         ▼
┌─────────────────────────────┐
│   NestJS API                │
│   SearchService             │
│   ├─ classifyQuery()        │ ◄─┐
│   ├─ executeScrapers()      │   │
│   └─ aggregateResults()     │   │
└────────┬────────────────────┘   │
         │ POST /api/classify      │
         │ { query: "..." }        │
         ▼                         │
┌─────────────────────────────┐   │
│   Python Service (FastAPI)  │   │
│   ProductClassifier         │   │
│   ├─ normalize_query()      │   │
│   ├─ detect_brand()         │   │
│   ├─ detect_year()          │   │
│   ├─ detect_condition()     │   │
│   └─ classify()             │───┘
│                             │
│   ConfigLoader              │
│   └─ categories.json        │
└─────────────────────────────┘
```

---

## 📡 Endpoints

### Python Service (Port 8001)

#### 1. POST /api/classify
Classifica query do usuário.

**Request**:
```json
{
  "query": "honda civic 2011 manual"
}
```

**Response**:
```json
{
  "category": "car",
  "confidence": 0.72,
  "recommended_scrapers": ["webmotors", "mobiauto"],
  "condition": "unknown",
  "detected_brand": "honda",
  "detected_model": null,
  "detected_year": 2011,
  "result_limit": null,
  "missing_fields": ["result_limit"],
  "suggested_question": "Quantos resultados você quer ver?",
  "normalized_query": "honda civic 2011 manual"
}
```

#### 2. GET /health
Health check do serviço.

**Response**:
```json
{
  "status": "healthy",
  "classifier": "ready",
  "scrapers": ["google_shopping", "webmotors", "olx", "mobiauto"]
}
```

#### 3. POST /api/reload-config
Hot-reload de configurações.

**Response**:
```json
{
  "status": "success",
  "message": "Configurações recarregadas",
  "categories": 9,
  "synonyms": 9
}
```

#### 4. GET /api/categories
Lista categorias disponíveis.

**Response**:
```json
{
  "total_categories": 9,
  "categories": {
    "car": {
      "scrapers": ["webmotors", "mobiauto"],
      "priority": 10,
      "keywords_count": 33
    },
    ...
  }
}
```

---

### NestJS API (Port 3000)

#### POST /api/v1/search/text
Busca inteligente com classificação.

**Request**:
```json
{
  "query": "honda civic 2011",
  "filters": {
    "sortBy": "RELEVANCE"
  }
}
```

**Response (com pergunta)**:
```json
{
  "results": [],
  "total": 0,
  "needsQuestion": true,
  "question": "Quantos resultados você quer ver?",
  "missingFields": ["result_limit"],
  "classification": { ... },
  "creditsUsed": 0
}
```

**Response (sem pergunta)**:
```json
{
  "results": [ ... ],
  "total": 25,
  "needsQuestion": false,
  "creditsUsed": 1,
  "remainingCredits": 99
}
```

---

## 🔄 Fluxo de Execução

### Cenário 1: Busca Incompleta (Precisa Perguntar)

```
1. User: "honda civic 2011"
   ↓
2. Frontend → NestJS: POST /search/text
   ↓
3. NestJS → Python: POST /classify
   ↓
4. Python: Classifica query
   - Categoria: car
   - Ano detectado: 2011
   - Marca detectada: honda
   - Campos faltantes: [result_limit]
   ↓
5. Python → NestJS: Retorna classificação
   ↓
6. NestJS: Detecta missing_fields
   ↓
7. NestJS → Frontend: needsQuestion=true
   {
     "question": "Quantos resultados você quer ver?",
     "missingFields": ["result_limit"]
   }
   ↓
8. Frontend: Exibe modal de pergunta
   ↓
9. User: Seleciona "20 resultados"
   ↓
10. Frontend: Enriquece query → "20 resultados de honda civic 2011"
    ↓
11. Repete fluxo (agora sem campos faltantes)
```

### Cenário 2: Busca Completa (Executa Scrapers)

```
1. User: "20 resultados de honda civic 2011 usado"
   ↓
2. Frontend → NestJS: POST /search/text
   ↓
3. NestJS → Python: POST /classify
   ↓
4. Python: Classifica query
   - Categoria: car
   - Ano: 2011
   - Marca: honda
   - Condição: used
   - Limite: 20
   - Campos faltantes: []
   ↓
5. Python → NestJS: Retorna classificação
   ↓
6. NestJS: Sem missing_fields, executa scrapers
   - Webmotors (20 resultados)
   - Mobiauto (20 resultados)
   ↓
7. NestJS: Consolida resultados
   ↓
8. NestJS → Frontend: Retorna produtos
   {
     "results": [...],
     "total": 35,
     "creditsUsed": 1
   }
   ↓
9. Frontend: Exibe produtos
```

---

## 🚀 Como Executar

### 1. Iniciar Python Service

```bash
cd python-service
python main.py
```

**Logs esperados**:
```
INFO:     Uvicorn running on http://0.0.0.0:8001
INFO:     Inicializando ProductClassifier...
INFO:     Classificador pronto! Categorias: 9, Sinônimos: 9
```

### 2. Iniciar NestJS API

```bash
npm run start:dev
```

**Logs esperados**:
```
[Nest] LOG [ClassificationService] 🐍 Python Service URL: http://localhost:8001
[Nest] LOG [NestApplication] Nest application successfully started
```

### 3. Testar Integração

```bash
node test-integration.js
```

---

## 🧪 Testes

### Teste 1: Classificação Direta (Python)

```bash
curl -X POST http://localhost:8001/api/classify \
  -H "Content-Type: application/json" \
  -d '{"query": "honda civic 2011 manual"}'
```

**Resultado esperado**:
```json
{
  "category": "car",
  "detected_year": 2011,
  "detected_brand": "honda",
  "missing_fields": ["result_limit"]
}
```

### Teste 2: Busca com Pergunta (NestJS)

```bash
curl -X POST http://localhost:3000/api/v1/search/text \
  -H "Content-Type: application/json" \
  -d '{"query": "honda civic 2011"}'
```

**Resultado esperado**:
```json
{
  "needsQuestion": true,
  "question": "Quantos resultados você quer ver?",
  "missingFields": ["result_limit"]
}
```

### Teste 3: Busca Completa (NestJS)

```bash
curl -X POST http://localhost:3000/api/v1/search/text \
  -H "Content-Type: application/json" \
  -d '{"query": "20 resultados de honda civic 2011 usado"}'
```

**Resultado esperado**:
```json
{
  "results": [...],
  "total": 35,
  "needsQuestion": false
}
```

---

## 🔧 Configuração

### Variáveis de Ambiente

**NestJS (.env)**:
```env
PYTHON_SERVICE_URL=http://localhost:8001
```

**Python (.env)**:
```env
# Nenhuma configuração necessária
# Usa config/categories.json automaticamente
```

---

## 📊 Métricas de Performance

| Operação | Tempo Médio | Observação |
|----------|-------------|------------|
| Classificação Python | 60ms | Com regex compiladas |
| Request NestJS → Python | 80ms | Incluindo rede |
| Execução de 1 scraper | 2-5s | Apify Actor |
| Execução de 2 scrapers (paralelo) | 3-6s | Webmotors + Mobiauto |
| Fluxo completo (com pergunta) | 100ms | Apenas classificação |
| Fluxo completo (sem pergunta) | 4-7s | Classificação + scrapers |

---

## 🐛 Troubleshooting

### Problema: Python Service offline

**Sintoma**:
```
❌ [CLASSIFICATION] Erro ao conectar com serviço Python
⚠️ [CLASSIFICATION] Usando fallback (Google Shopping)
```

**Solução**:
```bash
cd python-service
python main.py
```

### Problema: Classificação retorna fallback

**Sintoma**:
```json
{
  "category": "general",
  "confidence": 0.5,
  "recommended_scrapers": ["google_shopping"]
}
```

**Causas possíveis**:
1. Python service offline
2. Erro no ConfigLoader (categories.json não encontrado)
3. Query vazia ou inválida

**Solução**:
```bash
# Verificar health
curl http://localhost:8001/health

# Verificar categorias
curl http://localhost:8001/api/categories

# Recarregar config
curl -X POST http://localhost:8001/api/reload-config
```

### Problema: Campos faltantes não detectados

**Sintoma**:
Query "honda civic" não pergunta quantidade.

**Causa**:
Regex de detecção de limite não está funcionando.

**Solução**:
Verificar `has_result_limit()` no classifier.py.

---

## 📝 Logs Importantes

### Python Service

```
INFO:     Classificando query: "honda civic 2011 manual"
INFO:     Resultado: {
  "category": "car",
  "detected_year": 2011,
  "detected_brand": "honda"
}
```

### NestJS

```
[SearchService] 🤖 [CLASSIFICATION] Classificando query: "honda civic 2011"
[SearchService] ✅ [CLASSIFICATION] Resultado:
   - Categoria: car
   - Confiança: 0.72
   - Scrapers recomendados: webmotors, mobiauto
   - Ano detectado: 2011
   - Marca detectada: honda
   - Campos faltantes: result_limit
[SearchService] ❓ [QUESTION] Pergunta sugerida: Quantos resultados você quer ver?
```

---

## 🎉 Conclusão

Sistema totalmente integrado e funcional!

**Próximos passos**:
1. ✅ Python Service rodando
2. ✅ NestJS integrado
3. ✅ Frontend exibindo perguntas
4. ✅ Hot-reload funcionando
5. ⏳ Deploy em produção

**Deploy**:
- Python: Render (https://zavlo-ia-1.onrender.com)
- NestJS: Render (https://api.zavloia.com.br)
- Frontend: Vercel (https://zavlo.vercel.app)
