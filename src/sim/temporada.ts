/**
 * Simulador de temporada: junta calendario, partidas e classificacao.
 *
 * Apos `simularRodada` e `simularTemporada`, o chamador tem uma temporada
 * completa: resultados, classificacao, artilharia e desempenho por clube. Tudo
 * deterministico a partir da seed do mundo.
 */

import { calendarioTemporada, formatarIso, paraDiaNumero } from "@/core/calendario";
import { classificacaoComNomes } from "@/domain/competicao/classificacao";
import { gerarRodadas, jogoDoClubeNaRodada } from "@/domain/competicao/rodadas";
import { montarEquipes, simularPartida } from "@/sim/partida";
import type {
  Jogador,
  LinhaClassificacao,
  Mundo,
  ResultadoPartida,
  TipoGol
} from "@/domain/tipos";

/** Estado de uma liga em uma temporada. */
export interface EstadoLiga {
  ligaId: string;
  clubeIds: string[];
  rodadas: { mandanteId: string; visitanteId: string }[][];
  datas: string[];
  resultados: ResultadoPartida[];
  rodadaAtual: number;
}

/** Estatisticas consolidadas de um jogador na temporada. */
export interface EstatisticasJogador {
  jogadorId: string;
  clubeId: string;
  jogos: number;
  gols: number;
  assistencias: number;
  amarelos: number;
  mediaNota: number;
}

/** Artilharia de uma liga. */
export interface LinhaArtilharia {
  jogadorId: string;
  nome: string;
  clubeId: string;
  gols: number;
}

/** Resultado completo de uma temporada simulada. */
export interface TemporadaSimulada {
  estado: EstadoLiga;
  classificacao: LinhaClassificacao[];
  artilharia: LinhaArtilharia[];
  estatisticas: EstatisticasJogador[];
  totalGols: number;
  mediaGolsPorJogo: number;
}

/**
 * Prepara o estado de uma liga para uma temporada.
 *
 * @param mundo - mundo gerado
 * @param ligaId - id da liga (ENG, ESP, ITA, BRA)
 * @param anoTemporada - ano de inicio da temporada
 * @returns estado pronto para simular
 */
export function prepararLiga(
  mundo: Mundo,
  ligaId: string,
  anoTemporada: number
): EstadoLiga {
  const clubesDaLiga = mundo.clubes.filter((c) => c.ligaId === ligaId);
  if (clubesDaLiga.length < 2) {
    throw new Error(`prepararLiga: liga ${ligaId} tem menos de 2 clubes`);
  }

  const clubeIds = clubesDaLiga.map((c) => c.id);
  const { rodadas } = gerarRodadas(clubeIds, mundo.seed + anoTemporada);
  const dias = calendarioTemporada(anoTemporada, rodadas.length);
  const datas = dias.map(formatarIso);

  return {
    ligaId,
    clubeIds,
    rodadas,
    datas,
    resultados: [],
    rodadaAtual: 1
  };
}

/**
 * Simula uma rodada inteira de uma liga.
 *
 * @param estado - estado mutavel da liga (os resultados sao acrescentados)
 * @param mundo - mundo gerado, para buscar os elencos
 * @param seasonSeed - seed da temporada
 * @returns os resultados da rodada
 */
export function simularRodada(
  estado: EstadoLiga,
  mundo: Mundo,
  seasonSeed: number
): ResultadoPartida[] {
  const numero = estado.rodadaAtual;
  const jogos = estado.rodadas[numero - 1];
  if (!jogos) {
    return [];
  }

  const data = estado.datas[numero - 1] ?? formatarIso(paraDiaNumero({ ano: 2025, mes: 8, dia: 9 }));
  const novos: ResultadoPartida[] = [];

  for (const jogo of jogos) {
    const elencoMandante = mundo.elencosPorClube.get(jogo.mandanteId) ?? [];
    const elencoVisitante = mundo.elencosPorClube.get(jogo.visitanteId) ?? [];
    if (elencoMandante.length === 0 || elencoVisitante.length === 0) {
      continue;
    }

    const equipes = montarEquipes(
      { clubeId: jogo.mandanteId, elenco: elencoMandante },
      { clubeId: jogo.visitanteId, elenco: elencoVisitante }
    );

    const partida = simularPartida(equipes.mandante, equipes.visitante, seasonSeed, numero);

    const resultado: ResultadoPartida = {
      rodada: numero,
      data,
      mandanteId: jogo.mandanteId,
      visitanteId: jogo.visitanteId,
      golsMandante: partida.golsMandante,
      golsVisitante: partida.golsVisitante,
      gols: partida.gols,
      cartoes: partida.cartoes
    };

    novos.push(resultado);
    estado.resultados.push(resultado);
  }

  estado.rodadaAtual = numero + 1;
  return novos;
}

/**
 * Simula a temporada inteira de uma liga, do inicio ao fim.
 *
 * @param mundo - mundo gerado
 * @param ligaId - liga a simular
 * @param anoTemporada - ano de inicio
 * @returns temporada completa com classificacao e artilharia
 */
export function simularTemporada(
  mundo: Mundo,
  ligaId: string,
  anoTemporada: number
): TemporadaSimulada {
  const estado = prepararLiga(mundo, ligaId, anoTemporada);
  const seasonSeed = mundo.seed + anoTemporada;

  while (estado.rodadaAtual <= estado.rodadas.length) {
    simularRodada(estado, mundo, seasonSeed);
  }

  const nomePorClube = new Map(mundo.clubes.map((c) => [c.id, c.nome]));
  const classificacao = classificacaoComNomes(estado.clubeIds, nomePorClube, estado.resultados);

  const nomePorJogador = new Map<string, Jogador>(mundo.jogadores.map((j) => [j.id, j]));
  const estatisticas = calcularEstatisticas(estado.resultados, nomePorJogador);
  const artilharia = calcularArtilharia(estado.resultados, nomePorJogador);

  const totalGols = estado.resultados.reduce(
    (soma, r) => soma + r.golsMandante + r.golsVisitante,
    0
  );
  const mediaGolsPorJogo =
    estado.resultados.length > 0
      ? Number((totalGols / estado.resultados.length).toFixed(2))
      : 0;

  return {
    estado,
    classificacao,
    artilharia,
    estatisticas,
    totalGols,
    mediaGolsPorJogo
  };
}

/** Calcula gols, assistencias, amarelos e nota media por jogador. */
function calcularEstatisticas(
  resultados: readonly ResultadoPartida[],
  nomePorJogador: ReadonlyMap<string, Jogador>
): EstatisticasJogador[] {
  const mapa = new Map<string, EstatisticasJogador>();

  const garantir = (jogadorId: string, clubeId: string): EstatisticasJogador => {
    let linha = mapa.get(jogadorId);
    if (!linha) {
      linha = {
        jogadorId,
        clubeId,
        jogos: 0,
        gols: 0,
        assistencias: 0,
        amarelos: 0,
        mediaNota: 6.0
      };
      mapa.set(jogadorId, linha);
    }
    return linha;
  };

  for (const resultado of resultados) {
    const golsCasa = resultado.gols.filter((g) => g.clubeId === resultado.mandanteId);
    const golsFora = resultado.gols.filter((g) => g.clubeId === resultado.visitanteId);

    for (const gol of resultado.gols) {
      garantir(gol.jogadorId, gol.clubeId).gols += 1;
      if (gol.assistenciaId) {
        garantir(gol.assistenciaId, gol.clubeId).assistencias += 1;
      }
    }

    for (const cartao of resultado.cartoes) {
      const linha = garantir(cartao.jogadorId, cartao.clubeId);
      if (cartao.cor === "amarelo") {
        linha.amarelos += 1;
      }
    }

    // Nota por participacao: quem golou ou assistediu sobe; quem perdeu gol cai.
    const distribuirNota = (
      clubeId: string,
      participacoes: readonly { jogadorId: string }[]
    ): void => {
      for (const participacao of participacoes) {
        const linha = garantir(participacao.jogadorId, clubeId);
        linha.jogos += 1;
        linha.mediaNota += (Math.random() * 0 + notaBase(participacao.jogadorId, golsCasa, golsFora)) / 100;
      }
    };

    distribuirNota(resultado.mandanteId, golsCasa);
    distribuirNota(resultado.visitanteId, golsFora);
  }

  // Nota media final: base 6.0 ajustada por gols, assistencias e cartoes.
  const saida: EstatisticasJogador[] = [];
  for (const linha of mapa.values()) {
    const nota = limitarNota(
      6.0 + linha.gols * 0.35 + linha.assistencias * 0.2 - linha.amarelos * 0.12
    );
    saida.push({ ...linha, mediaNota: nota });
  }

  return saida.sort((a, b) => b.gols - a.gols || a.jogadorId.localeCompare(b.jogadorId));
  void nomePorJogador;
}

/** Nota base de um jogador num jogo (usada para ajustar a media). */
function notaBase(_jogadorId: string, golsCasa: readonly unknown[], golsFora: readonly unknown[]): number {
  // Gol do jogador entra em conta: mais gol, mais nota.
  return golsCasa.length + golsFora.length > 0 ? 20 : 0;
}

/** Limita a nota entre 1 e 10. */
function limitarNota(nota: number): number {
  return Number(Math.min(10, Math.max(1, nota)).toFixed(1));
}

/** Monta a artilharia ordenada por gols. */
function calcularArtilharia(
  resultados: readonly ResultadoPartida[],
  nomePorJogador: ReadonlyMap<string, Jogador>
): LinhaArtilharia[] {
  const golsPorJogador = new Map<string, { clubeId: string; gols: number }>();

  for (const resultado of resultados) {
    for (const gol of resultado.gols) {
      const linha = golsPorJogador.get(gol.jogadorId);
      if (linha) {
        linha.gols += 1;
      } else {
        golsPorJogador.set(gol.jogadorId, { clubeId: gol.clubeId, gols: 1 });
      }
    }
  }

  const linhas: LinhaArtilharia[] = [];
  for (const [jogadorId, info] of golsPorJogador) {
    const jogador = nomePorJogador.get(jogadorId);
    if (!jogador) {
      continue;
    }
    linhas.push({
      jogadorId,
      nome: jogador.nome,
      clubeId: info.clubeId,
      gols: info.gols
    });
  }

  return linhas.sort((a, b) => b.gols - a.gols || a.jogadorId.localeCompare(b.jogadorId));
}

/**
 * Encontra o proximo jogo de um clube a partir do estado atual da liga.
 *
 * @param estado - estado da liga
 * @param clubeId - clube do jogador
 * @returns rodada e jogo, ou `undefined` se a liga acabou
 */
export function proximoJogo(
  estado: EstadoLiga,
  clubeId: string
): { rodada: number; mandanteId: string; visitanteId: string; data: string } | undefined {
  for (let rodada = estado.rodadaAtual; rodada <= estado.rodadas.length; rodada += 1) {
    const jogo = jogoDoClubeNaRodada(
      { rodadas: estado.rodadas },
      rodada,
      clubeId
    );
    if (jogo) {
      return { rodada, ...jogo, data: estado.datas[rodada - 1] ?? "" };
    }
  }
  return undefined;
}

/** Exporta o tipo de gol usado no filtro, util para relatorios. */
export type { TipoGol };