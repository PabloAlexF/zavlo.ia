# Firebase Configuration - Zavlo.ia

## \ud83d\udd25 Configura\u00e7\u00e3o

### Arquivo: `/lib/firebase.ts`

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDju2eSo1peLa-8ayzrFCvh8ZKru4PHBwo",
  authDomain: "zavloia.firebaseapp.com",
  projectId: "zavloia",
  storageBucket: "zavloia.firebasestorage.app",
  messagingSenderId: "1002126921456",
  appId: "1:1002126921456:web:557da6f61c1af3c5b33c35",
  measurementId: "G-JCF2SR1NFC"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
```

---

## \ud83d\udcca Estrutura do Firestore

### Cole\u00e7\u00e3o: `users`

**Documento ID:** `{userId}` (Firebase Auth UID)

**Campos:**
```typescript
{
  name: string;              // Nome do usu\u00e1rio
  email: string;             // Email
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  credits: number;           // Saldo de cr\u00e9ditos
  searchesUsedToday: number; // Buscas por texto hoje
  imageSearchesUsedToday: number; // Buscas por imagem hoje
  subscriptionDate: string;  // ISO date
  nextBillingDate: string;   // ISO date
}
```

**Exemplo:**
```json
{
  "name": "Jo\u00e3o Silva",
  "email": "joao@email.com",
  "plan": "pro",
  "credits": 150,
  "searchesUsedToday": 5,
  "imageSearchesUsedToday": 2,
  "subscriptionDate": "2024-01-01T00:00:00.000Z",
  "nextBillingDate": "2024-02-01T00:00:00.000Z"
}
```

---

## \ud83d\udd10 Autentica\u00e7\u00e3o

### M\u00e9todos Implementados:

#### 1. Email/Senha
```typescript
// Cadastro
await createUserWithEmailAndPassword(auth, email, password);

// Login
await signInWithEmailAndPassword(auth, email, password);

// Logout
await signOut(auth);
```

#### 2. Google OAuth
```typescript
const provider = new GoogleAuthProvider();
await signInWithPopup(auth, provider);
```

---

## \ud83d\udcbe Opera\u00e7\u00f5es no Firestore

### Criar Usu\u00e1rio
```typescript
await setDoc(doc(db, 'users', userId), {
  name: 'Nome',
  email: 'email@example.com',
  plan: 'free',
  credits: 0,
  searchesUsedToday: 0,
  imageSearchesUsedToday: 0,
  subscriptionDate: new Date().toISOString(),
  nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
});
```

### Ler Usu\u00e1rio
```typescript
const userDoc = await getDoc(doc(db, 'users', userId));
if (userDoc.exists()) {
  const userData = userDoc.data();
}
```

### Atualizar Usu\u00e1rio
```typescript
await updateDoc(doc(db, 'users', userId), {
  credits: newCredits,
  plan: 'pro',
});
```

---

## \ud83d\udd04 Fluxo de Autentica\u00e7\u00e3o

### 1. Cadastro
```
/auth \u2192 createUserWithEmailAndPassword()
       \u2193
    Firebase Auth cria usu\u00e1rio
       \u2193
    setDoc() cria documento em Firestore
       \u2193
    /plans (escolher plano)
```

### 2. Login
```
/auth \u2192 signInWithEmailAndPassword()
       \u2193
    Firebase Auth valida
       \u2193
    onAuthStateChanged() detecta
       \u2193
    getDoc() busca dados do Firestore
       \u2193
    UserContext atualiza estado
       \u2193
    /plans ou /profile
```

### 3. Google Login
```
/auth \u2192 signInWithPopup(GoogleAuthProvider)
       \u2193
    Firebase Auth cria/loga usu\u00e1rio
       \u2193
    Verifica se documento existe
       \u2193
    Se n\u00e3o: cria documento
    Se sim: carrega dados
       \u2193
    /plans
```

---

## \ud83d\udc65 UserContext com Firebase

### Integra\u00e7\u00e3o Completa

**Arquivo:** `/contexts/UserContext.tsx`

**Funcionalidades:**
- \u2705 Sincroniza\u00e7\u00e3o autom\u00e1tica com Firebase Auth
- \u2705 Carregamento de dados do Firestore
- \u2705 Atualiza\u00e7\u00e3o em tempo real
- \u2705 Persist\u00eancia autom\u00e1tica

**Hooks:**
```typescript
const { user, loading, useCredit, useSearch, useImageSearch, addCredits, upgradePlan } = useUser();
```

**Todas as fun\u00e7\u00f5es agora atualizam o Firestore:**
```typescript
// Usar cr\u00e9dito
await useCredit(); // Atualiza localmente E no Firestore

// Adicionar cr\u00e9ditos
await addCredits(50); // Atualiza localmente E no Firestore

// Mudar plano
await upgradePlan('pro'); // Atualiza localmente E no Firestore
```

---

## \ud83d\udee1\ufe0f Seguran\u00e7a

### Regras do Firestore (Configurar no Console)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Usu\u00e1rio s\u00f3 pode ler/escrever seus pr\u00f3prios dados
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## \ud83d\udcdd Pr\u00f3ximos Passos

### Implementar:
- [ ] Cole\u00e7\u00e3o `transactions` (hist\u00f3rico de cr\u00e9ditos)
- [ ] Cole\u00e7\u00e3o `searches` (hist\u00f3rico de buscas)
- [ ] Cole\u00e7\u00e3o `subscriptions` (gerenciar assinaturas)
- [ ] Cloud Functions para:
  - Reset di\u00e1rio de contadores
  - Processar pagamentos
  - Enviar notifica\u00e7\u00f5es
  - Webhook Stripe/Mercado Pago

### Estrutura Futura:
```
firestore/
\u251c\u2500\u2500 users/
\u2502   \u2514\u2500\u2500 {userId}/
\u2502       \u251c\u2500\u2500 name, email, plan, credits...
\u2502       \u251c\u2500\u2500 transactions/ (subcollection)
\u2502       \u2502   \u2514\u2500\u2500 {transactionId}
\u2502       \u2514\u2500\u2500 searches/ (subcollection)
\u2502           \u2514\u2500\u2500 {searchId}
\u251c\u2500\u2500 products/
\u2502   \u2514\u2500\u2500 {productId}
\u2514\u2500\u2500 subscriptions/
    \u2514\u2500\u2500 {subscriptionId}
```

---

## \u2705 Status

- \u2705 Firebase configurado
- \u2705 Auth Email/Senha
- \u2705 Auth Google
- \u2705 Firestore integrado
- \u2705 UserContext sincronizado
- \u2705 CRUD de usu\u00e1rios
- \u2705 Sistema de cr\u00e9ditos persistente
- \u2705 Logout funcional

---

**Firebase Project:** zavloia
**Console:** https://console.firebase.google.com/project/zavloia
