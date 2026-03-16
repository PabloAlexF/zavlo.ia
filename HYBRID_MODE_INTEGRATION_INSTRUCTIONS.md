# Integração do Modo Híbrido no Chat - Instruções

## ✅ Componentes Criados

1. **QuestionModal.tsx** - Modal para exibir perguntas do modo híbrido
2. **States adicionados** no ChatPage

## 🔧 Modificações Necessárias

### 1. Adicionar Handler para Resposta de Pergunta Híbrida

Adicione esta função no `app/chat/page.tsx` após a função `handleImageSearchReject`:

```typescript
// Handler para responder pergunta do modo híbrido
const handleHybridAnswer = async (answer: string) => {
  setHybridQuestion(null);
  setHybridMissingFields([]);
  
  // Enriquecer query original com a resposta
  const enrichedQuery = `${originalQuery} ${answer}`;
  
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
          content: `✅ Encontrei ${products.length} produtos!\\n\\n💳 Créditos: -${creditsUsed} | Restantes: ${remainingCredits}\\n\\n🔍 Quer buscar outro produto? Digite agora!`,
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
```

### 2. Adicionar QuestionModal no JSX

Adicione antes do fechamento da div principal (antes de `</div>` final):

```typescript
{/* Modal de Pergunta Híbrida */}
{hybridQuestion && (
  <QuestionModal
    question={hybridQuestion}
    missingFields={hybridMissingFields}
    onAnswer={handleHybridAnswer}
    onSkip={handleHybridSkip}
  />
)}
```

### 3. Modificar handleConfirmSearch

Substitua a seção após `if (response.ok)` no `handleConfirmSearch`:

```typescript
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
  
  // ... resto do código existente
```

## 📝 Resumo das Mudanças

1. ✅ Criado `QuestionModal.tsx` - componente visual
2. ✅ Adicionados states para modo híbrido
3. ⏳ Adicionar `handleHybridAnswer` e `handleHybridSkip`
4. ⏳ Adicionar `<QuestionModal>` no JSX
5. ⏳ Modificar `handleConfirmSearch` para detectar `needsQuestion`

## 🧪 Como Testar

1. Iniciar Python service: `cd python-service && python main.py`
2. Iniciar NestJS: `npm run start:dev`
3. Iniciar Frontend: `npm run dev`
4. No chat, digitar: "iPhone 13"
5. Deve aparecer modal perguntando: "Você prefere **novo ou usado**?"
6. Selecionar opção e clicar "Continuar"
7. Sistema deve fazer nova busca com query enriquecida

## 🎯 Fluxo Esperado

```
Usuário: "iPhone 13"
  ↓
Backend classifica → missing_fields: ["condition"]
  ↓
Frontend mostra QuestionModal
  ↓
Usuário seleciona: "usado"
  ↓
Frontend enriquece query: "iPhone 13 usado"
  ↓
Nova busca → Resultados
```

## 🔍 Debug

Adicione console.logs para debug:

```typescript
console.log('🔍 Response data:', data);
console.log('❓ needsQuestion:', data.needsQuestion);
console.log('💬 question:', data.question);
console.log('📋 missingFields:', data.missingFields);
```

## ✨ Melhorias Futuras

1. Salvar preferências do usuário (sempre buscar "usado")
2. Animação de transição do modal
3. Suporte para múltiplas perguntas em sequência
4. Analytics de perguntas respondidas vs puladas
