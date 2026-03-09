# 🎨 ZAVLO.IA - BRIEF DE DESIGN PARA ORCHIDS.APP

## 📋 Visão Geral do Projeto

**Nome**: Zavlo.ia  
**Tipo**: Marketplace Aggregator com IA  
**Objetivo**: Buscar produtos em múltiplos marketplaces brasileiros usando Inteligência Artificial  
**Público**: Brasileiros que buscam melhores preços online  
**Plataforma**: Web App (mobile-first)

---

## 🎯 Identidade Visual Atual

### Conceito
**"Futurismo Minimalista Dark"**

### Paleta de Cores
```
Background:   #000000 (Preto total)
Text:         #FFFFFF (Branco)
Primary:      #3B82F6 (Blue 500)
Secondary:    #A855F7 (Purple 500)
Accent:       #EC4899 (Pink 500)

Gradientes:
- Blue → Purple → Pink
- Usado em títulos, botões e destaques
```

### Estilo Visual
- ✨ Dark mode nativo
- ✨ Glassmorphism (bg-white/5 com blur)
- ✨ Gradientes vibrantes
- ✨ Animações sutis (pulse, float)
- ✨ Espaçamento generoso
- ✨ Bordas arredondadas (rounded-2xl, rounded-full)
- ✨ Efeitos de glow em elementos interativos

### Tipografia
- **Font**: Inter (sans-serif)
- **Hero**: 48-72px, Bold
- **Títulos**: 24-36px, Bold
- **Body**: 16px, Regular
- **Small**: 14px, Regular

---

## 📱 Páginas do Projeto (6 páginas)

### 1. **HOME** - `/`

**Objetivo**: Landing page que converte visitantes em usuários

**Seções**:
1. **Hero Section**
   - Título grande: "Encontre o melhor preço em segundos"
   - Subtítulo: "IA que busca em todos os marketplaces brasileiros"
   - Badge: "✨ Powered by AI"
   - SearchBar central (input + botão de câmera + botão buscar)
   - Background: Orbs animados com blur (blue e purple)

2. **Stats Cards** (3 cards horizontais)
   - 1K+ Produtos
   - 6 Marketplaces
   - 27 Estados

3. **Features Grid** (3 cards)
   - ⚡ Busca Instantânea
   - 🤖 IA Avançada
   - 💎 Melhor Preço

4. **Marketplaces Badges**
   - Pills com nomes: OLX (ativo), Mercado Livre, Facebook, etc.

5. **CTA Section**
   - Card grande com gradiente
   - "Pronto para economizar?"
   - Botão: "Começar Busca"

6. **Footer**
   - Logo + Copyright

**Elementos Visuais**:
- Background preto com 2-3 orbs gradientes animados
- Cards com glassmorphism (bg-white/5, border-white/10)
- Botões com gradiente blue→purple
- Hover: scale 1.05

---

### 2. **SEARCH** - `/search`

**Objetivo**: Página dedicada de busca com filtros

**Seções**:
1. **Header**
   - Logo Zavlo
   - Menu: Comparar, Sobre

2. **SearchBar** (mesmo da home)
   - Input grande
   - Botão de câmera
   - Botão buscar
   - Categorias rápidas (chips)

3. **Filtros + Resultados**
   - Botão "Filtros" (dropdown)
   - Título: "Resultados"
   - Contador: "X produtos encontrados"
   - Grid 3 colunas (desktop) / 1 coluna (mobile)

4. **Product Cards** (repetir)
   - Imagem do produto
   - Badge da fonte (OLX, ML)
   - Título (2 linhas max)
   - Preço em destaque (gradiente)
   - Localização (cidade, estado)

**Estados**:
- Loading: Skeleton cards (6 cards pulsando)
- Vazio: Ícone 🔍 + "Nenhum produto encontrado"

---

### 3. **PRODUCT DETAILS** - `/product/[id]`

**Objetivo**: Mostrar detalhes completos do produto

**Layout**: Grid 2 colunas (desktop) / 1 coluna (mobile)

**Coluna Esquerda**:
- Imagem grande (aspect-square)
- Background: glassmorphism se sem imagem

**Coluna Direita**:
1. Badge da fonte (OLX, ML)
2. Título do produto (text-4xl)
3. Preço (text-5xl com gradiente)
4. Informações:
   - 📍 Localização
   - 👤 Vendedor
5. Descrição (text-gray-400)
6. Botão CTA: "Ver Anúncio →" (gradiente, rounded-full)

**Elementos**:
- Botão voltar no topo
- Background com orbs animados

---

### 4. **COMPARE** - `/compare`

**Objetivo**: Comparar preços de um produto entre marketplaces

**Seções**:
1. **Header** (mesmo padrão)

2. **Input de Busca**
   - Card com glassmorphism
   - Input: "Ex: iPhone 13 Pro Max"
   - Botão: "Comparar"
   - Efeito glow no hover

3. **Resultados** (se houver)
   - Título do produto
   - **3 Cards de Preços** (grid 3 colunas):
     - Menor Preço (verde)
     - Preço Médio (azul)
     - Maior Preço (vermelho)
   - Cada card: valor grande + label pequeno

4. **Lista de Fontes**
   - Cards horizontais
   - Nome da fonte + link
   - Preço em destaque (gradiente)

**Cores por Tipo**:
- Verde: bg-green-500/10, border-green-500/20, text-green-400
- Azul: bg-blue-500/10, border-blue-500/20, text-blue-400
- Vermelho: bg-red-500/10, border-red-500/20, text-red-400

---

### 5. **ABOUT** - `/about`

**Objetivo**: Explicar o projeto e tecnologias

**Seções**:
1. **Header** (mesmo padrão)

2. **Título Principal**
   - "Sobre o Zavlo.ia" (gradiente)

3. **Cards Informativos** (3 cards verticais):
   
   **Card 1 - Nossa Missão**
   - Texto explicativo
   - Glassmorphism

   **Card 2 - Como Funciona**
   - 3 itens com ícone + título + descrição:
     - ⚡ Busca Instantânea
     - 🤖 IA Avançada
     - 💎 Melhor Preço

   **Card 3 - Tecnologia**
   - Grid 2x2 com bullets:
     - Visão Computacional
     - NLP Avançado
     - Machine Learning
     - Web Scraping
   - Background: gradiente sutil

**Estilo**: Minimalista, foco no conteúdo

---

### 6. **ANALYTICS** - `/analytics`

**Objetivo**: Dashboard de estatísticas

**Seções**:
1. **Header** (mesmo padrão)

2. **Título**: "Analytics"

3. **Stats Grid** (4 cards horizontais):
   - Total Produtos
   - Buscas
   - Preço Médio
   - (outro stat)
   - Cada card: label pequeno + número grande

4. **Top Categorias**
   - Card grande
   - Lista vertical
   - Nome categoria + contador

**Estilo**: Dashboard clean, cards com glassmorphism

---

## 🎨 Componentes Reutilizáveis

### SearchBar
- Input grande com placeholder
- Ícone de câmera (upload imagem)
- Botão buscar (gradiente)
- Glow effect no hover
- Categorias rápidas abaixo (chips)

### Product Card
- Imagem (aspect 4:3)
- Badge fonte (top-right)
- Título (2 linhas, line-clamp)
- Preço (gradiente, destaque)
- Localização (pequeno, gray)
- Hover: scale 1.02

### Button
- **Primary**: Gradiente blue→purple, rounded-full
- **Secondary**: bg-white/5, border-white/10
- **Ghost**: Apenas texto
- Hover: scale 1.05

### Card
- bg-white/5
- border border-white/10
- rounded-2xl
- padding: 24px
- Hover: bg-white/10

### Header
- Logo (Z em gradiente + "Zavlo")
- Menu desktop: Comparar, Sobre
- Menu mobile: Hamburger
- Sticky, backdrop-blur

---

## 🎯 Elementos Visuais Importantes

### Background Animado
- 2-3 orbs circulares
- Gradientes: blue-500/10, purple-500/10, pink-500/5
- blur-3xl
- animate-pulse
- Posições: top-left, bottom-right, center

### Glassmorphism
```css
background: rgba(255, 255, 255, 0.05);
border: 1px solid rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
```

### Gradientes
- Texto: `bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent`
- Botão: `bg-gradient-to-r from-blue-500 to-purple-500`
- Glow: `bg-gradient-to-r from-blue-500 to-purple-500 opacity-30 blur`

### Animações
- Pulse: orbs de fundo
- Spin: loading spinner
- Scale: hover em botões e cards
- Float: (custom) movimento vertical suave

---

## 📐 Grid & Spacing

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Container
- max-width: 1280px
- padding: 16px (mobile) / 32px (desktop)

### Grid Padrão
- Mobile: 1 coluna
- Tablet: 2 colunas
- Desktop: 3 colunas

### Spacing
- Seções: 80px (py-20)
- Cards: 24px gap
- Elementos: 16px gap

---

## 🎨 Referências de Estilo

**Inspirações**:
- Apple Vision Pro (glassmorphism)
- Stripe (minimalismo)
- Linear (dark mode)
- Vercel (tipografia)
- Framer (animações)

**Mood**:
- Futurístico
- Premium
- Tecnológico
- Confiável
- Rápido

---

## 📱 Responsividade

### Mobile (< 768px)
- 1 coluna
- Menu hamburger
- SearchBar full-width
- Cards empilhados
- Texto menor

### Desktop (> 1024px)
- Grid 3 colunas
- Menu horizontal
- Hover effects
- Texto maior

---

## ✅ Checklist para Orchids.app

- [ ] 6 páginas completas
- [ ] Design system (cores, tipografia, componentes)
- [ ] Versão mobile + desktop
- [ ] Estados: normal, hover, loading, empty
- [ ] Componentes reutilizáveis
- [ ] Animações e transições
- [ ] Glassmorphism e gradientes
- [ ] Background animado

---

## 📊 Resumo das Páginas

| Página | Rota | Prioridade | Complexidade |
|--------|------|------------|--------------|
| Home | / | 🔴 Alta | Média |
| Search | /search | 🔴 Alta | Alta |
| Product | /product/[id] | 🟡 Média | Baixa |
| Compare | /compare | 🟡 Média | Média |
| About | /about | 🟢 Baixa | Baixa |
| Analytics | /analytics | 🟢 Baixa | Média |

---

## 🎯 Objetivo Final

Criar um design **único, futurístico e minimalista** que:
- ✨ Transmita inovação tecnológica
- ✨ Seja fácil de usar (UX intuitiva)
- ✨ Funcione perfeitamente em mobile
- ✨ Destaque-se da concorrência
- ✨ Seja memorável

---

**Projeto**: Zavlo.ia  
**Páginas**: 6  
**Estilo**: Dark Futuristic Minimalist  
**Tech**: Next.js + Tailwind CSS  
**Para**: Orchids.app Design
