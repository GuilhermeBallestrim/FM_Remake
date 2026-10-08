# MERCADO.md — Avaliação, negociar e IA dos clubes

> Entrada obrigatória do projeto. Define o cálculo de valor de mercado, a IA de
> decisão dos 60 clubes e as regras de negociação por lances. Nada de "o clube quer e
> paga": todo valor sai de uma fórmula.

---

## 1. Valor de mercado

```
valor = overall^2.15 × fIdade × fPosicao × fPotencial × fContrato × fReputacao × fForma × fStatus
```

### 1.1 `fIdade` (tabela)

| Idade | `fIdade` | Comentário |
|---|---|---|
| 17 | 1,35 | joia; clubes grandes pagam caro |
| 18–19 | 1,25 | |
| 20–21 | 1,15 | |
| 22–23 | 1,10 | pico de valor |
| 24–25 | 1,05 | |
| 26–27 | 1,00 | referência |
| 28–29 | 0,90 | |
| 30–31 | 0,75 | |
| 32–33 | 0,55 | |
| 34–35 | 0,35 | |
| 36+ | 0,20 | quase sem valor de mercado |

Jogadores de 24 a 27 anos são os mais caros em termos absolutos porque combinam
`overall` alto com `fIdade` alto.

### 1.2 `fPosicao`

| Posição | Fator | Motivo |
|---|---|---|
| `ATA` | 1,25 | raro e decisivo |
| `MEI` | 1,15 | cria jogo |
| `SA` | 1,12 | |
| `MD`/`ME` | 1,08 | |
| `MC` | 1,05 | |
| `LD`/`LE` | 1,00 | |
| `ZAG` | 0,92 | valor de mercado menor que sua importância tática |
| `GOL` | 0,85 | valor muito atrelado a reputação |

### 1.3 `fPotencial`

`fPotencial = 1 + (potencial − overall) × 0,05`, limitado a 1,0–1,40.

Joia de 18 anos com overall 11 e potencial 18 vale ~1,35× o valor de mercado nominal.

### 1.4 `fContrato` (anos restantes × Already-at-club)

| Anos restantes | Fator |
|---|---|
| 5+ | 1,30 |
| 4 | 1,20 |
| 3 | 1,10 |
| 2 | 1,00 |
| 1 | 0,85 |
| 0 (livre) | 0,65 |

Multa de rescisão é uma **quantia absoluta**, não multiplicador: se o clube pode
pagar a multa, o preço vira `multa + Premium`.

### 1.5 `fReputacao` (do clube comprador)

| Reputação | Fator | Efeito |
|---|---|---|
| ≥ 85 | 1,25 | paga acima da tabela |
| 70–84 | 1,15 | |
| 55–69 | 1,05 | |
| 40–54 | 0,95 | |
| 25–39 | 0,85 | |
| < 25 | 0,70 | só aposta em barato |

### 1.6 `fForma` e `fStatus`

| Situação | Fator |
|---|---|
| Temporada brilliant (nota média ≥ 8,0) | 1,12 |
| Lesão grave (mais de 8 semanas) | 0,45 |
| Lesão leve (menos de 3 semanas) | 0,80 |
| Suspenso (qualquer) | 0,85 |
| Moral abaixo de 30 | 0,80 |
| Em lista de negociáveis pelo clube | 0,90 |

Multiplicadores são empilhados, com teto de 0,35 e piso de 1,80.

---

## 2. IA dos clubes (quem compra, quem vende)

Cada clube roda uma decisão por posição-alvo, todo dia de janela. Regras:

### 2.1 Prioridade de posição

```
peso = fPosicao × (necessidade numérica) × (gap de qualidade) × fOrcamento
```

- **Necessidade numérica**: 0 se há mais de 2 jogadores na posição e todos acima de
  overall 11; 1,0 se há 1; 2,0 se a posição está subdimensionada; 3,0 se o XI ideal
  não tem ninguém na posição
- **Gap de qualidade**: 1,0 se o melhor da posição é aceitável; 2,0 se o XI ideal é
  claramente pior que a média da liga; 3,0 se o jogador Available é de elite

### 2.2 Decisão de compra

O clube considers um jogador se:

1. `peso ≥ limiar` (1,5 por padrão)
2. Valor de mercado ≤ `orcamentoDisponivel × fReputacao`
3.Idade do jogador ≤ `idadeMaximaInteresse` (33 para elite, 30 para médios, 27 para
   pequenos)
4. Não há ordem da diretoria de não signs Player X
5. Dia da janela correto (janelas obrigatórias: 10 de julho a 1º de setembro e
   1º de janeiro a 2 de fevereiro)

### 2.3 Decisão de venda

Um clube vendes se:

- O jogador está na **lista de negociáveis** (definida pelo gestor), **ou**
- Oferta ≥ `valor × fUrgencia × fRelacaoAdversario`
- Saldo em caixa negativo ou folha acima do teto (urgência alta)

Fatores:

| Fator | Faixa | Quando |
|---|---|---|
| `fUrgencia` | 0,85–1,25 | 0,85 se o jogador é titular beloved; 1,25 se está na lista |
| `fRelacaoAdversario` | 0,90–1,30 | 1,30 se é o rival direto; 0,90 se é um clube da mesma liga que não disputa o título |
| `fOfertaForcada` | 1,0–1,2 | aumenta se folha salarial acima do teto |

### 2.4 Comportamento por reputação

| Reputação | Estilo de mercado |
|---|---|
| ≥ 85 | paga o mercado, briga por jogador de elite, faz propostas para 3 candidatos |
| 70–84 | paga até 10% acima, foca em 1–2 reforços |
| 55–69 | paga o mercado, foca em Posição mais fraca |
| 40–54 | foca em Young players (≤ 23 anos), paga pouco |
| 25–39 | compra só bargains (≤ 60% do mercado), vende tudo |
| < 25 | quase inativo; para ≥ 3 nomes se possível |

---

## 3. Negociação por lances

Cada negociação é uma sequência de rodadas. Cada rodada: o **jogador** ou o
**clube vendedor** responde a uma proposta.

### 3.1 Estrutura de uma proposta

```json
{
  "valorCompraCr": 15000000,
  "salarioAnualCr": 2400000,
  "duracaoAnos": 4,
  "bonusPorJogoCr": 50000,
  "bonusPorGolCr": 120000,
  "clausulaLiberacaoCr": 45000000,
  "percentualDireitos": 100,
  "tipo": "transferencia"
}
```

`percentualDireitos` permite **10/30/50% de participação** em vendas futuras.

### 3.2 Reação do clube vendedor

O vendedor compara `valorCompraCr` com `valorEsperado = valorMercado × fUrgencia × fRelacaoAdversario × fOfertaForcada`.

| Relação oferta/esperado | Resposta |
|---|---|
| < 0,60 | Rejeita imediatamente |
| 0,60–0,85 | Rejeita e contra-propõe `esperado × 1,15` |
| 0,85–1,00 | Aceita se a relação for > 0,93; senão contra-propõe `esperado` |
| 1,00–1,20 | Aceita |
| > 1,20 | Aceita e o vendedor fica "feliz", o que melhora a moral do elenco |

Salário é um filtro independente: se `salarioAnual > fSalario × overall^1.5`, o
jogador recusa **antes** do clube.

### 3.3 Reação do jogador

O jogador aceita se (soma de pontos ≥ 50):

| Critério | Peso | Regra |
|---|---|---|
| Salário | 30 | `pontos = 30 × (salárioOfertado / salárioEsperado)` |
| Minutagem prometida | 20 | `pontos = 20 × min(1, promessas / 45jogos)` |
| Papel tático | 15 | compatível com `posicao` e o que ele joga hoje |
| Time | 15 | `reputacao` do clube comprador |
| Contrato longo | 10 | `duracaoAnos ≥ 3` dá 10, senou proporcional |
| Bônus | 10 | `bonusPorGol` alto compensa salário baixo |

Rejeições geram **rumor** no painel do gestor.

### 3.4 Loop de negociação

1. O gestor faz a proposta
2. O clube vendedor responde (aceita / contra-propõe / rejeita)
3. Se aceito, o jogador responde
4. Se o jogador recusa, o gestor pode melhorar salário/papel ou desistir
5. Máximo de **3 contrapropostas** antes do vendendor fechar a porta por 10 dias

### 3.5 Empréstimos

| Conceito | Regra |
|---|---|
| Custo | 10% do salário durante o empréstimo |
| Opção de compra | 20% do valor de mercado |
| Obrigação de compra | 40% do valor de mercado se o jogador jogar mais de 20 jogos |
| Limite | Clubes de rep < 40 não podem emprestar mais de 3 jogadores por vez |
| Salário | 50% pago pelo clube emprestado |

---

## 4. Regras de invariantes (testar em `tests/mercado.test.ts`)

1. Nenhum clube pode ter valor de mercado total negativo
2. O valor de mercado é **sempre ≥ 0**
3. Nenhum clube pode fechar negócio acima do orçamento disponível
4. A folha salarial nunca fica abaixo do salário mínimo (valor × 0,3)
5. Nenhum clube com overall médio > média da liga aceita vender por menos de 0,7× o mercado
6. Regras determinísticas: mesma seed + mesma sequência de propostas = mesmo resultado
7. Nenhum jogador é vendido duas vezes
8. Um clube com mais de 30 jogadores precisa confirmar a venda na tela de UI

---

## 5. Modificadores de mercado ativos no mundo

- **JANELAS**: 10 de julho – 1º de setembro (principal), 1º de janeiro – 2 de fevereiro (intermediária)
- **DIAS DE MERCADO**: fecha às 18h do dia útil anterior à rodada 18 e à rodada 34
- **CLÁUSULAS**: 20% dos contratos têm cláusula de liberação (ver `ELENCO.md` §11)
- **PREFERÊNCIA NACIONAL**: clubes da mesma liga dão +10% de valor percebido nas negociações entre si (tradição de liga)
- **DÉBITO TÉCNICO**: subidas/descensos entre as ligas **não** implementadas na v1 (`TODO.md`)

> Nota de texto corrompido detectado na redação: as regras acima substituem
> quaisquer versões anteriores deste arquivo. Se encontrar trechos estranhos aqui,
> apague e reescreva conforme este documento.