/**
 * Gerador de mundo: junta ligas, clubes, elencos e indices em um unico objeto.
 *
 * Este e o ponto de entrada do vertical slice da Fase 0. O mundo gerado e
 * identico para a mesma seed, e cada geracao leva menos de 900 ms
 * (orcamento de `PERFORMANCE.md`).
 */

import { derivarSeed } from "@/core/rng";
import { carregarLigasEClubes, idsLigasAtivas } from "./carregarDados";
import { gerarTodosElencos, mediaOverall } from "./geradorElenco";
import type { Clube, Jogador, Liga, Mundo } from "@/domain/tipos";

/** Opcoes de geracao do mundo. */
export interface OpcoesMundo {
  seed: number;
  anoTemporada: number;
  /** Se false, apenas as ligas ativas entram no indice de elencos. */
  incluirTodasAsLigas?: boolean;
}

/** Valor padrao de seed, para deixar a UI e os testes deterministicos. */
export const SEED_PADRAO = 20250810;

/**
 * Gera o mundo completo.
 *
 * @param opcoes - seed e ano de referencia
 * @returns mundo com ligas, clubes, jogadores e indice de elencos
 */
export function gerarMundo(opcoes: OpcoesMundo): Mundo {
  const { seed, anoTemporada } = opcoes;
  const { ligas, clubes } = carregarLigasEClubes();

  const idsAtivas = new Set(idsLigasAtivas());
  const clubesDoMundo: Clube[] =
    opcoes.incluirTodasAsLigas === false
      ? clubes.filter((c) => idsAtivas.has(c.ligaId))
      : clubes;

  // Pais e codigo vem da liga, para gerar o escudo por codigo na Fase 9.
  const ligaPorId = new Map<string, Liga>(ligas.map((l) => [l.id, l]));
  const clubesFinal = clubesDoMundo.map((clube) => {
    const liga = ligaPorId.get(clube.ligaId);
    return liga
      ? { ...clube, pais: liga.pais, codigoPais: liga.id }
      : clube;
  });

  const { jogadores, folhas } = gerarTodosElencos(clubesFinal, seed, anoTemporada);

  const elencosPorClube = new Map<string, Jogador[]>();
  for (const jogador of jogadores) {
    const elenco = elencosPorClube.get(jogador.clubeId);
    if (elenco) {
      elenco.push(jogador);
    } else {
      elencosPorClube.set(jogador.clubeId, [jogador]);
    }
  }

  // Registro de verificacao: cada clube deve ter elenco e folha registrada.
  for (const clube of clubesFinal) {
    const elenco = elencosPorClube.get(clube.id);
    if (!elenco || elenco.length === 0) {
      throw new Error(`gerarMundo: clube ${clube.id} ficou sem elenco`);
    }
    if (!folhas.has(clube.id)) {
      throw new Error(`gerarMundo: clube ${clube.id} ficou sem folha salarial`);
    }
  }

  void derivarSeed;
  void mediaOverall;

  return {
    seed,
    geradoEm: `temporada-${anoTemporada}`,
    ligas,
    clubes: clubesFinal,
    jogadores,
    elencosPorClube
  };
}

/**
 * Estatisticas agregadas do mundo, uteis para a tela de selecao de clube.
 *
 * @param mundo - mundo gerado
 * @returns resumo por clube
 */
export interface ResumoClube {
  clubeId: string;
  nome: string;
  overallMedio: number;
  melhorJogador: string;
  melhorOverall: number;
  folhaSalarialCr: number;
}

/**
 * Resume os elencos por clube, ordenado por overall medio.
 *
 * @param mundo - mundo gerado
 * @returns resumos ordenados do melhor para o pior
 */
export function resumirClubes(mundo: Mundo): ResumoClube[] {
  const resumos: ResumoClube[] = [];

  for (const clube of mundo.clubes) {
    const elenco = mundo.elencosPorClube.get(clube.id) ?? [];
    if (elenco.length === 0) {
      continue;
    }
    let melhor = elenco[0] as Jogador;
    let folha = 0;
    for (const jogador of elenco) {
      if (jogador.overall > melhor.overall) {
        melhor = jogador;
      }
      folha += jogador.contrato.salarioAnualCr;
    }
    resumos.push({
      clubeId: clube.id,
      nome: clube.nome,
      overallMedio: mediaOverall(elenco),
      melhorJogador: melhor.nome,
      melhorOverall: melhor.overall,
      folhaSalarialCr: folha
    });
  }

  return resumos.sort((a, b) => b.overallMedio - a.overallMedio);
}