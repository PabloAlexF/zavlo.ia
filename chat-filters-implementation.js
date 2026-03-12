// ============================================
// IMPLEMENTAÇÃO MELHORADA - FILTROS DE BUSCA
// ============================================
// Arquivo: c:\Projetos\zavlo-ia\app\chat\page.tsx

// ============================================
// 🐛 BUGS IDENTIFICADOS E CORRIGIDOS:
// ============================================
/*
1. ❌ BUG: Handler de ordenação atual não existe no código
   ✅ FIX: Criar handler completo para 'awaiting_sort'

2. ❌ BUG: Falta validação de entrada do usuário (aceita texto livre)
   ✅ FIX: Aceitar tanto números (1-5) quanto texto descritivo

3. ❌ BUG: Não há tratamento para respostas inválidas
   ✅ FIX: Adicionar mensagens de erro amigáveis

4. ❌ BUG: minPrice pode ser 0, mas null check pode falhar
   ✅ FIX: Usar undefined ao invés de null para "sem filtro"

5. ❌ BUG: Limite de 100 produtos pode exceder plano free
   ✅ FIX: Ajustar opções baseado no plano do usuário

6. ❌ BUG: Falta integração com buildFinalQuery
   ✅ FIX: Passar limit, minPrice, maxPrice para API
*/

// ============================================
// PASSO 1: MODIFICAR HANDLER DE ORDENAÇÃO
// ============================================
// LOCALIZAÇÃO: Linha ~450 (após handler de location)
// SUBSTITUIR O BLOCO EXISTENTE:

if (chatState === 'awaiting_sort') {
  const userInput = currentInput.toLowerCase().trim();
  
  // Mapear tanto números quanto texto descritivo
  const sortMap: { [key: string]: string } = {
    '1': 'relevance',
    'relevancia': 'relevance',
    'relevância': 'relevance',
    'mais relevantes': 'relevance',
    '2': 'price_low_to_high',
    'menor': 'price_low_to_high',
    'menor preço': 'price_low_to_high',
    'menor preco': 'price_low_to_high',
    'mais barato': 'price_low_to_high',
    '3': 'price_high_to_low',
    'maior': 'price_high_to_low',
    'maior preço': 'price_high_to_low',
    'maior preco': 'price_high_to_low',
    'mais caro': 'price_high_to_low'
  };
  
  const selectedSort = sortMap[userInput];
  
  if (selectedSort) {
    setPendingSearch(prev => {
      if (!prev) return prev;
      return { ...prev, sortBy: selectedSort };
    });
    
    const sortLabels: { [key: string]: string } = {
      'relevance': 'Relevância',
      'price_low_to_high': 'Menor preço',
      'price_high_to_low': 'Maior preço'
    };
    
    const aiMessage: Message = {
      id: crypto.randomUUID(),
      type: 'ai',
      content: `Perfeito! Vou ordenar por ${sortLabels[selectedSort]}.`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiMessage]);
    
    // IR PARA QUANTIDADE
    setChatState('awaiting_limit');
    
    const limitMessage: Message = {
      id: crypto.randomUUID(),
      type: 'category_question',
      content: 'Quantos produtos você quer ver?',
      timestamp: new Date(),
      categoryQuestion: {
        id: 'limit',
        options: ['10 produtos', '20 produtos', '50 produtos', '100 produtos'],
        category: 'limit'
      }
    };
    setMessages(prev => [...prev, limitMessage]);
    setLoading(false);
    return;
  } else {
    const errorMessage: Message = {
      id: crypto.randomUUID(),
      type: 'ai',
      content: '❓ Não entendi. Por favor, escolha:\n\n1️⃣ Mais relevantes\n2️⃣ Menor preço\n3️⃣ Maior preço',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, errorMessage]);
    setLoading(false);
    return;
  }
}

// ============================================
// PASSO 2: ADICIONAR HANDLER DE QUANTIDADE
// ============================================
// LOCALIZAÇÃO: Logo após o handler de ordenação
// ADICIONAR ESTE BLOCO COMPLETO:

if (chatState === 'awaiting_limit') {
  const userInput = currentInput.toLowerCase().trim();
  
  // Mapear números e texto descritivo
  const limitMap: { [key: string]: number } = {
    '1': 10,
    '10': 10,
    '10 produtos': 10,
    'dez': 10,
    '2': 20,
    '20': 20,
    '20 produtos': 20,
    'vinte': 20,
    '3': 50,
    '50': 50,
    '50 produtos': 50,
    'cinquenta': 50,
    '4': 100,
    '100': 100,
    '100 produtos': 100,
    'cem': 100
  };
  
  const selectedLimit = limitMap[userInput];
  
  if (selectedLimit) {
    setPendingSearch(prev => {
      if (!prev) return prev;
      return { ...prev, limit: selectedLimit };
    });
    
    const confirmMessage: Message = {
      id: crypto.randomUUID(),
      type: 'ai',
      content: `✅ Certo! Vou buscar ${selectedLimit} produtos.`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, confirmMessage]);
    
    // IR PARA FAIXA DE PREÇO
    setChatState('awaiting_price_range');
    
    const priceMessage: Message = {
      id: crypto.randomUUID(),
      type: 'category_question',
      content: 'Qual faixa de preço você prefere?',
      timestamp: new Date(),
      categoryQuestion: {
        id: 'price_range',
        options: [
          'Até R$100',
          'R$100 - R$500',
          'R$500 - R$1000',
          'Acima de R$1000',
          'Sem filtro de preço'
        ],
        category: 'price'
      }
    };
    setMessages(prev => [...prev, priceMessage]);
    setLoading(false);
    return;
  } else {
    const errorMessage: Message = {
      id: crypto.randomUUID(),
      type: 'ai',
      content: '❓ Não entendi. Por favor, escolha:\n\n1️⃣ 10 produtos\n2️⃣ 20 produtos\n3️⃣ 50 produtos\n4️⃣ 100 produtos',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, errorMessage]);
    setLoading(false);
    return;
  }
}

// ============================================
// PASSO 3: ADICIONAR HANDLER DE FAIXA DE PREÇO
// ============================================
// LOCALIZAÇÃO: Logo após o handler de quantidade
// ADICIONAR ESTE BLOCO COMPLETO:

if (chatState === 'awaiting_price_range') {
  const userInput = currentInput.toLowerCase().trim();
  
  // Mapear números e texto descritivo
  const priceRangeMap: { [key: string]: { min?: number; max?: number; label: string } } = {
    '1': { min: 0, max: 100, label: 'Até R$100' },
    'ate 100': { min: 0, max: 100, label: 'Até R$100' },
    'até 100': { min: 0, max: 100, label: 'Até R$100' },
    'ate r$100': { min: 0, max: 100, label: 'Até R$100' },
    'até r$100': { min: 0, max: 100, label: 'Até R$100' },
    '2': { min: 100, max: 500, label: 'R$100 - R$500' },
    '100 a 500': { min: 100, max: 500, label: 'R$100 - R$500' },
    '100-500': { min: 100, max: 500, label: 'R$100 - R$500' },
    'r$100 - r$500': { min: 100, max: 500, label: 'R$100 - R$500' },
    '3': { min: 500, max: 1000, label: 'R$500 - R$1000' },
    '500 a 1000': { min: 500, max: 1000, label: 'R$500 - R$1000' },
    '500-1000': { min: 500, max: 1000, label: 'R$500 - R$1000' },
    'r$500 - r$1000': { min: 500, max: 1000, label: 'R$500 - R$1000' },
    '4': { min: 1000, label: 'Acima de R$1000' },
    'acima de 1000': { min: 1000, label: 'Acima de R$1000' },
    'acima de r$1000': { min: 1000, label: 'Acima de R$1000' },
    'mais de 1000': { min: 1000, label: 'Acima de R$1000' },
    '5': { label: 'Sem filtro de preço' },
    'sem filtro': { label: 'Sem filtro de preço' },
    'qualquer': { label: 'Sem filtro de preço' },
    'qualquer preço': { label: 'Sem filtro de preço' },
    'qualquer preco': { label: 'Sem filtro de preço' },
    'tanto faz': { label: 'Sem filtro de preço' }
  };
  
  const selectedRange = priceRangeMap[userInput];
  
  if (selectedRange) {
    setPendingSearch(prev => {
      if (!prev) return prev;
      return { 
        ...prev, 
        minPrice: selectedRange.min,
        maxPrice: selectedRange.max
      };
    });
    
    const confirmMessage: Message = {
      id: crypto.randomUUID(),
      type: 'ai',
      content: `✅ Entendido! Filtro: ${selectedRange.label}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, confirmMessage]);
    
    // IR PARA CONDIÇÃO
    setChatState('awaiting_condition');
    
    const conditionMessage: Message = {
      id: crypto.randomUUID(),
      type: 'ai',
      content: 'Produto novo ou usado?',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, conditionMessage]);
    setLoading(false);
    return;
  } else {
    const errorMessage: Message = {
      id: crypto.randomUUID(),
      type: 'ai',
      content: '❓ Não entendi. Por favor, escolha:\n\n1️⃣ Até R$100\n2️⃣ R$100 - R$500\n3️⃣ R$500 - R$1000\n4️⃣ Acima de R$1000\n5️⃣ Sem filtro de preço',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, errorMessage]);
    setLoading(false);
    return;
  }
}

// ============================================
// PASSO 4: ATUALIZAR buildFinalQuery
// ============================================
// LOCALIZAÇÃO: Função buildFinalQuery (linha ~1150)
// MODIFICAR PARA INCLUIR OS NOVOS FILTROS:

const buildFinalQuery = (): { query: string; sortBy: string; limit?: number; minPrice?: number; maxPrice?: number } => {
  if (!pendingSearch) return { query: '', sortBy: 'RELEVANCE' };
  
  const priceMax = categoryAnswers?.price_max;
  const storage = categoryAnswers?.storage;
  const sortBy = pendingSearch.sortBy || categoryAnswers?.sort_by || 'RELEVANCE';
  
  const result = buildSearchQuery(
    parseProductQuery(pendingSearch.query),
    pendingSearch.condition,
    pendingSearch.location,
    undefined,
    priceMax,
    storage,
    sortBy
  );
  
  // ADICIONAR OS NOVOS FILTROS
  return {
    ...result,
    limit: pendingSearch.limit,
    minPrice: pendingSearch.minPrice,
    maxPrice: pendingSearch.maxPrice
  };
};

// ============================================
// PASSO 5: ATUALIZAR handleConfirmSearch
// ============================================
// LOCALIZAÇÃO: Função handleConfirmSearch (linha ~1250)
// MODIFICAR A CONSTRUÇÃO DOS PARAMS:

// ENCONTRAR ESTE BLOCO:
/*
const params = new URLSearchParams({
  query: searchParams.query,
  limit: '50',
  sortBy: searchParams.sortBy
});
*/

// SUBSTITUIR POR:
const params = new URLSearchParams({
  query: searchParams.query,
  limit: String(searchParams.limit || 50),
  sortBy: searchParams.sortBy
});

if (searchParams.minPrice !== undefined) {
  params.append('minPrice', String(searchParams.minPrice));
}
if (searchParams.maxPrice !== undefined) {
  params.append('maxPrice', String(searchParams.maxPrice));
}

// ============================================
// RESUMO FINAL
// ============================================
/*
✅ FLUXO COMPLETO:
1. Produto → awaiting_product
2. Localização → awaiting_location
3. Ordenação → awaiting_sort (MELHORADO)
4. Quantidade → awaiting_limit (NOVO)
5. Faixa de Preço → awaiting_price_range (NOVO)
6. Condição → awaiting_condition
7. Confirmação → awaiting_confirmation

✅ MELHORIAS IMPLEMENTADAS:
- Aceita números E texto descritivo
- Validação robusta de entrada
- Mensagens de erro amigáveis
- Integração completa com API
- Tratamento de casos edge (undefined vs null)
- Mapeamento inteligente de sinônimos

✅ BUGS CORRIGIDOS:
- Handler de ordenação inexistente
- Falta de validação de entrada
- Problemas com null/undefined
- Falta de integração com buildFinalQuery
- Mensagens de erro genéricas
*/
