# Solução de Localização - Google Shopping Query

## 🎯 Problema

O **Google Shopping Scraper** da Apify não tem parâmetro de localização (cidade/estado).

## ✅ Solução Implementada

**Adicionar localização direto na query de busca!**

### Como Funciona

1. **Usuário cadastra CEP** → Sistema salva cidade/estado
2. **Usuário busca produto** → Sistema pega localização do perfil
3. **Query modificada** → Adiciona cidade/estado na busca
4. **Google prioriza** → Resultados da região aparecem primeiro

### Exemplo Prático

#### Sem Localização (Antes):
```
Usuário busca: "iPhone 13"
Query enviada: "iPhone 13"
Resultados: Todo o Brasil (SP, RJ, MG, etc.)
```

#### Com Localização (Agora):
```
Usuário busca: "iPhone 13"
Localização: Belo Horizonte, MG
Query enviada: "iPhone 13 Belo Horizonte MG"
Resultados: Prioriza Belo Horizonte e região
```

---

## 🔧 Implementação

### 1. Backend - ApifyService

```typescript
// backend/src/modules/scraping/apify.service.ts

async search(
  query: string, 
  limit = 20, 
  userLocation?: { city: string; state: string }
) {
  // Adicionar localização na query
  let searchQuery = query;
  if (userLocation?.city && userLocation?.state) {
    searchQuery = `${query} ${userLocation.city} ${userLocation.state}`;
  }

  const requestBody = {
    country: 'br',
    language: 'pt-BR',
    searchQuery: searchQuery, // ← Query modificada
    sortBy: 'LOWEST_PRICE',
    limit: limit
  };

  // Buscar no Google Shopping...
}
```

### 2. Backend - SearchService

```typescript
// backend/src/modules/search/search.service.ts

async searchByText(query: string, filters?: any, userId?: string) {
  // Buscar localização do usuário
  let userLocation;
  if (userId) {
    const user = await this.usersService.findOne(userId);
    if (user?.location?.city && user?.location?.state) {
      userLocation = {
        city: user.location.city,
        state: user.location.state,
      };
    }
  }

  // Passar localização para Apify
  const results = await this.apifyService.search(query, 50, userLocation);
  
  return results;
}
```

### 3. Frontend - Cadastro com CEP

```typescript
// frontend/app/auth/page.tsx

// Campos do formulário
const [cep, setCep] = useState('');
const [city, setCity] = useState('');
const [state, setState] = useState('');

// Buscar cidade/estado automaticamente
const handleCepChange = async (value: string) => {
  const cleanCep = value.replace(/\D/g, '');
  
  if (cleanCep.length === 8) {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();
    
    if (!data.erro) {
      setCity(data.localidade);  // Ex: "Belo Horizonte"
      setState(data.uf);          // Ex: "MG"
    }
  }
};

// Enviar no cadastro
const body = {
  email,
  password,
  name,
  location: { cep, city, state } // ← Salvo no perfil
};
```

---

## 📊 Resultados Esperados

### Teste 1: Produtos Locais

**Busca:** "apartamento 2 quartos"  
**Localização:** Belo Horizonte, MG

**Query Google:** `"apartamento 2 quartos Belo Horizonte MG"`

**Resultados:**
1. ✅ Apartamento em Belo Horizonte - R$ 220.000
2. ✅ Apartamento em Contagem (região) - R$ 210.000
3. ✅ Apartamento em Betim (região) - R$ 195.000
4. ⚠️ Apartamento em São Paulo - R$ 350.000 (aparece depois)

### Teste 2: Produtos Nacionais

**Busca:** "notebook dell"  
**Localização:** Lagoa Santa, MG

**Query Google:** `"notebook dell Lagoa Santa MG"`

**Resultados:**
1. ✅ Lojas em Belo Horizonte (próximo)
2. ✅ Lojas em MG
3. ⚠️ Lojas em outros estados (frete mais caro)

---

## 🎨 Interface do Usuário

### Tela de Busca

```
┌─────────────────────────────────────────┐
│ [🔍 Buscar produtos...]                 │
│ 📍 Buscando em: Belo Horizonte, MG     │
│    [Alterar localização]                │
└─────────────────────────────────────────┘

💡 Dica: Resultados priorizados para sua região
```

### Perfil do Usuário

```
┌─────────────────────────────────────────┐
│ Minha Localização                       │
│                                         │
│ CEP: 30130-100                         │
│ Cidade: Belo Horizonte                 │
│ Estado: Minas Gerais (MG)              │
│                                         │
│ [Alterar CEP]                          │
└─────────────────────────────────────────┘

ℹ️ Usamos sua localização para priorizar
   produtos próximos a você
```

---

## ⚡ Vantagens da Solução

### ✅ Prós

1. **Simples** - Usa apenas 1 API (Google Shopping)
2. **Sem custo extra** - Não precisa de APIs adicionais
3. **Funciona agora** - Não depende de novos scrapers
4. **Google inteligente** - Algoritmo do Google já prioriza localização
5. **Transparente** - Usuário sabe que está buscando na região dele

### ⚠️ Contras

1. **Não é 100% preciso** - Google pode retornar resultados de fora
2. **Depende do Google** - Algoritmo do Google decide priorização
3. **Não filtra completamente** - Ainda aparecem resultados nacionais

---

## 🔄 Melhorias Futuras

### Fase 1: Filtro Manual (Opcional)

Permitir usuário escolher:
```
☑️ Priorizar minha região (padrão)
☐ Apenas minha cidade
☐ Apenas meu estado
☐ Todo o Brasil
```

### Fase 2: Múltiplas APIs

Combinar Google Shopping com scrapers específicos:
```typescript
const results = await Promise.all([
  googleShopping.search(`${query} ${city} ${state}`),  // Nacional
  olxService.search(query, { city, state }),           // Local
  mercadoLivreService.search(query, { state }),        // Regional
]);

// Mesclar e ordenar por proximidade
return mergeResults(results, userLocation);
```

### Fase 3: Ordenação Inteligente

Calcular distância e reordenar:
```typescript
results.sort((a, b) => {
  // 1. Mesma cidade = prioridade máxima
  if (a.city === userCity && b.city !== userCity) return -1;
  
  // 2. Mesmo estado = prioridade média
  if (a.state === userState && b.state !== userState) return -1;
  
  // 3. Menor preço
  return a.price - b.price;
});
```

---

## 📌 Conclusão

**Solução Implementada:**
- ✅ CEP coletado no cadastro
- ✅ Cidade/Estado salvos no perfil
- ✅ Localização adicionada na query do Google
- ✅ Google prioriza resultados da região

**Próximos Passos:**
1. Testar com usuários reais
2. Avaliar qualidade dos resultados
3. Considerar adicionar scrapers específicos se necessário

**Impacto:**
- Usuários verão produtos mais relevantes
- Melhor experiência de busca
- Sem custo adicional de APIs
