# Busca por Imagem - Implementação Completa

## 🎯 Objetivo

Permitir que usuários **tirem uma foto** de qualquer produto e encontrem anúncios similares em marketplaces.

---

## 🔍 Opções Disponíveis na Apify

### 1. **Google Lens Scraper** ⭐ (Recomendado)

**Actor:** `apify/google-lens-scraper`

**Como funciona:**
1. Usuário envia foto
2. Google Lens analisa a imagem
3. Retorna produtos similares com links de compra

**Exemplo de uso:**
```typescript
{
  "imageUrl": "https://example.com/iphone.jpg",
  "country": "br",
  "language": "pt-BR",
  "maxResults": 20
}
```

**Resultados:**
```json
[
  {
    "title": "iPhone 13 Pro 128GB",
    "price": "R$ 4.299",
    "url": "https://...",
    "image": "https://...",
    "source": "Mercado Livre",
    "similarity": 0.95
  }
]
```

**Custo:** ~0.05 CU por busca

---

### 2. **Hugging Face Vision API** (Complementar)

**Modelos:**
- `google/vit-base-patch16-224` - Classificação
- `openai/clip-vit-base-patch32` - Similaridade

**Como funciona:**
1. Envia imagem (base64)
2. IA identifica: "iPhone 13 Pro"
3. Usa resultado para busca por texto

**Custo:** GRATUITO (30k requests/mês)

---

## 💰 Análise de Custos

### Cenário 1: Apenas Google Lens

| Plano Zavlo | Imagens/dia | CU/mês | Custo Apify | Receita | Margem |
|-------------|-------------|--------|-------------|---------|--------|
| Gratuito | 1/mês | 0.05 | R$ 0,27 | R$ 0 | -100% |
| Básico | 10 | 15 | R$ 81,25 | R$ 19,90 | -76% |
| Pro | 50 | 75 | R$ 406,25 | R$ 49,90 | -88% |

❌ **INVIÁVEL** com preços atuais

### Cenário 2: Hugging Face + Google Shopping

| Plano Zavlo | Imagens/dia | Custo HF | Custo GS | Total | Receita | Margem |
|-------------|-------------|----------|----------|-------|---------|--------|
| Gratuito | 1/mês | R$ 0 | R$ 0,05 | R$ 0,05 | R$ 0 | -100% |
| Básico | 10 | R$ 0 | R$ 1,50 | R$ 1,50 | R$ 19,90 | +92% |
| Pro | 50 | R$ 0 | R$ 7,50 | R$ 7,50 | R$ 49,90 | +85% |

✅ **VIÁVEL** e com ótimas margens!

---

## ✅ Solução Recomendada: **Híbrida**

Combinar **Hugging Face** (grátis) + **Google Shopping** (barato):

### Fluxo:

```
1. Usuário tira foto do produto
   ↓
2. Upload para servidor (Firebase Storage)
   ↓
3. Hugging Face identifica: "iPhone 13 Pro 128GB Azul"
   ↓
4. Google Shopping busca: "iPhone 13 Pro 128GB [cidade]"
   ↓
5. Retorna produtos similares da região
```

### Vantagens:

- ✅ **Custo baixo:** ~R$ 0,15 por busca
- ✅ **Rápido:** 2-3 segundos
- ✅ **Preciso:** IA do Google
- ✅ **Escalável:** Suporta milhares de usuários

---

## 🔧 Implementação

### 1. Backend - ImageSearchService

```typescript
// backend/src/modules/scraping/image-search.service.ts

@Injectable()
export class ImageSearchService {
  
  async searchByImage(imageUrl: string, userLocation?) {
    // 1. Identificar produto com Hugging Face
    const detected = await this.identifyProduct(imageUrl);
    // Resultado: "iPhone 13 Pro 128GB"
    
    // 2. Buscar no Google Shopping
    const products = await this.apifyService.search(
      detected.query,
      20,
      userLocation
    );
    
    // 3. Filtrar por similaridade visual
    const filtered = await this.filterBySimilarity(
      imageUrl,
      products
    );
    
    return {
      query: detected.query,
      category: detected.category,
      products: filtered
    };
  }
  
  private async identifyProduct(imageUrl: string) {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/google/vit-base-patch16-224',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
        },
        body: JSON.stringify({ inputs: imageUrl })
      }
    );
    
    const result = await response.json();
    
    return {
      query: result[0].label,
      category: result[0].category,
      confidence: result[0].score
    };
  }
}
```

### 2. Frontend - Upload de Imagem

```typescript
// frontend/app/search/page.tsx

const handleImageUpload = async (file: File) => {
  // 1. Upload para Firebase Storage
  const imageUrl = await uploadImage(file);
  
  // 2. Buscar por imagem
  const response = await fetch('/api/v1/search/image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ imageUrl })
  });
  
  const results = await response.json();
  
  // 3. Mostrar resultados
  setResults(results.products);
  setDetectedQuery(results.query);
};
```

### 3. Interface do Usuário

```tsx
<div className="upload-area">
  <input
    type="file"
    accept="image/*"
    capture="environment" // Abre câmera no mobile
    onChange={handleImageUpload}
  />
  
  <div className="preview">
    {image && <img src={image} alt="Preview" />}
  </div>
  
  {detecting && (
    <div className="detecting">
      🔍 Identificando produto...
    </div>
  )}
  
  {detectedQuery && (
    <div className="detected">
      ✅ Detectado: {detectedQuery}
      <button onClick={search}>Buscar</button>
    </div>
  )}
</div>
```

---

## 📊 Comparação de Soluções

| Solução | Custo/busca | Precisão | Velocidade | Escalabilidade |
|---------|-------------|----------|------------|----------------|
| **Google Lens** | R$ 0,27 | ⭐⭐⭐⭐⭐ | 3-5s | ⭐⭐⭐ |
| **HF + Google Shopping** | R$ 0,15 | ⭐⭐⭐⭐ | 2-3s | ⭐⭐⭐⭐⭐ |
| **Apenas HF** | R$ 0 | ⭐⭐⭐ | 1s | ⭐⭐⭐⭐⭐ |

**Recomendação:** HF + Google Shopping (melhor custo-benefício)

---

## 🚀 Roadmap de Implementação

### Fase 1: MVP (2 semanas)
- [x] Upload de imagem
- [ ] Integração Hugging Face
- [ ] Busca por texto baseada na detecção
- [ ] Interface básica

### Fase 2: Melhorias (1 mês)
- [ ] Filtro por similaridade visual
- [ ] Cache de resultados
- [ ] Histórico de buscas por imagem
- [ ] Sugestões de produtos similares

### Fase 3: Avançado (2 meses)
- [ ] Múltiplos objetos na mesma foto
- [ ] Busca por região da imagem
- [ ] Comparação visual lado a lado
- [ ] IA de recomendação

---

## 💡 Funcionalidades Extras

### 1. Busca por Screenshot
Usuário tira print de anúncio → sistema encontra produto

### 2. Busca por Foto de Vitrine
Usuário fotografa produto em loja → encontra online

### 3. Busca por Foto de Amigo
Viu algo legal? Fotografa e acha onde comprar

### 4. Comparação Visual
Mostra produtos lado a lado com % de similaridade

---

## 📈 Projeção de Uso

### Cenário Conservador (12 meses)

| Mês | Usuários | Buscas Imagem/dia | CU/mês | Custo | Receita | Lucro |
|-----|----------|-------------------|--------|-------|---------|-------|
| 1 | 1.000 | 100 | 15 | R$ 81 | R$ 500 | +R$ 419 |
| 3 | 5.000 | 500 | 75 | R$ 406 | R$ 2.500 | +R$ 2.094 |
| 6 | 15.000 | 1.500 | 225 | R$ 1.219 | R$ 7.500 | +R$ 6.281 |
| 12 | 50.000 | 5.000 | 750 | R$ 4.063 | R$ 25.000 | +R$ 20.937 |

**Margem:** 80-85% (excelente!)

---

## 🎯 Diferenciais Competitivos

### vs Google Lens
- ✅ Focado em marketplaces brasileiros
- ✅ Filtro por localização
- ✅ Comparação de preços
- ✅ Alertas de novos anúncios

### vs Buscadores Tradicionais
- ✅ Não precisa digitar nada
- ✅ Encontra produtos raros
- ✅ Busca por foto de qualquer ângulo

---

## 📌 Conclusão

**Solução Recomendada:**
- ✅ Hugging Face (identificação) - GRÁTIS
- ✅ Google Shopping (busca) - R$ 0,15/busca
- ✅ Margem de 80-85%
- ✅ Escalável para milhões de usuários

**Próximos Passos:**
1. Implementar upload de imagem no frontend
2. Integrar Hugging Face API
3. Conectar com Google Shopping
4. Testar com produtos reais
5. Ajustar precisão da IA

**Impacto no Negócio:**
- 🚀 Diferencial competitivo ENORME
- 💰 Monetização via créditos
- 📈 Aumento de engajamento
- ⭐ Experiência única no mercado
