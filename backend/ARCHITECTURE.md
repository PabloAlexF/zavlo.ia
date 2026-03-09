# Arquitetura do Sistema Zavlo.ia

## 📐 Visão Geral da Arquitetura

O Zavlo.ia segue uma arquitetura de microserviços modular baseada no diagrama fornecido:

```
┌──────────────────────────────────────────────────────────┐
│                 Aplicativos do Usuário                    │
│          Web App • App Mobile • Dashboard Admin          │
└───────────────────────┬──────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│                     API Gateway                           │
│        Autenticação • Rate Limit • Logs • CORS           │
└───────────────────────┬──────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│              Camada de Serviços Backend                   │
└─────┬──────┬──────┬──────┬──────┬──────┬──────┬─────────┘
      │      │      │      │      │      │      │
      ▼      ▼      ▼      ▼      ▼      ▼      ▼
   Auth  Products Search  AI  Scraping Notif Analytics
```

## 🏗️ Módulos Implementados

### 1. **Auth Module** (Autenticação)
- **Responsabilidade**: Gerenciar autenticação e autorização
- **Tecnologias**: JWT, Passport, bcrypt
- **Endpoints**:
  - `POST /auth/register` - Registro de usuário
  - `POST /auth/login` - Login
- **Segurança**: Tokens JWT com refresh tokens

### 2. **Products Module** (Produtos)
- **Responsabilidade**: CRUD de produtos agregados
- **Banco**: Firebase Firestore
- **Cache**: Redis (5 minutos)
- **Endpoints**:
  - `GET /products` - Listar com filtros
  - `GET /products/:id` - Buscar por ID
  - `POST /products` - Criar (autenticado)
  - `DELETE /products/:id` - Deletar (autenticado)

### 3. **Search Module** (Busca)
- **Responsabilidade**: Busca por texto e imagem
- **Funcionalidades**:
  - Busca textual com filtros
  - Busca por imagem (integração com IA)
  - Autocomplete/sugestões
- **Cache**: Redis para buscas frequentes
- **Endpoints**:
  - `GET /search/text?query=...`
  - `POST /search/image`
  - `GET /search/suggestions?q=...`

### 4. **AI Module** (Inteligência Artificial) ⭐ NOVO
- **Responsabilidade**: Classificação e análise com IA
- **Serviços**:
  - **ImageAIService**: Classificação de imagens via Hugging Face
  - **TextAIService**: NLP para categorização e detecção de fraude
- **Modelos**:
  - ViT (Vision Transformer) para imagens
  - CLIP para embeddings
  - Sentence Transformers para texto
- **Endpoints**:
  - `POST /ai/classify-image` - Classificar imagem
  - `POST /ai/classify-text` - Classificar texto
  - `POST /ai/detect-fraud` - Detectar fraude
  - `POST /ai/generate-embedding` - Gerar embeddings

### 5. **Scraping Module** (Web Scraping)
- **Responsabilidade**: Extrair dados de marketplaces
- **Tecnologia**: Playwright (headless browser)
- **Fontes Implementadas**:
  - ✅ OLX (completo)
  - 🔄 Mercado Livre (em desenvolvimento)
  - 📋 Facebook Marketplace (planejado)
- **Cron Jobs**: Scraping automático a cada 6 horas
- **Endpoints**:
  - `POST /scraping/olx` - Scraping manual OLX
  - `POST /scraping/all` - Scraping completo

### 6. **Locations Module** (Geolocalização)
- **Responsabilidade**: Dados de localização brasileira
- **API Externa**: ViaCEP (gratuita)
- **Funcionalidades**:
  - Buscar dados por CEP
  - Listar todos os estados
  - Converter nome → sigla
- **Endpoints**:
  - `GET /locations/cep/:cep`
  - `GET /locations/states`

### 7. **Notifications Module** (Notificações)
- **Responsabilidade**: Sistema de alertas
- **Tipos**:
  - Push notifications (Expo/FCM)
  - Email (planejado)
  - WhatsApp (planejado)
- **Funcionalidades**:
  - Notificar novos produtos
  - Alertas de preço
  - Histórico de notificações
- **Endpoints**:
  - `GET /notifications` - Listar (autenticado)
  - `POST /notifications/:id/read` - Marcar como lida

### 8. **Comparisons Module** (Comparação de Preços) ⭐ NOVO
- **Responsabilidade**: Comparar preços entre fontes
- **Funcionalidades**:
  - Comparação de preços por produto
  - Histórico de preços (30 dias)
  - Melhores ofertas por categoria
  - Preço médio, mínimo e máximo
- **Cache**: Redis (1 hora)
- **Endpoints**:
  - `GET /comparisons/compare?title=...`
  - `GET /comparisons/history/:productId`
  - `GET /comparisons/best-deals?category=...`

### 9. **Analytics Module** (Análise de Dados) ⭐ NOVO
- **Responsabilidade**: Estatísticas e métricas
- **Funcionalidades**:
  - Dashboard com estatísticas gerais
  - Buscas mais populares
  - Produtos mais visualizados
  - Top categorias e estados
  - Tracking de eventos
- **Cache**: Redis (10 minutos)
- **Endpoints**:
  - `GET /analytics/dashboard` - Stats gerais (autenticado)
  - `GET /analytics/popular-searches`
  - `GET /analytics/most-viewed`
  - `POST /analytics/track-search`
  - `POST /analytics/track-view`

### 10. **Users Module** (Usuários)
- **Responsabilidade**: Gerenciar perfis de usuários
- **Endpoints**:
  - `GET /users/profile` - Ver perfil (autenticado)
  - `PUT /users/profile` - Atualizar perfil (autenticado)

## 🗄️ Camada de Dados

### Firebase Firestore (Banco Principal)
**Coleções:**
- `users` - Dados de usuários
- `products` - Produtos agregados
- `notifications` - Notificações
- `search_logs` - Logs de busca
- `product_views` - Visualizações de produtos
- `price_history` - Histórico de preços

### Redis (Cache)
**Uso:**
- Cache de buscas (TTL: 5min)
- Cache de produtos por região (TTL: 5min)
- Cache de comparações (TTL: 1h)
- Cache de analytics (TTL: 10min)
- Rate limiting

## 🔐 Segurança

### Implementado:
- ✅ JWT Authentication
- ✅ Rate Limiting (10 req/min)
- ✅ CORS configurável
- ✅ Validação de dados (class-validator)
- ✅ Filtro global de exceções
- ✅ Logging de requisições

### Planejado:
- 🔄 Helmet.js para headers de segurança
- 🔄 Detecção de fraude com IA
- 🔄 Sanitização de inputs

## 📊 Fluxo de Dados

### Fluxo de Busca por Texto:
```
Usuário → Frontend → API Gateway → Search Module
                                        ↓
                                   Redis Cache?
                                   ↙️        ↘️
                              Sim (retorna)  Não
                                              ↓
                                        Firestore
                                              ↓
                                        Filtros
                                              ↓
                                    Salva no Cache
                                              ↓
                                    Retorna Resultados
```

### Fluxo de Busca por Imagem:
```
Usuário → Upload Imagem → AI Module (ImageAI)
                                ↓
                        Hugging Face API
                                ↓
                        Classificação
                                ↓
                        Search Module
                                ↓
                        Produtos Similares
```

### Fluxo de Scraping:
```
Cron Job (6h) → Scraping Service → Playwright
                                        ↓
                                   OLX/ML/FB
                                        ↓
                                  Parse HTML
                                        ↓
                                  AI Classification
                                        ↓
                                  Products Service
                                        ↓
                                  Firestore
                                        ↓
                                  Notifications
```

## 🚀 Escalabilidade

### Atual (MVP):
- Single instance NestJS
- Firebase Firestore (auto-scaling)
- Redis Upstash (serverless)
- Scraping sequencial

### Futuro (Produção):
- Múltiplas instâncias (Kubernetes)
- Load balancer
- Elasticsearch para busca avançada
- Fila de mensagens (RabbitMQ/SQS)
- Scraping paralelo com workers
- CDN para imagens

## 📈 Métricas e Monitoramento

### Implementado:
- ✅ Logs estruturados
- ✅ Tracking de buscas
- ✅ Tracking de visualizações
- ✅ Dashboard de analytics

### Planejado:
- 🔄 Grafana + Prometheus
- 🔄 Sentry para erros
- 🔄 APM (Application Performance Monitoring)

## 🔄 Integrações Externas

### APIs Utilizadas:
- **Hugging Face**: IA para imagens e texto
- **ViaCEP**: Dados de CEP (gratuito)
- **Firebase**: Banco de dados e autenticação
- **Upstash Redis**: Cache serverless

### Planejadas:
- **Google Maps**: Cálculo de distância
- **Expo Push**: Notificações mobile
- **WhatsApp Cloud API**: Alertas via WhatsApp
- **SendGrid/AWS SES**: Email

## 📝 Próximos Passos

### Curto Prazo:
1. ✅ Implementar módulo de IA
2. ✅ Implementar comparação de preços
3. ✅ Implementar analytics
4. 🔄 Adicionar Elasticsearch
5. 🔄 Melhorar scraping (Mercado Livre)

### Médio Prazo:
1. Sistema de alertas inteligentes
2. Recomendações personalizadas
3. API pública para desenvolvedores
4. Dashboard administrativo completo

### Longo Prazo:
1. Machine Learning para previsão de preços
2. Chatbot com IA
3. Marketplace próprio
4. Expansão internacional

## 🛠️ Tecnologias

- **Backend**: NestJS + TypeScript
- **Banco**: Firebase Firestore
- **Cache**: Redis (Upstash)
- **IA**: Hugging Face (ViT, CLIP, Transformers)
- **Scraping**: Playwright
- **Auth**: JWT + Passport
- **Deploy**: Railway / Render / Vercel

---

**Versão**: 1.0.0  
**Última Atualização**: 2024  
**Equipe**: Zavlo Team
