# NARRACAO.md — Sistema de narração por templates

> Entrada obrigatória do projeto. A narração é **gerada por template + variáveis**,
> nunca texto fixo na UI. Isso permite localização, variedade e testes determinísticos.

---

## 1. Objetivo e filosofia

- Zero strings hardcoded em componentes de interface.
- Um mesmo evento pode ter **3 a 5 variantes** de frase, escolhidas por peso e contexto.
- A escolha é **determinística**: mesma seed + mesmo contexto = mesma frase.
- Narração separa **o que aconteceu** (dados do motor) de **como contar** (template).

---

## 2. Anatomia de um template

```ts
interface TemplateNarracao {
  id: string;                    // ex.: "gol.contraAtaque"
  evento: string;                // ex.: "gol"
  peso: number;                  // frequência relativa (1–100)
  prioridade: number;            // desempate: maior = mais importante
  variaveis: string[];           // variáveis obrigatórias
  condicoes?: string[];          // expressões booleanas sobre o contexto
  texto: string;                 // template com {variaveis}
}
```

Exemplo:

```ts
{
  id: "gol.contraAtaque.final",
  evento: "gol",
  peso: 10,
  prioridade: 5,
  variaveis: ["minuto", "jogador", "time", "assistencia"],
  condicoes: ["contexto.tipoGol === 'contragolpe'"],
  texto: "{minuto}' — Contragolpe letal! {jogador} recebe de {assistencia} e bate firme: {time} marca!"
}
```

---

## 3. Variáveis globais disponíveis

| Variável | Tipo | Exemplo | Onde vem |
|---|---|---|---|
| `{minuto}` | int | `23` | motor |
| `{minutoFim}` | int | `90+3` | motor |
| `{mandante}` | string | `"Manchester City"` | partida |
| `{visitante}` | string | `"Liverpool"` | partida |
| `{placar}` | string | `"2–1"` | partida |
| `{jogador}` | string | `"Erling Haaland"` | evento |
| `{jogador2}` | string | `"Kevin De Bruyne"` | evento |
| `{time}` | string | `"Manchester City"` | evento |
| `{timeAdversario}` | string | `"Liverpool"` | evento |
| `{golsTime}` | int | `2` | evento |
| `{arbitro}` | string | `"Michael Oliver"` | partida |
| `{estadio}` | string | `"Etihad Stadium"` | partida |
| `{torneio}` | string | `"Premier League"` | partida |
| `{classificacao}` | string | `"3º"` | tabela |
| `{assistencia}` | string | `"Kevin De Bruyne"` | evento |
| `{tipoGol}` | string | `"pênalti" / "cabeçada" / "foraDaArea" / "contraAtaque"` | motor |
| `{tipoCartao}` | string | `"amarelo" / "vermelho"` | evento |
| `{lesao}` | string | `"coxa" / "joelho" / "tornozelo"` | evento |
| `{tempoLesao}` | string | `"3 semanas"` | evento |
| `{substituido}` | string | `"Phil Foden"` | evento |
| `{entra}` | string | `"Julian Alvarez"` | evento |

---

## 4. Catálogo de eventos e templates (mínimo por evento)

| Evento | Templates mínimos | Condições típicas |
|---|---|---|
| `gol` | 5 | tipoGol, minuto, time ganhando/perdendo/empatando |
| `golContra` | 2 | — |
| `penaltiConvertido` | 3 | minuto, time ganhando/perdendo |
| `penaltiPerdido` | 3 | defesa / trave / fora |
| `finalizacaoDefendida` | 3 | goleiro, dificuldade da defesa |
| `trave` | 2 | poste / travessão |
| `escanteio` | 2 | time atacando |
| `falta` | 3 | perigosa / lateral / meio-campo |
| `cartaoAmarelo` | 3 | tipo de falta, reincidência |
| `cartaoVermelho` | 2 | direto / segundo amarelo |
| `lesao` | 3 | gravidade, jogador chave ou reserva |
| `substituicao` | 3 | tática / lesão / cansaço / resultado |
| `impedimento` | 2 | anulado / confirmado |
| `bolaNoTravessao` | 2 | — |
| `defesaImpossivel` | 2 | goleiro, tipo de chute |
| `golAnuladoImpedimento` | 2 | VAR / árbitro |
| `erroGoleiro` | 3 | rebote / saída errada / bola nas costas |

Total mínimo: **≈ 50 templates** no arquivo `ptBR.ts`.

---

## 5. Blocos de texto

| Bloco | Quando aparece | Templates típicos |
|---|---|---|
| `preJogo` | antes do apito inicial | escalações, favorito, histórico |
| `duranteJogo` | a cada evento do motor | catálogo do §4 |
| `intervalo` | minuto 45 | placar, estatísticas, melhor em campo |
| `posJogo` | apito final | resumo, notas, xG, classificação |
| `resumoRodada` | fim da rodada | todos os resultados, artilharia, surpresas |
| `classificacao` | tela de tabela | top 4, zona de rebaixamento |
| `artilharia` | tela de artilheiros | top 5, hat-tricks |
| `transferenciaAceite` | proposta aceita | valor, tempo de contrato |
| `transferenciaRecusada` | proposta recusada | motivo (valor / salário / projeto) |
| `lesionados` | painel médico | quem, quanto tempo, gravidade |
| `suspensos` | painel disciplinar | quem, por quantos jogos |
| `diretoria` | objetivos, aviso, demissão | fidelidade, ultimato |

---

## 6. Sistema de escolha de frase

```ts
function escolherTemplate(
  evento: string,
  contexto: ContextoNarracao,
  historicoRecente: string[]   // últimos 5 ids usados
): TemplateNarracao {
  // 1. Filtrar templates do evento
  // 2. Remover os que falham nas condições
  // 3. Remover os usados nos últimos 3 eventos (anti-repetição)
  // 4. Ordenar por prioridade desc, depois peso desc
  // 5. Sortear ponderado pelo peso (RNG determinístico)
}
```

**Anti-repetição:**
- Mesmo `id` não pode aparecer 2x seguidas.
- Mesmo `evento` com mesmo `jogador` não repete frase em menos de 10 min de jogo.
- Se não houver template elegível, cai no fallback genérico do evento.

---

## 7. Tom adaptativo

| Situação do time do usuário | Ajuste no template |
|---|---|
| Ganhando | frases mais calmas, "controla", "administra" |
| Empatando | "busca", "pressiona", "tenta" |
| Perdendo | "precisa", "corre atrás", "desespero" |
| Gol nos 85'+ | adjetivos: "dramático", "heroico", "inesperado" |
| Gol contra o líder | "surpreende", "zebra", "feito histórico" |

Implementação: o template tem campo `tom?: "calmo" | "tenso" | "emotivo" | "neutro"` e
o seletor filtra pelo tom atual derivado do placar e minuto.

---

## 8. Narração por resultado final

| Resultado | Frases de abertura (pós-jogo) |
|---|---|
| Vitória | `"{time} vence com autoridade e sobe na tabela."` |
| Vitória sofrida | `"{time} arranca os três pontos no sufoco."` |
| Empate | `"{mandante} e {visitante} não saem do zero em jogo equilibrado."` |
| Derrota | `"{time} cai diante de {adversario} e vê a distância aumentar."` |
| Derrota em casa | `"Torcida vaiia em {estadio}: {time} perde mais uma."` |

---

## 9. Código

### `src/content/narracao.ts`

```ts
export interface ContextoNarracao {
  minuto: number;
  minutoFim: number;
  mandante: string;
  visitante: string;
  placar: string;
  jogador?: string;
  jogador2?: string;
  time?: string;
  timeAdversario?: string;
  golsTime?: number;
  arbitro?: string;
  estadio?: string;
  torneio?: string;
  classificacao?: string;
  assistencia?: string;
  tipoGol?: "penalti" | "cabecada" | "foraDaArea" | "contraAtaque" | "falta" | "outro";
  tipoCartao?: "amarelo" | "vermelho";
  lesao?: string;
  tempoLesao?: string;
  substituido?: string;
  entra?: string;
  tom?: "calmo" | "tenso" | "emotivo" | "neutro";
  timeUsuarioId: string;  // para saber se o gol é a favor ou contra
}

export interface TemplateNarracao {
  id: string;
  evento: string;
  peso: number;
  prioridade: number;
  variaveis: string[];
  condicoes?: ((ctx: ContextoNarracao) => boolean)[];
  texto: string;
  tom?: "calmo" | "tenso" | "emotivo" | "neutro";
}

export interface EventoNarrado {
  templateId: string;
  textoFinal: string;
  contexto: ContextoNarracao;
}

export function escolherTemplate(
  evento: string,
  ctx: ContextoNarracao,
  historico: string[],
  templates: TemplateNarracao[],
  rng: () => number
): TemplateNarracao;

export function formatar(template: TemplateNarracao, ctx: ContextoNarracao): string;
```

### `src/content/narracao/ptBR.ts` (exemplo com 4 templates)

```ts
import { TemplateNarracao } from "../narracao";

export const templatesPtBR: TemplateNarracao[] = [
  {
    id: "gol.normal.v1",
    evento: "gol",
    peso: 30,
    prioridade: 1,
    variaveis: ["minuto", "jogador", "time"],
    texto: "{minuto}' — GOOOL! {jogador} balança a rede para o {time}!",
    tom: "neutro"
  },
  {
    id: "gol.contraAtaque.v1",
    evento: "gol",
    peso: 15,
    prioridade: 5,
    variaveis: ["minuto", "jogador", "assistencia", "time"],
    condicoes: [ctx => ctx.tipoGol === "contraAtaque"],
    texto: "{minuto}' — Contragolpe fulminante! {assistencia} lança {jogador}, que define: {time} marca!",
    tom: "emotivo"
  },
  {
    id: "gol.penalti.v1",
    evento: "penaltiConvertido",
    peso: 20,
    prioridade: 3,
    variaveis: ["minuto", "jogador", "time"],
    texto: "{minuto}' — Pênalti convertido! {jogador} cobra com categoria e amplia para o {time}.",
    tom: "calmo"
  },
  {
    id: "cartao.amarelo.reincidente.v1",
    evento: "cartaoAmarelo",
    peso: 10,
    prioridade: 4,
    variaveis: ["minuto", "jogador", "time"],
    condicoes: [ctx => ctx.jogadorJaTemAmarelo(ctx.jogador!)],
    texto: "{minuto}' — Segundo amarelo para {jogador}! {time} fica com um a menos.",
    tom: "tenso"
  }
];
```

---

## 10. Regras de invariantes (testar em `tests/narracao.test.ts`)

1. Nenhuma variável do template fica sem resolução (teste: `formatar()` nunca devolve `{...}`)
2. `escolherTemplate` nunca devolve o mesmo `id` 2x seguidas (histórico de 5)
3. Nenhuma renderização de frase leva mais de 0,05 ms (média de 1000 chamadas)
4. Frases com mais de 140 caracteres são truncadas com reticências no componente de UI
5. Mesma seed + mesmo contexto = mesmo `templateId` (determinismo)
6. Todos os 17 eventos do §4 têm pelo menos 2 templates em `ptBR.ts`
7. Nenhum template usa variável não declarada em `variaveis`
8. `condicoes` são funções puras (sem efeito colateral, sem acesso a estado global)