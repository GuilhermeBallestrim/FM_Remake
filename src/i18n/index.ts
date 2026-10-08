/**
 * Internacionalizacao, versao minima da Fase 0.
 *
 * Implementa o nucleo descrito em `LOCALIZACAO.md`: chaves com ponto, fallback
 * para pt-BR, interpolacao e deteccao de chave faltando em desenvolvimento.
 * Os outros idiomas entram na Fase 11.
 */

import ptBR from "./pt-BR.json";

/** Idioma suportado. */
export type Idioma = "pt-BR";

/** Parametros de interpolacao `{chave}`. */
export type Parametros = Record<string, string | number>;

const dicionario: Record<string, string> = achatar(ptBR as Record<string, unknown>);

/**
 * Traduz uma chave.
 *
 * @param chave - chave no formato "namespace.secao.chave"
 * @param parametros - valores para substituir os marcadores `{chave}`
 * @returns texto traduzido, ou a propria chave se nao existir
 */
export function t(chave: string, parametros?: Parametros): string {
  let texto = dicionario[chave];
  if (texto === undefined) {
    if (import.meta.env?.DEV) {
      console.warn(`[i18n] chave faltando: "${chave}"`);
    }
    return chave;
  }
  if (parametros) {
    for (const [chaveParametro, valor] of Object.entries(parametros)) {
      texto = texto.replace(new RegExp(`\\{${chaveParametro}\\}`, "g"), String(valor));
    }
  }
  return texto;
}

/**
 * Traduz com pluralizacao simples (pt-BR: 1 = singular, resto = plural).
 *
 * @param chaveBase - base da chave, sem o sufixo
 * @param quantidade - numero que decide a forma
 * @param parametros - valores para interpolar
 * @returns texto no singular ou plural
 */
export function tPlural(
  chaveBase: string,
  quantidade: number,
  parametros?: Parametros
): string {
  const forma = quantidade === 1 ? "singular" : "plural";
  return t(`${chaveBase}.${forma}`, { ...parametros, count: quantidade });
}

/**
 * Lista as chaves faltando em um dicionario comparado ao pt-BR.
 *
 * @param outro - dicionario a comparar
 * @returns chaves presentes no pt-BR e ausentes no outro
 */
export function chavesFaltando(outro: Record<string, string>): string[] {
  return Object.keys(dicionario).filter((chave) => outro[chave] === undefined);
}

/** Numero de chaves disponiveis, para o teste de cobertura. */
export function totalDeChaves(): number {
  return Object.keys(dicionario).length;
}

/** Achata um objeto aninhado em chaves com ponto. */
function achatar(
  objeto: Record<string, unknown>,
  prefixo = ""
): Record<string, string> {
  const resultado: Record<string, string> = {};
  for (const [chave, valor] of Object.entries(objeto)) {
    const completa = prefixo ? `${prefixo}.${chave}` : chave;
    if (typeof valor === "string") {
      resultado[completa] = valor;
    } else if (valor && typeof valor === "object") {
      Object.assign(resultado, achatar(valor as Record<string, unknown>, completa));
    }
  }
  return resultado;
}