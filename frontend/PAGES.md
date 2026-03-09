# Frontend Zavlo.ia - Páginas

## 📄 Páginas Implementadas

### 1. **Home** (`/`)
- Hero section com título animado e gradientes
- SearchBar com busca por texto e categorias
- Cards de estatísticas (1K+ Produtos, 6 Marketplaces, 27 Estados)
- Grid de features (Busca Instantânea, IA Avançada, Melhor Preço)
- Lista de marketplaces integrados (OLX destacado como ativo)
- CTA section para começar busca
- Footer com branding

### 2. **Search** (`/search`)
- Header com navegação
- SearchBar integrada com query params
- Filtros de busca
- Grid de produtos com loading states
- Estados vazios (sem resultados, inicial)
- Suporte a busca por URL (`/search?q=termo`)

### 3. **About** (`/about`)
- Seção "Nossa Missão"
- Grid de features detalhadas
- Tecnologias utilizadas (Visão Computacional, NLP, ML, Web Scraping)
- Cards de estatísticas
- Seção de contato com email

### 4. **Analytics** (`/analytics`)
- Cards de métricas principais (Total Produtos, Buscas, Preço Médio, Usuários)
- Top 8 categorias mais buscadas
- Gráfico de barras dos marketplaces mais usados
- Atividade recente em tempo real
- Placeholder para gráfico de crescimento

### 5. **Product Details** (`/product/[id]`)
- Imagem do produto (placeholder)
- Badge da fonte (OLX, Mercado Livre, etc)
- Título e preço em destaque
- Informações de localização e vendedor
- Descrição completa
- Botão CTA para ver anúncio original
- Seção de produtos similares (placeholder)

## 🎨 Design System

### Cores
- **Background**: `bg-black`
- **Gradientes principais**: 
  - Blue to Purple: `from-blue-400 to-purple-400`
  - Blue to Cyan: `from-blue-400 to-cyan-400`
  - Purple to Pink: `from-purple-400 to-pink-400`
  - Pink to Orange: `from-pink-400 to-orange-400`

### Componentes Reutilizáveis
- **GlassCard**: `bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl`
- **Button Primary**: `bg-gradient-to-r from-blue-500 to-purple-500`
- **Badge**: `rounded-full px-4 py-2 bg-white/[0.03] border border-white/[0.08]`

### Animações
- Pulse nos orbs de background
- Hover scale em cards e botões
- Bounce no scroll indicator
- Spin em ícones de loading

## 🔗 Navegação

```
/                    → Home
/search              → Busca (com query params)
/search?q=iphone     → Busca com termo
/about               → Sobre o projeto
/analytics           → Dashboard de métricas
/product/[id]        → Detalhes do produto
```

## 📱 Responsividade

Todas as páginas são responsivas com breakpoints:
- **Mobile**: `< 768px` (1 coluna)
- **Tablet**: `768px - 1024px` (2 colunas)
- **Desktop**: `> 1024px` (3 colunas)

## ✨ Features Implementadas

- ✅ Design moderno com glassmorphism
- ✅ Gradientes animados
- ✅ Loading states
- ✅ Empty states
- ✅ Navegação entre páginas
- ✅ SearchBar com categorias
- ✅ Cards de produtos
- ✅ Responsividade completa
- ✅ Animações suaves
- ✅ Background orbs animados

## 🚀 Próximos Passos

- [ ] Integrar com API do backend
- [ ] Implementar busca por imagem
- [ ] Adicionar filtros avançados
- [ ] Implementar comparação de produtos
- [ ] Adicionar autenticação
- [ ] Implementar favoritos
- [ ] Adicionar notificações
- [ ] Gráficos reais no Analytics
- [ ] Produtos similares funcionais
- [ ] Sistema de reviews

## 🎯 Alinhamento com Backend

Todas as páginas estão preparadas para integração com os endpoints do backend:

- `POST /api/search/text` → SearchBar
- `POST /api/search/image` → Upload de imagem
- `GET /api/products/:id` → Detalhes do produto
- `GET /api/analytics/stats` → Dashboard Analytics
- `GET /api/products/similar/:id` → Produtos similares

---

**Status**: ✅ Frontend base completo e pronto para integração com backend
