# 🔐 Conta Admin - Zavlo.ia

## Criar Conta Admin

Execute o script para criar/atualizar a conta admin:

```bash
cd backend
npm run create-admin
```

## 📋 Credenciais

```
Email:    admin@zavlo.ia
Senha:    admin123
Créditos: 999.999
Plano:    unlimited
```

## 🎯 Funcionalidades Admin

### 1. Login
```bash
POST http://localhost:3001/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@zavlo.ia",
  "password": "admin123"
}
```

### 2. Adicionar Créditos (Somar)
```bash
POST http://localhost:3001/api/v1/users/{userId}/credits
Authorization: Bearer {token}
Content-Type: application/json

{
  "credits": 100
}
```

### 3. Definir Créditos (Substituir)
```bash
POST http://localhost:3001/api/v1/users/{userId}/credits/set
Authorization: Bearer {token}
Content-Type: application/json

{
  "credits": 999999
}
```

## 🔧 Gerenciar Créditos

### Via API (Recomendado)

1. Faça login como admin
2. Copie o token JWT
3. Use os endpoints acima

### Via Firebase Console

1. Acesse: https://console.firebase.google.com
2. Selecione o projeto `zavloia`
3. Vá em Firestore Database
4. Encontre o usuário na coleção `users`
5. Edite o campo `credits`

## 🚀 Uso Rápido

```bash
# 1. Criar admin
npm run create-admin

# 2. Fazer login (copie o token)
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zavlo.ia","password":"admin123"}'

# 3. Adicionar créditos a qualquer usuário
curl -X POST http://localhost:3001/api/v1/users/{userId}/credits/set \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"credits":999999}'
```

## ⚠️ Importante

- A conta admin tem **créditos ilimitados** (999.999)
- Plano válido até **2099**
- Permissões completas no sistema
- Use apenas em **ambiente de desenvolvimento**
