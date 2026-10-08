# README.md — Football Manager (simulador de gestor)

> **Status do documento:** esqueleto. Conforme as fases forem entregues, este README
> é preenchido com o conteúdo real. Não prometa aqui o que não está implementado.

## O que é

Um simulador completo de gestor de futebol, jogável offline, com mundo 100% fictício
(3 ligas, 60 clubes, ~1.200 jogadores gerados proceduralmente), simulação determinística
de partidas por minuto, táticas, mercado, finanças e pressão da diretoria.

## Requisitos

- Node.js 20+ e npm 10+ (ambiente de desenvolvimento)
- Nenhum servidor, nenhuma rede, nenhum asset externo

## Como rodar

```bash
npm install
npm run dev        # inicia o jogo em modo de desenvolvimento
npm run build      # gera o build de produção
npm run preview    # serve o build de produção
```

## Scripts de verificação

```bash
npm run lint       # ESLint strict, zero warnings
npm run typecheck  # tsc --noEmit, strict, zero any
npm test           # Vitest
npm run sim:check  # roda uma temporada headless e valida os invariantes
```

## Documentos do projeto (leia antes de codar)

| Documento | Conteúdo |
|---|---|
| `PROMPT_FOOTBALL_MANAGER.md` | O prompt principal e as regras do projeto |
| `LIGAS.md` | 3 ligas, 60 clubes fictícios, cidades, estádios, cores, reputações |
| `ELENCO.md` | Regras de geração dos ~1.200 jogadores, nacionalidades, contratos |
| `ATRIBUTOS.md` | Os 46 atributos e como cada um entra na simulação |
| `MERCADO.md` | Fórmula de valor de mercado e IA dos clubes |
| `FINANCAS.md` | Contabilidade, FFP, objetivos e Fidúcia da diretoria |
| `ROTEIRO_FASES.md` | As 12 fases com critérios de aceitação |
| `PERFORMANCE.md` | Orçamento de performance e como medir |
| `TODO.md` | Dívidas técnicas conhecidas |

## Estrutura de pastas

```
core/       loop, tempo, RNG, calendário, eventos (sem regra de futebol)
sim/        motor de partida, IA, regras (não conhece UI nem banco)
domain/     entidades: Jogador, Clube, Contrato, Competicao (regras puras)
data/       geração de mundo, persistência, CSV
systems/    treino, mercado, staff, finanças, diretoria (orquestram domain + sim)
ui/         telas e componentes (só escutam eventos)
content/    templates de narração e textos
```

Regra de dependência: `ui → systems → sim → domain → core`. Nunca o caminho inverso.

## Escolha de stack e justificativa

*(Preencher na Fase 0. Requisito: uma escolha entre React+Vite, Svelte ou Godot 4,
com parágrafo justificando densidade de UI, hot-reload e empacotamento desktop.)*

## Diagrama de dependências

*(Preencher na Fase 0.)*

## Estado das fases

| Fase | Entregue | Aceitação |
|---|---|---|
| 0 — Fundação | ❌ | ❌ |
| 1 — Motor de partida | ❌ | ❌ |
| 2 — Atributos e química | ❌ | ❌ |
| 3 — Elenco e contrato (UI) | ❌ | ❌ |
| 4 — Temporadas e persistência | ❌ | ❌ |
| 5 — Táticas | ❌ | ❌ |
| 6 — Treino, lesões, academia | ❌ | ❌ |
| 7 — Mercado | ❌ | ❌ |
| 8 — Finanças e diretoria | ❌ | ❌ |
| 9 — Dashboard | ❌ | ❌ |
| 10 — Copas | ❌ | ❌ |
| 11 — Imprensa e polimento | ❌ | ❌ |
| 12 — Release | ❌ | ❌ |

## Licença e marca

Todo o conteúdo (clubes, jogadores, cidades, nações, moeda) é fictício e original.
Nenhum nome, escudo, marca ou dado de entidade real é usado no projeto.