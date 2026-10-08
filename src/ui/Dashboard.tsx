/**
 * Dashboard da Fase 0.
 *
 * Mostra o que o criterio de aceitacao 4 exige: classificacao, caixa e proximo
 * jogo, com dados reais da simulacao. As demais telas (elenco em grade densa,
 * taticas, mercado) entram nas fases seguintes.
 */

import { useCallback, useMemo, useState } from "react";
import { formatarCurto, textoParaDia } from "@/core/calendario";
import type { Mundo } from "@/domain/tipos";
import { fecharTemporada, formatarCr } from "@/systems/financas";
import { prepararLiga, proximoJogo, simularRodada, simularTemporada } from "@/sim/temporada";
import type { EstadoLiga, TemporadaSimulada } from "@/sim/temporada";
import { t } from "@/i18n";

/** Props do dashboard. */
export interface PropsDashboard {
  mundo: Mundo;
  seed: number;
  seedDigitada: string;
  onTrocarSeed: () => void;
  onSeedDigitada: (valor: string) => void;
}

/**
 * Painel principal.
 *
 * @param props - mundo e controles de seed
 * @returns dashboard renderizado
 */
export function Dashboard(props: PropsDashboard): JSX.Element {
  const { mundo, seedDigitada, onTrocarSeed, onSeedDigitada } = props;

  const ligasAtivas = useMemo(
    () => mundo.ligas.filter((liga) => liga.ativa),
    [mundo]
  );

  const [ligaId, setLigaId] = useState<string>(ligasAtivas[0]?.id ?? "ENG");
  const [clubeId, setClubeId] = useState<string>(
    mundo.clubes.find((c) => c.ligaId === (ligasAtivas[0]?.id ?? "ENG"))?.id ?? ""
  );

  const [estado, setEstado] = useState<EstadoLiga | null>(null);
  const [temporada, setTemporada] = useState<TemporadaSimulada | null>(null);
  const [financeiro, setFinanceiro] = useState<Map<string, number> | null>(null);

  const clubesDaLiga = useMemo(
    () => mundo.clubes.filter((c) => c.ligaId === ligaId),
    [mundo, ligaId]
  );

  const clube = useMemo(
    () => mundo.clubes.find((c) => c.id === clubeId) ?? clubesDaLiga[0] ?? null,
    [mundo, clubeId, clubesDaLiga]
  );

  const elenco = useMemo(
    () => (clube ? (mundo.elencosPorClube.get(clube.id) ?? []) : []),
    [mundo, clube]
  );

  const mediaElenco = useMemo(() => {
    if (elenco.length === 0) {
      return 0;
    }
    const soma = elenco.reduce((total, j) => total + j.overall, 0);
    return (soma / elenco.length).toFixed(1);
  }, [elenco]);

  const folhaSalarial = useMemo(
    () => elenco.reduce((total, j) => total + j.contrato.salarioAnualCr, 0),
    [elenco]
  );

  const aoTrocarLiga = useCallback(
    (novoLigaId: string) => {
      setLigaId(novoLigaId);
      const primeiro = mundo.clubes.find((c) => c.ligaId === novoLigaId);
      setClubeId(primeiro?.id ?? "");
      setEstado(null);
      setTemporada(null);
      setFinanceiro(null);
    },
    [mundo]
  );

  const simularProximaRodada = useCallback(() => {
    const atual = estado ?? prepararLiga(mundo, ligaId, 2025);
    simularRodada(atual, mundo, mundo.seed + 2025);
    setEstado(atual);
    if (atual.rodadaAtual > atual.rodadas.length) {
      const completa = simularTemporada(mundo, ligaId, 2025);
      setTemporada(completa);
    }
  }, [estado, mundo, ligaId]);

  const simularTudo = useCallback(() => {
    const completa = simularTemporada(mundo, ligaId, 2025);
    setTemporada(completa);
    setEstado(completa.estado);

    const posicoes = new Map<string, number>();
    for (const linha of completa.classificacao) {
      posicoes.set(linha.clubeId, linha.posicao);
    }
    const todosOsResultados = completa.estado.resultados;
    const fechado = fecharTemporada(mundo, todosOsResultados, posicoes);
    setFinanceiro(new Map([...fechado.porClube].map(([id, f]) => [id, f.saldoCr])));
  }, [mundo, ligaId]);

  const proximo = useMemo(
    () => (estado && clube ? proximoJogo(estado, clube.id) : undefined),
    [estado, clube]
  );

  const classificacao = temporada?.classificacao ?? [];
  const rodadasRestantes = estado
    ? Math.max(0, estado.rodadas.length - (estado.rodadaAtual - 1))
    : estado === null
      ? 38
      : 0;

  const saldo = financeiro && clube ? (financeiro.get(clube.id) ?? clube.orcamentoCr) : clube?.orcamentoCr ?? 0;

  return (
    <div className="dashboard">
      <header className="cabecalho">
        <div>
          <h1>{t("ui.dashboard.titulo")}</h1>
          <p className="subtitulo">
            {clube ? clube.nome : t("ui.dashboard.semClube")} ·{" "}
            {ligasAtivas.find((l) => l.id === ligaId)?.nome ?? ligaId}
          </p>
        </div>
        <div className="controle-seed">
          <label className="campo">
            <span>{t("ui.dashboard.seed")}</span>
            <input
              type="text"
              inputMode="numeric"
              value={seedDigitada}
              onChange={(evento) => onSeedDigitada(evento.target.value)}
            />
          </label>
          <button type="button" onClick={onTrocarSeed}>
            {t("ui.dashboard.gerar")}
          </button>
        </div>
      </header>

      <section className="seletores">
        <label className="campo">
          <span>{t("ui.dashboard.liga")}</span>
          <select value={ligaId} onChange={(evento) => aoTrocarLiga(evento.target.value)}>
            {ligasAtivas.map((liga) => (
              <option key={liga.id} value={liga.id}>
                {liga.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="campo">
          <span>{t("ui.dashboard.clube")}</span>
          <select value={clube?.id ?? ""} onChange={(evento) => setClubeId(evento.target.value)}>
            {clubesDaLiga.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>

        <button type="button" onClick={simularProximaRodada}>
          {t("ui.dashboard.simularRodada")}
        </button>
        <button type="button" onClick={simularTudo}>
          {t("ui.dashboard.simularTemporada")}
        </button>
      </section>

      <section className="cartoes">
        <div className="cartao">
          <span>{t("ui.dashboard.caixa")}</span>
          <strong>{formatarCr(saldo)}</strong>
        </div>
        <div className="cartao">
          <span>{t("ui.dashboard.orcamento")}</span>
          <strong>{formatarCr(clube?.orcamentoCr ?? 0)}</strong>
        </div>
        <div className="cartao">
          <span>{t("ui.dashboard.folha")}</span>
          <strong>{formatarCr(folhaSalarial)}</strong>
        </div>
        <div className="cartao">
          <span>{t("ui.dashboard.elencoMedio")}</span>
          <strong>{mediaElenco}</strong>
        </div>
        <div className="cartao">
          <span>{t("ui.dashboard.jogosRestantes")}</span>
          <strong>{rodadasRestantes}</strong>
        </div>
        <div className="cartao">
          <span>{t("ui.dashboard.mediaGols")}</span>
          <strong>{temporada ? temporada.mediaGolsPorJogo : "—"}</strong>
        </div>
      </section>

      <section className="painel-duplo">
        <div className="painel">
          <h2>{t("ui.dashboard.classificacao")}</h2>
          {classificacao.length === 0 ? (
            <p className="vazio">{t("ui.dashboard.colunaVazio")}</p>
          ) : (
            <table className="tabela">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t("ui.dashboard.clube")}</th>
                  <th>{t("ui.dashboard.jogos")}</th>
                  <th>{t("ui.dashboard.pontos")}</th>
                  <th>{t("ui.dashboard.gols")}</th>
                  <th>{t("ui.dashboard.saldo")}</th>
                </tr>
              </thead>
              <tbody>
                {classificacao.slice(0, 20).map((linha) => (
                  <tr
                    key={linha.clubeId}
                    className={linha.clubeId === clube?.id ? "destaque" : undefined}
                  >
                    <td>{linha.posicao}</td>
                    <td>{linha.nome}</td>
                    <td>{linha.jogos}</td>
                    <td>{linha.pontos}</td>
                    <td>{linha.golsPro}</td>
                    <td>{linha.saldo > 0 ? `+${linha.saldo}` : linha.saldo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="painel">
          <h2>{t("ui.dashboard.proximoJogo")}</h2>
          {proximo && clube ? (
            <div className="proximo">
              <span>
                {t("ui.dashboard.rodada")} {proximo.rodada} ·{" "}
                {formatarCurto(textoParaDia(proximo.data))}
              </span>
              <strong>
                {nomeDoClube(mundo, proximo.mandanteId)} {proximo.mandanteId === clube.id ? "(mandante)" : ""}
              </strong>
              <span>
                {nomeDoClube(mundo, proximo.visitanteId)}{" "}
                {proximo.visitanteId === clube.id ? "(mandante)" : ""}
              </span>
            </div>
          ) : (
            <p className="vazio">{t("ui.dashboard.temporadaEncerrada")}</p>
          )}

          <h2>{t("ui.dashboard.ultimosResultados")}</h2>
          {estado && estado.resultados.length > 0 ? (
            <ul className="resultados">
              {estado.resultados
                .filter(
                  (r) => r.mandanteId === clube?.id || r.visitanteId === clube?.id
                )
                .slice(-6)
                .reverse()
                .map((resultado) => (
                  <li key={`${resultado.rodada}-${resultado.mandanteId}`}>
                    <span>R{resultado.rodada}</span>
                    <span>{nomeDoClube(mundo, resultado.mandanteId)}</span>
                    <strong>
                      {resultado.golsMandante} - {resultado.golsVisitante}
                    </strong>
                    <span>{nomeDoClube(mundo, resultado.visitanteId)}</span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="vazio">{t("ui.dashboard.colunaVazio")}</p>
          )}
        </div>
      </section>

      <section className="painel">
        <h2>{t("ui.dashboard.elenco")}</h2>
        <table className="tabela">
          <thead>
            <tr>
              <th>{t("ui.dashboard.clube")}</th>
              <th>{t("ui.dashboard.posicao")}</th>
              <th>{t("ui.dashboard.idade")}</th>
              <th>{t("ui.dashboard.geral")}</th>
              <th>{t("ui.dashboard.potencial")}</th>
              <th>{t("ui.dashboard.salario")}</th>
            </tr>
          </thead>
          <tbody>
            {[...elenco]
              .sort((a, b) => b.overall - a.overall || a.nome.localeCompare(b.nome, "pt-BR"))
              .slice(0, 18)
              .map((jogador) => (
                <tr key={jogador.id}>
                  <td>{jogador.nome}</td>
                  <td>{jogador.posicao}</td>
                  <td>{jogador.idade}</td>
                  <td>{jogador.overall}</td>
                  <td>{jogador.potencial}</td>
                  <td>{formatarCr(jogador.contrato.salarioAnualCr)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

/** Nome do clube pelo id. */
function nomeDoClube(mundo: Mundo, clubeId: string): string {
  return mundo.clubes.find((c) => c.id === clubeId)?.nome ?? clubeId;
}