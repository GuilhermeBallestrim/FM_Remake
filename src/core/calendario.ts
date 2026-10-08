/**
 * Calendário próprio do jogo.
 * Não usa Date do sistema — garante determinismo total por seed.
 * Suporta múltiplas ligas com calendários diferentes (europeu vs brasileiro).
 */

export type LigaId = "ENG" | "ESP" | "ITA" | "BRA";

export interface DataJogo {
  ano: number;
  mes: number;      // 1-12
  dia: number;      // 1-31
  diaSemana: number; // 0=Dom ... 6=Sab
}

/**
 * Converte DataJogo para número de dias desde epoch do jogo (01/01/2020).
 * Usado para ordenação e aritmética de datas.
 */
export function dataParaDias(d: DataJogo): number {
  // Algoritmo de dias desde 01/01/2020 (ano base do jogo)
  const anoBase = 2020;
  let dias = 0;
  for (let a = anoBase; a < d.ano; a++) {
    dias += ehBissexto(a) ? 366 : 365;
  }
  const diasMes = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (ehBissexto(d.ano)) diasMes[2] = 29;
  for (let m = 1; m < d.mes; m++) dias += diasMes[m];
  dias += d.dia - 1;
  return dias;
}

function ehBissexto(ano: number): boolean {
  return (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;
}

export function diasParaData(dias: number): DataJogo {
  let ano = 2020;
  while (true) {
    const diasNoAno = ehBissexto(ano) ? 366 : 365;
    if (dias < diasNoAno) break;
    dias -= diasNoAno;
    ano++;
  }
  const diasMes = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (ehBissexto(ano)) diasMes[2] = 29;
  let mes = 1;
  while (dias >= diasMes[mes]) {
    dias -= diasMes[mes];
    mes++;
  }
  const dia = dias + 1;
  // 01/01/2020 foi quarta-feira (3)
  const diaSemana = (3 + dataParaDias({ ano, mes, dia, diaSemana: 0 })) % 7;
  return { ano, mes, dia, diaSemana };
}

export function adicionarDias(d: DataJogo, n: number): DataJogo {
  return diasParaData(dataParaDias(d) + n);
}

export function proximoSabado(d: DataJogo): DataJogo {
  const diff = (6 - d.diaSemana + 7) % 7;
  return diff === 0 ? d : adicionarDias(d, diff);
}

export function formatarData(d: DataJogo, locale = "pt-BR"): string {
  return new Date(d.ano, d.mes - 1, d.dia).toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

export function formatarDataLonga(d: DataJogo, locale = "pt-BR"): string {
  return new Date(d.ano, d.mes - 1, d.dia).toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

/** Comparação: -1 se a < b, 0 se igual, 1 se a > b */
export function compararDatas(a: DataJogo, b: DataJogo): number {
  if (a.ano !== b.ano) return a.ano < b.ano ? -1 : 1;
  if (a.mes !== b.mes) return a.mes < b.mes ? -1 : 1;
  if (a.dia !== b.dia) return a.dia < b.dia ? -1 : 1;
  return 0;
}

export function datasIguais(a: DataJogo, b: DataJogo): boolean {
  return a.ano === b.ano && a.mes === b.mes && a.dia === b.dia;
}

/**
 * Configuração de calendário por liga.
 * Define início/fim da temporada, pausas, janelas de transferência.
 */
export interface ConfigCalendarioLiga {
  ligaId: LigaId;
  inicioTemporada: DataJogo;        // 2º sábado de agosto (ENG/ESP/ITA) ou maio (BRA)
  fimTemporada: DataJogo;           // último sábado de maio (ENG/ESP/ITA) ou dezembro (BRA)
  pausaInvernoInicio?: DataJogo;    // para ligas europeias
  pausaInvernoFim?: DataJogo;
  janelaVeraoInicio: DataJogo;
  janelaVeraoFim: DataJogo;
  janelaInvernoInicio: DataJogo;
  janelaInvernoFim: DataJogo;
  rodadas: number;                  // 38 para todas
}

/** Gera configuração padrão para uma liga e ano */
export function gerarConfigCalendario(ligaId: LigaId, anoInicio: number): ConfigCalendarioLiga {
  // 2º sábado de agosto
  let inicio = { ano: anoInicio, mes: 8, dia: 1, diaSemana: 0 };
  inicio = diasParaData(dataParaDias(inicio));
  inicio = proximoSabado(inicio); // 1º sábado
  inicio = adicionarDias(inicio, 7); // 2º sábado

  let fim: DataJogo;
  let janelaVeraoFim: DataJogo;
  let janelaInvernoInicio: DataJogo;
  let janelaInvernoFim: DataJogo;

  if (ligaId === "BRA") {
    // Brasileirão: maio a dezembro
    fim = { ano: anoInicio, mes: 12, dia: 1, diaSemana: 0 };
    fim = diasParaData(dataParaDias(fim));
    fim = proximoSabado(fim);
    // último sábado de dezembro
    while (fim.mes === 12) {
      const prox = adicionarDias(fim, 7);
      if (prox.mes !== 12) break;
      fim = prox;
    }
    janelaVeraoFim = { ano: anoInicio, mes: 4, dia: 1, diaSemana: 0 };
    janelaVeraoFim = diasParaData(dataParaDias(janelaVeraoFim));
    janelaInvernoInicio = { ano: anoInicio, mes: 7, dia: 1, diaSemana: 0 };
    janelaInvernoInicio = diasParaData(dataParaDias(janelaInvernoInicio));
    janelaInvernoFim = { ano: anoInicio, mes: 8, dia: 1, diaSemana: 0 };
    janelaInvernoFim = diasParaData(dataParaDias(janelaInvernoFim));
  } else {
    // Europeias: agosto a maio do ano seguinte
    fim = { ano: anoInicio + 1, mes: 5, dia: 1, diaSemana: 0 };
    fim = diasParaDias(fim);
    fim = diasParaData(fim);
    fim = proximoSabado(fim);
    while (fim.mes === 5) {
      const prox = adicionarDias(fim, 7);
      if (prox.mes !== 5) break;
      fim = prox;
    }
    janelaVeraoFim = { ano: anoInicio, mes: 9, dia: 1, diaSemana: 0 };
    janelaVeraoFim = diasParaData(dataParaDias(janelaVeraoFim));
    janelaInvernoInicio = { ano: anoInicio + 1, mes: 1, dia: 1, diaSemana: 0 };
    janelaInvernoInicio = diasParaData(dataParaDias(janelaInvernoInicio));
    janelaInvernoFim = { ano: anoInicio + 1, mes: 2, dia: 1, diaSemana: 0 };
    janelaInvernoFim = diasParaData(dataParaDias(janelaInvernoFim));
  }

  const pausaInicio = { ano: anoInicio, mes: 12, dia: 20, diaSemana: 0 };
  const pausaFim = { ano: anoInicio + 1, mes: 1, dia: 5, diaSemana: 0 };
  const pausaInicioDias = dataParaDias(pausaInicio);
  const pausaFimDias = dataParaDias(pausaFim);
  const pausaInvernoInicioObj = diasParaData(pausaInicioDias);
  const pausaInvernoFimObj = diasParaData(pausaFimDias);

  return {
    ligaId,
    inicioTemporada: inicio,
    fimTemporada: fim,
    pausaInvernoInicio: ligaId !== "BRA" ? pausaInvernoInicioObj : undefined,
    pausaInvernoFim: ligaId !== "BRA" ? pausaInvernoFimObj : undefined,
    janelaVeraoInicio: inicio,
    janelaVeraoFim,
    janelaInvernoInicio: janelaInvernoInicioObj,
    janelaInvernoFim: janelaInvernoFimObj,
    rodadas: 38
  };
}

/** Verifica se uma data está na janela de transferências */
export function estaNaJanela(
  data: DataJogo,
  config: ConfigCalendarioLiga,
  tipo: "verao" | "inverno"
): boolean {
  const d = dataParaDias(data);
  if (tipo === "verao") {
    return d >= dataParaDias(config.janelaVeraoInicio) && d <= dataParaDias(config.janelaVeraoFim);
  }
  return d >= dataParaDias(config.janelaInvernoInicio) && d <= dataParaDias(config.janelaInvernoFim);
}

/** Verifica se é dia de rodada (sábado ou domingo) */
export function ehDiaDeRodada(data: DataJogo): boolean {
  return data.diaSemana === 6 || data.diaSemana === 0;
}

/** Gera todas as datas das rodadas para uma liga */
export function gerarDatasRodadas(config: ConfigCalendarioLiga): DataJogo[] {
  const datas: DataJogo[] = [];
  let atual = config.inicioTemporada;
  for (let i = 0; i < config.rodadas; i++) {
    // Avança para o próximo fim de semana
    while (!ehDiaDeRodada(atual)) {
      atual = adicionarDias(atual, 1);
    }
    datas.push({ ...atual });
    // Próxima rodada: 7 dias depois (alternando sáb/dom se quiser)
    atual = adicionarDias(atual, 7);
    // Pula pausa de inverno se houver
    if (config.pausaInvernoInicio && config.pausaInvernoFim) {
      const ini = dataParaDias(config.pausaInvernoInicio);
      const fim = dataParaDias(config.pausaInvernoFim);
      const at = dataParaDias(atual);
      if (at >= ini && at <= fim) {
        atual = { ...config.pausaInvernoFim };
        atual = adicionarDias(atual, 1);
      }
    }
  }
  return datas;
}