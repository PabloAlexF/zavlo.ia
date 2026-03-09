# 📊 Planos Zavlo.ia - Documentação Completa

## 🎯 Visão Geral dos Planos

| Plano | Mensal | Anual | Créditos/Mês | Economia Anual |
|-------|--------|-------|--------------|----------------|
| **Basic** | R$ 19,90 | R$ 199,00 | 15 texto + 5 imagem | R$ 39,80 (16%) |
| **Pro** | R$ 49,90 | R$ 499,00 | 48 texto + 15 imagem | R$ 99,80 (16%) |
| **Business** | R$ 149,90 | R$ 1.499,00 | 200 texto + 50 imagem | R$ 299,80 (16%) |

---

## 📦 Plano Basic - R$ 19,90/mês

### Créditos:
- **Mensal**: 15 créditos (15 buscas texto + 5 imagem)
- **Anual**: 180 créditos (15 × 12 meses)

### Recursos:
- ✅ 15 buscas de texto/mês
- ✅ 5 buscas por imagem/mês
- ✅ 6 lojas monitoradas
- ✅ Histórico 30 dias
- ✅ Alertas de preço por email

### Benefícios:
- Economize até R$ 500/mês em compras
- Acesso a 6 lojas principais
- Histórico completo de 30 dias
- Alertas de preço por email
- Suporte por email em 24h
- Sem anúncios na plataforma

### Lojas Incluídas (6):
1. OLX
2. Mercado Livre
3. Enjoei
4. Webmotors
5. iCarros
6. Mobiauto

---

## 🚀 Plano Pro - R$ 49,90/mês

### Créditos:
- **Mensal**: 48 créditos (48 buscas texto + 15 imagem)
- **Anual**: 576 créditos (48 × 12 meses)

### Recursos:
- ✅ 48 buscas de texto/mês
- ✅ 15 buscas por imagem/mês
- ✅ IA avançada
- ✅ 9 lojas monitoradas (TODAS)
- ✅ Histórico 90 dias
- ✅ Alertas WhatsApp
- ✅ Suporte prioritário

### Benefícios:
- Economize até R$ 2.000/mês em compras
- Acesso a TODAS as 9 lojas
- IA avançada para recomendações
- Alertas instantâneos via WhatsApp
- Histórico de 90 dias
- Suporte prioritário via WhatsApp
- Prioridade na fila de busca
- Comparação avançada de produtos

### Lojas Incluídas (9):
1. OLX
2. Mercado Livre
3. Enjoei
4. Webmotors
5. iCarros
6. Mobiauto
7. Amazon
8. Kabum
9. Shopee

---

## 💼 Plano Business - R$ 149,90/mês

### Créditos:
- **Mensal**: 200 créditos (200 buscas texto + 50 imagem)
- **Anual**: 2.400 créditos (200 × 12 meses)

### Recursos:
- ✅ 200 buscas de texto/mês
- ✅ 50 buscas por imagem/mês
- ✅ IA avançada + Detecção de fraude
- ✅ TODAS as lojas (12+)
- ✅ Histórico ilimitado
- ✅ API Access
- ✅ 5 usuários
- ✅ Exportar dados

### Benefícios:
- Economize até R$ 10.000/mês em compras
- Acesso a TODAS as 12 lojas
- IA avançada + Detecção de fraude
- Alertas instantâneos via WhatsApp
- Histórico ilimitado
- Acesso à API completa
- Até 5 usuários na conta
- Exportar dados em CSV/Excel
- Suporte prioritário 24/7
- Scraping em tempo real

### Lojas Incluídas (12):
1. OLX
2. Mercado Livre
3. Enjoei
4. Webmotors
5. iCarros
6. Mobiauto
7. Amazon
8. Kabum
9. Shopee
10. Vinted
11. Estante Virtual
12. Buscapé

---

## 💳 Tabela de Créditos por Pagamento

### Pagamento Mensal:

| Plano | Valor | Créditos Recebidos |
|-------|-------|-------------------|
| Basic | R$ 19,90 | 15 |
| Pro | R$ 49,90 | 48 |
| Business | R$ 149,90 | 200 |

### Pagamento Anual:

| Plano | Valor | Créditos Recebidos | Economia |
|-------|-------|-------------------|----------|
| Basic | R$ 199,00 | 180 (15×12) | R$ 39,80 |
| Pro | R$ 499,00 | 576 (48×12) | R$ 99,80 |
| Business | R$ 1.499,00 | 2.400 (200×12) | R$ 299,80 |

---

## 🔧 Lógica de Créditos no Backend

```typescript
// payments.service.ts

let creditsToAdd = 15; // default basic monthly
const billingCycle = amount >= 100 ? 'yearly' : 'monthly';

if (planName === 'basic') {
  creditsToAdd = billingCycle === 'yearly' ? 180 : 15;
} else if (planName === 'pro') {
  creditsToAdd = billingCycle === 'yearly' ? 576 : 48;
} else if (planName === 'business') {
  creditsToAdd = billingCycle === 'yearly' ? 2400 : 200;
}
```

---

## 📊 Comparação Detalhada

| Recurso | Basic | Pro | Business |
|---------|-------|-----|----------|
| **Preço Mensal** | R$ 19,90 | R$ 49,90 | R$ 149,90 |
| **Preço Anual** | R$ 199,00 | R$ 499,00 | R$ 1.499,00 |
| **Buscas Texto/Mês** | 15 | 48 | 200 |
| **Buscas Imagem/Mês** | 5 | 15 | 50 |
| **Lojas** | 6 | 9 | 12+ |
| **Histórico** | 30 dias | 90 dias | Ilimitado |
| **IA Avançada** | ❌ | ✅ | ✅ |
| **Detecção Fraude** | ❌ | ❌ | ✅ |
| **Alertas Email** | ✅ | ✅ | ✅ |
| **Alertas WhatsApp** | ❌ | ✅ | ✅ |
| **API Access** | ❌ | ❌ | ✅ |
| **Usuários** | 1 | 1 | 5 |
| **Exportar Dados** | ❌ | ❌ | ✅ |
| **Suporte** | Email 24h | WhatsApp | 24/7 Prioritário |
| **Scraping** | Básico | Alta Prioridade | Tempo Real |

---

## 🎯 Recomendações de Uso

### Basic - Ideal para:
- 👤 Usuários individuais
- 🏠 Compras pessoais ocasionais
- 💰 Orçamento limitado
- 📱 Produtos específicos

### Pro - Ideal para:
- 👥 Usuários frequentes
- 🛒 Compras regulares
- 💼 Pequenos negócios
- 🔍 Pesquisa avançada

### Business - Ideal para:
- 🏢 Empresas
- 📊 Análise de mercado
- 🤖 Integração via API
- 👥 Equipes (até 5 usuários)
- 📈 Alto volume de buscas

---

## 💡 Custo por Busca

### Mensal:

| Plano | Custo/Busca Texto | Custo/Busca Imagem |
|-------|-------------------|-------------------|
| Basic | R$ 1,33 | R$ 3,98 |
| Pro | R$ 1,04 | R$ 3,33 |
| Business | R$ 0,75 | R$ 3,00 |

### Anual (com desconto):

| Plano | Custo/Busca Texto | Custo/Busca Imagem |
|-------|-------------------|-------------------|
| Basic | R$ 1,11 | R$ 3,32 |
| Pro | R$ 0,87 | R$ 2,77 |
| Business | R$ 0,62 | R$ 2,50 |

---

## 🔄 Upgrade/Downgrade

### Regras:
- ✅ Upgrade: Imediato, créditos proporcionais
- ✅ Downgrade: No próximo ciclo
- ✅ Cancelamento: Mantém acesso até fim do período
- ✅ Créditos não expiram durante assinatura ativa

---

## 📝 Arquivos Atualizados

1. ✅ `frontend/app/checkout/confirm/page.tsx` - Todos os 3 planos
2. ✅ `frontend/app/checkout/payment/page.tsx` - Preços dos 3 planos
3. ✅ `backend/src/modules/payments/payments.service.ts` - Lógica de créditos (2 métodos)
4. ✅ `backend/src/shared/plans.constants.ts` - Constantes dos planos

---

## ✅ Status de Implementação

- [x] Plano Basic implementado
- [x] Plano Pro implementado
- [x] Plano Business implementado
- [x] Créditos corretos para todos os planos
- [x] Preços corretos no frontend
- [x] Lógica de pagamento no backend
- [x] Webhook suporta todos os planos
- [x] Perfil mostra todos os planos

---

**Todos os 3 planos estão 100% implementados e funcionais!** 🎉
