/**
 * Carregamento e validacao dos dados gerados de `LIGAS.md` e `ELENCO.md`.
 *
 * Este modulo e a fronteira entre os documentos de especificacao e o motor:
 * ele valida o JSON na entrada para que um documento mal editado nunca vire um
 * crash no meio da simulacao.
 */

import dadosElenco from "./dados/elencoBase.json";
import dadosLigas from "./dados/ligas.json";
import type { Clube, Liga, Posicao } from "../domain/tipos";
import type { ClubeJson, ElencoBaseJson, LigaJson } from "./dados/tiposDados";

/** Posicoes aceitas pelo gerador. */
export const POSICOES: readonly Posicao[] = [
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
] as const;

/** Todas as posicoes aceitas, em espelho, para exportacao. */
export type PosicaoValida = Posicao;

const ligasBrutas = dadosLigas.ligas as unknown as LigaJson[];
const clubesBrutos = dadosLigas.clubes as unknown as ClubeJson[];
const elencoBase = dadosElenco as unknown as ElencoBaseJson;

/**
 * Converte o JSON cru em entidades de dominio, validando tudo.
 *
 * @throws Error se algum campo obrigatorio estiver invalido
 * @returns ligas e clubes prontos para o gerador de mundo
 */
export function carregarLigasEClubes(): { ligas: Liga[]; clubes: Clube[] } {
  const ligas: Liga[] = ligasBrutas.map((liga) => {
    exigir(liga.id.length >= 2, `liga sem id`);
    exigir(liga.nome.length > 0, `liga ${liga.id} sem nome`);
    return {
      id: liga.id,
      nome: liga.nome,
      nomeCurto: liga.nomeCurto || liga.nome,
      pais: liga.pais,
      codigoPais: liga.id,
      copaNacional: liga.copaNacional,
      continental: liga.continental,
      supercopa: liga.supercopa,
      rodadas: liga.rodadas || 38,
      ativa: liga.ativa !== false
    };
  });

  const clubes: Clube[] = clubesBrutos.map((clube) => {
    exigir(clube.id.length === 6, `clube com id invalido: ${clube.id}`);
    exigir(clube.nome.length > 0, `clube ${clube.id} sem nome`);
    exigir(clube.capacidade > 5000, `clube ${clube.id} com capacidade invalida`);
    exigir(clube.reputacao >= 1 && clube.reputacao <= 100, `clube ${clube.id} reputacao fora de 1-100`);
    exigir(clube.folhaSalarialAlvoCr > 0, `clube ${clube.id} sem folha salarial`);
    exigir(
      /^#[0-9A-F]{6}$/.test(clube.cores.primaria),
      `clube ${clube.id} com cor primaria invalida`
    );
    return {
      id: clube.id,
      nome: clube.nome,
      ligaId: clube.ligaId,
      pais: "",
      codigoPais: clube.ligaId,
      cidade: clube.cidade,
      cores: clube.cores,
      estadio: clube.estadio,
      capacidade: clube.capacidade,
      reputacao: clube.reputacao,
      orcamentoCr: clube.orcamentoCr,
      folhaSalarialAlvoCr: clube.folhaSalarialAlvoCr,
      ambicao: clube.ambicao,
      ...(clube.rivalPrincipal ? { rivalPrincipal: clube.rivalPrincipal } : {})
    };
  });

  const ids = new Set(clubes.map((c) => c.id));
  exigir(ids.size === clubes.length, "ha clubes com id duplicado");

  const idsLiga = new Set(ligas.map((l) => l.id));
  for (const clube of clubes) {
    exigir(idsLiga.has(clube.ligaId), `clube ${clube.id} aponta para liga inexistente ${clube.ligaId}`);
  }

  return { ligas, clubes };
}

/**
 * Devolve o snapshot de jogadores conhecidos por clube.
 *
 * @returns mapa clubeId para lista de { nome, posicao }
 */
export function carregarSnapshot(): Map<string, { nome: string; posicao: Posicao }[]> {
  const porClube = new Map<string, { nome: string; posicao: Posicao }[]>();
  for (const item of elencoBase.snapshot) {
    const posicao = normalizarPosicao(item.posicao);
    if (!posicao) {
      continue;
    }
    const lista = porClube.get(item.clubeId) ?? [];
    lista.push({ nome: item.nome, posicao });
    porClube.set(item.clubeId, lista);
  }
  return porClube;
}

/**
 * Devolve os pools de nomes por codigo de pais.
 *
 * @returns mapa codigoPais para lista de prenomes e sobrenomes
 */
export function carregarPoolsNomes(): Record<string, { primeiros: string[]; sobrenomes: string[] }> {
  return elencoBase.pools;
}

/**
 * Converte um texto de posicao na posicao de dominio.
 *
 * @param texto - posicao em texto ("ATA", "meia", etc.)
 * @returns posicao validada ou `null` se desconhecida
 */
export function normalizarPosicao(texto: string): Posicao | null {
  const limpo = texto.trim().toUpperCase();
  return (POSICOES as readonly string[]).includes(limpo) ? (limpo as Posicao) : null;
}

/** Ids das ligas ativas. */
export function idsLigasAtivas(): string[] {
  return ligasBrutas.filter((l) => l.ativa !== false).map((l) => l.id);
}

/** Ids dos clubes das ligas ativas. */
export function idsClubesAtivos(): string[] {
  const ativas = new Set(idsLigasAtivas());
  return clubesBrutos.filter((c) => ativas.has(c.ligaId)).map((c) => c.id);
}

function exigir(condicao: boolean, mensagem: string): asserts condicao {
  if (!condicao) {
    throw new Error(`carregarDados: ${mensagem}. Rode "npm run gerar:dados".`);
  }
}

export type { Clube, Liga, ClubeJson, LigaJson, ElencoBaseJson };