# Step 3 — Especificação mínima do chat (Price History MVP)

## Objetivo do passo
Definir a menor regra possível para o chat usar tendência de preço sem mudar o fluxo principal da busca.

## Escopo MVP (somente chat)
- Adicionar **1 pergunta opcional** de preferência de tendência.
- Aplicar a preferência apenas como **priorização visual/ranking leve**.
- Não bloquear resultados quando não houver histórico.

## Campo novo de preferência (classificação)
- `prefer_price_drop?: boolean | null`

Semântica:
- `true`: usuário quer priorizar itens com queda recente.
- `false`: usuário não quer priorização por tendência.
- `null/undefined`: indiferente (comportamento atual).

## Pergunta do chat (MVP)
Quando o campo pendente for `prefer_price_drop`, perguntar:

**Pergunta:**
- "Quer priorizar produtos com preço em queda recente?"

**Sugestões:**
- "📉 Sim, em queda"
- "Tanto faz"

Mapeamento:
- respostas contendo `sim|queda|caindo|oferta` => `true`
- respostas contendo `não|nao|tanto faz|indiferente` => `false`

## Regra de tendência (MVP)
Janela fixa inicial: **30 dias**.

Definições:
- `latestPrice` = preço mais recente do histórico.
- `oldestPrice` = preço mais antigo dentro da janela.
- `dropPercent = ((oldestPrice - latestPrice) / oldestPrice) * 100`.

Classificação:
- **Em queda**: `dropPercent >= 10`.
- **Estável**: `-5 < dropPercent < 10`.
- **Em alta**: `dropPercent <= -5`.
- **Sem dados**: histórico insuficiente (<2 pontos).

## Comportamento no chat
Se `prefer_price_drop === true`:
- Priorizar no topo produtos com status **Em queda**.
- Exibir badge textual em cada card elegível:
  - `📉 Caiu X% (30d)`

Se `prefer_price_drop !== true`:
- Não alterar ordenação atual.
- Ainda pode mostrar badge quando houver dado (somente informativo, sem reordenar).

## Fallbacks obrigatórios
- Se produto não tiver histórico: manter item normalmente, sem badge de tendência.
- Se API de histórico falhar: manter busca normal, sem erro para o usuário.
- Nunca retornar lista vazia por causa de tendência.

## Critérios de aceite do passo 3
1. Pergunta e sugestões estão definidas e fechadas.
2. Janela e limiares estão definidos: 30d, queda >= 10%.
3. Fallbacks definidos para ausência/erro de histórico.
4. Sem impacto em créditos, autenticação ou fluxo de busca principal.

## Fora do escopo deste passo
- Gráfico de histórico.
- Alertas automáticos de preço.
- Modelos preditivos de tendência.
- Otimização por categoria/produto.
