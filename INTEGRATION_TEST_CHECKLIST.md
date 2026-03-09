# ✅ Checklist de Testes - Integrações NLP Zavlo.ia

## 🎯 Objetivo
Verificar se todas as integrações NLP estão funcionando corretamente após refazer o arquivo `chat/page.tsx`.

---

## 📋 Testes a Realizar

### 1. ✅ Normalização de Query (Stop Words)
**Teste**: Digite "então, eu quero comprar fogão novo"
- ✅ **Esperado**: Query final deve ser "fogão novo" (sem "então", "eu", "quero", "comprar")
- ❌ **Erro**: Se aparecer "então eu quero comprar fogão novo"

---

### 2. ✅ Sistema Genérico (Aceita Qualquer Produto)
**Teste**: Digite produtos não comuns
- "patinete elétrico"
- "violão yamaha"
- "bicicleta caloi"

- ✅ **Esperado**: Sistema aceita e processa normalmente
- ❌ **Erro**: Mensagem "não entendi"

---

### 3. ✅ Fuzzy Matching de Marcas
**Teste**: Digite marcas com erros de digitação
- "naik air max" → deve corrigir para "nike"
- "samsng galaxy" → deve corrigir para "samsung"
- "adids ultraboost" → deve corrigir para "adidas"

- ✅ **Esperado**: Query final com marca corrigida
- ❌ **Erro**: Marca com erro permanece

---

### 4. ✅ Detecção de Produtos Genéricos
**Teste**: Digite produtos muito genéricos
- "geladeira"
- "celular"
- "notebook"
- "fogão"

- ✅ **Esperado**: Bot pede refinamento com sugestões específicas
- ❌ **Erro**: Bot pede condição (novo/usado) diretamente

**Mensagem esperada**:
```
🔍 "geladeira" é muito genérico!

Para encontrar o melhor preço, me conte mais:

1. Qual marca? (Brastemp, Consul, Electrolux)
2. Quantas portas? (1, 2, 3)
3. Frost free ou degelo?

Ou digite tudo junto (ex: "geladeira brastemp frost free 2 portas")
```

---

### 5. ✅ Localização Opcional
**Teste**: Digite produto específico (ex: "iPhone 14 Pro")
- ✅ **Esperado**: Bot pergunta localização com opção de pular
- ✅ **Esperado**: Pode digitar "não" para buscar em todo Brasil
- ✅ **Esperado**: Pode digitar "São Paulo" para buscar na região

**Produtos que NÃO devem pedir localização**:
- Produtos genéricos (já pediram refinamento)
- Produtos com modelo específico (iPhone 14, Galaxy S23)

---

### 6. ✅ Aplicação de Contexto
**Teste**: Conversa sequencial
1. Digite "iPhone 15"
2. Bot pergunta condição
3. Digite "novo"
4. Confirme busca
5. Depois digite apenas "usado"

- ✅ **Esperado**: Bot entende que você quer "iPhone 15 usado"
- ❌ **Erro**: Bot não entende "usado" sozinho

---

### 7. ✅ Pipeline Completo
**Teste**: Digite "então, eu quero comprar fogão brastemp 5 bocas novo"

**Pipeline esperado**:
1. Normalização: "fogão brastemp 5 bocas novo"
2. Detecção de intenção: `search_product`
3. Parse: produto="fogão", marca="brastemp", atributos=["5", "bocas"]
4. Não é genérico (tem marca)
5. Não precisa localização (tem especificações)
6. Bot pergunta condição
7. Você confirma "novo"
8. Query final: "fogão brastemp 5 bocas novo"

---

### 8. ✅ Créditos em Tempo Real
**Teste**: Faça uma busca e observe os créditos

- ✅ **Esperado**: Créditos no header atualizam automaticamente após busca
- ✅ **Esperado**: Mensagem mostra "Créditos gastos: 1. Restantes: X"
- ❌ **Erro**: Créditos não atualizam ou ficam travados em 1

**Verificar**:
- Header mostra créditos corretos
- Dashboard atualiza automaticamente
- Backend logs mostram dedução correta

---

### 9. ✅ Detecção de Não-Produtos
**Teste**: Digite frases que não são produtos
- "isso funciona?"
- "como faz?"
- "tem isso?"

- ✅ **Esperado**: Bot responde "não entendi, digite um produto"
- ❌ **Erro**: Bot tenta buscar como produto

---

### 10. ✅ Localização na Query Final
**Teste**: Busca com localização
1. Digite "notebook dell"
2. Bot pergunta localização
3. Digite "São Paulo"
4. Bot pergunta condição
5. Digite "usado"
6. Confirme busca

- ✅ **Esperado**: Query final = "notebook dell São Paulo usado"
- ❌ **Erro**: Localização não aparece na query

---

## 🔍 Como Testar

### Passo 1: Iniciar Backend
```bash
cd backend
npm run start:dev
```

### Passo 2: Iniciar Frontend
```bash
cd frontend
npm run dev
```

### Passo 3: Abrir Chat
- Acesse: http://localhost:3000/chat
- Faça login se necessário

### Passo 4: Executar Testes
- Siga cada teste acima
- Marque ✅ se passou ou ❌ se falhou
- Anote os erros encontrados

---

## 📊 Resultado Esperado

### ✅ Todos os testes passando significa:
- Sistema NLP 100% funcional
- Normalização correta
- Fuzzy matching ativo
- Detecção de genéricos funcionando
- Localização opcional implementada
- Contexto sendo aplicado
- Créditos atualizando em tempo real

### ❌ Se algum teste falhar:
- Verifique os imports no `chat/page.tsx`
- Confirme que os arquivos utils existem
- Veja console do navegador para erros
- Verifique logs do backend

---

## 🐛 Debugging

### Console do Navegador
Abra DevTools (F12) e procure por:
- Erros de import
- Erros de função não definida
- Logs de "📦 Resposta do backend"

### Backend Logs
Procure por:
```
[CREDITS] User xxx: currentCredits=X, amount=1
[CREDITS] Using free trial credit: X -> Y
[CREDITS] Free trial credit deducted successfully
```

### LocalStorage
Verifique no DevTools > Application > Local Storage:
- `zavlo_user` deve ter `credits` atualizado
- `zavlo_chat_history` deve salvar conversas

---

## 📝 Relatório de Testes

Após executar todos os testes, preencha:

```
Data: ___/___/___
Hora: ___:___

Testes Passados: ___/10
Testes Falhados: ___/10

Erros Encontrados:
1. _______________________________
2. _______________________________
3. _______________________________

Observações:
_________________________________
_________________________________
_________________________________
```

---

## 🚀 Próximos Passos

Se todos os testes passarem:
- ✅ Sistema está 100% funcional
- ✅ Pode fazer deploy
- ✅ Pode adicionar mais features

Se houver falhas:
- 🔧 Corrigir erros encontrados
- 🔄 Re-executar testes
- 📝 Documentar soluções
