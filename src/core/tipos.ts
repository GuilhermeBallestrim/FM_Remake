/**
 * Tipos centrais compartilhados por todo o jogo.
 * Não importam de sim/, domain/, systems/, ui/ — são a base.
 */

export type LigaId = "ENG" | "ESP" | "ITA" | "BRA";
export type PaisId = "ENG" | "ESP" | "ITA" | "BRA" | "FRA" | "DEU" | "ARG" | "POR" | "NED" | "BEL" | "OUT";

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

export const POSICOES_ORDEM: Posicao[] = [
  "GOL",
  "ZAG",
  "LD",
  "LE",
  "VOL",
  "MC",
  "MEI",
  "MD",
  "ME",
  "ATA",
  "SA"
];

export const POSICAO_LABEL: Record<Posicao, string> = {
  GOL: "GOL",
  ZAG: "ZAG",
  LD: "LD",
  LE: "LE",
  VOL: "VOL",
  MC: "MC",
  MEI: "MEI",
  MD: "MD",
  ME: "ME",
  ATA: "ATA",
  SA: "SA"
};

export type PeDominante = "D" | "E";

export interface AtributosJogador {
  // Técnicos (12)
  finishing: number;
  longShots: number;
  passing: number;
  vision: number;
  crossing: number;
  dribbling: number;
  ballControl: number;
  firstTouch: number;
  technique: number;
  heading: number;
  flair: number;
  longPassing: number;
  // Defesa (9)
  tackling: number;
  marking: number;
  anticipation: number;
  positioning: number;
  strength: number;
  jumping: number;
  aggression: number;
  workRate: number;
  teamWork: number;
  // Físico (8)
  pace: number;
  acceleration: number;
  agility: number;
  stamina: number;
  balance: number;
  naturalFitness: number;
  injuryProneness: number;
  recovery: number;
  // Mental (7)
  decisionMaking: number;
  composure: number;
  discipline: number;
  leadership: number;
  consistency: number;
  adaptability: number;
  professionalism: number;
}

export interface AtributosGoleiro {
  reflexes: number;
  handling: number;
  aerialReach: number;
  oneOnOne: number;
  commandOfArea: number;
  communication: number;
  punching: number;
  throwing: number;
  kicking: number;
  eccentricity: number;
}

export type AtributosCompletos = AtributosJogador & Partial<AtributosGoleiro>;

export const ATRIBUTOS_LISTA: (keyof AtributosJogador)[] = [
  "finishing",
  "longShots",
  "passing",
  "vision",
  "crossing",
  "dribbling",
  "ballControl",
  "firstTouch",
  "technique",
  "heading",
  "flair",
  "longPassing",
  "tackling",
  "marking",
  "anticipation",
  "positioning",
  "strength",
  "jumping",
  "aggression",
  "workRate",
  "teamWork",
  "pace",
  "acceleration",
  "agility",
  "stamina",
  "balance",
  "naturalFitness",
  "injuryProneness",
  "recovery",
  "decisionMaking",
  "composure",
  "discipline",
  "leadership",
  "consistency",
  "adaptability",
  "professionalism"
];

export const ATRIBUTOS_GOLEIRO_LISTA: (keyof AtributosGoleiro)[] = [
  "reflexes",
  "handling",
  "aerialReach",
  "oneOnOne",
  "commandOfArea",
  "communication",
  "punching",
  "throwing",
  "kicking",
  "eccentricity"
];

export interface Contrato {
  salarioAnualCr: number;
  anosRestantes: number;
  valorRescisaoCr: number;
  clausulaLiberacao?: number;
  bonusPorJogo?: number;
  bonusPorGol?: number;
  bonusPorAssistencia?: number;
  bonusPorTitulo?: number;
  dataFim: string; // ISO "YYYY-MM-DD"
}

export interface Lesao {
  tipo: string;
  gravidade: "leve" | "media" | "grave";
  diasRestantes: number;
  dataInicio: string;
}

export type MoralNivel = "muito_baixa" | "baixa" | "normal" | "alta" | "muito_alta";

export interface Jogador {
  id: string;
  nome: string;
  nomeAbreviado: string;
  dataNascimento: string; // ISO "YYYY-MM-DD"
  idade: number;
  nacionalidade: PaisId;
  posicao: Posicao;
  posicoesAlternativas: Posicao[];
  peDominante: PeDominante;
  alturaCm: number;
  pesoKg: number;
  overall: number;
  potencial: number;
  atributos: AtributosCompletos;
  condicaoFisica: number; // 0-100
  moral: number; // 0-100
  confianca: number; // 0-100
  ferimentos: Lesao[];
  suspensao: number; // jogos restantes
  contrato: Contrato;
  valorMercadoCr: number;
  fonte: "csv" | "snapshot" | "gerado";
  papel?: string; // ex.: "Lateral que sobe"
}

export interface Clube {
  id: string;
  nome: string;
  nomeCurto: string;
  cidade: string;
  pais: PaisId;
  ligaId: LigaId;
  cores: { principal: string; secundaria: string };
  estadio: string;
  capacidadeEstadio: number;
  reputacao: number; // 1-100
  orcamentoCr: number; // milhões
  folhaSalarialCr: number; // milhões
  ambicao: 1 | 2 | 3 | 4;
  estiloJogo: "posse" | "direto" | "contraAtaque" | "fisico" | "tecnico";
  rivalidades: string[]; // IDs de clubes rivais
  elenco: Jogador[];
  staff: Staff[];
  financas: FinancasClube;
  objetivos: ObjetivoDiretoria[];
  fiducia: number; // 0-100
}

export interface Staff {
  id: string;
  nome: string;
  funcao: "tecnico" | "assistente" | "goleiros" | "preparador" | "medico" | "scout" | "diretor";
  habilidade: number; // 1-20
  salarioAnualCr: number;
  contratoFim: string;
}

export interface FinancasClube {
  saldoCr: number;
  receitaPrevistaCr: number;
  despesaPrevistaCr: number;
  tetoSalarialCr: number;
  patrocinioPrincipalCr: number;
  direitosTvCr: number;
  bilheteriaMediaCr: number;
  lojaCr: number;
  dividaCr: number;
  historicoAnual: { ano: number; receita: number; despesa: number; saldo: number }[];
}

export interface ObjetivoDiretoria {
  id: string;
  tipo:
    | "posicao_liga"
    | "campeao_liga"
    | "classificacao_continental"
    | "vencer_copa"
    | "orcamento"
    | "base_jovens"
    | "faturamento"
    | "juventude_xi";
  descricao: string;
  peso: number; // 10-30
  alvo: number | string;
  progresso: number; // 0-100
  status: "em_andamento" | "cumprido" | "falhou";
}

export type FormacaoId =
  | "4-4-2"
  | "4-3-3"
  | "3-5-2"
  | "5-3-2"
  | "4-2-3-1"
  | "3-4-3"
  | "4-1-4-1"
  | "custom";

export interface PosicaoCampo {
  x: number; // 0-100 (largura)
  y: number; // 0-100 (profundidade, 0 = própria área, 100 = área adversária)
  posicao: Posicao;
  jogadorId?: string;
  instrucao?: InstrucaoJogador;
}

export type InstrucaoJogador =
  | "marcar"
  | "pressionar"
  | "cobrir"
  | "conter"
  | "contrapôr"
  | "segurar_posicao"
  | "subir"
  | "apoiar"
  | "recuar";

export type Mentalidade = "muito_defensiva" | "defensiva" | "equilibrada" | "ofensiva" | "muito_ofensiva";

export interface InstrucoesEquipe {
  pressingIntensity: number; // 1-5
  larguraEquipe: number; // 1-5
  ritmoJogo: number; // 1-5
  substituicoesAutomaticas: boolean;
  ajustesAoVivo: boolean;
}

export interface TaticaCompleta {
  formacao: FormacaoId;
  posicoes: PosicaoCampo[];
  mentalidade: Mentalidade;
  instrucoesEquipe: InstrucoesEquipe;
  instrucoesPorJogador: Record<string, InstrucaoJogador>;
}

export type EventoPartidaTipo =
  | "gol"
  | "gol_contra"
  | "penalti_convertido"
  | "penalti_perdido"
  | "finalizacao_defendida"
  | "trave"
  | "escanteio"
  | "falta"
  | "cartao_amarelo"
  | "cartao_vermelho"
  | "lesao"
  | "substituicao"
  | "impedimento"
  | "bola_no_travessao"
  | "defesa_impossivel"
  | "gol_anulado_impedimento"
  | "erro_goleiro";

export interface EventoPartida {
  minuto: number;
  tipo: EventoPartidaTipo;
  timeId: string;
  jogadorId?: string;
  jogador2Id?: string; // assistência, adversário no desarme, etc.
  detalhes?: Record<string, unknown>;
  xG?: number;
}

export interface EstatisticasPartida {
  timeId: string;
  posse: number; // %
  finalizacoes: number;
  finalizacoesNoAlvo: number;
  xG: number;
  gols: number;
  escanteios: number;
  faltas: number;
  cartoesAmarelos: number;
  cartoesVermelhos: number;
  impedimentos: number;
  passesCertos: number;
  passesTotais: number;
  desarmes: number;
  interceptacoes: number;
}

export interface ResultadoPartida {
  mandanteId: string;
  visitanteId: string;
  golsMandante: number;
  golsVisitante: number;
  eventos: EventoPartida[];
  estatisticas: { mandante: EstatisticasPartida; visitante: EstatisticasPartida };
  notasJogadores: Record<string, number>; // jogadorId -> nota 1-10
  homemDoJogo: string;
  xG: { mandante: number; visitante: number };
}

export interface ClassificacaoTime {
  timeId: string;
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  saldoGols: number;
  forma: ("V" | "E" | "D")[]; // últimos 5
}

export type Dificuldade = "facil" | "media" | "dificil" | "expert" | "brutal";

export interface ConfigDificuldade {
  tempoReacaoMs: number;
  offsetOverall: number;
  multiplicadorAgressividade: number;
  maxSubsTaticas: number;
  conheceAdversario: boolean;
  precisaoInstrucoes: "basica" | "boa" | "otima" | "perfeita";
}

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

export interface SaveMetadata {
  id: string;
  nome: string;
  dataHora: string; // ISO
  clube: string;
  temporada: number;
  miniaturaBase64?: string;
  versao: string;
  modo: ModoDeJogo;
  tamanhoBytes: number;
}

export type ModoDeJogo = "carreira" | "carreiraCurta" | "umJogo" | "simularTemporada" | "testarTaticas";

export interface ProgressoCarreira {
  saveId: string;
  modo: ModoDeJogo;
  temporada: number;
  dataAtual: string; // ISO date
  clubeId: string;
  gestor: {
    nome: string;
    reputacao: number;
    clubesAnteriores: string[];
  };
  estado: "ativo" | "demitido" | "falido" | "encerrado" | "finalizado";
  fiducia: number;
  objetivos: ObjetivoDiretoria[];
  seed: string;
}

export interface RNGState {
  s0: number;
  s1: number;
}