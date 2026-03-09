# Análise de Custos Apify vs Zavlo.ia - Produção

## 📊 Planos Apify Disponíveis

| Plano | Custo Mensal | CU Incluídos | Custo/CU Extra | RAM Máxima | Runs Concorrentes |
|-------|--------------|--------------|----------------|------------|-------------------|
| **Free** | $0 | $5 créditos | $0.30/CU | 8 GB | 25 |
| **Starter** | $29 | $29 | $0.30/CU | 32 GB | 32 |
| **Scale** | $199 | $199 | $0.25/CU | 128 GB | 128 |
| **Business** | $999 | $999 | $0.20/CU | 256 GB | 256 |
| **Enterprise** | Custom | Custom | Custom | Unlimited | Unlimited |

**Desconto Anual:** 10% em todos os planos

---

## 💰 Planos Zavlo.ia Atuais

| Plano | Preço Mensal | Preço Anual | Buscas/dia | Imagens/dia |
|-------|--------------|-------------|------------|-------------|
| **Gratuito** | R$ 0 | R$ 0 | 0 texto, 0 imagem/mês | 1 texto, 1 imagem/mês |
| **Básico** | R$ 19,90 | R$ 199,00 | 50 | 10 |
| **Pro** | R$ 49,90 | R$ 499,00 | 200 | 50 |
| **Business** | R$ 149,90 | R$ 1.499,00 | Ilimitado | Ilimitado |

---

## 🔍 Consumo de CU por Busca (Estimativa)

Baseado no Google Shopping Scraper da Apify:
- **1 busca texto (20 produtos):** ~0.01 CU
- **1 busca imagem (processamento IA):** ~0.05 CU

### Consumo Mensal por Plano Zavlo.ia

#### Plano Gratuito (1 texto + 1 imagem/mês)
- Texto: 1 × 0.01 = 0.01 CU
- Imagem: 1 × 0.05 = 0.05 CU
- **Total: 0.06 CU/mês**

#### Plano Básico (50 texto + 10 imagem/dia)
- Texto: 50 × 30 × 0.01 = 15 CU
- Imagem: 10 × 30 × 0.05 = 15 CU
- **Total: 30 CU/mês**

#### Plano Pro (200 texto + 50 imagem/dia)
- Texto: 200 × 30 × 0.01 = 60 CU
- Imagem: 50 × 30 × 0.05 = 75 CU
- **Total: 135 CU/mês**

#### Plano Business (Ilimitado - estimativa 500/dia)
- Texto: 500 × 30 × 0.01 = 150 CU
- Imagem: 100 × 30 × 0.05 = 150 CU
- **Total: 300 CU/mês**

---

## 📈 Análise de Custos e Margens

### Cenário 1: Plano Apify **Starter** ($29/mês)

**Capacidade:** $29 em CU = 29 CU/mês

| Plano Zavlo | Usuários Suportados | Custo Apify | Receita Zavlo | Margem Bruta | ROI |
|-------------|---------------------|-------------|---------------|--------------|-----|
| Gratuito | 483 | $29 | R$ 0 | -R$ 157 | -100% |
| Básico | 0.96 (~1) | $29 | R$ 19,90 | -R$ 137 | -69% |
| Pro | 0.21 (~0) | $29 | R$ 0 | -R$ 157 | -100% |
| Business | 0.09 (~0) | $29 | R$ 0 | -R$ 157 | -100% |

**❌ INVIÁVEL** - Não suporta nem 1 usuário Básico completo

---

### Cenário 2: Plano Apify **Scale** ($199/mês) ⭐ RECOMENDADO

**Capacidade:** $199 em CU = 199 CU/mês  
**Custo em R$:** ~R$ 1.075 (cotação $1 = R$ 5,40)

| Plano Zavlo | Usuários Suportados | Custo Apify | Receita Zavlo | Margem Bruta | ROI |
|-------------|---------------------|-------------|---------------|--------------|-----|
| Gratuito | 3.316 | R$ 1.075 | R$ 0 | -R$ 1.075 | -100% |
| **Básico** | **6.6 (~7)** | R$ 1.075 | **R$ 139,30** | **-R$ 935** | **-87%** |
| **Pro** | **1.47 (~1)** | R$ 1.075 | **R$ 49,90** | **-R$ 1.025** | **-95%** |
| Business | 0.66 (~1) | R$ 1.075 | R$ 149,90 | -R$ 925 | -86% |

**Mix Recomendado (199 CU):**
- 5 usuários Básico (150 CU) = R$ 99,50
- 0 usuários Pro (0 CU) = R$ 0
- **Total:** R$ 99,50/mês | Margem: -R$ 975 (-91%)

---

### Cenário 3: Plano Apify **Business** ($999/mês)

**Capacidade:** $999 em CU = 999 CU/mês  
**Custo em R$:** ~R$ 5.395 (cotação $1 = R$ 5,40)

| Plano Zavlo | Usuários Suportados | Custo Apify | Receita Zavlo | Margem Bruta | ROI |
|-------------|---------------------|-------------|---------------|--------------|-----|
| Gratuito | 16.650 | R$ 5.395 | R$ 0 | -R$ 5.395 | -100% |
| **Básico** | **33.3 (~33)** | R$ 5.395 | **R$ 656,70** | **-R$ 4.738** | **-88%** |
| **Pro** | **7.4 (~7)** | R$ 5.395 | **R$ 349,30** | **-R$ 5.046** | **-94%** |
| Business | 3.33 (~3) | R$ 5.395 | R$ 449,70 | -R$ 4.945 | -92% |

**Mix Recomendado (999 CU):**
- 25 usuários Básico (750 CU) = R$ 497,50
- 1 usuário Pro (135 CU) = R$ 49,90
- **Total:** R$ 547,40/mês | Margem: -R$ 4.848 (-89%)

---

## 🎯 Recomendação Final

### ✅ Melhor Plano: **Apify Scale ($199/mês)**

**Justificativa:**
1. **Custo-benefício:** Melhor relação CU/preço ($0.25/CU vs $0.30 no Starter)
2. **Capacidade adequada:** Suporta 6-7 usuários Básico ou 1-2 Pro
3. **Escalabilidade:** 128 GB RAM e 128 runs concorrentes
4. **Desconto anual:** 10% = $179/mês ($2.148/ano)

---

## 💡 Estratégia de Precificação Recomendada

### Problema Atual: **MARGENS NEGATIVAS**

Os preços atuais da Zavlo.ia estão **muito abaixo** do custo real da Apify.

### Solução 1: **Aumentar Preços** (Recomendado)

| Plano | Preço Atual | Preço Sugerido | Custo Apify | Margem |
|-------|-------------|----------------|-------------|--------|
| Gratuito | R$ 0 | R$ 0 | R$ 0,32 | -100% |
| **Básico** | R$ 19,90 | **R$ 79,90** | R$ 16,25 | **+80%** |
| **Pro** | R$ 49,90 | **R$ 249,90** | R$ 73,13 | **+71%** |
| Business | R$ 149,90 | **R$ 599,90** | R$ 162,50 | **+73%** |

**Com preços sugeridos + Apify Scale:**
- 6 usuários Básico = R$ 479,40 - R$ 1.075 = **-R$ 596 (-55%)**
- 1 usuário Pro = R$ 249,90 - R$ 1.075 = **-R$ 825 (-77%)**

**Breakeven:** 14 usuários Básico ou 5 usuários Pro

---

### Solução 2: **Reduzir Limites** (Alternativa)

Manter preços atuais mas reduzir drasticamente os limites:

| Plano | Preço | Buscas/dia | Imagens/dia | CU/mês | Custo Apify |
|-------|-------|------------|-------------|--------|-------------|
| Gratuito | R$ 0 | 1/mês | 1/mês | 0.06 | R$ 0,32 |
| **Básico** | R$ 19,90 | **10** | **2** | 6 | R$ 3,25 |
| **Pro** | R$ 49,90 | **40** | **10** | 27 | R$ 14,63 |
| Business | R$ 149,90 | **150** | **30** | 90 | R$ 48,75 |

**Margens com limites reduzidos:**
- Básico: R$ 19,90 - R$ 3,25 = **+R$ 16,65 (+84%)**
- Pro: R$ 49,90 - R$ 14,63 = **+R$ 35,27 (+71%)**
- Business: R$ 149,90 - R$ 48,75 = **+R$ 101,15 (+67%)**

---

## 📊 Projeção de Receita (Apify Scale + Preços Sugeridos)

### Cenário Conservador (6 meses)

| Mês | Usuários Básico | Usuários Pro | Receita | Custo Apify | Lucro | Margem |
|-----|-----------------|--------------|---------|-------------|-------|--------|
| 1 | 5 | 0 | R$ 399,50 | R$ 1.075 | -R$ 675 | -63% |
| 2 | 8 | 1 | R$ 889,10 | R$ 1.075 | -R$ 186 | -17% |
| 3 | 12 | 2 | R$ 1.458,20 | R$ 1.075 | **+R$ 383** | **+36%** |
| 4 | 15 | 3 | R$ 1.948,00 | R$ 1.075 | **+R$ 873** | **+81%** |
| 5 | 18 | 4 | R$ 2.437,80 | R$ 1.075 | **+R$ 1.363** | **+127%** |
| 6 | 20 | 5 | R$ 2.847,50 | R$ 1.075 | **+R$ 1.773** | **+165%** |

**Breakeven:** Mês 3 (12 Básico + 2 Pro)

---

## 🚀 Plano de Ação Imediato

### Fase 1: Ajuste de Preços (Semana 1-2)
1. ✅ Implementar novos preços sugeridos
2. ✅ Comunicar mudanças aos usuários atuais (grandfathering)
3. ✅ Atualizar site e materiais de marketing

### Fase 2: Contratação Apify (Semana 2)
1. ✅ Assinar plano **Scale ($199/mês)** com desconto anual
2. ✅ Configurar API key no backend
3. ✅ Testar integração completa

### Fase 3: Monitoramento (Mês 1-3)
1. ✅ Acompanhar consumo de CU diário
2. ✅ Ajustar limites se necessário
3. ✅ Avaliar upgrade para Business se atingir 80% da capacidade

---

## 📌 Conclusão

**Plano Recomendado:** Apify Scale ($199/mês)  
**Ação Necessária:** Aumentar preços em 4x ou reduzir limites em 5x  
**Breakeven:** 14 usuários Básico ou 5 usuários Pro  
**Margem Alvo:** 70-80% após atingir 20+ usuários

**⚠️ CRÍTICO:** Com os preços atuais, a Zavlo.ia terá prejuízo em TODOS os cenários. É IMPOSSÍVEL ter lucro sem ajustar preços ou limites.
