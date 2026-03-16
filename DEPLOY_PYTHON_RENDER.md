# Deploy Python Service no Render

## 📋 Passo a Passo

### 1. Criar Novo Web Service no Render

1. Acesse https://dashboard.render.com
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório GitHub
4. Configure:
   - **Name**: `zavlo-python-classifier` (ou outro nome)
   - **Region**: Same as NestJS (Oregon, etc)
   - **Branch**: `main` (ou sua branch)
   - **Root Directory**: `python-service`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 2. Variáveis de Ambiente

No Render, adicione:
```
PYTHON_ENV=production
```

### 3. Plano

- **Free Tier**: OK para testes (dorme após 15min inatividade)
- **Starter ($7/mês)**: Recomendado para produção (sempre ativo)

### 4. Deploy

Clique em "Create Web Service" e aguarde o deploy.

### 5. Obter URL

Após deploy, você terá uma URL tipo:
```
https://zavlo-python-classifier.onrender.com
```

---

## 🔗 Configurar NestJS Backend

### Atualizar Variável de Ambiente

No seu serviço NestJS no Render, adicione/atualize:

```
PYTHON_SERVICE_URL=https://zavlo-python-classifier.onrender.com
```

**Importante**: Sem `/api` no final!

### Redeploy NestJS

Após adicionar a variável, faça redeploy do NestJS:
1. Vá no dashboard do serviço NestJS
2. Clique em "Manual Deploy" → "Deploy latest commit"

---

## 🌐 Configurar Frontend (Vercel)

### Atualizar Variável de Ambiente

Na Vercel, certifique-se que tem:

```
NEXT_PUBLIC_API_URL=https://seu-backend-nestjs.onrender.com/api/v1
```

**Importante**: Com `/api/v1` no final!

### Redeploy Frontend

Após atualizar variável:
1. Vá no dashboard da Vercel
2. Clique em "Deployments"
3. Clique nos 3 pontos do último deploy → "Redeploy"

---

## ✅ Verificar Funcionamento

### 1. Testar Python Service

```bash
curl https://zavlo-python-classifier.onrender.com/health
```

Deve retornar:
```json
{"status": "ok"}
```

### 2. Testar Classificação

```bash
curl -X POST https://zavlo-python-classifier.onrender.com/api/classify \
  -H "Content-Type: application/json" \
  -d '{"query": "iPhone 13"}'
```

Deve retornar:
```json
{
  "category": "smartphone",
  "condition": "unknown",
  "missing_fields": ["condition"],
  "suggested_question": "Você prefere **novo ou usado**?"
}
```

### 3. Testar NestJS → Python

```bash
curl https://seu-backend-nestjs.onrender.com/api/v1/classification/health
```

Deve retornar status do Python service.

### 4. Testar Frontend

1. Abra seu site na Vercel
2. Vá para o chat
3. Digite "iPhone 13"
4. Modal deve aparecer com pergunta

---

## 🐛 Troubleshooting

### Erro: "Python service offline"

**Causa**: Python service dormindo (Free tier)  
**Solução**: 
- Upgrade para Starter ($7/mês)
- Ou aguarde ~30s para acordar

### Erro: "CORS"

**Causa**: Python não configurado para aceitar requests do NestJS  
**Solução**: Adicionar no `main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar domínios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Erro: "Connection timeout"

**Causa**: URL incorreta ou serviço não iniciado  
**Solução**: 
- Verificar URL no Render dashboard
- Verificar logs do Python service
- Testar URL diretamente no navegador

---

## 📊 Arquitetura Final

```
┌─────────────────────────────────────────────────────────┐
│ Frontend (Vercel)                                       │
│ https://zavlo.vercel.app                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│ NestJS Backend (Render)                                 │
│ https://zavlo-backend.onrender.com                      │
│                                                          │
│ Variável: PYTHON_SERVICE_URL                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Python Classifier (Render)                              │
│ https://zavlo-python-classifier.onrender.com            │
│                                                          │
│ Endpoints:                                              │
│ - GET  /health                                          │
│ - POST /api/classify                                    │
│ - GET  /api/categories                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 💰 Custos

- **Python Service**: $7/mês (Starter) ou Free (com sleep)
- **NestJS Backend**: Já existente
- **Frontend Vercel**: Já existente

**Total adicional**: $0 (Free) ou $7/mês (Starter)

---

## 🚀 Recomendação

Para **produção**, use **Starter ($7/mês)** no Python service para:
- ✅ Sem sleep (sempre ativo)
- ✅ Resposta instantânea
- ✅ Melhor experiência do usuário

Para **testes**, Free tier funciona, mas:
- ⚠️ Primeira request leva ~30s (acordar)
- ⚠️ Dorme após 15min inatividade
