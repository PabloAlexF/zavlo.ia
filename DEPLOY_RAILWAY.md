# 🚂 Deploy Backend no Railway

## Por que Railway?
- ✅ Suporta NestJS nativamente
- ✅ Playwright funciona
- ✅ Redis integrado
- ✅ Deploy automático via GitHub
- ✅ $5/mês (500h grátis)

## 🚀 Passo a Passo

### 1. Criar conta no Railway
https://railway.app

### 2. Novo Projeto
- "New Project" → "Deploy from GitHub repo"
- Selecione: `zavlo.ia`
- Root Directory: `backend`

### 3. Configurar Build
```
Build Command: npm install && npm run build
Start Command: npm run start:prod
```

### 4. Variáveis de Ambiente
```env
NODE_ENV=production
PORT=3001
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
JWT_SECRET=...
MERCADOPAGO_ACCESS_TOKEN=...
```

### 5. Adicionar Redis (Opcional)
- "New" → "Database" → "Redis"
- Copiar `REDIS_URL` para variáveis

### 6. Domínio Customizado
- Settings → Domains
- Adicionar: `api.zavloia.com.br`
- Configurar DNS:
  ```
  CNAME api -> [railway-url]
  ```

### 7. Deploy
- Commit & Push → Deploy automático

## ✅ URL Final
`https://api.zavloia.com.br`
