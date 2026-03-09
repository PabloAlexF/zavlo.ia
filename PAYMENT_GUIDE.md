# 💳 GUIA: Pagamentos e Créditos - Zavlo

## 🏦 COMO RECEBER PAGAMENTOS

### Opção 1: Stripe (RECOMENDADO) ⭐

**Por quê?**
- ✅ Aceita cartão internacional
- ✅ Assinaturas recorrentes automáticas
- ✅ Webhooks confiáveis
- ✅ Dashboard completo
- ✅ Usado por Netflix, Spotify, etc

**Taxas**:
- 3,4% + R$ 0,40 por transação (cartão BR)
- 4,4% + R$ 0,40 (cartão internacional)

**Como configurar**:

1. **Criar conta**: https://stripe.com/br
2. **Ativar conta bancária**:
   - Ir em: Settings → Business Settings → Bank Accounts
   - Adicionar: Banco, Agência, Conta
   - Stripe deposita automaticamente (D+2)

3. **Obter chaves API**:
   ```
   Publishable Key: pk_live_xxxxx (frontend)
   Secret Key: sk_live_xxxxx (backend)
   ```

4. **Criar produtos no Stripe**:
   ```
   Básico: R$ 29,90/mês (recorrente)
   Pro: R$ 79/mês (recorrente)
   Business: R$ 199/mês (recorrente)
   
   Créditos: R$ 9,90 (único)
   Créditos: R$ 19,90 (único)
   etc...
   ```

5. **Integrar no frontend**:
   ```bash
   npm install @stripe/stripe-js @stripe/react-stripe-js
   ```

6. **Webhook para confirmar pagamento**:
   ```
   URL: https://zavlo.ia/api/webhooks/stripe
   Eventos: payment_intent.succeeded, invoice.paid
   ```

---

### Opção 2: Mercado Pago (Brasil)

**Por quê?**
- ✅ PIX instantâneo
- ✅ Boleto
- ✅ Parcelamento
- ✅ Familiar para brasileiros

**Taxas**:
- 4,99% por transação (cartão)
- R$ 3,49 (boleto)
- 0,99% (PIX)

**Como configurar**:

1. **Criar conta**: https://mercadopago.com.br
2. **Ativar recebimento**:
   - Ir em: Seu negócio → Dados bancários
   - Adicionar: Banco, Agência, Conta
   - Transferência automática ou manual

3. **Obter credenciais**:
   ```
   Public Key: APP_USR_xxxxx (frontend)
   Access Token: APP_USR_xxxxx (backend)
   ```

4. **Integrar**:
   ```bash
   npm install mercadopago
   ```

---

### Opção 3: Stripe + Mercado Pago (IDEAL) 🎯

**Estratégia**:
- Stripe: Assinaturas recorrentes (Básico, Pro, Business)
- Mercado Pago: Créditos avulsos (PIX instantâneo)

**Vantagens**:
- ✅ Assinaturas confiáveis (Stripe)
- ✅ PIX rápido para créditos (Mercado Pago)
- ✅ Melhor experiência para o usuário

---

## 💰 TABELA DE USO DE CRÉDITOS (CUSTOS REAIS APIFY)

### Custos Reais Identificados:
- **Google Lens**: R$0,005 por busca (muito barato)
- **Google Shopping**: R$0,10 por busca (20x mais caro)

### O que o usuário precisa saber:

```
╔═══════════════════════════════════════════════════════════╗
║              COMO FUNCIONAM OS CRÉDITOS                   ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  GRÁTIS = Busca por texto (usa cache Redis)             ║
║  1 CRÉDITO = Busca por imagem com IA (Google Lens)      ║
║  2 CRÉDITOS = Scraping Google Shopping                   ║
║  3 CRÉDITOS = Scraping completo (múltiplas fontes)      ║
║                                                           ║
║  ✅ Créditos NUNCA expiram                               ║
║  ✅ Use quando quiser                                     ║
║  ✅ Acumule comprando pacotes                            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

### Exemplos Práticos:

**Com 300 créditos (Plano Básico) você pode**:
- 300 buscas por imagem (Lens) OU
- 150 scrapings Shopping OU
- 100 scrapings completos OU
- Mix: 100 imagens + 50 Shopping + 30 completos
- PLUS: Buscas por texto ILIMITADAS (grátis)

**Com 1200 créditos (Plano Pro) você pode**:
- 1200 buscas por imagem OU
- 600 scrapings Shopping OU
- 400 scrapings completos OU
- Mix profissional para revendedores
- PLUS: Buscas por texto ILIMITADAS (grátis)

---

## 🔧 IMPLEMENTAÇÃO TÉCNICA

### 1. Backend - Criar endpoint de pagamento

```typescript
// src/modules/payments/payments.controller.ts

@Post('create-checkout')
async createCheckout(@Body() dto: CreateCheckoutDto) {
  const { planId, userId, billingCycle } = dto;
  
  // Stripe
  const session = await this.stripe.checkout.sessions.create({
    customer_email: user.email,
    payment_method_types: ['card'],
    line_items: [{
      price: planId, // ID do produto no Stripe
      quantity: 1,
    }],
    mode: 'subscription', // ou 'payment' para créditos
    success_url: 'https://zavlo.ia/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://zavlo.ia/plans',
    metadata: {
      userId,
      planId,
      billingCycle,
    },
  });
  
  return { url: session.url };
}
```

### 2. Backend - Webhook para confirmar

```typescript
// src/modules/payments/payments.webhook.ts

@Post('webhook/stripe')
async handleStripeWebhook(@Req() req: Request) {
  const sig = req.headers['stripe-signature'];
  const event = this.stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, planId } = session.metadata;
    
    // Atualizar usuário no Firestore
    await this.usersService.updatePlan(userId, planId);
    
    // Enviar email de confirmação
    await this.emailService.sendPlanConfirmation(userId);
  }
  
  return { received: true };
}
```

### 3. Frontend - Botão de pagamento

```typescript
// app/plans/page.tsx

const handleSelectPlan = async (planName: string) => {
  const user = JSON.parse(localStorage.getItem('zavlo_user'));
  
  // Criar checkout session
  const response = await fetch('/api/payments/create-checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}`,
    },
    body: JSON.stringify({
      planId: planMap[planName],
      userId: user.id,
      billingCycle,
    }),
  });
  
  const { url } = await response.json();
  
  // Redirecionar para Stripe Checkout
  window.location.href = url;
};
```

---

## 📊 FLUXO COMPLETO DE PAGAMENTO

### Assinatura (Básico/Pro/Business)

```
1. Usuário clica "Assinar"
   ↓
2. Frontend chama /api/payments/create-checkout
   ↓
3. Backend cria sessão no Stripe
   ↓
4. Usuário é redirecionado para Stripe Checkout
   ↓
5. Usuário paga com cartão
   ↓
6. Stripe envia webhook para /api/webhook/stripe
   ↓
7. Backend atualiza plano no Firestore
   ↓
8. Usuário é redirecionado para /success
   ↓
9. Email de confirmação enviado
```

### Créditos Avulsos

```
1. Usuário clica "Comprar Créditos"
   ↓
2. Frontend chama /api/payments/create-checkout
   ↓
3. Backend cria sessão no Mercado Pago (PIX)
   ↓
4. Usuário paga via PIX
   ↓
5. Mercado Pago confirma pagamento (webhook)
   ↓
6. Backend adiciona créditos no Firestore
   ↓
7. Notificação em tempo real no frontend
```

---

## 💳 DADOS BANCÁRIOS NECESSÁRIOS

### Para Stripe:
- Nome completo
- CPF/CNPJ
- Banco
- Agência
- Conta (corrente ou poupança)
- Tipo de conta (pessoa física ou jurídica)

### Para Mercado Pago:
- CPF/CNPJ
- Banco
- Agência
- Conta
- Email

---

## 🎯 CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Configuração (1 dia)
- [ ] Criar conta Stripe
- [ ] Criar conta Mercado Pago
- [ ] Adicionar dados bancários
- [ ] Obter chaves API
- [ ] Criar produtos no Stripe

### Fase 2: Backend (2-3 dias)
- [ ] Instalar dependências (stripe, mercadopago)
- [ ] Criar módulo de pagamentos
- [ ] Criar endpoint /create-checkout
- [ ] Criar webhook /webhook/stripe
- [ ] Criar webhook /webhook/mercadopago
- [ ] Testar com chaves de teste

### Fase 3: Frontend (1-2 dias)
- [ ] Instalar @stripe/stripe-js
- [ ] Atualizar botão "Assinar"
- [ ] Criar página /success
- [ ] Criar página /cancel
- [ ] Adicionar loading states

### Fase 4: Testes (1 dia)
- [ ] Testar assinatura mensal
- [ ] Testar assinatura anual
- [ ] Testar compra de créditos
- [ ] Testar webhooks
- [ ] Testar cancelamento

### Fase 5: Produção (1 dia)
- [ ] Trocar chaves de teste por produção
- [ ] Configurar webhooks em produção
- [ ] Testar com pagamento real (R$ 1)
- [ ] Monitorar logs

---

## 📱 ONDE MOSTRAR USO DE CRÉDITOS

### 1. Página de Planos (Adicionar seção)

```tsx
<div className="bg-white/5 rounded-xl p-6 mb-12">
  <h3 className="text-xl font-bold text-white mb-4">
    💡 Como funcionam os créditos?
  </h3>
  <div className="grid md:grid-cols-3 gap-4">
    <div className="text-center">
      <div className="text-3xl mb-2">📝</div>
      <div className="text-white font-semibold">GRÁTIS</div>
      <div className="text-gray-400 text-sm">Busca por texto</div>
    </div>
    <div className="text-center">
      <div className="text-3xl mb-2">🖼️</div>
      <div className="text-white font-semibold">1 crédito</div>
      <div className="text-gray-400 text-sm">Busca por imagem</div>
    </div>
    <div className="text-center">
      <div className="text-3xl mb-2">🛒</div>
      <div className="text-white font-semibold">2 créditos</div>
      <div className="text-gray-400 text-sm">Scraping Shopping</div>
    </div>
  </div>
  <p className="text-gray-400 text-sm text-center mt-4">
    ✅ Créditos nunca expiram • Use quando quiser
  </p>
</div>
```

### 2. Tooltip nos pacotes de créditos

```tsx
<div className="text-xs text-gray-400 mt-2">
  Com {pkg.credits} créditos você pode fazer:
  <br />• {pkg.credits} buscas por imagem OU
  <br />• {Math.floor(pkg.credits / 2)} scrapings Shopping OU
  <br />• {Math.floor(pkg.credits / 3)} scrapings completos
  <br />• PLUS: Buscas por texto ILIMITADAS
</div>
```

---

## 📊 ANÁLISE DE MARGEM REAL

### Custos Apify (dados reais do usuário):

**76 buscas Google Lens:**
- Custo total: $0.08
- Custo por busca: $0.00105 ≈ **R$0,005**

**Google Shopping:**
- Custo por evento: $0.02 ≈ **R$0,10**

### Margem por Plano:

**Plano Básico (R$27 / 300 créditos)**
- Preço por crédito: R$0,09
- Custo Lens: R$0,005 → Margem: **1700%** ✅
- Custo Shopping: R$0,10 → Margem: **-10%** ⚠️
- **Solução**: Shopping = 2 créditos → Margem: **80%** ✅

**Plano Pro (R$77 / 1200 créditos)**
- Preço por crédito: R$0,064
- Custo Lens: R$0,005 → Margem: **1180%** ✅
- Custo Shopping (2 créditos): R$0,128 → Margem: **28%** ✅

**Plano Business (R$197 / 4000 créditos)**
- Preço por crédito: R$0,049
- Custo Lens: R$0,005 → Margem: **880%** ✅
- Custo Shopping (2 créditos): R$0,098 → Margem: **2%** ⚠️

### Conclusão:

✅ **Modelo sustentável** com créditos diferenciados:
- Busca texto: GRÁTIS (cache)
- Busca imagem: 1 crédito
- Shopping: 2 créditos
- Completo: 3 créditos

🎯 **Margem média esperada**: 400-800% (excelente)

---

## 🚨 IMPORTANTE: Cenário de Escala

### 100 clientes Básico (R$2.700 receita):

**Cenário pessimista** (só Shopping):
- 300 créditos = 150 Shopping
- Custo: 150 × R$0,10 = R$15/cliente
- Total: R$1.500 custo
- **Lucro: R$1.200** ✅

**Cenário otimista** (só Lens):
- 300 créditos = 300 Lens
- Custo: 300 × R$0,005 = R$1,50/cliente
- Total: R$150 custo
- **Lucro: R$2.550** ✅

**Cenário real** (mix 50/50):
- 150 Lens + 75 Shopping
- Custo: R$8,25/cliente
- Total: R$825 custo
- **Lucro: R$1.875** ✅

### Conclusão Final:

🟢 **Modelo é MUITO lucrativo**
🟢 **Pode escalar tranquilo**
🟢 **Risco financeiro baixo**

--- {pkg.credits + pkg.bonus} buscas por imagem
  <br />• {(pkg.credits + pkg.bonus) * 5} buscas por texto
</div>
```

### 3. Dashboard do usuário

```tsx
<div className="bg-white/5 rounded-xl p-6">
  <h3 className="text-lg font-bold text-white mb-4">
    Seus Créditos: {user.credits}
  </h3>
  <div className="space-y-2 text-sm text-gray-400">
    <div>• {user.credits} buscas por imagem</div>
    <div>• {user.credits * 5} buscas por texto</div>
    <div>• {Math.floor(user.credits / 2)} análises avançadas</div>
  </div>
</div>
```

---

## 🎯 RESUMO EXECUTIVO

### Para receber pagamentos:
1. **Criar conta Stripe** (5 minutos)
2. **Adicionar dados bancários** (2 minutos)
3. **Obter chaves API** (1 minuto)
4. **Integrar no código** (2-3 dias)

### Para mostrar uso de créditos:
1. **Adicionar seção na página de planos** ✅
2. **Tooltip nos pacotes** ✅
3. **Dashboard do usuário** ✅

### Taxas:
- Stripe: 3,4% + R$ 0,40
- Mercado Pago: 0,99% (PIX)

### Tempo de recebimento:
- Stripe: D+2 (2 dias úteis)
- Mercado Pago: D+1 ou D+14 (configurável)

---

**Próximo passo**: Criar conta no Stripe e adicionar dados bancários!

**Última atualização**: 2024
