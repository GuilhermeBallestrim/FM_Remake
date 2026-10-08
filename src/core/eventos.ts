/**
 * Barramento de eventos (pub/sub) interno do jogo.
 *
 * A UI nunca consulta o estado da simulacao diretamente: ela se inscreve aqui.
 * Isso mantem a separacao entre `sim/` e `ui/` exigida pelo prompt principal.
 */

/** Assinatura de um ouvinte de evento. */
export type Ouvinte<T> = (payload: T) => void;

/** Funcao de cancelamento de uma assinatura. */
export type Cancelar = () => void;

/** Interface de um evento nomeado. */
export interface Eventos<Tipo extends string, Carga> {
  ao(evento: Tipo, ouvinte: Ouvinte<Carga>): Cancelar;
  emitir(evento: Tipo, carga: Carga): void;
  limpar(): void;
}

/**
 * Cria um barramento de eventos tipado.
 *
 * @returns barramento com `ao`, `emitir` e `limpar`
 */
export function criarEventos<Tipo extends string, Carga>(): Eventos<Tipo, Carga> {
  const ouvintes = new Map<Tipo, Set<Ouvinte<Carga>>>();

  return {
    ao(evento: Tipo, ouvinte: Ouvinte<Carga>): Cancelar {
      let conjunto = ouvintes.get(evento);
      if (!conjunto) {
        conjunto = new Set();
        ouvintes.set(evento, conjunto);
      }
      conjunto.add(ouvinte);
      return () => {
        conjunto?.delete(ouvinte);
      };
    },
    emitir(evento: Tipo, carga: Carga): void {
      const conjunto = ouvintes.get(evento);
      if (!conjunto) {
        return;
      }
      // Copia para permitir que um ouvinte cancele a si mesmo durante a emissao.
      for (const ouvinte of [...conjunto]) {
        ouvinte(carga);
      }
    },
    limpar(): void {
      ouvintes.clear();
    }
  };
}