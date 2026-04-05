# 📊 Análise de Melhorias Contextuais - Zavlo Search Flow

## 🎯 Resumo Executivo
O sistema atual captura bem **básicos** (condition, price_range, localização). Mas está **perdendo oportunidades** em:
1. **Qualidade de Oferta** (ratings, promoções, vendedor)
2. **Conveniência** (frete, parcelamento, disponibilidade)
3. **Relevância Local** (proximidade em OLX)
4. **Economia** (descontos, cashback)

---

## 🔍 Oportunidades Identificadas

### 1️⃣ **RATINGS & REVIEWS FILTER** ⭐
**Dados Disponíveis:**
- Google Shopping: `productRating`, `productNumReviews`, `storeRating`
- Mercadolivre: Ratings em responses (não capturado atualmente)
- OLX: Seller reputation (não capturado)

**Pergunta Sugerida:**
```
"Quer priorizar produtos com boas avaliações?"
Opções:
- 4.5+ ⭐⭐⭐⭐⭐ (Muito bom)
- 4.0+ ⭐⭐⭐⭐ (Bom)
- Qualquer um (padrão)
```

**Impacto:** Filtrar 30-40% de produtos "genéricos" por qualidade.

**Implementação Necessária:**
- Campo `minimum_rating` em `ClassificationData`
- Backend: filter by `rating >= minimum_rating` antes de retornar
- Chat: detectar intent "com boa avaliação", "bem avaliado", "5 estrelas"

---

### 2️⃣ **SHIPPING PREFERENCE** 🚚
**Dados Disponíveis:**
- Google Shopping: `shipping` (ex: "Free delivery")
- Mercadolivre: `envio` (ex: "Frete grátis")
- OLX: Price já inclui ou não frete

**Pergunta Sugerida:**
```
"Frete grátis é importante para você?"
Opções:
- Sim, só com frete grátis 🎁
- Não, preço final é o que importa
- Prefiro mais próximo para pegar pessoalmente (OLX)
```

**Impacto:** Para Mercadolivre/Google Shopping, economizar em shipping é ~5-15% do preço.

**Implementação Necessária:**
- Campo `require_free_shipping` em `ClassificationData`
- Backend: filter `shipping === free` quando ativo
- Chat: Mostrar "Frete grátis" como destaque em cards

---

### 3️⃣ **LOCATION PROXIMITY (OLX ONLY)** 📍
**Dados Disponíveis:**
- OLX: `location.city`, `location.region`

**Pergunta Sugerida (apenas para OLX/usado):**
```
"Quer priorizar ofertas perto de você?"
- Mesma cidade
- Até 50km
- Até 100km
- Por todo o Brasil (padrão)
```

**Impacto:** Melhor experiência de pickup local + confiança no vendedor.

**Implementação Necessária:**
- Backend: calcular distância entre user_location e listing location
- Sort products by proximity when active
- Chat: Mostrar "À sua volta!" como badge

---

### 4️⃣ **PROMOTION/DISCOUNT HIGHLIGHT** 🎉
**Dados Disponíveis:**
- Google Shopping: `percentOff`, `onSale`, `originalPrice` vs `price`
- Mercadolivre: `precoDiscount` (ex: "9% OFF")
- OLX: Implícito na diferença preço

**Pergunta Sugerida:**
```
"Quer ver primeiro produtos em promoção?"
- Sim, só promoções
- Sim, promos no topo
- Não, relevância pura (padrão)
```

**Impacto:** Destacar deals e criar urgência de compra.

**Implementação Necessária:**
- Campo `priority_discounted` em `ClassificationData`
- Backend: Sort by `discount% DESC` primeiro
- Chat: Badge "XX% OFF" visível em cards, com preço anterior riscado

---

### 5️⃣ **INSTALLMENT PREFERENCE (Mercadolivre)** 💳
**Dados Disponíveis:**
- Mercadolivre: `installments` (ex: "5x 34,75 sem juros")

**Pergunta Sugerida (auto-detecção):**
```
"Prefere parcelamento sem juros?"
Opções:
- Sim, sem juros (filtra Mercadolivre only)
- Sim, qualquer uma
- Não, à vista (padrão)
```

**Impacto:** Mercadolivre é **forte** em parcelamento → aumentar peso em rankinf.

**Implementação Necessária:**
- Campo `prefer_installments` em `ClassificationData`
- Backend: Boost Mercadolivre score quando ativo + filter by "sem juros"
- Chat: Destacar plano: "5x de R$ 34,75 sem juros"

---

### 6️⃣ **SELLER TRUST (OLX)** 👤
**Dados Disponíveis:**
- OLX: `isBusiness` (flag)

**Pergunta Sugerida (contextual):**
```
"Você confia mais em: "
Opções:
- Lojas profissionais (business)
- Qualquer vendedor (padrão)
- Usuários comuns (individual sellers)
```

**Impacto:** O filtro pode aumentar confiança e reduzir fraudes.

**Implementação Necessária:**
- Campo `seller_type_preference` em `ClassificationData`
- Backend: Filter `isBusiness === true/false` 
- Chat: Badge "🏢 Loja Profissional" vs "👤 Vendedor Particular"

---

### 7️⃣ **AVAILABILITY STATUS** 📦
**Dados Disponíveis:**
- Google Shopping: `inStock` (implícito)
- OLX: `postedAt` recency (freshness)

**Pergunta Sugerida:**
```
"Preferência de disponibilidade:"
Opções:
- Em estoque agora (padrão)
- Sob encomenda OK
- Tanto faz
```

**Impacto:** Reduz frustração com "fora de estoque".

**Implementação Necessária:**
- Campo `availability_preference` em `ClassificationData`
- Backend: Filter/sort by `inStock === true`
- Chat: Show "✅ Em estoque" ou "⏳ Sob encomenda" com ETA

---

### 8️⃣ **BUNDLE DEAL DETECTION** 🎁
**Dados Interpretáveis:**
- Google Shopping store offers (múltiplas lojas = comparação)
- Mercadolivre: Kits/combos no título

**Pergunta Sugerida:**
```
"Você busca um produto único ou está aberto a kits/combos?"
Opções:
- Produto único
- Kits/Combos também
- Tanto faz (padrão)
```

**Impacto:** Expandir opções de compra com melhor custo-benefício.

**Implementação Necessária:**
- Campo `allow_bundles` em `ClassificationData`
- Backend: Regex para detectar "kit", "combo", "lote" no título
- Chat: Destacar "🎁 Kit com 3 itens" com economia calculada

---

## 🚀 PLANO DE IMPLEMENTAÇÃO (PRIORIZADO)

### **FASE 1 (Alto Impacto, Fácil)** ✅
1. **Ratings Filter** - 3-4 horas
   - Add field, filter logic, chat detection
   
2. **Shipping Preference** - 3-4 horas
   - Add field, filter logic, chat detection

### **FASE 2 (Médio Impacto, Médio Esforço)** 
3. **Installment Preference** - 2-3 horas
   - Mercadolivre score boost
   
4. **Promotion Highlight** - 2-3 horas
   - Sort by discount, visual badges

### **FASE 3 (Baixo-Médio Impacto, Mais Complexo)**
5. **Location Proximity** - 4-5 horas
   - Distance calculation, sort logic
   
6. **Seller Trust Filter** - 2 horas
   - OLX isBusiness filter
   
7. **Availability Status** - 2 horas
   - Stock filtering logic

### **FASE 4 (Nice-to-Have)**
8. **Bundle Detection** - 3-4 horas
   - Regex + score boost

---

## 📝 RECOMENDAÇÕES ADICIONAIS

### **Perguntas Melhoradas (Mais Naturais)**
```typescript
// Atual:
"Qual sua faixa de preço?"

// Melhor:
"Qual seu orçamento? (ou 'qualquer um' para flexibilidade)"

// Atual:
"Você prefere novo ou usado?"

// Melhor:
"Novinho em folha ou usado está ok? (Usado pode economizar XX%)"
```

### **Contexto de Economia Integrado**
Quando user busca "notebook", mostrar:
```
"💰 Dica: Notebooks usados economizam ~30-50%
Quer explorar ambas as opções?"
```

### **Smart Sorting UI**
Na frente, após resultados, oferecer:
```
🔄 Ordenar por:
• Menor preço
• Melhores avaliações
• Mais próximo (OLX)
• Com frete grátis (Mercadolivre)
• Em promoção
```

---

## 💡 IMPACTO ESPERADO

| Melhoria | Relevância | Econ $ | UX | Prioridade |
|----------|-----------|--------|----|-----------| 
| Ratings Filter | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ | 🔴 |
| Shipping Pref | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | 🔴 |
| Installments | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | 🟡 |
| Promos | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 🟡 |
| Proximity | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | 🟡 |
| Seller Trust | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | 🟢 |
| Availability | ⭐⭐ | ⭐ | ⭐⭐⭐⭐ | 🟢 |
| Bundles | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | 🟢 |

---

## 🎯 CONCLUSÃO
Sistema atual: ✅ **Funcional mas genérico**  
Com melhorias: ✅ **Altamente personalizado e econômico**  

Implementar **FASE 1 (Ratings + Shipping)** é crítico para gerar diferencial competitivo.
