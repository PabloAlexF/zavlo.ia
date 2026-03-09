# 🏗️ Arquitetura Completa Zavlo.ia

## 📊 Fluxo de Dados Correto

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                       │
│                    Port: 3000                               │
│  • Interface do usuário                                     │
│  • Formulário de busca                                      │
│  • Exibição de resultados                                   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP Request
                         │ GET /api/search?q=iphone
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND API (NestJS)                       │
│                    Port: 3001                               │
│  • Autenticação JWT                                         │
│  • Rate limiting                                            │
│  • Validação de dados                                       │
│  • Cache Redis                                              │
│  • Logs estruturados                                        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP Request
                         │ GET http://localhost:5000/search?q=iphone
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                PYTHON BOT (Flask API)                       │
│                    Port: 5000                               │
│  • Classificador de categoria                               │
│  • Google Shopping scraping                                 │
│  • Extração paralela (Playwright)                           │
│  • Normalização O(n)                                        │
│  • Ranking inteligente                                      │
│  • Cache com TTL                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Responsabilidades de Cada Camada

### 1️⃣ Frontend (Next.js)
**O que FAZ**:
- ✅ Renderizar interface
- ✅ Capturar input do usuário
- ✅ Exibir resultados
- ✅ Filtros visuais (client-side)
- ✅ Loading states

**O que NÃO FAZ**:
- ❌ Scraping
- ❌ Processamento pesado
- ❌ Lógica de negócio
- ❌ Acesso direto ao Python Bot

---

### 2️⃣ Backend NestJS
**O que FAZ**:
- ✅ Autenticação/Autorização
- ✅ Rate limiting
- ✅ Validação de dados
- ✅ Cache Redis
- ✅ Logs e métricas
- ✅ Orquestração de serviços
- ✅ Fallback para Firebase

**O que NÃO FAZ**:
- ❌ Scraping direto
- ❌ Processamento de IA
- ❌ Playwright/Selenium

---

### 3️⃣ Python Bot
**O que FAZ**:
- ✅ Scraping inteligente
- ✅ Classificação de categoria
- ✅ Extração paralela
- ✅ Normalização
- ✅ Ranking
- ✅ Cache próprio

**O que NÃO FAZ**:
- ❌ Autenticação
- ❌ Interface
- ❌ Persistência (Firebase)

---

## 🚀 Como Funciona na Prática

### Exemplo: Usuário busca "iPhone 13"

```
1. Frontend (Next.js)
   └─> Usuário digita "iPhone 13"
   └─> Chama: fetch('/api/search?q=iPhone 13')

2. Backend (NestJS)
   └─> Recebe request
   └─> Valida query
   └─> Verifica cache Redis
   └─> Se não tem cache:
       └─> Chama: http://localhost:5000/search?q=iPhone 13

3. Python Bot (Flask)
   └─> Recebe request
   └─> Classifica: "electronics"
   └─> Busca Google Shopping
   └─> Extrai 30 produtos em paralelo
   └─> Normaliza e deduplica
   └─> Rankeia por score
   └─> Retorna JSON

4. Backend (NestJS)
   └─> Recebe JSON do Python
   └─> Converte formato
   └─> Salva no cache Redis (1h)
   └─> Retorna para Frontend

5. Frontend (Next.js)
   └─> Recebe produtos
   └─> Renderiza lista
   └─> Exibe para usuário
```

---

## 📁 Estrutura de Arquivos

```
zavlo.ia/
├── frontend/                    # Next.js
│   ├── app/
│   │   ├── search/page.tsx     # Página de busca
│   │   └── api/                # API routes (proxy)
│   └── lib/
│       └── api.ts              # Cliente HTTP
│
├── backend/                     # NestJS
│   ├── src/
│   │   └── modules/
│   │       └── search/
│   │           ├── search.controller.ts  # GET /search/text
│   │           ├── search.service.ts     # Chama Python Bot
│   │           └── search.module.ts      # HttpModule
│   └── scraper/                # Python Bot
│       ├── api.py              # Flask API
│       ├── main.py             # Motor de busca
│       ├── classifier.py       # Categorias
│       ├── discover.py         # Google Shopping
│       ├── extractor.py        # Playwright
│       ├── normalizer.py       # Deduplicação
│       ├── ranker.py           # Score
│       └── cache.py            # Cache TTL
```

---

## 🔧 Configuração

### 1. Iniciar Python Bot
```bash
cd backend
start-python-bot.bat
# Roda em http://localhost:5000
```

### 2. Iniciar Backend NestJS
```bash
cd backend
npm run start:dev
# Roda em http://localhost:3001
```

### 3. Iniciar Frontend
```bash
cd frontend
npm run dev
# Roda em http://localhost:3000
```

---

## 🌐 Endpoints

### Frontend → Backend
```
GET http://localhost:3001/search/text?query=iphone+13
```

### Backend → Python Bot
```
GET http://localhost:5000/search?q=iphone+13
```

---

## 📊 Formato de Dados

### Python Bot → Backend
```json
{
  "query": "iphone 13",
  "category": "electronics",
  "total_found": 25,
  "unique_products": 20,
  "products": [
    {
      "title": "iPhone 13 128GB",
      "price": 3299.00,
      "image": "https://...",
      "url": "https://...",
      "source": "amazon.com.br",
      "score": 0.92,
      "quality_score": 0.85
    }
  ]
}
```

### Backend → Frontend
```json
{
  "results": [
    {
      "id": "abc123",
      "title": "iPhone 13 128GB",
      "price": 3299.00,
      "image": "https://...",
      "url": "https://...",
      "marketplace": "amazon.com.br",
      "category": "electronics",
      "score": 0.92
    }
  ],
  "total": 20
}
```

---

## ✅ Vantagens desta Arquitetura

1. **Separação de Responsabilidades**
   - Frontend: UI
   - Backend: Orquestração
   - Python: Processamento pesado

2. **Escalabilidade**
   - Cada camada pode escalar independente
   - Python Bot pode ter múltiplas instâncias

3. **Manutenibilidade**
   - Código organizado
   - Fácil debugar
   - Testes isolados

4. **Performance**
   - Cache em 2 níveis (Redis + Python)
   - Processamento paralelo
   - Fallback automático

5. **Segurança**
   - Frontend não acessa Python direto
   - Backend valida tudo
   - Rate limiting

---

## 🚨 Importante

**NUNCA faça**:
```typescript
// ❌ ERRADO - Frontend chamando Python direto
fetch('http://localhost:5000/search?q=...')
```

**SEMPRE faça**:
```typescript
// ✅ CORRETO - Frontend → Backend → Python
fetch('/api/search?q=...')
```

---

## 🎯 Resultado

Arquitetura profissional de 3 camadas:
- ✅ Frontend leve e rápido
- ✅ Backend robusto e seguro
- ✅ Python Bot especializado

**Pronto para produção!** 🚀
