# 🔔 Sistema de Alertas de Preço - Zavlo.ia

## ✅ Status: IMPLEMENTADO E INTEGRADO

O sistema de alertas de preço está **100% funcional** e **automaticamente integrado** com os favoritos!

---

## 🎯 Como Funciona

### 1. Adicionar aos Favoritos = Criar Alerta Automático

Quando o usuário adiciona um produto aos favoritos:

```typescript
// backend/src/modules/favorites/favorites.service.ts

async addFavorite(userId: string, productData: any) {
  // 1. Salva o favorito
  const favorite = await saveFavorite(productData);
  
  // 2. Cria alerta de preço AUTOMATICAMENTE
  await this.priceAlertsService.createAlert(userId, {
    id: productData.id,
    title: productData.title,
    url: productData.url,
    price: productData.price,
    searchQuery: productData.title,
  });
  
  // ✅ Alerta criado! Sistema vai monitorar o preço
}
```

### 2. Monitoramento Automático Diário

**Cron Job**: Todos os dias às 8h da manhã

```typescript
// backend/src/modules/price-alerts/price-alerts.service.ts

@Cron(CronExpression.EVERY_DAY_AT_8AM)
async checkPriceAlerts() {
  // 1. Busca todos os alertas ativos
  const alerts = await getAllActiveAlerts();
  
  // 2. Para cada alerta:
  for (const alert of alerts) {
    // Busca preço atual no Google Shopping
    const newPrice = await fetchCurrentPrice(alert.searchQuery);
    
    // Calcula queda de preço
    const priceDrop = alert.lastCheckedPrice - newPrice;
    const priceDropPercent = (priceDrop / alert.lastCheckedPrice) * 100;
    
    // 3. Notifica se:
    // - Preço caiu >= 10% OU
    // - Atingiu o preço alvo definido
    if (priceDropPercent >= 10 || newPrice <= alert.targetPrice) {
      await notifyUser(alert.userId, {
        productTitle: alert.productTitle,
        oldPrice: alert.lastCheckedPrice,
        newPrice: newPrice,
        dropPercent: priceDropPercent,
      });
    }
  }
}
```

### 3. Notificação ao Usuário

Quando o preço cai, o usuário recebe notificação:

```typescript
// backend/src/modules/notifications/notifications.service.ts

async notifyPriceDrop(userId, productTitle, url, oldPrice, newPrice, dropPercent) {
  const notification = {
    type: 'price_drop',
    title: '💰 Preço Caiu!',
    message: `${productTitle} caiu ${dropPercent.toFixed(0)}%! De R$ ${oldPrice} por R$ ${newPrice}`,
    url: url,
    userId: userId,
    createdAt: new Date(),
  };
  
  // Salva no Firebase
  await saveNotification(notification);
  
  // Envia push notification (se configurado)
  // await sendPushNotification(userId, notification);
}
```

---

## 📊 Estrutura de Dados

### Favorite (Firebase Collection: `favorites`)

```typescript
{
  id: string;
  userId: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  productImage?: string;
  productUrl: string;
  source: string;
  priceAlertEnabled: boolean; // ✅ Novo campo
  createdAt: Date;
}
```

### PriceAlert (Firebase Collection: `price_alerts`)

```typescript
{
  id: string;
  userId: string;
  productId: string;
  productTitle: string;
  productUrl: string;
  searchQuery: string; // Termo usado para buscar preço
  currentPrice: number;
  targetPrice?: number; // Preço alvo opcional
  lastCheckedPrice: number;
  lastCheckedAt: Date;
  isActive: boolean;
  createdAt: Date;
}
```

---

## 🔄 Fluxo Completo

```
┌─────────────────────────────────────────────┐
│  Usuário adiciona produto aos favoritos    │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Sistema salva favorito no Firebase        │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Sistema cria alerta de preço AUTOMÁTICO   │
│  - productId: ID do produto                 │
│  - searchQuery: Título do produto           │
│  - currentPrice: Preço atual                │
│  - isActive: true                           │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Cron Job (8h da manhã) verifica preços    │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Busca preço atual no Google Shopping      │
│  (via Apify API)                            │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Compara preço atual vs último verificado  │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Preço caiu >= 10%?                         │
│  OU atingiu preço alvo?                     │
└──────────────────┬──────────────────────────┘
                   │
                   ▼ SIM
┌─────────────────────────────────────────────┐
│  Envia notificação ao usuário               │
│  "💰 Preço Caiu! iPhone 13 Pro caiu 15%!"  │
└─────────────────────────────────────────────┘
```

---

## 🎯 Critérios de Notificação

O usuário é notificado quando:

1. **Queda >= 10%**
   ```
   Preço anterior: R$ 1.000
   Preço atual: R$ 890
   Queda: 11% ✅ NOTIFICA
   ```

2. **Atingiu Preço Alvo**
   ```
   Preço alvo: R$ 900
   Preço atual: R$ 890 ✅ NOTIFICA
   ```

3. **Ambos**
   ```
   Preço anterior: R$ 1.000
   Preço alvo: R$ 900
   Preço atual: R$ 850
   Queda: 15% + Atingiu alvo ✅ NOTIFICA
   ```

---

## 📱 Endpoints da API

### GET /api/v1/price-alerts
Listar alertas do usuário

**Response:**
```json
[
  {
    "id": "alert-123",
    "productTitle": "iPhone 13 Pro",
    "currentPrice": 4500,
    "lastCheckedPrice": 4500,
    "lastCheckedAt": "2024-01-15T08:00:00Z",
    "isActive": true
  }
]
```

### GET /api/v1/price-alerts/stats
Estatísticas de alertas

**Response:**
```json
{
  "total": 10,
  "active": 8,
  "withTarget": 3
}
```

### DELETE /api/v1/price-alerts/:id
Deletar alerta específico

---

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# Apify (para buscar preços)
APIFY_API_KEY=your-apify-key

# Firebase (para armazenar alertas)
FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY=your-key
```

### Custos Estimados (Apify)

| Alertas Ativos | Verificações/Dia | CU/Mês | Custo/Mês |
|----------------|------------------|--------|-----------|
| 10 alertas | 10 | ~3 CU | ~$0.75 |
| 50 alertas | 50 | ~15 CU | ~$3.75 |
| 100 alertas | 100 | ~30 CU | ~$7.50 |
| 500 alertas | 500 | ~150 CU | ~$37.50 |

**Nota**: Valores baseados no plano Apify Scale ($0.25/CU)

---

## 🔧 Otimizações Implementadas

### 1. Rate Limiting
```typescript
for (const alert of alerts) {
  await checkSingleAlert(alert);
  await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
}
```

### 2. Cache de Busca
- Google Shopping API usa cache interno
- Evita buscas duplicadas no mesmo dia

### 3. Extração Inteligente de Busca
```typescript
// Usa título do produto como termo de busca
searchQuery: productData.title

// Ou extrai da URL se necessário
extractSearchQuery(url) {
  const parts = url.split('/');
  return decodeURIComponent(parts[parts.length - 1]);
}
```

### 4. Notificações Inteligentes
- Apenas quedas >= 10%
- Ou quando atinge preço alvo
- Evita spam de notificações

---

## 📊 Logs e Monitoramento

### Logs Gerados

```
[PriceAlertsService] Starting price alerts check...
[PriceAlertsService] Found 25 active alerts
[PriceAlertsService] Fetching price for: iPhone 13 Pro 128GB
[PriceAlertsService] Found price: R$ 4200
[PriceAlertsService] Price drop notification sent for alert abc123: 15% drop
[PriceAlertsService] Price alerts check completed
```

### Métricas Importantes

- Total de alertas ativos
- Alertas verificados por dia
- Notificações enviadas
- Taxa de queda de preço detectada
- Tempo médio de verificação

---

## ✅ Checklist de Funcionalidades

- [x] Criar alerta automaticamente ao adicionar favorito
- [x] Cron job diário (8h da manhã)
- [x] Buscar preços no Google Shopping
- [x] Calcular % de queda de preço
- [x] Notificar quando preço cai >= 10%
- [x] Suporte a preço alvo opcional
- [x] Rate limiting (2s entre verificações)
- [x] Logs detalhados
- [x] Estatísticas de alertas
- [x] Deletar alertas
- [x] Desativar alertas
- [ ] Notificações push (TODO)
- [ ] Notificações por email (TODO)
- [ ] Notificações por WhatsApp (TODO)

---

## 🚀 Próximas Melhorias

1. **Notificações Push**
   - Integrar Firebase Cloud Messaging
   - Enviar notificações em tempo real

2. **Notificações por Email**
   - Integrar SendGrid ou AWS SES
   - Templates personalizados

3. **Notificações por WhatsApp**
   - Integrar Twilio WhatsApp API
   - Apenas para planos Pro/Business

4. **Histórico de Preços**
   - Salvar histórico de preços
   - Gráfico de evolução de preço

5. **Previsão de Preço**
   - ML para prever melhor momento de compra
   - Alertas inteligentes

---

## 📝 Exemplo de Uso

### Frontend

```typescript
// Adicionar aos favoritos (cria alerta automaticamente)
const addToFavorites = async (product) => {
  const response = await fetch('/api/v1/favorites', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: product.id,
      title: product.title,
      price: product.price,
      url: product.url,
      image: product.image,
      source: product.source,
    }),
  });
  
  // ✅ Favorito salvo + Alerta criado automaticamente!
};

// Listar alertas
const getAlerts = async () => {
  const response = await fetch('/api/v1/price-alerts', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const alerts = await response.json();
  console.log(`Você tem ${alerts.length} alertas ativos`);
};
```

---

## 🎯 Conclusão

O sistema de alertas de preço está **totalmente funcional** e **integrado automaticamente** com os favoritos!

**Quando o usuário adiciona um produto aos favoritos**:
1. ✅ Favorito é salvo
2. ✅ Alerta de preço é criado automaticamente
3. ✅ Sistema monitora o preço diariamente
4. ✅ Usuário é notificado quando preço cai

**Benefícios**:
- 🔔 Notificações automáticas de queda de preço
- 💰 Economia garantida
- ⚡ Sem esforço do usuário
- 📊 Monitoramento contínuo
- 🎯 Alertas inteligentes (>= 10% de queda)

---

**Status**: ✅ Implementado e Funcional  
**Integração**: ✅ Automática com Favoritos  
**Cron Job**: ✅ Ativo (8h da manhã)  
**Notificações**: ✅ Sistema de notificações pronto
