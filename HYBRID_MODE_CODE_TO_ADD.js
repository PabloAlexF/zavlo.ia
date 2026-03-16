// ============================================
// CÓDIGO PARA ADICIONAR NO app/chat/page.tsx
// ============================================

// 1. ADICIONAR APÓS handleImageSearchReject (linha ~700)

// Handler para responder pergunta do modo híbrido
const handleHybridAnswer = async (answer: string) => {
  setHybridQuestion(null);
  setHybridMissingFields([]);
  
  // Enriquecer query original com a resposta
  const enrichedQuery = `${originalQuery} ${answer}`.trim();
  
  // Fazer nova busca com query enriquecida
  setLoading(true);
  
  const searchingMessage: Message = {
    id: crypto.randomUUID(),
    type: 'ai',
    content: 'searching_animation',
    timestamp: new Date(),
  };
  setMessages(prev => [...prev, searchingMessage]);
  
  try {
    const user = localStorage.getItem('zavlo_user');
    if (!user) {
      router.push('/auth');
      return;
    }

    const userData = JSON.parse(user);
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    
    const params = new URLSearchParams({
      query: enrichedQuery,
      limit: '50',
      sortBy: 'RELEVANCE'
    });
    
    const response = await fetch(`${API_URL}/search/text?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userData.token}`,
      },
    });

    if (response.status === 401) {
      localStorage.removeItem('zavlo_user');
      router.push('/auth');
      return;
    }

    if (response.ok) {
      const data = await response.json();
      
      // Verificar novamente se precisa fazer pergunta
      if (data.needsQuestion && data.question) {
        setHybridQuestion(data.question);
        setHybridMissingFields(data.missingFields || []);
        setHybridClassification(data.classification);
        setOriginalQuery(enrichedQuery);
        setLoading(false);
        
        setMessages(prev => prev.filter(m => m.content !== 'searching_animation'));
        return;
      }
      
      const products = data.results || [];
      
      if (typeof data.remainingCredits === 'number') {
        setUserCredits(data.remainingCredits);
        const updatedUser = { ...userData, credits: data.remainingCredits };
        localStorage.setItem('zavlo_user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('userChanged'));
      }
      
      const creditsUsed = data.creditsUsed || 1;
      const remainingCredits = data.remainingCredits ?? userCredits - 1;
      
      setTimeout(() => {
        const productsMessage: Message = {
          id: crypto.randomUUID(),
          type: 'products',
          content: `✅ Encontrei ${products.length} produtos!\n\n💳 Créditos: -${creditsUsed} | Restantes: ${remainingCredits}\n\n🔍 Quer buscar outro produto? Digite agora!`,
          products: products,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, productsMessage]);
        
        setChatState('idle');
        setPendingSearch(null);
        setOriginalQuery('');
        setLoading(false);
      }, 1000);
    } else {
      const errorData = await response.json().catch(() => ({}));
      
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: 'ai',
        content: errorData.message || 'Erro na busca. Tente novamente.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setChatState('idle');
      setLoading(false);
    }
  } catch (error) {
    console.error('Hybrid search error:', error);
    const errorMessage: Message = {
      id: crypto.randomUUID(),
      type: 'ai',
      content: 'Erro ao processar busca. Tente novamente.',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, errorMessage]);
    setChatState('idle');
    setLoading(false);
  }
};

// Handler para pular pergunta
const handleHybridSkip = async () => {
  setHybridQuestion(null);
  setHybridMissingFields([]);
  
  // Buscar sem responder (usar scrapers padrão)
  await handleHybridAnswer('');
};

// ============================================
// 2. ADICIONAR NO JSX ANTES DO </div> FINAL
// ============================================

{/* Modal de Pergunta Híbrida */}
{hybridQuestion && (
  <QuestionModal
    question={hybridQuestion}
    missingFields={hybridMissingFields}
    onAnswer={handleHybridAnswer}
    onSkip={handleHybridSkip}
  />
)}

// ============================================
// 3. SUBSTITUIR NO handleConfirmSearch
// Procurar por: if (response.ok) {
// Substituir a seção após essa linha por:
// ============================================

if (response.ok) {
  const data = await response.json();
  
  // 🆕 VERIFICAR SE PRECISA FAZER PERGUNTA (MODO HÍBRIDO)
  if (data.needsQuestion && data.question) {
    setHybridQuestion(data.question);
    setHybridMissingFields(data.missingFields || []);
    setHybridClassification(data.classification);
    setOriginalQuery(searchParams.query);
    setLoading(false);
    
    // Remover mensagem de busca
    setMessages(prev => prev.filter(m => m.content !== 'searching_animation'));
    
    return;
  }
  
  const products = data.results || [];
  
  if (products.length === 0) {
    const errorMessage: Message = {
      id: crypto.randomUUID(),
      type: 'ai',
      content: `❌ Nenhum produto encontrado para "${searchParams.query}".\n\n💡 Tente:\n• Ser mais específico\n• Usar sinônimos\n• Remover filtros\n\n🔍 Digite outro produto para buscar!`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, errorMessage]);
    setChatState('idle');
    setPendingSearch(null);
    return;
  }
  
  if (typeof data.remainingCredits === 'number') {
    setUserCredits(data.remainingCredits);
    const updatedUser = { ...userData, credits: data.remainingCredits };
    localStorage.setItem('zavlo_user', JSON.stringify(updatedUser));
    window.dispatchEvent(new Event('userChanged'));
  }
  
  const creditsUsed = data.creditsUsed || 1;
  const remainingCredits = data.remainingCredits ?? userCredits - 1;
  
  setTimeout(() => {
    const productsMessage: Message = {
      id: crypto.randomUUID(),
      type: 'products',
      content: `✅ Encontrei ${products.length} produtos!\n\n💳 Créditos: -${creditsUsed} | Restantes: ${remainingCredits}\n\n🔍 Quer buscar outro produto? Digite agora!`,
      products: products,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, productsMessage]);
    
    // Atualiza contexto com resultados - usa parsed.product ao invés de split
    const parsedFinal = parseProductQuery(searchParams.query);
    contextManager.update({
      lastResults: products,
      lastProduct: parsedFinal.product
    });
    
    setChatState('idle');
    setPendingSearch(null);
  }, 1000);
}
