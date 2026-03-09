# 🚀 Zavlo.ia - Marketplace Aggregator com IA

> Plataforma completa de busca e comparação de preços com Inteligência Artificial para o mercado brasileiro

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Backend: NestJS](https://img.shields.io/badge/Backend-NestJS-red)](https://nestjs.com/)
[![Frontend: Next.js](https://img.shields.io/badge/Frontend-Next.js-black)](https://nextjs.org/)
[![Database: Firebase](https://img.shields.io/badge/Database-Firebase-orange)](https://firebase.google.com/)

## 📋 Índice

- [Sobre](#sobre)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [API](#api)
- [Deploy](#deploy)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## 🎯 Sobre

**Zavlo.ia** é uma plataforma SaaS que agrega produtos de múltiplos marketplaces brasileiros e utiliza Inteligência Artificial para facilitar a busca e comparação de preços. O sistema oferece:

- 🔍 **Busca Inteligente**: Por texto ou imagem
- 🤖 **IA Integrada**: Classificação automática e detecção de fraude
- 💰 **Comparação de Preços**: Entre múltiplas fontes
- 📊 **Analytics**: Métricas e estatísticas em tempo real
- 🔔 **Notificações**: Sistema de alertas de preço

## ✨ Funcionalidades

### Backend (100% Completo)
- ✅ Autenticação JWT completa
- ✅ CRUD de produtos
- ✅ Busca por texto com filtros avançados
- ✅ Busca por imagem com IA (Hugging Face)
- ✅ Classificação automática de produtos
- ✅ Detecção de fraude com IA
- ✅ Web scraping automático (OLX)
- ✅ Cron jobs para atualização
- ✅ Comparação de preços
- ✅ Histórico de preços
- ✅ Analytics completo
- ✅ Sistema de notificações
- ✅ Geolocalização (ViaCEP)
- ✅ Cache Redis (Upstash)
- ✅ Rate limiting
- ✅ Logging estruturado

### Frontend (Em Desenvolvimento)
- ✅ Interface de chat com IA
- ✅ Upload e busca por imagem
- ✅ Sistema de créditos
- ✅ Perfil do usuário
- ✅ Favoritos
- ✅ Histórico de buscas
- 🔄 Dashboard de analytics
- 🔄 Sistema de notificações push

## 🛠️ Tecnologias

### Backend
```
Framework:    NestJS 10 + TypeScript 5
Banco:        Firebase Firestore
Cache:        Redis (Upstash)
IA:           Hugging Face (ViT, CLIP, Transformers)
Scraping:     Playwright
Auth:         JWT + Passport
Pagamentos:   Stripe
Deploy:       Railway / Render
```

### Frontend
```
Framework:    Next.js 14 + React 18
UI:           TailwindCSS + Framer Motion
State:        Context API + localStorage
Icons:        Lucide React
Deploy:       Vercel
```

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────┐
│        Frontend (Next.js + React)           │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         API Gateway (NestJS)                │
│  Auth • Rate Limit • Logs • CORS           │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────┐    ┌──────────────────┐
│   Firebase   │    │   Redis Cache    │
│  Firestore   │    │    (Upstash)     │
└──────────────┘    └──────────────────┘
        │                     │
        └──────────┬──────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────┐    ┌──────────────────┐
│ Hugging Face │    │   Playwright     │
│   (IA API)   │    │   (Scraping)     │
└──────────────┘    └──────────────────┘
```

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Firebase
- Conta Upstash (Redis)
- Conta Hugging Face

### Clone o repositório
```bash
git clone https://github.com/seu-usuario/zavlo.ia.git
cd zavlo.ia
```

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configure as variáveis de ambiente no .env
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Configure as variáveis de ambiente no .env.local
npm run dev
```

## ⚙️ Configuração

### Backend (.env)
```env
# Firebase
FIREBASE_PROJECT_ID=seu-projeto
FIREBASE_PRIVATE_KEY=sua-chave
FIREBASE_CLIENT_EMAIL=seu-email

# Redis
REDIS_URL=sua-url-upstash

# Hugging Face
HUGGINGFACE_API_KEY=sua-chave

# JWT
JWT_SECRET=seu-secret

# API
PORT=3001
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_API_KEY=sua-chave
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-dominio
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto
```

## 🚀 Uso

### Iniciar Backend
```bash
cd backend
npm run start:dev
```
API disponível em: `http://localhost:3001`

### Iniciar Frontend
```bash
cd frontend
npm run dev
```
App disponível em: `http://localhost:3000`

### Testar API
```bash
curl http://localhost:3001/health
```

## 📚 API

### Endpoints Principais

#### Autenticação
```
POST   /api/v1/auth/register    - Registrar usuário
POST   /api/v1/auth/login       - Login
GET    /api/v1/auth/profile     - Perfil do usuário
```

#### Busca
```
GET    /api/v1/search/text      - Busca por texto
POST   /api/v1/search/image     - Busca por imagem
```

#### Produtos
```
GET    /api/v1/products         - Listar produtos
GET    /api/v1/products/:id     - Detalhes do produto
POST   /api/v1/products         - Criar produto
```

#### Usuários
```
GET    /api/v1/users/profile    - Perfil
GET    /api/v1/users/usage      - Uso de créditos
PATCH  /api/v1/users/profile    - Atualizar perfil
```

Documentação completa: [backend/API.md](./backend/API.md)

## 🌐 Marketplaces Suportados

- ✅ **Amazon** - Produtos novos
- ✅ **KaBuM** - Eletrônicos
- ✅ **OLX** - Produtos usados
- ✅ **Enjoei** - Produtos usados
- ✅ **Webmotors** - Veículos
- ✅ **iCarros** - Veículos
- ✅ **Mobiauto** - Veículos
- ✅ **Mercado Livre** - API Oficial
- ✅ **Shopee** - API Pública

## 📊 Status do Projeto

| Componente | Status | Progresso |
|------------|--------|-----------|
| Backend | ✅ Completo | 100% |
| API | ✅ Funcional | 40+ endpoints |
| IA | ✅ Integrada | Hugging Face |
| Scraping | ✅ OLX | Automático |
| Docs | ✅ Completa | 8 arquivos |
| Frontend | 🔄 Desenvolvimento | 70% |
| Mobile | 📋 Planejado | 0% |

## 🚢 Deploy

### Backend (Railway/Render)
```bash
# Configure as variáveis de ambiente
# Deploy automático via Git
git push origin main
```

### Frontend (Vercel)
```bash
# Conecte o repositório no Vercel
# Deploy automático via Git
```

Guia completo: [backend/DEPLOY.md](./backend/DEPLOY.md)

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

Zavlo Team - 2024

## 📞 Contato

- Website: [zavlo.ia](https://zavlo.ia)
- Email: contato@zavlo.ia

## 🙏 Agradecimentos

- [NestJS](https://nestjs.com/)
- [Next.js](https://nextjs.org/)
- [Firebase](https://firebase.google.com/)
- [Hugging Face](https://huggingface.co/)
- [Upstash](https://upstash.com/)

---

⭐ Se este projeto te ajudou, considere dar uma estrela!
