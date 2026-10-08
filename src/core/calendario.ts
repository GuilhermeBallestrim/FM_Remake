/**
 * Calendario proprio do jogo, sem depender de `Date` do sistema.
 *
 * Motivo: `Date` depende de fuso horario e locale da maquina, o que quebraria o
 * determinismo por seed. Aqui usamos aritmetica civil pura (algoritmo de
 * Howard Hinnant) sobre numeros de dia.
 */

/** Data civil, no formato usado em todo o save e na UI. */
export interface Data {
  ano: number;
  mes: number;
  dia: number;
}

/** Dias desde 1970-01-01 (que foi uma quinta-feira). */
export type DiaNumero = number;

const DIAS_POR_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const NOMES_DIAS = [
  "domingo",
  "segunda-feira",
  "terca-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sabado"
];

const NOMES_MESES = [
  "janeiro",
  "fevereiro",
  "marco",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro"
];

function ehBissexto(ano: number): boolean {
  return (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;
}

/**
 * Converte data civil para numero de dias desde 1970-01-01.
 * Algoritmo de Hinnant (`days_from_civil`), exato para +-500000 anos.
 *
 * @param data - data civil
 * @returns numero de dias
 */
export function paraDiaNumero(data: Data): DiaNumero {
  const a = data.mes <= 2 ? data.ano - 1 : data.ano;
  const m = data.mes + (data.mes > 2 ? -3 : 9);
  const era = Math.floor(a / 400);
  const anoEra = a - era * 400;
  const diaEra =
    Math.floor((153 * m + 2) / 5) + data.dia - 1;
  const diaAno = anoEra * 365 + Math.floor(anoEra / 4) - Math.floor(anoEra / 100) + diaEra;
  return era * 146097 + diaAno - 719468;
}

/**
 * Converte numero de dias para data civil (inverso de `paraDiaNumero`).
 *
 * @param dia - numero de dias desde 1970-01-01
 * @returns data civil
 */
export function paraData(dia: DiaNumero): Data {
  const z = dia + 719468;
  const era = Math.floor(z / 146097);
  const diaEra = z - era * 146097;
  const anoEra = Math.floor(
    (diaEra - Math.floor(diaEra / 1460) + Math.floor(diaEra / 36524) - Math.floor(diaEra / 146096)) / 365
  );
  const ano = anoEra + era * 400;
  const diaAno = diaEra - (365 * anoEra + Math.floor(anoEra / 4) - Math.floor(anoEra / 100));
  const mp = Math.floor((5 * diaAno + 2) / 153);
  const dia = diaAno - Math.floor((153 * mp + 2) / 5) + 1;
  const mes = mp + (mp < 10 ? 3 : -9);
  return { ano: ano + (mes <= 2 ? 1 : 0), mes, dia };
}

/** Indice do dia da semana (0 = domingo). 1970-01-01 foi quinta-feira. */
export function indiceDiaSemana(dia: DiaNumero): number {
  return (((dia + 4) % 7) + 7) % 7;
}

/** Nome do dia da semana em portugues. */
export function nomeDiaSemana(dia: DiaNumero): string {
  return NOMES_DIAS[indiceDiaSemana(dia)] as string;
}

/** Nome do mes em portugues. */
export function nomeMes(mes: number): string {
  return NOMES_MESES[mes - 1] as string;
}

/**
 * Formata a data no padrao ISO curto (AAAA-MM-DD), que e o formato do save.
 */
export function formatarIso(dia: DiaNumero): string {
  const d = paraData(dia);
  const mes = String(d.mes).padStart(2, "0");
  const dd = String(d.dia).padStart(2, "0");
  return `${d.ano}-${mes}-${dd}`;
}

/**
 * Formata a data por extenso: "12 de agosto de 2025".
 */
export function formatarExtenso(dia: DiaNumero): string {
  const d = paraData(dia);
  return `${d.dia} de ${nomeMes(d.mes)} de ${d.ano}`;
}

/**
 * Formata no padrao curto de tela: "12/08/2025".
 */
export function formatarCurto(dia: DiaNumero): string {
  const d = paraData(dia);
  return `${String(d.dia).padStart(2, "0")}/${String(d.mes).padStart(2, "0")}/${d.ano}`;
}

/**
 * Soma dias a uma data, sem depender de `Date`.
 *
 * @param dia - data inicial
 * @param quantidade - quantos dias somar (pode ser negativo)
 * @returns novo numero de dias
 */
export function somarDias(dia: DiaNumero, quantidade: number): DiaNumero {
  return dia + quantidade;
}

/** Diferenca em dias entre duas datas. */
export function diferencaDias(a: DiaNumero, b: DiaNumero): number {
  return b - a;
}

/**
 * Encontra o primeiro dia do mes.
 *
 * @param ano - ano
 * @param mes - mes (1 a 12)
 * @returns numero de dias do dia 1
 */
export function primeiroDiaDoMes(ano: number, mes: number): DiaNumero {
  return paraDiaNumero({ ano, mes, dia: 1 });
}

/**
 * Quantos dias o mes tem (considera bissexto).
 */
export function diasNoMes(ano: number, mes: number): number {
  if (mes === 2 && ehBissexto(ano)) {
    return 29;
  }
  return DIAS_POR_MES[mes - 1] as number;
}

/**
 * Encontra o proximo dia da semana desejado a partir de uma data (inclusive).
 *
 * @param dia - data inicial
 * @param indice - 0 = domingo ... 6 = sabado
 * @returns numero de dias do proximo sabado (ou outro dia)
 */
export function proximoDiaDaSemana(dia: DiaNumero, indice: number): DiaNumero {
  const atual = indiceDiaSemana(dia);
  return dia + (((indice - atual) % 7) + 7) % 7;
}

/**
 * Constroi o calendario de uma temporada: 38 rodadas com uma data por rodada.
 *
 * Regra do projeto: a temporada comeca no 2o sabado de agosto e cada rodada
 * acontece exatamente 7 dias depois da anterior.
 *
 * @param anoTemporada - ano de inicio da temporada (ex.: 2025)
 * @param quantidade - numero de rodadas (38 na liga)
 * @returns vetor de datas, uma por rodada
 */
export function calendarioTemporada(
  anoTemporada: number,
  quantidade: number
): DiaNumero[] {
  const primeiroDeAgosto = primeiroDiaDoMes(anoTemporada, 8);
  const primeiroSabado = proximoDiaDaSemana(primeiroDeAgosto, 6);
  // 2o sabado de agosto: soma mais 7 dias
  const inicio = primeiroSabado + 7;

  const datas: DiaNumero[] = [];
  for (let i = 0; i < quantidade; i += 1) {
    datas.push(inicio + i * 7);
  }
  return datas;
}

/**
 * Quantos dias faltam entre a data atual e a data-alvo (0 se ja passou).
 */
export function diasAte(atual: DiaNumero, alvo: DiaNumero): number {
  return Math.max(0, alvo - atual);
}

/** Compara duas datas: negativo se `a` vem antes. */
export function compararDatas(a: DiaNumero, b: DiaNumero): number {
  return a === b ? 0 : a < b ? -1 : 1;
}

/** Serializa um dia para texto, para o save. */
export function diaParaTexto(dia: DiaNumero): string {
  return formatarIso(dia);
}

/** Le um dia serializado. */
export function textoParaDia(texto: string): DiaNumero {
  const partes = texto.split("-");
  const ano = Number(partes[0]);
  const mes = Number(partes[1]);
  const dd = Number(partes[2]);
  if (!Number.isFinite(ano) || !Number.isFinite(mes) || !Number.isFinite(dd)) {
    throw new Error(`textoParaDia: data invalida "${texto}"`);
  }
  return paraDiaNumero({ ano, mes, dia: dd });
}