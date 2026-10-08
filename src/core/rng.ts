/**
 * RNG determinístico baseado em xorshift128+.
 * Mesma seed + mesma sequência de chamadas = mesmo resultado.
 * Não usa Math.random() em nenhum ponto do jogo.
 */

export interface RNGState {
  s0: number;
  s1: number;
}

/**
 * Cria um novo gerador a partir de uma seed (string ou number).
 * A seed é hashada para 64 bits e expandida para dois estados u64.
 */
export function createRNG(seed: string | number): RNGState {
  let hash = typeof seed === "string" ? hashString(seed) : seed;
  hash = hash >>> 0;
  // splitmix64 para expandir a seed em dois estados
  let s0 = (hash + 0x9e3779b97f4a7c15) >>> 0;
  s0 = (s0 ^ (s0 >>> 30)) * 0xbf58476d1ce4e5b9 >>> 0;
  s0 = (s0 ^ (s0 >>> 27)) * 0x94d049bb133111eb >>> 0;
  s0 = s0 ^ (s0 >>> 31);

  let s1 = (s0 + 0x9e3779b97f4a7c15) >>> 0;
  s1 = (s1 ^ (s1 >>> 30)) * 0xbf58476d1ce4e5b9 >>> 0;
  s1 = (s1 ^ (s1 >>> 27)) * 0x94d049bb133111eb >>> 0;
  s1 = s1 ^ (s1 >>> 31);

  return { s0, s1 };
}

function hashString(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Gera um número aleatório de 32 bits (0 a 2^32-1).
 * Atualiza o estado interno.
 */
export function nextU32(state: RNGState): number {
  let s0 = state.s0;
  let s1 = state.s1;
  const result = (s0 + s1) >>> 0;

  s1 ^= s0;
  state.s0 = ((s0 << 23) | (s0 >>> (32 - 23))) ^ s1 ^ (s1 << 18);
  state.s1 = (s1 << 5) | (s1 >>> (32 - 5));

  return result;
}

/**
 * Gera um float em [0, 1).
 */
export function nextFloat(state: RNGState): number {
  return nextU32(state) / 0x100000000;
}

/**
 * Gera um inteiro em [min, max] (inclusivo).
 */
export function nextInt(state: RNGState, min: number, max: number): number {
  const range = max - min + 1;
  return min + (nextU32(state) % range);
}

/**
 * Gera um float em [min, max).
 */
export function nextFloatRange(state: RNGState, min: number, max: number): number {
  return min + nextFloat(state) * (max - min);
}

/**
 * Escolhe um elemento do array com probabilidade uniforme.
 */
export function choice<T>(state: RNGState, arr: readonly T[]): T {
  return arr[nextInt(state, 0, arr.length - 1)];
}

/**
 * Embaralha o array in-place (Fisher-Yates).
 */
export function shuffle<T>(state: RNGState, arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = nextInt(state, 0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * Amostra ponderada: recebe array de {item, peso} e retorna um item.
 * Pesos devem ser >= 0. Soma não precisa ser 1.
 */
export function weightedChoice<T>(
  state: RNGState,
  items: readonly { item: T; weight: number }[]
): T {
  let total = 0;
  for (const { weight } of items) total += weight;
  let r = nextFloat(state) * total;
  for (const { item, weight } of items) {
    r -= weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1].item;
}

/**
 * Serializa o estado para salvar no save game.
 */
export function serializeRNG(state: RNGState): string {
  return `${state.s0.toString(16).padStart(8, "0")}:${state.s1.toString(16).padStart(8, "0")}`;
}

/**
 * Desserializa o estado a partir do save game.
 */
export function deserializeRNG(str: string): RNGState {
  const [s0, s1] = str.split(":").map((h) => parseInt(h, 16));
  return { s0: s0 >>> 0, s1: s1 >>> 0 };
}

/**
 * Cria um RNG derivado para submódulos (ex.: partida, mercado, treino).
 * Garante isolamento: avançar o RNG da partida não afeta o RNG do mercado.
 */
export function deriveRNG(parent: RNGState, label: string): RNGState {
  const hash = hashString(label);
  const derived = createRNG(`${serializeRNG(parent)}:${hash}`);
  return derived;
}