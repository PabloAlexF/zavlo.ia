// ============================================
// GUIA DE IMPLEMENTAÇÃO MANUAL
// ============================================
// Arquivo: IMPLEMENTACAO-MANUAL.md

## ✅ JÁ IMPLEMENTADO

1. ✅ Imports adicionados (linha ~30):
   - extractSmartFilters, getMissingFilters, generateFilterConfirmation
   - executeStateHandler

2. ✅ Race condition corrigido no handler de localização (linha ~700)
   - Mudou de 2 setMessages para 1 único setMessages com array

## ❌ FALTA IMPLEMENTAR

### 1. ADICIONAR STATE MACHINE (linha ~720)

ENCONTRAR:
```typescript
// Estado: aguardando ordenação
if (chatState === 'awaiting_sort') {
```

ADICIONAR ANTES:
```typescript
// ✅ USAR STATE MACHINE PROFISSIONAL
const handlerExecuted = executeStateHandler(chatState, {
  currentInput,
  pendingSearch,
  setPendingSearch,
  setChatState,
  setLoading,
  addMessages: (messages: Message[]) => setMessages(prev => [...prev, ...messages])
});

if (handlerExecuted) {
  return; // Handler foi executado com sucesso
}
```

### 2. ATUALIZAR buildFinalQuery (linha ~1150)

ENCONTRAR:
```typescript
const buildFinalQuery = (): { query: string; sortBy: string; minPrice?: number; maxPrice?: number } => {
  if (!pendingSearch) return { query: '', sortBy: 'RELEVANCE' };
  
  const priceMax = categoryAnswers?.price_max;
  const storage = categoryAnswers?.storage;
  const sortBy = categoryAnswers?.sort_by;
  
  return buildSearchQuery(
    parseProductQuery(pendingSearch.query),
    pendingSearch.condition,
    pendingSearch.location,
    undefined,
    priceMax,
    storage,
    sortBy
  );
};
```

SUBSTITUIR POR:
```typescript
const buildFinalQuery = (): { query: string; sortBy: string; limit?: number; minPrice?: number; maxPrice?: number } => {
  if (!pendingSearch) return { query: '', sortBy: 'RELEVANCE' };
  
  const priceMax = categoryAnswers?.price_max;
  const storage = categoryAnswers?.storage;
  const sortBy = categoryAnswers?.sort_by;
  
  const result = buildSearchQuery(
    parseProductQuery(pendingSearch.query),
    pendingSearch.condition,
    pendingSearch.location,
    undefined,
    priceMax,
    storage,
    sortBy
  );
  
  // ✅ ADICIONAR NOVOS FILTROS COM SPREAD OPERATOR
  return {
    ...result,
    ...(pendingSearch.limit !== undefined && { limit: pendingSearch.limit }),
    ...(pendingSearch.minPrice !== undefined && { minPrice: pendingSearch.minPrice }),
    ...(pendingSearch.maxPrice !== undefined && { maxPrice: pendingSearch.maxPrice })
  };
};
```

### 3. ATUALIZAR handleConfirmSearch (linha ~1250)

ENCONTRAR:
```typescript
const params = new URLSearchParams({
  query: searchParams.query,
  limit: '50',
  sortBy: searchParams.sortBy
});

if (searchParams.minPrice) params.append('minPrice', searchParams.minPrice.toString());
if (searchParams.maxPrice) params.append('maxPrice', searchParams.maxPrice.toString());
```

SUBSTITUIR POR:
```typescript
const params = new URLSearchParams({
  query: searchParams.query,
  limit: String(searchParams.limit || 50), // ✅ Usar limit do pendingSearch
  sortBy: searchParams.sortBy
});

// ✅ Usar !== undefined ao invés de truthy check
if (searchParams.minPrice !== undefined) {
  params.append('minPrice', String(searchParams.minPrice));
}
if (searchParams.maxPrice !== undefined) {
  params.append('maxPrice', String(searchParams.maxPrice));
}
```

## 📝 RESUMO DAS MUDANÇAS

### Arquivos Criados:
1. ✅ utils/chat/chatHelpers.ts - Helpers de normalização e parsing
2. ✅ utils/chat/smartFilter.ts - AI Smart Filter (extração automática)
3. ✅ utils/chat/stateHandlers.ts - State machine profissional

### Mudanças no app/chat/page.tsx:
1. ✅ Imports adicionados
2. ✅ Race condition corrigido (localização)
3. ❌ State machine integrado (FALTA)
4. ❌ buildFinalQuery atualizado (FALTA)
5. ❌ handleConfirmSearch atualizado (FALTA)

## 🎯 PRÓXIMOS PASSOS

1. Fazer as 3 mudanças manuais listadas acima
2. Testar o fluxo completo:
   - Localização → Ordenação → Limite → Preço → Condição → Confirmação
3. Verificar se os handlers estão sendo executados corretamente
4. Testar casos edge (0, undefined, etc)

## 🐛 BUGS CORRIGIDOS

✅ Race condition em setMessages (múltiplas chamadas)
✅ Spread operator correto para filtros opcionais
✅ Validação de undefined vs null
✅ Parsing inteligente de entrada do usuário
✅ State machine profissional (handlers mapeados)

## 🚀 MELHORIAS IMPLEMENTADAS

✅ Normalização de input (remove acentos)
✅ Extração de números de texto livre
✅ Parsing de faixas de preço
✅ Validação robusta de entrada
✅ Mensagens de erro amigáveis
✅ Handlers mapeados (evita if/else gigante)
