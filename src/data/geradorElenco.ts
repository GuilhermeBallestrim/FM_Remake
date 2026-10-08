/**
 * Gerador de elencos: transforma clubes, snapshot e pools de nomes em jogadores.
 *
 * Implementa `ELENCO.md` secoes 3 a 5:
 * - distribuicao de posicoes por clube (minimo, alvo, maximo)
 * - tamanho do elenco pela faixa de reputacao
 * - tier do jogador e derivacao do overall (`ELENCO.md` secao 3)
 * - faixas etarias, potencial, altura e peso
 * - valores de contrato com folha salarial batendo com a alvo do clube
 *
 * Regra: nenhuma alocacao desnecessaria no caminho quente. O gerador roda uma
 * unica vez por save, mas precisa ficar abaixo de 900 ms (ver `PERFORMANCE.md`).
 */

import { criarRng, derivarSeed, type Rng } from "@/core/rng";
import { calcularOverall, ATRIBUTOS_GOLEIRO, ATRIBUTOS_LINHA, pesosPorPosicao } from "@/domain/atributos";
import type { Clube, FaixaReputacao, Jogador, Posicao, TierJogador } from "@/domain/tipos";
import { carregarPoolsNomes, carregarSnapshot, normalizarPosicao } from "./carregarDados";

/** Distribuicao de posicoes por clube: minimo, alvo, maximo (`ELENCO.md` secao 3). */
const DISTRIBUICAO: Record<Posicao, { min: number; alvo: number; max: number }> = {
  GOL: { min: 2, alvo: 3, max: 3 },
  ZAG: { min: 3, alvo: 4, max: 5 },
  LD: { min: 1, alvo: 2, max: 3 },
  LE: { min: 1, alvo: 2, max: 3 },
  VOL: { min: 1, alvo: 2, max: 4 },
  MC: { min: 2, alvo: 3, max: 4 },
  MEI: { min: 1, alvo: 2, max: 3 },
  MD: { min: 0, alvo: 1, max: 2 },
  ME: { min: 0, alvo: 1, max: 2 },
  ATA: { min: 1, alvo: 2, max: 3 },
  SA: { min: 0, alvo: 1, max: 2 }
};

/** Ordem de preenchimento do elenco: goleiros primeiro, ataque por ultimo. */
const ORDEM_POSICOES: readonly Posicao[] = [
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

/** Faixas de reputacao de `ELENCO.md` secao 9. */
const FAIXAS: Record<
  FaixaReputacao,
  { minElenco: number; maxElenco: number; xiMin: number; xiMax: number }
> = {
  elite: { minElenco: 26, maxElenco: 30, xiMin: 14.0, xiMax: 17.5 },
  alto: { minElenco: 24, maxElenco: 27, xiMin: 12.0, xiMax: 14.0 },
  medio: { minElenco: 22, maxElenco: 25, xiMin: 10.0, xiMax: 12.0 },
  baixo: { minElenco: 21, maxElenco: 24, xiMin: 8.5, xiMax: 10.5 },
  minimo: { minElenco: 20, maxElenco: 23, xiMin: 7.0, xiMax: 9.0 }
};

/** Media de overall do XI por tier (`ELENCO.md` secao 3). */
const OVERALL_POR_TIER: Record<TierJogador, [number, number]> = {
  LENDA: [18, 20],
  ELITE: [16, 17.5],
  TITULAR: [14, 16],
  "BOA_PLAÇA": [12, 14],
  RESERVA: [10, 12],
  JOVEM: [8, 11],
  BASE: [5, 8]
};

/** Altura e peso por posicao (`ELENCO.md` secao 7). */
const PORTE: Record<Posicao, { altura: [number, number]; peso: [number, number] }> = {
  GOL: { altura: [185, 197], peso: [80, 94] },
  ZAG: { altura: [182, 197], peso: [78, 94] },
  LD: { altura: [174, 186], peso: [68, 80] },
  LE: { altura: [174, 186], peso: [68, 80] },
  VOL: { altura: [176, 188], peso: [72, 86] },
  MC: { altura: [172, 185], peso: [68, 82] },
  MEI: { altura: [168, 182], peso: [62, 78] },
  MD: { altura: [168, 180], peso: [62, 76] },
  ME: { altura: [168, 180], peso: [62, 76] },
  ATA: { altura: [178, 193], peso: [74, 90] },
  SA: { altura: [175, 188], peso: [70, 85] }
};

/** Faixas etarias com peso de sorteio (`ELENCO.md` secao 5). */
const FAIXAS_ETARIAS: readonly { min: number; max: number; peso: number }[] = [
  { min: 16, max: 19, peso: 0.3 },
  { min: 20, max: 23, peso: 1.4 },
  { min: 24, max: 28, peso: 2.0 },
  { min: 29, max: 32, peso: 1.5 },
  { min: 33, max: 36, peso: 0.9 },
  { min: 37, max: 39, peso: 0.4 }
];

/**
 * Media de atributos por posicao, para os 13 atributos documentados em
 * `ELENCO.md` secao 6. Os atributos restantes sao derivados dos pesos de
 * `ATRIBUTOS.md` (o peso de um atributo na posicao indica a afinidade).
 */
const MEDIA_POSICAO: Partial<Record<Posicao, Record<string, number>>> = {
  GOL: {
    reflexes: 12,
    handling: 12,
    aerialReach: 12,
    oneOnOne: 11,
    commandOfArea: 12,
    communication: 10,
    punching: 11,
    throwing: 10,
    kicking: 11,
    eccentricity: 8,
    vision: 10,
    ballControl: 8,
    passing: 8
  },
  ZAG: {
    finishing: 5,
    passing: 9,
    vision: 9,
    dribbling: 7,
    ballControl: 9,
    tackling: 14,
    marking: 15,
    positioning: 15,
    pace: 10,
    stamina: 12,
    jumping: 15,
    strength: 15
  },
  LD: {
    finishing: 7,
    passing: 12,
    vision: 11,
    dribbling: 11,
    ballControl: 12,
    tackling: 13,
    marking: 13,
    positioning: 12,
    pace: 13,
    stamina: 14,
    jumping: 10,
    strength: 11
  },
  LE: {
    finishing: 7,
    passing: 12,
    vision: 11,
    dribbling: 11,
    ballControl: 12,
    tackling: 13,
    marking: 13,
    positioning: 12,
    pace: 13,
    stamina: 14,
    jumping: 10,
    strength: 11
  },
  VOL: {
    finishing: 7,
    passing: 13,
    vision: 12,
    dribbling: 10,
    ballControl: 12,
    tackling: 14,
    marking: 14,
    positioning: 14,
    pace: 10,
    stamina: 14,
    jumping: 11,
    strength: 14
  },
  MC: {
    finishing: 9,
    passing: 14,
    vision: 13,
    dribbling: 12,
    ballControl: 13,
    tackling: 11,
    marking: 11,
    positioning: 11,
    pace: 11,
    stamina: 13,
    jumping: 10,
    strength: 12
  },
  MEI: {
    finishing: 12,
    passing: 14,
    vision: 15,
    dribbling: 14,
    ballControl: 14,
    tackling: 7,
    marking: 6,
    positioning: 8,
    pace: 11,
    stamina: 12,
    jumping: 9,
    strength: 10
  },
  MD: {
    finishing: 12,
    passing: 13,
    vision: 12,
    dribbling: 15,
    ballControl: 14,
    tackling: 6,
    marking: 5,
    positioning: 7,
    pace: 15,
    stamina: 12,
    jumping: 9,
    strength: 9
  },
  ME: {
    finishing: 12,
    passing: 13,
    vision: 12,
    dribbling: 15,
    ballControl: 14,
    tackling: 6,
    marking: 5,
    positioning: 7,
    pace: 15,
    stamina: 12,
    jumping: 9,
    strength: 9
  },
  ATA: {
    finishing: 15,
    passing: 10,
    vision: 10,
    dribbling: 12,
    ballControl: 13,
    tackling: 5,
    marking: 4,
    positioning: 7,
    pace: 14,
    stamina: 11,
    jumping: 14,
    strength: 13
  },
  SA: {
    finishing: 13,
    passing: 12,
    vision: 12,
    dribbling: 13,
    ballControl: 13,
    tackling: 6,
    marking: 5,
    positioning: 8,
    pace: 13,
    stamina: 12,
    jumping: 12,
    strength: 12
  }
};

/** Media generica por grupo de atributo, quando a posicao nao define. */
const MEDIA_GENERICA = {
  tecnica: 10,
  defesa: 9,
  fisico: 11,
  mental: 11
} as const;

/** Classifica a reputacao do clube na faixa correspondente. */
function faixaDaReputacao(reputacao: number): FaixaReputacao {
  if (reputacao >= 80) {
    return "elite";
  }
  if (reputacao >= 60) {
    return "alto";
  }
  if (reputacao >= 40) {
    return "medio";
  }
  if (reputacao >= 20) {
    return "baixo";
  }
  return "minimo";
}

/**
 * Escolhe o tier de um jogador conforme a reputacao do clube e se ele veio do
 * snapshot de jogadores conhecidos.
 *
 * @param reputacao - reputacao do clube (1 a 100)
 * @param conhecido - se o jogador veio do snapshot
 * @param posicao - posicao do jogador
 * @param destaque - quantos jogadores de primeira linha do clube ja foram usados
 * @returns tier do jogador
 */
function escolherTier(
  reputacao: number,
  conhecido: boolean,
  posicao: Posicao,
  destaque: number,
  r: () => number
): TierJogador {
  const faixa = faixaDaReputacao(reputacao);

  if (posicao === "GOL") {
    return r() < 0.35 ? "ELITE" : "TITULAR";
  }

  if (conhecido) {
    // Os tres primeiros nomes de referencia de cada clube sao os craques dele.
    if (destaque < 3 && faixa === "elite") {
      return destaque < 1 ? "LENDA" : "ELITE";
    }
    if (destaque < 2 && (faixa === "elite" || faixa === "alto")) {
      return destaque < 1 ? "ELITE" : "TITULAR";
    }
    if (destaque < 2) {
      return destaque < 1 ? "TITULAR" : "BOA_PLAÇA";
    }
    return faixa === "minimo" ? "JOVEM" : "BOA_PLAÇA";
  }

  const sorteio = r();
  switch (faixa) {
    case "elite":
      if (sorteio < 0.12) {
        return "ELITE";
      }
      if (sorteio < 0.5) {
        return "TITULAR";
      }
      return "BOA_PLAÇA";
    case "alto":
      if (sorteio < 0.08) {
        return "ELITE";
      }
      if (sorteio < 0.42) {
        return "TITULAR";
      }
      return sorteio < 0.82 ? "BOA_PLAÇA" : "RESERVA";
    case "medio":
      if (sorteio < 0.05) {
        return "TITULAR";
      }
      if (sorteio < 0.4) {
        return "BOA_PLAÇA";
      }
      return sorteio < 0.8 ? "RESERVA" : "JOVEM";
    case "baixo":
      if (sorteio < 0.04) {
        return "BOA_PLAÇA";
      }
      if (sorteio < 0.45) {
        return "RESERVA";
      }
      return "JOVEM";
    default:
      if (sorteio < 0.03) {
        return "RESERVA";
      }
      return "JOVEM";
  }
}

/** Faixa permitida de um atributo dado o overall (`ELENCO.md` secao 8). */
function faixaAtributo(overall: number): [number, number] {
  if (overall <= 6) {
    return [3, 8];
  }
  if (overall <= 9) {
    return [4, 11];
  }
  if (overall <= 12) {
    return [6, 15];
  }
  if (overall <= 15) {
    return [9, 18];
  }
  if (overall <= 17) {
    return [12, 19];
  }
  return [14, 20];
}

/**
 * Gera os atributos de um jogador a partir da posicao e do overall.
 *
 * @param posicao - posicao principal
 * @param overall - overall alvo (1 a 20)
 * @param rng - gerador deterministico
 * @returns mapa de atributos
 */
function gerarAtributos(posicao: Posicao, overall: number, rng: Rng): Record<string, number> {
  const atributos: Record<string, number> = {};
  const base = MEDIA_POSICAO[posicao] ?? {};
  const pesos = pesosPorPosicao();
  const pesosDaPosicao = pesos[posicao] ?? {};

  const distribuir = (id: string, media: number, min: number, max: number): void => {
    const deslocamento = (overall - 10) * 0.85;
    const ruido = rng.realEntre(-1.4, 1.4);
    const valor = Math.round(media + deslocamento + ruido);
    atributos[id] = Math.min(max, Math.max(min, valor));
  };

  if (posicao === "GOL") {
    for (const atributo of ATRIBUTOS_GOLEIRO) {
      const media = base[atributo.id] ?? 11;
      const [min, max] = faixaAtributo(overall);
      distribuir(atributo.id, media, Math.min(min, media), max);
    }
    for (const atributo of ATRIBUTOS_LINHA) {
      if (posicao === "GOL" && ehMentalOuFisico(atributo.grupo)) {
        const [min, max] = faixaAtributo(overall);
        const media = MEDIA_GENERICA[atributo.grupo];
        distribuir(atributo.id, media, Math.min(min, media), max);
      }
    }
    return atributos;
  }

  for (const atributo of ATRIBUTOS_LINHA) {
    const mediaDocumentada = base[atributo.id];
    const [min, max] = faixaAtributo(overall);
    if (mediaDocumentada !== undefined) {
      distribuir(atributo.id, mediaDocumentada, Math.min(min, mediaDocumentada), max);
      continue;
    }
    // Atributo nao documentado: usa a afinidade da posicao (peso no overall).
    const peso = pesosDaPosicao[atributo.id] ?? atributo.pesoBase;
    const afinidade = Math.min(3, peso * 0.8);
    const media = MEDIA_GENERICA[atributo.grupo] + afinidade - 0.8;
    distribuir(atributo.id, media, Math.min(min, Math.round(media)), max);
  }

  return atributos;
}

/** Verdadeiro para grupos que valem a pena gerar tambem em goleiro. */
function ehMentalOuFisico(grupo: string): boolean {
  return grupo === "mental" || grupo === "fisico";
}

/** Idade sorteada conforme as faixas de `ELENCO.md` secao 5. */
function sortearIdade(rng: Rng): number {
  let total = 0;
  for (const faixa of FAIXAS_ETARIAS) {
    total += faixa.peso;
  }
  let alvo = rng.real() * total;
  for (const faixa of FAIXAS_ETARIAS) {
    alvo -= faixa.peso;
    if (alvo <= 0) {
      return rng.inteiro(faixa.min, faixa.max);
    }
  }
  return 26;
}

/** Potencial em funcao da idade e do overall (`ELENCO.md` secao 5). */
function sortearPotencial(idade: number, overall: number, rng: Rng): number {
  if (idade >= 31) {
    return overall;
  }
  if (overall >= 15 && idade <= 23 && rng.real() < 0.6) {
    return Math.min(20, overall + rng.inteiro(2, 4));
  }
  if (idade <= 21 && rng.real() < 0.25) {
    return Math.min(20, overall + rng.inteiro(1, 3));
  }
  if (idade <= 27 && rng.real() < 0.3) {
    return Math.min(20, overall + 1);
  }
  return overall;
}

/** Converte idade e ano de referencia em data de nascimento aproximada. */
function dataNascimento(idade: number, anoTemporada: number, rng: Rng): string {
  const ano = anoTemporada - idade;
  const mes = rng.inteiro(1, 12);
  const dia = rng.inteiro(1, 28);
  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

/** Abrevia um nome para caber na grade e no placar. */
export function abreviarNome(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) {
    return partes[0] as string;
  }
  const primeiro = (partes[0] as string).split("-")[0] as string;
  const ultimo = partes[partes.length - 1] as string;
  return `${primeiro[0]}. ${ultimo}`;
}

/**
 * Gera um nome completo a partir dos pools do pais.
 *
 * @param pais - codigo do pais
 * @param pools - pools de nomes
 * @param rng - gerador deterministico
 * @param usados - conjunto de nomes ja usados no clube
 * @returns nome completo
 */
function gerarNome(
  pais: string,
  pools: Record<string, { primeiros: string[]; sobrenomes: string[] }>,
  rng: Rng,
  usados: Set<string>
): string {
  const pool = pools[pais] ?? pools.ALE;
  if (!pool) {
    return "Jogador Sem Nome";
  }
  for (let tentativa = 0; tentativa < 10; tentativa += 1) {
    const primeiro = rng.escolher(pool.primeiros);
    const sobrenome = rng.escolher(pool.sobrenomes);
    const nome = tentativa < 6 ? `${primeiro} ${sobrenome}` : `${primeiro} ${sobrenome[0]}. ${sobrenome}`;
    if (!usados.has(nome)) {
      usados.add(nome);
      return nome;
    }
  }
  const sufixo = rng.inteiro(2, 99);
  const nome = `${rng.escolher(pool.primeiros)} ${rng.escolher(pool.sobrenomes)} ${sufixo}`;
  usados.add(nome);
  return nome;
}

/** Resultado da geracao de um elenco. */
interface ElencoGerado {
  jogadores: Jogador[];
  folhaSalarialCr: number;
}

/**
 * Gera o elenco completo de um clube.
 *
 * @param clube - clube alvo
 * @param conhecidos - jogadores do snapshot deste clube
 * @param pools - pools de nomes por pais
 * @param seed - seed do mundo
 * @param anoTemporada - ano de referencia para data de nascimento
 * @param idInicial - contador de ids, para garantir unicidade global
 * @returns jogadores gerados e folha salarial
 */
function gerarElencoDe(
  clube: Clube,
  conhecidos: { nome: string; posicao: Posicao }[],
  pools: Record<string, { primeiros: string[]; sobrenomes: string[] }>,
  seed: number,
  anoTemporada: number,
  idInicial: { valor: number }
): ElencoGerado {
  const rng = criarRng(derivarSeed(seed, `elenco:${clube.id}`));
  rngRealInterno = rng.real;

  const faixa = FAIXAS[faixaDaReputacao(clube.reputacao)];
  const tamanho = rng.inteiro(faixa.minElenco, faixa.maxElenco);

  // Quanto mais posicoes tem para preencher, mais gente o clube tem.
  const totalAlvo = ORDEM_POSICOES.reduce(
    (soma, posicao) => soma + rng.inteiro(DISTRIBUICAO[posicao].min, DISTRIBUICAO[posicao].max),
    0
  );
  const fatorTamanho = tamanho / Math.max(1, totalAlvo);

  const usados = new Set<string>();
  const jogadores: Jogador[] = [];
  let destaque = 0;

  // Passa 1: jogadores conhecidos do snapshot (posicao e nomes reais).
  const conhecidosRestantes = [...conhecidos];
  for (const posicao of ORDEM_POSICOES) {
    const alvoAposEscala = Math.max(
      DISTRIBUICAO[posicao].min,
      Math.round(rng.inteiro(DISTRIBUICAO[posicao].min, DISTRIBUICAO[posicao].max) * fatorTamanho)
    );

    for (let i = 0; i < alvoAposEscala; i += 1) {
      const indiceConhecido = conhecidosRestantes.findIndex(
        (c) => c.posicao === posicao && !usados.has(c.nome)
      );
      const conhecido = indiceConhecido >= 0 ? conhecidosRestantes[indiceConhecido] : undefined;
      if (conhecido) {
        usados.add(conhecido.nome);
        conhecidosRestantes.splice(indiceConhecido, 1);
        const idade = sortearIdade(rng);
        const jogador = criarJogador({
          clube,
          posicao,
          nome: conhecido.nome,
          idade,
          anoTemporada,
          rng,
          tier: escolherTier(clube.reputacao, true, posicao, destaque, rng.real),
          idInicial,
          poolPais: clube.ligaId
        });
        destaque += 1;
        jogadores.push(jogador);
        continue;
      }

      const nacionalidade = sorteiarNacionalidade(clube, rng, pools);
      const nome = gerarNome(nacionalidade, pools, rng, usados);
      const idade = sortearIdade(rng);
      const jogador = criarJogador({
        clube,
        posicao,
        nome,
        idade,
        anoTemporada,
        rng,
        tier: escolherTier(clube.reputacao, false, posicao, destaque, rng.real),
        idInicial,
        poolPais: nacionalidade,
        fonte: "gerado"
      });
      jogadores.push(jogador);
    }
  }

  // Passa 2: Known leftover (position not in the rotation) is added to the end.
  for (const restante of conhecidosRestantes) {
    const posicao = normalizarPosicao(restante.posicao);
    if (!posicao) {
      continue;
    }
    usados.add(restante.nome);
    const idade = sortearIdade(rng);
    jogadores.push(
      criarJogador({
        clube,
        posicao,
        nome: restante.nome,
        idade,
        anoTemporada,
        rng,
        tier: escolherTier(clube.reputacao, true, posicao, destaque, rng.real),
        idInicial,
        poolPais: clube.ligaId
      })
    );
    destaque += 1;
  }

  distribuirSalarios(jogadores, clube);

  const folha = jogadores.reduce((soma, j) => soma + j.contrato.salarioAnualCr, 0);
  return { jogadores, folhaSalarialCr: folha };
}

/** Sorteia nacionalidade: 60% do pais do clube, 40% de qualquer pool. */
function sorteiarNacionalidade(
  clube: Clube,
  rng: Rng,
  pools: Record<string, unknown>
): string {
  const disponiveis = Object.keys(pools);
  if (rng.real() < 0.6) {
    return clube.ligaId;
  }
  return rng.escolher(disponiveis.length > 0 ? disponiveis : [clube.ligaId]);
}

/** Dados de entrada de `criarJogador`. */
interface DadosJogador {
  clube: Clube;
  posicao: Posicao;
  nome: string;
  idade: number;
  anoTemporada: number;
  rng: Rng;
  tier: TierJogador;
  idInicial: { valor: number };
  poolPais: string;
  fonte?: "snapshot" | "gerado";
}

/** Cria um jogador completo com atributos, potencial e contrato. */
function criarJogador(dados: DadosJogador): Jogador {
  const { clube, posicao, nome, idade, anoTemporada, rng, tier, idInicial } = dados;
  const faixaOverall = OVERALL_POR_TIER[tier];

  // Overall base do tier, ajustado pela reputacao do clube e ruido da seed.
  const faixaClube = FAIXAS[faixaDaReputacao(clube.reputacao)];
  let overall = rng.realEntre(faixaOverall[0], faixaOverall[1]);
  overall += ((faixaClube.xiMin + faixaClube.xiMax) / 2 - 11.5) * 0.35;
  overall += rng.realEntre(-0.6, 0.6);
  if (idade >= 33) {
    overall -= (idade - 32) * 0.35;
  }
  overall = Math.round(Math.min(20, Math.max(4, overall)));

  const potencial = Math.max(overall, sortearPotencial(idade, overall, rng));
  const atributos = gerarAtributos(posicao, overall, rng);

  // O overall declarado bate com o calculo a partir dos atributos.
  const overallCalculado = calcularOverall(atributos, posicao);
  const overallFinal = Math.min(20, Math.max(1, Math.round(overall * 0.5 + overallCalculado * 0.5)));

  const porte = PORTE[posicao];
  let altura = rng.inteiro(porte.altura[0], porte.altura[1]);
  let peso = rng.inteiro(porte.peso[0], porte.peso[1]);

  const posicoesAlternativas = sortearAlternativas(posicao, rng);

  idInicial.valor += 1;

  return {
    id: `j${String(idInicial.valor).padStart(5, "0")}`,
    nome,
    nomeAbreviado: abreviarNome(nome),
    clubeId: clube.id,
    dataNascimento: dataNascimento(idade, anoTemporada, rng),
    idade,
    nacionalidade: dados.poolPais,
    posicao,
    posicoesAlternativas,
    peDominante: rng.real() < 0.78 ? "D" : "E",
    alturaCm: altura,
    pesoKg: peso,
    overall: overallFinal,
    potencial,
    atributos,
    condicaoFisica: rng.inteiro(88, 100),
    moral: rng.inteiro(60, 90),
    contrato: {
      salarioAnualCr: 0,
      anosRestantes: rng.inteiro(1, 4),
      valorRescisaoCr: 0,
      clausulaLiberacaoCr: rng.real() < 0.2 ? 0 : null
    },
    tier,
    fonte: dados.fonte ?? "snapshot"
  };
}

/** Sorteia posicoes alternativas coerentes com a principal. */
function sortearAlternativas(posicao: Posicao, rng: Rng): Posicao[] {
  const vizinhas: Record<Posicao, Posicao[]> = {
    GOL: [],
    ZAG: ["VOL", "MC"],
    LD: ["LE", "ME"],
    LE: ["LD", "MD"],
    VOL: ["MC", "ZAG"],
    MC: ["VOL", "MEI"],
    MEI: ["MC", "MD", "SA"],
    MD: ["ME", "ATA"],
    ME: ["MD", "ATA"],
    ATA: ["SA", "MD"],
    SA: ["ATA", "MEI"]
  };
  const candidatas = vizinhas[posicao];
  if (candidatas.length === 0) {
    return [];
  }
  const quantidade = rng.real() < 0.55 ? 1 : rng.real() < 0.9 ? 2 : 3;
  return rng.embaralhar(candidatas).slice(0, quantidade);
}

/**
 * Escala os salarios para bater exatamente com a folha salarial alvo do clube
 * (garante a invariante de +/-5% de `LIGAS.md` secao 9).
 *
 * @param jogadores - jogadores do clube (mutados no lugar)
 * @param clube - clube alvo
 */
function distribuirSalarios(jogadores: readonly Jogador[], clube: Clube): void {
  const brutos = jogadores.map((j) => {
    const base = Math.pow(j.overall, 2.2) * 6800 * (0.6 + clube.reputacao / 100);
    const potencialExtra = Math.pow(Math.max(0, j.potencial - j.overall), 1.6) * 1400;
    return base + potencialExtra + 40_000;
  });

  const somaBruta = brutos.reduce((soma, valor) => soma + valor, 0);
  const alvo = clube.folhaSalarialAlvoCr;
  const escala = somaBruta > 0 ? alvo / somaBruta : 1;

  jogadores.forEach((jogador, indice) => {
    const bruto = brutos[indice] as number;
    const salario = arredondar(bruto * escala, 50_000);
    const multa = arredondar(bruto * escala * (1.5 + jogador.overall / 20), 500_000);
    const clausula =
      jogador.contrato.clausulaLiberacaoCr === 0
        ? arredondar(bruto * escala * 2, 500_000)
        : null;
    jogador.contrato.salarioAnualCr = Math.max(300_000, salario);
    jogador.contrato.valorRescisaoCr = multa;
    jogador.contrato.clausulaLiberacaoCr = clausula;
  });
}

/** Arredonda para o multiplo mais proximo. */
function arredondar(valor: number, multiplo: number): number {
  return Math.round(valor / multiplo) * multiplo;
}

/** Resultado da geracao de todos os elencos. */
interface MundoElencos {
  jogadores: Jogador[];
  folhas: Map<string, number>;
}

/**
 * Gera os elencos de todos os clubes.
 *
 * @param clubes - clubes do mundo
 * @param seed - seed do mundo
 * @param anoTemporada - ano de referencia
 * @returns todos os jogadores e a folha salarial por clube
 */
export function gerarTodosElencos(
  clubes: readonly Clube[],
  seed: number,
  anoTemporada: number
): MundoElencos {
  const snapshot = carregarSnapshot();
  const pools = carregarPoolsNomes();
  const idInicial = { valor: 0 };

  const jogadores: Jogador[] = [];
  const folhas = new Map<string, number>();

  for (const clube of clubes) {
    const conhecidos = snapshot.get(clube.id) ?? [];
    const { jogadores: elenco, folhaSalarialCr } = gerarElencoDe(
      clube,
      conhecidos,
      pools,
      seed,
      anoTemporada,
      idInicial
    );
    jogadores.push(...elenco);
    folhas.set(clube.id, folhaSalarialCr);
  }

  return { jogadores, folhas };
}

/** Media de overall de um elenco (para a escolha do XI). */
export function mediaOverall(elenco: readonly Jogador[]): number {
  if (elenco.length === 0) {
    return 0;
  }
  const soma = elenco.reduce((total, j) => total + j.overall, 0);
  return Number((soma / elenco.length).toFixed(2));
}