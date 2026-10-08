# FINANCAS.md — Contabilidade, limites e objetivos da diretoria

> Entrada obrigatória do projeto. Define como cada clube ganha, gasta, quebra e
> como a diretoria julga o trabalho do gestor.

---

## 1. Moeda e escala

- Moeda: **CR** (crone). Todos os valores no save são inteiros em CR.
- O código usa `number` (float64) com arredondamento para inteiro apenas na
  apresentação. Nenhum valor monetário é negativo.

---

## 2. Receitas anuais (estimativa por temporada)

```
receita = bilheteria + transmissao + patrocínio + loja + miscellaneous
```

### 2.1 Bilheteria

```
bilheteria = capacidade × 14 × taxaOcupacao × fatorJogo × fatorClima
```

| Fator | Faixa | Regra |
|---|---|---|
| `taxaOcupacao` | 0,55–0,98 | 0,98 = esgotado; cai 0,05 após derrota em casa |
| `fatorJogo` | 0,6–2,0 | 2,0 = derbi (ver `LIGAS.md` §6); 1,6 = jogo contra título; 1,0 = normal; 0,6 =já rebaixado na tabela |
| `fatorClima` | 0,85–1,15 | 1,15 =MANDATO class com torcida forte |

Exemplo (AUR01, capacidade 62.000): `62.000 × 14 × 0,95 × 1,6 = 1,32 M por jogo
em casa` → ~19 M por temporada em 19 jogos mandantes.

### 2.2 Transmissão

```
transmissao = baseCopa + parcelaPosicao
```

| Parcela | Valor por temporada |
|---|---|
| 1º lugar | 22 M |
| 2º | 19 M |
| 3º a 4º | 17 M |
| 5º a 8º | 15 M |
| Restante | 11 M |

`baseCopa` por liga: `AUR` 8 M, `BRA` 7 M, `NYL` 6 M (a liga mais fraca paga menos).

### 2.3 Patrocínio

```
patrocinio = potencial × fReputacao
```

| Potencial | Faixa (M/temporada) |
|---|---|
| Principal (camisa) | 3 a 55, conforme reputação |
| Manga | 25% do principal |
| Treinador/arquibancada | 15% do principal |
| Total | 1,4 × principal |

`fReputacao`: 0,5 (rep < 25) a 2,2 (rep > 90). Contrato de 1 a 4 anos, com
renegociação anual. Falha em objetivos reduz o principal em até 30% (ver §5).

### 2.4 Loja e merchandise

```
loja = receitaBilheteria × 0,25 × fTorcida + 250.000
```

`fTorcida` (0,6–1,8) cresce com o tempo de Stay em liga e títulos recentes.

### 2.5 Federation (receita fixa)

`3 M/temporada` para todos os clubes — cobre custos mínimos.

---

## 3. Despesas anuais

```
despesa = folhaSalarial + staff + manutencaoEstadio + juros + compras
```

### 3.1 Folha salarial

- Já inclui o elenco todo (titulares + reservas)
- Multiplicadores: `+15%` bônus por meta, `+5%` por ano extra de contrato
- Ajuste de `-10%` se folha > teto do FFP (o clube corta custos)

### 3.2 Staff (quadro técnico e administrativo)

| Item | Custo base (M/temporada) |
|---|---|
| Técnico (você) | 0,8 a 4,0 conforme reputação do clube |
| 2 assistentes | 0,6 |
| Goleiro | 0,4 |
| Preparador físico | 0,4 |
| Médico + fisioterapeuta | 0,7 |
| 2 scouts | 0,3 a 1,2 conforme reputação |
| Administrativo | 0,5 |

Total fixo: **3,7 M a 8,1 M/temporada**.

### 3.3 Manutenção do estádio

```
manutencao = capacidade × 120 CR/ano
```

`AUR01`: 62.000 × 120 = 7,4 M/ano. Estádios pequenos (≤ 10.000) têm custo mínimo
de 1,2 M/ano.

### 3.4 Juros

`8% ao ano` sobre saldo devedor. Saldo positivo rende `2%`.

---

## 4. Regra financeira (FFP simplificado)

```
tetoSalarial = receitaPrevista × 0,72
tetoInvestimento = receitaPrevista × 0,35
```

| Excesso | Consequência |
|---|---|
| ≤ 5% | Sem penalidade (aviso no painel) |
| 5–15% | Multa de 2 M, proibido investimento na próxima janela |
| 15–30% | Multa de 5 M, 5 pontos de dedução na Fidúcia |
| > 30% ou 2 infrações no mesmo ano | **Penalidade financeira**: o clube perde 2 M de orçamento no ano seguinte |

**Regras rígidas:**
1. Nenhuma contratação sem `valor ≤ orcamentoDisponivel`
2. Nenhuma contratação se a folha ultrapassar `tetoSalarial` (a IA bloqueia e avisa)
3. Se `saldo < 0` no fim da temporada: multa +_notificação vermelha na tela principal
4. Se `saldo < -20 M` em dois anos seguidos: **falência** (fim de jogo, tela de demissão)

---

## 5. Objetivos da diretoria

A diretoria define 3–5 objetivos por temporada. Peso por tipo:

| Objetivo | Peso |
|---|---|
| Terminar no top 4 da liga | 30 |
| Ser campeão da liga | 25 |
| Classificar para a Copa Continental | 20 |
| Vencer a Copa Nacional | 15 |
| Gastar menos de X do orçamento | 15 |
| Ter 2+ jogadores da base com potencial ≥ 16 | 20 |
| Faturamento ≥ X | 20 |
| Não ter nenhum jogador acima de 30 anos no XI | 10 (objetivo "juventude") |

**Fidúcia (0–100):**

| Eventos | Efeito |
|---|---|
| Objetivo cumprido | +10 a +25 conforme peso |
| Objetivo quase cumprido (80%) | +5 |
| Objetivo falhado | −15 |
| Rebaixamento na liga | −35 |
| Falta de compromisso (não ir ao banco em jogo) | −10 |
| Rescisão de contrato de estrela que não joga | −8 |

A Fidúcia afeta: **orçamento da próxima temporada** (+0,5% por ponto acima de 60),
atratividade de jogadores e risco de demissão.

| Fidúcia | Consequência |
|---|---|
| ≥ 75 | lucro extra: "a torcida lota o estádio" |
| 50–74 | neutro |
| 25–49 | Advertência formal e objetivos mais duros no ano seguinte |
| 10–24 | **Última chance**: qualquer objetivo falhado = demissão |
| < 10 | Demissão imediata |

---

## 6. Fluxo de caixa simulado

Todo dia 30 de junho de cada ano:

1. Receitas anuais entram
2. Despesas fixas saem
3. Folha salarial do ano seguinte é fixada pelo gestor
4. Orçamento de transferências = `receitaPrevista × 0,35 − comprasDoAno`
5. Fidúcia é recalculada
6. Objetivos do ano seguinte são sorteados pela diretoria
7. Contratos que chegam ao fim são libertados ou renovados automaticamente

**Teste obrigatório:** `tests/financas.test.ts` verifica que
`saldo(temporada N+1) = saldo(N) + receitas(N) − despesas(N) − compras(N)`,
sem diferença de mais de 1 CR.

---

## 7. Regras de invariantes

1. Nenhum valor monetário inválido no save (o saldo pode ser negativo, mas nunca `NaN`)
2. Nunca gastar mais do que o disponível
3. Folha nunca abaixo de 30% do mínimo (salários de estrelas não zeram)
4. Contas sempre fecham no fechamento do ano
5. Nenhum cálculo depende de `Date.now()`, `Math.random()` ou locale do sistema