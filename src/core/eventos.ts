/**
 * Sistema de eventos (pub/sub) para desacoplar simulação da UI.
 * A UI só escuta; a simulação só emite.
 */

export type EventoTipo =
  | "partida:iniciada"
  | "partida:evento"
  | "partida:intervalo"
  | "partida:fim"
  | "temporada:rodada_iniciada"
  | "temporada:rodada_fim"
  | "temporada:fim"
  | "clube:financas_atualizadas"
  | "clube:elenco_atualizado"
  | "jogador:lesao"
  | "jogador:suspensao"
  | "jogador:moral_alterada"
  | "jogador:atributo_alterado"
  | "mercado:proposta_recebida"
  | "mercado:proposta_aceita"
  | "mercado:proposta_recusada"
  | "mercado:transferencia_concluida"
  | "mercado:emprestimo_concluido"
  | "diretoria:objetivo_atualizado"
  | "diretoria:aviso"
  | "diretoria:demissao"
  | "ui:notificacao"
  | "save:criado"
  | "save:carregado";

export interface EventoBase {
  tipo: EventoTipo;
  timestamp: number; // dias desde epoch do jogo
  temporada: number;
}

export interface EventoPartidaIniciada extends EventoBase {
  tipo: "partida:iniciada";
  payload: { mandanteId: string; visitanteId: string; data: string };
}

export interface EventoPartidaEvento extends EventoBase {
  tipo: "partida:evento";
  payload: {
    partidaId: string;
    minuto: number;
    tipo: string;
    timeId: string;
    jogadorId?: string;
    descricao: string;
  };
}

export interface EventoPartidaFim extends EventoBase {
  tipo: "partida:fim";
  payload: {
    partidaId: string;
    mandanteId: string;
    visitanteId: string;
    golsMandante: number;
    golsVisitante: number;
  };
}

export interface EventoTemporadaRodadaFim extends EventoBase {
  tipo: "temporada:rodada_fim";
  payload: { ligaId: string; rodada: number; classificacao: ClassificacaoResumida[] };
}

export interface ClassificacaoResumida {
  timeId: string;
  posicao: number;
  pontos: number;
  jogos: number;
  saldoGols: number;
}

export interface EventoClubeFinancasAtualizadas extends EventoBase {
  tipo: "clube:financas_atualizadas";
  payload: { clubeId: string; saldo: number; receita: number; despesa: number };
}

export interface EventoJogadorLesao extends EventoBase {
  tipo: "jogador:lesao";
  payload: { jogadorId: string; clubeId: string; tipo: string; dias: number };
}

export interface EventoMercadoTransferencia extends EventoBase {
  tipo: "mercado:transferencia_concluida";
  payload: {
    jogadorId: string;
    clubeOrigemId: string;
    clubeDestinoId: string;
    valorCr: number;
    tipo: "definitiva" | "emprestimo";
  };
}

export interface EventoDiretoriaAviso extends EventoBase {
  tipo: "diretoria:aviso";
  payload: { clubeId: string; mensagem: string; nivel: "info" | "alerta" | "critico" };
}

export interface EventoNotificacao extends EventoBase {
  tipo: "ui:notificacao";
  payload: { id: string; titulo: string; mensagem: string; prioridade: "baixa" | "normal" | "alta" | "critica"; lida: false };
}

export type EventoJogo =
  | EventoPartidaIniciada
  | EventoPartidaEvento
  | EventoPartidaFim
  | EventoTemporadaRodadaFim
  | EventoClubeFinancasAtualizadas
  | EventoJogadorLesao
  | EventoMercadoTransferencia
  | EventoDiretoriaAviso
  | EventoNotificacao
  | EventoBase;

type Listener = (evento: EventoJogo) => void;

const listeners: Map<EventoTipo, Set<Listener>> = new Map();
const listenersAll: Set<Listener> = new Set();

export function on(tipo: EventoTipo, listener: Listener): () => void {
  if (!listeners.has(tipo)) listeners.set(tipo, new Set());
  listeners.get(tipo)!.add(listener);
  return () => off(tipo, listener);
}

export function onAll(listener: Listener): () => void {
  listenersAll.add(listener);
  return () => listenersAll.delete(listener);
}

function off(tipo: EventoTipo, listener: Listener): void {
  listeners.get(tipo)?.delete(listener);
}

export function emit(evento: EventoJogo): void {
  const especificos = listeners.get(evento.tipo);
  if (especificos) {
    for (const l of especificos) {
      try {
        l(evento);
      } catch (e) {
        console.error(`Erro no listener de ${evento.tipo}:`, e);
      }
    }
  }
  for (const l of listenersAll) {
    try {
      l(evento);
    } catch (e) {
      console.error("Erro no listener global:", e);
    }
  }
}

/** Helper para emitir notificação de UI */
export function notificar(
  titulo: string,
  mensagem: string,
  prioridade: "baixa" | "normal" | "alta" | "critica" = "normal"
): void {
  emit({
    tipo: "ui:notificacao",
    timestamp: Date.now(),
    temporada: 0, // será preenchido pelo store
    payload: {
      id: crypto.randomUUID(),
      titulo,
      mensagem,
      prioridade,
      lida: false
    }
  });
}