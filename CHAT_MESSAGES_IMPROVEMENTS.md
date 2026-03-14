# Melhorias de Mensagens do Chat - Zavlo

## Instruções
Substitua as mensagens antigas pelas novas no arquivo `app/chat/page.tsx`

---

## 1. Mensagem Inicial (linha ~77 e ~420)

**SUBSTITUIR:**
```typescript
content: 'Olá! 👋 Eu sou a Zavlo, sua assistente de compras inteligente!\n\nAntes de começarmos, como posso te chamar?',
```

**POR:**
```typescript
content: 'Olá! 👋 Sou a Zavlo, sua assistente de compras inteligente!\n\nVou te ajudar a encontrar os melhores preços em todos os marketplaces do Brasil.\n\n💡 Como posso te ajudar hoje?',
```

---

## 2. Mensagem de Análise de Imagem (linha ~490)

**SUBSTITUIR:**
```typescript
content: '🔍 Analisando sua imagem...\n\nAguarde enquanto identifico o produto.',
```

**POR:**
```typescript
content: '🔍 Analisando sua imagem com IA...\n\nIdentificando produto, aguarde um momento.',
```

---

## 3. Créditos Insuficientes - Imagem (linha ~500)

**SUBSTITUIR:**
```typescript
content: 'Créditos insuficientes para busca por imagem!',
```

**POR:**
```typescript
content: '❌ Créditos insuficientes para busca por imagem!\n\n💡 Busca por imagem usa 2 créditos:\n• 1 crédito para identificar o produto\n• 1 crédito para buscar preços\n\n📊 Veja nossos planos e continue buscando!',
```

---

## 4. Produto Identificado (linha ~550)

**SUBSTITUIR:**
```typescript
content: `✅ Produto identificado!\n\n📦 ${productName}\n\n💳 Já gasto: -${creditsUsed} crédito(s) (identificação)\n💰 Saldo atual: ${remainingCredits} créditos\n\n🔍 Deseja buscar preços? (custará +1 crédito)`,
```

**POR:**
```typescript
content: `✅ Produto identificado com sucesso!\n\n📦 ${productName}\n\n💳 Crédito usado: -${creditsUsed} (identificação)\n💰 Saldo atual: ${remainingCredits} créditos\n\n🔍 Deseja buscar preços deste produto?\n(Custará +1 crédito adicional)`,
```

---

## 5. Rejeitar Busca de Imagem (linha ~750)

**SUBSTITUIR:**
```typescript
content: '🔄 Ok! Quando quiser buscar preços, é só enviar outra imagem.\n\n💡 Dica: Você também pode digitar o nome do produto para buscar!',
```

**POR:**
```typescript
content: '🔄 Entendido! Quando quiser buscar preços, envie outra imagem ou digite o nome do produto.\n\n💡 Dica: Busca por texto é mais rápida e usa apenas 1 crédito!',
```

---

## 6. Apresentação Pessoal (linha ~1050)

**SUBSTITUIR:**
```typescript
content: `Prazer em conhecer você, ${userName}! 😊\n\nSou especialista em encontrar os melhores preços do Brasil!\n\n🔍 O que faço:\n• Busco em 9+ marketplaces\n• Comparo preços automaticamente\n• Encontro ofertas exclusivas\n• Filtro por localização\n\n🎯 Marketplaces:\nOLX, Mercado Livre, Amazon, Shopee, KaBuM, Enjoei e mais!\n\n💡 Que produto você está procurando hoje?`,
```

**POR:**
```typescript
content: `Prazer em conhecer você, ${userName}! 😊\n\nSou especialista em encontrar os melhores preços do Brasil!\n\n🎯 O que faço por você:\n• Busco em 9+ marketplaces simultaneamente\n• Comparo preços automaticamente\n• Encontro as melhores ofertas\n• Filtro por localização e condição\n\n💡 Digite o produto que você procura e vou encontrar as melhores ofertas!`,
```

---

## 7. Conversa Casual (linha ~1070)

**SUBSTITUIR:**
```typescript
content: 'Tudo ótimo por aqui! 😊\n\nEstou pronta para te ajudar a encontrar os melhores preços!\n\n💰 Economize tempo e dinheiro:\n• Digite o produto que procura\n• Eu busco nos principais sites\n• Você escolhe a melhor oferta\n\n🔍 O que você gostaria de buscar?',
```

**POR:**
```typescript
content: 'Tudo ótimo por aqui! 😊\n\nEstou pronta para te ajudar a encontrar os melhores preços!\n\n🛒 Como funciona:\n1. Você me diz o que procura\n2. Eu busco nos principais marketplaces\n3. Você escolhe a melhor oferta e economiza!\n\n💡 Que produto você está procurando?',
```

---

## 8. Saudação (linha ~1090)

**SUBSTITUIR:**
```typescript
content: 'Olá! 👋\n\nQue bom te ver por aqui!\n\nSou a Zavlo, sua assistente de compras inteligente. Posso te ajudar a encontrar os melhores preços em diversos produtos!\n\n💡 Como funciona:\n1️⃣ Você me diz o que procura\n2️⃣ Eu busco nos melhores sites\n3️⃣ Você economiza!\n\n🛒 Que produto você está procurando?',
```

**POR:**
```typescript
content: 'Olá! 👋 Que bom te ver por aqui!\n\nSou a Zavlo, sua assistente de compras inteligente. Vou te ajudar a encontrar os melhores preços!\n\n🎯 Como funciona:\n1️⃣ Você me diz o que procura\n2️⃣ Eu busco nos melhores marketplaces\n3️⃣ Você economiza tempo e dinheiro!\n\n💡 Que produto você está procurando?',
```

---

## 9. Despedida (linha ~1120)

**SUBSTITUIR:**
```typescript
content: 'Até mais! 👋\n\nVolte sempre que precisar buscar produtos!',
```

**POR:**
```typescript
content: 'Até logo! 👋\n\nVolte sempre que precisar encontrar os melhores preços!\n\n💡 Estou aqui 24/7 para te ajudar a economizar.',
```

---

## 10. Sobre a Plataforma (linha ~1180)

**SUBSTITUIR:**
```typescript
content: '🤖 Sobre a Zavlo.ia:\n\nSou uma IA especializada em encontrar os melhores preços do Brasil!\n\n🔍 O que faço:\n• Busco em 9+ marketplaces\n• Comparo preços automaticamente\n• Encontro ofertas exclusivas\n• Filtro por localização\n\n🎯 Marketplaces:\nOLX, Mercado Livre, Amazon, Shopee, KaBuM, Enjoei e mais!\n\n💡 Digite um produto para começar!',
```

**POR:**
```typescript
content: '🤖 Sobre a Zavlo\n\nSou uma IA especializada em encontrar os melhores preços do Brasil!\n\n🎯 O que faço:\n• Busco em 9+ marketplaces simultaneamente\n• Comparo preços em tempo real\n• Encontro ofertas exclusivas\n• Filtro por localização e condição\n\n🏪 Marketplaces integrados:\nOLX, Mercado Livre, Amazon, Shopee, KaBuM, Enjoei, Webmotors, iCarros e mais!\n\n💡 Digite um produto para começar a economizar!',
```

---

## 11. Ajuda (linha ~1200)

**SUBSTITUIR:**
```typescript
content: '❓ Como usar a Zavlo:\n\n🔄 Processo:\n1️⃣ Digite o produto (ex: "iPhone 15")\n2️⃣ Escolha localização (opcional)\n3️⃣ Escolha novo ou usado\n4️⃣ Confirme a busca\n\n💡 Dicas para melhores resultados:\n• Seja específico: "notebook gamer i7 16gb"\n• Use marcas: "tênis nike air max 90"\n• Inclua detalhes: "geladeira frost free 2 portas"\n\n🤖 Comandos úteis:\n• "meus créditos" - Ver saldo\n• "planos" - Ver assinaturas\n• "ajuda" - Este menu',
```

**POR:**
```typescript
content: '❓ Como usar a Zavlo\n\n🔄 Processo simples:\n1️⃣ Digite o produto (ex: "iPhone 15 Pro")\n2️⃣ Escolha localização (opcional)\n3️⃣ Escolha ordenação (relevância, menor/maior preço)\n4️⃣ Escolha quantidade de resultados\n5️⃣ Confirme e veja os resultados!\n\n💡 Dicas para melhores resultados:\n• Seja específico: "notebook gamer i7 16gb rtx"\n• Use marcas: "tênis nike air max 90"\n• Inclua detalhes: "geladeira frost free inox"\n\n🤖 Comandos úteis:\n• "meus créditos" - Ver saldo\n• "planos" - Ver assinaturas\n• "ajuda" - Este menu',
```

---

## 12. Perguntas Gerais (linha ~1220)

**SUBSTITUIR:**
```typescript
content: '❓ Como posso ajudar:\n\n🔍 Para buscar produtos:\n• Digite: "iPhone 15", "notebook gamer"\n• Comparo preços de 9+ sites\n\n💬 Perguntas frequentes:\n• "meus créditos" - Ver saldo\n• "planos" - Ver assinaturas\n• "como funciona" - Sobre a Zavlo\n• "ajuda" - Comandos completos\n\n🎯 O que você procura?',
```

**POR:**
```typescript
content: '❓ Como posso ajudar\n\n🔍 Para buscar produtos:\n• Digite: "iPhone 15", "notebook gamer", "tênis nike"\n• Ou envie uma foto do produto\n• Comparo preços de 9+ marketplaces automaticamente\n\n💬 Comandos úteis:\n• "meus créditos" - Ver saldo de créditos\n• "planos" - Ver planos e preços\n• "como funciona" - Sobre a Zavlo\n• "ajuda" - Menu completo de comandos\n\n🎯 Digite o produto que você procura!',
```

---

## 13. Não Entendi (linha ~1240)

**SUBSTITUIR:**
```typescript
content: '🤔 Não entendi...\n\nTente:\n• "iPhone 15 Pro"\n• "notebook gamer"\n• "tênis nike"\n• "meus créditos"\n• "planos"\n• "ajuda"',
```

**POR:**
```typescript
content: '🤔 Não entendi sua mensagem...\n\n💡 Tente:\n• "iPhone 15 Pro" - Buscar produto\n• "notebook gamer" - Buscar categoria\n• "tênis nike" - Buscar por marca\n• "meus créditos" - Ver saldo\n• "planos" - Ver preços\n• "ajuda" - Ver comandos\n\nOu envie uma foto do produto! 📸',
```

---

## 14. Busca Cancelada (linha ~1650)

**SUBSTITUIR:**
```typescript
content: '🔄 Vejo que você cancelou a busca!\n\n💡 Dica: Digite o produto com o máximo de detalhes possíveis para melhores resultados.\n\nExemplos:\n• "iPhone 13 Pro 256GB"\n• "Tênis Nike Air Max 270 preto"\n• "Notebook Gamer i7 16GB RTX"',
```

**POR:**
```typescript
content: '🔄 Busca cancelada!\n\n💡 Dica: Para melhores resultados, seja o mais específico possível.\n\n✨ Exemplos de buscas eficientes:\n• "iPhone 13 Pro Max 256GB azul"\n• "Tênis Nike Air Max 270 preto tamanho 42"\n• "Notebook Gamer Acer i7 16GB RTX 3060"\n\n🎯 Digite o produto que você procura!',
```

---

## ✅ Resumo das Melhorias

- ✅ Linguagem mais clara e profissional
- ✅ Preços atualizados (R$ 27, R$ 77, R$ 197)
- ✅ Mensagens mais concisas e diretas
- ✅ Emojis consistentes e relevantes
- ✅ Instruções mais claras
- ✅ Foco em "marketplaces" ao invés de "sites"
- ✅ Destaque para recursos principais
- ✅ Call-to-actions mais efetivos
