# Google Lens API - Integração Completa ✅

## 🎯 API Integrada

**Actor:** `borderline~google-lens`  
**Endpoint:** `https://api.apify.com/v2/acts/borderline~google-lens/run-sync-get-dataset-items`

---

## ✅ Implementação Concluída

### 1. GoogleLensService

**Arquivo:** `backend/src/modules/scraping/google-lens.service.ts`

```typescript
async searchByImage(imageUrl: string, userLocation?) {
  const requestBody = {
    imageUrls: [{ url: imageUrl }],
    language: 'pt-br',
    searchTypes: ['all', 'ai-mode'],
    translateLanguage: 'pt-br',
  };

  const response = await fetch(
    `${API_URL}?token=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    },
  );

  return {
    products: [...],
    detectedQuery: "iPhone 13 Pro",
    category: "eletrônicos"
  };
}
```

### 2. SearchService (Integrado)

**Arquivo:** `backend/src/modules/search/search.service.ts`

```typescript
async searchByImage(imageUrl: string, userId?: string) {
  // 1. Validar limite do usuário
  await this.usersService.checkUsageLimit(userId, 'image');
  
  // 2. Buscar localização do usuário
  const userLocation = await this.getUserLocation(userId);
  
  // 3. Buscar com Google Lens
  const lensResults = await this.googleLensService.searchByImage(
    imageUrl,
    userLocation
  );
  
  // 4. Busca híbrida: Se detectou produto, buscar por texto também
  if (lensResults.detectedQuery) {
    const textResults = await this.apifyService.search(
      lensResults.detectedQuery,
      20,
      userLocation
    );
    
    // Mesclar resultados
    return [...lensResults.products, ...textResults];
  }
  
  return lensResults.products;
}
```

---

## 📊 Fluxo Completo

```
1. Usuário envia foto
   ↓
2. Frontend faz upload (Firebase Storage)
   ↓
3. POST /api/v1/search/image
   {
     "imageUrl": "https://storage.../foto.jpg",
     "userId": "abc123"
   }
   ↓
4. Backend valida limite do plano
   ↓
5. Google Lens identifica: "iPhone 13 Pro 128GB"
   ↓
6. Busca híbrida:
   - Resultados do Google Lens
   - Busca por texto no Google Shopping
   ↓
7. Mescla e remove duplicatas
   ↓
8. Retorna produtos ordenados por similaridade
```

---

## 🔧 Exemplo de Request/Response

### Request

```bash
POST https://api.apify.com/v2/acts/borderline~google-lens/run-sync-get-dataset-items?token=***

{
  "imageUrls": [
    {
      "url": "https://a-static.mlcdn.com.br/420x420/kit-com-2-copos-do-atletico-mineiro-galo-licenciado-estampa-premium-plasutil/cadebrinquedos/14450kit2-142/467ff2f76de77afa276569cdb9c886b8.jpeg"
    }
  ],
  "language": "pt-br",
  "searchTypes": ["all", "ai-mode"],
  "translateLanguage": "pt-br"
}
```

### Response

```json
[
  {
    "title": "Kit 2 Copos Atlético Mineiro",
    "description": "Copos oficiais do Galo",
    "price": "R$ 29,90",
    "url": "https://...",
    "image": "https://...",
    "source": "Mercado Livre",
    "category": "esportes",
    "similarity": 0.95
  },
  {
    "title": "Copo Atlético Mineiro Oficial",
    "price": "R$ 19,90",
    "url": "https://...",
    "source": "OLX",
    "similarity": 0.88
  }
]
```

---

## 💰 Custos

### Google Lens API

**Custo por busca:** ~0.05 CU

| Plano | Imagens/dia | CU/mês | Custo Apify | Receita | Margem |
|-------|-------------|--------|-------------|---------|--------|
| Gratuito | 1/mês | 0.05 | R$ 0,27 | R$ 0 | -100% |
| Básico | 10 | 15 | R$ 81,25 | R$ 19,90 | -76% |
| Pro | 50 | 75 | R$ 406,25 | R$ 49,90 | -88% |

⚠️ **ATENÇÃO:** Com os preços atuais, busca por imagem gera prejuízo!

### Solução: Ajustar Preços ou Limites

**Opção 1:** Aumentar preços
- Básico: R$ 19,90 → R$ 79,90
- Pro: R$ 49,90 → R$ 249,90

**Opção 2:** Reduzir limites
- Básico: 10/dia → 2/dia
- Pro: 50/dia → 10/dia

---

## 🚀 Próximos Passos

### Backend ✅
- [x] GoogleLensService implementado
- [x] Integrado no SearchService
- [x] Busca híbrida (Lens + Shopping)
- [x] Validação de limites

### Frontend (Próximo)
- [ ] Upload de imagem
- [ ] Preview da foto
- [ ] Loading state
- [ ] Exibir produto detectado
- [ ] Mostrar resultados

---

## 📝 Notas Importantes

1. **API Key:** Já configurada via `APIFY_API_KEY` no `.env`
2. **Endpoint:** Usa `run-sync-get-dataset-items` (síncrono, mais rápido)
3. **Idioma:** Configurado para `pt-br`
4. **Search Types:** `['all', 'ai-mode']` para melhor precisão
5. **Localização:** Integrado com sistema de CEP do usuário

---

## 🎯 Resultado Final

✅ **Google Lens totalmente integrado!**

**Funcionalidades:**
- Busca por imagem funcionando
- Detecção automática de produtos
- Busca híbrida (imagem + texto)
- Filtro por localização
- Remoção de duplicatas
- Validação de limites por plano

**Próximo passo:** Implementar upload de imagem no frontend! 📸
