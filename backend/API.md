# API Documentation - Zavlo.ia

## Base URL
```
http://localhost:3001/api/v1
```

## Autenticação

### Registrar Usuário
```http
POST /auth/register
Content-Type: application/json

{
  "email": "usuario@email.com",
  "password": "senha123",
  "name": "Nome do Usuário",
  "phone": "+5531999999999"
}
```

**Resposta:**
```json
{
  "userId": "abc123",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

## Produtos

### Listar Produtos
```http
GET /products?state=MG&city=Belo Horizonte&category=eletronicos&minPrice=100&maxPrice=5000
```

**Parâmetros de Query:**
- `state` (opcional): Sigla do estado (ex: MG, SP, RJ)
- `city` (opcional): Nome da cidade
- `category` (opcional): Categoria do produto
- `minPrice` (opcional): Preço mínimo
- `maxPrice` (opcional): Preço máximo
- `source` (opcional): Fonte (OLX, Mercado Livre, etc)

### Buscar Produto por ID
```http
GET /products/:id
```

### Criar Produto (requer autenticação)
```http
POST /products
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "iPhone 13 Pro Max",
  "description": "iPhone seminovo em ótimo estado",
  "price": 4500.00,
  "images": ["https://...", "https://..."],
  "category": "eletronicos",
  "source": "OLX",
  "sourceUrl": "https://olx.com.br/...",
  "state": "MG",
  "city": "Belo Horizonte",
  "cep": "30130000",
  "sellerName": "João Silva",
  "sellerPhone": "+5531999999999",
  "condition": "used"
}
```

## Busca

### Busca por Texto
```http
GET /search/text?query=geladeira&state=MG&city=Belo Horizonte&category=eletronicos
```

### Busca por Imagem
```http
POST /search/image
Content-Type: application/json

{
  "imageUrl": "https://exemplo.com/imagem.jpg",
  "state": "MG",
  "city": "Belo Horizonte"
}
```

### Sugestões de Busca
```http
GET /search/suggestions?q=gela
```

**Resposta:**
```json
[
  "geladeira",
  "geladeira brastemp",
  "geladeira frost free",
  "geladeira consul"
]
```

## Localização

### Buscar CEP
```http
GET /locations/cep/30130000
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

### Listar Estados
```http
GET /locations/states
```

## Scraping (requer autenticação)

### Scraping OLX
```http
POST /scraping/olx
Authorization: Bearer {token}
Content-Type: application/json

{
  "state": "MG",
  "category": "eletronicos",
  "maxPages": 3
}
```

### Scraping Completo
```http
POST /scraping/all
Authorization: Bearer {token}
Content-Type: application/json

{
  "state": "MG"
}
```

## Notificações (requer autenticação)

### Listar Notificações
```http
GET /notifications
Authorization: Bearer {token}
```

### Marcar como Lida
```http
POST /notifications/:id/read
Authorization: Bearer {token}
```

## Códigos de Status

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Requisição inválida
- `401` - Não autenticado
- `403` - Não autorizado
- `404` - Não encontrado
- `429` - Muitas requisições (rate limit)
- `500` - Erro interno do servidor

## Rate Limiting

- Limite: 10 requisições por minuto por IP
- Header de resposta: `X-RateLimit-Remaining`

## Exemplos com cURL

### Registrar e fazer login
```bash
# Registrar
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","password":"senha123","name":"Teste"}'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","password":"senha123"}'
```

### Buscar produtos
```bash
curl "http://localhost:3001/api/v1/products?state=MG&category=eletronicos"
```

### Buscar por texto
```bash
curl "http://localhost:3001/api/v1/search/text?query=iphone&state=SP"
```
