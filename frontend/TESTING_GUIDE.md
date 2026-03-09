# 🎮 Guia Prático: Testando o Bot Inteligente

## 🚀 Como Testar as Melhorias

### Setup
1. Abra o chat: `http://localhost:3000/chat`
2. Faça login (para ter créditos)
3. Siga os cenários abaixo

---

## 📝 Cenários de Teste

### ✅ Cenário 1: Extração Automática de Produto

**Objetivo**: Testar se o bot extrai o produto automaticamente

```
1. Digite: "iphone 13"
   ✅ Espera: Bot processa e salva "iphone 13" em lastProduct

2. Digite: "usado"
   ✅ Espera: Bot busca "iphone 13 usado"
   ❌ Antes: Buscava apenas "usado"

3. Digite: "até 2000"
   ✅ Espera: Bot busca "iphone 13 até 2000"
   ❌ Antes: Buscava apenas "até 2000"
```

**Resultado Esperado**: Todas as respostas curtas usam o contexto do produto anterior.

---

### ✅ Cenário 2: Correção de Busca

**Objetivo**: Testar detecção de mudança de contexto

```
1. Digite: "quero comprar um fogao"
   ✅ Espera: Bot responde que é genérico

2. Digite: "na verdade eu quero comprar uma geladeira eletrolux"
   ✅ Espera: Bot detecta correção e mostra:
   "🔄 Entendi! Você quer buscar: 'geladeira eletrolux'"
   
3. Bot automaticamente inicia nova busca
   ✅ Espera: Perguntas sobre geladeira (não fogão)
```

**Resultado Esperado**: Bot esquece "fogao" e processa "geladeira eletrolux".

---

### ✅ Cenário 3: Variações de Preço

**Objetivo**: Testar regex expandida de preço

```
1. Digite: "notebook gamer"
   ✅ Espera: Bot processa

2. Teste cada variação:
   
   Digite: "até 5000"
   ✅ Espera: "notebook gamer até 5000"
   
   Digite: "max 5000"
   ✅ Espera: "notebook gamer até 5000"
   
   Digite: "máximo 5000"
   ✅ Espera: "notebook gamer até 5000"
   
   Digite: "menos de 5000"
   ✅ Espera: "notebook gamer até 5000"
   
   Digite: "abaixo de 5000"
   ✅ Espera: "notebook gamer até 5000"
```

**Resultado Esperado**: Todas as variações funcionam.

---

### ✅ Cenário 4: Memória Semântica

**Objetivo**: Testar refinamento com artigos

```
1. Digite: "iphone 13"
   ✅ Espera: Bot processa

2. Digite: "o pro max"
   ✅ Espera: Bot busca "iphone 13 pro max"
   ❌ Antes: Buscava apenas "o pro max"

3. Digite: "a versão de 256gb"
   ✅ Espera: Bot busca "iphone 13 versão de 256gb"
```

**Resultado Esperado**: Bot entende que "o", "a" são refinamentos.

---

### ✅ Cenário 5: Mais Barato

**Objetivo**: Testar query natural para ordenação

```
1. Digite: "tv samsung"
   ✅ Espera: Bot mostra resultados

2. Digite: "mais barato"
   ✅ Espera: Bot busca "tv samsung mais barato"
   ❌ Antes: Retornava "cheapest_from_results" (quebrava)

3. Digite: "qual o mais barato"
   ✅ Espera: Bot busca "tv samsung mais barato"
```

**Resultado Esperado**: Backend recebe query natural e pode ordenar.

---

### ✅ Cenário 6: Conversa Natural Completa

**Objetivo**: Testar fluxo completo de conversa

```
1. Digite: "celular"
   ✅ Espera: Bot pergunta qual celular

2. Digite: "samsung"
   ✅ Espera: Bot busca "celular samsung"

3. Digite: "o galaxy s23"
   ✅ Espera: Bot busca "celular samsung galaxy s23"

4. Digite: "usado"
   ✅ Espera: Bot busca "celular samsung galaxy s23 usado"

5. Digite: "max 2000"
   ✅ Espera: Bot busca "celular samsung galaxy s23 usado até 2000"
```

**Resultado Esperado**: Cada resposta refina a busca anterior.

---

### ✅ Cenário 7: Correção Durante Perguntas

**Objetivo**: Testar correção no meio do fluxo

```
1. Digite: "celular"
   ✅ Espera: Bot pergunta marca

2. Digite: "samsung"
   ✅ Espera: Bot pergunta condição

3. Digite: "na verdade quero um notebook dell"
   ✅ Espera: Bot detecta correção:
   "🔄 Entendi! Você quer buscar: 'notebook dell'"
   
4. Bot reseta e inicia busca de notebook
   ✅ Espera: Perguntas sobre notebook (não celular)
```

**Resultado Esperado**: Bot abandona celular e processa notebook.

---

## 🐛 Casos de Borda (Edge Cases)

### Teste 1: Produto de 1 Palavra
```
Digite: "notebook"
✅ Espera: lastProduct = "notebook"

Digite: "usado"
✅ Espera: "notebook usado"
```

### Teste 2: Produto com Números
```
Digite: "iphone 15 pro max"
✅ Espera: lastProduct = "iphone 15"

Digite: "256gb"
✅ Espera: "iphone 15 256gb"
```

### Teste 3: Múltiplas Correções
```
Digite: "fogao"
Digite: "na verdade geladeira"
✅ Espera: lastProduct = "geladeira"

Digite: "não, freezer"
✅ Espera: lastProduct = "freezer"
```

### Teste 4: Preço com Palavras
```
Digite: "notebook"
Digite: "até 5000 reais"
✅ Espera: Extrai "5000" corretamente
```

---

## 🎯 Checklist de Validação

Marque ✅ quando testar:

### Extração Automática
- [ ] Produto de 2 palavras
- [ ] Produto de 1 palavra
- [ ] Produto com números
- [ ] Refinamento posterior funciona

### Correção de Contexto
- [ ] "na verdade" funciona
- [ ] "não" funciona
- [ ] "melhor" funciona
- [ ] Reseta estado corretamente

### Variações de Preço
- [ ] "até X" funciona
- [ ] "max X" funciona
- [ ] "máximo X" funciona
- [ ] "menos de X" funciona
- [ ] "abaixo de X" funciona

### Memória Semântica
- [ ] "o [refinamento]" funciona
- [ ] "a [refinamento]" funciona
- [ ] Mantém produto anterior

### Query Natural
- [ ] "mais barato" retorna query natural
- [ ] "qual o mais barato" funciona
- [ ] Backend processa corretamente

---

## 📊 Métricas de Sucesso

Após testar todos os cenários:

| Métrica | Meta | Resultado |
|---------|------|-----------|
| Taxa de Sucesso | > 90% | ___% |
| Correções Detectadas | > 95% | ___% |
| Refinamentos OK | 100% | ___% |
| Variações de Preço | 100% | ___% |
| Memória Semântica | > 85% | ___% |

---

## 🔍 Debug

### Ver Contexto Atual
Abra o console do navegador e digite:
```javascript
// Ver contexto completo
contextManager.get()

// Ver histórico
contextManager.get().conversationHistory

// Ver último produto
contextManager.get().lastProduct
```

### Logs Úteis
O bot já loga automaticamente:
```
🔄 Mudança de contexto detectada: {...}
📝 Respostas coletadas: {...}
🔍 Query final gerada: "..."
```

---

## 🎉 Resultado Esperado

Após todos os testes, você deve ver:

✅ **Extração automática**: 100% funcional
✅ **Correção de contexto**: 95%+ detectada
✅ **Variações de preço**: Todas funcionando
✅ **Memória semântica**: Refinamentos naturais
✅ **Query natural**: Sem códigos estranhos

**Bot está pronto para produção!** 🚀

---

## 📞 Problemas?

Se algo não funcionar:

1. Verifique o console do navegador
2. Veja os logs do bot
3. Confirme que está logado (créditos disponíveis)
4. Teste em modo incógnito (cache limpo)

---

**Happy Testing!** 🧪✨
