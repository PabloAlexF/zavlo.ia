# Coleções do Firestore - Zavlo.ia

## 📊 Estrutura Completa

```
firestore/
├── users/
│   └── {userId}/
│       ├── name, email, plan, credits...
│       ├── transactions/ (subcollection)
│       │   └── {transactionId}
│       └── searches/ (subcollection)
│           └── {searchId}
├── subscriptions/
│   └── {subscriptionId}
└── products/
    └── {productId}
```

---

## 1️⃣ Coleção: `users`

**Path:** `/users/{userId}`

**Campos:**
```typescript
{
  name: string;
  email: string;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  credits: number;
  searchesUsedToday: number;
  imageSearchesUsedToday: number;
  subscriptionDate: string; // ISO
  nextBillingDate: string;   // ISO
}
```

**Regras:**
- ✅ Usuário pode ler/escrever apenas seus dados
- ❌ Outros usuários não têm acesso

---

## 2️⃣ Subcoleção: `users/{userId}/transactions`

**Path:** `/users/{userId}/transactions/{transactionId}`

**Campos:**
```typescript
{
  userId: string;
  type: 'purchase' | 'usage' | 'bonus' | 'refund';
  amount: number;           // Positivo ou negativo
  balance: number;          // Saldo após transação
  description: string;
  createdAt: string;        // ISO
}
```

**Exemplos:**
```json
// Compra
{
  "type": "purchase",
  "amount": 50,
  "balance": 150,
  "description": "Compra de 50 créditos"
}

// Uso
{
  "type": "usage",
  "amount": -1,
  "balance": 149,
  "description": "Crédito usado em busca"
}

// Bônus
{
  "type": "bonus",
  "amount": 20,
  "balance": 169,
  "description": "Bônus de compra"
}
```

**Regras:**
- ✅ Usuário pode ler suas transações
- ✅ Usuário pode criar transações
- ❌ Não pode editar/deletar (imutável)

---

## 3️⃣ Subcoleção: `users/{userId}/searches`

**Path:** `/users/{userId}/searches/{searchId}`

**Campos:**
```typescript
{
  userId: string;
  type: 'text' | 'image';
  query: string;
  resultsCount: number;
  usedCredit: boolean;      // Se usou crédito
  createdAt: string;        // ISO
}
```

**Exemplos:**
```json
// Busca por texto
{
  "type": "text",
  "query": "iPhone 13",
  "resultsCount": 25,
  "usedCredit": false
}

// Busca por imagem
{
  "type": "image",
  "query": "image_hash_123",
  "resultsCount": 10,
  "usedCredit": true
}
```

**Regras:**
- ✅ Usuário pode ler/criar/editar/deletar suas buscas

---

## 4️⃣ Coleção: `subscriptions`

**Path:** `/subscriptions/{subscriptionId}`

**Campos:**
```typescript
{
  userId: string;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: string;        // ISO
  endDate: string;          // ISO
  autoRenew: boolean;
  paymentMethod?: string;   // 'credit_card', 'pix', etc
  amount: number;           // Valor pago
  createdAt: string;        // ISO
  updatedAt: string;        // ISO
}
```

**Exemplo:**
```json
{
  "userId": "abc123",
  "plan": "pro",
  "status": "active",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-02-01T00:00:00.000Z",
  "autoRenew": true,
  "paymentMethod": "credit_card",
  "amount": 29.90,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Regras:**
- ✅ Usuário pode ler suas assinaturas
- ✅ Usuário pode criar assinatura
- ✅ Usuário pode atualizar (cancelar)
- ❌ Não pode deletar

---

## 5️⃣ Coleção: `products`

**Path:** `/products/{productId}`

**Campos:**
```typescript
{
  title: string;
  price: number;
  source: string;           // 'OLX', 'Mercado Livre', etc
  location: string;
  images: string[];
  description: string;
  link: string;
  category: string;
  createdAt: string;        // ISO
  updatedAt: string;        // ISO
}
```

**Regras:**
- ✅ Todos podem ler (público)
- ❌ Apenas backend pode escrever

---

## 🔧 Serviços Implementados

### 1. Transaction Service (`/lib/transactions.ts`)

```typescript
// Criar transação
await transactionService.create(userId, {
  type: 'purchase',
  amount: 50,
  balance: 150,
  description: 'Compra de 50 créditos',
});

// Buscar histórico
const history = await transactionService.getHistory(userId, 50);
```

### 2. Search Service (`/lib/searches.ts`)

```typescript
// Registrar busca
await searchService.create(userId, {
  type: 'text',
  query: 'iPhone 13',
  resultsCount: 25,
  usedCredit: false,
});

// Buscar histórico
const history = await searchService.getHistory(userId, 50);

// Estatísticas
const stats = await searchService.getStats(userId);
// { total: 100, text: 80, image: 20, creditsUsed: 5 }
```

### 3. Subscription Service (`/lib/subscriptions.ts`)

```typescript
// Criar assinatura
await subscriptionService.create({
  userId: 'abc123',
  plan: 'pro',
  status: 'active',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  autoRenew: true,
  amount: 29.90,
});

// Buscar assinatura ativa
const subscription = await subscriptionService.getByUserId(userId);

// Cancelar
await subscriptionService.cancel(subscriptionId);
```

---

## 🔐 Regras de Segurança

**Arquivo:** `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // Transactions (imutável)
      match /transactions/{transactionId} {
        allow read, create: if request.auth.uid == userId;
        allow update, delete: if false;
      }
      
      // Searches
      match /searches/{searchId} {
        allow read, write: if request.auth.uid == userId;
      }
    }
    
    // Subscriptions
    match /subscriptions/{subscriptionId} {
      allow read: if request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.userId;
      allow delete: if false;
    }
    
    // Products (público)
    match /products/{productId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

---

## 📝 Como Aplicar as Regras

### Via Console Firebase:
1. Acesse: https://console.firebase.google.com/project/zavloia
2. Firestore Database → Rules
3. Cole o conteúdo de `firestore.rules`
4. Clique em "Publicar"

### Via CLI:
```bash
firebase deploy --only firestore:rules
```

---

## ✅ Integração com UserContext

Todas as operações agora registram automaticamente:

```typescript
// Usar crédito → Cria transaction
await useCredit();

// Buscar → Cria search
await useSearch();
await useImageSearch();

// Comprar créditos → Cria transaction
await addCredits(50);
```

---

## 📊 Página de Perfil

Agora exibe dados reais:
- ✅ Histórico de transações (últimas 10)
- ✅ Estatísticas de buscas
- ✅ Carregamento assíncrono

---

## 🚀 Próximos Passos

- [ ] Cloud Function para reset diário
- [ ] Índices compostos para queries complexas
- [ ] Backup automático
- [ ] Analytics de uso
- [ ] Relatórios exportáveis

---

**Status:** ✅ Coleções implementadas e funcionais
