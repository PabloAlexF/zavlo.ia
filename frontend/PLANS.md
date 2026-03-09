# Sistema de Autenticação e Planos - Zavlo.ia

## 🔐 Autenticação

### Página: `/auth`

**Funcionalidades:**
- Toggle entre Login e Cadastro
- Campos: Nome (cadastro), Email, Senha
- Login social (Google, Facebook)
- Link "Esqueceu a senha?"
- Redirecionamento para `/plans` após login/cadastro

## 💳 Planos de Assinatura

### Página: `/plans`

## Modelo Híbrido de Monetização

### 1. Planos Mensais/Anuais

#### **Gratuito** - R$ 0
- ✅ 10 buscas por texto/dia
- ✅ 3 buscas por imagem/dia
- ✅ Filtros básicos
- ❌ Anúncios visíveis
- ❌ Sem alertas
- ❌ Sem prioridade
- ❌ Sem histórico de preços

**CTA:** "Começar Grátis" → `/search`

---

#### **Básico** - R$ 15,90/mês ou R$ 159/ano
- ✅ Buscas ilimitadas
- ✅ Busca por imagem ilimitada
- ✅ Filtros completos (CEP, cidade, estado)
- ✅ Alertas diários
- ✅ Histórico de preços
- ✅ Sem anúncios

**Economia anual:** 17% (R$ 32,80)

---

#### **Pro** - R$ 29,90/mês ou R$ 299/ano ⭐ POPULAR
- ✅ Tudo do Básico +
- ✅ Alertas em tempo real
- ✅ IA de similaridade avançada
- ✅ Notificação por WhatsApp
- ✅ Busca de produtos raros
- ✅ Prioridade no suporte
- ✅ Dashboard avançado

**Economia anual:** 17% (R$ 59,80)

---

#### **Empresarial** - R$ 99,90/mês ou R$ 999/ano
- ✅ Tudo do Pro +
- ✅ Dashboard empresarial
- ✅ Exportação de dados
- ✅ Monitoramento de concorrência
- ✅ Alertas inteligentes por região
- ✅ API de integração
- ✅ Suporte prioritário 24/7
- ✅ Múltiplos usuários

**CTA:** "Falar com Vendas" → `mailto:vendas@zavlo.ia`

---

### 2. Pacotes de Créditos (Pay-per-use)

#### Pacote 50 - R$ 7,90
- 50 créditos
- Sem bônus

#### Pacote 200 - R$ 24,90 ⭐ MELHOR VALOR
- 200 créditos
- +20 créditos bônus
- Total: 220 créditos

#### Pacote 1000 - R$ 99,90
- 1000 créditos
- +150 créditos bônus
- Total: 1150 créditos

**Uso dos créditos:**
- 1 crédito = 1 busca por imagem
- 1 crédito = 1 filtro avançado
- Créditos nunca expiram

---

### 3. Monetização B2B (Vendedores)

**Para implementar futuramente:**

#### Destaque de Anúncios
- R$ 4,99/dia por anúncio
- R$ 39,90/semana

#### Assinatura Profissional
- R$ 39 a R$ 79/mês
- Destaques automáticos
- Estatísticas de buscas
- Relatórios de concorrência

#### Vitrine Recomendada
- R$ 0,40 a R$ 1,20 por clique
- Produtos em destaque no topo

---

### 4. Afiliados (Comissões)

**Integração com:**
- Amazon (1-10% comissão)
- Mercado Livre (1-10%)
- Magazine Luiza (1-10%)
- Shopee (1-10%)
- AliExpress (1-10%)

**Implementação:**
- Links de afiliados nos produtos
- Tracking de cliques
- Dashboard de comissões

---

### 5. Publicidade Interna

**Para plano Gratuito:**
- Banner no topo da lista
- Banner no final da lista
- Vídeo recompensado (libera busca extra)

**CPM Brasil:** R$ 4 a R$ 20
- 10.000 usuários = R$ 400 a R$ 2.000/mês

---

### 6. API para Desenvolvedores

**Pricing:**
- R$ 0,005 por requisição de texto
- R$ 0,03 por busca por imagem
- R$ 0,10 por scraping de concorrência

**Uso:**
- Integração com ERPs
- Lojas online
- Sistemas de precificação

---

## 📊 Projeção de Receita

### Com 5.000 usuários:
- **Ads:** R$ 300 - 800/mês
- **Assinaturas:** R$ 3.750/mês (5% conversão × 250 × R$ 15)
- **Créditos:** R$ 1.000/mês
- **Destaques:** R$ 800/mês
- **Afiliados:** R$ 400 - 1.500/mês

**Total:** R$ 6.500 - 7.800/mês

### Com 20.000 usuários:
**Total:** R$ 25.000 - 40.000/mês

---

## 🎯 Fluxo do Usuário

```
Home → "Começar Grátis" → /auth
                           ↓
                    Login/Cadastro
                           ↓
                        /plans
                           ↓
              Escolhe plano ou créditos
                           ↓
                      /checkout
                           ↓
                    Pagamento (Stripe)
                           ↓
                       /search
                    (Com recursos do plano)
```

---

## 🔧 Integrações Necessárias

### Backend
- [ ] Sistema de autenticação JWT
- [ ] Gerenciamento de planos (Firestore)
- [ ] Sistema de créditos
- [ ] Rate limiting por plano
- [ ] Webhook de pagamento

### Pagamento
- [ ] Stripe/Mercado Pago
- [ ] Assinaturas recorrentes
- [ ] Compra de créditos
- [ ] Webhooks de renovação

### Notificações
- [ ] Email (alertas diários)
- [ ] WhatsApp (plano Pro)
- [ ] Push notifications

---

## 📱 Páginas Criadas

- ✅ `/auth` - Login/Cadastro
- ✅ `/plans` - Escolha de planos
- ⏳ `/checkout` - Pagamento (próximo)
- ⏳ `/dashboard` - Painel do usuário (próximo)

---

## 🎨 Design

- Glassmorphism cards
- Gradientes vibrantes
- Badge "Mais Popular" no plano Pro
- Badge "Melhor Valor" no pacote 200 créditos
- Toggle Mensal/Anual com desconto
- FAQ section
- Responsivo mobile-first

---

**Status:** ✅ Sistema de planos completo e pronto para integração com backend
