# Corre\u00e7\u00f5es - Sistema de Categorias e Perguntas Inteligentes

## Data: 12/03/2026

### Problema Identificado

Quando o usu\u00e1rio buscava "\u00f3culos anti luz azul", o sistema estava fazendo perguntas incorretas sobre armazenamento (64GB, 128GB, etc), que s\u00e3o relevantes apenas para smartphones e notebooks.

### Causa Raiz

1. **Categoria ausente**: \u00d3culos n\u00e3o tinha categoria espec\u00edfica, caindo em "gen\u00e9rico" ou sendo detectado erroneamente
2. **Detec\u00e7\u00e3o sem valida\u00e7\u00e3o**: O sistema detectava "storage" em qualquer query sem validar se a categoria suporta essa pergunta

### Solu\u00e7\u00f5es Implementadas

#### 1. Nova Categoria: Acess\u00f3rios \u2705

**Arquivo**: `utils/chat/categorySystem.ts`

Adicionada categoria `acessorio` com:
- **Keywords**: oculos, \u00f3culos, relogio, rel\u00f3gio, bolsa, mochila, carteira, cinto, bone, bon\u00e9, chapeu, chap\u00e9u, luva, cachecol, gravata, pulseira, colar, brinco, anel
- **Patterns**: Regex para detectar varia\u00e7\u00f5es de escrita
- **Perguntas**: Apenas condi\u00e7\u00e3o (novo/usado)

```typescript
acessorio: {
  name: 'Acess\u00f3rio',
  keywords: ['oculos', '\u00f3culos', 'relogio', 'rel\u00f3gio', 'bolsa', 'mochila', ...],
  patterns: [
    /\\b[o\u00f3]culos\\b/i,
    /\\brel[o\u00f3]gio\\b/i,
    /\\bbolsa\\b/i,
    ...
  ],
  questions: [
    {
      id: 'condition',
      question: 'Produto novo ou usado?',
      type: 'choice',
      options: ['Novo', 'Usado', 'Tanto faz'],
      required: true
    }
  ]
}
```

#### 2. Valida\u00e7\u00e3o de Categoria nas Perguntas \u2705

**Arquivo**: `utils/chat/smartQuestions.ts`

Modificada fun\u00e7\u00e3o `detectProvidedInfo()` para:
1. Detectar categoria ANTES de processar perguntas
2. Validar se a pergunta \u00e9 relevante para aquela categoria

**Antes**:
```typescript
// Detectava storage em QUALQUER query
const storagePatterns = [/\\b(\\d+)\\s*gb\\b/i, ...];
for (const pattern of storagePatterns) {
  // ... detectava sem validar categoria
}
```

**Depois**:
```typescript
// Detecta categoria primeiro
const category = detectProductCategory(query);

// S\u00d3 detecta storage para smartphone e notebook
if (category === 'smartphone' || category === 'notebook') {
  const storagePatterns = [/\\b(\\d+)\\s*gb\\b/i, ...];
  // ... agora s\u00f3 detecta quando relevante
}

// S\u00d3 detecta tipo de m\u00f3vel para categoria movel
if (category === 'movel') {
  if (/cadeira\\s*gamer/i.test(normalized)) {
    provided.type = 'Cadeira gamer';
  }
}
```

#### 3. Ajuste de Prioridades \u2705

Atualizada ordem de prioridade das categorias:

```typescript
const CATEGORY_PRIORITY: Record<string, number> = {
  smartphone: 10,
  notebook: 9,
  veiculo: 8,
  calcado_roupa: 7,
  acessorio: 6,      // Nova categoria
  eletronico: 5,     // Reduzido de 6
  movel: 4,          // Reduzido de 5
  eletrodomestico: 3, // Reduzido de 4
  generico: 1
};
```

### Fluxo Correto Agora

**Busca**: "\u00f3culos anti luz azul"

1. \u2705 Detecta categoria: `acessorio`
2. \u2705 Carrega perguntas da categoria acess\u00f3rio
3. \u2705 Pergunta apenas: "Produto novo ou usado?"
4. \u2705 N\u00c3O pergunta sobre armazenamento (irrelevante)

### Categorias Cobertas

| Categoria | Perguntas Espec\u00edficas |
|-----------|------------------------|
| **smartphone** | storage, condition |
| **notebook** | usage, condition |
| **eletrodomestico** | brand_preference, condition |
| **movel** | type, condition |
| **veiculo** | condition |
| **eletronico** | type, condition |
| **calcado_roupa** | condition, sort_by |
| **acessorio** | condition |
| **generico** | condition |

### Testes Recomendados

Execute estas buscas para validar:

```
\u2705 "\u00f3culos anti luz azul" \u2192 Deve perguntar apenas condi\u00e7\u00e3o
\u2705 "rel\u00f3gio smartwatch" \u2192 Deve perguntar apenas condi\u00e7\u00e3o
\u2705 "iPhone 15 Pro" \u2192 Deve perguntar storage + condi\u00e7\u00e3o
\u2705 "notebook gamer" \u2192 Deve perguntar usage + condi\u00e7\u00e3o
\u2705 "t\u00eanis nike" \u2192 Deve perguntar condi\u00e7\u00e3o + sort
\u2705 "bolsa feminina" \u2192 Deve perguntar apenas condi\u00e7\u00e3o
```

### Impacto

- \u2705 Perguntas mais relevantes para cada tipo de produto
- \u2705 Melhor experi\u00eancia do usu\u00e1rio
- \u2705 Menos confus\u00e3o com perguntas irrelevantes
- \u2705 Cobertura de mais categorias de produtos

### Arquivos Modificados

1. `utils/chat/categorySystem.ts` - Adicionada categoria acessorio
2. `utils/chat/smartQuestions.ts` - Valida\u00e7\u00e3o de categoria antes de detectar info
