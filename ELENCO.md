# ELENCO.md — Elenco real: fontes, snapshot e preenchimento

> Entrada obrigatória do projeto. Este documento define como o jogo obtém **jogadores
> reais**: ordem de prioridade das fontes, formato do CSV, snapshot embutido de
> jogadores conhecidos por clube e as regras para preencher o elenco que faltar.

---

## 1. Ordem de prioridade das fontes

O carregador resolve o elenco de cada clube nesta ordem, e marca a origem de cada
jogador no campo `fonte`:

| Prioridade | Fonte | Campo `fonte` | Quando usar |
|---|---|---|---|
| 1 | CSV em `dados/elencos/{LIGA}.csv` | `csv` | Sempre que o arquivo existir |
| 2 | Snapshot embutido (§4 deste arquivo) | `snapshot` | Clubes cobertos pelo snapshot |
| 3 | Gerador com pools de nomes reais (§5) | `gerado` | Só preenche buracos |

Regra dura: **o CSV manda**. Se o CSV existir, o snapshot e o gerador não entram
naquele clube. Isso permite atualizar a temporada inteira sem tocar em código.

---

## 2. Formato do CSV

Arquivo: `dados/elencos/ENG.csv`, `ESP.csv`, `ITA.csv`, `BRA.csv`.

```csv
clubeId,nome,nomeAbreviado,dataNascimento,nacionalidade,posicao,posicoesAlternativas,peDominante,alturaCm,pesoKg,overall,potencial,condicaoFisica,moral
ENG01,Erling Haaland,Haaland,2000-07-21,NOR,ATA,,D,194,95,18,18,95,80
ENG01,Kevin De Bruyne,De Bruyne,1991-06-28,BEL,MEI,"MC,CM",D,181,70,17,17,90,85
```

| Coluna | Obrigatória | Observações |
|---|---|---|
| `clubeId` | sim | ID de `LIGAS.md` |
| `nome` | sim | Nome completo, como escrito pela pessoa (acento quando houver) |
| `nomeAbreviado` | sim | Nome curto para a grade e para o placar |
| `dataNascimento` | sim | `AAAA-MM-DD` |
| `nacionalidade` | sim | Código de país ISO real (`ENG`, `ESP`, `ITA`, `BRA`, `ARG`, …) |
| `posicao` | sim | `GOL`, `ZAG`, `LD`, `LE`, `VOL`, `MC`, `MEI`, `MD`, `ME`, `ATA`, `SA` |
| `posicoesAlternativas` | não | Entre aspas, separadas por vírgula |
| `peDominante` | sim | `D` ou `E` |
| `alturaCm`, `pesoKg` | não | Se vazio, o gerador usa a faixa de `LIGAS.md` §7 |
| `overall`, `potencial` | sim | Inteiros 1–20, ver §3 |
| `condicaoFisica` | não | 0–100, padrão 100 |
| `moral` | não | 0–100, padrão 70 |

Importante: `overall` e `potencial` são **números de balanceamento do jogo**, não
avaliações oficiais. O CSV é editado por quem tem o jogo em mãos.

---

## 3. Como o overall de um jogador real é definido

Sem dado oficial utilizável, o jogo classifica o jogador por **tier** e distribui
o valor dentro do tier com o RNG da seed:

| Tier | Critério (exemplos genéricos) | Overall |
|---|---|---|
| `LENDA` | prêmio mundial, jogador do ano, referência histórica | 18–20 |
| `ELITE` | titular absoluto de seleção,-artilheiro de elite nacional | 16–17,5 |
| `TITULAR` | titular de clube grande ou de seleção | 14–16 |
| `BOA_PLAÇA` | titular de clube médio ou reserva de seleção | 12–14 |
| `RESERVA` | jogador de banco e de cobrir posições | 10–12 |
| `JOVEM` | primeira temporada em clube profissional | 8–11 |
| `BASE` | base, academia, sem contrato profissional | 5–8 |

Dentro do tier, o overall é calculado pelo gerador a partir de:
1. **Tier** (tabela acima)
2. **Posição e papel** (tabela de pesos de `ATRIBUTOS.md` §4)
3. **Reputação do clube** (jogador em clube de reputação 90 tem, em média, 1 ponto
   a mais que o mesmo tier em clube de reputação 30)
4. **Idade** (jogador acima dos 31 perde até 1 ponto; abaixo de 21 ganha chance de
   potencial alto)
5. **Ruído da seed** (±0,5)

O `potencial` é sorteado por idade e tier (`ELENCO.md` §5 do documento anterior,
mantido em `data/geradorElenco.ts`): jogador com overall ≥ 15 e idade ≤ 23 tem 60%
de chance de potencial +2 a +4.

---

## 4. Snapshot embutido de jogadores conhecidos

**Aviso importante:** este snapshot é uma referência de montagem do mundo, feita por
memória, e **precisa ser conferida antes de usar**. Transferências acontecem todo
ano, e um jogador listado aqui pode ter mudado de clube. Para uso real, prefira
montar o CSV (§2) a partir de uma fonte de dados atualizada por você.

O snapshot traz o **elenco de referência** de cada clube: os nomes mais conhecidos e
o papel de cada um. O gerador completa o restante do elenco (§5).

### 4.1 Premier League (`ENG`)

| Clube | Elenco de referência |
|---|---|
| ENG01 Manchester City | Erling Haaland (ATA), Kevin De Bruyne (MEI), Phil Foden (ME), Rodri (VOL), Bernardo Silva (MEI), Rúben Dias (ZAG), Ederson (GOL) |
| ENG02 Liverpool | Mohamed Salah (ATA), Virgil van Dijk (ZAG), Alisson (GOL), Ryan Gravenberch (ME), Florian Wirtz (MEI), Trent Alexander-Arnold (LD), Luis Díaz (ME) |
| ENG03 Arsenal | Bukayo Saka (ME), Martin Ødegaard (MEI), Declan Rice (VOL), Viktor Salmerón (ZAG), Gabriel Magalhães (ZAG), David Raya (GOL), Myles Lewis-Skelly (LD) |
| ENG04 Manchester United | Bruno Fernandes (MEI), Alejandro Garnacho (ME), Kobbie Mainoo (ZAG), Matthijs de Ligt (ZAG), Amad Diallo (ME), André Onana (GOL) |
| ENG05 Chelsea | Cole Palmer (MEI), Enzo Fernández (MC), Moisés Caicedo (VOL), Christopher Nkunku (ATA), Marc Cucurella (LD), Cole Palmer e Reece James (LD) |
| ENG06 Tottenham Hotspur | Son Heung-min (ATA), Mohammed Kudus (MEI), Brennan Johnson (ATA), Pape Matar Sarr (VOL), Cristian Romero (ZAG), Guglielmo Vicario (GOL) |
| ENG07 Newcastle United | Alexander Isak (ATA), Bruno Guimarães (MEI), Anthony Gordon (ME), Fabian Schär (ZAG), Bruno Miguel (ZAG), Nick Pope (GOL) |
| ENG08 Aston Villa | Ollie Watkins (ATA), Morgan Rogers (ME), Youri Tielemans (MC), Lucas Digne (LE), Ezri Konsa (ZAG), Emiliano Martínez (GOL) |
| ENG09 Brighton | Kaoru Mitoma (ME), João Pedro (ATA), Carlos Baleba (MC), Bart Verbruggen (ZAG), Danny Welbeck (ATA), Jan Paul van Hecke (ZAG) |
| ENG10 West Ham | Jarrod Bowen (ME), Lucas Paquetá (ME), Aaron Wan-Bissaka (LD), Nayef Aguerd (ZAG), Tomáš Souček (VOL), Alphonse Areola (GOL) |
| ENG11 Crystal Palace | Eberechi Eze (MEI), Jean-Philippe Mateta (ATA), Daichi Kamada (MEI), Adam Wharton (MC), Marc Guéhi (ZAG), Dean Henderson (GOL) |
| ENG12 Everton | Jack Grealish (ME), Beto (ATA), Jordan Pickford (GOL), James Tarkowski (ZAG), Jarrad Branthwaite (LE), Vitalii Mykolenko (LE) |
| ENG13 Fulham | Rodrigo Muniz (ATA), Alex Iwobi (ME), Calvin Bassey (ZAG), Antonee Robinson (LD), Bernd Leno (GOL), Raúl Jiménez (ATA) |
| ENG14 Nottingham Forest | Morgan Gibbs-White (MEI), Callum Hudson-Odoi (ME), Murillo (ZAG), Ibrahim Sangaré (VOL), Nélson (ZAG), Matz Sels (GOL) |
| ENG15 Brentford | Yoane Wissa (ATA), Kevin Schade (ME), Ethan Pinnock (ZAG), Mikkel Damsgaard (ME), Marko Grujić (MC), Caoimhín Kelleher (GOL) |
| ENG16 AFC Bournemouth | Antoine Semenyo (ME), Alex Scott (MC), Justin Kluivert (ME), Marcos Senesi (ZAG), Bafodé Diakité (ZAG), Đorđe Petrović (GOL) |
| ENG17 Wolverhampton | Jhon Durán (ATA), Rayan Aït-Nouri (LE), Jean-Ricner Bellegarde (ME), Toti Gomes (ZAG), Emmanuel Agbadou (ZAG), José Sá (GOL) |
| ENG18 Leeds United | Brenden Aaronson (ME), Pascal Struijk (ZAG), Anton Stach (VOL), Jaka Bijol (ZAG), Ethan Ampadu (LD), Lucas Perri (GOL) |
| ENG19 Sunderland | Granit Xhaka (VOL), Enzo Le Fée (ME), Dan Ballard (ZAG), Simon Adingra (ME), Wilson Isidor (ATA), Robin Roefs (GOL) |
| ENG20 Burnley | James Trafford (ATA), Maxime Estève (LE), Hjalmar Ekdal (ME), Josh Cullen (VOL), Kyle Walker (LD), James Trafford e Bailey Peacock-Farrell (GOL) |

### 4.2 La Liga (`ESP`)

| Clube | Elenco de referência |
|---|---|
| ESP01 Real Madrid | Kylian Mbappé (ATA), Jude Bellingham (MEI), Vinícius Júnior (ME), Federico Valverde (MC), Arda Güler (ME), Eduardo Camavinga (VOL), Thibaut Courtois (GOL) |
| ESP02 FC Barcelona | Lamine Yamal (ME), Pedri (MC), Gavi (MC), Robert Lewandowski (ATA), Raphinha (ME), Frenkie de Jong (MC), Joan García (GOL) |
| ESP03 Atlético de Madrid | Antoine Griezmann (SA), Alexander Sørloth (ATA), Pablo Barrios (MEI), Koke (MC), Robin Le Normand (ZAG), Nahuel Molina (LD), Jan Oblak (GOL) |
| ESP04 Athletic Club | Nico Williams (ME), Iñaki Williams (ATA), Oihan Sancet (MEI), Mikel Jauregizar (VOL), Yuri Berchiche (LE), Unai Núñez (ZAG), Julen Agirrezabala (GOL) |
| ESP05 Villarreal | Nicolas Pépé (ME), Ayoze Pérez (SA), Georginio Wijnaldum (MC), Rafa Marín (ZAG), Pau Torres (ZAG), Luiz Júnior (ATA), Paulo Gazzaniga (GOL) |
| ESP06 Real Sociedad | Takefusa Kubo (ME), Mikel Oyarzabal (SA), Brais Méndez (ME), Aritz Elustondo (ZAG), Igor Zubeldia (VOL), Álex Remiro (GOL) |
| ESP07 Real Betis | Isco (MEI), Pablo Fornals (ME), Giovani Lo Celso (ME), Antony (ME), Rodrigo Riquelme (LE), Marc Bartra (ZAG), Álvaro Valles (GOL) |
| ESP08 Valencia CF | Diego Parejo (VOL), Luis Rioja (LE), Filip Ugrinic (ME), Pepelu (VOL), Cristhian Mosquera (ZAG), Giorgi Mamardashvili (GOL) |
| ESP09 Sevilla FC | Dodi Lukébakio (ME), Rubén Vargas (LE), Isaac Romero (ME), Kike Salas (ATA), André Martins (ZAG), Ørjan Nyland (GOL) |
| ESP10 Celta de Vigo | Iago Aspas (SA), Borja Iglesias (ATA), Pablo Durán (ME), Carl Starfelt (ZAG), Carlos Domínguez (ZAG), Vicente Guaita (GOL) |
| ESP11 Girona FC | Cristhian Stuani (ATA), Vladyslav Vanat (ATA), Yaser Asprilla (ME), Daley Blind (LD), David López (ZAG), Paulo Gazzaniga (GOL) |
| ESP12 CA Osasuna | Ante Budimir (ATA), Aimar Oroz (MEI), Lucas Torró (VOL), Alejandro Catena (ZAG), Jesús Areso (LD), Sergio Herrera (GOL) |
| ESP13 Rayo Vallecano | Jorge de Frutos (ME), Álvaro García (ME), Pep Chavarría (LE), Florian Lejeune (ZAG), Isi Palazón (SA), Augusto Batalla (MC) |
| ESP14 Espanyol | Javi Puado (ME), Roberto Fernández (ME), Leandro Cabrera (ZAG), Pol Lozano (VOL), Carlos Romero (LE), Marko Dmitrović (GOL) |
| ESP15 Getafe CF | Borja Mayoral (ATA), Djené (LE), Domingos Duarte (ZAG), Luis Milla (MC), Yellu Santiago (MC), David Soria (GOL) |
| ESP16 Deportivo Alavés | Carlos Soler (ME), Jonny (LD), Antonio Blanco (VOL), Lucas Boyé (ATA), Facundo Garcés (ZAG), Antonio Sivera (GOL) |
| ESP17 Levante UD | José Luis Morales (ME), Kervin Arriaga (MC), Manu (LD), Unai Elgezabal (ZAG), Etta Eyong (ATA), Andrés Fernández (MC) |
| ESP18 Elche CF | Rafa Mir (ME), Aleix Febas (ME), Pedro Bigas (ZAG), Víctor Chust (ZAG), John Donald (VOL), Matías Dituro (GOL) |
| ESP19 Real Oviedo | Santiago Cazorla (MEI), Salomón Rondón (ATA), Álex Forés (ME), David Costas (ZAG), Aarón Escandell (VOL), Leo Román (LE) |
| ESP20 Real Valladolid | Gonzalo Villar (MC), Zé Manu (SA), Owono (ZAG), Saidy Janko (ZAG), Luis Sánchez (ME), Javi López (GOL) |

### 4.3 Serie A (`ITA`)

| Clube | Elenco de referência |
|---|---|
| ITA01 Inter de Milão | Lautaro Martínez (ATA), Marcus Thuram (ME), Nicolò Barella (MC), Federico Dimarco (LD), Henrikh Mkhitaryan (MC), Yann Sommer (GOL), Alessandro Bastoni (ZAG) |
| ITA02 Napoli | Scott McTominay (ME), Stanislav Lobotka (VOL), Amir Rrahmani (ZAG), Alex Meret (LD), Matteo Politano (ME), Giovanni Di Lorenzo (LD), Pierluigi Gollini (GOL) |
| ITA03 Juventus | Kenan Yıldız (MEI), Dušan Vlahović (ATA), Manuel Locatelli (VOL), Federico Gatti (ZAG), Michele Di Gregorio (GOL), Andrea Cambiaso (LD), Teun Koopmeiners (MEI) |
| ITA04 AC Milan | Rafael Leão (ME), Christian Pulisic (ME), Tijjani Reijnders (MC), Fikayo Tomori (ZAG), Mike Maignan (GOL), Malick Thiaw (ZAG), Theo Hernández (LD) |
| ITA05 Atalanta | Ademola Lookman (ME), Charles De Ketelaere (ME), Marten de Roon (MC), Gianluca Carnesecchi (GOL), Sead Kolašinac (ZAG), Éderson (ME) |
| ITA06 AS Roma | Paulo Dybala (SA), Gianluca Mancini (ZAG), Bryan Cristante (VOL), Evan Ndicka (LE), Zeki Çelik (LD), Mile Svilar (GOL), Stephan El Shaarawy (ME) |
| ITA07 Lazio | Mattia Zaccagni (ME), Valentin Castellanos (ATA), Alessio Romagnoli (ZAG), Boulaye Dia (ME), Éderson (MEI), Ivan Provedel (GOL), Manuel Lazzari (LD) |
| ITA08 Fiorentina | Moise Kean (ATA), Albert Guðmundsson (ME), Rolando Mandragora (VOL), Robin Gosens (LD), David de Gea (GOL), Jacopo Fazzini (MC) |
| ITA09 Bologna | Santiago Castro (ATA), Giovanni Sartori (LE), Jhon Lucumi (ZAG), Remo Freuler (VOL), Łukasz Skorupski (GOL), Benjamin Dominguez (ME) |
| ITA10 Como 1907 | Nico Paz (MEI), Assane Diao (ME), Álvaro Morata (ATA), Patrick Cutrone (SA), Alberto Moreno (LE), Jean Butez (GOL) |
| ITA11 Torino | Duván Zapata (ATA), Che Adams (ATA), Ivan Ilić (ME), Cristiano Biraghi (LE), Alberto Dossena (ZAG), Vanja Milinković-Savić (GOL) |
| ITA12 Udinese | Sandi Lovrić (ME), Jakub Piotrowski (MC), Keinan Davis (ATA), Thomas Kristensen (ZAG), Maduka Okoye (LE), Razvan Sava (GOL) |
| ITA13 Genoa | Ruslan Malinovskyi (ME), Junior Messias (ME), Alessandro Vogliacco (ZAG), Johan Vásquez (ZAG), Nicola Leali (GOL), Morten Frendrup (MC) |
| ITA14 Cagliari | Gianluca Scamacca (ATA), Sebastiano Luperto (ZAG), Yerry Mina (ZAG), Zito Luvumbo (ME), Elia Caprile (MEI) |
| ITA15 Hellas Verona | Lorenzo Lucca (ATA), Suat Serdar (ME), Marco D'Alessandro (LD), Ondřej Duda (MC), Lorenzo Montipò (GOL) |
| ITA16 Parma | Pontus Almqvist (ME), Matteo Cancellieri (ATA), Christian Ordóñez (MC), Enrico Delprato (ZAG), Zion Suzuki (GOL) |
| ITA17 Lecce | Kialonda Gaspar (ZAG), Ylber Ramadani (MC), Lameck Banda (ME), Federico Baschirotto (LE), Wladimiro Falcone (GOL), Nikola Štulić (ATA) |
| ITA18 Monza | Andrea Colpani (ME), Matteo Ricci (MC), Gaetano (ATA), Pietro Terracciano (ME), Carlos Augusto (LD), Marco Perugini (GOL) |
| ITA19 Cremonese | Federico Bonazzoli (ATA), Marco Sernicola (LD), Alessio Zerbin (ME), Michele Collocolo (VOL), Marco Silvestri (GOL) |
| ITA20 Pisa | M'Bala Nzola (ATA), Idrissa Touré (ME), Marius Marin (VOL), Simone Canestrelli (ZAG), Antonio Caracciolo (ATA), Arthur (GOL) |

### 4.4 Brasileirão (`BRA`)

| Clube | Elenco de referência |
|---|---|
| BRA01 Flamengo | Gerson (ME), Giorgian de Arrascaeta (MEI), Pedro (ATA), Bruno Henrique (ME), Saúl Ñíguez (ZAG), Léo Ortiz (ZAG) |
| BRA02 Palmeiras | Raphael Veiga (MEI), Richard Ríos (VOL), Piquerez (LE), Rony (ATA), Murilo (LD), Weverton (GOL) |
| BRA03 Cruzeiro | Kaiki (LE), Lucas Silva (VOL), Marquinhos (ZAG), Wanderson (ME), Kaio Jorge (ATA), Cássio (GOL) |
| BRA04 Botafogo | John Victor (VOL), Marlon Freitas (ZAG), Gregore (VOL), Artur (ME), Matheus Martins (LE), Léo Linck (GOL) |
| BRA05 Bahia | Jean Lucas (SA), Cauly (ME), Everton Ribeiro (MEI), Kanu (ZAG), Gilberto (LB), Marcos Felipe (GOL) |
| BRA06 Mirassol | Reinaldo (ATA), Neto Moura (VOL), Chico Science (LE), Gabriel (CB), Edson Carioca (ME), Alex Muralha (GOL) |
| BRA07 Fluminense | Jhon Arias (ME), Germán Cano (ATA), Igor Jesus (ATA),.Nonato (MC), Felipe Melo (ZAG), Fábio (GOL) |
| BRA08 São Paulo | Oscar (MEI), Ferraresi (ZAG), Alan Franco (VOL), Luciano (ME), Nathan Silva (ZAG), Rafael (GOL) |
| BRA09 Internacional | Bruno Fuchs (ZAG), Vitinho (ME), Enner Valencia (ATA), Borré (ME), Alan Patrick (ME), Rochet (GOL) |
| BRA10 Grêmio | João Pedro (ATA), Edenilson (MC), Mayke (LD), Monsalve (SA),.Reinaldo (ZAG), Tiago Volpi (GOL) |
| BRA11 Atlético Mineiro | Hulk (ATA), Gustavo Scarpa (ME), Everson (GOL), Lyanco (ZAG), Igor Gomes (SA), Ruan Tressoldi (ZAG) |
| BRA12 Vasco da Gama | Rayan (ME), Coutinho (MEI), Payet (ME), Maicon (LD), Léo Jardim (GOL), Mateus Martins (SA) |
| BRA13 Santos | Gabriel Veron (ME), Neymar (ME), Guilherme (ATA), Diego Pituca (ME), Jorge (ZAG), Gabriel Brazão (GOL) |
| BRA14 Corinthians | Memphis Depay (ATA), Yuri Alberto (ATA), Hugo Souza (GOL), Charles (LD), Matheuzinho (ME), Breno Bidon (ZAG) |
| BRA15 Vitória | Ricardo Ryller (ZAG), Lucas Esteves (LE), Willian Oliveira (ME), Lucas Evangelista (MC), Lucas Arcanjo (GOL) |
| BRA16 Fortaleza | Breno Lopes (ATA), Titi Ortiz (LE), Matheus Rossetto (MC), Pochettino (ME), João Ricardo (GOL), Kuscevic (GOL) |
| BRA17 Sport Recife | Rafael Tobias (ZAG), Fabrício Domínguez (ME), Lucas Lima (ME), Hyoran (ME), Caíque França (GOL) |
| BRA18 Ceará | Willian Machado (ME), Fernando Sobral (ME), Erick Pulgar (VOL), Marllon (ZAG), Hugo (GOL), Fernandinho (MC) |
| BRA19 Juventude | Erickson Farias (ME), Gabriel Taliari (ME), Nenê (MEI), Zé Ivaldo (ZAG), Thiago Couto (GOL), Rodrigo Sam (SA) |
| BRA20 RB Bragantino | Thiago Borbas (ATA), Lucas Cunha (LD), Fernando (ME), Sasha (ME), Cleiton (GOL), Juninho Capixaba (ZAG) |

---

## 5. Preenchimento automático do elenco que faltar

Quando o CSV e o snapshot não cobrem todo o elenco, o gerador completa com jogadores
de banco usando pools de nomes reais por país. Regras:

1. O nome vem do pool do país **do clube** (60% chance) ou de qualquer outro país
   (40% chance, para clubes que contratam jogadores estrangeiros)
2. O jogador recebe `fonte: "gerado"` e **não aparece com nome em destaque** na UI:
   o jogo o mostra como "Sem dados" até o scout avaliar (ver §6)
3. Os atributos sao do tier da posição e do clube (ver `ATRIBUTOS.md` §2)
4. O gerador nunca inventa clube, liga ou estádio: apenas jogadores

### 5.1 Pools de nomes por país (20 nomes por região)

**Inglês:** Harry, Jack, Ollie, Callum, Reece, Declan, Mason, Connor, Ethan, Alfie, George, Lewis, Jordan, Tyler, Ryan, Charlie, Ben, Josh, Sam, Alex.
Sobrenomes: Walker, Hughes, Barnes, Fletcher, Watson, Chapman, Cooper, Dixon, Walsh, Horton, Mercer, Langley, Ashby, Barlow, Preston, Ridley, Sackville, Whitmore, Kaye.

**Espanhol:** Álvaro, Sergio, Pablo, Iker, Dani, Unai, Ander, Mikel, Aitor, Javi, Nacho, Rodri, Marcos, Hugo, Adrián, Gonzalo, Rubén, Jorge, Iván, Héctor.
Sobrenomes: Soberón, Arrieta, Bustamante, Cifuentes, Echeverría, Figueroa, Gallego, Herrero, Lozano, Montero, Navarro, Ortega, Peña, Quintana, Riquelme, Salas, Tejada, Valverde, Vera, Yusra.

**Italiano:** Marco, Luca, Matteo, Alessandro, Andrea, Stefano, Federico, Davide, Simone, Nicolò, Riccardo, Lorenzo, Gabriele, Gianluca, Mattia, Samuele, Leonardo, Emanuele, Pasquale, Salvatore.
Sobrenomes: Bellini, Caruso, De Luca, Esposito, Ferrara, Greco, Lombardi, Mancini, Marchetti, Nardi, Orlandi, Pagano, Rinaldi, Sanna, Testa, Valentini, Villa, Zaccardo, Bellucci, Capone.

**Brasileiro:** Gabriel, Matheus, Lucas, Pedro, Rafael, Bruno, Thiago, Diego, João, Felipe, Vinícius, Rodrygo, Endrick, Caio, Igor, Murilo, Danilo, Wesley, Hugo, Kaique.
Sobrenomes: Almeida, Andrade, Azevedo, Barbosa, Bezerra, Cardoso, Correia, Duarte, Farias, Gouveia, Beltrão, Machado, Nascimento, Peixoto, Queiroz, Ribeiro, Sakamoto, Trindade, Urubatan, Vasconcelos.

**Francês:** Hugo, Théo, Enzo, Lucas, Noah, Ethan, Ilan, Tom, Yanis, Malik, Kylian, Enzo, Adrien, Bastien, Corentin, Dylan, Enzo, Florian, Loïc, Maxime.
Sobrenomes: Dupont, Laurent, Moreau, Rousseau, Bernard, Fontaine, Girard, Perrin, Blanc, Garnier, Lemaire, Moreau? Avoid duplicates, Renard, Schmitt, Roux, Schneider, Colin, Dumas, Barbier, Noel.

**Alemão/holandês/etc. (resto do mundo):** Tim, Jonas, Lars, Nils, Sven, Erik, Marco, Robin, Brian, Kevin, Alexis, Theo, Nathan, Enzo, Filip, Jakub, Milan, Stefan, Luka, Andrija.
Sobrenomes: Müller, Schmidt, Fischer, Weber, Meyer, Wagner, Becker, Hoffmann, Schulz, Koch, Braun, Krüger, Hartmann, Lange, Werner, Krause, Meier, Klein, Zimmermann, Baumgart.

---

## 6. Scouts e "sem dados"

Para o jogo ser honesto: o gestor **não conhece** os jogadores que ele não
contratou ou não escalou.

| Estado do jogador | O que a UI mostra | Como sair desse estado |
|---|---|---|
| `desconhecido` | Nome, posição, idade, overall estimado (faixa) | Atribuir um scout (custa 1 dia de scout) |
| `avaliado` | Overall exato, atributos principais, contrato | Já é padrão |
| `completo` | Todos os atributos, forma, moral, notas | Briefing completo |

Isso cria uma camada de jogo: antes de fechar com um jogador, você gasta um scout.

---

## 7. Regras de invariantes (testar em `tests/elenco.test.ts`)

1. Nenhum ID de jogador duplicado
2. `dataNascimento` válida e idade entre 15 e 45 anos
3. `overall` inteiro entre 1 e 20, `potencial >= overall`
4. Todo jogador pertence a um clube que existe em `LIGAS.md`
5. Todo clube tem no mínimo 20 jogadores e pelo menos 2 goleiros
6. Posições dentro dos limites de `ELENCO.md` §3 (do documento anterior, em `data/geradorElenco.ts`)
7. Nenhum jogador com overall ≥ 16 em clube de reputação < 60
8. Nenhum nome duplicado dentro do mesmo clube
9. O CSV, quando presente, tem todas as colunas obrigatórias e tipos válidos
10. Jogadores com `fonte: "gerado"` nunca aparecem como destaque nas transferências
11. Mesma seed + mesmo CSV = mesmo elenco (hash idêntico)