# 🚀 Guia de Deploy - Zavlo.ia

## 📋 Pré-requisitos

- Conta no [Vercel](https://vercel.com) (Frontend)
- Conta no [Railway](https://railway.app) ou [Render](https://render.com) (Backend)
- Conta no [Firebase](https://firebase.google.com)
- Conta no [Cloudinary](https://cloudinary.com)
- Conta no [Mercado Pago](https://www.mercadopago.com.br/developers)

---

## 🎯 Passo 1: Configurar Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Crie um novo projeto
3. Ative **Authentication** > Email/Password
4. Ative **Firestore Database**
5. Copie as credenciais em **Project Settings**

---

## 🎯 Passo 2: Configurar Cloudinary

1. Acesse [Cloudinary](https://cloudinary.com)
2. Crie uma conta gratuita
3. Vá em **Settings** > **Upload**
4. Crie um **Upload Preset** (unsigned)
5. Copie o **Cloud Name** e **Upload Preset**

---

## 🎯 Passo 3: Configurar Mercado Pago

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Crie uma aplicação
3. Copie o **Access Token** (use TEST para testes)
4. Configure o webhook URL (será gerado após deploy do backend)

---

## 🎯 Passo 4: Deploy do Backend (Railway/Render)

### Railway (Recomendado)

1. Acesse [Railway](https://railway.app)
2. Clique em **New Project** > **Deploy from GitHub**
3. Selecione o repositório
4. Configure as variáveis de ambiente:

```env
NODE_ENV=production
PORT=3001
API_PREFIX=api/v1
CORS_ORIGIN=https://seu-dominio-frontend.vercel.app

# Firebase
FIREBASE_API_KEY=sua-api-key
FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
FIREBASE_APP_ID=seu-app-id

# JWT
JWT_SECRET=gere-uma-chave-segura-aqui
JWT_EXPIRATION=7d

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=seu-access-token

# Redis (opcional)
REDIS_HOST=seu-redis-host
REDIS_PORT=6379
```

5. Clique em **Deploy**
6. Copie a URL gerada (ex: `https://zavlo-backend.up.railway.app`)

---

## 🎯 Passo 5: Deploy do Frontend (Vercel)

1. Acesse [Vercel](https://vercel.com)
2. Clique em **Add New** > **Project**
3. Importe o repositório do GitHub
4. Configure **Root Directory**: `frontend`
5. Configure as variáveis de ambiente:

```env
# Backend API (URL do Railway)
NEXT_PUBLIC_API_URL=https://zavlo-backend.up.railway.app/api/v1

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=sua-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=seu-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=seu-measurement-id

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=seu-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=seu-preset

# Mercado Pago
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=sua-public-key
```

6. Clique em **Deploy**
7. Aguarde o build finalizar

---

## 🎯 Passo 6: Configurar CORS no Backend

Após deploy, atualize a variável `CORS_ORIGIN` no Railway com a URL do Vercel:

```env
CORS_ORIGIN=https://seu-dominio.vercel.app
```

---

## 🎯 Passo 7: Configurar Webhook do Mercado Pago

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Vá em **Webhooks**
3. Configure a URL: `https://zavlo-backend.up.railway.app/api/v1/payments/webhook`
4. Selecione os eventos: `payment`, `subscription`

---

## 🎯 Passo 8: Testar a Aplicação

1. Acesse seu domínio Vercel
2. Crie uma conta
3. Teste uma busca
4. Teste um pagamento (use cartão de teste do Mercado Pago)

**Cartões de teste:**
- Aprovado: `5031 4332 1540 6351` (CVV: 123, Validade: qualquer futura)
- Recusado: `5031 7557 3453 0604`

---

## 📊 Monitoramento

### Logs do Backend (Railway)
```bash
railway logs
```

### Logs do Frontend (Vercel)
Acesse: Dashboard > Seu Projeto > Logs

---

## 🔒 Segurança

✅ **Nunca commite arquivos `.env`**
✅ Use variáveis de ambiente para todas as credenciais
✅ Gere um JWT_SECRET forte: `openssl rand -base64 32`
✅ Use HTTPS em produção
✅ Configure rate limiting no backend

---

## 🆘 Troubleshooting

### Erro de CORS
- Verifique se `CORS_ORIGIN` no backend está correto
- Certifique-se que a URL não tem `/` no final

### Erro de Firebase
- Verifique se todas as credenciais estão corretas
- Certifique-se que Authentication e Firestore estão ativos

### Erro de Pagamento
- Verifique se o webhook está configurado
- Use cartões de teste em ambiente de teste
- Verifique os logs do Mercado Pago

---

## 📞 Suporte

- Backend: Verifique logs no Railway
- Frontend: Verifique logs no Vercel
- Firebase: Verifique console do Firebase
- Mercado Pago: Verifique painel de desenvolvedores

---

## ✅ Checklist Final

- [ ] Backend deployado no Railway
- [ ] Frontend deployado no Vercel
- [ ] Firebase configurado
- [ ] Cloudinary configurado
- [ ] Mercado Pago configurado
- [ ] Webhook configurado
- [ ] CORS configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Testes realizados
- [ ] Domínio customizado (opcional)

---

🎉 **Parabéns! Seu projeto está no ar!**
