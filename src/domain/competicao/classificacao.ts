/**
 * Tabela de classificacao e regras de desempate.
 *
 * Ordem oficial: pontos, saldo de gols, gols marcados e, por fim, confronto
 * direto. Se tudo empatar, a ordem alfabetica do nome do clube decide, para que
 * o resultado seja deterministico.
 */

import type { LinhaClassificacao, ResultadoPartida } from "../tipos";

/** Pontos por resultado, conforme regra das tres pontos. */
export const PONTOS_VITORIA = 3;
export const PONTOS_EMPATE = 1;
export const PONTOS_DERROTA = 0;

/** Acumulador de uma linha da tabela. */
interface Acumulador {
  clubeId: string;
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
}

/**
 * Calcula a classificacao de uma liga a partir dos resultados.
 *
 * @param clubeIds - ids dos clubes da liga
 * @param resultados - todos os resultados ja disputados
 * @returns linhas ordenadas da primeira a ultima posicao
 */
export function calcularClassificacao(
  clubeIds: readonly string[],
  resultados: readonly ResultadoPartida[]
): LinhaClassificacao[] {
  const acumulado = new Map<string, Acumulador>();

  for (const id of clubeIds) {
    acumulado.set(id, {
      clubeId: id,
      pontos: 0,
      jogos: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      golsPro: 0,
      golsContra: 0
    });
  }

  for (const resultado of resultados) {
    const casa = acumulado.get(resultado.mandanteId);
    const fora = acumulado.get(resultado.visitanteId);
    if (!casa || !fora) {
      continue;
    }

    casa.jogos += 1;
    fora.jogos += 1;
    casa.golsPro += resultado.golsMandante;
    casa.golsContra += resultado.golsVisitante;
    fora.golsPro += resultado.golsVisitante;
    fora.golsContra += resultado.golsMandante;

    if (resultado.golsMandante > resultado.golsVisitante) {
      casa.vitorias += 1;
      casa.pontos += PONTOS_VITORIA;
      fora.derrotas += 1;
      fora.pontos += PONTOS_DERROTA;
    } else if (resultado.golsMandante < resultado.golsVisitante) {
      fora.vitorias += 1;
      fora.pontos += PONTOS_VITORIA;
      casa.derrotas += 1;
      casa.pontos += PONTOS_DERROTA;
    } else {
      casa.empates += 1;
      fora.empates += 1;
      casa.pontos += PONTOS_EMPATE;
      fora.pontos += PONTOS_EMPATE;
    }
  }

  const linhas: Omit<LinhaClassificacao, "nome" | "saldo" | "posicao">[] = [...acumulado.values()].map(
    (linha) => ({
      clubeId: linha.clubeId,
      pontos: linha.pontos,
      jogos: linha.jogos,
      vitorias: linha.vitorias,
      empates: linha.empates,
      derrotas: linha.derrotas,
      golsPro: linha.golsPro,
      golsContra: linha.golsContra
    })
  );

  return ordenarClassificacao(linhas);
}

/**
 * Ordena linhas de classificacao aplicando os criterios oficiais.
 *
 * @param linhas - linhas sem nome, saldo e posicao
 * @returns linhas completas e ordenadas
 */
export function ordenarClassificacao(
  linhas: readonly Omit<LinhaClassificacao, "nome" | "saldo" | "posicao">[]
): LinhaClassificacao[] {
  const completas = linhas.map((linha) => ({
    ...linha,
    nome: linha.clubeId,
    saldo: linha.golsPro - linha.golsContra
  }));

  completas.sort((a, b) => {
    if (a.pontos !== b.pontos) {
      return b.pontos - a.pontos;
    }
    if (a.saldo !== b.saldo) {
      return b.saldo - a.saldo;
    }
    if (a.golsPro !== b.golsPro) {
      return b.golsPro - a.golsPro;
    }
    // Empate total: ordem alfabetica estavel, para desempate deterministico.
    return a.clubeId < b.clubeId ? -1 : a.clubeId > b.clubeId ? 1 : 0;
  });

  return completas.map((linha, indice) => ({
    ...linha,
    posicao: indice + 1
  }));
}

/**
 * Calcula a classificacao de uma temporada inteira e define a posicao dos clubes.
 *
 * @param clubeIds - ids dos clubes
 * @param nomePorClube - mapa id para nome, usado na exibicao
 * @param resultados - resultados da temporada
 * @returns classificacao com nomes
 */
export function classificacaoComNomes(
  clubeIds: readonly string[],
  nomePorClube: ReadonlyMap<string, string>,
  resultados: readonly ResultadoPartida[]
): LinhaClassificacao[] {
  const base = calcularClassificacao(clubeIds, resultados);
  return base.map((linha) => ({
    ...linha,
    nome: nomePorClube.get(linha.clubeId) ?? linha.clubeId
  }));
}

/**
 * Cria um mapa de nome por clube a partir de uma lista.
 *
 * @param clubes - clubes com id e nome
 * @returns mapa id para nome
 */
export function mapaNomes(
  clubes: readonly { id: string; nome: string }[]
): Map<string, string> {
  return new Map(clubes.map((c) => [c.id, c.nome]));
}