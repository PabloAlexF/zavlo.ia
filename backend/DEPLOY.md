# Guia de Deploy - Zavlo.ia Backend

## 🚀 Deploy no Railway

### 1. Preparação

1. Crie uma conta no [Railway](https://railway.app/)
2. Instale o Railway CLI (opcional):
```bash
npm install -g @railway/cli
```

### 2. Configurar Projeto

1. No Railway Dashboard, clique em "New Project"
2. Selecione "Deploy from GitHub repo"
3. Conecte seu repositório
4. Railway detectará automaticamente o NestJS

### 3. Variáveis de Ambiente

No Railway, vá em **Variables** e adicione:

```env
NODE_ENV=production
PORT=3001
API_PREFIX=api/v1

# Firebase
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_PRIVATE_KEY=sua-chave-privada
FIREBASE_CLIENT_EMAIL=seu-email

# JWT
JWT_SECRET=seu-secret-super-seguro
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=seu-refresh-secret
JWT_REFRESH_EXPIRATION=30d

# Redis (Upstash)
REDIS_URL=redis://...
REDIS_PASSWORD=...

# CORS
CORS_ORIGIN=https://seu-frontend.vercel.app
```

### 4. Configurar Redis no Upstash

1. Acesse [Upstash](https://upstash.com/)
2. Crie um novo banco Redis
3. Copie a URL de conexão
4. Cole em `REDIS_URL` no Railway

### 5. Deploy

O Railway fará deploy automático quando você fizer push para o GitHub.

**Comandos de build:**
- Build: `npm install && npm run build`
- Start: `npm run start:prod`

---

## 🔥 Deploy no Render

### 1. Criar Web Service

1. Acesse [Render](https://render.com/)
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório GitHub

### 2. Configurações

- **Name**: zavlo-backend
- **Environment**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`
- **Plan**: Free (para começar)

### 3. Variáveis de Ambiente

Adicione as mesmas variáveis do Railway na seção **Environment**.

### 4. Deploy

Clique em "Create Web Service" e aguarde o deploy.

---

## ☁️ Deploy no Google Cloud Run

### 1. Criar Dockerfile

Crie um arquivo `Dockerfile` na raiz do backend:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
```

### 2. Build e Push

```bash
# Autenticar
gcloud auth login

# Configurar projeto
gcloud config set project SEU_PROJETO_ID

# Build
gcloud builds submit --tag gcr.io/SEU_PROJETO_ID/zavlo-backend

# Deploy
gcloud run deploy zavlo-backend \
  --image gcr.io/SEU_PROJETO_ID/zavlo-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 3. Configurar Variáveis

```bash
gcloud run services update zavlo-backend \
  --set-env-vars="NODE_ENV=production,PORT=3001,JWT_SECRET=..."
```

---

## 🐳 Deploy com Docker

### 1. Criar docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    env_file:
      - .env
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
```

### 2. Build e Run

```bash
docker-compose up -d
```

---

## 📊 Monitoramento

### Logs no Railway

```bash
railway logs
```

### Logs no Render

Acesse o dashboard → Logs

### Health Check

Adicione endpoint de health:

```typescript
// src/app.controller.ts
@Get('health')
health() {
  return { status: 'ok', timestamp: new Date() };
}
```

---

## 🔒 Segurança em Produção

### 1. Helmet

```bash
npm install helmet
```

```typescript
// main.ts
import helmet from 'helmet';
app.use(helmet());
```

### 2. Rate Limiting

Já configurado com `@nestjs/throttler`

### 3. CORS

Configure apenas origens permitidas:

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true,
});
```

---

## 📈 Escalabilidade

### Railway

- Upgrade para plano pago
- Configurar auto-scaling
- Adicionar mais memória/CPU

### Render

- Upgrade para plano Standard
- Configurar múltiplas instâncias

### Cloud Run

- Auto-scaling nativo
- Paga apenas pelo uso

---

## 🔄 CI/CD

### GitHub Actions

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - run: npm test
```

---

## 📝 Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Firebase configurado
- [ ] Redis/Upstash conectado
- [ ] CORS configurado corretamente
- [ ] Rate limiting ativo
- [ ] Logs funcionando
- [ ] Health check endpoint
- [ ] SSL/HTTPS ativo
- [ ] Backup do Firebase configurado
- [ ] Monitoramento ativo

---

## 🆘 Troubleshooting

### Erro de conexão com Firebase

Verifique se a chave privada está correta e se tem `\n` escapado.

### Erro de conexão com Redis

Teste a conexão:
```bash
redis-cli -u $REDIS_URL ping
```

### Porta já em uso

Mude a porta no `.env`:
```env
PORT=3002
```

### Build falha

Limpe o cache:
```bash
rm -rf node_modules dist
npm install
npm run build
```
