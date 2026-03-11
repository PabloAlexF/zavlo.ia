# Product Knowledge Graph

## 🎯 Visão Geral

O **Product Knowledge Graph** é um sistema de detecção inteligente que mapeia modelos de produtos para suas marcas e categorias automaticamente.

## 🧠 Como Funciona

### 1. Detecção de Modelo → Marca

Quando o usuário menciona um modelo específico, o sistema detecta automaticamente a marca:

```
Entrada: "cloudrunner 2 waterproof"
Saída: {
  brand: "on running",
  model: "On Cloudrunner 2",
  category: "running shoe"
}
```

### 2. Enriquecimento Automático

A query é enriquecida com informações contextuais:

```
Entrada: "cloudrunner 2 waterproof"
Saída: "on running cloudrunner 2 waterproof running shoe"
```

### 3. Detecção de Condição

O sistema detecta automaticamente se o produto é novo ou usado:

```
"iphone 13 usado" → condition: "usado"
"macbook novo" → condition: "novo"
"ps5 lacrado" → condition: "novo"
```

## 📊 Modelos Suportados

### Running Shoes (On Running)
- `cloudrunner` / `cloudrunner 2`
- `cloudflow`
- `cloudswift`

### Sneakers (Nike)
- `air max`
- `air force`
- `jordan`

### Running Shoes (Adidas)
- `ultraboost`
- `nmd`
- `superstar`
- `yeezy`

### Sneakers (Puma)
- `suede`
- `rs-x`

### Running Shoes (Asics)
- `gel`

### Sneakers (New Balance)
- `574`
- `990`

## 🔧 Como Adicionar Novos Modelos

Edite o arquivo `brandDetector.ts`:

```typescript
const MODEL_KNOWLEDGE: Record<string, ModelInfo> = {
  'nome-do-modelo': {
    brand: 'marca',
    category: 'categoria',
    fullName: 'Nome Completo'
  }
}
```

## 🎯 Benefícios

### 1. Queries Mais Precisas
- ❌ Antes: `cloudrunner 2 waterproof`
- ✅ Depois: `on running cloudrunner 2 waterproof running shoe`

### 2. Menos Perguntas
- Detecta marca automaticamente
- Detecta condição automaticamente
- Detecta categoria automaticamente

### 3. Melhores Resultados
- Busca mais precisa nos marketplaces
- Ranking melhorado
- Menos resultados irrelevantes

## 📈 Impacto

### Antes do Knowledge Graph
```
Usuário: "cloudrunner 2 waterproof"
Sistema: "Tem preferência de marca?"
Usuário: "Nenhuma dessas marcas"
Sistema: "Produto novo ou usado?"
Usuário: "Novo"
Query final: "cloudrunner 2 waterproof novo"
```

### Depois do Knowledge Graph
```
Usuário: "cloudrunner 2 waterproof novo"
Sistema: [detecta automaticamente]
  - Marca: On Running
  - Modelo: Cloudrunner 2
  - Condição: Novo
  - Categoria: Running Shoe
Query final: "on running cloudrunner 2 waterproof running shoe novo"
```

## 🚀 Próximos Passos

### Expansão do Graph
- [ ] Adicionar mais modelos de tênis
- [ ] Adicionar eletrônicos (iPhone, Galaxy, etc.)
- [ ] Adicionar notebooks (MacBook, ThinkPad, etc.)
- [ ] Adicionar consoles (PS5, Xbox, Switch)

### Melhorias
- [ ] Fuzzy matching para modelos
- [ ] Detecção de variantes (Pro, Max, Ultra)
- [ ] Sinônimos de categoria
- [ ] Detecção de cor/tamanho

## 📚 Referências

Este sistema é inspirado em:
- **Amazon Product Graph**
- **Google Shopping Knowledge Graph**
- **eBay Structured Data**

## 🎓 Conceitos Técnicos

### Entity Extraction
Extração de entidades estruturadas de texto não estruturado.

### Query Enrichment
Adição de contexto semântico à query do usuário.

### Product Taxonomy
Hierarquia de categorias de produtos.

---

**Última atualização**: 2024
**Versão**: 1.0
