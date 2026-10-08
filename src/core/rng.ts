/**
 * Gerador de numeros pseudoaleatorios deterministico e serializavel.
 *
 * O motor de simulacao inteiro depende deste modulo: nenhuma parte do jogo pode
 * usar `Math.random()`, senao a mesma seed deixa de reproduzir o mesmo resultado.
 *
 * Algoritmo: xoshiro128** com seeding por splitmix32. Escolhido por ser rapido,
 * ter estado pequeno (16 bytes) e passar em testes de Chao de Kolmogorov-Smirnov.
 */

/** Estado interno do gerador: quatro palavras de 32 bits. */
export interface EstadoRng {
  s0: number;
  s1: number;
  s2: number;
  s3: number;
}

/** Gerador com metodos de sorteio. */
export interface Rng {
  /** Inteiro em [0, 2^32). Use para construir os outros sorteios. */
  proximoUint32(): number;
  /** Real em [0, 1). */
  real(): number;
  /** Inteiro em [min, max], ambos inclusivos. */
  inteiro(min: number, max: number): number;
  /** Real em [min, max). */
  realEntre(min: number, max: number): number;
  /** Elemento aleatorio de um array nao vazio. */
  escolher<T>(itens: readonly T[]): T;
  /** Elemento aleatorio com pesos (pesos nao negativos). */
  escolherPonderado<T>(itens: readonly T[], peso: (item: T) => number): T;
  /** Devolve uma copia embaralhada (Fisher-Yates). Nao muta o original. */
  embaralhar<T>(itens: readonly T[]): T[];
  /** Amostra de Poisson com lambda pequeno (Knuth). */
  poisson(lambda: number): number;
  /** Estado atual, para serializar no save. */
  estado(): EstadoRng;
  /** Restaura um estado salvo (para replay e testes). */
  restaurar(estado: EstadoRng): void;
}

function rotl(x: number, k: number): number {
  return ((x << k) | (x >>> (32 - k))) >>> 0;
}

/**
 * Semeador splitmix32: transforma uma seed de 32 bits em quatro palavras de estado.
 * Sem isso, seeds proximas produziriam correlacao nos primeiros sorteios.
 */
function semear(seed: number): EstadoRng {
  let z = seed >>> 0;
  let s0 = 0;
  let s1 = 0;
  let s2 = 0;
  let s3 = 0;

  const proximo = (): number => {
    z = (z + 0x9e3779b9) >>> 0;
    let t = z;
    t = Math.imul(t ^ (t >>> 16), 0x21f0aaad) >>> 0;
    t = Math.imul(t ^ (t >>> 15), 0x735a2d97) >>> 0;
    return (t ^ (t >>> 15)) >>> 0;
  };

  s0 = proximo();
  s1 = proximo();
  s2 = proximo();
  s3 = proximo();

  // Estado nao pode ser zero: o algoritmo trava.
  if ((s0 | s1 | s2 | s3) === 0) {
    s0 = 1;
  }

  return { s0, s1, s2, s3 };
}

/**
 * Cria um gerador a partir de uma seed de 32 bits.
 *
 * @param seed - seed de 0 a 4294967295
 * @returns gerador com metodos de sorteio
 */
export function criarRng(seed: number): Rng {
  const inicial = semear(seed);
  let s0 = inicial.s0;
  let s1 = inicial.s1;
  let s2 = inicial.s2;
  let s3 = inicial.s3;

  const proximoUint32 = (): number => {
    const resultado = Math.imul(rotl(Math.imul(s1, 5) >>> 0, 7), 9) >>> 0;
    const t = (s1 << 9) >>> 0;

    s2 = (s2 ^ s0) >>> 0;
    s3 = (s3 ^ s1) >>> 0;
    s1 = (s1 ^ s2) >>> 0;
    s0 = (s0 ^ s3) >>> 0;
    s2 = (s2 ^ t) >>> 0;
    s3 = rotl(s3, 11);

    return resultado;
  };

  const real = (): number => proximoUint32() / 4294967296;

  return {
    proximoUint32,
    real,
    inteiro(min: number, max: number): number {
      if (max < min) {
        throw new Error(`inteiro: max (${max}) menor que min (${min})`);
      }
      const faixa = max - min + 1;
      return min + Math.floor(real() * faixa);
    },
    realEntre(min: number, max: number): number {
      return min + real() * (max - min);
    },
    escolher<T>(itens: readonly T[]): T {
      if (itens.length === 0) {
        throw new Error("escolher: array vazio");
      }
      return itens[inteiro(0, itens.length - 1)] as T;
    },
    escolherPonderado<T>(itens: readonly T[], peso: (item: T) => number): T {
      if (itens.length === 0) {
        throw new Error("escolherPonderado: array vazio");
      }
      let total = 0;
      for (const item of itens) {
        const p = peso(item);
        if (p < 0) {
          throw new Error("escolherPonderado: peso negativo");
        }
        total += p;
      }
      if (total === 0) {
        return this.escolher(itens);
      }
      let alvo = real() * total;
      for (const item of itens) {
        alvo -= peso(item);
        if (alvo < 0) {
          return item;
        }
      }
      return itens[itens.length - 1] as T;
    },
    embaralhar<T>(itens: readonly T[]): T[] {
      const copia = [...itens];
      for (let i = copia.length - 1; i > 0; i -= 1) {
        const j = inteiro(0, i);
        const a = copia[i] as T;
        const b = copia[j] as T;
        copia[i] = b;
        copia[j] = a;
      }
      return copia;
    },
    poisson(lambda: number): number {
      if (lambda <= 0) {
        return 0;
      }
      // Algoritmo de Knuth: valido e suficiente para lambda pequeno (gols por partida).
      const limite = Math.exp(-lambda);
      let produto = real();
      let k = 0;
      while (produto > limite && k < 20) {
        k += 1;
        produto *= real();
      }
      return k - 1;
    },
    estado(): EstadoRng {
      return { s0, s1, s2, s3 };
    },
    restaurar(estado: EstadoRng): void {
      s0 = estado.s0 >>> 0;
      s1 = estado.s1 >>> 0;
      s2 = estado.s2 >>> 0;
      s3 = estado.s3 >>> 0;
    }
  };
}

/**
 * Deriva uma seed independente a partir de uma seed base e de uma chave textual.
 * Usado para dar um gerador proprio a cada sistema (mercado, treino, partidas),
 * sem que um deles consuma os sorteios do outro.
 *
 * @param seedBase - seed do mundo
 * @param chave - identificador do sistema, por exemplo "mercado:2025-07-10"
 * @returns seed de 32 bits
 */
export function derivarSeed(seedBase: number, chave: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < chave.length; i += 1) {
    h ^= chave.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return (h ^ (seedBase >>> 0)) >>> 0;
}