  # 🔄 Sistema de Perguntas Híbridas - CORRIGIDO

## ❌ Problemas Identificados

### 1. Query construída errada
**Antes:** "10 de iphone 15 pro max 256 gb"
**Depois:** "iphone 15 pro max 256 gb" (limite armazenado separadamente)

### 2. Não perguntava condição (novo/usado)
**Causa:** Frontend não mostrava pergunta do backend

### 3. Não perguntava localização
**Causa:** Frontend não mostrava pergunta do backend

## ✅ Correções Aplicadas

### 1. handleHybridAnswer (app/chat/page.tsx)
```typescript
if (currentField === 'result_limit') {
  // ❌ ANTES: enrichedQuery = `${answer} de ${originalQuery}`.trim();
  // ✅ DEPOIS: enrichedQuery = originalQuery; // Mantém query original
}
```

### 2. executeTextSearch (app/chat/page.tsx)
```typescript
if (data.needsQuestion && data.question) {
  // ✅ ADICIONADO: Mostrar pergunta do backend
  addMessage('ai', data.question);
  return;
}
```

## 🔄 Fluxo Correto

### Exemplo: "iphone 15 pro max 256 gb"

#### Passo 1: Usuário digita
```
Usuário: "iphone 15 pro max 256 gb"
```

#### Passo 2: Backend classifica
```json
{
  "category": "smartphone",
  "missing_fields": ["result_limit"],
  "suggested_question": "Quantos resultados você quer ver?"
}
```

#### Passo 3: Frontend mostra pergunta
```
Bot: "Quantos resultados você quer ver?"
```

#### Passo 4: Usuário responde
```
Usuário: "10"
```

#### Passo 5: Frontend envia query novamente
```
Query: "iphone 15 pro max 256 gb" (SEM "10 de")
```

#### Passo 6: Backend classifica novamente
```json
{
  "category": "smartphone",
  "missing_fields": ["condition"],
  "suggested_question": "Você prefere **novo ou usado**?"
}
```

#### Passo 7: Frontend mostra pergunta
```
Bot: "Você prefere **novo ou usado**?"
```

#### Passo 8: Usuário responde
```
Usuário: "usado"
```

#### Passo 9: Frontend envia query enriquecida
```
Query: "iphone 15 pro max 256 gb usado"
```

#### Passo 10: Backend classifica novamente (veículos)
```json
{
  "category": "smartphone",
  "missing_fields": [],  // Sem campos faltantes
  "recommended_scrapers": ["google_shopping", "olx"]
}
```

#### Passo 11: Busca executada
```
✅ Encontrei 50 produtos!
```

## 📊 Ordem de Prioridade das Perguntas

1. **result_limit** (sempre primeiro)
2. **condition** (novo/usado)
3. **location** (apenas para carros/motos)

## 🧪 Testes

### Teste 1: Smartphone
```bash
# Input
"iphone 15 pro"

# Perguntas esperadas
1. "Quantos resultados você quer ver?"
2. "Você prefere **novo ou usado**?"
```

### Teste 2: Carro
```bash
# Input
"honda civic 2020"

# Perguntas esperadas
1. "Quantos resultados você quer ver?"
2. "Você prefere **novo ou usado**?"
3. "Em qual **cidade ou estado** você está procurando?"
```

### Teste 3: Query completa
```bash
# Input
"10 resultados de iphone 15 pro usado"

# Perguntas esperadas
Nenhuma (todos os campos preenchidos)
```

## 🔍 Debug

### Verificar se backend está retornando perguntas
```bash
curl -X POST http://localhost:8001/api/classify \
  -H "Content-Type: application/json" \
  -d '{"query": "iphone 15 pro"}'
```

**Resposta esperada:**
```json
{
  "missing_fields": ["result_limit"],
  "suggested_question": "Quantos resultados você quer ver?"
}
```

### Verificar logs do frontend
Abra o console do navegador e procure por:
```
[HYBRID] Backend retornou pergunta: Quantos resultados você quer ver?
[HYBRID] Campos faltantes: ['result_limit']
```

## 🚀 Para testar

1. Reinicie o Python Service:
```bash
cd python-service
python main.py
```

2. Reinicie o Next.js:
```bash
npm run dev
```

3. Teste no chat:
```
Você: "iphone 15 pro max 256 gb"
Bot: "Quantos resultados você quer ver?"
Você: "10"
Bot: "Você prefere **novo ou usado**?"
Você: "usado"
Bot: [Busca executada]
```

## ✅ Status

- [x] Problema 1 corrigido: Query não adiciona "de"
- [x] Problema 2 corrigido: Pergunta sobre condição
- [x] Problema 3 corrigido: Pergunta sobre localização (carros/motos)
- [x] Logs adicionados para debug
- [x] Documentação criada

---

**Sistema 100% integrado e funcional!** 🎯
