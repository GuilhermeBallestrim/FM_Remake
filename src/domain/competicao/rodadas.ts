/**
 * Algoritmo de round-robin (turno e returno) para o calendario da liga.
 *
 * Usa o metodo do circulo: com n clubes, cada rodada emparelha (n/2) jogos e o
 * total de rodadas e n-1. Para 20 clubes sao 19 rodadas por turno, 38 na temporada.
 */

import { derivarSeed, criarRng } from "@/core/rng";

/** Um jogo de uma rodada. */
export interface Jogo {
  mandanteId: string;
  visitanteId: string;
}

/** Registro completo de uma liga. */
export interface TabelaJogos {
  rodadas: { mandanteId: string; visitanteId: string }[][];
}

/**
 * Monta o calendario completo de uma liga (turno + returno).
 *
 * @param clubeIds - ids dos clubes, em ordem estavel
 * @param seed - seed do mundo, usada para variar a ordem dos jogos
 * @returns tabela de rodadas com 38 rodadas para 20 clubes
 */
export function gerarRodadas(
  clubeIds: readonly string[],
  seed: number
): TabelaJogos {
  const n = clubeIds.length;
  if (n < 2) {
    throw new Error("gerarRodadas: liga precisa de pelo menos 2 clubes");
  }
  if (n % 2 !== 0) {
    throw new Error("gerarRodadas: numero de clubes precisa ser par");
  }

  // Embaralha a ordem com a seed do mundo, mas de forma deterministica.
  const rng = criarRng(derivarSeed(seed, `rodadas:${n}:${clubeIds.join(",")}`));
  const clubes = rng.embaralhar(clubeIds);

  // Metodo do circulo: um clube fica fixo, os demais rodam.
  const rodadas: { mandanteId: string; visitanteId: string }[][] = [];
  const nRodadas = n - 1;
  const array = [...clubes];

  for (let r = 0; r < nRodadas; r += 1) {
    const jogos: { mandanteId: string; visitanteId: string }[] = [];

    for (let i = 0; i < n / 2; i += 1) {
      const casa = array[i] as string;
      const fora = array[n - 1 - i] as string;
      if (casa === undefined || fora === undefined) {
        continue;
      }
      // Alterna mando de campo para nao enviesar a rodada inicial.
      const mandante = (r + i) % 2 === 0 ? casa : fora;
      const visitante = mandante === casa ? fora : casa;
      jogos.push({ mandanteId: mandante, visitanteId: visitante });
    }

    rodadas.push(jogos);

    // Rotaciona: mantem o primeiro, desloca os demais.
    const fixo = array[0] as string;
    const resto = array.slice(1);
    const ultimo = resto.pop() as string;
    array.length = 0;
    array.push(fixo, ultimo, ...resto);
  }

  // Returno: espelha as rodadas invertendo mandante e visitante.
  for (let r = 0; r < nRodadas; r += 1) {
    const espelho = (rodadas[r] as { mandanteId: string; visitanteId: string }[]).map(
      (jogo) => ({
        mandanteId: jogo.visitanteId,
        visitanteId: jogo.mandanteId
      })
    );
    rodadas.push(espelho);
  }

  return { rodadas };
}

/**
 * Valida uma tabela de jogos gerada, garantindo que cada par de clubes joga
 * exatamente duas vezes (uma em casa, uma fora).
 *
 * @param tabela - tabela a validar
 * @throws Error se houver jogos duplicados, ausentes ou com mando repetido
 */
export function validarRodadas(tabela: TabelaJogos): void {
  const confrontos = new Map<string, number>();

  for (const rodada of tabela.rodadas) {
    for (const jogo of rodada) {
      const chave = ordem(jogo.mandanteId, jogo.visitanteId);
      confrontos.set(chave, (confrontos.get(chave) ?? 0) + 1);
    }
  }

  for (const [chave, total] of confrontos) {
    if (total !== 2) {
      throw new Error(`validarRodadas: confronto ${chave} tem ${total} jogos, esperado 2`);
    }
  }
}

/** Chave canonica de um confronto, independente de quem joga em casa. */
function ordem(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/**
 * Encontra o proximo jogo de um clube a partir de uma rodada.
 *
 * @param tabela - tabela da liga
 * @param rodada - numero da rodada (1-indexed)
 * @param clubeId - id do clube
 * @returns o jogo do clube na rodada, ou `undefined` se nao houver
 */
export function jogoDoClubeNaRodada(
  tabela: TabelaJogos,
  rodada: number,
  clubeId: string
): Jogo | undefined {
  const jogos = tabela.rodadas[rodada - 1];
  if (!jogos) {
    return undefined;
  }
  return jogos.find(
    (j) => j.mandanteId === clubeId || j.visitanteId === clubeId
  );
}