# Modo Híbrido Inteligente - Guia de Uso

## 🚀 Como Usar

### 1. Iniciar Serviços

```bash
# Terminal 1: Python Service
cd python-service
python main.py
# Rodando em http://localhost:8001

# Terminal 2: NestJS Backend
npm run start:dev
# Rodando em http://localhost:3001
```

### 2. Testar Classificação (Python API)

```bash
curl -X POST http://localhost:8001/api/classify \
  -H "Content-Type: application/json" \
  -d '{"query": "iPhone 13"}'
```

**Resposta:**
```json
{
  "category": "smartphone",
  "confidence": 1.0,
  "recommended_scrapers": ["google_shopping", "olx"],
  "condition": "unknown",
  "missing_fields": ["condition"],
  "suggested_question": "Você prefere **novo ou usado**?"
}
```

### 3. Testar Busca (NestJS API)

```bash
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "iPhone 13"}'
```

**Resposta (quando precisa perguntar):**
```json
{
  "results": [],
  "total": 0,
  "needsQuestion": true,
  "question": "Você prefere **novo ou usado**?",
  "missingFields": ["condition"],
  "classification": {
    "category": "smartphone",
    "condition": "unknown",
    "recommended_scrapers": ["google_shopping", "olx"]
  }
}
```

**Resposta (quando não precisa perguntar):**
```json
{
  "results": [
    {
      "id": "abc123",
      "title": "iPhone 13 128GB Usado",
      "price": "R$ 2.500,00",
      "image": "https://...",
      "url": "https://...",
      "source": "olx"
    }
  ],
  "total": 1,
  "needsQuestion": false,
  "creditsUsed": 1,
  "remainingCredits": 49
}
```

---

## 📝 Exemplos de Queries

### Busca Direta (sem perguntas)

| Query | Categoria | Condição | Scrapers | Pergunta |
|-------|-----------|----------|----------|----------|
| "iPhone 13 usado 256gb" | marketplace_used | used | olx | ❌ Não |
| "Honda Civic 2020 usado em SP" | car | used | webmotors, mobiauto | ❌ Não |
| "notebook usado" | marketplace_used | used | olx | ❌ Não |
| "Samsung Galaxy S23 novo" | smartphone | new | google_shopping, olx | ❌ Não |

### Busca com Pergunta

| Query | Categoria | Condição | Missing Fields | Pergunta |
|-------|-----------|----------|----------------|----------|
| "iPhone 13" | smartphone | unknown | ["condition"] | ✅ "Você prefere **novo ou usado**?" |
| "Honda Civic 2020" | car | unknown | ["condition", "location"] | ✅ "Você prefere **novo ou usado**?" |
| "Honda Civic 2020 usado" | car | used | ["location"] | ✅ "Em qual **cidade ou estado** você está procurando?" |
| "notebook" | electronics | unknown | ["condition"] | ✅ "Você prefere **novo ou usado**?" |

---

## 🔄 Fluxo de Integração Frontend

### Cenário 1: Query Completa

```typescript
// 1. Usuário digita
const query = "iPhone 13 usado";

// 2. Frontend faz request
const response = await fetch('/api/search', {
  method: 'POST',
  body: JSON.stringify({ query })
});

// 3. Backend retorna resultados diretamente
const data = await response.json();
// data.needsQuestion = false
// data.results = [...]

// 4. Frontend mostra resultados
showResults(data.results);
```

### Cenário 2: Query Incompleta

```typescript
// 1. Usuário digita
const query = "iPhone 13";

// 2. Frontend faz request
const response = await fetch('/api/search', {
  method: 'POST',
  body: JSON.stringify({ query })
});

// 3. Backend retorna pergunta
const data = await response.json();
// data.needsQuestion = true
// data.question = "Você prefere **novo ou usado**?"
// data.missingFields = ["condition"]

// 4. Frontend mostra modal com pergunta
showQuestionModal(data.question);

// 5. Usuário responde "usado"
const answer = "usado";

// 6. Frontend faz nova busca
const newQuery = `${query} ${answer}`; // "iPhone 13 usado"
const finalResponse = await fetch('/api/search', {
  method: 'POST',
  body: JSON.stringify({ query: newQuery })
});

// 7. Backend retorna resultados
const finalData = await finalResponse.json();
// finalData.needsQuestion = false
// finalData.results = [...]

// 8. Frontend mostra resultados
showResults(finalData.results);
```

---

## 🧪 Testes Automatizados

### Teste Completo (8 casos)

```bash
cd python-service
python test_hybrid_mode.py
```

**Saída esperada:**
```
RESULTADO FINAL: 8/8 testes passaram
Taxa de sucesso: 100.0%
```

### Teste Rápido (5 casos)

```bash
cd python-service
python test_api_quick.py
```

**Saída esperada:**
```
Query: iPhone 13
BOT: Você prefere **novo ou usado**?
AGUARDANDO RESPOSTA DO USUARIO...

Query: iPhone 13 usado
EXECUTANDO SCRAPERS: olx
```

---

## 🎨 Formatação de Perguntas

As perguntas usam **markdown bold** (`**texto**`) para destacar opções:

```
"Você prefere **novo ou usado**?"
"Em qual **cidade ou estado** você está procurando?"
```

### Renderizar no Frontend

```typescript
// Remover markdown para texto puro
const plainText = question.replace(/\*\*/g, '');

// Ou renderizar com destaque
const parts = question.split('**');
return (
  <p>
    {parts[0]}
    <strong>{parts[1]}</strong>
    {parts[2]}
  </p>
);
```

---

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# .env
PYTHON_SERVICE_URL=http://localhost:8001
```

### Portas

- Python Service: `8001`
- NestJS Backend: `3001`
- Frontend: `3000`

---

## 📊 Monitoramento

### Logs do Python Service

```bash
# Ver logs em tempo real
cd python-service
python main.py

# Saída:
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8001
```

### Logs do NestJS

```bash
npm run start:dev

# Saída:
[CLASSIFICATION] Classificando query: "iPhone 13"
[CLASSIFICATION] Resultado:
   - Categoria: smartphone
   - Condição: unknown
   - Campos faltantes: condition
[QUESTION] Campos faltantes detectados: condition
[QUESTION] Pergunta sugerida: Você prefere **novo ou usado**?
```

---

## 🐛 Troubleshooting

### Problema: Python service não responde

**Solução:**
```bash
# Verificar se está rodando
curl http://localhost:8001/health

# Reiniciar service
cd python-service
python main.py
```

### Problema: NestJS não encontra Python service

**Solução:**
```bash
# Verificar variável de ambiente
echo $PYTHON_SERVICE_URL  # Linux/Mac
echo %PYTHON_SERVICE_URL%  # Windows

# Deve retornar: http://localhost:8001

# Se não estiver definida, adicionar no .env
echo "PYTHON_SERVICE_URL=http://localhost:8001" >> .env
```

### Problema: Pergunta não aparece no frontend

**Solução:**
```typescript
// Verificar se está checando needsQuestion
if (response.needsQuestion) {
  showQuestion(response.question);
} else {
  showResults(response.results);
}
```

---

## 📚 Referências

- [HYBRID_MODE_DOCUMENTATION.md](./HYBRID_MODE_DOCUMENTATION.md) - Documentação técnica completa
- [HYBRID_MODE_SUMMARY.md](./HYBRID_MODE_SUMMARY.md) - Resumo executivo
- [FRONTEND_HYBRID_EXAMPLE.tsx](./FRONTEND_HYBRID_EXAMPLE.tsx) - Exemplo de código frontend
- [test_hybrid_mode.py](./python-service/test_hybrid_mode.py) - Testes automatizados

---

## ✅ Checklist de Implementação Frontend

- [ ] Criar componente `QuestionModal`
- [ ] Adicionar verificação `needsQuestion` no hook de busca
- [ ] Implementar lógica de enriquecimento de query
- [ ] Adicionar botão "Pular pergunta" (opcional)
- [ ] Testar fluxo completo end-to-end
- [ ] Adicionar loading states
- [ ] Adicionar animações/transições
- [ ] Testar em diferentes dispositivos

---

## 🎯 Próximos Passos

1. **Implementar frontend** seguindo `FRONTEND_HYBRID_EXAMPLE.tsx`
2. **Testar end-to-end** com usuários reais
3. **Coletar métricas** de uso e satisfação
4. **Iterar** baseado em feedback

---

## 💡 Dicas

### Melhorar UX

- Mostrar pergunta como modal/overlay (não como mensagem de chat)
- Usar botões grandes e claros para respostas
- Permitir "pular" pergunta (buscar sem responder)
- Salvar preferências do usuário (ex: sempre buscar "usado")

### Performance

- Cache de classificações (já implementado no Redis)
- Pré-carregar scrapers enquanto usuário responde
- Debounce na busca (evitar requests desnecessários)

### Analytics

- Rastrear quantas perguntas são feitas
- Rastrear quantas perguntas são puladas
- Rastrear tempo de resposta do usuário
- A/B test: modo híbrido vs busca direta
