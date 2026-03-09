# Guia de Testes - Zavlo.ia API

## 🧪 Como Testar a API

### Pré-requisitos
- Backend rodando em `http://localhost:3001`
- Postman, Insomnia ou cURL instalado
- Credenciais do Firebase configuradas

## 📝 Coleção de Testes

### 1. Health Check
```bash
curl http://localhost:3001/health
```

**Resposta Esperada:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "services": {
    "firebase": "ok",
    "redis": "ok"
  }
}
```

---

### 2. Autenticação

#### Registrar Usuário
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@zavlo.com",
    "password": "senha123",
    "name": "Usuário Teste",
    "phone": "+5531999999999"
  }'
```

**Resposta:**
```json
{
  "userId": "abc123",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@zavlo.com",
    "password": "senha123"
  }'
```

---

### 3. Produtos

#### Listar Produtos
```bash
curl "http://localhost:3001/api/v1/products?state=MG&category=eletronicos&limit=10"
```

#### Buscar por ID
```bash
curl http://localhost:3001/api/v1/products/PRODUCT_ID
```

#### Criar Produto (requer token)
```bash
curl -X POST http://localhost:3001/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "title": "iPhone 13 Pro Max 256GB",
    "description": "iPhone seminovo em perfeito estado",
    "price": 4500.00,
    "images": ["https://exemplo.com/img1.jpg"],
    "category": "eletronicos",
    "source": "OLX",
    "sourceUrl": "https://olx.com.br/anuncio/123",
    "state": "MG",
    "city": "Belo Horizonte",
    "cep": "30130000",
    "sellerName": "João Silva",
    "sellerPhone": "+5531999999999",
    "condition": "used"
  }'
```

---

### 4. Busca

#### Busca por Texto
```bash
curl "http://localhost:3001/api/v1/search/text?query=iphone&state=MG&category=eletronicos"
```

#### Busca por Imagem
```bash
curl -X POST http://localhost:3001/api/v1/search/image \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://exemplo.com/iphone.jpg",
    "state": "SP"
  }'
```

#### Sugestões
```bash
curl "http://localhost:3001/api/v1/search/suggestions?q=iph"
```

---

### 5. Inteligência Artificial

#### Classificar Imagem
```bash
curl -X POST http://localhost:3001/api/v1/ai/classify-image \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://exemplo.com/produto.jpg"
  }'
```

**Resposta:**
```json
{
  "category": "eletronicos",
  "confidence": 0.95,
  "keywords": ["celular", "smartphone", "iphone"]
}
```

#### Classificar Texto
```bash
curl -X POST http://localhost:3001/api/v1/ai/classify-text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Vendo iPhone 13 Pro Max 256GB seminovo"
  }'
```

#### Detectar Fraude
```bash
curl -X POST http://localhost:3001/api/v1/ai/detect-fraud \
  -H "Content-Type: application/json" \
  -d '{
    "title": "iPhone 13 URGENTE",
    "description": "Ganhe dinheiro rápido",
    "price": 5.00
  }'
```

---

### 6. Localização

#### Buscar CEP
```bash
curl http://localhost:3001/api/v1/locations/cep/30130000
```

**Resposta:**
```json
{
  "cep": "30130-000",
  "logradouro": "Avenida Afonso Pena",
  "bairro": "Centro",
  "localidade": "Belo Horizonte",
  "uf": "MG"
}
```

#### Listar Estados
```bash
curl http://localhost:3001/api/v1/locations/states
```

---

### 7. Comparação de Preços

#### Comparar Produto
```bash
curl "http://localhost:3001/api/v1/comparisons/compare?title=iPhone 13"
```

**Resposta:**
```json
{
  "productTitle": "iPhone 13",
  "averagePrice": 3500.00,
  "minPrice": 3000.00,
  "maxPrice": 4200.00,
  "sources": [
    {
      "source": "OLX",
      "price": 3200.00,
      "url": "https://olx.com.br/..."
    },
    {
      "source": "Mercado Livre",
      "price": 3800.00,
      "url": "https://mercadolivre.com.br/..."
    }
  ]
}
```

#### Histórico de Preços
```bash
curl "http://localhost:3001/api/v1/comparisons/history/PRODUCT_ID?days=30"
```

#### Melhores Ofertas
```bash
curl "http://localhost:3001/api/v1/comparisons/best-deals?category=eletronicos&limit=10"
```

---

### 8. Analytics

#### Dashboard (requer autenticação)
```bash
curl http://localhost:3001/api/v1/analytics/dashboard \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta:**
```json
{
  "totalProducts": 1523,
  "totalSearches": 4567,
  "topCategories": [
    { "category": "eletronicos", "count": 450 },
    { "category": "veiculos", "count": 320 }
  ],
  "topStates": [
    { "state": "SP", "count": 600 },
    { "state": "MG", "count": 400 }
  ],
  "averagePrice": 1250.50
}
```

#### Buscas Populares
```bash
curl http://localhost:3001/api/v1/analytics/popular-searches
```

#### Produtos Mais Visualizados
```bash
curl http://localhost:3001/api/v1/analytics/most-viewed
```

#### Tracking de Busca
```bash
curl -X POST http://localhost:3001/api/v1/analytics/track-search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "iphone 13",
    "userId": "user123",
    "filters": { "state": "MG" }
  }'
```

---

### 9. Scraping (requer autenticação)

#### Scraping OLX
```bash
curl -X POST http://localhost:3001/api/v1/scraping/olx \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "state": "MG",
    "category": "eletronicos",
    "maxPages": 3
  }'
```

**Resposta:**
```json
{
  "scraped": 45,
  "state": "MG",
  "category": "eletronicos"
}
```

#### Scraping Completo
```bash
curl -X POST http://localhost:3001/api/v1/scraping/all \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "state": "SP"
  }'
```

---

### 10. Notificações (requer autenticação)

#### Listar Notificações
```bash
curl http://localhost:3001/api/v1/notifications \
  -H "Authorization: Bearer SEU_TOKEN"
```

#### Marcar como Lida
```bash
curl -X POST http://localhost:3001/api/v1/notifications/NOTIFICATION_ID/read \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

### 11. Usuários (requer autenticação)

#### Ver Perfil
```bash
curl http://localhost:3001/api/v1/users/profile \
  -H "Authorization: Bearer SEU_TOKEN"
```

#### Atualizar Perfil
```bash
curl -X PUT http://localhost:3001/api/v1/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "name": "Novo Nome",
    "phone": "+5531988888888"
  }'
```

---

## 🔄 Fluxo de Teste Completo

### 1. Registrar e Autenticar
```bash
# Registrar
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@zavlo.com","password":"senha123","name":"Teste"}' \
  | jq -r '.accessToken')

echo "Token: $TOKEN"
```

### 2. Buscar Produtos
```bash
curl "http://localhost:3001/api/v1/search/text?query=iphone&state=MG"
```

### 3. Ver Analytics
```bash
curl http://localhost:3001/api/v1/analytics/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Executar Scraping
```bash
curl -X POST http://localhost:3001/api/v1/scraping/olx \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"state":"MG","category":"eletronicos","maxPages":2}'
```

### 5. Comparar Preços
```bash
curl "http://localhost:3001/api/v1/comparisons/compare?title=iPhone 13"
```

---

## 📊 Testes de Performance

### Teste de Carga
```bash
# Instalar Apache Bench
sudo apt-get install apache2-utils

# Testar endpoint de busca
ab -n 1000 -c 10 "http://localhost:3001/api/v1/products"
```

### Teste de Rate Limit
```bash
# Fazer 15 requisições rápidas (limite é 10/min)
for i in {1..15}; do
  curl http://localhost:3001/api/v1/products
  echo "Request $i"
done
```

---

## 🐛 Testes de Erro

### Token Inválido
```bash
curl http://localhost:3001/api/v1/users/profile \
  -H "Authorization: Bearer token_invalido"
```

**Resposta Esperada:** 401 Unauthorized

### CEP Inválido
```bash
curl http://localhost:3001/api/v1/locations/cep/00000000
```

**Resposta Esperada:** null ou erro

### Produto Não Encontrado
```bash
curl http://localhost:3001/api/v1/products/id_inexistente
```

**Resposta Esperada:** null

---

## 📝 Checklist de Testes

- [ ] Health check retorna status ok
- [ ] Registro de usuário funciona
- [ ] Login retorna token válido
- [ ] Busca por texto retorna resultados
- [ ] Busca por imagem funciona
- [ ] IA classifica imagens corretamente
- [ ] IA classifica texto corretamente
- [ ] Detecção de fraude funciona
- [ ] CEP retorna dados corretos
- [ ] Comparação de preços funciona
- [ ] Analytics retorna estatísticas
- [ ] Scraping OLX funciona
- [ ] Notificações são criadas
- [ ] Rate limit bloqueia após 10 req
- [ ] Tokens inválidos são rejeitados

---

## 🎯 Resultado Esperado

Todos os endpoints devem:
- ✅ Retornar status 200/201 para sucesso
- ✅ Retornar JSON válido
- ✅ Respeitar rate limiting
- ✅ Validar dados de entrada
- ✅ Tratar erros adequadamente
- ✅ Logar requisições

---

**Dica**: Use Postman ou Insomnia para salvar uma coleção de testes e executar todos de uma vez!
