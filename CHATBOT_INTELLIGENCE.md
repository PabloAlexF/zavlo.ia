# 🤖 Sistema de Inteligência do Chatbot - Zavlo.ia

## 📋 Visão Geral

O chatbot da Zavlo.ia possui inteligência para responder perguntas sobre:
- ✅ Créditos do usuário
- ✅ Recarga/compra de créditos
- ✅ Planos e assinaturas
- ✅ Como usar o sistema
- ✅ Saudações

## 🏗️ Arquitetura

### Backend (Python Service)
**Arquivo:** `python-service/app/models/classifier.py`

O classificador detecta 5 tipos de perguntas:

#### 1. 💳 Perguntas sobre Créditos
**Exemplos:**
- "Quantos créditos tenho?"
- "Qual meu saldo?"
- "Meus créditos"
- "Ver créditos"

**Resposta:**
```
💰 Seus Créditos: X

📊 Custos por busca:
• Busca por texto: 1 crédito
• Busca por imagem: 2 créditos (1 para identificar + 1 para buscar preços)

🔄 Precisa de mais créditos?
Você pode comprar créditos avulsos ou assinar um plano mensal!
```

#### 2. 🔄 Perguntas sobre Recarga
**Exemplos:**
- "Como compro créditos?"
- "Onde faço recarga?"
- "Comprar mais créditos"
- "Preciso de créditos"

**Resposta:**
```
🔄 Como comprar créditos:

Opção 1: Créditos Avulsos
• Acesse: Perfil → Comprar Créditos
• Escolha o pacote desejado
• Pague via PIX instantâneo

Opção 2: Assinar Plano Mensal
• Acesse: Perfil → Planos
• Créditos renovam automaticamente todo mês
• Melhor custo-benefício!

💳 Formas de pagamento:
PIX, Cartão de Crédito e Boleto
```

#### 3. 📊 Perguntas sobre Planos
**Exemplos:**
- "Quais são os planos?"
- "Quanto custa o plano?"
- "Como assinar?"
- "Plano mensal"

**Resposta:**
```
📊 Nossos Planos:

🌱 Básico - R$ 27/mês
• 100 créditos/mês
• Busca por texto e imagem
• Suporte por email

🚀 Pro - R$ 77/mês
• 300 créditos/mês
• Todos os recursos do Básico
• Alertas de preço
• Suporte prioritário

👑 Business - R$ 197/mês
• 1000 créditos/mês
• Todos os recursos do Pro
• API de integração
• Suporte dedicado

👉 Para assinar: Acesse Perfil → Planos
```

#### 4. ❓ Perguntas sobre Uso
**Exemplos:**
- "Como funciona?"
- "Como buscar produtos?"
- "Ajuda"
- "Estou perdido"

**Resposta:**
```
❓ Como usar:

1️⃣ Digite o produto que procura
2️⃣ Responda perguntas se necessário
3️⃣ Veja os melhores preços!

💡 Exemplos:
• "iPhone 13 usado"
• "Honda Civic 2020"
• "Notebook gamer"
```

#### 5. 👋 Saudações
**Exemplos:**
- "Olá"
- "Oi"
- "Bom dia"

**Resposta:**
```
Olá! 👋 Que produto você está procurando?
```

## 🔧 Implementação Técnica

### Python Service (Classificador)

```python
# Padrões de regex compiladas para performance
self.credits_question_patterns_compiled = [
    re.compile(r'\b(quantos?|quanto)\b.*\bcreditos?\b'),
    re.compile(r'\bcreditos?\b.*\b(tenho|restantes?|sobrando|disponiveis?)\b'),
    # ... mais padrões
]

self.recharge_question_patterns_compiled = [
    re.compile(r'\b(como|onde)\b.*\b(comprar|compro)\b.*\bcreditos?\b'),
    # ... mais padrões
]

self.plans_question_patterns_compiled = [
    re.compile(r'\b(quais?|que)\b.*\bplanos?\b'),
    # ... mais padrões
]
```

### Frontend (React/Next.js)

**Arquivo:** `app/chat/page.tsx`

```typescript
// Detecta tipo de pergunta vindo do backend
const questionType = data.classification?.question_type;

if (questionType === 'credits') {
  // Mostra saldo + custos + link para recarga
}

if (questionType === 'recharge') {
  // Mostra como comprar créditos
}

if (questionType === 'plans') {
  // Mostra planos disponíveis
}
```

## 🎯 Fluxo de Detecção

```
Usuário digita pergunta
        ↓
Frontend envia para /search/text
        ↓
NestJS chama Python Service (/api/classify)
        ↓
Python detecta tipo de pergunta
        ↓
Retorna { question_type: 'credits' | 'recharge' | 'plans' | 'usage' }
        ↓
Frontend exibe resposta apropriada
```

## 📊 Prioridade de Detecção

1. **Créditos** (maior prioridade)
2. **Recarga**
3. **Planos**
4. **Uso do sistema**
5. **Saudações**
6. **Busca de produtos** (menor prioridade)

## 🧪 Testes

### Testar Detecção de Créditos
```bash
curl -X POST http://localhost:8001/api/classify \
  -H "Content-Type: application/json" \
  -d '{"query": "quantos creditos tenho?"}'
```

**Resposta esperada:**
```json
{
  "question_type": "credits",
  "is_credits_question": true,
  "is_question": true
}
```

### Testar Detecção de Recarga
```bash
curl -X POST http://localhost:8001/api/classify \
  -H "Content-Type: application/json" \
  -d '{"query": "como compro creditos?"}'
```

**Resposta esperada:**
```json
{
  "question_type": "recharge",
  "is_recharge_question": true,
  "is_question": true
}
```

### Testar Detecção de Planos
```bash
curl -X POST http://localhost:8001/api/classify \
  -H "Content-Type: application/json" \
  -d '{"query": "quais sao os planos?"}'
```

**Resposta esperada:**
```json
{
  "question_type": "plans",
  "is_plans_question": true,
  "is_question": true
}
```

## 🚀 Melhorias Futuras

### Curto Prazo
- [ ] Integrar com dados reais de planos do Firebase
- [ ] Adicionar links clicáveis para páginas de recarga/planos
- [ ] Histórico de consumo de créditos

### Médio Prazo
- [ ] Sugestões personalizadas de planos baseado no uso
- [ ] Alertas quando créditos estão acabando
- [ ] Comparação de planos

### Longo Prazo
- [ ] Integração com LLM (GPT-4, Claude) para respostas mais naturais
- [ ] Suporte a múltiplos idiomas
- [ ] Chatbot com memória de contexto

## 📝 Notas Importantes

1. **Performance:** Regex compiladas são cacheadas para melhor performance
2. **Normalização:** Queries são normalizadas (lowercase, sem acentos) antes da detecção
3. **Prioridade:** Perguntas sobre sistema têm prioridade sobre busca de produtos
4. **Fallback:** Se nenhum padrão for detectado, assume busca de produto

## 🔗 Arquivos Relacionados

- `python-service/app/models/classifier.py` - Detecção de perguntas
- `app/chat/page.tsx` - Lógica do chat no frontend
- `src/modules/search/search.service.ts` - Integração NestJS ↔ Python
- `utils/chat/intentDetector.ts` - Detecção de intenções no frontend (fallback)

## 📞 Suporte

Para dúvidas ou melhorias, consulte a documentação completa ou abra uma issue no repositório.
