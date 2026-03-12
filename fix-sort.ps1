$file = "c:\Projetos\zavlo-ia\app\chat\page.tsx"
$content = Get-Content $file -Raw -Encoding UTF8

# Encontrar e substituir a seção awaiting_location
$pattern = "(?s)(\s+if \(chatState === 'awaiting_location'\) \{.*?)(\s+setChatState\('awaiting_condition'\);)"

$replacement = @"
    if (chatState === 'awaiting_location') {
      const location = currentInput.toLowerCase().trim();
      const updatedLocation = (location === 'não' || location === 'nao') ? undefined : currentInput;
      
      setPendingSearch(prev => {
        if (!prev) return prev;
        return { ...prev, location: updatedLocation };
      });
      
      // SEMPRE perguntar ordenação após localização
      const sortMessage: Message = {
        id: crypto.randomUUID(),
        type: 'category_question',
        content: 'Como quer ordenar os resultados?',
        timestamp: new Date(),
        categoryQuestion: {
          id: 'sort_by',
          options: ['Mais relevantes', 'Menor preço', 'Maior preço'],
          category: 'sort'
        }
      };
      setMessages(prev => [...prev, sortMessage]);
      setChatState('awaiting_sort');
      setLoading(false);
      return;
    }
    
    // Estado: aguardando ordenação
    if (chatState === 'awaiting_sort') {
      const sortBy = currentInput.trim();
      
      // Se tem categoria, gerar busca final com respostas
      if (pendingSearch?.category) {
        const allAnswers = { ...categoryAnswers, sort_by: sortBy };
        console.log('📋 Respostas coletadas:', allAnswers);
        console.log('🗺️ Localização:', pendingSearch.location);
        const searchResult = buildCategoryQuery(pendingSearch.query, allAnswers, pendingSearch.location);
        console.log('🔍 Query final gerada:', searchResult);
        
        const confirmationMessage: Message = {
          id: crypto.randomUUID(),
          type: 'confirmation',
          content: searchResult.query,
          timestamp: new Date(),
          searchType: 'text',
          creditCost: 1,
        };
        setMessages(prev => [...prev, confirmationMessage]);
        setChatState('awaiting_confirmation');
        setLoading(false);
        return;
      }
      
      // Senão, perguntar condição
      setPendingSearch(prev => {
        if (!prev) return prev;
        return { ...prev, sortBy };
      });
      
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        type: 'ai',
        content: 'Produto novo ou usado?',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setChatState('awaiting_condition')
"@

$content = $content -replace $pattern, $replacement

Set-Content $file $content -Encoding UTF8
Write-Host "Arquivo atualizado com sucesso!"
