/**
 * Os 46 atributos de `ATRIBUTOS.md` e o calculo de overall por posicao.
 *
 * Este arquivo e a Implementacao do documento: o teste de paridade documental
 * (`tests/atributos.test.ts`) garante que a lista aqui bate 100% com o markdown.
 */

import type { Posicao } from "./tipos";

/** Grupo de posicoes que compartilha a mesma tabela de pesos. */
export type GrupoPosicao =
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

/** Atributo de um jogador de linha (36 no total). */
export interface DefinicaoAtributo {
  id: string;
  rotulo: string;
  grupo: "tecnica" | "defesa" | "fisico" | "mental";
  /** Peso base na media simples (o peso real depende da posicao). */
  pesoBase: number;
}

/** Atributo exclusivo de goleiro (10 no total). */
export interface DefinicaoAtributoGoleiro {
  id: string;
  rotulo: string;
}

/** Os 36 atributos de linha, na ordem de `ATRIBUTOS.md` secao 2. */
export const ATRIBUTOS_LINHA: readonly DefinicaoAtributo[] = [
  // Tecnica e construcao de jogada (12)
  { id: "finishing", rotulo: "Finalizacao", grupo: "tecnica", pesoBase: 1.0 },
  { id: "longShots", rotulo: "Chutes de longe", grupo: "tecnica", pesoBase: 0.75 },
  { id: "passing", rotulo: "Passe", grupo: "tecnica", pesoBase: 1.0 },
  { id: "vision", rotulo: "Visao de jogo", grupo: "tecnica", pesoBase: 1.0 },
  { id: "crossing", rotulo: "Cruzamento", grupo: "tecnica", pesoBase: 0.75 },
  { id: "dribbling", rotulo: "Drible", grupo: "tecnica", pesoBase: 1.0 },
  { id: "ballControl", rotulo: "Controle de bola", grupo: "tecnica", pesoBase: 1.0 },
  { id: "firstTouch", rotulo: "Primeiro toque", grupo: "tecnica", pesoBase: 0.75 },
  { id: "technique", rotulo: "Tecnica", grupo: "tecnica", pesoBase: 0.75 },
  { id: "heading", rotulo: "Cabecalho", grupo: "tecnica", pesoBase: 0.75 },
  { id: "flair", rotulo: "Criatividade", grupo: "tecnica", pesoBase: 0.75 },
  { id: "longPassing", rotulo: "Passe longo", grupo: "tecnica", pesoBase: 0.5 },
  // Defesa (9)
  { id: "tackling", rotulo: "Desarme", grupo: "defesa", pesoBase: 1.0 },
  { id: "marking", rotulo: "Marcacao", grupo: "defesa", pesoBase: 1.0 },
  { id: "anticipation", rotulo: "Antecipacao", grupo: "defesa", pesoBase: 0.75 },
  { id: "positioning", rotulo: "Posicionamento", grupo: "defesa", pesoBase: 0.75 },
  { id: "strength", rotulo: "Forca", grupo: "defesa", pesoBase: 1.0 },
  { id: "jumping", rotulo: "Salto", grupo: "defesa", pesoBase: 0.75 },
  { id: "aggression", rotulo: "Agressividade", grupo: "defesa", pesoBase: 0.5 },
  { id: "workRate", rotulo: "Intensidade", grupo: "defesa", pesoBase: 0.75 },
  { id: "teamWork", rotulo: "Trabalho em equipe", grupo: "defesa", pesoBase: 0.75 },
  // Fisico (8)
  { id: "pace", rotulo: "Velocidade", grupo: "fisico", pesoBase: 1.0 },
  { id: "acceleration", rotulo: "Aceleracao", grupo: "fisico", pesoBase: 1.0 },
  { id: "agility", rotulo: "Agilidade", grupo: "fisico", pesoBase: 0.75 },
  { id: "stamina", rotulo: "Resistencia", grupo: "fisico", pesoBase: 1.0 },
  { id: "balance", rotulo: "Equilibrio", grupo: "fisico", pesoBase: 0.5 },
  { id: "naturalFitness", rotulo: "Condicionamento", grupo: "fisico", pesoBase: 0.5 },
  { id: "injuryProneness", rotulo: "Tendencia a lesoes", grupo: "fisico", pesoBase: 0.25 },
  { id: "recovery", rotulo: "Recuperacao", grupo: "fisico", pesoBase: 0.5 },
  // Mental (7)
  { id: "decisionMaking", rotulo: "Decisao", grupo: "mental", pesoBase: 1.0 },
  { id: "composure", rotulo: "Sangue frio", grupo: "mental", pesoBase: 0.75 },
  { id: "discipline", rotulo: "Disciplina", grupo: "mental", pesoBase: 0.5 },
  { id: "leadership", rotulo: "Lideranca", grupo: "mental", pesoBase: 0.25 },
  { id: "consistency", rotulo: "Consistencia", grupo: "mental", pesoBase: 0.25 },
  { id: "adaptability", rotulo: "Adaptabilidade", grupo: "mental", pesoBase: 0.25 },
  { id: "professionalism", rotulo: "Profissionalismo", grupo: "mental", pesoBase: 0.25 }
] as const;

/** Os 10 atributos de goleiro, na ordem de `ATRIBUTOS.md` secao 3. */
export const ATRIBUTOS_GOLEIRO: readonly DefinicaoAtributoGoleiro[] = [
  { id: "reflexes", rotulo: "Reflexos" },
  { id: "handling", rotulo: "Manuseio" },
  { id: "aerialReach", rotulo: "Alcance aereo" },
  { id: "oneOnOne", rotulo: "Um contra um" },
  { id: "commandOfArea", rotulo: "Dominio da area" },
  { id: "communication", rotulo: "Comunicacao" },
  { id: "punching", rotulo: "Soco" },
  { id: "throwing", rotulo: "Repasse" },
  { id: "kicking", rotulo: "Chute longo" },
  { id: "eccentricity", rotulo: "Extravagancia" }
] as const;

/** Todos os identificadores de atributo (46). */
export const TODOS_OS_ATRIBUTOS: readonly string[] = [
  ...ATRIBUTOS_LINHA.map((a) => a.id),
  ...ATRIBUTOS_GOLEIRO.map((a) => a.id)
] as const;

/** Rotulo de exibicao de um atributo, seja de linha ou de goleiro. */
export function rotuloAtributo(id: string): string {
  const linha = ATRIBUTOS_LINHA.find((a) => a.id === id);
  if (linha) {
    return linha.rotulo;
  }
  const goleiro = ATRIBUTOS_GOLEIRO.find((a) => a.id === id);
  return goleiro ? goleiro.rotulo : id;
}

/** Se o atributo pertence ao conjunto exclusivo de goleiro. */
export function ehAtributoGoleiro(id: string): boolean {
  return ATRIBUTOS_GOLEIRO.some((a) => a.id === id);
}

/**
 * Pesos de overall por posicao, conforme `ATRIBUTOS.md` secao 4.
 * Atributos ausentes da tabela usam o peso base; peso zero e proibido.
 */
const PESOS: Record<GrupoPosicao, Record<string, number>> = {
  GOL: {
    reflexes: 2,
    handling: 2,
    aerialReach: 2,
    oneOnOne: 2,
    commandOfArea: 2,
    communication: 2,
    punching: 2,
    throwing: 2,
    kicking: 2,
    eccentricity: 2,
    decisionMaking: 0.5,
    composure: 0.5,
    agility: 0.5
  },
  ZAG: {
    marking: 2,
    tackling: 2,
    positioning: 2,
    anticipation: 2,
    strength: 2,
    jumping: 2,
    heading: 1.5,
    teamWork: 1.5,
    finishing: 0.1
  },
  LD: {
    crossing: 1.5,
    stamina: 1.5,
    pace: 1.25,
    marking: 1.5,
    tackling: 1.5,
    acceleration: 1.25,
    workRate: 1.25,
    passing: 1
  },
  LE: {
    crossing: 1.5,
    stamina: 1.5,
    pace: 1.25,
    marking: 1.5,
    tackling: 1.5,
    acceleration: 1.25,
    workRate: 1.25,
    passing: 1
  },
  VOL: {
    positioning: 2,
    tackling: 1.75,
    marking: 1.5,
    teamWork: 1.5,
    anticipation: 1.25,
    strength: 1.25,
    stamina: 1.5,
    passing: 1
  },
  MC: {
    passing: 2,
    vision: 2,
    ballControl: 2,
    decisionMaking: 1.5,
    technique: 1.5,
    dribbling: 1.25,
    stamina: 1.25,
    teamWork: 1.25,
    firstTouch: 1
  },
  MEI: {
    passing: 2,
    vision: 2,
    ballControl: 2,
    dribbling: 1.5,
    technique: 1.5,
    decisionMaking: 1.5,
    flair: 1,
    firstTouch: 1,
    longShots: 1,
    pace: 1,
    acceleration: 1,
    agility: 1,
    composure: 1
  },
  MD: {
    dribbling: 1.5,
    pace: 1.5,
    acceleration: 1.5,
    flair: 1.25,
    ballControl: 1.25,
    technique: 1.25,
    finishing: 1,
    crossing: 1,
    agility: 1,
    longShots: 1
  },
  ME: {
    dribbling: 1.5,
    pace: 1.5,
    acceleration: 1.5,
    flair: 1.25,
    ballControl: 1.25,
    technique: 1.25,
    finishing: 1,
    crossing: 1,
    agility: 1,
    longShots: 1
  },
  ATA: {
    finishing: 2.5,
    flair: 1.5,
    pace: 1.25,
    acceleration: 1.25,
    composure: 1.25,
    heading: 1.25,
    strength: 1.25,
    ballControl: 1,
    firstTouch: 1,
    technique: 1,
    vision: 0.75
  },
  SA: {
    finishing: 2,
    flair: 1.5,
    technique: 1.25,
    ballControl: 1.25,
    firstTouch: 1.25,
    pace: 1,
    vision: 1,
    decisionMaking: 1,
    heading: 1
  }
};

/** Tabela de pesos, exportada para os testes de paridade com `ATRIBUTOS.md`. */
export function pesosPorPosicao(): Record<string, Record<string, number>> {
  return PESOS;
}

/**
 * Calcula o overall de um jogador na sua posicao, a partir dos atributos.
 *
 * Regra: overall e a media ponderada dos atributos, arredondada, entre 1 e 20.
 *
 * @param atributos - mapa de atributos do jogador
 * @param posicao - posicao principal do jogador
 * @returns overall inteiro entre 1 e 20
 */
export function calcularOverall(
  atributos: Record<string, number>,
  posicao: Posicao
): number {
  const grupo = posicao as GrupoPosicao;
  const tabela = PESOS[grupo];

  let soma = 0;
  let somaPesos = 0;

  if (posicao === "GOL") {
    // Goleiro usa apenas os 10 atributos proprios mais tres complementares.
    for (const atributo of ATRIBUTOS_GOLEIRO) {
      const valor = atributos[atributo.id] ?? 10;
      const peso = tabela[atributo.id] ?? 1;
      soma += valor * peso;
      somaPesos += peso;
    }
    for (const extra of ["decisionMaking", "composure", "agility"]) {
      const valor = atributos[extra] ?? 10;
      soma += valor * 0.5;
      somaPesos += 0.5;
    }
  } else {
    for (const atributo of ATRIBUTOS_LINHA) {
      if (ehAtributoGoleiro(atributo.id)) {
        continue;
      }
      const valor = atributos[atributo.id] ?? 10;
      const peso = tabela[atributo.id] ?? atributo.pesoBase;
      if (peso <= 0) {
        continue;
      }
      soma += valor * peso;
      somaPesos += peso;
    }
  }

  if (somaPesos === 0) {
    throw new Error(`calcularOverall: nenhum peso valido para posicao ${posicao}`);
  }

  const bruto = soma / somaPesos;
  const limitado = Math.min(20, Math.max(1, bruto));
  return Math.round(limitado);
}

/**
 * Lista de pesos nao positivos por posicao. Deve ser vazia: peso zero e erro de
 * build, conforme a regra 5 das invariantes de `ATRIBUTOS.md`.
 */
export function pesosZeroInvalidos(): string[] {
  const invalidos: string[] = [];
  for (const grupo of Object.keys(PESOS) as GrupoPosicao[]) {
    for (const [atributo, peso] of Object.entries(PESOS[grupo])) {
      if (peso <= 0) {
        invalidos.push(`${grupo}.${atributo}`);
      }
    }
  }
  return invalidos;
}

/** Tipos de evento com quebra automatica da linha (usado pela UI da grade). */
export function ehQuebraAutomatica(id: string): boolean {
  return ATRIBUTOS_LINHA.some((a) => a.id === id);
}