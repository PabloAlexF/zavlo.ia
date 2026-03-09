# 🚀 Guia Rápido - Iniciar Sistema Completo

## ✅ Checklist de Inicialização

### 1️⃣ Python Bot (OBRIGATÓRIO)
```bash
cd backend\scraper
pip install -r requirements.txt
python -m playwright install chromium
python api.py
```
**Status**: ✅ Rodando em http://localhost:5000

---

### 2️⃣ Backend NestJS (OBRIGATÓRIO)
```bash
cd backend
npm install
npm run start:dev
```
**Status**: ✅ Rodando em http://localhost:3001

---

### 3️⃣ Frontend Next.js (OBRIGATÓRIO)
```bash
cd frontend
npm install
npm run dev
```
**Status**: ✅ Rodando em http://localhost:3000

---

## 🧪 Testar se Está Funcionando

### Teste 1: Python Bot
```bash
curl http://localhost:5000/health
# Deve retornar: {"status": "ok"}
```

### Teste 2: Backend NestJS
```bash
curl http://localhost:3001/health
# Deve retornar: {"status": "ok"}
```

### Teste 3: Busca Completa
```bash
curl "http://localhost:5000/search?q=iphone+13"
# Deve retornar JSON com produtos
```

### Teste 4: Via Backend
```bash
curl "http://localhost:3001/search/text?query=iphone+13"
# Deve retornar produtos formatados
```

### Teste 5: Via Frontend
Abra: http://localhost:3000
Digite: "iphone 13"
Clique: Buscar

---

## ⚠️ Problemas Comuns

### Erro: "Connection refused port 5000"
**Causa**: Python Bot não está rodando
**Solução**: 
```bash
cd backend\scraper
python api.py
```

### Erro: "Module not found"
**Causa**: Dependências não instaladas
**Solução**:
```bash
# Python
pip install -r requirements.txt

# NestJS
cd backend && npm install

# Frontend
cd frontend && npm install
```

### Erro: "Playwright not installed"
**Causa**: Browsers não instalados
**Solução**:
```bash
python -m playwright install chromium
```

---

## 🎯 Ordem de Inicialização

**SEMPRE nesta ordem**:
1. Python Bot (5000)
2. Backend NestJS (3001)
3. Frontend (3000)

---

## 📊 Status dos Serviços

| Serviço | Porta | Status | URL |
|---------|-------|--------|-----|
| Python Bot | 5000 | ⏳ | http://localhost:5000 |
| Backend | 3001 | ⏳ | http://localhost:3001 |
| Frontend | 3000 | ⏳ | http://localhost:3000 |

---

## ✅ Quando Está Pronto?

Você verá:
```
✅ Python Bot: "Running on http://0.0.0.0:5000"
✅ Backend: "[Nest] Application successfully started"
✅ Frontend: "Ready in 2.3s"
```

**Agora pode buscar produtos!** 🚀
