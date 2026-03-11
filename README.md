# Zavlo.ia Backend

Backend do sistema Zavlo.ia - Plataforma agregadora de marketplaces brasileiros com busca inteligente por texto e imagem.

## 🚀 Tecnologias

- **Framework**: NestJS + TypeScript
- **Banco de Dados**: Firebase Firestore
- **Cache**: Redis (Upstash)
- **Autenticação**: JWT + Passport
- **Scraping**: Playwright
- **IA**: Hugging Face (ViT, CLIP, Transformers)
- **Geolocalização**: ViaCEP API

## ✨ Funcionalidades Principais

### 🔐 Autenticação
- Registro e login com JWT
- Refresh tokens
- Rate limiting (10 req/min)

### 🔍 Busca Inteligente
- Busca por texto com filtros avançados
- Busca por imagem com IA
- Autocomplete e sugestões
- Cache Redis para performance

### 🤖 Inteligência Artificial
- Classificação automática de imagens (Hugging Face ViT)
- Classificação de texto e NLP
- Detecção de fraude
- Geração de embeddings

### 🕷️ Web Scraping
- Scraping automático (OLX implementado)
- Cron jobs a cada 6 horas
- Suporte a múltiplos marketplaces

### 💰 Comparação de Preços
- Comparar preços entre fontes
- Histórico de preços (30 dias)
- Melhores ofertas por categoria

### 📊 Analytics
- Dashboard com estatísticas
- Tracking de buscas e visualizações
- Top categorias e estados
- Produtos mais visualizados

### 🔔 Notificações
- Sistema de alertas
- Notificações de novos produtos
- Histórico completo

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/              # Configurações (Firebase, Redis)
│   ├── modules/
│   │   ├── auth/           # Autenticação e autorização
│   │   ├── products/       # Gerenciamento de produtos
│   │   ├── search/         # Busca por texto e imagem
│   │   ├── locations/      # Geolocalização (CEP, estados)
│   │   ├── scraping/       # Web scraping dos marketplaces
│   │   └── notifications/  # Sistema de notificações
│   ├── app.module.ts
│   └── main.ts
├── .env.example
├── package.json
└── README.md
```

## 🔧 Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e preencha as variáveis:

```bash
cp .env.example .env
```

### 3. Configurar Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Vá em **Project Settings** > **Service Accounts**
4. Clique em **Generate New Private Key**
5. Copie as credenciais para o `.env`:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY`
   - `FIREBASE_CLIENT_EMAIL`

### 4. Configurar Redis (Upstash)

1. Acesse [Upstash](https://upstash.com/)
2. Crie um banco Redis
3. Copie a URL de conexão para `REDIS_URL` no `.env`

## 🏃 Executar o Projeto

### Desenvolvimento

```bash
npm run start:dev
```

### Produção

```bash
npm run build
npm run start:prod
```

## 📡 Endpoints da API

### Autenticação

- `POST /api/v1/auth/register` - Registrar novo usuário
- `POST /api/v1/auth/login` - Login

### Produtos

- `GET /api/v1/products` - Listar produtos (com filtros)
- `GET /api/v1/products/:id` - Buscar produto por ID
- `POST /api/v1/products` - Criar produto (requer autenticação)
- `DELETE /api/v1/products/:id` - Deletar produto (requer autenticação)

### Busca

- `GET /api/v1/search/text?query=geladeira&state=MG` - Busca por texto
- `POST /api/v1/search/image` - Busca por imagem
- `GET /api/v1/search/suggestions?q=gela` - Sugestões de busca

### Localização

- `GET /api/v1/locations/cep/:cep` - Buscar dados do CEP
- `GET /api/v1/locations/states` - Listar todos os estados

### Scraping (requer autenticação)

- `POST /api/v1/scraping/olx` - Executar scraping da OLX
- `POST /api/v1/scraping/mercadolivre` - Executar scraping do Mercado Livre
- `POST /api/v1/scraping/all` - Executar scraping de todas as fontes

### Notificações (requer autenticação)

- `GET /api/v1/notifications` - Listar notificações do usuário
- `POST /api/v1/notifications/:id/read` - Marcar como lida

## 🗄️ Estrutura do Firebase Firestore

### Coleção: users

```json
{
  "email": "usuario@email.com",
  "password": "hash_bcrypt",
  "name": "Nome do Usuário",
  "phone": "+5531999999999",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Coleção: products

```json
{
  "title": "iPhone 13 Pro Max",
  "description": "iPhone seminovo em ótimo estado",
  "price": 4500.00,
  "images": ["url1", "url2"],
  "category": "eletronicos",
  "source": "OLX",
  "sourceUrl": "https://olx.com.br/...",
  "location": {
    "state": "MG",
    "city": "Belo Horizonte",
    "cep": "30130-000"
  },
  "seller": {
    "name": "João Silva",
    "phone": "+5531999999999"
  },
  "condition": "used",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "scrapedAt": "timestamp"
}
```

### Coleção: notifications

```json
{
  "userId": "user_id",
  "title": "Novo produto encontrado!",
  "body": "iPhone 13 Pro Max está disponível",
  "data": {
    "productId": "product_id",
    "type": "new_product"
  },
  "read": false,
  "createdAt": "timestamp"
}
```

## 🔐 Autenticação

Todas as rotas protegidas requerem um token JWT no header:

```
Authorization: Bearer <seu_token_jwt>
```

## 🌐 Marketplaces Suportados

### Nacionais
- Mercado Livre
- OLX
- Shopee
- Magazine Luiza
- Amazon Brasil
- Casas Bahia
- Americanas

### Por Estado
- **MG**: Classificados do Estado de Minas, Vrum
- **BA**: Feira do Rolo de Conquista
- Todos os estados: Facebook Marketplace, grupos locais

## 📊 Cache com Redis

O sistema utiliza Redis para:
- Cache de buscas frequentes (TTL: 5 minutos)
- Cache de produtos por região (TTL: 5 minutos)
- Sugestões de busca (TTL: 10 minutos)
- Rate limiting

## 🤖 Scraping

O sistema utiliza Playwright para fazer scraping dos marketplaces:

- **OLX**: Implementado
- **Mercado Livre**: Em desenvolvimento
- **Facebook Marketplace**: Planejado

### Executar scraping manual

```bash
# Via API (requer autenticação)
POST /api/v1/scraping/olx
{
  "state": "MG",
  "category": "eletronicos",
  "maxPages": 3
}
```

## 🚀 Deploy

### Railway

1. Conecte seu repositório no Railway
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Render

1. Crie um novo Web Service
2. Configure as variáveis de ambiente
3. Build Command: `npm install && npm run build`
4. Start Command: `npm run start:prod`

## 📝 Próximos Passos

- [ ] Integrar IA para busca por imagem (Hugging Face)
- [ ] Implementar scraping do Mercado Livre
- [ ] Adicionar Elasticsearch para busca avançada
- [ ] Implementar sistema de alertas de preço
- [ ] Adicionar suporte a WhatsApp Cloud API
- [ ] Implementar cron jobs para scraping automático
- [ ] Adicionar testes unitários e E2E

## 📄 Licença

MIT

## 👥 Equipe

Zavlo Team - 2024
