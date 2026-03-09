# 🔍 GUIA: Tipos de Busca - Zavlo

## 📊 Visão Geral

O Zavlo oferece **4 tipos de busca**, cada uma com custo e créditos diferentes:

| Tipo | Descrição | Custo Apify | Créditos | Quando Usar |
|------|-----------|-------------|----------|-------------|
| **Busca Texto** | Busca simples no cache | R$0,005 | 1 | Busca rápida |
| **Busca Imagem** | IA identifica produto | R$0,03 | 1 | Não sabe o nome |
| **Scraping Shopping** | Google Shopping real-time | R$0,10 | 2 | Preços atualizados |
| **Scraping Completo** | Todos os sites | R$0,15-0,20 | 3 | Comparação total |

---

## 1️⃣ Busca por Texto (General Search)

### Como funciona:
1. Usuário digita: "iPhone 13 128GB"
2. Sistema busca no **Redis Cache** (6h TTL)
3. Se não achar, usa **Google Lens General Search**
4. Retorna produtos do cache ou busca nova

### Características:
- ✅ **Mais barata:** R$0,005
- ✅ **Mais rápida:** ~200ms (cache)
- ✅ **Boa para:** Buscas repetidas
- ⚠️ **Limitação:** Dados podem ter até 6h

### Exemplo de Uso:
```typescript
// Frontend
const response = await fetch('/api/search', {
  method: 'POST',
  body: JSON.stringify({
    query: 'iPhone 13 128GB',
    type: 'text'
  })
});
```

### Custo:
- **Apify:** $0.001 (General Search)
- **Real:** R$0,005
- **Créditos:** 1

---

## 2️⃣ Busca por Imagem (AI Analysis)

### Como funciona:
1. Usuário faz upload de foto
2. Sistema envia para **Google Lens AI Analysis**
3. IA identifica: marca, modelo, cor, características
4. Retorna produtos similares

### Características:
- ✅ **Inteligente:** IA identifica automaticamente
- ✅ **Precisa:** Reconhece até detalhes
- ✅ **Boa para:** Quando não sabe o nome exato
- ⚠️ **Custo:** 6x mais cara que texto

### Exemplo de Uso:
```typescript
// Frontend
const formData = new FormData();
formData.append('image', file);

const response = await fetch('/api/search/image', {
  method: 'POST',
  body: formData
});
```

### Custo:
- **Apify:** $0.0065 (AI Analysis)
- **Real:** R$0,03
- **Créditos:** 1

---

## 3️⃣ Scraping Google Shopping

### Como funciona:
1. Usuário clica "Buscar no Google Shopping"
2. Sistema usa **Apify Google Shopping Scraper**
3. Faz scraping em **tempo real**
4. Retorna preços atualizados de lojas

### Características:
- ✅ **Tempo real:** Preços de hoje
- ✅ **Confiável:** Dados direto do Google
- ✅ **Boa para:** Comparação de preços
- ⚠️ **Custo:** 20x mais cara que texto

### Exemplo de Uso:
```typescript
// Backend
const run = await apifyClient.actor('compass/google-shopping-scraper').call({
  queries: ['iPhone 13 128GB'],
  maxItems: 50,
  countryCode: 'br'
});
```

### Custo:
- **Apify:** $0.02 (Shopping Scraper)
- **Real:** R$0,10
- **Créditos:** 2

---

## 4️⃣ Scraping Completo (Múltiplas Fontes)

### Como funciona:
1. Usuário clica "Buscar em todos os sites"
2. Sistema faz scraping em **paralelo**:
   - OLX (Apify OLX Scraper)
   - Mercado Livre (API oficial)
   - Amazon (Apify Amazon Scraper)
   - Kabum (Apify Kabum Scraper)
   - Shopee (API pública)
3. Agrega todos os resultados
4. Retorna comparação completa

### Características:
- ✅ **Completo:** Todos os marketplaces
- ✅ **Comparação:** Melhor preço garantido
- ✅ **Boa para:** Decisão de compra final
- ⚠️ **Custo:** Mais cara (múltiplos scrapers)

### Exemplo de Uso:
```typescript
// Backend - Executa em paralelo
const [olx, ml, amazon, kabum] = await Promise.all([
  scrapeOLX(query),
  scrapeMercadoLivre(query),
  scrapeAmazon(query),
  scrapeKabum(query)
]);
```

### Custo:
- **Apify:** $0.02-0.04 (múltiplos scrapers)
- **Real:** R$0,15-0,20
- **Créditos:** 3

---

## 🎯 Quando Usar Cada Tipo?

### Cenário 1: Busca Rápida
**Situação:** Usuário quer ver se tem iPhone 13 disponível
**Solução:** **Busca Texto** (1 crédito)
**Por quê:** Rápida, barata, dados recentes (6h)

### Cenário 2: Não Sabe o Nome
**Situação:** Usuário viu um tênis legal e tirou foto
**Solução:** **Busca Imagem** (1 crédito)
**Por quê:** IA identifica automaticamente

### Cenário 3: Quer Preço Atual
**Situação:** Usuário vai comprar HOJE e quer preço real
**Solução:** **Scraping Shopping** (2 créditos)
**Por quê:** Preços em tempo real do Google

### Cenário 4: Comparação Total
**Situação:** Usuário quer o MELHOR preço de TODOS os sites
**Solução:** **Scraping Completo** (3 créditos)
**Por quê:** Busca em todos os marketplaces

---

## 💰 Análise de Custo x Benefício

### Para o Usuário:

| Tipo | Créditos | Valor (Básico) | Benefício |
|------|----------|----------------|-----------|
| Texto | 1 | R$0,09 | Rápido e barato |
| Imagem | 1 | R$0,09 | IA inteligente |
| Shopping | 2 | R$0,18 | Preços reais |
| Completo | 3 | R$0,27 | Melhor preço garantido |

### Para o Zavlo:

| Tipo | Custo Real | Receita (Básico) | Margem |
|------|------------|------------------|--------|
| Texto | R$0,005 | R$0,09 | 94% ✅ |
| Imagem | R$0,03 | R$0,09 | 67% ✅ |
| Shopping | R$0,10 | R$0,18 | 44% ✅ |
| Completo | R$0,15 | R$0,27 | 44% ✅ |

---

## 🚀 Recomendações de UX

### 1. Fluxo Padrão (Recomendado):
```
1. Usuário busca por texto (1 crédito)
2. Se não achar, sugere busca por imagem (1 crédito)
3. Se quiser preços atuais, oferece Shopping (2 créditos)
4. Se quiser comparação total, oferece Completo (3 créditos)
```

### 2. Educação do Usuário:
- Mostrar custo em créditos ANTES da busca
- Explicar diferença entre cache e tempo real
- Sugerir tipo de busca baseado no contexto

### 3. Otimização de Custos:
- Incentivar busca texto (mais barata)
- Oferecer Shopping só quando necessário
- Limitar Completo para planos pagos

---

## 📊 Estatísticas Esperadas

### Distribuição de Uso (estimativa):

```
Busca Texto:      60% (mais comum)
Busca Imagem:     20% (diferencial)
Scraping Shopping: 15% (preços reais)
Scraping Completo:  5% (comparação total)
```

### Custo Médio por Usuário (300 créditos):

```
180 buscas texto   = 180 × R$0,005 = R$0,90
60 buscas imagem   = 60 × R$0,03   = R$1,80
30 shopping        = 30 × R$0,10   = R$3,00
10 completo        = 10 × R$0,15   = R$1,50

Total: R$7,20 custo
Receita: R$27,00
Margem: 73% ✅
```

---

## 🎉 Conclusão

O modelo de **créditos diferenciados** permite:

✅ **Flexibilidade:** Usuário escolhe o tipo de busca
✅ **Transparência:** Custo claro em créditos
✅ **Sustentabilidade:** Margem saudável (40-94%)
✅ **Escalabilidade:** Modelo lucrativo em qualquer escala

**Próximos passos:**
1. Implementar seletor de tipo de busca no frontend
2. Mostrar custo em créditos antes da busca
3. Monitorar uso real para validar estimativas
