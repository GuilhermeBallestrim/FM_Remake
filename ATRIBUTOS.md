# ATRIBUTOS.md — Grade de elenco e seu efeito no motor

> Entrada obrigatória do projeto. Define os **46 atributos** (36 de linha + 10 de
> goleiro), como cada um entra na simulação e como o *overall* é calculado por
> posição. Nenhum atributo pode existir sem uso na simulação.

---

## 1. Convenções

| Item | Regra |
|---|---|
| Identificador | inglês, `camelCase`, ex.: `longShots` (é a chave no objeto `Jogador`) |
| Rótulo visível | português, ex.: "Chutes de longe" |
| Escala | **1 a 20** (inteiro). 1 = incompetente, 10 = profissional de 2ª divisão, 15 = titular forte, 19 = craque |
| Arredondamento | todos os valores gravados no save são inteiros; cálculos intermediários usam float |
| Regra de ouro | se um atributo não aparece em nenhuma fórmula de `sim/`, ele não entra no jogo |

`Jogador` mínimo (obrigatório em qualquer exemplo do prompt):

```json
{
  "id": "p_0001",
  "nome": "Ivar Solheim",
  "dataNascimento": "1998-04-12",
  "idade": 28,
  "nacionalidade": "AUR",
  "paisOrigem": "Auróvia",
  "posicao": "MEI",
  "posicoesAlternativas": ["MC"],
  "peDominante": "D",
  "alturaCm": 181,
  "pesoKg": 74,
  "overall": 14,
  "potencial": 15,
  "atributos": { "passe": 15, "visao": 16, "drible": 14 },
  "condicaoFisica": 92,
  "moral": 78,
  "confianca": 70,
  "ferimentos": [],
  "suspensao": 0,
  "contrato": { "salarioAnualCr": 2400000, "anosRestantes": 3, "valorRescisaoCr": 18000000 }
}
```

> No código, as chaves são os identificadores (`passing`, `vision`, `dribbling`).
> Os rótulos em português acima são só para a UI. Nenhum outro idioma nos nomes.

---

## 2. Atributos de linha (36)

### 2.1 Técnica e construção de jogada (12)

| id | Rótulo | Descrição | Uso no motor |
|---|---|---|---|
| `finishing` | Finalização | Converter chances dentro da área | `P(gol) = base × (0,6 + finishing/25)`; erro angular final = `1 − finishing/40` |
| `longShots` | Chutes de longe | Finalizar de fora da área | Habilita evento de chute longo; raio de chute = `8 + longShots/2` metros |
| `passing` | Passe | Precisão e volume do passe | `P(passe certo) = 0,55 + passing/45 − erroPosição/120` |
| `vision` | Visão de jogo | Ler a linha de passe | Define quantas opções de passe são geradas por lance (1 a 5) |
| `crossing` | Cruzamento | Bola aérea para a área | Qualidade e altura do cruzamento: `altura = 2 + crossing/10` m |
| `dribbling` | Drible | Fazer o marcador perder | `P(vencer drible) = 0,35 + dribbling/40 vs. defesa do marcador` |
| `ballControl` | Controle de bola | Dominar o primeiro toque | Reduz chance de perda em 60% dos eventos de contato |
| `firstTouch` | Primeiro toque | Qualidade do domínio | Se `firstTouch ≥ 14`, 25% de chance de soltar passe em movimento |
| `technique` | Técnica | Habilidade genérica com a bola | Buffer contra Style de marcador adversário |
| `heading` | Cabeceio | Domínio e cabeceio | `P(cabeceio) = 0,25 + heading/50`; disputes de bola aéreo |
| `flair` | Criatividade | Gols e jogadas fora do roteiro | Gatilho de eventos raros (1,5% de chance por lance com flair ≥ 15) |
| `longPassing` | Passe longo | Trocar de lado do campo | Habilita lançamento para o atacante de linha; precisão = `0,35 + longPassing/50` |

### 2.2 Defesa (9)

| id | Rótulo | Uso no motor |
|---|---|---|
| `tackling` | Desarme | `P(vencer desarme) = 0,4 + tackling/50 − opponentAgility/120` |
| `marking` | Marcação | Acompanha o adversário marcado e reduz a chance de ele executar a ação |
| `anticipation` | Antecipação | Antecipa a bola e cria interceptações antes do passe |
| `positioning` | Posicionamento | Mantém a linha e o espaço; reduz xG concedido |
| `strength` | Força | Disputas 50/50, proteção de bola e bola aérea |
| `jumping` | Salto | Ganho nas disputas de cabeceio |
| `aggression` | Agressividade | Mais desarmes tentados; **mais cartões** |
| `workRate` | Intensidade | Distância percorrida por minuto de jogo |
| `teamWork` | Trabalho em equipe | Executa bem os papéis coletivos (pressão, cobertura, marcação combinada) |

### 2.3 Físico (8)

| id | Rótulo | Uso no motor |
|---|---|---|
| `pace` | Velocidade | Velocidade máxima de corrida (m/s) |
| `acceleration` | Aceleração | Ganho de velocidade nos 5 primeiros metros |
| `agility` | Agilidade | Mudança de direção e suporte ao drible |
| `stamina` | Resistência | Queda de atributo físico nos minutos 70–90 |
| `balance` | Equilíbrio | Não escorrega no drible; contato físico |
| `naturalFitness` | Condicionamento | Resistência natural a lesão e recuperação mais rápida |
| `injuryProneness` | Tendência a lesões | **Quanto maior, pior.** Reduzido pelo médico e pelo `naturalFitness` |
| `recovery` | Recuperação | Velocidade de recuperação de condição física |

### 2.4 Mental (7)

| id | Rótulo | Uso no motor |
|---|---|---|
| `decisionMaking` | Decisão | Escolhe passe/arque: quantas opções ruins são descartadas |
| `composure` | Sangue frio | Finaliza melhor sob pressão; reduz pênaltis perdidos |
| `discipline` | Disciplina | Menos cartões e menos faltas cometidas |
| `leadership` | Liderança | Melhora moral dos companheiros e a confiança em decisões |
| `consistency` | Consistência | Reduz a variância das notas de uma partida para outra |
| `adaptability` | Adaptabilidade | Custo reduzido ao trocar de posição ou de função |
| `professionalism` | Profissionalismo | Treino mais eficiente; menos atrito interno e menos recusa de propostas |

**Total de linha: 12 + 9 + 8 + 7 = 36**

---

## 3. Atributos de goleiro (10)

Só contam para `posicao === "GOL"`. O `overall` do goleiro usa **apenas** estes.

| id | Rótulo | Uso no motor |
|---|---|---|
| `reflexes` | Reflexos | `P(defesa) = 0,3 + reflexes/40` contra finalização |
| `handling` | Manuseio | Segura a bola em vez de rebater; reduz gol contra |
| `aerialReach` | Alcance aéreo | Defende bola alta na área |
| `oneOnOne` | Um contra um | Qualidade em saída de área |
| `commandOfArea` | Domínio da área | Afasta a bola em escanteio e bola aerial |
| `communication` | Comunicação | Organiza a defesa; reduz gols de jogada ensaiada |
| `punching` | Soco | Alternativa ao rebate |
| `throwing` | Repasse | Qualidade do lançamento longo |
| `kicking` | Chute longo | Saída de bola por cima do meio |
| `eccentricity` | Extravagância | Gatilho de erros e defesas impossíveis (2% de chance por finalização, escala com o valor) |

**Total: 10.** Um goleiro também tem `decisionMaking`, `composure`,
`agility`, `strength` e `jumpinHg` removidos do cálculo do overall.

---

## 4. Cálculo do overall

`overall = round(Σ(attr × peso) / Σ(peso))`, com pesos por posição
(`core/overall.ts`). Exemplo para `MEI` (Meia Atacante):

| Atributo | Peso |
|---|---|
| `passing`, `vision`, `ballControl` | 2,0 |
| `dribbling`, `technique`, `decisionMaking` | 1,5 |
| `flair`, `firstTouch`, `longShots` | 1,0 |
| `pace`, `acceleration`, `agility`, `composure` | 1,0 |
| `stamina`, `teamWork`, `workRate` | 0,75 |
| `strength`, `marking`, `tackling` | 0,5 |
| `heading`, `discipline`, `balance` | 0,25 |
| `leadership`, `adaptability`, `consistency` | 0,25 |
| `naturalFitness`, `professionalism`, `injuryProneness`(invertido), `recovery`, `aggression`, `anticipation`, `positioning`, `longPassing`, `crossing`, `jumpinHg` | 0,1 |

Regras gerais de peso:
- **Goleiro**: só os 10 atributos de goleiro, peso 2,0 cada, mais `decisionMaking`,
  `composure` e `agility` com peso 0,5
- **Zagueiro**: `marking`, `tackling`, `positioning`, `anticipation`, `strength`,
  `jumpinHg` com peso 2,0; `finishing` com peso 0,1
- **Lateral**: equilíbrio entre marcação (1,5) e entrega (`crossing` 1,5,
  `stamina` 1,5, `pace` 1,25)
- **Atacante**: `finishing` 2,5, `flair` 1,5, `pace`/`acceleration` 1,25
- Nenhum atributo com peso 0 entra no resultado — peso zero é proibido

`potencial` é o overall máximo que o jogador pode alcançar (15–20) e nunca é menor
que o `overall` atual.

---

## 5. Modifier por função (papéis)

O papel (`role`) soma modificadores temporários em `sim/`:

| Papel | Modificadores |
|---|---|
| "Lateral que sobe" | `crossing` +2, `marking` −2, expõe a linha de fundo |
| "Volante que cobre" | `positioning` +2, `pace` −1, acompanha o lateral |
| "Meia que cria" | `vision` +2, `passing` +1, `finishing` −1 |
| "9 de referência" | `heading` +3, `strength` +2, `pace` −1 |
| "Ponta que ataca o espaço" | `pace` +2, `agility` +1, `defending` −3 |
| "Goleiro que sai" | `oneOnOne` +2, `commandOfArea` −1, aumenta risco de gol |
| "9 falso" | `dribbling` +2, `firstTouch` +1, `finishing` −1 |

Papéis nunca alteram o `overall` do save: são efeitos de jogo, recalculados a cada
simulação.

---

## 6. Modifier derivado de condição, moral e química

Aplicado em `sim/modifiers.ts`, depois do overall:

| Fator | Faixa | Efeito |
|---|---|---|
| `condicaoFisica` | 100–90 | sem alteração |
| | 90–75 | `−1` em atributos físicos |
| | 75–60 | `−2` em físicos e `−1` no geral |
| | < 60 | `−3` em físicos, risco de lesão ×2, e o gestor recebe alerta |
| `moral` | 80–100 | `+1` em `composure`, `decisionMaking` |
| | 20–39 | `−1` geral; abaixo de 20, risco de pedir saída |
| `quimicaDeLinha` | 3 de 3 caches Chemistry | `+1` no papel aquele jogador se `teamWork` ≥ 13 |
| `quimicaDeLinha` | 0 de 3 caches Chemistry | `−1` geral se `teamWork` < 10 (desorganização) |

A química é calculada por `systems/quimica.ts` a partir de: soma de `teamWork`,
`workRate` e `professionalism` dos jogadores da linha, e compatibilidade de papéis.

---

## 7. Regras de invariantes (testar em `tests/atributos.test.ts`)

1. `overall` é sempre inteiro entre 1 e 20
2. `potencial >= overall`
3. Goleiro tem `overall` calculado **apenas** dos 10 atributos de goleiro
4. Nenhum atributo deste documento é desconhecido do motor — a lista `ATRIBUTOS` em
   `domain/atributos.ts` deve bater 100% com este documento (teste automatizado de
   paridade documental)
5. Peso zero é erro de build
6. Identificadores são únicos e em inglês