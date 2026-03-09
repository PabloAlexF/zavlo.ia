# 💰 Planos Zavlo.ia - Resumo Executivo

## 🎯 Preços Finais (Otimizados com base em Apify)

```
╔════════════════════════════════════════════════════════════╗
║                    PLANOS ZAVLO.IA                         ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  🆓 GRATUITO          R$ 0/mês                            ║
║     • 1 busca texto/mês                                   ║
║     • 1 busca imagem/mês                                  ║
║     • 3 marketplaces                                      ║
║                                                            ║
║  💙 BÁSICO            R$ 19,90/mês  (R$ 199/ano)         ║
║     • 50 buscas texto/dia                                 ║
║     • 10 buscas imagem/dia                                ║
║     • 6 marketplaces + scraping                           ║
║     • Histórico 30 dias                                   ║
║     • Margem: 43%                                         ║
║                                                            ║
║  ⭐ PRO               R$ 49,90/mês  (R$ 499/ano)          ║
║     • 200 buscas texto/dia                                ║
║     • 50 buscas imagem/dia                                ║
║     • 9 marketplaces + IA avançada                        ║
║     • Histórico 90 dias + WhatsApp                        ║
║     • Margem: 67%  [MAIS POPULAR]                         ║
║                                                            ║
║  🚀 BUSINESS          R$ 149,90/mês  (R$ 1.499/ano)       ║
║     • Buscas ilimitadas                                   ║
║     • Todos os marketplaces                               ║
║     • API + 5 usuários                                    ║
║     • Suporte 24/7                                        ║
║     • Margem: 79%                                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

## 💳 Pacotes de Créditos

```
┌─────────────────────────────────────────────────┐
│  100 créditos        R$ 9,90                    │
│  500 créditos (+50)  R$ 39,90  ⭐ POPULAR      │
│  2000 créditos (+300) R$ 129,90                 │
└─────────────────────────────────────────────────┘

1 crédito = 1 busca IA ou scraping em tempo real
```

## 📊 Análise de Custos Apify

### Plano Recomendado: **Scale ($199/mês)**

**Capacidade**:
- 796 CU disponíveis
- Suporta 800 usuários Básico OU 40 usuários Pro
- Proxy: 200 IPs + $7.50/GB
- Desconto: 17% vs Starter

**Breakeven**:
- 10 usuários Básico = R$ 199 (cobre 20% Apify)
- 4 usuários Pro = R$ 199 (cobre 20% Apify)
- Mix ideal: 5 Pro + 10 Básico = R$ 448

### Quando Escalar para Business ($999/mês)?

- ✅ 200+ usuários pagos
- ✅ MRR > R$ 5.000
- ✅ Necessidade de SLA/suporte premium

## 🎯 Estratégia de Crescimento

### Fase 1: MVP (0-50 usuários) - Meses 1-3
- **Plano Apify**: Scale ($199)
- **Meta**: 20 usuários pagos
- **MRR**: R$ 600
- **Status**: Prejuízo controlado

### Fase 2: Crescimento (50-200 usuários) - Meses 4-6
- **Plano Apify**: Scale ($199)
- **Meta**: 100 usuários pagos
- **MRR**: R$ 3.000
- **Status**: Lucrativo ✅

### Fase 3: Escala (200+ usuários) - Meses 7+
- **Plano Apify**: Business ($999)
- **Meta**: 500 usuários pagos
- **MRR**: R$ 15.000
- **Status**: Alta margem ✅

## 💡 Decisões Chave

### Por que R$ 19,90 (Básico)?
- ✅ Preço psicológico (< R$ 20)
- ✅ Margem saudável (43%)
- ✅ Competitivo no mercado BR
- ✅ Cobre custos Apify com 10 usuários

### Por que R$ 49,90 (Pro)?
- ✅ Preço premium mas acessível
- ✅ Margem excelente (67%)
- ✅ Target: revendedores/colecionadores
- ✅ Melhor LTV/CAC ratio

### Por que R$ 149,90 (Business)?
- ✅ Valor percebido alto (API + multi-user)
- ✅ Margem máxima (79%)
- ✅ Target: empresas/lojas
- ✅ Baixo churn esperado

## 📈 Projeções Financeiras

### Cenário Conservador (Mês 6)
```
Usuários:
  - 1000 gratuitos
  - 100 básico (R$ 1.990)
  - 50 pro (R$ 2.495)
  - 5 business (R$ 750)

MRR: R$ 5.235
Custo Apify: $199 (R$ 995)
Lucro: R$ 4.250/mês ✅
```

### Cenário Otimista (Mês 6)
```
Usuários:
  - 3000 gratuitos
  - 300 básico (R$ 5.970)
  - 150 pro (R$ 7.485)
  - 25 business (R$ 3.750)

MRR: R$ 17.955
Custo Apify: $999 (R$ 4.995)
Lucro: R$ 12.000/mês ✅✅
```

## 🔧 Implementação Técnica

### Backend (NestJS)
```typescript
// Limites por plano
const PLAN_LIMITS = {
  free: { text: 5, image: 2, marketplaces: 3 },
  basic: { text: 50, image: 10, marketplaces: 6 },
  pro: { text: 200, image: 50, marketplaces: 9 },
  business: { text: -1, image: -1, marketplaces: -1 }
};
```

### Frontend (Next.js)
- ✅ Página de planos atualizada
- ✅ Preços otimizados
- ✅ Pacotes de créditos
- ⏳ Gateway de pagamento
- ⏳ Dashboard de uso

## 📋 Checklist de Implementação

### Imediato (Semana 1)
- [x] Análise de custos Apify
- [x] Definição de preços
- [x] Atualização frontend
- [ ] Configurar limites no backend
- [ ] Testes de integração

### Curto Prazo (Semana 2-4)
- [ ] Integrar Stripe/Mercado Pago
- [ ] Sistema de créditos
- [ ] Dashboard de uso
- [ ] Emails transacionais
- [ ] Testes com usuários beta

### Médio Prazo (Mês 2-3)
- [ ] Analytics de conversão
- [ ] A/B testing de preços
- [ ] Programa de afiliados
- [ ] Cupons de desconto
- [ ] Upgrade automático

## 🎁 Promoções Planejadas

### Lançamento
- 🎉 **50% OFF** primeiro mês (todos os planos)
- 🎁 **100 créditos grátis** no cadastro
- 🚀 **Early adopter**: Preço fixo por 1 ano

### Recorrentes
- 💰 **Black Friday**: 60% OFF anual
- 🎄 **Natal**: 3 meses pelo preço de 2
- 📅 **Aniversário**: Mês grátis para anuais

## 📞 Contato

**Dúvidas sobre planos?**
- 📧 Email: planos@zavlo.ia
- 💬 WhatsApp: (11) 9xxxx-xxxx
- 🌐 Site: zavlo.ia/plans

---

**Documentos Relacionados**:
- [APIFY_COST_ANALYSIS.md](./APIFY_COST_ANALYSIS.md) - Análise detalhada
- [PLANS_COMPARISON.md](./PLANS_COMPARISON.md) - Comparação completa
- [README.md](./README.md) - Visão geral do projeto

**Última atualização**: 2024
