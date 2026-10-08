/**
 * Tipos do dominio: clubes, ligas e jogadores.
 *
 * Todos os identificadores sao em ingles (convenção do projeto) e os rotulos
 * exibidos na interface ficam em portugues.
 */

/** Codigo de um pais (usado para nacionalidade e para o pool de nomes). */
export type CodigoPais = string;

/** Posicao de um jogador no campo. */
export type Posicao =
  | "GOL"
  | "ZAG"
  | "LD"
  | "LE"
  | "VOL"
  | "MC"
  | "MEI"
  | "MD"
  | "ME"
  | "ATA"
  | "SA";

/** Pe dominante. */
export type Pe = "D" | "E";

/** Cores de um clube, em hexadecimal. */
export interface Cores {
  primaria: string;
  secundaria: string;
}

/** Um clube real. */
export interface Clube {
  id: string;
  nome: string;
  ligaId: string;
  pais: string;
  codigoPais: CodigoPais;
  cidade: string;
  cores: Cores;
  estadio: string;
  capacidade: number;
  reputacao: number;
  orcamentoCr: number;
  folhaSalarialAlvoCr: number;
  ambicao: number;
  rivalPrincipal?: string;
}

/** Uma liga real. */
export interface Liga {
  id: string;
  nome: string;
  nomeCurto: string;
  pais: string;
  codigoPais: CodigoPais;
  copaNacional: string;
  continental: string;
  supercopa: string;
  rodadas: number;
  ativa: boolean;
}

/** Faixa de classificacao que define a escala de overall do elenco. */
export type FaixaReputacao = "elite" | "alto" | "medio" | "baixo" | "minimo";

/** Tier de um jogador, usado para derivar overall quando nao ha dado oficial. */
export type TierJogador =
  | "LENDA"
  | "ELITE"
  | "TITULAR"
  | "BOA_PLAÇA"
  | "RESERVA"
  | "JOVEM"
  | "BASE";

/** De onde veio o dado do jogador (prioridade definida em `ELENCO.md`). */
export type FonteJogador = "csv" | "snapshot" | "gerado";

/** Um jogador, com todos os atributos de `ATRIBUTOS.md`. */
export interface Jogador {
  id: string;
  nome: string;
  nomeAbreviado: string;
  clubeId: string;
  dataNascimento: string;
  idade: number;
  nacionalidade: CodigoPais;
  posicao: Posicao;
  posicoesAlternativas: Posicao[];
  peDominante: Pe;
  alturaCm: number;
  pesoKg: number;
  overall: number;
  potencial: number;
  atributos: Record<string, number>;
  condicaoFisica: number;
  moral: number;
  contrato: ContratoJogador;
  tier: TierJogador;
  fonte: FonteJogador;
}

/** Contrato de um jogador. */
export interface ContratoJogador {
  salarioAnualCr: number;
  anosRestantes: number;
  valorRescisaoCr: number;
  clausulaLiberacaoCr: number | null;
}

/** Um clube com os dados de uma temporada especifica. */
export interface ClubeTemporada {
  clube: Clube;
  elenco: Jogador[];
  saldoCr: number;
  folhaSalarialCr: number;
  valorElencoCr: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  pontos: number;
}

/** Resultado de uma partida. */
export interface ResultadoPartida {
  rodada: number;
  data: string;
  mandanteId: string;
  visitanteId: string;
  golsMandante: number;
  golsVisitante: number;
  gols: Gol[];
  cartoes: Cartao[];
}

/** Gol marcado, com autor e minuto. */
export interface Gol {
  minuto: number;
  jogadorId: string;
  clubeId: string;
  assistenciaId: string | null;
  tipo: TipoGol;
}

/** Tipo do gol. */
export type TipoGol =
  | "normal"
  | "cabecada"
  | "penalti"
  | "foraDaArea"
  | "contraAtaque"
  | "falta";

/** Cartao aplicado em uma partida. */
export interface Cartao {
  minuto: number;
  jogadorId: string;
  clubeId: string;
  cor: "amarelo" | "vermelho";
}

/** Uma rodada do calendario. */
export interface Rodada {
  numero: number;
  data: string;
  jogos: Jogo[];
}

/** Um jogo de uma rodada. */
export interface Jogo {
  mandanteId: string;
  visitanteId: string;
}

/** Posicao na tabela de classificacao. */
export interface LinhaClassificacao {
  clubeId: string;
  nome: string;
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  saldo: number;
  posicao: number;
}

/** Mundo gerado: ligas, clubes e jogadores. */
export interface Mundo {
  seed: number;
  geradoEm: string;
  ligas: Liga[];
  clubes: Clube[];
  jogadores: Jogador[];
  /** Indice: clubeId -> indices dos jogadores no vetor `jogadores`. */
  elencosPorClube: Map<string, Jogador[]>;
}

/** Funcao que devolve o overall do jogador na posicao informada. */
export function overallNaPosicao(jogador: Jogador, _posicao: Posicao): number {
  return jogador.overall;
}

/** Descarta o campo `fonte` ao serializar (economiza espaco no save). */
export function paraSerializavel(mundo: Mundo): string {
  return JSON.stringify({
    seed: mundo.seed,
    geradoEm: mundo.geradoEm,
    ligas: mundo.ligas,
    clubes: mundo.clubes,
    jogadores: mundo.jogadores
  });
}