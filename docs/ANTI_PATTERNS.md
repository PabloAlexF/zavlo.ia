# 🚫 Anti-Patterns Evitados no Sistema de Preço

## ❌ O que NÃO fazer (Anti-Pattern)

### Problema: String Parsing na UI

```tsx
// ❌ ERRADO - Acoplamento com texto
{message.content.includes('💰') && (
  <div>
    {message.content.split('\n').find(line => line.includes('💰'))}
  </div>
)}
```

**Por que é ruim:**

1. **Acoplamento frágil**: UI depende de string específica
2. **Não confiável**: Texto muda = quebra
3. **Difícil manutenção**: Mudar emoji quebra tudo
4. **Sem type safety**: TypeScript não ajuda
5. **Parsing manual**: Código feio e propenso a bugs

---

## ✅ O que fazer (Solução Profissional)

### Solução: Dados Estruturados

```tsx
// ✅ CORRETO - Dados estruturados
interface Message {
  priceRangeApplied?: {
    min?: number;
    max?: number;
    target?: number;
  };
}

{message.priceRangeApplied && (
  <div>
    🎯 Filtrando resultados {formatPriceRange(message.priceRangeApplied)}
  </div>
)}
```

**Por que é melhor:**

1. **Type-safe**: TypeScript valida em compile-time
2. **Desacoplado**: UI não depende de texto
3. **Manutenível**: Mudar formato não quebra
4. **Testável**: Fácil criar testes unitários
5. **Reutilizável**: Helper `formatPriceRange()` centralizado

---

## 🐛 Bug Comum: Falsy Values

### ❌ Errado:
```typescript
if (min && max) {
  // BUG: Se min = 0, nunca entra!
}
```

### ✅ Correto:
```typescript
if (min !== undefined && max !== undefined) {
  // Funciona com min = 0
}
```

**Exemplo real:**
- Query: "entre 0 e 50mil"
- `min = 0` é falsy em JavaScript
- `if (min && max)` = false ❌
- `if (min !== undefined && max !== undefined)` = true ✅

---

## 🎯 Comparação Lado a Lado

| Aspecto | String Parsing ❌ | Dados Estruturados ✅ |
|---------|-------------------|----------------------|
| Type Safety | Nenhum | Total |
| Manutenção | Difícil | Fácil |
| Testabilidade | Baixa | Alta |
| Performance | Parsing runtime | Acesso direto |
| Confiabilidade | Frágil | Robusto |
| Internacionalização | Impossível | Simples |

---

## 🌍 Bonus: Internacionalização

### Com String Parsing ❌:
```tsx
// Texto hardcoded em português
{message.content.includes('💰')}
// Como traduzir? Impossível!
```

### Com Dados Estruturados ✅:
```tsx
// Dados agnósticos de idioma
{message.priceRangeApplied && (
  <div>
    {t('filtering_results')} {formatPriceRange(message.priceRangeApplied)}
  </div>
)}

// formatPriceRange pode usar i18n
function formatPriceRange(range, locale = 'pt-BR') {
  if (range.max !== undefined) {
    return t('up_to', { 
      price: range.max.toLocaleString(locale) 
    });
  }
  // ...
}
```

---

## 📊 Impacto Real

### Cenário: Mudar formato de preço

**String Parsing ❌:**
1. Mudar backend (Python)
2. Mudar formatação (TypeScript)
3. Mudar UI (React)
4. Testar tudo manualmente
5. Rezar para não quebrar

**Dados Estruturados ✅:**
1. Mudar apenas `formatPriceRange()`
2. Testes unitários validam
3. Deploy com confiança

---

## 🧪 Testabilidade

### String Parsing ❌:
```typescript
// Como testar?
test('should show price badge', () => {
  const message = { content: '💰 Até: R$ 50.000' };
  // Precisa renderizar componente inteiro
  // Testar string exata
  // Frágil!
});
```

### Dados Estruturados ✅:
```typescript
// Teste unitário simples
test('formatPriceRange with max only', () => {
  const range = { max: 50000 };
  expect(formatPriceRange(range)).toBe('até R$ 50.000');
});

test('formatPriceRange with min and max', () => {
  const range = { min: 30000, max: 60000 };
  expect(formatPriceRange(range)).toBe('R$ 30.000 - R$ 60.000');
});
```

---

## 🏆 Lições Aprendidas

1. **Sempre prefira dados estruturados sobre parsing de strings**
2. **Use `!== undefined` ao invés de truthy checks**
3. **Centralize formatação em helpers reutilizáveis**
4. **Type safety não é luxo, é necessidade**
5. **Pense em internacionalização desde o início**

---

## 📚 Referências

- [Clean Code - Robert Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Refactoring - Martin Fowler](https://refactoring.com/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

**Implementado por:** Amazon Q Developer  
**Data:** 2025  
**Status:** ✅ Produção (Versão Corrigida)
