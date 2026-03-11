# Price Alerts Module

Sistema de alertas de preço com monitoramento automático diário.

## 📋 Funcionalidades

- ✅ Criar alertas de preço para produtos
- ✅ Monitoramento automático diário (8h da manhã)
- ✅ Notificações quando preço cai
- ✅ Definir preço alvo opcional
- ✅ Histórico de verificações
- ✅ Estatísticas de alertas
- ✅ Integração com Google Shopping (Apify)
- ✅ Extração automática de termos de busca

## 🔌 Endpoints

### POST /api/v1/price-alerts
Criar novo alerta de preço

**Body:**
```json
{
  "id": "product-123",
  "title": "iPhone 13 Pro",
  "url": "https://...",
  "price": 4500,
  "targetPrice": 4000,
  "searchQuery": "iPhone 13 Pro 128GB"
}
```

### GET /api/v1/price-alerts
Listar alertas do usuário

### GET /api/v1/price-alerts/stats
Estatísticas de alertas

### DELETE /api/v1/price-alerts/:id
Deletar alerta

## ⚙️ Configuração

### Cron Job
- **Frequência**: Diário às 8h da manhã
- **Rate Limiting**: 2s entre verificações
- **Notificação**: Queda >= 10% ou atingiu target

### Custos Apify (Estimativa)
- 10 alertas: ~3 CU/mês
- 50 alertas: ~15 CU/mês
- 100 alertas: ~30 CU/mês

## 🔄 Integração

### Serviços Utilizados
- `FirebaseService` - Armazenamento
- `NotificationsService` - Envio de notificações
- `GoogleShoppingService` - Verificação de preços via Apify

### Estrutura de Dados

```typescript
interface PriceAlert {
  id: string;
  userId: string;
  productId: string;
  productTitle: string;
  productUrl: string;
  searchQuery?: string; // termo de busca salvo para facilitar verificação
  currentPrice: number;
  targetPrice?: number;
  lastCheckedPrice: number;
  lastCheckedAt: Date;
  isActive: boolean;
  createdAt: Date;
}
```

## 📊 Exemplo de Uso

```typescript
// Criar alerta
const alert = await priceAlertsService.createAlert(userId, {
  id: 'prod-123',
  title: 'Notebook Dell',
  url: 'https://...',
  price: 3500,
  targetPrice: 3000,
  searchQuery: 'Notebook Dell Inspiron'
});

// Listar alertas
const alerts = await priceAlertsService.getUserAlerts(userId);

// Estatísticas
const stats = await priceAlertsService.getAlertStats(userId);
```

## ⚡ Como Funciona

1. **Criação do Alerta**: Quando o usuário salva um produto nos favoritos, pode criar um alerta de preço
2. **Extração de Busca**: O sistema extrai o termo de busca da URL ou usa o `searchQuery` fornecido
3. **Verificação Diária**: O cron job busca preços no Google Shopping
4. **Notificação**: Se o preço cair >= 10% ou atingir o target, o usuário é notificado

## ⚠️ Notas Importantes

- O cron job roda automaticamente todos os dias às 8h
- Verificações têm delay de 2s para evitar rate limiting
- Notificações são enviadas apenas para quedas >= 10% ou quando atinge target
- Recomenda-se fornecer `searchQuery` para resultados mais precisos
- O sistema usa cache do Google Shopping para otimizar custos
