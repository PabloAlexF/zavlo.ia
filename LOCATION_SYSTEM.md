# Sistema de Localização - Zavlo.ia

## 🎯 Objetivo

Permitir que usuários busquem produtos **priorizando sua região** (cidade/estado).

---

## ❌ Limitação Atual: Google Shopping Scraper

O **Google Shopping Scraper** da Apify **NÃO suporta filtro de localização**.

### Parâmetros Disponíveis:
```json
{
  "country": "br",           // ✅ País (fixo: Brasil)
  "language": "pt-BR",       // ✅ Idioma
  "searchQuery": "texto",    // ✅ Busca
  "sortBy": "LOWEST_PRICE",  // ✅ Ordenação
  "limit": 20                // ✅ Limite de resultados
}
```

### Parâmetros NÃO Disponíveis:
- ❌ `city` - Cidade
- ❌ `state` - Estado
- ❌ `zipCode` - CEP
- ❌ `location` - Localização
- ❌ `radius` - Raio de busca

**Resultado:** Retorna produtos de **todo o Brasil**, sem priorizar região do usuário.

---

## ✅ Solução Implementada

### 1. Coleta de Localização no Cadastro

**Frontend:** `app/auth/page.tsx`

```typescript
// Campos adicionados no cadastro
{
  name: string;
  email: string;
  password: string;
  location: {
    cep: string;      // Ex: "30130-100"
    city: string;     // Ex: "Belo Horizonte"
    state: string;    // Ex: "MG"
  }
}
```

**Fluxo:**
1. Usuário digita CEP
2. Sistema busca automaticamente cidade/estado via **ViaCEP**
3. Dados salvos no perfil do usuário

### 2. Scrapers com Suporte a Localização

| Marketplace | Scraper | Localização | Status |
|-------------|---------|-------------|--------|
| **OLX** | Playwright | ✅ Cidade/Estado | Implementado |
| **Mercado Livre** | API Oficial | ✅ Estado/Cidade | Planejado |
| **Facebook** | Apify | ✅ Raio (km) | Planejado |
| **Google Shopping** | Apify | ❌ Nacional | Atual |
| **Webmotors** | Apify | ✅ Cidade | Planejado |

### 3. Estratégia Híbrida

#### Para Produtos Locais (Imóveis, Veículos, Usados):
```typescript
// Usar scrapers com filtro de localização
const results = await Promise.all([
  olxService.search(query, { city: user.city, state: user.state }),
  facebookService.search(query, { location: user.city, radius: 50 }),
  webmotorsService.search(query, { city: user.city }),
]);
```

#### Para Produtos Nacionais (Eletrônicos, Novos):
```typescript
// Usar Google Shopping sem filtro
const results = await googleShoppingService.search(query);

// Ordenar por: preço + frete para CEP do usuário
results.sort((a, b) => {
  const totalA = a.price + calculateShipping(a, user.cep);
  const totalB = b.price + calculateShipping(b, user.cep);
  return totalA - totalB;
});
```

---

## 🔧 Implementação Backend

### Atualizar User Model

```typescript
// backend/src/modules/users/entities/user.entity.ts
export class User {
  id: string;
  name: string;
  email: string;
  password: string;
  
  // Novo campo
  location?: {
    cep: string;
    city: string;
    state: string;
    updatedAt: Date;
  };
}
```

### Atualizar Search Service

```typescript
// backend/src/modules/search/search.service.ts
async search(query: string, userId: string) {
  // Buscar localização do usuário
  const user = await this.usersService.findOne(userId);
  const location = user.location;

  // Buscar em múltiplas fontes
  const results = await Promise.all([
    // Produtos locais (com filtro)
    this.olxService.search(query, location),
    this.facebookService.search(query, location),
    
    // Produtos nacionais (sem filtro)
    this.googleShoppingService.search(query),
    this.mercadoLivreService.search(query),
  ]);

  // Mesclar e ordenar resultados
  return this.mergeAndSort(results, location);
}
```

### Ordenação por Proximidade

```typescript
private mergeAndSort(results: Product[][], userLocation: Location) {
  const merged = results.flat();
  
  return merged.sort((a, b) => {
    // Priorizar produtos da mesma cidade
    if (a.city === userLocation.city && b.city !== userLocation.city) return -1;
    if (b.city === userLocation.city && a.city !== userLocation.city) return 1;
    
    // Depois mesmo estado
    if (a.state === userLocation.state && b.state !== userLocation.state) return -1;
    if (b.state === userLocation.state && a.state !== userLocation.state) return 1;
    
    // Por último, menor preço
    return a.price - b.price;
  });
}
```

---

## 🎨 Interface do Usuário

### Tela de Busca

```
┌─────────────────────────────────────────┐
│ [🔍 Buscar produtos...]                 │
│ [📍 Belo Horizonte, MG] [Alterar]      │
└─────────────────────────────────────────┘

Filtros:
☑️ Apenas na minha cidade (Belo Horizonte)
☐ Até 50km de distância
☐ Todo o estado (Minas Gerais)
☐ Todo o Brasil

Resultados (23):
┌─────────────────────────────────────────┐
│ 📍 Belo Horizonte, MG (5 km)           │
│ iPhone 13 Pro - R$ 3.200               │
│ OLX                                     │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 📍 Contagem, MG (12 km)                │
│ iPhone 13 Pro - R$ 3.100               │
│ Facebook Marketplace                    │
└─────────────────────────────────────────┘
```

---

## 📊 Comparação: Com vs Sem Localização

### Sem Localização (Atual)
```
Busca: "apartamento 2 quartos"
Resultados:
1. São Paulo, SP - R$ 350.000
2. Rio de Janeiro, RJ - R$ 280.000
3. Belo Horizonte, MG - R$ 220.000 ← Usuário está aqui
4. Curitiba, PR - R$ 310.000
```
❌ Usuário precisa filtrar manualmente

### Com Localização (Novo)
```
Busca: "apartamento 2 quartos"
Localização: Belo Horizonte, MG

Resultados:
1. 📍 Belo Horizonte, MG - R$ 220.000 ← Priorizado
2. 📍 Contagem, MG - R$ 210.000 ← Região metropolitana
3. 📍 Betim, MG - R$ 195.000 ← Próximo
4. São Paulo, SP - R$ 350.000 ← Outros estados depois
```
✅ Resultados relevantes primeiro

---

## 🚀 Roadmap de Implementação

### Fase 1: Coleta de Dados ✅ (Implementado)
- [x] Campo CEP no cadastro
- [x] Integração ViaCEP
- [x] Salvar cidade/estado no perfil

### Fase 2: Scrapers com Localização (Próxima)
- [ ] Integrar OLX com filtro de localização
- [ ] Integrar Mercado Livre API com filtro
- [ ] Integrar Facebook Marketplace

### Fase 3: Ordenação Inteligente
- [ ] Calcular distância entre cidades
- [ ] Priorizar resultados por proximidade
- [ ] Adicionar badge de distância (km)

### Fase 4: Filtros Avançados
- [ ] Filtro "Apenas minha cidade"
- [ ] Filtro "Até X km"
- [ ] Filtro "Todo o estado"
- [ ] Filtro "Todo o Brasil"

---

## 💡 Alternativas Futuras

### Opção 1: Geolocalização Automática
```typescript
// Detectar localização pelo navegador
navigator.geolocation.getCurrentPosition((position) => {
  const { latitude, longitude } = position.coords;
  // Converter para cidade via Google Maps API
});
```

### Opção 2: IP Geolocation
```typescript
// Detectar cidade pelo IP do usuário
import geoip from 'geoip-lite';
const geo = geoip.lookup(req.ip);
```

### Opção 3: Múltiplos Endereços
```typescript
// Permitir usuário salvar múltiplos endereços
{
  addresses: [
    { label: 'Casa', cep: '30130-100', city: 'BH', state: 'MG' },
    { label: 'Trabalho', cep: '30140-000', city: 'BH', state: 'MG' },
  ]
}
```

---

## 📌 Conclusão

**Status Atual:**
- ✅ CEP coletado no cadastro
- ✅ Cidade/Estado salvos no perfil
- ❌ Google Shopping não filtra por localização
- ⏳ Scrapers específicos em desenvolvimento

**Próximo Passo:**
Implementar scrapers com suporte a localização (OLX, Mercado Livre, Facebook) para complementar o Google Shopping.

**Impacto:**
- Usuários verão produtos **relevantes para sua região**
- Melhor experiência de busca
- Maior taxa de conversão
