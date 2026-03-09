# Sistema de Cr\u00e9ditos - Zavlo.ia

## \ud83d\udcb3 Sistema Implementado

### Contexto Global (UserContext)

**Localiza\u00e7\u00e3o:** `/contexts/UserContext.tsx`

**Estado do Usu\u00e1rio:**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  credits: number;
  searchesUsedToday: number;
  imageSearchesUsedToday: number;
  subscriptionDate: string;
  nextBillingDate: string;
}
```

**Fun\u00e7\u00f5es Dispon\u00edveis:**
- `useCredit()` - Usa 1 cr\u00e9dito
- `useSearch()` - Usa 1 busca por texto
- `useImageSearch()` - Usa 1 busca por imagem (ou cr\u00e9dito se limite atingido)
- `addCredits(amount)` - Adiciona cr\u00e9ditos
- `upgradePlan(plan)` - Muda o plano

---

## \ud83d\udcca Limites por Plano

### Gratuito
- **Buscas por texto:** 10/dia
- **Buscas por imagem:** 3/dia
- **Cr\u00e9ditos:** Pode comprar

### B\u00e1sico (R$ 15,90/m\u00eas)
- **Buscas por texto:** Ilimitadas
- **Buscas por imagem:** Ilimitadas
- **Cr\u00e9ditos:** Pode comprar

### Pro (R$ 29,90/m\u00eas)
- **Buscas por texto:** Ilimitadas
- **Buscas por imagem:** Ilimitadas
- **Cr\u00e9ditos:** Pode comprar
- **Extras:** WhatsApp, IA avan\u00e7ada

### Empresarial (R$ 99,90/m\u00eas)
- **Tudo ilimitado**
- **API de integra\u00e7\u00e3o**
- **M\u00faltiplos usu\u00e1rios**

---

## \ud83d\udcb0 Sistema de Cr\u00e9ditos

### Compra de Cr\u00e9ditos

**Pacotes:**
1. **50 cr\u00e9ditos** - R$ 7,90
2. **200 cr\u00e9ditos** - R$ 24,90 (+20 b\u00f4nus = 220 total)
3. **1000 cr\u00e9ditos** - R$ 99,90 (+150 b\u00f4nus = 1150 total)

**Uso:**
- 1 cr\u00e9dito = 1 busca por imagem (quando limite di\u00e1rio atingido)
- 1 cr\u00e9dito = 1 filtro avan\u00e7ado
- Cr\u00e9ditos nunca expiram

### L\u00f3gica de Uso

```typescript
// Busca por imagem
if (imageSearchesUsedToday < limit) {
  // Usa busca gratuita do plano
  imageSearchesUsedToday++;
} else if (credits > 0) {
  // Usa cr\u00e9dito
  credits--;
} else {
  // Bloqueado - precisa comprar cr\u00e9ditos ou fazer upgrade
  return false;
}
```

---

## \ud83d\udcca P\u00e1gina de Perfil

**Localiza\u00e7\u00e3o:** `/profile`

### Se\u00e7\u00f5es:

#### 1. Informa\u00e7\u00f5es do Usu\u00e1rio
- Avatar com inicial do nome
- Nome e email
- Data de cadastro

#### 2. Plano Atual
- Nome do plano com badge colorido
- Pr\u00f3xima data de cobran\u00e7a
- Status (Ativo/Inativo)
- Bot\u00e3o "Mudar Plano"

#### 3. Cr\u00e9ditos
- Saldo atual em destaque
- Bot\u00e3o "Comprar"
- Descri\u00e7\u00e3o de uso

#### 4. Uso Hoje
- Barra de progresso: Buscas por texto
- Barra de progresso: Buscas por imagem
- Barra de progresso: Cr\u00e9ditos usados

#### 5. Hist\u00f3rico de Cr\u00e9ditos
- Lista de transa\u00e7\u00f5es
- Tipo: Compra / Uso / B\u00f4nus
- Data e valor
- Saldo ap\u00f3s transa\u00e7\u00e3o

#### 6. A\u00e7\u00f5es R\u00e1pidas
- Fazer Upgrade
- Comprar Cr\u00e9ditos
- Ver Relat\u00f3rios

---

## \ud83d\udd04 Fluxo Completo

### 1. Cadastro
```
/auth \u2192 Criar conta \u2192 localStorage
       \u2193
    Usu\u00e1rio criado com:
    - plan: 'free'
    - credits: 0
    - searchesUsedToday: 0
    - imageSearchesUsedToday: 0
```

### 2. Escolher Plano
```
/plans \u2192 Selecionar plano \u2192 Atualizar localStorage
        \u2193
     /profile (com novo plano)
```

### 3. Comprar Cr\u00e9ditos
```
/plans \u2192 Comprar pacote \u2192 Adicionar cr\u00e9ditos
        \u2193
     /profile (cr\u00e9ditos atualizados)
```

### 4. Usar Sistema
```
/search \u2192 Fazer busca \u2192 Verificar limites
         \u2193
      Se dentro do limite: OK
      Se fora: Usar cr\u00e9dito
      Se sem cr\u00e9dito: Bloquear
```

---

## \ud83d\udcbe Armazenamento

**LocalStorage Key:** `zavlo_user`

**Estrutura:**
```json
{
  "id": "1",
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

## \u2705 Funcionalidades Implementadas

- \u2705 Contexto global de usu\u00e1rio
- \u2705 Sistema de cr\u00e9ditos funcional
- \u2705 Limites por plano
- \u2705 Compra de cr\u00e9ditos
- \u2705 Upgrade de plano
- \u2705 P\u00e1gina de perfil completa
- \u2705 Hist\u00f3rico de cr\u00e9ditos
- \u2705 Barras de progresso de uso
- \u2705 Persist\u00eancia em localStorage

---

## \ud83d\udd27 Pr\u00f3ximos Passos

- [ ] Integrar com backend real
- [ ] Sistema de pagamento (Stripe/Mercado Pago)
- [ ] Reset di\u00e1rio de contadores
- [ ] Notifica\u00e7\u00f5es de limite atingido
- [ ] Hist\u00f3rico completo de uso
- [ ] Exporta\u00e7\u00e3o de relat\u00f3rios
- [ ] Webhook de renova\u00e7\u00e3o de assinatura

---

**Status:** \u2705 Sistema de cr\u00e9ditos 100% funcional no frontend
