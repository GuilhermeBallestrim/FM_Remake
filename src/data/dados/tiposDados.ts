/**
 * Tipos dos arquivos JSON gerados por `tools/gerarDados.ts`.
 *
 * Este arquivo NAO e editado a mao: ele documenta o formato que o gerador le.
 */

/** Cores de um clube em hexadecimal. */
export interface CoresJson {
  primaria: string;
  secundaria: string;
}

/** Clube serializado. */
export interface ClubeJson {
  id: string;
  nome: string;
  ligaId: string;
  cidade: string;
  cores: CoresJson;
  estadio: string;
  capacidade: number;
  reputacao: number;
  orcamentoCr: number;
  folhaSalarialAlvoCr: number;
  ambicao: number;
  rivalPrincipal?: string;
}

/** Liga serializada. */
export interface LigaJson {
  id: string;
  nome: string;
  nomeCurto: string;
  pais: string;
  copaNacional: string;
  continental: string;
  supercopa: string;
  rodadas: number;
  ativa: boolean;
}

/** Jogador do snapshot de referencia (nome e posicao apenas). */
export interface JogadorSnapshotJson {
  clubeId: string;
  nome: string;
  posicao: string;
}

/** Pool de nomes de um pais. */
export interface PoolJson {
  primeiros: string[];
  sobrenomes: string[];
}

/** Conteudo de `ligas.json`. */
export interface LigasJson {
  ligas: LigaJson[];
  clubes: ClubeJson[];
}

/** Conteudo de `elencoBase.json`. */
export interface ElencoBaseJson {
  snapshot: JogadorSnapshotJson[];
  pools: Record<string, PoolJson>;
}