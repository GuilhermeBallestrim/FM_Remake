# MODOS.md — Modos de jogo e fluxo de carreira

> Entrada obrigatória do projeto. Define a experiência completa do jogador,
> do menu inicial até o fim de carreira.

---

## 1. Objetivo

Definir todos os modos, telas, fluxos e regras de transição entre estados do jogo.
Nada de "tela genérica": cada tela tem propósito, entradas, saídas e validações.

---

## 2. Menu inicial

| Opção | Ação | Validação |
|---|---|---|
| **Nova carreira** | Abre fluxo §3 | Sempre disponível |
| **Continuar** | Carrega último save automático | Só se houver save válido |
| **Carregar** | Abre lista de saves (§9) | Sempre disponível |
| **Definições** | Abre tela de opções (§10) | Sempre disponível |
| **Créditos** | Mostra créditos (modal) | Sempre disponível |
| **Sair** | Fecha o jogo | Confirma se houver progresso não salvo |

---

## 3. Fluxo de nova carreira

```
Nova carreira
    │
    ├─► 3.1 Escolha de país e liga
    │       ├── Inglaterra (Premier League) — 20 clubes
    │       ├── Espanha (La Liga EA Sports) — 20 clubes
    │       ├── Itália (Serie A Enilive) — 20 clubes
    │       └── Brasil (Brasileirão Série A) — 20 clubes [opcional]
    │
    ├─► 3.2 Escolha de clube
    │       Grade 5×4 com: escudo gerado, nome, reputação, orçamento, 
    │       força do elenco (média overall), objetivos da diretoria
    │       Filtros: por reputação, orçamento, objetivo
    │
    ├─► 3.3 Nome do gestor
    │       Campo livre (máx. 30 chars), validação: não vazio, sem emoji
    │       Sugestões aleatórias de nomes de treinadores reais
    │
    ├─► 3.4 Dificuldade
    │       Fácil / Média / Difícil / Expert / Brutal
    │       Tooltip explica o que muda (ver IA_TATICA.md §7)
    │
    └─► 3.5 Resumo e confirmação
            Mostra: clube, liga, gestor, dificuldade, data de início
            Botão: "Iniciar carreira" → gera save inicial e vai para Dashboard
```

### 3.1 Dados mostrados na escolha de clube

| Campo | Fonte | Exemplo |
|---|---|---|
| Nome | `LIGAS.md` | "Manchester City" |
| Reputação | `LIGAS.md` | 94/100 |
| Orçamento | `LIGAS.md` | CR 105M |
| Força do elenco | Calculada | Overall médio: 16.2 |
| Objetivo principal | `FINANCAS.md` | "Vencer a Premier League" |
| Estádio | `LIGAS.md` | "Etihad Stadium (53.400)" |
| Rival principal | `LIGAS.md` §7 | "Manchester United" |

---

## 4. Modos de jogo

| Modo | Descrição | O que abre | O que fica bloqueado |
|---|---|---|---|
| **Carreira** | Jogar um clube por N temporadas | Tudo: partidas, treino, mercado, finanças, táticas, staff, base, imprensa | — |
| **Carreira curta** | Carreira limitada a 5 temporadas | Igual à carreira, mas fim forçado na temporada 5 | Não pode renovar contrato além da temporada 5 |
| **Um jogo só** | Amistoso único entre dois clubes | Escalação, táticas, partida única | Sem mercado, sem finanças, sem treino, sem save |
| **Simular temporada** | Rodar uma liga inteira sem jogar partidas | Apenas resultados, classificação, artilharia | Sem decisões táticas, sem mercado, sem imprensa |
| **Testar táticas** | Campo vazio com 11 jogadores dummy | Arrastar-e-soltar formações, testar instruções | Sem save, sem simulação real, sem elenco real |

### 4.1 Tabela de permissões por modo

| Funcionalidade | Carreira | Curta | 1 jogo | Simular | Testar táticas |
|---|---|---|---|---|---|
| Partida com decisões | ✓ | ✓ | ✓ | ✗ | ✗ |
| Mercado de transferências | ✓ | ✓ | ✗ | ✗ | ✗ |
| Treino e academia | ✓ | ✓ | ✗ | ✗ | ✗ |
| Finanças e diretoria | ✓ | ✓ | ✗ | ✗ | ✗ |
| Imprensa | ✓ | ✓ | ✗ | ✗ | ✗ |
| Save/Load | ✓ | ✓ | ✗ | ✗ | ✗ |
| Múltiplas temporadas | ✓ | 5 max | ✗ | 1 | ✗ |

---

## 5. Opções de carreira (configuradas no fluxo §3 ou nas definições)

| Opção | Valores | Padrão | Efeito |
|---|---|---|---|
| **Temporadas** | 1–30 | 10 | Número máximo de temporadas antes de "fim de carreira" |
| **Mudar de clube** | Sim / Não | Sim | Se não, fim de contrato = fim de jogo |
| **Demissão possível** | Sim / Não | Sim | Se não, Fidúcia < 10 não demite (só avisa) |
| **Falência possível** | Sim / Não | Sim | Se não, saldo negativo não encerra |
| **Dificuldade** | 5 níveis | Média | Ver `IA_TATICA.md` §7 |
| **Janela de transferências realista** | Sim / Não | Sim | Se não, mercado aberto o ano todo |
| **Lesões realistas** | Sim / Não | Sim | Se não, lesões só por evento de partida |

---

## 6. Dificuldade (resumo; detalhe em `IA_TATICA.md` §7)

| Nível | Força adversário | Mercado adversário | Orçamento jogador | Moral elenco |
|---|---|---|---|---|
| Fácil | -2 overall | Passivo | +20% | Alta |
| Média | Real | Normal | Real | Normal |
| Difícil | +1 overall | Agressivo | -10% | Baixa |
| Expert | +2 overall | Muito agressivo | -20% | Muito baixa |
| Brutal | +3 overall | Implacável | -30% | Crítica |

---

## 7. Telas de fim

### 7.1 Fim de partida

| Elemento | Descrição |
|---|---|
| Placar final | Grande, com marcadores e minutos |
| Estatísticas | Posse, finalizações, xG, cartões, escanteios |
| Notas dos jogadores | 1–10 com destaque para melhor/pior |
| Eventos-chave | Lista cronológica (gols, subs, cartões) |
| Botões | "Continuar" (volta ao dashboard), "Ver replay", "Salvar" |

### 7.2 Fim de temporada

| Aba | Conteúdo |
|---|---|
| **Resumo** | Classificação final, campeão, rebaixados, campeão da copa |
| **Elenco** | Evolução de overall, artilheiros do clube, assistentes, jogos |
| **Finanças** | Receitas/despesas anuais, saldo final, valor do elenco |
| **Objetivos** | Cada objetivo da diretoria: cumprido / falhou / % |
| **Prêmios** | Melhor jogador, revelação, técnico do ano (se ganhou) |
| **Ofertas** | Clubes interessados no gestor (se reputação alta) |
| **Botões** | "Próxima temporada", "Renovar contrato", "Aceitar oferta", "Sair" |

### 7.3 Fim de carreira

| Gatilho | Tela |
|---|---|
| Temporadas máximas atingidas | "Carreira encerrada após X temporadas. Estatísticas totais." |
| Demissão | "Você foi demitido do {clube}. Resumo da passagem." |
| Falência | "O {clube} faliu. Fim de jogo." |
| Rescisão mútua | "Você deixou o {clube}. Resumo." |

Botões: "Nova carreira", "Carregar save anterior", "Menu principal", "Sair"

---

## 8. Demissão e falência

### 8.1 Gatilhos de demissão (ver `FINANCAS.md` §5)

| Evento | Fidúcia | Ação |
|---|---|---|
| Objetivo principal falhado | -15 a -25 | Aviso |
| 2 objetivos falhados seguidos | < 25 | "Última chance" |
| Fidúcia < 10 | — | Demissão imediata |
| Rebaixamento | -35 | Demissão se Fidúcia já < 40 |

### 8.2 Falência (ver `FINANCAS.md` §4)

| Condição | Consequência |
|---|---|
| Saldo < -20M CR por 2 anos seguidos | Falência declarada |
| Saldo < 0 no fim da temporada | Multa + aviso vermelho no dashboard |

### 8.3 O que acontece com o save

- Save **não é apagado** (fica na lista "Carregar")
- Marca como `status: "demitido" | "falido" | "encerrado"`
- Na tela de carregar, mostra badge vermelho
- Opção: "Continuar como outro clube" (abre fluxo §3 mantendo reputação do gestor)

---

## 9. Save, autosave e carregamento

### 9.1 O que é salvo

| Momento | O que grava |
|---|---|
| Fim de cada dia (simulação) | Estado completo do mundo |
| Antes de cada partida | Snapshot pré-jogo (para replay) |
| Após cada partida | Resultado, estatísticas, lesões, cartões |
| Fim de mês | Finanças, contratos, moral |
| Fim de temporada | Tudo + histórico da temporada |
| Ação do usuário (mercado, táticas, treino) | Delta imediato |

### 9.2 Autosave

- **Automático** antes de cada partida (slot `autosave-pre-jogo-{data}`)
- **Automático** a cada 7 dias de simulação (slot `autosave-semanal-{data}`)
- Máximo 10 slots de autosave (FIFO)
- Usuário pode desativar em Definições

### 9.3 Slots manuais

- 20 slots nomeados pelo usuário
- Cada slot guarda: `nome`, `dataHora`, `clube`, `temporada`, `miniatura` (print do dashboard)
- Save manual sobrescreve sem confirmação se mesmo slot
- Exportar save → arquivo `.fmsave` (JSON comprimido)

### 9.4 Carregamento

```
Carregar
    │
    ├─ Lista: saves manuais (ordenados por data desc)
    ├─ Separador
    ├─ Autosaves (últimos 5, com badge "auto")
    └─ Separador
        └─ "Importar save" → seleciona arquivo .fmsave
```

Validação ao carregar:
- Versão do save compatível (migração automática se menor)
- Hash de integridade confere
- Clube ainda existe na liga atual
- Se save é de versão antiga → roda migrações (`MIGRATION.md`)

---

## 10. Opções e acessibilidade

| Categoria | Opção | Padrão |
|---|---|---|
| **Vídeo** | Resolução | Nativa |
| | Modo janela / tela cheia | Janela |
| | VSync | Ligado |
| **Interface** | Tamanho da fonte | 100% (80–150%) |
| | Alto contraste | Desligado |
| | Animções de transição | Ligadas |
| | Tooltips detalhados | Ligados |
| **Jogo** | Confirmação ações destrutivas | Ligada |
| | Velocidade de simulação | Normal (1x / 2x / 5x / 10x / Máx) |
| | Mostrar dicas de controle | Ligado |
| **Áudio** | Volume geral | 80% |
| | Volume narração | 70% |
| | Volume ambiente | 50% |
| | Música no menu | Ligada |
| **Acessibilidade** | Modo daltônico | Desligado |
| | Leitor de tela (ARIA) | Ligado |
| | Navegação só teclado | Ligado |
| | Reduzir movimento | Desligado |

---

## 11. Código

### `src/modos/tipos.ts`

```ts
export type ModoDeJogo = 
  | "carreira" 
  | "carreiraCurta" 
  | "umJogo" 
  | "simularTemporada" 
  | "testarTaticas";

export interface OpcoesNovaCarreira {
  ligaId: "ENG" | "ESP" | "ITA" | "BRA";
  clubeId: string;           // ex.: "ENG01"
  nomeGestor: string;
  dificuldade: Dificuldade;
  temporadasMax: number;
  mudarDeClube: boolean;
  demissaoAtiva: boolean;
  falenciaAtiva: boolean;
  janelaRealista: boolean;
  lesoesRealistas: boolean;
}

export interface ProgressoCarreira {
  saveId: string;
  modo: ModoDeJogo;
  temporada: number;         // 1-indexed
  dataAtual: string;         // "2025-08-15"
  clubeId: string;
  gestor: {
    nome: string;
    reputacao: number;
    clubesAnteriores: string[];
  };
  estado: "ativo" | "demitido" | "falido" | "encerrado" | "finalizado";
  fiducia: number;           // 0-100
  objetivos: ObjetivoDiretoria[];
}

export interface SaveMetadata {
  id: string;
  nome: string;
  dataHora: string;          // ISO 8601
  clube: string;
  temporada: number;
  miniaturaBase64?: string;  // thumbnail do dashboard
  versao: string;            // ex.: "1.3.0"
  modo: ModoDeJogo;
  tamanhoBytes: number;
}
```

### `src/modos/index.ts`

```ts
export async function iniciarNovaCarreira(
  opcoes: OpcoesNovaCarreira
): Promise<SaveMetadata> {
  // 1. Validar opções
  // 2. Gerar mundo (LIGAS.md + ELENCO.md) com seed única
  // 3. Criar estado inicial (ProgressoCarreira)
  // 4. Salvar no slot "autosave-inicio"
  // 5. Retornar metadata
}

export async function continuarCarreira(): Promise<ProgressoCarreira> {
  // Carrega o save mais recente (manual ou auto)
}

export async function carregarSave(saveId: string): Promise<ProgressoCarreira> {
  // Valida, migra se necessário, retorna estado
}

export async function salvarProgresso(
  progresso: ProgressoCarreira,
  slot?: string,           // se omitido, usa autosave
  tipo: "manual" | "auto" | "pre-jogo" = "auto"
): Promise<SaveMetadata> {
  // Serializa, comprime, escreve, atualiza índice
}

export function listarSaves(): SaveMetadata[] {
  // Lê índice, ordena por data desc
}

export function deletarSave(saveId: string): void;
export function exportarSave(saveId: string): Blob;  // .fmsave
export async function importarSave(blob: Blob): Promise<SaveMetadata>;
```

---

## 12. Regras de invariantes (testar em `tests/modos.test.ts`)

1. `iniciarNovaCarreira` com opções válidas sempre retorna `SaveMetadata` com `estado: "ativo"`
2. `clubeId` em `OpcoesNovaCarreira` sempre existe na `ligaId` escolhida
3. `carregarSave` com ID inexistente lança erro tipado (não `undefined`)
4. Save manual + autosave nunca compartilham o mesmo `id`
5. `exportarSave` + `importarSave` mantêm hash idêntico do estado
6. Migração de save v1.0 → v1.1 preserva: elenco, finanças, fidúcia, objetivos
7. Nenhum modo acessa tela/componentes que não existem (ex.: "Mercado" no modo "Um jogo só")
8. `listarSaves` ordena: manuais (novos primeiro) → autosaves (novos primeiro)
9. Slot de autosave pré-jogo existe antes de toda partida
10. Mudança de idioma (§ `LOCALIZACAO.md`) não quebra saves existentes