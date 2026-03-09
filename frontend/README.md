# Zavlo.ia Frontend

Interface web moderna e responsiva para o sistema Zavlo.ia.

## 🚀 Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilo**: TailwindCSS
- **UI**: Componentes customizados

## 📁 Estrutura

```
frontend/
├── app/                    # Rotas do Next.js
│   ├── page.tsx           # Página inicial
│   ├── compare/           # Comparação de preços
│   ├── search/            # Busca de produtos
│   ├── about/             # Sobre o projeto
│   └── product/           # Detalhes do produto
├── components/
│   ├── ui/                # Componentes base (Button, etc)
│   ├── layout/            # Header, Footer
│   └── features/          # Componentes de funcionalidades
├── hooks/                 # Custom hooks
├── lib/                   # Utilitários e API
└── types/                 # TypeScript types
```

## 🎨 Funcionalidades

### ✅ Implementadas
- [x] Página inicial com hero section
- [x] Busca por texto
- [x] Busca por imagem (upload)
- [x] Listagem de produtos
- [x] Comparação de preços
- [x] Design mobile-first
- [x] Componentes reutilizáveis
- [x] Integração com API

### 🔄 Em Desenvolvimento
- [ ] Página de detalhes do produto
- [ ] Sistema de autenticação
- [ ] Perfil do usuário
- [ ] Notificações
- [ ] Histórico de buscas

## 🚀 Como Executar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Ambiente
```bash
cp .env.local.example .env.local
# Editar .env.local com a URL da API
```

### 3. Executar
```bash
npm run dev
```

Acesse: http://localhost:3000

## 📱 Design Mobile-First

O design foi pensado para funcionar perfeitamente em dispositivos móveis:

- ✅ Layout responsivo
- ✅ Touch-friendly
- ✅ Performance otimizada
- ✅ Animações suaves
- ✅ PWA ready

## 🎯 Componentes Principais

### SearchBar
Barra de busca com suporte a:
- Busca por texto
- Upload de imagem
- Categorias rápidas

### ProductCard
Card de produto com:
- Imagem
- Título
- Preço
- Localização
- Fonte (marketplace)

### Header
Header responsivo com:
- Logo
- Menu mobile
- Navegação

## 🔗 Integração com Backend

A aplicação se conecta com o backend através da API:

```typescript
// lib/api.ts
const API_URL = 'http://localhost:3001/api/v1';
```

Endpoints utilizados:
- `/search/text` - Busca por texto
- `/search/image` - Busca por imagem
- `/products` - Listar produtos
- `/comparisons/compare` - Comparar preços

## 🎨 Paleta de Cores

- **Primary**: Blue 600 (#2563eb)
- **Secondary**: Purple 600 (#9333ea)
- **Success**: Green 600 (#16a34a)
- **Background**: Gray 50 (#f9fafb)

## 📊 Performance

- ✅ Next.js Image Optimization
- ✅ Code Splitting automático
- ✅ Lazy Loading de componentes
- ✅ Cache de requisições

## 🚀 Deploy

### Vercel (Recomendado)
```bash
vercel deploy
```

### Build Manual
```bash
npm run build
npm start
```

## 📝 Próximos Passos

1. Implementar autenticação
2. Adicionar página de produto
3. Sistema de favoritos
4. Notificações push
5. PWA completo
6. Testes E2E

---

**Status**: 🔄 Em Desenvolvimento  
**Versão**: 0.1.0  
**Equipe**: Zavlo Team
