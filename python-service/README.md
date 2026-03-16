# 🐍 Zavlo.ia - Serviço de Classificação Python

Serviço FastAPI responsável por classificar queries de usuários e rotear para os scrapers apropriados.

## 📋 Funcionalidades

- ✅ Classificação inteligente baseada em keywords
- ✅ Detecção de condição (novo/usado)
- ✅ Roteamento automático de scrapers
- ✅ API REST com FastAPI
- ✅ Logging estruturado
- ✅ Pronto para escalar com ML no futuro

## 🚀 Instalação

### 1. Criar ambiente virtual

```bash
cd python-service
python -m venv venv
```

### 2. Ativar ambiente virtual

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Instalar dependências

```bash
pip install -r requirements.txt
```

### 4. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

## 🏃 Executar

### Modo desenvolvimento (com reload)

```bash
python main.py
```

Ou usando uvicorn diretamente:

```bash
uvicorn main:app --reload --port 8001
```

### Modo produção

```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --workers 4
```

## 📡 Endpoints

### `POST /api/classify`

Classifica a query do usuário e retorna scrapers recomendados.

**Request:**
```json
{
  "query": "iPhone 13 Pro usado",
  "context": {
    "previous_category": "smartphone"
  }
}
```

**Response:**
```json
{
  "category": "smartphone",
  "confidence": 0.92,
  "recommended_scrapers": ["olx", "google_shopping"],
  "condition": "used",
  "all_scores": {
    "smartphone": 0.85,
    "marketplace_used": 0.15
  }
}
```

### `GET /api/categories`

Lista todas as categorias disponíveis.

**Response:**
```json
{
  "total_categories": 8,
  "categories": {
    "car": {
      "scrapers": ["webmotors", "mobiauto"],
      "priority": 10,
      "keywords_count": 25
    },
    ...
  }
}
```

### `POST /api/test-classify`

Testa classificação de múltiplas queries (útil para debugging).

**Request:**
```json
[
  "iPhone 13 usado",
  "Fiat Uno 2020",
  "notebook gamer"
]
```

### `GET /health`

Health check do serviço.

## 🎯 Categorias Suportadas

| Categoria | Scrapers | Exemplos |
|-----------|----------|----------|
| `car` | webmotors, mobiauto | "Fiat Uno 2020", "Toyota Corolla" |
| `motorcycle` | webmotors, mobiauto | "Honda CG 160", "Yamaha Fazer" |
| `smartphone` | google_shopping, olx | "iPhone 13", "Samsung Galaxy S23" |
| `electronics` | google_shopping, olx | "notebook gamer", "TV 50 polegadas" |
| `furniture` | olx, google_shopping | "sofá 3 lugares", "mesa de jantar" |
| `appliance` | google_shopping, olx | "geladeira frost free", "fogão 5 bocas" |
| `fashion` | google_shopping, olx | "tênis Nike", "jaqueta de couro" |
| `marketplace_used` | olx | Qualquer produto com "usado" na query |
| `general` | google_shopping | Fallback para queries genéricas |

## 🧪 Testes

### Testar classificação via curl

```bash
curl -X POST "http://localhost:8001/api/classify" \
  -H "Content-Type: application/json" \
  -d '{"query": "iPhone 13 usado"}'
```

### Testar múltiplas queries

```bash
curl -X POST "http://localhost:8001/api/test-classify" \
  -H "Content-Type: application/json" \
  -d '["iPhone 13", "Fiat Uno", "notebook gamer"]'
```

## 📊 Lógica de Classificação

### 1. Normalização
- Remove acentos
- Converte para lowercase
- Remove stopwords

### 2. Detecção de Keywords
- Busca keywords específicas de cada categoria
- Calcula score baseado em matches
- Aplica boost para marcas conhecidas

### 3. Detecção de Condição
- Identifica "novo", "usado", "seminovo"
- Prioriza OLX para produtos usados
- Prioriza Google Shopping para produtos novos

### 4. Cálculo de Confiança
- Score normalizado (0-1)
- Baseado em quantidade de matches
- Considera prioridade da categoria

## 🔄 Integração com NestJS

O NestJS deve chamar este serviço antes de executar os scrapers:

```typescript
// src/modules/classification/classification.service.ts
async classifyQuery(query: string) {
  const response = await fetch('http://localhost:8001/api/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  
  const result = await response.json();
  
  // result.recommended_scrapers = ["webmotors", "mobiauto"]
  // Agora o NestJS sabe quais scrapers executar
  
  return result;
}
```

## 🚀 Próximos Passos

### Fase 1 (Atual) ✅
- [x] Classificação baseada em keywords
- [x] Detecção de condição
- [x] Roteamento de scrapers
- [x] API REST básica

### Fase 2 (Futuro)
- [ ] Adicionar cache Redis
- [ ] Implementar rate limiting
- [ ] Adicionar métricas (Prometheus)
- [ ] Dockerizar serviço

### Fase 3 (ML - Opcional)
- [ ] Treinar modelo de classificação
- [ ] Implementar NER para entidades
- [ ] Adicionar embeddings para similaridade
- [ ] Sistema de feedback para melhorar classificação

## 📝 Logs

O serviço gera logs estruturados:

```
2024-01-15 10:30:45 - app.routers.classify_router - INFO - 📥 Recebendo classificação: query='iPhone 13 usado'
2024-01-15 10:30:45 - app.models.classifier - INFO - Classificando query: 'iPhone 13 usado' (normalizada: 'iphone 13 usado')
2024-01-15 10:30:45 - app.models.classifier - INFO -   Resultado: {'category': 'smartphone', 'confidence': 0.92, ...}
2024-01-15 10:30:45 - app.routers.classify_router - INFO - ✅ Classificação concluída: category=smartphone, confidence=0.92
```

## 🐛 Troubleshooting

### Erro: "ModuleNotFoundError: No module named 'fastapi'"
```bash
pip install -r requirements.txt
```

### Erro: "Address already in use"
```bash
# Mudar porta no main.py ou matar processo
lsof -ti:8001 | xargs kill -9  # Linux/Mac
netstat -ano | findstr :8001   # Windows
```

### Classificação incorreta
- Verificar logs para entender o score
- Adicionar keywords específicas em `classifier.py`
- Ajustar prioridades das categorias

## 📞 Suporte

Para dúvidas ou problemas, abrir issue no repositório.
