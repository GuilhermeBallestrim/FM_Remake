/**
 * Sistema financeiro da Fase 0.
 *
 * Implementa o essencial de `FINANCAS.md`: receita de bilheteria e
 * transmissao, despesa de folha e manutencao, e o fechamento anual. As
 * regras de FFP, patrocínio negociavel e objetivos da diretoria entram na
 * Fase 8; aqui ja ha o suficiente para o dashboard mostrar caixa real.
 */

import type { Clube, Mundo, ResultadoPartida } from "@/domain/tipos";

/** Parcela de receita e despesa de um clube. */
export interface FinancasClube {
  clubeId: string;
  saldoCr: number;
  receitaBilheteriaCr: number;
  receitaTransmissaoCr: number;
  receitaPatrocinioCr: number;
  despesaFolhaCr: number;
  despesaManutencaoCr: number;
  despesaStaffCr: number;
  totalReceitasCr: number;
  totalDespesasCr: number;
}

/** Resultado financeiro de uma temporada. */
export interface ResultadoFinanceiroTemporada {
  porClube: Map<string, FinancasClube>;
  totalReceitasCr: number;
  totalDespesasCr: number;
}

/** Preco medio por ingresso em CR (calibrado para a escala do jogo). */
export const PRECO_INGRESSO_CR = 145;

/** Custo de manutencao do estadio por espectador/ano. */
export const CUSTO_MANUTENCAO_POR_LUGAR = 120;

/** Receita de manutencao por espectador/ano. */
export const RECEITA_MANUTENCAO_POR_LUGAR = 140;

/** Custo fixo anual do quadro tecnico e administrativo. */
export const CUSTO_STAFF_BASE_CR = 4_000_000;

/**
 * Calcula a receita de bilheteria de uma temporada (19 jogos em casa).
 *
 * @param clube - clube
 * @param resultados - resultados da temporada do clube
 * @returns receita bruta em CR
 */
export function calcularBilheteria(
  clube: Clube,
  resultados: readonly ResultadoPartida[]
): number {
  const jogosEmCasa = resultados.filter((r) => r.mandanteId === clube.id);
  if (jogosEmCasa.length === 0) {
    return 0;
  }

  let receita = 0;
  for (const jogo of jogosEmCasa) {
    let ocupacao = 0.92;
    if (jogo.golsMandante < jogo.golsVisitante) {
      ocupacao -= 0.05;
    }
    let fatorJogo = 1.0;
    if (clube.rivalPrincipal && jogo.visitanteId === clube.rivalPrincipal) {
      fatorJogo = 2.0;
    } else if (clube.reputacao >= 85 && jogo.visitanteId.length > 0) {
      fatorJogo = 1.2;
    }
    const receitaJogo =
      clube.capacidade * ocupacao * fatorJogo * PRECO_INGRESSO_CR;
    receita += receitaJogo;
  }

  return Math.round(receita);
}

/**
 * Calcula a parcela de transmissao pela posicao final na tabela.
 *
 * @param posicao - posicao na classificacao (1 a 20)
 * @returns valor em CR
 */
export function calcularTransmissao(posicao: number): number {
  if (posicao === 1) {
    return 22_000_000;
  }
  if (posicao === 2) {
    return 19_000_000;
  }
  if (posicao <= 4) {
    return 17_000_000;
  }
  if (posicao <= 8) {
    return 15_000_000;
  }
  return 11_000_000;
}

/**
 * Calcula o patrocinio anual conforme reputacao e orcamento.
 *
 * @param clube - clube
 * @returns valor anual em CR
 */
export function calcularPatrocinio(clube: Clube): number {
  const principal = 1_000_000 + Math.pow(clube.reputacao, 2.05) * 5_200;
  return Math.round(principal * 1.4);
}

/** Custo de manutencao anual do estadio. */
export function calcularManutencao(clube: Clube): number {
  if (clube.capacidade <= 10_000) {
    return 1_200_000;
  }
  return Math.round(clube.capacidade * CUSTO_MANUTENCAO_POR_LUGAR);
}

/** Custo anual de staff, escalado pela reputacao. */
export function calcularStaff(clube: Clube): number {
  const escala = 3_700_000 + (clube.reputacao / 100) * 4_400_000;
  return Math.round(escala);
}

/**
 * Monta as financas de todos os clubes ao fim de uma temporada.
 *
 * @param mundo - mundo gerado
 * @param resultados - resultados de todas as partidas da temporada
 * @param classificacoes - classificacao final por liga
 * @returns financas por clube
 */
export function fecharTemporada(
  mundo: Mundo,
  resultados: readonly ResultadoPartida[],
  classificacoes: ReadonlyMap<string, number>
): ResultadoFinanceiroTemporada {
  const porClube = new Map<string, FinancasClube>();
  let totalReceitas = 0;
  let totalDespesas = 0;

  for (const clube of mundo.clubes) {
    const jogosDoClube = resultados.filter(
      (r) => r.mandanteId === clube.id || r.visitanteId === clube.id
    );

    const bilheteria = calcularBilheteria(clube, resultados);
    const posicao = classificacoes.get(clube.id) ?? clube.reputacao > 60 ? 10 : 18;
    const transmissao = calcularTransmissao(
      classificacoes.get(clube.id) ?? Math.max(1, Math.round(20 - clube.reputacao / 5))
    );
    const patrocinio = calcularPatrocinio(clube);

    const folha = [...(mundo.elencosPorClube.get(clube.id) ?? [])].reduce(
      (soma, j) => soma + j.contrato.salarioAnualCr,
      0
    );
    const manutencao = calcularManutencao(clube);
    const staff = calcularStaff(clube);

    const receitas = bilheteria + transmissao + patrocinio + 3_000_000;
    const despesas = folha + manutencao + staff;

    const saldo = clube.orcamentoCr + receitas - despesas;

    porClube.set(clube.id, {
      clubeId: clube.id,
      saldoCr: Math.round(saldo),
      receitaBilheteriaCr: bilheteria,
      receitaTransmissaoCr: transmissao,
      receitaPatrocinioCr: patrocinio,
      despesaFolhaCr: folha,
      despesaManutencaoCr: manutencao,
      despesaStaffCr: staff,
      totalReceitasCr: Math.round(receitas),
      totalDespesasCr: Math.round(despesas)
    });

    void jogosDoClube;
    void posicao;

    totalReceitas += receitas;
    totalDespesas += despesas;
  }

  return {
    porClube,
    totalReceitasCr: Math.round(totalReceitas),
    totalDespesasCr: Math.round(totalDespesas)
  };
}

/**
 * Aplica as financas de uma temporada ao saldo do proximo ano.
 *
 * @param mundo - mundo gerado
 * @param financeiro - resultado do fechamento
 * @param fatorInflacao - inflacao anual aplicada aos custos (padrao 1.06)
 * @returns saldos por clube ja com o novo ano
 */
export function aplicarSaldoNovoAno(
  mundo: Mundo,
  financeiro: ResultadoFinanceiroTemporada,
  fatorInflacao = 1.06
): Map<string, number> {
  const saldos = new Map<string, number>();

  for (const clube of mundo.clubes) {
    const financas = financeiro.porClube.get(clube.id);
    if (!financas) {
      saldos.set(clube.id, clube.orcamentoCr);
      continue;
    }
    const resultado = financas.totalReceitasCr - financas.totalDespesasCr;
    const saldo = Math.round(clube.orcamentoCr * fatorInflacao + resultado);
    saldos.set(clube.id, saldo);
  }

  return saldos;
}

/** Formata um valor em CR para exibicao (milhoes com uma casa). */
export function formatarCr(valor: number): string {
  if (Math.abs(valor) >= 1_000_000) {
    return `CR ${(valor / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(valor) >= 1_000) {
    return `CR ${(valor / 1_000).toFixed(0)}k`;
  }
  return `CR ${valor}`;
}