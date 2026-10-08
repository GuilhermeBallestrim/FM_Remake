# IA_TATICA.md — IA tática do computador (adversário e manager)

> Entrada obrigatória do projeto. Define como o computador toma decisões táticas
> coerentes com o perfil do clube e com o momento do jogo.

---

## 1. Objetivo

O computador (seja o adversário na partida, seja o manager controlando outro clube)
precisa:
- Escolher formação e XI inicial antes do jogo
- Ajustar no intervalo
- Fazer substituições e mudanças táticas durante a partida
- Agir de forma diferente conforme o nível de dificuldade

Tudo deve ser **determinístico** (mesma seed = mesma decisão) e testável.

---

## 2. Entradas do algoritmo

```ts
interface ContextoIaTatica {
  // Clube
  elenco: Jogador[];              // todos os jogadores do clube
  reputacaoClube: number;         // 1-100
  orcamento: number;              // CR
  formaRecente: number[];         // últimos 5 resultados (3/1/0)
  
  // Adversário
  adversario: {
    formacao: Formacao;
    overallMedio: number;
    estilo: "posse" | "direto" | "contraAtaque" | "fisico";
  };
  
  // Partida
  minuto: number;
  placar: { mandante: number; visitante: number };
  local: "casa" | "fora";
  condicaoMedia: number;          // 0-100
  cartoes: { amarelos: number; vermelhos: number };
  fadigaMedia: number;            // 0-100
  
  // Configuração
  dificuldade: "facil" | "media" | "dificil" | "expert" | "brutal";
  seed: number;                   // para RNG determinístico
}
```

---

## 3. Escolha de táticas antes do jogo

### 3.1 Perfil base do clube (calculado uma vez por temporada)

```ts
interface PerfilTatico {
  formacaoPreferida: Formacao;     // baseada no elenco
  mentalidadeBase: Mentalidade;    // 1 a 5
  pressingBase: number;            // 1-5
  larguraBase: number;             // 1-5
  ritmoBase: number;               // 1-5
  rolesPorPosicao: Record<Posicao, Role[]>;
}
```

**Como calcular `formacaoPreferida`:**
1. Contar jogadores por posição com overall >= media do elenco
2. Se tem 2+ LD/LE bons -> laterais que sobem (4-3-3, 4-2-3-1)
3. Se tem 3+ ZAG bons + 2+ VOL -> 3-5-2 ou 5-3-2
4. Se tem 1 MEI elite + 2 pontas -> 4-2-3-1
5. Fallback: 4-4-2 equilibrado

### 3.2 Ajuste por adversário (antes do jogo)

```ts
function escolherTaticaInicial(ctx: ContextoIaTatica): TaticaCompleta {
  const base = calcularPerfilTatico(ctx.elenco, ctx.reputacaoClube);
  
  // Ajustes por adversário
  let mentalidade = base.mentalidadeBase;
  let pressing = base.pressingBase;
  let largura = base.larguraBase;
  let ritmo = base.ritmoBase;
  
  const diffOverall = ctx.elencoOverallMedio - ctx.adversario.overallMedio;
  
  if (diffOverall >= 3) {
    // Favorito: mais ofensivo
    mentalidade = Math.min(5, mentalidade + 1);
    pressing = Math.min(5, pressing + 1);
  } else if (diffOverall <= -3) {
    // Azarão: mais defensivo
    mentalidade = Math.max(1, mentalidade - 1);
    pressing = Math.max(1, pressing - 1);
    largura = Math.max(1, largura - 1); // compacto
  }
  
  // Casa/fora
  if (ctx.local === "fora") {
    mentalidade = Math.max(1, mentalidade - 1);
  }
  
  // Estilo do adversário
  if (ctx.adversario.estilo === "posse") {
    pressing = Math.min(5, pressing + 1); // pressionar quem tem a bola
  }
  
  return {
    formacao: base.formacaoPreferida,
    mentalidade,
    pressing,
    largura,
    ritmo,
    instrucoesPorLinha: gerarInstrucoes(base, mentalidade),
    roles: base.rolesPorPosicao
  };
}
```

---

## 4. Escolha do XI inicial

```ts
function escolherXI(elenco: Jogador[], formacao: Formacao): Jogador[] {
  // 1. Filtrar elegíveis (sem lesão, sem suspensão, condição >= 60)
  const elegiveis = elenco.filter(j => 
    !j.lesao && j.suspensao === 0 && j.condicaoFisica >= 60
  );
  
  // 2. Para cada posição da formação, pegar o melhor
  const xi: Jogador[] = [];
  for (const pos of formacao.posicoes) {
    const candidatos = elegiveis
      .filter(j => j.posicao === pos || j.posicoesAlternativas.includes(pos))
      .sort((a, b) => calcularOverallPosicao(b, pos) - calcularOverallPosicao(a, pos));
    
    if (candidatos.length > 0) {
      xi.push(candidatos[0]);
      elegiveis.splice(elegiveis.indexOf(candidatos[0]), 1);
    }
  }
  
  // 3. Preencher banco com os melhores restantes por posição
  // ...
  
  return xi;
}
```

**Prioridade de escolha:**
1. Overall na posição
2. Química com companheiros de linha (ver `ATRIBUTOS.md`)
3. Role preferida bate com a instrução da linha
4. Condição física (desempate)
5. RNG da seed (desempate final)

---

## 5. Ajuste no intervalo

```ts
function ajustarNoIntervalo(
  taticaAtual: TaticaCompleta,
  ctx: ContextoIaTatica
): TaticaCompleta {
  const nova = { ...taticaAtual };
  const diff = ctx.placar.mandante - ctx.placar.visitante;
  const isCasa = ctx.local === "casa";
  const golsDiff = Math.abs(diff);
  
  // Perder por 2+ gols -> máximo ofensivo
  if ((isCasa && diff <= -2) || (!isCasa && diff >= 2)) {
    nova.mentalidade = 5;
    nova.pressing = 5;
    nova.largura = 5;
    nova.ritmo = 5;
    nova.formacao = tornarMaisOfensiva(nova.formacao);
  }
  // Perder por 1 gol -> mais ofensivo
  else if ((isCasa && diff === -1) || (!isCasa && diff === 1)) {
    nova.mentalidade = Math.min(5, nova.mentalidade + 1);
    nova.pressing = Math.min(5, nova.pressing + 1);
  }
  // Ganhar por 1 gol -> segurar
  else if ((isCasa && diff === 1) || (!isCasa && diff === -1)) {
    nova.mentalidade = Math.max(2, nova.mentalidade - 1);
    nova.pressing = Math.max(2, nova.pressing - 1);
    nova.ritmo = Math.max(2, nova.ritmo - 1);
  }
  // Ganhar por 2+ -> controlar
  else if (golsDiff >= 2) {
    nova.mentalidade = Math.max(1, nova.mentalidade - 1);
    nova.pressing = Math.max(1, nova.pressing - 1);
    nova.largura = Math.max(2, nova.largura - 1);
  }
  // Empate -> depende do minuto e força
  else {
    if (ctx.minuto >= 70) {
      // Final de jogo: tentar ganhar se for favorito
      if (ctx.elencoOverallMedio > ctx.adversario.overallMedio) {
        nova.mentalidade = Math.min(5, nova.mentalidade + 1);
      }
    }
  }
  
  // Cartão vermelho -> recompor
  if (ctx.cartoes.vermelhos > 0) {
    nova.formacao = recomporAposVermelho(nova.formacao, ctx.cartoes.vermelhos);
    nova.mentalidade = Math.max(2, nova.mentalidade - 1);
  }
  
  return nova;
}
```

---

## 6. Ajuste durante a partida (substituições e tática)

### 6.1 Gatilhos de substituição

| Gatilho | Minuto mínimo | Prioridade | Ação |
|---|---|---|---|
| Lesão | qualquer | 10 | Substituir imediato por mesmo posição |
| Cartão vermelho | qualquer | 9 | Recompor defesa (tirar atacante, botar zagueiro) |
| Fadiga > 85% | 60 | 7 | Substituir por jogador fresco mesma posição |
| Perder por 2+ gols | 55 | 8 | Botar atacante, tirar volante/zagueiro |
| Ganhar por 1 gol | 70 | 6 | Botar volante/zagueiro, tirar atacante |
| Empate em casa | 75 | 5 | Botar meia criativo, tirar volante |
| Cartão amarelo (risco) | 60 | 4 | Substituir se for jogador chave |

### 6.2 Algoritmo de substituição

```ts
function decidirSubstituicoes(
  xi: Jogador[],
  banco: Jogador[],
  ctx: ContextoIaTatica,
  tatica: TaticaCompleta
): Substituicao[] {
  const subs: Substituicao[] = [];
  const maxSubs = 5; // regra atual
  
  // Ordenar gatilhos por prioridade
  const gatilhos = avaliarGatilhos(xi, ctx, tatica);
  
  for (const g of gatilhos) {
    if (subs.length >= maxSubs) break;
    if (g.minuto < ctx.minuto) continue; // já passou
    
    const substituto = escolherSubstituto(banco, g.posicaoNecessaria, ctx);
    if (substituto) {
      subs.push({
        minuto: g.minuto,
        sai: g.jogador.id,
        entra: substituto.id,
        motivo: g.motivo
      });
      banco = banco.filter(j => j.id !== substituto.id);
    }
  }
  
  return subs;
}
```

### 6.3 Mudança tática durante o jogo

Além das subs, a IA pode mudar:
- **Mentalidade** (mais ofensivo/defensivo)
- **Pressing** (aumentar/diminuir)
- **Largura** (abrir/fechar)
- **Instruções de linha** (ex.: laterais ficam/ sobem)

Gatilhos (mesma tabela acima, mas sem gastar substituição):
- Minuto 60+ e perder -> mentalidade +1
- Minuto 75+ e ganhar -> mentalidade -1, ritmo -1
- Cartão vermelho adversário -> pressing +1, largura +1

---

## 7. Níveis de dificuldade

| Nível | Tempo reação | Qualidade XI | Agressividade | Subs inteligentes | Conhece adversário | Precisão instruções |
|---|---|---|---|---|---|---|
| Fácil | 0.8 s | -2 overall médio | Baixa (pressing 1-2) | Só por lesão/vermelho | Não | Básicas |
| Média | 0.4 s | Overall real | Média (pressing 2-3) | Intervalo + 1 sub tática | Parcial | Boas |
| Difícil | 0.2 s | +1 overall médio | Alta (pressing 3-4) | Intervalo + 2-3 subs táticas | Sim | Boas |
| Expert | 0.1 s | +2 overall médio | Muita alta (pressing 4-5) | Reage a cada gatilho | Sim + antecipa | Ótimas |
| Brutal | 0.05 s | +3 overall médio | Máxima (pressing 5) | Otimização global | Sim + contramedidas | Perfeitas |

**O que muda concretamente:**
- `tempoReacao`: delay artificial antes de decidir (para simular "pensar")
- `qualidadeXI`: adiciona offset ao overall na hora de escolher titulares
- `agressividade`: multiplica `pressingBase` e `mentalidadeBase`
- `subsInteligentes`: quantas subs táticas (não por lesão) a IA faz
- `conheceAdversario`: usa `adversario.estilo` e `adversario.formacao` na decisão
- `precisaoInstrucoes`: instruções por jogador mais granulares

---

## 8. Rivais ao longo da temporada (manager IA)

Entre partidas, o manager IA do clube adversário:
1. **Compra/vende** no mercado (integra com `MERCADO.md`)
2. **Ajusta preferências** baseadas em resultados recentes
3. **Renova contratos** de peças-chave
4. **Promove da base** se precisar e não tiver dinheiro

```ts
interface MemoriaManager {
  preferenciasTaticas: Partial<PerfilTatico>;
  alvosMercado: { posicao: Posicao; prioridade: number }[];
  jogadoresIndisponiveis: string[]; // não vende por nada
  confiancaDiretoria: number;       // 0-100
}

function atualizarManagerIa(clubeId: string, resultado: PartidaResultado): void {
  const mem = carregarMemoria(clubeId);
  
  // Ajustar preferências
  if (resultado.golsMarcados >= 3) mem.preferenciasTaticas.mentalidadeBase = Math.min(5, (mem.preferenciasTaticas.mentalidadeBase || 3) + 1);
  if (resultado.golsSofridos >= 3) mem.preferenciasTaticas.pressingBase = Math.max(1, (mem.preferenciasTaticas.pressingBase || 3) - 1);
  
  // Atualizar alvos de mercado
  if (resultado.posicoesFracas.length > 0) {
    for (const pos of resultado.posicoesFracas) {
      const existente = mem.alvosMercado.find(a => a.posicao === pos);
      if (existente) existente.prioridade += 2;
      else mem.alvosMercado.push({ posicao: pos, prioridade: 5 });
    }
  }
  
  salvarMemoria(clubeId, mem);
}
```

---

## 9. Código

### `src/sim/ia/perfil.ts`

```ts
export function calcularPerfilTatico(
  elenco: Jogador[],
  reputacao: number
): PerfilTatico;

export function escolherFormacao(
  perfil: PerfilTatico,
  adversario: ContextoIaTatica["adversario"],
  local: "casa" | "fora",
  dificuldade: Dificuldade
): Formacao;

export function escolherXI(
  elenco: Jogador[],
  formacao: Formacao,
  tatica: TaticaCompleta,
  dificuldade: Dificuldade,
  rng: () => number
): Jogador[];
```

### `src/sim/ia/ajustes.ts`

```ts
export function ajustarNoIntervalo(
  tatica: TaticaCompleta,
  ctx: ContextoIaTatica
): TaticaCompleta;

export function ajustarDuranteJogo(
  tatica: TaticaCompleta,
  xi: Jogador[],
  banco: Jogador[],
  ctx: ContextoIaTatica,
  rng: () => number
): { tatica: TaticaCompleta; subs: Substituicao[] };
```

### `src/sim/ia/dificuldade.ts`

```ts
export type Dificuldade = "facil" | "media" | "dificil" | "expert" | "brutal";

export const DIFICULDADES: Record<Dificuldade, ConfigDificuldade> = {
  facil: {
    tempoReacaoMs: 800,
    offsetOverall: -2,
    multiplicadorAgressividade: 0.6,
    maxSubsTaticas: 1,
    conheceAdversario: false,
    precisaoInstrucoes: "basica"
  },
  media: {
    tempoReacaoMs: 400,
    offsetOverall: 0,
    multiplicadorAgressividade: 1.0,
    maxSubsTaticas: 2,
    conheceAdversario: true,
    precisaoInstrucoes: "boa"
  },
  dificil: {
    tempoReacaoMs: 200,
    offsetOverall: 1,
    multiplicadorAgressividade: 1.3,
    maxSubsTaticas: 3,
    conheceAdversario: true,
    precisaoInstrucoes: "boa"
  },
  expert: {
    tempoReacaoMs: 100,
    offsetOverall: 2,
    multiplicadorAgressividade: 1.6,
    maxSubsTaticas: 4,
    conheceAdversario: true,
    precisaoInstrucoes: "otima"
  },
  brutal: {
    tempoReacaoMs: 50,
    offsetOverall: 3,
    multiplicadorAgressividade: 2.0,
    maxSubsTaticas: 5,
    conheceAdversario: true,
    precisaoInstrucoes: "perfeita"
  }
};

export interface ConfigDificuldade {
  tempoReacaoMs: number;
  offsetOverall: number;
  multiplicadorAgressividade: number;
  maxSubsTaticas: number;
  conheceAdversario: boolean;
  precisaoInstrucoes: "basica" | "boa" | "otima" | "perfeita";
}
```

---

## 10. Regras de invariantes (testar em `tests/iaTatica.test.ts`)

1. `escolherXI` sempre devolve exatamente 11 jogadores distintos
2. Sempre há exatamente 1 goleiro no XI
3. Formação sempre tem entre 1 e 4 atacantes (ATA/SA/ME/MD)
4. `ajustarNoIntervalo` nunca remove o goleiro
5. `decidirSubstituicoes` nunca excede 5 substituições
6. Com 1000 partidas simuladas: taxa de vitória do nível Fácil < Média < Difícil < Expert < Brutal (diferença estatística significativa, p < 0.01)
7. Mesma seed + mesmo contexto = mesma decisão (determinismo total)
8. Nenhuma decisão acessa estado global mutável (funções puras)
9. `tempoReacaoMs` é respeitado (simulado via delay assíncrono no motor, não bloqueia)
10. Offset de overall não cria jogador com overall > 20 ou < 1