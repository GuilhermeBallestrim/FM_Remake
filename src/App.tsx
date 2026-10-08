/**
 * Componente raiz da Fase 0.
 *
 * Gera o mundo uma vez a partir da seed e entrega os dados ao dashboard.
 * Toda a logica de simulacao fica fora do componente: a UI so consome
 * resultados (regra de separacao do prompt principal).
 */

import { useCallback, useMemo, useState } from "react";
import { gerarMundo, SEED_PADRAO } from "@/data/geradorMundo";
import { idsLigasAtivas } from "@/data/carregarDados";
import type { Mundo } from "@/domain/tipos";
import { Dashboard } from "@/ui/Dashboard";

/** Ano da temporada inicial (inicio em agosto de 2025). */
const ANO_TEMPORADA = 2025;

/** Estado da aplicacao na Fase 0. */
export interface EstadoApp {
  seed: number;
  seedDigitada: string;
  mundo: Mundo | null;
  erro: string | null;
  carregando: boolean;
}

/**
 * Componente raiz.
 *
 * @returns aplicacao montada
 */
export function App(): JSX.Element {
  const [seed, setSeed] = useState<number>(SEED_PADRAO);
  const [seedDigitada, setSeedDigitada] = useState<string>(String(SEED_PADRAO));
  const [mundo, setMundo] = useState<Mundo | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState<boolean>(false);

  const ligasAtivas = useMemo(() => idsLigasAtivas(), []);

  const gerar = useCallback((novaSeed: number) => {
    setCarregando(true);
    setErro(null);
    // Pequeno atraso para o estado de carregamento aparecer na UI.
    window.setTimeout(() => {
      try {
        const gerado = gerarMundo({ seed: novaSeed, anoTemporada: ANO_TEMPORADA });
        setMundo(gerado);
        setErro(null);
      } catch (erroGerado) {
        setErro(erroGerado instanceof Error ? erroGerado.message : String(erroGerado));
      } finally {
        setCarregando(false);
      }
    }, 0);
  }, []);

  const aoGerar = useCallback(() => {
    const numero = Number(seedDigitada.replace(/\D/g, ""));
    const novaSeed = Number.isFinite(numero) && numero > 0 ? numero : SEED_PADRAO;
    setSeed(novaSeed);
    gerar(novaSeed);
  }, [seedDigitada, gerar]);

  if (mundo === null) {
    return (
      <main className="tela-inicial">
        <h1>Football Manager</h1>
        <p className="subtitulo">Simulador de gestor com mundo real</p>
        <label className="campo">
          <span>Seed do mundo</span>
          <input
            type="text"
            inputMode="numeric"
            value={seedDigitada}
            onChange={(evento) => setSeedDigitada(evento.target.value)}
          />
        </label>
        <button type="button" onClick={aoGerar} disabled={carregando}>
          {carregando ? "Gerando..." : "Iniciar"}
        </button>
        {erro !== null && <p className="erro">{erro}</p>}
        <ul className="lista-ligas">
          {ligasAtivas.map((liga) => (
            <li key={liga}>Liga {liga}</li>
          ))}
        </ul>
      </main>
    );
  }

  return (
    <Dashboard
      mundo={mundo}
      seed={seed}
      onTrocarSeed={aoGerar}
      seedDigitada={seedDigitada}
      onSeedDigitada={setSeedDigitada}
    />
  );
}