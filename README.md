# 🚀 Zavlo.ia - Marketplace Aggregator com IA

> Encontre o menor preço da internet em segundos usando Inteligência Artificial

## 📋 Sobre o Projeto

Zavlo.ia é uma plataforma que utiliza IA para buscar e comparar preços em múltiplos marketplaces brasileiros simultaneamente, economizando tempo e dinheiro dos usuários.

### ✨ Principais Funcionalidades

- 🤖 **IA Conversacional** - Chat inteligente para buscar produtos
- 📸 **Busca por Imagem** - Tire uma foto e encontre onde comprar
- 💰 **Comparação de Preços** - Busca em todos os marketplaces do Brasil
- 🔔 **Alertas de Preço** - Notificações quando o preço cair
- 📊 **Histórico de Preços** - Acompanhe a variação de preços
- 🛡️ **Detecção de Fraude** - IA identifica anúncios suspeitos

### 🏪 Marketplaces Integrados

- OLX
- Mercado Livre
- Amazon
- Shopee
- KaBuM
- Enjoei
- Webmotors
- iCarros
- Mobiauto
- E mais...

## 🛠️ Tecnologias

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- Firebase

### Backend
- NestJS
- TypeScript
- Firebase Admin
- Google Vision API
- Playwright (Web Scraping)
- Redis (Cache)

### Pagamentos
- Mercado Pago

## 📦 Estrutura do Projeto

```
zavlo.ia/
├── frontend/          # Aplicação Next.js
│   ├── app/          # Pages e rotas
│   ├── components/   # Componentes React
│   ├── contexts/     # Context API
│   ├── utils/        # Utilitários e helpers
│   └── public/       # Assets estáticos
│
├── backend/          # API NestJS
│   ├── src/
│   │   ├── modules/  # Módulos da aplicação
│   │   ├── common/   # Código compartilhado
│   │   └── config/   # Configurações
│   └── scripts/      # Scripts utilitários
│
└── DEPLOY.md         # Guia de deploy
```

## 🚀 Como Rodar Localmente

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Firebase
- Conta Cloudinary
- Conta Mercado Pago (opcional para testes)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/zavlo.ia.git
cd zavlo.ia
```

### 2. Configure o Backend

```bash
cd backend
npm install
cp .env.example .env
# Edite o .env com suas credenciais
npm run dev
```

### 3. Configure o Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edite o .env.local com suas credenciais
npm run dev
```

### 4. Acesse a aplicação

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 📚 Documentação

- [Guia de Deploy](./DEPLOY.md)
- [API Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)

## 🔐 Variáveis de Ambiente

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
FIREBASE_API_KEY=sua-api-key
JWT_SECRET=seu-jwt-secret
MERCADOPAGO_ACCESS_TOKEN=seu-token
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_FIREBASE_API_KEY=sua-api-key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=seu-cloud-name
```

## 🧪 Testes

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
```

## 📈 Roadmap

- [x] Sistema de busca por texto
- [x] Sistema de busca por imagem
- [x] Chat com IA
- [x] Sistema de pagamentos
- [x] Alertas de preço
- [ ] App Mobile (React Native)
- [ ] API Pública
- [ ] Integração com mais marketplaces
- [ ] Sistema de cashback

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia o [CONTRIBUTING.md](./CONTRIBUTING.md) para detalhes.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

## 👥 Equipe

- **Desenvolvimento** - Zavlo Team
- **Design** - Zavlo Team

## 📞 Contato

- Website: https://zavlo.ia
- Email: contato@zavlo.ia
- Twitter: [@zavloia](https://twitter.com/zavloia)

---

⭐ Se este projeto te ajudou, considere dar uma estrela!
