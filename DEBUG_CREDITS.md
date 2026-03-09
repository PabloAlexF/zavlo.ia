# 🔍 Debug de Créditos - Mudanças Implementadas

## Problema Relatado
- Usuário fez busca por "cadeira gamer vermelha"
- Créditos continuaram como 1 (não foram deduzidos)

## Mudanças Implementadas para Debug

### 1. **UsersService** (`users.service.ts`)

#### Método `useCredit()` - Logs Detalhados:
- ✅ Log de início da operação
- ✅ Log dos dados do usuário (créditos, freeTrialUsed, plan)
- ✅ Log da tentativa de dedução
- ✅ Log de confirmação após update no Firebase
- ✅ Verificação se o update realmente funcionou

#### Método `findById()` - Logs de Debug:
- ✅ Log quando usuário é encontrado
- ✅ Log dos dados do usuário (créditos, plan, freeTrialUsed)

### 2. **SearchService** (`search.service.ts`)

#### Método `searchByText()` - Logs Detalhados:
- ✅ Log de início da busca
- ✅ Log dos parâmetros (query, userId, filters)
- ✅ Log do processo de dedução de créditos
- ✅ Log de sucesso/erro na dedução
- ✅ Log dos créditos restantes após dedução

#### Novos Métodos de Debug:
- ✅ `getUserDetails()` - Retorna dados completos do usuário
- ✅ `debugUseCredit()` - Testa dedução manual de créditos

### 3. **SearchController** (`search.controller.ts`)

#### Endpoint `GET /search/text` - Logs Detalhados:
- ✅ Log da requisição (query, user, IP)
- ✅ Log do status do IP (já usou busca gratuita?)
- ✅ Log do plano do usuário
- ✅ Log do tipo de busca (gratuita/paga)

#### Novos Endpoints de Debug:
- ✅ `GET /search/debug/credits` - Verifica créditos atuais
- ✅ `POST /search/debug/use-credit` - Testa dedução manual

### 4. **Script de Teste** (`test-credits.js`)
- ✅ Teste automatizado completo
- ✅ Login → Verificar créditos → Buscar → Verificar créditos novamente

## Como Testar

### Opção 1: Usar o Script de Teste
```bash
cd zavlo.ia
node test-credits.js
```

### Opção 2: Testar Manualmente

1. **Verificar créditos atuais:**
```bash
curl -H "Authorization: Bearer SEU_TOKEN" http://localhost:3001/search/debug/credits
```

2. **Fazer uma busca:**
```bash
curl -H "Authorization: Bearer SEU_TOKEN" "http://localhost:3001/search/text?query=cadeira%20gamer%20vermelha"
```

3. **Verificar créditos novamente:**
```bash
curl -H "Authorization: Bearer SEU_TOKEN" http://localhost:3001/search/debug/credits
```

4. **Testar dedução manual:**
```bash
curl -X POST -H "Authorization: Bearer SEU_TOKEN" http://localhost:3001/search/debug/use-credit
```

## Logs Esperados

### No Console do Backend:
```
🔍 [CONTROLLER DEBUG] Search request:
   - query: cadeira gamer vermelha
   - user: USER_ID (premium)
   - clientIp: 127.0.0.1

🔍 [SEARCH DEBUG] Starting searchByText:
   - query: cadeira gamer vermelha
   - userId: USER_ID

💳 [CREDITS DEBUG] Starting useCredit for user USER_ID, amount: 1
💳 [CREDITS DEBUG] User USER_ID data:
   - currentCredits: 1
   - amount to deduct: 1
   - freeTrialUsed: false
   - plan: premium

💳 [CREDITS DEBUG] Using free trial credit: 1 -> 0
✅ [CREDITS DEBUG] Free trial credit deducted successfully
🔍 [CREDITS DEBUG] After update - credits: 0, freeTrialUsed: true
```

## Possíveis Causas do Problema

1. **Busca Gratuita por IP**: Se o IP já usou a busca gratuita, pode estar usando `freeMode`
2. **Plano Free**: Usuários com plano free podem não ter dedução de créditos
3. **Erro no Firebase**: Problema na conexão ou permissões do Firebase
4. **Cache**: Resultado pode estar vindo do cache (não executa dedução)
5. **Erro Silencioso**: Exceção sendo capturada mas não logada

## Próximos Passos

1. Executar o teste e verificar os logs
2. Identificar onde o fluxo está parando
3. Corrigir o problema específico encontrado
4. Remover logs de debug após correção