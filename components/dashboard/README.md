# Dashboard Components

Componentes modernos para o dashboard do Zavlo.ia com design futurista estilo SaaS analytics.

## Estrutura

```
components/dashboard/
├── DashboardSidebar.tsx    # Sidebar fixa desktop com navegação
├── MobileSidebar.tsx       # Sidebar mobile com overlay
├── DashboardHeader.tsx     # Header com breadcrumb, busca e avatar
├── StatsCard.tsx           # Cards de estatísticas com glassmorphism
├── WelcomeCard.tsx         # Card de boas-vindas com arte abstrata
├── CircularChart.tsx       # Gráfico circular animado
├── AreaChart.tsx           # Gráfico de área com gradiente
├── BarChart.tsx            # Gráfico de barras animado
└── index.ts                # Exportações centralizadas
```

## Componentes

### DashboardSidebar
Sidebar fixa à esquerda com navegação principal.

**Features:**
- Animação de entrada suave
- Indicador visual de página ativa
- Hover effects com Framer Motion
- Logo com status online
- Botão de logout

### MobileSidebar
Menu lateral para dispositivos móveis.

**Features:**
- Overlay com blur
- Animação slide-in
- Botão hamburger flutuante
- Fecha ao clicar fora ou navegar

### DashboardHeader
Barra superior com informações contextuais.

**Features:**
- Breadcrumb navigation
- Campo de busca
- Notificações com badge
- Avatar do usuário

### StatsCard
Card de estatística com glassmorphism.

**Props:**
- `icon`: Ícone Lucide
- `title`: Título da métrica
- `value`: Valor principal
- `trend`: Percentual de crescimento
- `color`: Gradiente de cor
- `delay`: Delay da animação

**Features:**
- Efeito glow no hover
- Animação de entrada
- Indicador de tendência (positivo/negativo)
- Shine effect

### WelcomeCard
Card de boas-vindas com design premium.

**Props:**
- `userName`: Nome do usuário
- `delay`: Delay da animação

**Features:**
- Background com arte abstrata animada
- Partículas flutuantes
- Botão CTA para busca
- Gradiente vibrante

### CircularChart
Gráfico circular de progresso.

**Props:**
- `title`: Título do gráfico
- `percentage`: Valor percentual
- `icon`: Ícone Lucide
- `color`: Gradiente de cor
- `delay`: Delay da animação

**Features:**
- Animação de preenchimento suave
- Gradiente no stroke
- Estatísticas no footer

### AreaChart
Gráfico de área para visualização de tendências.

**Props:**
- `title`: Título do gráfico
- `data`: Array de valores
- `labels`: Array de labels
- `delay`: Delay da animação

**Features:**
- Área com gradiente
- Linha com gradiente multicolor
- Grid lines
- Pontos de dados animados
- Indicador de crescimento

### BarChart
Gráfico de barras para comparação de dados.

**Props:**
- `title`: Título do gráfico
- `data`: Array de valores
- `labels`: Array de labels
- `delay`: Delay da animação

**Features:**
- Barras com gradiente
- Tooltip no hover
- Estatísticas (média, pico, total)
- Animação sequencial

## Tecnologias

- **Next.js 14** - App Router
- **TailwindCSS** - Estilização
- **Framer Motion** - Animações
- **Lucide Icons** - Ícones

## Estilo Visual

### Cores
- Background: `#0B0B0F` → `#0F0F14`
- Gradientes: Blue → Purple → Pink
- Glassmorphism: `backdrop-blur-xl` + `from-white/10`

### Animações
- Fade in com delay sequencial
- Hover scale e elevação
- Glow effects
- Shine effects
- Partículas flutuantes

### Responsividade
- Mobile: Cards empilhados, sidebar overlay
- Tablet: Grid 2 colunas
- Desktop: Layout completo com sidebar fixa

## Uso

```tsx
import {
  DashboardSidebar,
  MobileSidebar,
  DashboardHeader,
  StatsCard,
  WelcomeCard,
  CircularChart,
  AreaChart,
  BarChart
} from '@/components/dashboard';

// No layout do dashboard
<div className="flex">
  <DashboardSidebar />
  <MobileSidebar />
  <div className="flex-1 lg:ml-64">
    <DashboardHeader userName="João" />
    <main className="p-8">
      {/* Seus componentes aqui */}
    </main>
  </div>
</div>
```

## Customização

Todos os componentes aceitam props de customização e podem ser facilmente adaptados para diferentes necessidades.
