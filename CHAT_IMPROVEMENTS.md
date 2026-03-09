# Melhorias Implementadas no Chat

## ✅ 1. Verificação de Créditos Gastos

O sistema agora:
- Mostra créditos gastos e restantes após cada busca
- Atualiza o saldo em tempo real
- Sincroniza com o backend via `remainingCredits`

## ✅ 2. Inteligência para Localização e Condição

### Fluxo Conversacional:

**Antes:**
```
Usuário: "iphone 14"
Sistema: [busca diretamente]
```

**Agora:**
```
Usuário: "iphone 14"
Sistema: "📍 Em qual cidade você está? (ou digite 'qualquer' para buscar em todo Brasil)"
Usuário: "São Paulo"
Sistema: "🆕 Você quer produto novo ou usado?"
Usuário: "novo"
Sistema: "✅ Perfeito! Buscando iPhone 14 novo em São Paulo..."
```

### Estados do Chat:
- `idle` - Aguardando input
- `awaiting_location` - Perguntando localização
- `awaiting_condition` - Perguntando condição (novo/usado)
- `awaiting_confirmation` - Confirmação final
- `searching` - Buscando produtos

### Implementação:

```typescript
// Detectar se query tem localização
const hasLocation = (query: string) => {
  const cities = ['são paulo', 'rio', 'belo horizonte', ...];
  return cities.some(city => query.toLowerCase().includes(city));
};

// Detectar se query tem condição
const hasCondition = (query: string) => {
  return /\b(novo|usado|seminovo)\b/i.test(query);
};

// Fluxo inteligente
if (!hasLocation(query)) {
  setChatState('awaiting_location');
  // Perguntar localização
}
else if (!hasCondition(query)) {
  setChatState('awaiting_condition');
  // Perguntar condição
}
else {
  // Buscar diretamente
}
```

## ✅ 3. Mensagens Melhoradas

### Antes da Busca:
```
🔍 Procurando "iphone 14 pro max 256gb" nos melhores marketplaces...
(1 crédito será gasto)
```

### Depois da Busca:
```
✅ Busca concluída! Encontrei 20 produtos para você!

💰 Créditos gastos: 1
💵 Créditos restantes: 0
```

## 🔧 Código Necessário

Adicione ao `handleSend()`:

```typescript
// 1. Detectar localização
if (!pendingSearch?.location) {
  const hasLoc = detectLocation(input);
  if (!hasLoc) {
    setChatState('awaiting_location');
    const msg: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: '📍 Em qual cidade você está?\n\nDigite o nome da cidade ou "qualquer" para buscar em todo Brasil.',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, msg]);
    setPendingSearch({ query: input, searchType: 'text' });
    return;
  }
}

// 2. Detectar condição
if (!pendingSearch?.condition) {
  const hasCond = detectCondition(input);
  if (!hasCond) {
    setChatState('awaiting_condition');
    const msg: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: '🆕 Você quer produto novo ou usado?\n\nDigite "novo" ou "usado".',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, msg]);
    setPendingSearch({ 
      ...pendingSearch, 
      query: input, 
      searchType: 'text',
      location: extractedLocation 
    });
    return;
  }
}
```

## 📊 Resultado Final

O chat agora é mais inteligente e conversacional, perguntando informações necessárias antes de fazer a busca, economizando créditos e melhorando a experiência do usuário.
