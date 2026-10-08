# ROTEIRO_FASES.md — 12 fases com entregável verificável

> Entrada obrigatória do projeto. Define a ordem de implementação. **Regra dura:**
> uma fase só fecha quando todos os critérios de aceitação passam. Se algo não couber
> na fase, vai para `TODO.md` como dívida técnica — nunca prometido.

Comandos de verificação usados em todas as fases:

```bash
npm run lint      # ESLint strict, zero warnings
npm run typecheck # tsc --noEmit, strict, zero any
npm test          # Vitest, cobertura mínima 70% em core/ sim/ domain/
npm run build     # Vite build sem erro
npm run sim:check # executa uma temporada headless e valida os invariantes
```

---

## Fase 0 — Fundação (stack, arquitetura, mundo, determinismo)

**Objetivo:** o esqueleto que tudo o resto depende.

| Entregável | Arquivos |
|---|---|
| Projeto criado | `package.json`, `tsconfig.json`, `vite.config.ts`, `.eslintrc` |
| Estrutura de pastas vazia | `core/ sim/ domain/ data/ systems/ ui/ content/` |
| Escolha de stack + justificativa | `README.md` |
| Diagrama de dependências | `README.md` |
| RNG determinístico | `core/rng.ts` |
| Calendário próprio (sem `Date`) | `core/calendario.ts` |
| Gerador de mundo (60 clubes de `LIGAS.md`) | `data/geradorMundo.ts` |
| 1.200+ jogadores (`ELENCO.md`) | `data/geradorElenco.ts` |
| Algoritmo round-robin | `domain/competicao/rodadas.ts` |
| Temporada headless | `data/temporada.ts` |
| Dashboard mínimo | `ui/Dashboard.tsx` |

**Critérios de aceitação:**
1. `npm run sim:check` roda 38 rodadas de uma liga em **menos de 2 s**
2. Mesma seed → mesmo hash de mundo (`sha256` do elenco serializado)
3. `LIGAS.md` e `ELENCO.md` são lidos pelo gerador; zero clube fora da lista
4. Dashboard mostra classificação, caixa e próximo jogo com dados reais

**Fora do escopo:** mercado, táticas e UI bonita.

---

## Fase 1 — Motor de partida v1

| Entregável | Arquivos |
|---|---|
| Tick de 1 minuto com acumulador | `sim/partida.ts` |
| Posse e construção de lances | `sim/posse.ts`, `sim/lances.ts` |
| Probabilidades de gol a partir de atributos | `sim/chances.ts` |
| Goleiro | `sim/goleiro.ts` |
| Eventos: gol, chute, defesa, escanteio, falta, cartão, impedimento | `sim/eventos.ts` |
| xG e expected points | `sim/metricas.ts` |

**Critérios:** 3.000 partidas simuladas sem erro; distribuição de gols entre 1,8 e
3,2 por jogo; o time com `overall` 5 pontos maior vence ~70% das partidas; mesma
seed → mesma sequência de eventos.

---

## Fase 2 — Atributos, overall e química

**Entregável:** `domain/atributos.ts` (46 atributos), `core/overall.ts`,
`systems/quimica.ts`, `sim/modifiers.ts`.

**Critérios:** teste de paridade documental (`ATRIBUTOS.md` ↔ código) passa;
`overall` bate com cálculo manual em 10 casos fixos; CHEMISTRY affects match result
(2 testes A/B com chemistry 3×0).

---

## Fase 3 — Elenco e contrato (UI densa)

| Entregável | Arquivos |
|---|---|
| Grade de elenco com colunas configuráveis | `ui/SquadView.tsx` |
| Filtros, ordenação, comparação | `ui/elenco/filtros.ts` |
| Tooltips de atributo | `ui/elenco/TooltipAtributo.tsx` |
| Visualização de contrato | `ui/elenco/Contrato.tsx` |

**Critérios:** renderiza 26 jogadores sem travar; filtro por posição + overall +
idade combina; comparação lado a lado; virtualização de lista (não renderiza tudo).

---

## Fase 4 — Temporadas e persistência

| Entregável | Arquivos |
|---|---|
| SQLite + schema | `data/db/schema.sql` |
| Save/load versionado | `data/persistencia.ts` |
| Multi-save | `ui/Saves.tsx` |
| Editor de elenco (import/export CSV) | `data/csv.ts` |

**Critérios:** salvar no dia 200 e carregar mantém estado idêntico (hash do estado);
`MIGRATION.md` documentado quando o schema mudar; export CSV gera planilha válida.

---

## Fase 5 — Táticas

| Entregável | Arquivos |
|---|---|
| Campo 2D com drag-and-drop | `ui/Taticas/Campo.tsx` |
| 7 formações + custom | `ui/Taticas/Formacao.ts` |
| Instruções por jogador e linha | `ui/Taticas/Instrucoes.tsx` |
| Mentalidade e sistema de equipe | `ui/Taticas/Equipe.tsx` |
| Papel e química por linha | `systems/papeis.ts` |

**Critérios:** arrastar jogador entre posições salva e aplica na próxima partida;
formação + instruções alteram xG a favor e contra (teste A/B); UI ordena o campo por
posições reais (GK, DEF, MID, ATT).

---

## Fase 6 — Treino, lesões e academia

| Entregável | Arquivos |
|---|---|
| Treino semanal/diário | `systems/treino.ts` |
| Lesões e recuperação | `systems/lesoes.ts` |
| Suspensões | `systems/suspensao.ts` |
| Centro de formação (youth) | `systems/academia.ts` |
| Staff com habilidades | `systems/staff.ts` |

**Critérios:** 20 sessões de treino sobem atributo ≤ 0,5 (curva decrescente);
treino intenso gera lesão com probabilidade > 5%; joia de 17 anos com potencial 19
vira titular em 3 temporadas; médico com habilidade 15 reduz lesões em 30%.

---

## Fase 7 — Mercado de transferências

| Entregável | Arquivos |
|---|---|
| Fórmula de valor (`MERCADO.md` §1) | `domain/mercado/valor.ts` |
| IA de compra/venda dos 60 clubes | `systems/iaMercado.ts` |
| Negociação por lances | `ui/mercado/Negociacao.tsx` |
| Fila de propostas e contrapropostas | `systems/negociacoes.ts` |
| Empréstimos | `domain/mercado/emprestimo.ts` |

**Critérios:** IA move ≥ 5 jogadores por janela (mercado com movimento); nunca
compra acima do orçamento; negociação tem no máximo 3 contrapropostas; mesma seed →
mesmo mercado.

---

## Fase 8 — Finanças e diretoria

| Entregável | Arquivos |
|---|---|
| Contabilidade completa (`FINANCAS.md`) | `systems/financas.ts` |
| FFP e penalidades | `systems/ffp.ts` |
| Negociação de patrocínio | `ui/financas/Patrocinio.tsx` |
| Objetivos e Fidúcia | `systems/diretoria.ts` |
| Falência e demissão | `systems/carreira.ts` |

**Critérios:** contas fecham no fechamento do ano (teste §6 de `FINANCAS.md`);
excesso de FFP > 30% gera penalidade visível; Fidúcia < 10 causa demissão e tela
de fim; objetivos mudam com o desempenho.

---

## Fase 9 — Início de carreira (dashboard completo)

| Entregável | Arquivos |
|---|---|
| Dashboard FM completo | `ui/Dashboard.tsx` |
| Calendário interativo | `ui/Calendario.tsx` |
| Notificações e alertas | `ui/Notificacoes.tsx` |
| Filtro rápido do dia a dia | `ui/FiltroRapido.tsx` |

**Critérios:** dashboard mostra próximos 7 dias, lesionados, suspensos, moral
baixa, rumores, objetivos, caixa, Fidúcia; filtro rápido "o que fazer hoje" sempre
tem ação válida (ou "nada a fazer").

---

## Fase 10 — Copas e mata-mata

| Entregável | Arquivos |
|---|---|
| Copa Nacional (64 clubes, eliminatória) | `domain/competicao/copa.ts` |
| Copa de grupos com fase final | `domain/competicao/grupos.ts` |
| Copa Continental de Merídia | `domain/competicao/continental.ts` |
| Supercopa | `domain/competicao/supercopa.ts` |
| Sorteio com seed | `core/sorteio.ts` |

**Critérios:** mata-mata tem problema da dobragem resolvido (sem sorteio viciado);
copa continental usa os 3 países de `LIGAS.md`; campeão da liga entra na
continental na fase certa.

---

## Fase 11 — Imprensa e polimento

| Entregável | Arquivos |
|---|---|
| Conferência pré-jogo | `ui/Imprensa/PreJogo.tsx` |
| Conferência pós-jogo | `ui/Imprensa/PosJogo.tsx` |
| Narração por template | `content/narracao.ts` |
| Clipes de gol | `ui/Clipes.tsx` |
| Refinamento de UI (tema, ícones) | `ui/tema/` |

**Critérios:** resposta errada na conferência custa Fidúcia; pós-jogo mostra resumo,
notas, expected goals e resumo; a narração cita os 3 eventos mais relevantes.

---

## Fase 12 — Balanceamento, performance e release

**Entregável:** `PERFORMANCE.md` cumprido; README final; `TODO.md` revisado.

**Critérios:** 10 temporadas headless em menos de 20 s; 1.500 partidas em menos de
10 s; UI 60 fps com 3 telas abertas; nenhum bug P0/P1 aberto; save de versão
anterior migra.

---

## Ordem de prioridade interna

Se houver conflito entre duas fases, respeite esta ordem de valor:
1. **Simulação correta** (Fases 1–2) — sem motor correto, nada funciona
2. **Temporadas e save** (Fase 4) — sem save, não há jogo
3. **Táticas** (Fase 5) — o coração da decisão do gestor
4. **Mercado e finanças** (Fases 7–8) — o coração da gestão
5. **Beleza e polimento** (Fase 11) — por último, sempre