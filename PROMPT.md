# PROMPT — Refazer o FIFA (jogo de futebol)

> Prompt completo, pronto para copiar e colar em qualquer agente de IA de programação.

---

## 🔷 PROMPT COMPLETO

```
Você é um desenvolvedor de jogos sênior, especialista em engines de tempo real
(simulação física, IA, animação procedural e otimização de 60 fps).
Seu objetivo é construir, do zero, um jogo de futebol jogável inspirado no
EA Sports FC — não uma tela de menu, mas a partida em si, do apito inicial ao
placar final.

# 1. Escopo do projeto

Crie um jogo de futebol 3D completo em um único repositório, com partidas de
11 contra 11 em campo de tamanho real (105 x 68 m), controle por teclado e
gamepad, rodando a 60 fps.

Definição de pronto (Definition of Done): o usuário entra em campo, controla
um jogador, passa, chuta, dribla, desarma, marca gol, o goleiro reage, a IA dos
outros 10 companheiros e dos 11 adversários se movimenta de forma convincente, e
a partida tem início, intervalo, segundo tempo, escanteio e placar final.

# 2. Stack obrigatória

- TypeScript estrito (strict: true, zero `any`)
- Web: Three.js + Vite, OU Godot 4 (GDScript). Escolha UMA e justifique em 1 parágrafo.
- Física de corpos rígidos: cannon-es / rapier, ou o motor nativo do Godot
- Estado: Zustand / Signals, ou Autoload do Godot
- Sem assets externos pagos. Toda a geometria e animação é gerada por código
  (cápsulas, quads, rig procedural, uniformes trocados por cor)
- Áudio: Web Audio API sintetizado (chute, apito, rede, ambiente de estádio) — sem arquivos

# 3. Sistemas obrigatórios (implemente na ordem)

## 3.1 Controle e movimentação
- Câmera em terceira pessoa atrás do time, com "target lock" (troca automática
  de jogador por proximidade à bola e por quem está em posse)
- Movimentação analógica: aceleração, desaceleração e curva de mudança de direção
- Corrida (sprint) com custo de fôlego que regenera quando o jogador para
- Empurrão e pressão física entre jogadores (massa, colisão, distribuição de força)
- Queda e recuperação, cartão amarelo e vermelho por falta dura

## 3.2 Bola e física (o sistema mais importante)
- Ponto de contato, restituição 0.62, atrito de rolagem e quique em 4 materiais
  (grama molhada, grama seca, terra, piso)
- Efeito Magnus simplificado: curvatura conforme a velocidade lateral do pé
- Chute com carga (potência + direção + elevação) — modelo de impulso com spin;
  trajetória distinta para chute curto, médio, longo e cruzamento
- Clash de pernas quando dois jogadores chutam ao mesmo tempo — resultado
  probabilístico ponderado por timing, atributos e ângulo de chegada
- Bola contida nos limites, com quique nas traves e nas linhas laterais
- Regras: lateral, escanteio, tiro de meta, gol e reposição no ponto correto

## 3.3 Atributos e habilidades (30+ atributos)
- Ritmo, finalização, passe, drible, defesa, físico, controle, resistência,
  visão e liderança
- Os atributos afetam de verdade o motor: o chute depende de finalização,
  o drible depende de controle de bola, a corrida depende de ritmo, e o salto
  depende de físico
- Habilidades especiais: "Chute colocado", "Chute de canhota", "Cavadinha",
  "Maestro" e "Cabeceio forte" — cada uma com efeito numérico no motor

## 3.4 IA dos jogadores (comportamento, não código fixo)
- FSM: Positioning → Support → Chase → Mark → Press → Recover
- Utilidade (utility AI) para escolher ação: passar / conduzir / chutar / alívio
- Sistema de papéis e "safe zone": a IA sabe onde fica o gol, onde estão os
  adversários e onde existe espaço
- 5 níveis de dificuldade alterando: tempo de reação (0.25 s no fácil,
  0.05 s no difícil), erro angular, agressividade e antecipação da interceptação
- Goleiro com FSM própria: posicionamento na linha, saída de área para evitar
  gol, defesas por reação e distribuição de bola

## 3.5 Partida e regras
- Formação que se adapta: o time se reposiciona conforme a bola (defesa 4-4-2,
  meio 4-3-3, ataque 3-2-4-1)
- Linha de impedimento
- Tempo cronometrado com acréscimos, intervalo e estouro de bola
- Substituições, cartões e gol anulado por impedimento com replay
- Placar, cronômetro e eventos (gol, falta, lateral, escanteio, impedimento)

## 3.6 Modos de jogo
1. Amistoso — escolher 2 times e a dificuldade
2. Torneio — 8 times, fase eliminatória
3. Modo carreira — 1 clube, temporada de 38 rodadas, transferências e evolução de atributos
4. Treino de skills — chute, pênalti, domínio e dribles

## 3.7 Times e licenças (IMPORTANTE)
- Times e jogadores 100% fictícios: nomes, escudos, cores e uniformes gerados
  por dados (ex.: "Verdes do Norte", "Atlético Serra")
- 24+ times com atributos distintos e escalação automática por overall

## 3.8 Interface (HUD) e apresentação
- HUD: placar, cronômetro, radar, barra de fôlego, indicador do jogador
  selecionado e nome do jogador em posse
- Menus: tela inicial, seleção de time, pausa, configurações e resultado
- Replay de gol (câmera lenta + ângulo lateral), cortes de gol e confete
- Tela de carregamento com dicas de controle
- Layout responsivo, funcionando de 720p a 4K

## 3.9 Áudio
- Tudo sintetizado com Web Audio: chute (ruído + filtro), apito, rede, ambiente
  de estádio (ruído rosa + coro) e música no menu

# 4. Arquitetura de código exigida

- Separação clara: `core/` (loop e tempo), `entities/` (Jogador, Bola, Time),
  `systems/` (física, IA, input, regras, áudio), `scenes/` e `ui/`
- Loop fixo de simulação a 60 Hz com acumulador; render desacoplado e
  interpolado (para jitter zero)
- Nada de estado global mutável espalhado: use injeção de dependência simples
- Colisão com broadphase (grid/hash) e narrowphase por bitmask
- Sistema de eventos (pub/sub) para gol, falta e bola perdida — a UI só escuta
- Identificadores em inglês, comentários e documentação em português
- Docstring em toda função pública, explicando a física e não só o "o que"
- Testes unitários para: chute, colisões, decisão da IA e regra de lateral

# 5. Modo de trabalho (obrigatório)

Antes de escrever código, responda e documente:
1. Escolha de stack + justificativa
2. Estrutura de pastas + diagrama de dependências
3. Ordem de implementação em fases, com um entregável visível por fase
4. Estimativa de linhas por módulo

Depois, implemente em FASES. Ao fim de cada fase:
- Informe os arquivos entregues
- Liste o que foi implementado
- Liste o que NÃO foi implementado ainda
- Rode build, lint e testes, e mostre o resultado
- Só avance para a próxima fase depois que a atual estiver funcionando

Priorize sempre um jogo JOGÁVEL antes de bonito. Zero tela de menu sem bola
rolando. Se um recurso não couber na fase, registre como dívida técnica em
`TODO.md` em vez de prometer demais.

# 6. Restrições

- Proibido deixar erro de compilação ou stub vazio sem justificativa
- Proibido usar asset, fonte, som ou marca de terceiros
- Performance: 22 jogadores + bola a 60 fps em máquina modesta — se precisar,
  reduza sombras e use LOD e spatial hash de colisão
- Comentários em português, identificadores em inglês
- Entrega final: README com como rodar, diagrama de arquitetura e lista de
  débitos técnicos conhecidos

Come agora pela Fase 0: escolha de stack, arquitetura e um vertical slice —
um campo, dois jogadores e uma bola que rola e chuta dentro do gol.
```

---

## 🔹 VERSÃO CURTA (para colar rápido)

```
Refaça o FIFA do zero: um jogo de futebol 3D completo e jogável, 11 contra 11
em campo real, com passe, chute, drible, corrida com fôlego, desarme, goleiro
com IA própria, IA dos 22 jogadores por comportamento (posicionar, marcar,
pressionar), física de bola com efeito Magnus e clash de pernas, 30+ atributos
que afetam o motor, HUD com radar e cronômetro, e os modos amistoso, torneio e
carreira.

Regras: TypeScript estrito + Three.js/Vite ou Godot 4; todos os times e jogadores
fictícios (sem marcas ou assets de terceiros); geometria, animação e áudio
gerados por código; loop de física fixo a 60 Hz; código separado em core/,
entities/, systems/, scenes/ e ui/.

Trabalhe em fases: entregue sempre algo jogável antes de bonito, rode
build/lint/test ao fim de cada fase, mostre o que falta e registre débitos
técnicos em TODO.md. Comece pela Fase 0: stack + arquitetura + um vertical
slice com campo, 2 jogadores e uma bola que rola e chuta no gol.
```

---

## 🔹 BLOCOS EXTRAS QUE VOCÊ PODE ANEXAR AO PROMPT

| Bloco | Quando usar |
|---|---|
| `PERSONAGENS.md` — elenco por time (idade, overall, atributos, posição, perfil do goleiro) | Quer que a IA já invente os jogadores |
| `TEAMS.md` — 24 times fictícios (nome, cores, ataque/meio/defesa, formação) | Quer os times definidos de antemão |
| `MAPA_TECNICAS.md` — mecânica de cada tipo de finalização e de defesa | Quer finalizações realistas |
| `PERFORMANCE.md` — orçamento de frame (16 ms, draw calls, triângulos) | Projeto com meta rígida de 60 fps |
| `ROTEIRO_FASES.md` — 10 fases com entregável verificável em cada uma | Quer controlar o ritmo da IA |

Quer que eu gere algum desses blocos? Por exemplo, um `TEAMS.md` com 24 clubes
fictícios já prontos para entrar no prompt.
