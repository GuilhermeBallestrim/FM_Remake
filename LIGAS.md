# LIGAS.md — Mundo real: 3 ligas, 60 clubes (+ Brasil opcional)

> Entrada obrigatória do projeto. Este arquivo é a **fonte de verdade** dos clubes,
> cidades, estádios, cores e orçamentos. O gerador de mundo lê `dados/ligas.json`,
> que é gerado a partir deste arquivo. Nunca invente clube fora desta lista.

---

## 1. Convenções

| Item | Regra |
|---|---|
| Identificadores | `ENG01`…`ENG20`, `ESP01`…`ESP20`, `ITA01`…`ITA20`, `BRA01`…`BRA20` |
| Moeda | **CR** (crone), moeda fictícia usada nas finanças do jogo. Não é a moeda real de nenhum país |
| Valores | sempre em milhões de CR (`orcamento`, `folhaSalarial`) |
| Reputação | 1–100. É **balanceamento do jogo**, não a reputação oficial de nenhum clube |
| Capacidade | capacidade aproximada do estádio, arredondada |
| Cores | cores principais do uniforme, para o escudo/uniforme gerado por código |

**Regras legais e de escopo (importantes):**

1. Nomes de países, ligas, clubes, estádios, jogadores e técnicos são **dados reais** e
   estão liberados para uso.
2. **Proibido** usar logos, escudos oficiais, fotos, uniforme desenhado, fontes, marcas
   ou áudios de terceiros. O escudo e o uniforme são desenhados por código a partir
   das cores e das iniciais deste arquivo.
3. Não copie tabelas oficiais, contratos reais ou estatísticas oficiais. Overall,
   potencial, reputação, orçamento e folhas salariais são **números de balanceamento
   inventados** por este projeto.
4. A composição de cada liga muda a cada temporada. A lista abaixo é a **lista de
   referência** (temporada alvo: 2025/2026). Confirme em `dados/ligas.json` e ajuste
   quando a season mudar — o sistema tem campo `temporadaAlvo` justamente para isso.

---

## 2. As ligas

| Liga | País | Identidade futebolística | Formações típicas | Campeão | Copa nacional | Continental |
|---|---|---|---|---|---|---|
| `ENG` — Premier League | Inglaterra | velocidade, intensidade, bola aérea, Dispute de segunda bola | 4-3-3, 4-2-3-1, 3-4-3 | × | FA Cup | Champions League |
| `ESP` — La Liga EA Sports | Espanha | técnica, posse de bola, pressão alta | 4-3-3, 4-2-3-1, 4-4-2 | × | Copa del Rey | Champions League |
| `ITA` — Serie A Enilive | Itália | tática, marcação, bloqueio baixo, contra-ataque | 3-5-2, 3-4-2-1, 4-3-3 | × | Coppa Italia | Champions League |
| `BRA` — Campeonato Brasileiro Série A (opcional) | Brasil | ritmo, drible, futsal-like intensidade, mando de campo | 4-2-3-1, 4-3-3, 4-4-2 | × | Copa do Brasil | Copa Libertadores |

Temporadas: início no 2º sábado de agosto, fim em maio (a Série A brasileira vai até
dezembro). Datas geradas por `core/calendario.ts`, nunca pelo `Date` do sistema.

---

## 3. Premier League (`ENG`) — Inglaterra

| ID | Clube | Cidade | Cores | Estádio | Cap. | Rep. | Orçamento | Folha | Amb. |
|---|---|---|---|---|---|---|---|---|---|
| ENG01 | Manchester City | Manchester | `#6CABDD` / `#1C2C5B` | Etihad Stadium | 53.400 | 94 | 105 | 92 | 4 |
| ENG02 | Liverpool | Liverpool | `#C8102E` / `#F6EB61` | Anfield | 61.276 | 92 | 95 | 88 | 4 |
| ENG03 | Arsenal | Londres | `#EF0107` / `#FFFFFF` | Emirates Stadium | 60.704 | 90 | 85 | 78 | 4 |
| ENG04 | Manchester United | Manchester | `#DA291C` / `#FFFFFF` | Old Trafford | 74.310 | 85 | 80 | 76 | 4 |
| ENG05 | Chelsea | Londres | `#034694` / `#FFFFFF` | Stamford Bridge | 40.343 | 84 | 85 | 80 | 4 |
| ENG06 | Tottenham Hotspur | Londres | `#132257` / `#FFFFFF` | Tottenham Hotspur Stadium | 62.850 | 82 | 75 | 70 | 4 |
| ENG07 | Newcastle United | Newcastle | `#241F20` / `#FFFFFF` | St James' Park | 52.305 | 78 | 60 | 56 | 3 |
| ENG08 | Aston Villa | Birmingham | `#95BFE5` / `#670E36` | Villa Park | 42.918 | 76 | 60 | 54 | 3 |
| ENG09 | Brighton & Hove Albion | Brighton | `#0057B8` / `#FFFFFF` | Amex Stadium | 31.800 | 66 | 45 | 42 | 3 |
| ENG10 | West Ham United | Londres | `#7A263A` / `#1BB1E7` | London Stadium | 62.500 | 60 | 40 | 38 | 2 |
| ENG11 | Crystal Palace | Londres | `#1B458F` / `#C4122E` | Selhurst Park | 25.486 | 52 | 32 | 30 | 2 |
| ENG12 | Everton | Liverpool | `#003399` / `#FFFFFF` | Hill Dickinson Stadium | 52.888 | 54 | 38 | 34 | 2 |
| ENG13 | Fulham | Londres | `#FFFFFF` / `#000000` | Craven Cottage | 27.782 | 54 | 36 | 33 | 2 |
| ENG14 | Nottingham Forest | Nottingham | `#DD0000` / `#FFFFFF` | City Ground | 30.445 | 50 | 30 | 28 | 2 |
| ENG15 | Brentford | Londres | `#E30613` / `#FFFFFF` | Gtech Community Stadium | 17.250 | 44 | 26 | 24 | 2 |
| ENG16 | AFC Bournemouth | Bournemouth | `#DA291C` / `#000000` | Vitality Stadium | 11.307 | 46 | 26 | 25 | 2 |
| ENG17 | Wolverhampton Wanderers | Wolverhampton | `#FDB913` / `#231F20` | Molineux | 31.750 | 42 | 24 | 23 | 2 |
| ENG18 | Leeds United | Leeds | `#FFFFFF` / `#1D428A` | Elland Road | 37.926 | 44 | 26 | 24 | 1 |
| ENG19 | Sunderland | Sunderland | `#EB172B` / `#FFFFFF` | Stadium of Light | 48.707 | 40 | 22 | 20 | 1 |
| ENG20 | Burnley | Burnley | `#6C1D45` / `#8ABBAB` | Turf Moor | 21.944 | 34 | 16 | 15 | 1 |

---

## 4. La Liga (`ESP`) — Espanha

| ID | Clube | Cidade | Cores | Estádio | Cap. | Rep. | Orçamento | Folha | Amb. |
|---|---|---|---|---|---|---|---|---|---|
| ESP01 | Real Madrid | Madrid | `#FFFFFF` / `#FEBE10` | Santiago Bernabéu | 81.380 | 96 | 120 | 108 | 4 |
| ESP02 | FC Barcelona | Barcelona | `#A50044` / `#004D98` | Spotify Camp Nou | 99.354 | 92 | 95 | 90 | 4 |
| ESP03 | Atlético de Madrid | Madrid | `#CB3524` / `#272E61` | Cívitas Metropolitano | 70.460 | 88 | 80 | 76 | 4 |
| ESP04 | Athletic Club | Bilbao | `#EE2523` / `#FFFFFF` | San Mamés | 53.289 | 70 | 42 | 40 | 3 |
| ESP05 | Villarreal CF | Vila-real | `#FFE667` / `#005187` | Estadio de la Cerámica | 23.000 | 62 | 34 | 32 | 3 |
| ESP06 | Real Sociedad | Donostia-San Sebastián | `#0067B1` / `#FFFFFF` | Reale Arena | 39.500 | 64 | 34 | 32 | 3 |
| ESP07 | Real Betis | Sevilla | `#00954C` / `#FFFFFF` | Estadio Benito Villamarín | 60.721 | 62 | 34 | 32 | 3 |
| ESP08 | Valencia CF | Valência | `#FFFFFF` / `#F18E00` | Estadi de Mestalla | 49.430 | 56 | 30 | 29 | 2 |
| ESP09 | Sevilla FC | Sevilha | `#FFFFFF` / `#D2242B` | Estadio Ramón Sánchez-Pizjuán | 43.883 | 54 | 28 | 27 | 2 |
| ESP10 | Celta de Vigo | Vigo | `#8AC3EE` / `#FFFFFF` | Estadio de Balaídos | 24.870 | 48 | 22 | 21 | 2 |
| ESP11 | Girona FC | Girona | `#CD2534` / `#FFFFFF` | Estadi Montilivi | 14.520 | 46 | 20 | 19 | 2 |
| ESP12 | CA Osasuna | Pamplona | `#0A346F` / `#D91A21` | Estadio El Sadar | 23.576 | 44 | 19 | 18 | 1 |
| ESP13 | Rayo Vallecano | Madrid | `#FFFFFF` / `#E53027` | Estadio Municipal de Vallecas | 14.708 | 42 | 18 | 17 | 1 |
| ESP14 | Espanyol | Barcelona | `#007FC8` / `#FFFFFF` | RCDE Stadium | 40.000 | 40 | 17 | 16 | 1 |
| ESP15 | Getafe CF | Getafe | `#005999` / `#FFFFFF` | Coliseum Alfonso Pérez | 17.404 | 36 | 14 | 13 | 1 |
| ESP16 | Deportivo Alavés | Vitoria-Gasteiz | `#0761AF` / `#FFFFFF` | Estadio de Mendizorrotza | 19.840 | 34 | 13 | 12 | 1 |
| ESP17 | Levante UD | Valência | `#B71C1C` / `#FFFFFF` | Estadi Ciutat de València | 26.354 | 30 | 12 | 11 | 1 |
| ESP18 | Elche CF | Elche | `#FFFFFF` / `#00954C` | Estadio Martínez Valero | 31.388 | 26 | 10 | 9 | 1 |
| ESP19 | Real Oviedo | Oviedo | `#1B4EA2` / `#FFFFFF` | Estadio Carlos Tartiere | 30.500 | 22 | 9 | 8 | 1 |
| ESP20 | Real Valladolid | Valladolid | `#6A2C8F` / `#FFFFFF` | Estadio José Zorrilla | 27.558 | 24 | 9,5 | 8,5 | 1 |

---

## 5. Serie A (`ITA`) — Itália

| ID | Clube | Cidade | Cores | Estádio | Cap. | Rep. | Orçamento | Folha | Amb. |
|---|---|---|---|---|---|---|---|---|---|
| ITA01 | Inter de Milão | Milão | `#0068A8` / `#151515` | San Siro | 75.923 | 92 | 105 | 96 | 4 |
| ITA02 | Napoli | Nápoles | `#12A0D7` / `#FFFFFF` | Stadio Diego Armando Maradona | 54.726 | 86 | 78 | 74 | 4 |
| ITA03 | Juventus | Turim | `#FFFFFF` / `#151515` | Allianz Stadium | 41.507 | 86 | 80 | 76 | 4 |
| ITA04 | AC Milan | Milão | `#FB090B` / `#151515` | San Siro | 75.923 | 82 | 72 | 70 | 4 |
| ITA05 | Atalanta | Bérgamo | `#1D71B8` / `#151515` | Gewiss Stadium | 21.300 | 74 | 50 | 48 | 3 |
| ITA06 | AS Roma | Roma | `#8E1F2F` / `#F0BC42` | Stadio Olimpico | 70.634 | 72 | 48 | 46 | 3 |
| ITA07 | Lazio | Roma | `#A8C6E5` / `#FFFFFF` | Stadio Olimpico | 70.634 | 70 | 46 | 44 | 3 |
| ITA08 | Fiorentina | Florença | `#592C82` / `#FFFFFF` | Stadio Artemio Franchi | 43.147 | 62 | 36 | 34 | 2 |
| ITA09 | Bologna | Bolonha | `#9F1B32` / `#1A2F5A` | Stadio Renato Dall'Ara | 38.279 | 62 | 36 | 34 | 2 |
| ITA10 | Como 1907 | Como | `#005BAC` / `#FFFFFF` | Stadio Giuseppe Sinigaglia | 13.902 | 46 | 24 | 23 | 1 |
| ITA11 | Torino | Turim | `#8B1E3F` / `#FFFFFF` | Stadio Olimpico Grande Torino | 27.958 | 48 | 25 | 24 | 1 |
| ITA12 | Udinese | Udine | `#FFFFFF` / `#151515` | Stadio Bluenergy | 25.144 | 46 | 24 | 23 | 1 |
| ITA13 | Genoa | Gênova | `#B01B2E` / `#003366` | Stadio Luigi Ferraris | 33.298 | 44 | 23 | 22 | 1 |
| ITA14 | Cagliari | Cagliari | `#B5121B` / `#00205B` | Stadio Unipol Domus | 16.416 | 42 | 22 | 21 | 1 |
| ITA15 | Hellas Verona | Verona | `#FCDD09` / `#00295B` | Stadio Marcantonio Bentegodi | 39.211 | 40 | 20 | 19 | 1 |
| ITA16 | Parma | Parma | `#FFD700` / `#0B4EA2` | Stadio Ennio Tardini | 22.352 | 38 | 19 | 18 | 1 |
| ITA17 | Lecce | Lecce | `#FFD400` / `#B01B2E` | Stadio Via del Mare | 31.733 | 36 | 18 | 17 | 1 |
| ITA18 | Monza | Monza | `#EE1111` / `#FFFFFF` | Stadio Brianteo | 15.039 | 36 | 18 | 17 | 1 |
| ITA19 | Cremonese | Cremona | `#8A8D8F` / `#B01B2E` | Stadio Giovanni Zini | 20.285 | 28 | 12 | 11 | 1 |
| ITA20 | Pisa | Pisa | `#00427E` / `#FFFFFF` | Stadio Arena Garibaldi | 25.000 | 24 | 11 | 10 | 1 |

---

## 6. Campeonato Brasileiro Série A (`BRA`) — opcional

Ligaextra, habilitada em `dados/ligas.json` com `"ativa": true`. Entra no
cronograma a partir da Fase 10 (já que usa calendário em ano-calendário).

| ID | Clube | Cidade | Cores | Estádio | Cap. | Rep. | Orçamento | Folha |
|---|---|---|---|---|---|---|---|---|
| BRA01 | Flamengo | Rio de Janeiro | `#C52613` / `#151515` | Estádio do Maracanã | 68.156 | 92 | 70 | 60 |
| BRA02 | Palmeiras | São Paulo | `#006437` / `#FFFFFF` | Allianz Parque | 43.713 | 90 | 68 | 58 |
| BRA03 | Cruzeiro | Belo Horizonte | `#0F3B8C` / `#FFFFFF` | Estádio Mineirão | 61.846 | 78 | 44 | 40 |
| BRA04 | Botafogo | Rio de Janeiro | `#151515` / `#FFFFFF` | Estádio Nilton Santos | 46.931 | 78 | 44 | 40 |
| BRA05 | Bahia | Salvador | `#0A4D8C` / `#E4002B` | Arena Fonte Nova | 47.907 | 70 | 36 | 33 |
| BRA06 | Mirassol | Mirassol | `#F2C300` / `#151515` | Estádio Campos Maia | 15.000 | 56 | 24 | 22 |
| BRA07 | Fluminense | Rio de Janeiro | `#7A1E3C` / `#00874A` | Estádio do Maracanã | 68.156 | 76 | 42 | 38 |
| BRA08 | São Paulo | São Paulo | `#FE0000` / `#151515` | Estádio do Morumbi | 63.657 | 78 | 44 | 40 |
| BRA09 | Internacional | Porto Alegre | `#E5050F` / `#FFFFFF` | Estádio Beira-Rio | 50.128 | 74 | 40 | 36 |
| BRA10 | Grêmio | Porto Alegre | `#0D80BF` / `#151515` | Arena do Grêmio | 55.225 | 74 | 40 | 36 |
| BRA11 | Atlético Mineiro | Belo Horizonte | `#151515` / `#FFFFFF` | Arena MRV | 46.070 | 78 | 44 | 40 |
| BRA12 | Vasco da Gama | Rio de Janeiro | `#151515` / `#FFFFFF` | São Januário | 21.880 | 70 | 34 | 31 |
| BRA13 | Santos | Santos | `#FFFFFF` / `#151515` | Vila Belmiro | 16.797 | 66 | 30 | 28 |
| BRA14 | Corinthians | São Paulo | `#FFFFFF` / `#151515` | Neo Química Arena | 49.205 | 76 | 42 | 38 |
| BRA15 | Vitória | Salvador | `#B01B2E` / `#151515` | Estádio Barradão | 30.618 | 62 | 28 | 26 |
| BRA16 | Fortaleza | Fortaleza | `#0F3B8C` / `#E4002B` | Estádio Castelão | 63.903 | 64 | 30 | 28 |
| BRA17 | Sport Recife | Recife | `#B01B2E` / `#151515` | Estádio Ilha do Retiro | 26.973 | 58 | 26 | 24 |
| BRA18 | Ceará | Fortaleza | `#151515` / `#FFFFFF` | Estádio Castelão | 63.903 | 58 | 26 | 24 |
| BRA19 | Juventude | Caxias do Sul | `#007A33` / `#FFFFFF` | Estádio Alfredo Jaconi | 19.924 | 48 | 20 | 18 |
| BRA20 | RB Bragantino | Bragança Paulista | `#FFFFFF` / `#D0202E` | Estádio Nabi Abi Chedid | 15.100 | 54 | 24 | 22 |

---

## 7. Rivalidades e derbies

| Derby | Clima | Frase de torcida (escrita pelo projeto) |
|---|---|---|
| ENG01 x ENG02 | Derby de Manchester | `"Manchester é uma só"` |
| ENG03 x ENG06 | Derby de Londres (Norte) | `"Norte de Londres não se divide"` |
| ENG04 x ENG08 | `"Melhor que o Glazers"` | rivalidade entre Old Trafford e Villa Park |
| ENG07 x ENG12 | Derby do Tyne-Wear | `"St James' Park não dá espaço"` |
| ENG11 x ENG15 | Derby do Sul de Londres | `"Selhurst para o Gtech"` |
| ENG19 x ENG18 | Vencedores do acesso | `"Elland Road e Stadium of Light"` |
| ESP01 x ESP02 | El Clásico | `"El Clásico"` |
| ESP01 x ESP03 | Derby de Madrid | `"Madrid es uno"` |
| ESP02 x ESP14 | Catalanismo | `"Barcelona no és el centrc de Catalunya"` |
| ESP04 x ESP07 | Derbi Vasco | `duelo basco-andaluz` |
| ESP17 x ESP18 | Derby Docas | `"Valência não tem um único time"` |
| ITA01 x ITA04 | Derby della Madonnina | `"Derby della Madonnina"` |
| ITA02 x ITA03 | Derby d'Italia | `"Napoli contra Torino"` |
| ITA06 x ITA07 | Derby della Capitale | `"Roma capital do mundo"` |
| ITA10 x ITA18 | Derby dos lakes | `duelo milanês menor` |
| BRA01 x BRA04 x BRA07 x BRA12 | Clássicos dos Bandeirantes | `"O Rio tem quatro"` |
| BRA02 x BRA14 | Paulista | `"Paulista é guerra"` |
| BRA03 x BRA11 | Mineiro | `"Clássico Mineiro"` |
| BRA09 x BRA10 | Gre-Nal | `"Gre-Nal"` |
| BRA05 x BRA18 | `"Nordestino"` | `Bahia e Ceará` |

Efeito no jogo: **+8% de receita** em jogo de derbi, hostilidade extra na imprensa e
um bloco de narração próprio (ver `NARRACAO.md`).

---

## 8. Competições

| Competição | Formato | Quando |
|---|---|---|
| Liga (38 rodadas) | round-robin ida e volta com rotação alternativa | agosto → maio |
| FA Cup | eliminatória com 64 clubes, fases de 2ª rodada, oitavas, quartas, semifinais e final | dezembro → maio |
| Copa del Rey | eliminatória com varya formato (64 ou 96 clubes conforme a season) | outubro → maio |
| Coppa Italia | eliminatória com 64 clubes, fases de oitavas, quartas, semifinais e final | janeiro → maio |
| Copa do Brasil | eliminatória com 64 clubes | março → novembro |
| Supercopa (Community Shield, Supercopa de España, Supercoppa Italiana) | jogo único entre campeão da liga e campeão da copa, no fim da pré-temporada | agosto |
| UEFA Champions League | fase de liga (36 clubes) e fase eliminatória, com os melhores de cada liga e vaga por desempenho | setembro → maio |
| Copa Libertadores | grupos e eliminatória, com os melhores da `BRA` | abril → novembro |

**Regra de implementaçao:** as copas nacionais e a continental entram na **Fase 10**
(ver `ROTEIRO_FASES.md`). Até lá, o jogo roda só com a liga.

---

## 9. Regras de geração de elenco por clube

O gerador usa reputação e folha salarial como alvos:

| Faixa de reputação | Nº de jogadores | Overall do XI | Overall das reservas | Observação |
|---|---|---|---|---|
| 80–100 | 26–30 | 14,0–17,5 | 10–13 | 1–2 joias (potencial ≥ 17) |
| 60–79 | 24–27 | 12,0–14,0 | 9–12 | 1 joia provável |
| 40–59 | 22–25 | 10,0–12,0 | 8–11 | talvez 1 promessa futura |
| 20–39 | 21–24 | 8,5–10,5 | 7–10 | foco em baratos e jovens |
| 1–19 | 20–23 | 7,0–9,0 | 6–9 | quase tudo jovem e barato |

Regras adicionais:
- Todo clube tem exatamente 2 goleiros com overall ≥ média do elenco − 1
- Relação de posições: 2–3 goleiros, 4–6 zagueiros, 4–6 laterais, 2–4 volantes,
  4–6 meias, 4–7 atacantes
- Nenhum jogador com overall ≥ 16 em clube de reputação < 60
- A folha salarial listada acima é o alvo; o gerador ajusta para ±5%
- O elenco **real** vem de `ELENCO.md`; o gerador só preenche o que faltar

---

## 10. Regras de invariantes (testar em `tests/ligas.test.ts`)

1. 20 clubes por liga ativa, sem IDs duplicados
2. Todo clube tem estádio, cidade, cores (hex válidos) e capacidade > 5.000
3. A soma de posições por clube respeita mínimo e máximo (`ELENCO.md` §3)
4. Nenhum jogador com overall ≥ 16 em clube de reputação < 60
5. Folha salarial dentro de ±5% do valor desta tabela
6. Nenhum nome, cor ou estádio de entidade real fora desta lista (comparação de string)
7. Nenhum arquivo de asset externo (logo, imagem) é importado pelo projeto
8. Todas as copas citadas em §8 existem em `domain/competicao/` até o fim da Fase 10