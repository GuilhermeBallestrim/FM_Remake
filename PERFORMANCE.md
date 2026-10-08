# PERFORMANCE.md — Orçamento de performance

> Entrada obrigatória do projeto. Nenhuma fase é aceita se estourar estes números.
> Se o número não couber, corte escopo ou optimize — nunca relaxe o orçamento.

---

## 1. Orçamentos

| Operação | Alvo | Limite duro |
|---|---|---|
| Temporada headless completa (1 liga, 38 rodadas) | **< 2 s** | < 4 s |
| Temporada completa (3 ligas + copas + mercado) | **< 8 s** | < 15 s |
| 10 temporadas headless | **< 20 s** | < 45 s |
| 1.000 partidas simuladas em lote | **< 8 s** | < 15 s |
| 1 minuto de partida (1 tick) | < 0,8 ms | < 2 ms |
| Gerador de mundo completo (1.200+ jogadores) | < 900 ms | < 2 s |
| Save de temporada no disco | < 400 ms | < 1 s |
| Load de temporada do disco | < 700 ms | < 1,5 s |
| Render da tela de partida (60 fps) | 16 ms/frame | 33 ms/frame |
| Troca de aba da UI (dashboard → elenco → táticas) | < 120 ms | < 300 ms |
| Memória resident após 10 temporadas | < 600 MB | < 1 GB |

Medição: `performance.now()` e `process.hrtime.bigint()`. **Nunca** `Date.now()`
dentro da simulação.

---

## 2. Onde o custo está (e o que fazer)

| Ponto de custo | Estratégia |
|---|---|
| Loop de 1 minuto × 22 jogadores | Alocação zero no loop: reusar objetos, vetores pré-alocados, evitar `map`/`filter` dentro do tick |
| Simulação de partidas | Índice de jogadores por posição, acesso direto por array, sem busca linear |
| Tabelas de classificação | Recalcular só quando um resultado muda, não a cada dia |
| Consultas SQLite | Índices em `clubeId`, `temporada`, `posicao`; cache LRU para elencos do jogador |
| Serialização | JSON em streaming para saves grandes; evitar `structuredClone` de tudo |
| Render da UI | Memoização de componentes, listas virtualizadas, `useMemo` nos cálculos de tabela |

---

## 3. Ferramentas de medição

```bash
npm run sim:check          # roda a temporada headless e imprime os tempos
npm run sim:benchmark      # 10 temporadas + 1.000 partidas, imprime tabela
npm run test:perf          # testes com asserção de tempo (só roda em CI noturna)
node --prof dist/cli.js    # profiler do V8 para a season headless
```

Perfil de referência (Fase 1, mantido como `benchmarks/snapshot.json`):
a temporada headless não pode ficar **mais de 15% mais lenta** que o snapshot sem
justificativa registrada em `TODO.md`.

---

## 4. Regras de implementação que mantêm o orçamento

1. **Zero alocação no tick**: nada de `new`, `[]`, `{}` ou spread dentro do loop de
   minuto. Use campos pré-alocados e flags.
2. **Física de evento é estatística**, não geométrica: não existe simulação por segundo
   de posição de bola em 2D com física real. Isso mantém 90 partidas por minuto de CPU.
3. **Cache por rodada**: placar, classificação e artilharia são derivados, nunca
   recalculados do zero.
4. **Nada de `Math.random()`**: todo sorteio vem de `core/rng.ts` com seed. Isso é
   requisito de determinismo **e** de performance (permite cachear sorteios).
5. **TypeScript com `strict` e sem `any`**: permite ao V8 eliminar casos e monomorfizar.
6. **Camada de dados assíncrona**: a UI nunca bloqueia o loop; simulação longa roda em
   Web Worker quando passar de 200 ms.
7. **Rodar o gerador uma vez**: mundo e elenco são gerados na criação do save e
   serializados; nunca regerar dentro da simulação.

---

## 5. Degradação graciosa

Se o dispositivo for lento, o jogo reduz em ordem:

1. Intervalos de narração e animação da UI
2. Gráficos de evolução (mantém só tabela)
3. Pré-visualização de heatmap
4. Simulação "rápida" de dias sem jogo (pula eventos cosmeticamente, mantém resultado)

O que **nunca** degrada: resultado das partidas, valores, ordenação da classificação.

---

## 6. Critérios de aceitação de performance

Uma fase só é aceita se:

1. `npm run sim:check` passa nos limites da tabela §1
2. Nenhuma alocação dentro do loop de minuto (verificável com `--trace-gc` sem
   crescimento de heap por partida)
3. Existe teste de regressão de tempo no CI (`sim:benchmark`)
4. Qualquer otimização está registrada em `TODO.md` com o motivo