/**
 * Motor de partida da Fase 0.
 *
 * IMPORTANTE: esta e uma versao estatistica simplificada. O motor completo por
 * minuto com posse, gatilhos, xG e eventos esta na Fase 1 (ver `ROTEIRO_FASES.md`).
 * Aqui o objetivo e unico: gerar um resultado coerente com a diferenca de overall,
 * rapido o suficiente para simular temporadas inteiras em menos de 2 segundos.
 *
 * O determinismo vem do RNG com seed derivado do par de clubes e da rodada.
 */

import { criarRng, derivarSeed } from "@/core/rng";
import type { Cartao, Gol, Jogador, TipoGol } from "@/domain/tipos";

/** Equipe com os 11 iniciais, usado na simulacao. */
export interface EquipeSimulada {
  clubeId: string;
  onze: Jogador[];
  forcaAtaque: number;
  forcaDefesa: number;
  forcaGoleiro: number;
}

/** Resultado completo de uma partida simulada. */
export interface PartidaSimulada {
  golsMandante: number;
  golsVisitante: number;
  gols: Gol[];
  cartoes: Cartao[];
  /** Gols esperado (xG) de cada lado, para a tela pos-jogo. */
  xgMandante: number;
  xgVisitante: number;
}

/** Fator de mando de campo: jogar em casa vale cerca de 8% de overall. */
const VANTAGEM_CASA = 0.08;

/** Gol esperado base por partida, antes de ajustes. */
const XG_BASE = 1.35;

/**
 * Monta o XI mais forte de um elenco, com regras simples de posicao.
 *
 * @param elenco - elenco completo do clube
 * @returns onze inicial com forcas calculadas
 */
export function montarXI(elenco: readonly Jogador[]): Jogador[] {
  if (elenco.length === 0) {
    return [];
  }

  const ordenados = [...elenco].sort((a, b) => {
    if (b.overall !== a.overall) {
      return b.overall - a.overall;
    }
    return a.nome.localeCompare(b.nome, "pt-BR");
  });

  const goleiros = ordenados.filter((j) => j.posicao === "GOL");
  const defesa = ordenados.filter((j) => j.posicao === "ZAG");
  const laterais = ordenados.filter((j) => j.posicao === "LD" || j.posicao === "LE");
  const volantes = ordenados.filter((j) => j.posicao === "VOL");
  const meias = ordenados.filter((j) => j.posicao === "MC" || j.posicao === "MEI");
  meias.sort((a, b) => b.atributos.passing - a.atributos.passing);
  const pontas = ordenados.filter((j) => j.posicao === "MD" || j.posicao === "ME");
  const atacantes = ordenados.filter((j) => j.posicao === "ATA" || j.posicao === "SA");
  atacantes.sort((a, b) => b.atributos.finishing - a.atributos.finishing);

  const onze: Jogador[] = [];

  const pegar = <T extends Jogador>(lista: readonly T[]): T | undefined => lista.shift();

  onze.push(pegar(goleiros) as Jogador);
  onze.push(pegar(defesa) as Jogador, pegar(defesa) as Jogador, pegar(defesa) as Jogador);
  onze.push(peger(laterais) as Jogador, pegar(laterais) as Jogador);
  onze.push(pegar(volantes) as Jogador, pegar(volantes) as Jogador);
  onze.push(pegar(meias) as Jogador, pegar(meias) as Jogador, pegar(meias) as Jogador);
  onze.push(pegar(pontas) as Jogador, pegar(pontas) as Jogador);
  onze.push(pegar(atacantes) as Jogador, pegar(atacantes) as Jogador);

  // Completa com os melhores restantes se alguma posicao estiver vazia.
  const restantes = ordenados.filter((j) => !onze.includes(j));
  while (onze.length < 11 && restantes.length > 0) {
    onze.push(restantes.shift() as Jogador);
  }

  return onze.filter((j) => j !== undefined);
}

/**
 * Calcula as forcas de ataque, defesa e goleiro de um XI.
 *
 * @param onze - onze inicial
 * @returns forcas normalizadas
 */
export function calcularForcas(onze: readonly Jogador[]): {
  forcaAtaque: number;
  forcaDefesa: number;
  forcaGoleiro: number;
} {
  if (onze.length === 0) {
    return { forcaAtaque: 0, forcaDefesa: 0, forcaGoleiro: 0 };
  }

  const goleiro = onze.find((j) => j.posicao === "GOL");
  const defesa = onze.filter((j) => j.posicao === "ZAG");
  const laterais = onze.filter((j) => j.posicao === "LD" || j.posicao === "LE");
  const meias = onze.filter(
    (j) => j.posicao === "MC" || j.posicao === "MEI" || j.posicao === "VOL"
  );
  const atacantes = onze.filter(
    (j) => j.posicao === "ATA" || j.posicao === "SA" || j.posicao === "MD" || j.posicao === "ME"
  );

  const media = (lista: readonly Jogador[], atributo: string): number => {
    if (lista.length === 0) {
      return 10;
    }
    const soma = lista.reduce((total, j) => total + (j.atributos[atributo] ?? 10), 0);
    return soma / lista.length;
  };

  const forcaAtaque =
    media(atacantes, "finishing") * 0.4 +
    media(meias, "vision") * 0.3 +
    media(atacantes, "dribbling") * 0.2 +
    media(meias, "passing") * 0.1;

  const forcaDefesa =
    media(defesa, "marking") * 0.35 +
    media(defesa, "tackling") * 0.25 +
    media(defesa, "positioning") * 0.2 +
    media(laterais, "marking") * 0.2;

  const forcaGoleiro =
    (goleiro?.atributos.reflexes ?? 10) * 0.5 +
    (goleiro?.atributos.handling ?? 10) * 0.25 +
    (goleiro?.atributos.commandOfArea ?? 10) * 0.25;

  return { forcaAtaque, forcaDefesa, forcaGoleiro };
}

/** Monta as duas equipes de uma partida. */
export function montarEquipes(
  mandante: { clubeId: string; elenco: readonly Jogador[] },
  visitante: { clubeId: string; elenco: readonly Jogador[] }
): { mandante: EquipeSimulada; visitante: EquipeSimulada } {
  const onzeMandante = montarXI(mandante.elenco);
  const onzeVisitante = montarXI(visitante.elenco);

  return {
    mandante: { clubeId: mandante.clubeId, onze: onzeMandante, ...calcularForcas(onzeMandante) },
    visitante: { clubeId: visitante.clubeId, onze: onzeVisitante, ...calcularForcas(onzeVisitante) }
  };
}

/**
 * Simula uma partida entre duas equipes.
 *
 * @param mandante - equipe da casa
 * @param visitante - equipe visitante
 * @param seedBase - seed do mundo
 * @param rodada - numero da rodada
 * @returns placar, gols, cartoes e xG
 */
export function simularPartida(
  mandante: EquipeSimulada,
  visitante: EquipeSimulada,
  seedBase: number,
  rodada: number
): PartidaSimulada {
  const rng = criarRng(
    derivarSeed(seedBase, `partida:${rodada}:${mandante.clubeId}:${visitante.clubeId}`)
  );

  // Ataque do mandante contra defesa do visitante, e vice-versa.
  const ataqueCasa = mandante.forcaAtaque * (1 + VANTAGEM_CASA);
  const defesaFora = visitante.forcaDefesa * 0.8 + visitante.forcaGoleiro * 0.2;

  const ataqueFora = visitante.forcaAtaque;
  const defesaCasa = mandante.forcaDefesa * 0.8 + mandante.forcaGoleiro * 0.2;

  const diferencaCasa = (ataqueCasa - defesaFora) / 4;
  const diferencaFora = (ataqueFora - defesaCasa) / 4;

  const xgMandante = limitar(XG_BASE + diferencaCasa, 0.2, 4.5);
  const xgVisitante = limitar(XG_BASE + diferencaFora, 0.2, 4.5);

  const golsMandante = rng.poisson(xgMandante);
  const golsVisitante = rng.poisson(xgVisitante);

  const gols: Gol[] = [];
  for (let i = 0; i < golsMandante; i += 1) {
    gols.push(gerarGol(rng, mandante, visitante, true));
  }
  for (let i = 0; i < golsVisitante; i += 1) {
    gols.push(gerarGol(rng, visitante, mandante, false));
  }
  gols.sort((a, b) => a.minuto - b.minuto);

  return {
    golsMandante,
    golsVisitante,
    gols,
    cartoes: gerarCartoes(rng, mandante, visitante),
    xgMandante: Number(xgMandante.toFixed(2)),
    xgVisitante: Number(xgVisitante.toFixed(2))
  };
}

/** Escolhe o autor e a assistencia de um gol. */
function gerarGol(
  rng: ReturnType<typeof criarRng>,
  autorEquipe: EquipeSimulada,
  adversario: EquipeSimulada,
  ehMandante: boolean
): Gol {
  const atacantes = autorEquipe.onze.filter(
    (j) => j.posicao === "ATA" || j.posicao === "SA" || j.posicao === "MD" || j.posicao === "ME"
  );
  const meias = autorEquipe.onze.filter((j) => j.posicao === "MEI" || j.posicao === "MC");
  const candidatos = [...atacantes, ...meias];
  const lista = candidatos.length > 0 ? candidatos : autorEquipe.onze;

  const autor = rng.escolherPonderado(lista, (j) => Math.pow(j.atributos.finishing ?? 10, 1.6));

  const assistentes = autorEquipe.onze.filter(
    (j) => j.id !== autor.id && (j.atributos.passing ?? 10) >= 10
  );
  const assistente =
    assistentes.length > 0 && rng.real() < 0.72
      ? rng.escolherPonderado(assistentes, (j) => Math.pow(j.atributos.vision ?? 10, 1.4))
      : null;

  const tipoGol: TipoGol = sortearTipoGol(rng, autor, ehMandante, adversario);

  return {
    minuto: rng.inteiro(1, 90),
    jogadorId: autor.id,
    clubeId: autorEquipe.clubeId,
    assistenciaId: assistente ? assistente.id : null,
    tipo: tipoGol
  };
}

/** Sorteia o tipo do gol conforme os atributos do autor. */
function sortearTipoGol(
  rng: ReturnType<typeof criarRng>,
  autor: Jogador,
  ehMandante: boolean,
  adversario: EquipeSimulada
): TipoGol {
  const sorteio = rng.real();
  const remateLongo = (autor.atributos.longShots ?? 10) >= 13;
  const cabeceador = (autor.atributos.jumping ?? 10) >= 14;
  const velocidade = (autor.atributos.pace ?? 10) >= 15;
  const defesaFraca = adversario.forcaDefesa < 11;

  if (sorteio < 0.34) {
    return "normal";
  }
  if (sorteio < 0.48 && cabeceador) {
    return "cabecada";
  }
  if (sorteio < 0.62 && remateLongo) {
    return "foraDaArea";
  }
  if (sorteio < 0.74 && velocidade) {
    return "contraAtaque";
  }
  if (sorteio < 0.8 && ehMandante && defesaFraca) {
    return "falta";
  }
  return "normal";
}

/** Gera cartoes amarelos (e vermelhos rarissimos) para as duas equipes. */
function gerarCartoes(
  rng: ReturnType<typeof criarRng>,
  mandante: EquipeSimulada,
  visitante: EquipeSimulada
): Cartao[] {
  const cartoes: Cartao[] = [];

  for (const equipe of [mandante, visitante]) {
    const agressividade = equipe.onze.reduce(
      (total, j) => total + (j.atributos.aggression ?? 10),
      0
    );
    const mediaAgressividade = equipe.onze.length > 0 ? agressividade / equipe.onze.length : 10;
    const quantidade = Math.max(0, rng.poisson(Math.max(0.2, (mediaAgressividade - 6) * 0.22)));

    for (let i = 0; i < quantidade; i += 1) {
      const jogador = rng.escolher(equipe.onze);
      cartoes.push({
        minuto: rng.inteiro(10, 90),
        jogadorId: jogador.id,
        clubeId: equipe.clubeId,
        cor: "amarelo"
      });
    }
  }

  return cartoes.sort((a, b) => a.minuto - b.minuto);
}

/** Limita um valor a um intervalo. */
function limitar(valor: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, valor));
}