# PROMPT — Refazer o Football Manager (simulador de gestor)

> Prompt completo, pronto para copiar e colar em qualquer agente de IA de programação.

---

## 🔷 PROMPT COMPLETO

```
Você é um desenvolvedor de jogos sênior, especialista em simulação determinística,
sistemas de dados e interfaces densas (tabelas, arrastar-e-soltar, gráficos).
Seu objetivo é construir, do zero, um simulador de gestor de futebol completo
inspirado no Football Manager — não uma tela de menu, mas o jogo rodando: você
assume um clube, monta o elenco, negocia, define táticas, treina, administra
as finanças, sofre com resultados e tenta ganhar títulos.

# 1. Escopo do projeto

Crie um simulador de futebol gerenciado pelo jogador, em um único repositório, com:
temporadas completas, clubes com níveis de qualidade muito diferentes, mercado de
transferências, competições com mata-mata, sistema financeiro, treino, academia
(centro de formação), scout e uma tela de partida com simulação por minuto em 2D.

Definição de pronto (Definition of Done): o usuário escolhe um clube real (Premier League, La Liga, Serie A ou Brasileirão), joga uma temporada inteira de 38 rodadas com calendário real, treino, táticas, contratações e vendas, vê a classificação se atualizar, enfrenta eliminações, recebe e faz propostas de contrato, é pressionado pela diretoria e pela imprensa, pode falir ou ser demitido, e salva/carrega o progresso. A tela de partida mostra a partida acontecendo (posse, chances, gols, cartões, lesões e substituições), e não apenas um placar final.

# 2. Stack obrigatória

- TypeScript estrito (strict: true, zero `any`)
- Front-end: React + Vite OU Svelte; OU Godot 4 para app desktop. Escolha UMA e
  justifique em 1 parágrafo considerando densidade de UI e hot-reload
- Persistência: SQLite (better-sqlite3 ou sql.js) para saves e para o banco de
  clubes/jogadores; SEM backend obrigatório — o jogo roda offline
- Empacotamento opcional: Tauri ou Electron para versão desktop
- Gráficos: canvas 2D para o campo da partida e para os gráficos; SVG/CSS na UI
- Áudio: Web Audio API sintetizado — sem arquivos externos
- Sem assets externos pagos: escudos, retratos e uniformes são gerados por código
  (bandeiras, formas geométricas, iniciais)

# 3. Sistemas obrigatórios (implemente na ordem)

## 3.1 Banco de dados e geração do mundo
- Mundo **real**: Premier League (Inglaterra), La Liga (Espanha), Serie A (Itália) e
  opcionalmente Brasileirão Série A — 60 a 80 clubes reais com cidades, estádios,
  cores e reputações de balanceamento
- **Proibido** usar logos, escudos oficiais, fotos, uniformes desenhados, fontes ou
  áudios de terceiros. Escudos e uniformes são gerados por código a partir das cores
  e iniciais
- Elencos reais via CSV (`dados/elencos/{LIGA}.csv`) + snapshot embutido de ~400
  jogadores conhecidos por clube + gerador para preencher lacunas com pools de nomes
  reais por país
- Atributos, overall e potencial são **números de balanceamento do jogo**, não
  avaliações oficiais
- Elenco distribuído de forma realista: titulares de elite nos grandes, jovens
  promissores nos médios, base nos pequenos (o combustível do mercado)

## 3.2 Motor de simulação (o coração do jogo)
- Loop determinístico com tick de 1 em 1 minuto de jogo, com acumulador fixo
- RNG com seed explícita e serializável: mesma seed + mesma sequência de ações =
  mesmo resultado (teste obrigatório disso)
- Simulação de partida por modelo de posse com resultado a cada minuto, derivado dos
  atributos dos 11 em campo: a chance nasce da diferença de qualidade posicional,
  ajustada por táticas, condição física, moral e cansaço
- Eventos por minuto: chance, gol, finalização, defesa, escanteio, falta, cartão
  amarelo e vermelho, impedimento, lesão, substituição e gol contra
- Goleiro com métricas próprias: defesas, jogos sem gol, erros e distribuição de bola
- Pós-jogo: estatísticas individuais (notas de 1 a 10), mapa de calor por posição,
  expected goals, expected points e resumo textual gerado por template

## 3.3 Elenco e atributos
- Grade de atributos no estilo tabela densa: valores de 1 a 20 por atributo, com
  sub-atributos por posição (ex.: "Lateral: cruzado, corte, desarme"; "Atacante:
  finalização, um contra um, cabeceio, drible")
- 40+ atributos por jogador, filtráveis, ordenáveis, pesquisáveis e comparáveis
- Condição física por jogador, com carga, recuperação, risco de lesão e retorno
  gradual após lesão
- Moral, confiança e química entre companheiros que afetam a simulação de verdade
- Papéis (roles no estilo FM): "Lateral que sobe", "Volante que cobre",
  "9 que ataca a profundidade", "Goleiro que sai do gol", etc.

## 3.4 Táticas e instruções
- Visualização de campo 2D com arrastar-e-soltar: 11 posições em campo + banco,
  linhas de 4 ou 5 defensores, 3 ou 4 médios e 1 ou 2 atacantes
- Formações: 4-4-2, 4-3-3, 3-5-2, 5-3-2, 4-2-3-1, 3-4-3, 4-1-4-1 e customizada
- Instruções por jogador e por linha: marcar, pressionar, cobrir, conter,
  contrapor, segurar posição, subir, apoiar e recuar
- "Mentalidade" de muito defensiva até muito ofensiva, com efeito real na pressão
  dos jogadores e na amplitude do ataque
- Sistema de instruções de equipe: intensidade do pressing, largura da equipe,
  ritmo de jogo, substituições automáticas e ajustes ao vivo (timeouts)
- Pré-jogo e pós-jogo com opções de mudar o plano quando o resultado está ruim

## 3.5 Mercado e contratos
- Janela de transferências com prazos, negociações em fases e contrapartes com
  estratégia própria (vender para o rival, comprar antes do fechamento, fazer
  contrapropostas)
- Negociação por lances: valor de compra, salário, bônus por meta, duração da
  cláusula, cláusula de liberação, uso do dinheiro e referências do empresário
- Saídas e obstáculos: queda de valor por falta de jogo, cláusula de liberação,
  interesse de clubes menores, empréstimo, troca por empréstimo com opção de compra
- Orçamentos e limites de caixa por clube — não existe "comprar qualquer um"
- Jogadores livres, sem vaga no elenco na lista e dispensados: cada caso tem uma
  regra diferente de negociação e de espaço na lista

## 3.6 Treino, academia e central de Scout
- Treino semanal e diário por categorias de sessão: físico, técnico, tático, mental e
  regeneração
- Atributos sobem com treino, mas com curva de retorno decrescente e risco de lesão
- Lesões com recuperação em dias ou semanas, com reabilitação e retorno gradual
- Suspensões por cartão, com contagem regressiva
- Centro de formação: recrutamento automático, escolha do jogador principal, metas de
  desenvolvimento e joias entre 16 e 20 anos como caminho para virar lenda
- Staff: goleiros, scout, médico, preparador físico e assistente — cada um com
  habilidade própria que melhora treino, detecção de joias, prevenção de lesões e moral

## 3.7 Finanças e diretoria
- Contabilidade completa: receitas de bilheteria, patrocínio, direitos de transmissão,
  loja e merchantise; despesas com salários, transferências, staff, manutenção do
  estádio e juros
- Orçamento por temporada, teto salarial e regra de equilíbrio financeiro simplificada
  (FFP): estourar o teto gera sanção, falência ou venda forçada de jogadores
- Negociação com patrocinador, bilheteria e publicidade de camisa
- Objetivos da diretoria por temporada (posição na tabela, taça, classificação, caixa,
  desenvolvimento da base) e Fidúcia da diretoria de 0 a 100
- Não cumprir os objetivos leva a cobrança, advertência e demissão; falir leva a
  liquidação do clube

## 3.8 Competições e calendário
- 1 liga com 38 rodadas (ida e volta) usando calendário round-robin sem erro de data
- 2 copas: uma eliminatória e outra em grupos com fase final
- Disputa de final, Supercopa e pré-temporada
- Classificação, classificação por turno, artilharia, assistências, melhor defesa e
  desempate correto
- Simulação acelerada das rodadas até uma data-alvo e opção de "pular para o
  próximo jogo"

## 3.9 Interface (densidade estilo FM)
- Dashboard: próximo jogo, últimos resultados, classificação, lesionados, suspensos,
  moral baixa, rumores de mercado, objetivos, caixa, calendário e notificações
- Squad view: grade de tabela com colunas configuráveis, filtro por posição,
  ordenação, comparação lado a lado de dois jogadores e tooltips de atributos
- Táticas com arrastar-e-soltar e relatório de química por linha
- Transferências com filtros, comparador de dois clubes e histórico de negociações
- Finanças com gráficos de evolução e projeção para os próximos 12 meses
- Conferências de imprensa pré e pós-jogo, com perguntas e respostas
- Layout 100% responsivo, usável de 720p a 4K, com atalhos de teclado

## 3.10 Persistência e determinismo
- Save/load completo (temporada inteira, não apenas a partida), com serialização
  versionada e migração entre versões
- Multi-save com nome, data, clube e miniatura do último resultado
- Mundo reprodutível por seed: a mesma seed gera exatamente o mesmo mundo
- Banco de dados editável, com importação e exportação do elenco em XML ou CSV

# 4. Arquitetura de código exigida

- Separação clara: `core/` (loop, tempo, RNG, eventos), `sim/` (motor de partida,
  IA, regras), `domain/` (elenco, clubes, contratos, finanças), `data/` (geração de
  mundo, persistência), `systems/` (treino, mercado, staff, objetivos), `ui/` (telas,
  componentes) e `content/` (templates de texto)
- Loop fixo de simulação com acumulador; render desacoplado e interpolado
- Simulação e UI totalmente separadas: a UI só escuta eventos (pub/sub). Um teste
  headless deve rodar uma temporada inteira em menos de 2 segundos
- Funções puras sempre que possível: a mesma entrada gera a mesma saída
- Identificadores em inglês, comentários e documentação em português
- Docstring em toda função pública, explicando a lógica do jogo e não só o "o que"
- Testes unitários para: seed determinística, calendário round-robin, negociação,
  evolução de atributos, contabilidade e regras de desempate

# 5. Modo de trabalho (obrigatório)

Antes de escrever código, responda e documente:
1. Escolha de stack + justificativa
2. Estrutura de pastas + diagrama de dependências
3. Ordem de implementação em fases, com um entregável visível por fase
4. Estimativa de linhas por módulo
5. Formato do save e formato de um objeto `Jogador`, como exemplo em JSON

Depois, implemente em FASES. Ao fim de cada fase:
- Informe os arquivos entregues
- Liste o que foi implementado
- Liste o que NÃO foi implementado ainda
- Rode build, lint e testes, e mostre o resultado
- Só avance para a próxima fase depois que a atual estiver funcionando

Priorize sempre um jogo JOGÁVEL antes de bonito. Zero tela de menu sem uma
temporada simulando. Se um recurso não couber na fase, registre como dívida técnica
em `TODO.md` em vez de prometer demais.

# 6. Restrições

- Proibido deixar erro de compilação ou stub vazio sem justificativa
- **Proibido usar logos, escudos oficiais, fotos, uniformes desenhados, fontes ou áudios de terceiros** (motivos legais). Nomes de clubes, jogadores, estádios, cidades e países reais **são permitidos e esperados**.
- Proibido depender de rede em tempo de execução
- Performance: temporada completa headless em menos de 2 s; UI a 60 fps
- Nunca trunque tabelas por limite de tempo sem paginação ou filtro
- Comentários em português, identificadores em inglês
- Entrega final: README com como rodar, diagrama de arquitetura e lista de
  débitos técnicos conhecidos

Come agora pela Fase 0: escolha de stack, arquitetura, gerador de mundo (3 ligas,
20 clubes cada, 1.200 jogadores), loop determinístico e um vertical slice — um
clube, uma temporada de 38 rodadas rodando headless em menos de 2 segundos e uma
tela de dashboard mostrando classificação, caixa e próximo jogo.

# 7. Arquivos de projeto (LEIA TODOS antes de escrever código)

Estes arquivos estão na raiz do repositório e são **fonte de verdade**. Quando o
código e o documento divergirem, o documento manda — corrija o código, nunca o
documento:

- `LIGAS.md` — os 60 clubes, cidades, estádios, cores, reputações e rivalidades
- `ELENCO.md` — regras de geração dos jogadores, nacionalidades, contratos, nomes
- `ATRIBUTOS.md` — os 46 atributos e como cada um entra na simulação
- `MERCADO.md` — fórmula de valor de mercado e a IA de compra/venda dos clubes
- `FINANCAS.md` — receitas, despesas, FFP, objetivos da diretoria e Fidúcia
- `PERFORMANCE.md` — orçamento de performance e como medir
- `ROTEIRO_FASES.md` — as 12 fases com critérios de aceitação verificáveis
- `TODO.md` — dívidas técnicas conhecidas (atualizar ao fim de cada fase)
- `README.md` — documentação do projeto (stack, arquitetura, como rodar)

Regras de leitura:
1. Nenhum clube, jogador, cidade ou país pode ser criado fora de `LIGAS.md`
2. Nenhum atributo pode existir sem uso em `sim/` (teste de paridade documental)
3. Toda fórmula financeira vem de `FINANCAS.md`; toda fórmula de valor, de `MERCADO.md`
4. Toda fase só fecha com os critérios de aceitação de `ROTEIRO_FASES.md` passando
5. Nenhum número de performance pode ser relaxado: ou otimiza ou corta escopo
```

---

## 🔹 VERSÃO CURTA (para colar rápido)

```
Refaça o Football Manager do zero: um simulador de gestor completo com Premier
League, La Liga, Serie A e Brasileirão (60-80 clubes reais, ~1.200 jogadores
reais via CSV/snapshot), simulação de partida determinística por minuto (posse,
chances, gols, cartões, lesões, estatísticas com notas), táticas com
arrastar-e-soltar (formação, mentalidade, instruções por linha/jogador), mercado
com negociação por lances e orçamentos reais, centro de formação, treino com
risco de lesão, staff com habilidades, finanças com FFP e falência, diretoria
com objetivos e demissão, 38 rodadas + copas eliminatórias, dashboard FM com
tabela densa de atributos, conferências de imprensa e save/load de temporada.

Regras: TypeScript estrito + React/Vite (ou Svelte/Godot 4); SQLite local; nomes
reais de clubes/jogadores LIBERADOS; **proibido** logos/escudos/fotos/uniformes/
fonts/áudio de terceiros (gera por código); gráficos canvas 2D; sem rede;
simulação e UI separadas por pub/sub; temporada headless < 2s; determinismo por
seed obrigatório.

Trabalhe em fases: jogável antes de bonito, build/lint/test por fase, TODO.md
para dívidas. Fase 0: stack + arquitetura + gerador mundo real + loop
determinístico + 1 temporada headless + dashboard.
```

---

## 🔹 BLOCOS EXTRAS QUE VOCÊ PODE ANEXAR AO PROMPT

> Todos estes blocos **já foram gerados** e estão na raiz do repositório. A tabela
> abaixo é apenas o índice: o prompt principal (seção 7) exige a leitura de todos.

| Bloco | Arquivo | Status |
|---|---|---|
| 4 ligas com 60–80 clubes reais, estádios, cores, orçamentos, rivalidades | `LIGAS.md` | ✅ pronto |
| Elencos reais via CSV + snapshot 400+ jogadores + pools de nomes por país | `ELENCO.md` | ✅ pronto |
| 46 atributos com efeito no motor e pesos de overall por posição | `ATRIBUTOS.md` | ✅ pronto |
| Fórmula de avaliação e IA de compra/venda dos clubes | `MERCADO.md` | ✅ pronto |
| Receitas, despesas, FFP, objetivos e Fidúcia | `FINANCAS.md` | ✅ pronto |
| Orçamento de performance e ferramentas de medição | `PERFORMANCE.md` | ✅ pronto |
| 12 fases com entregável verificável em cada uma | `ROTEIRO_FASES.md` | ✅ pronto |
| Dívidas técnicas conhecidas | `TODO.md` | ✅ pronto |
| Documentação do projeto (stack, arquitetura, fases) | `README.md` | esqueleto |
| Sistema de narração por templates (50+ templates, tom adaptativo) | `NARRACAO.md` | ✅ pronto |
| IA tática do adversário (formação, XI, subs, ajustes, 5 dificuldades) | `IA_TATICA.md` | ✅ pronto |
| i18n pt-BR/pt-PT/en, pluralização, formatação, nomes próprios | `LOCALIZACAO.md` | ✅ pronto |
| 5 modos de jogo, fluxo carreira, saves, demissão, acessibilidade | `MODOS.md` | ✅ pronto |

Nenhum bloco opcional restante — a especificação está completa.