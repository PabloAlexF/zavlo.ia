# 📊 ANÁLISE COMPLETA DE MÉTRICAS DO DASHBOARD - ZAVLO.IA

## 🎯 OBJETIVO
Identificar TODOS os dados reais e métricas disponíveis no projeto que podem ser exibidos no dashboard do usuário.

---

## 📦 COLEÇÕES DO FIREBASE DISPONÍVEIS

### 1. **users** (Usuários)
Dados do perfil e uso do usuário

**Campos Disponíveis:**
- `id` - ID do usuário
- `name` - Nome completo
- `email` - Email
- `phone` - Telefone (opcional)
- `plan` - Plano atual (free, basic, pro, business)
- `billingCycle` - Ciclo de cobrança (monthly, yearly)
- `credits` - Créditos disponíveis
- `freeTrialUsed` - Se já usou o teste grátis
- `role` - Papel (user, admin)
- `planStartedAt` - Data de início do plano
- `planExpiresAt` - Data de expiração do plano
- `textSearchesToday` - Buscas de texto hoje
- `imageSearchesToday` - Buscas de imagem hoje
- `textSearchesThisMonth` - Buscas de texto este mês
- `imageSearchesThisMonth` - Buscas de imagem este mês
- `lastUsageDate` - Última data de uso
- `lastMonthKey` - Chave do último mês (YYYY-MM)
- `location` - Localização do usuário
  - `city` - Cidade
  - `state` - Estado
  - `cep` - CEP
- `createdAt` - Data de criação da conta
- `updatedAt` - Última atualização

**Métricas Calculáveis:**
- ✅ Total de buscas hoje (text + image)
- ✅ Total de buscas este mês (text + image)
- ✅ Dias como membro (createdAt até hoje)
- ✅ Dias restantes do plano (planExpiresAt - hoje)
- ✅ Status do plano (ativo, expirado, próximo a expirar)
- ✅ Créditos disponíveis
- ✅ Uso diário vs limite do plano
- ✅ Uso mensal vs limite do plano

---

### 2. **search_logs** (Logs de Busca)
Histórico completo de todas as buscas realizadas

**Campos Disponíveis:**
- `userId` - ID do usuário
- `query` - Termo de busca
- `type` - Tipo (text, image)
- `sources` - Array de fontes usadas (google_shopping, google_vision, etc)
- `responseTime` - Tempo de resposta em ms
- `success` - Se a busca foi bem-sucedida
- `resultsCount` - Quantidade de resultados
- `timestamp` - Data/hora da busca
- `location` - Localização (opcional)

**Métricas Calculáveis:**
- ✅ Total de buscas (lifetime)
- ✅ Buscas por tipo (texto vs imagem)
- ✅ Taxa de sucesso (% de buscas bem-sucedidas)
- ✅ Tempo médio de resposta
- ✅ Média de resultados por busca
- ✅ Buscas por dia/semana/mês (gráfico temporal)
- ✅ Fontes mais utilizadas (ranking)
- ✅ Horários de pico de uso
- ✅ Dias da semana com mais buscas
- ✅ Histórico de buscas recentes (últimas 10-20)
- ✅ Buscas por localização (se disponível)

---

### 3. **favorites** (Favoritos)
Produtos salvos pelo usuário

**Campos Disponíveis:**
- `id` - ID do favorito
- `userId` - ID do usuário
- `productId` - ID do produto
- `productTitle` - Título do produto
- `productPrice` - Preço do produto
- `productImage` - URL da imagem
- `productUrl` - URL do produto
- `source` - Fonte (OLX, Mercado Livre, etc)
- `priceAlertEnabled` - Se alerta de preço está ativo
- `createdAt` - Data de criação

**Métricas Calculáveis:**
- ✅ Total de favoritos
- ✅ Favoritos por fonte/marketplace
- ✅ Valor total dos favoritos (soma dos preços)
- ✅ Preço médio dos favoritos
- ✅ Favoritos com alerta ativo
- ✅ Favoritos mais recentes
- ✅ Categorias mais favoritadas

---

### 4. **listings** (Anúncios do Usuário)
Produtos que o usuário está vendendo

**Campos Disponíveis:**
- `id` - ID do anúncio
- `userId` - ID do usuário
- `title` - Título
- `description` - Descrição
- `price` - Preço
- `images` - Array de imagens
- `category` - Categoria
- `condition` - Condição (new, used)
- `location` - Localização (cep, city, state)
- `contact` - Contato (phone, whatsapp, email)
- `active` - Se está ativo
- `featured` - Se está em destaque
- `featuredUntil` - Data de fim do destaque
- `views` - Visualizações
- `clicks` - Cliques
- `createdAt` - Data de criação
- `updatedAt` - Última atualização
- `brand` - Marca (opcional)
- `model` - Modelo (opcional)
- `year` - Ano (opcional)
- `specifications` - Especificações (objeto)
- `shipping` - Envio (available, cost)

**Métricas Calculáveis:**
- ✅ Total de anúncios
- ✅ Anúncios ativos vs inativos
- ✅ Total de visualizações
- ✅ Total de cliques
- ✅ Taxa de conversão (cliques/visualizações)
- ✅ Anúncios em destaque
- ✅ Valor total dos anúncios
- ✅ Preço médio dos anúncios
- ✅ Anúncios por categoria
- ✅ Anúncios por condição (novo/usado)
- ✅ Performance por anúncio (views, clicks)
- ✅ Anúncios mais visualizados (top 5)
- ✅ Anúncios com mais cliques (top 5)

---

### 5. **price_alerts** (Alertas de Preço)
Alertas de monitoramento de preço

**Campos Disponíveis:**
- `id` - ID do alerta
- `userId` - ID do usuário
- `productId` - ID do produto
- `productTitle` - Título do produto
- `productUrl` - URL do produto
- `searchQuery` - Termo de busca
- `currentPrice` - Preço atual
- `targetPrice` - Preço alvo (opcional)
- `lastCheckedPrice` - Último preço verificado
- `lastCheckedAt` - Última verificação
- `isActive` - Se está ativo
- `createdAt` - Data de criação

**Métricas Calculáveis:**
- ✅ Total de alertas
- ✅ Alertas ativos
- ✅ Alertas com preço alvo definido
- ✅ Alertas que atingiram o alvo
- ✅ Economia total (diferença de preços)
- ✅ Maior queda de preço detectada
- ✅ Alertas por produto
- ✅ Última verificação de preços

---

### 6. **notifications** (Notificações)
Notificações do sistema

**Campos Disponíveis:**
- `id` - ID da notificação
- `userId` - ID do usuário
- `title` - Título
- `body` - Corpo da mensagem
- `data` - Dados adicionais (objeto)
- `read` - Se foi lida
- `readAt` - Data de leitura
- `createdAt` - Data de criação

**Métricas Calculáveis:**
- ✅ Total de notificações
- ✅ Notificações não lidas
- ✅ Notificações lidas
- ✅ Taxa de leitura
- ✅ Notificações por tipo
- ✅ Notificações recentes (últimas 10)

---

### 7. **price_history** (Histórico de Preços)
Histórico de variação de preços

**Campos Disponíveis:**
- `id` - ID do registro
- `productId` - ID do produto
- `price` - Preço
- `source` - Fonte
- `timestamp` - Data/hora

**Métricas Calculáveis:**
- ✅ Variação de preço ao longo do tempo
- ✅ Menor preço histórico
- ✅ Maior preço histórico
- ✅ Tendência de preço (subindo/descendo)
- ✅ Volatilidade de preço

---

### 8. **products** (Produtos)
Produtos indexados no sistema

**Campos Disponíveis:**
- `id` - ID do produto
- `title` - Título
- `description` - Descrição
- `price` - Preço
- `image` - Imagem principal
- `images` - Array de imagens
- `url` - URL do produto
- `sourceUrl` - URL original
- `source` - Fonte/Marketplace
- `marketplace` - Marketplace
- `category` - Categoria
- `location` - Localização
- `condition` - Condição
- `active` - Se está ativo
- `stock` - Se tem estoque
- `seller` - Vendedor
- `score` - Pontuação
- `qualityScore` - Pontuação de qualidade
- `brand` - Marca
- `model` - Modelo
- `year` - Ano
- `createdAt` - Data de criação
- `updatedAt` - Última atualização
- `scrapedAt` - Data do scraping
- `featured` - Se está em destaque

**Métricas Calculáveis:**
- ✅ Total de produtos no sistema
- ✅ Produtos por marketplace
- ✅ Produtos por categoria
- ✅ Preço médio por categoria
- ✅ Produtos mais buscados
- ✅ Produtos em estoque vs sem estoque

---

## 📈 MÉTRICAS AGREGADAS E CALCULADAS

### **Métricas de Uso Pessoal**
1. **Buscas**
   - ✅ Buscas hoje (texto + imagem)
   - ✅ Buscas esta semana
   - ✅ Buscas este mês
   - ✅ Total de buscas (lifetime)
   - ✅ Média de buscas por dia
   - ✅ Buscas de texto vs imagem (%)
   - ✅ Gráfico de buscas ao longo do tempo

2. **Performance**
   - ✅ Taxa de sucesso das buscas (%)
   - ✅ Tempo médio de resposta
   - ✅ Média de resultados por busca
   - ✅ Fontes mais utilizadas

3. **Plano e Créditos**
   - ✅ Plano atual
   - ✅ Créditos disponíveis
   - ✅ Dias restantes do plano
   - ✅ Status do plano (ativo/expirado)
   - ✅ Uso vs limite do plano (%)
   - ✅ Histórico de uso de créditos

4. **Favoritos**
   - ✅ Total de favoritos
   - ✅ Valor total dos favoritos
   - ✅ Preço médio
   - ✅ Favoritos por marketplace
   - ✅ Favoritos com alerta ativo

5. **Anúncios**
   - ✅ Total de anúncios
   - ✅ Anúncios ativos
   - ✅ Total de visualizações
   - ✅ Total de cliques
   - ✅ Taxa de conversão (CTR)
   - ✅ Anúncios mais visualizados
   - ✅ Valor total dos anúncios

6. **Alertas de Preço**
   - ✅ Total de alertas
   - ✅ Alertas ativos
   - ✅ Alertas que atingiram o alvo
   - ✅ Economia total gerada
   - ✅ Maior queda de preço detectada

7. **Notificações**
   - ✅ Total de notificações
   - ✅ Notificações não lidas
   - ✅ Taxa de leitura

8. **Atividade**
   - ✅ Dias como membro
   - ✅ Última atividade
   - ✅ Horários de uso mais frequentes
   - ✅ Dias da semana mais ativos

---

## 🎨 VISUALIZAÇÕES RECOMENDADAS

### **Cards de Estatísticas (Stats Cards)**
1. **Buscas Hoje** - Número + tendência vs ontem
2. **Total Mensal** - Buscas do mês + tendência
3. **Favoritos** - Total + tendência
4. **Anúncios** - Total ativos + tendência
5. **Alertas** - Total monitorando + tendência
6. **Notificações** - Não lidas + badge
7. **Créditos** - Disponíveis + link para comprar
8. **Plano** - Atual + dias restantes

### **Gráficos**
1. **Gráfico de Linha (Area Chart)** - Buscas ao longo do tempo (últimos 30 dias)
2. **Gráfico de Barras** - Buscas por dia da semana
3. **Gráfico de Pizza** - Buscas por tipo (texto vs imagem)
4. **Gráfico de Pizza** - Fontes mais utilizadas
5. **Gráfico Circular (Progress)** - Taxa de sucesso
6. **Gráfico Circular (Progress)** - Uso do plano (%)
7. **Gráfico de Barras Horizontal** - Top 5 anúncios mais visualizados
8. **Gráfico de Linha** - Histórico de preços (alertas)

### **Listas**
1. **Histórico de Buscas** - Últimas 10 buscas com detalhes
2. **Favoritos Recentes** - Últimos 5 favoritos
3. **Anúncios Ativos** - Top 5 por visualizações
4. **Alertas Ativos** - Produtos monitorados
5. **Notificações Recentes** - Últimas 5 não lidas

### **Cards Especiais**
1. **Welcome Card** - Boas-vindas personalizado
2. **Plan Status Card** - Status do plano com alerta de expiração
3. **Credits Card** - Créditos com CTA para comprar
4. **Performance Card** - Taxa de sucesso + tempo médio
5. **Savings Card** - Economia total com alertas de preço

---

## 🔥 MÉTRICAS PRIORITÁRIAS PARA O DASHBOARD

### **Seção 1: Visão Geral (Hero Section)**
- ✅ Buscas Hoje
- ✅ Total Mensal
- ✅ Favoritos
- ✅ Anúncios Ativos
- ✅ Alertas Monitorando
- ✅ Notificações Não Lidas

### **Seção 2: Plano e Créditos**
- ✅ Créditos Disponíveis (destaque)
- ✅ Plano Atual + Dias Restantes
- ✅ Uso vs Limite do Plano (barra de progresso)

### **Seção 3: Performance**
- ✅ Taxa de Sucesso (circular chart)
- ✅ Tempo Médio de Resposta
- ✅ Fontes Mais Utilizadas (circular chart)

### **Seção 4: Atividade**
- ✅ Gráfico de Buscas (últimos 30 dias)
- ✅ Gráfico Semanal (últimos 7 dias)
- ✅ Buscas por Tipo (texto vs imagem)

### **Seção 5: Anúncios**
- ✅ Total de Visualizações
- ✅ Total de Cliques
- ✅ Taxa de Conversão (CTR)
- ✅ Top 5 Anúncios Mais Visualizados

### **Seção 6: Alertas e Economia**
- ✅ Total de Alertas Ativos
- ✅ Economia Total Gerada
- ✅ Maior Queda de Preço Detectada
- ✅ Alertas que Atingiram o Alvo

### **Seção 7: Histórico Recente**
- ✅ Últimas 10 Buscas
- ✅ Últimos 5 Favoritos
- ✅ Últimas 5 Notificações

---

## 🚀 ENDPOINTS DA API DISPONÍVEIS

### **Usuário**
- `GET /users/profile` - Perfil completo
- `GET /users/usage` - Uso atual (hoje + mês)
- `GET /users/plan-status` - Status do plano

### **Analytics**
- `GET /analytics/metrics?days=30` - Métricas agregadas
- `GET /analytics/history?limit=20` - Histórico de buscas

### **Favoritos**
- `GET /favorites` - Lista de favoritos

### **Anúncios**
- `GET /listings/my` - Anúncios do usuário

### **Alertas**
- `GET /price-alerts` - Alertas do usuário
- `GET /price-alerts/stats` - Estatísticas de alertas

### **Notificações**
- `GET /notifications` - Notificações do usuário

---

## 💡 RECOMENDAÇÕES DE IMPLEMENTAÇÃO

### **Prioridade ALTA (Implementar Primeiro)**
1. ✅ Cards de estatísticas principais (6 cards)
2. ✅ Créditos e Plano (2 cards grandes)
3. ✅ Gráfico de atividade de buscas (area chart)
4. ✅ Gráfico semanal (bar chart)
5. ✅ Taxa de sucesso (circular chart)
6. ✅ Histórico de buscas recentes (lista)

### **Prioridade MÉDIA (Implementar Depois)**
1. ⏳ Performance de anúncios (visualizações, cliques, CTR)
2. ⏳ Top 5 anúncios mais visualizados
3. ⏳ Alertas de preço e economia gerada
4. ⏳ Favoritos recentes
5. ⏳ Gráfico de buscas por tipo (pizza chart)
6. ⏳ Fontes mais utilizadas (ranking)

### **Prioridade BAIXA (Futuro)**
1. 📅 Heatmap de horários de uso
2. 📅 Análise de tendências de preço
3. 📅 Comparação com outros usuários (anônimo)
4. 📅 Sugestões personalizadas baseadas em histórico
5. 📅 Relatórios exportáveis (PDF/Excel)

---

## 📊 EXEMPLO DE DADOS REAIS DO USUÁRIO ATUAL

Baseado nos logs do console:

```javascript
{
  // Perfil
  name: "Admin Zavlo",
  email: "admin@zavlo.ia",
  role: "admin",
  plan: "free",
  credits: 0,
  
  // Uso
  textSearchesToday: 0,
  imageSearchesToday: 0,
  textSearchesThisMonth: 13,
  imageSearchesThisMonth: 32,
  
  // Analytics
  totalSearches: 32,
  successRate: 100,
  avgResponseTime: 33000, // 33 segundos
  
  // Coleções
  favorites: 1,
  listings: 0,
  alerts: 0, // endpoint com erro 500
  notifications: 0, // endpoint com erro 500
  
  // Histórico
  history: [] // vazio no momento
}
```

---

## ✅ STATUS ATUAL DO DASHBOARD

### **Implementado**
- ✅ 6 cards de estatísticas principais
- ✅ Card de créditos (com animação)
- ✅ Card de plano (com status)
- ✅ Welcome card
- ✅ 2 circular charts (taxa de sucesso, cobertura)
- ✅ Area chart (atividade de buscas)
- ✅ Bar chart (buscas semanais)
- ✅ Lista de histórico recente (quando disponível)
- ✅ Tratamento de erros para endpoints que falham
- ✅ Loading states
- ✅ Responsividade mobile

### **Pendente**
- ⏳ Seção de performance de anúncios
- ⏳ Seção de alertas e economia
- ⏳ Gráfico de buscas por tipo
- ⏳ Ranking de fontes mais utilizadas
- ⏳ Top anúncios mais visualizados
- ⏳ Favoritos recentes
- ⏳ Análise de tendências

---

## 🎯 CONCLUSÃO

O projeto Zavlo.ia possui uma **infraestrutura robusta** com 8 coleções principais no Firebase e múltiplos endpoints de API que fornecem dados ricos para análise.

**Dados Disponíveis:**
- ✅ 50+ campos de dados do usuário
- ✅ 8 coleções no Firebase
- ✅ 10+ endpoints de API
- ✅ 30+ métricas calculáveis
- ✅ Histórico completo de atividades

**Potencial de Visualização:**
- 📊 15+ tipos de gráficos possíveis
- 📈 20+ métricas para cards
- 📋 5+ listas de dados
- 🎨 10+ visualizações interativas

O dashboard atual já implementa as métricas mais importantes, mas há muito espaço para expansão com dados de anúncios, alertas de preço, economia gerada e análises mais profundas de comportamento do usuário.
