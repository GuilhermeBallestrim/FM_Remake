/**
 * Gera os dados do jogo a partir dos documentos de especificacao.
 *
 * Le `LIGAS.md` e `ELENCO.md` e escreve JSON em `src/data/dados/`:
 * - `ligas.json`: ligas, clubes, cores, estadium, reputacao e rivais
 * - `elencoBase.json`: snapshot de jogadores conhecidos e pools de nomes por pais
 *
 * Regra do projeto: o markdown manda. Se voce editar `LIGAS.md`, rode
 * `npm run gerar:dados` e o codigo inteiro passa a refletir a mudanca.
 *
 * Uso: `npm run gerar:dados`
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(aqui, "..");
const saidaDados = resolve(raiz, "src", "data", "dados");

/** Liga lida de `LIGAS.md`. */
interface LigaLida {
  id: string;
  nome: string;
  nomeCurto: string;
  pais: string;
  copaNacional: string;
  continental: string;
  supercopa: string;
  rodadas: number;
  ativa: boolean;
}

/** Clube lido de `LIGAS.md`. */
interface ClubeLido {
  id: string;
  nome: string;
  ligaId: string;
  cidade: string;
  cores: { primaria: string; secundaria: string };
  estadio: string;
  capacidade: number;
  reputacao: number;
  orcamentoCr: number;
  folhaSalarialAlvoCr: number;
  ambicao: number;
  rivalPrincipal?: string;
}

/** Jogador do snapshot lido de `ELENCO.md`. */
interface JogadorSnapshot {
  clubeId: string;
  nome: string;
  posicao: string;
}

/** Pool de nomes de um pais. */
interface Pool {
  primeiros: string[];
  sobrenomes: string[];
}

/** Resultado da geracao. */
interface DadosGerados {
  ligas: LigaLida[];
  clubes: ClubeLido[];
  snapshot: JogadorSnapshot[];
  pools: Record<string, Pool>;
}

/**
 * Le um arquivo de texto da raiz do projeto.
 *
 * @param nome - nome do arquivo
 * @returns conteudo do arquivo
 */
function ler(nome: string): string {
  return readFileSync(resolve(raiz, nome), "utf8");
}

/**
 * Converte numero no formato brasileiro ("53.400", "9,5") para number.
 *
 * @param texto - numero como texto
 * @returns numero ou 0 se invalido
 */
function numero(texto: string): number {
  const limpo = texto.trim().replace(/"/g, "");
  if (limpo.length === 0) {
    return 0;
  }
  if (limpo.includes(",")) {
    return Number(limpo.replace(/\./g, "").replace(",", "."));
  }
  const valor = Number(limpo.replace(/\./g, ""));
  return Number.isFinite(valor) ? valor : 0;
}

/** Remove acentos e deixa em minusculas, para comparar rotulos. */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Divide uma linha de tabela markdown em celulas, ignorando o pipe final. */
function celulas(linha: string): string[] {
  const semBorda = linha.trim().replace(/^\|/, "").replace(/\|$/, "");
  return semBorda.split("|").map((c) => c.trim());
}

/**
 * Interpreta `LIGAS.md` e devolve ligas, clubes e rivalidades.
 *
 * @param markdown - conteudo de `LIGAS.md`
 * @returns ligas, clubes e mapa de rivais
 */
function lerLigas(
  markdown: string
): { ligas: LigaLida[]; clubes: ClubeLido[]; rivais: Map<string, string> } {
  const linhas = markdown.split(/\r?\n/);
  const ligas: LigaLida[] = [];
  const clubes: ClubeLido[] = [];
  const rivais = new Map<string, string>();
  const prefixes = new Set<string>();

  for (const linha of linhas) {
    // Cabecalho de liga: | `ENG` — Premier League | Inglaterra | ...
    const cabLiga = linha.match(/^\|\s*`((?:ENG|ESP|ITA|BRA))`\s+—\s+(.+?)\s*\|/);
    if (cabLiga) {
      const prefixo = cabLiga[1] as string;
      const nome = (cabLiga[2] as string).trim();
      const celulasLinha = celulas(linha);
      prefixes.add(prefixo);
      ligas.push({
        id: prefixo,
        nome,
        nomeCurto: normalizar(nome).includes("campeonato brasileiro")
          ? "Brasileirao"
          : nome,
        pais: celulasLinha[2] ?? "",
        copaNacional: celulasLinha[5] ?? "",
        continental: celulasLinha[6] ?? "",
        supercopa: celulasLinha[2]?.includes("Inglaterra")
          ? "Community Shield"
          : celulasLinha[2]?.includes("Espanha")
            ? "Supercopa de Espana"
            : "Supercoppa Italiana",
        rodadas: 38,
        ativa: true
      });
      continue;
    }

    // Linha de clube: | ENG01 | Manchester City | Manchester | `#6CABDD` / `#1C2C5B` | ...
    const celulaClube = linha.match(
      /^\|\s*((?:ENG|ESP|ITA|BRA)\d{2})\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/
    );
    if (celulaClube) {
      const id = celulaClube[1] as string;
      const prefixo = id.slice(0, 3);
      const coresTexto = celulaClube[4] as string;
      const cores = [...coresTexto.matchAll(/#[0-9A-Fa-f]{6}/g)].map((m) => m[0]);
      const temAmbicao = celulaClube.length > 10;

      clubes.push({
        id,
        nome: celulaClube[2] as string,
        ligaId: prefixo,
        cidade: celulaClube[3] as string,
        cores: {
          primaria: (cores[0] ?? "#FFFFFF").toUpperCase(),
          secundaria: (cores[1] ?? "#111111").toUpperCase()
        },
        estadio: (celulaClube[5] as string).replace(/`/g, "").trim(),
        capacidade: numero(celulaClube[6] as string),
        reputacao: numero(celulaClube[7] as string),
        orcamentoCr: numero(celulaClube[8] as string) * 1_000_000,
        folhaSalarialAlvoCr: numero(celulaClube[9] as string) * 1_000_000,
        ambicao: temAmbicao ? numero(celulaClube[10] as string) : 1
      });
      continue;
    }

    // Derby: | ENG01 x ENG02 | Derby de Manchester | ...
    const derby = linha.match(/^\|\s*((?:ENG|ESP|BRA|ITA)\d{2})\s+x\s+((?:ENG|ESP|BRA|ITA)\d{2})\s*\|/);
    if (derby) {
      const a = derby[1] as string;
      const b = derby[2] as string;
      rivais.set(a, b);
      rivais.set(b, a);
    }
  }

  // Preenche o rival principal quando o doc nao listou (ou quando o par nao existe).
  for (const clube of clubes) {
    const rival = rivais.get(clube.id);
    if (!rival) {
      const mesmaLiga = clubes.filter((c) => c.ligaId === clube.ligaId && c.id !== clube.id);
      const maisProximo = mesmaLiga.sort(
        (a, b) => Math.abs(b.reputacao - clube.reputacao) - Math.abs(a.reputacao - clube.reputacao)
      )[0];
      if (maisProximo) {
        rivais.set(clube.id, maisProximo.id);
      }
    }
    if (rivais.has(clube.id)) {
      clube.rivalPrincipal = rivais.get(clube.id);
    }
  }

  // Cada linha precisa ter 20 clubes; caso contrario o documento mudou de formato.
  for (const liga of ligas) {
    const daLiga = clubes.filter((c) => c.ligaId === liga.id);
    if (daLiga.length !== 20) {
      throw new Error(
        `gerarDados: liga ${liga.id} tem ${daLiga.length} clubes, esperado 20. Verifique LIGAS.md.`
      );
    }
  }

  void prefixes;
  return { ligas, clubes, rivais };
}

/**
 * Interpreta `ELENCO.md` e devolve o snapshot de jogadores e os pools de nomes.
 *
 * @param markdown - conteudo de `ELENCO.md`
 * @returns snapshot e pools por codigo de pais
 */
function lerElenco(markdown: string): { snapshot: JogadorSnapshot[]; pools: Record<string, Pool> } {
  const linhas = markdown.split(/\r?\n/);
  const snapshot: JogadorSnapshot[] = [];
  const pools: Record<string, Pool> = {};
  let regiaoAtual = "";

  for (const linha of linhas) {
    // Linha de pool: **Ingles:** Harry, Jack, Ollie, ...
    const rotulo = linha.match(/^\*\*([^*]+?):\*\*\s*(.+)$/);
    if (rotulo && rotulo[2]) {
      regiaoAtual = paisDaRegiao(rotulo[1] as string);
      pools[regiaoAtual] = pools[regiaoAtual] ?? { primeiros: [], sobrenomes: [] };
      pools[regiaoAtual].primeiros = (rotulo[2] as string)
        .split(",")
        .map((n) => n.trim())
        .filter((n) => n.length > 0 && !n.endsWith("."));
      continue;
    }

    // Sobrenomes da regiao atual.
    const sobrenomes = linha.match(/^Sobrenomes:\s*(.+)$/);
    if (sobrenomes && regiaoAtual) {
      pools[regiaoAtual] = pools[regiaoAtual] ?? { primeiros: [], sobrenomes: [] };
      pools[regiaoAtual].sobrenomes = (sobrenomes[1] as string)
        .split(",")
        .map((n) => n.trim())
        .filter((n) => n.length > 0 && !n.endsWith("."));
      regiaoAtual = "";
      continue;
    }

    // Linha de snapshot: | ENG01 Manchester City | Haaland (ATA), Odegaard (MEI) | ...
    const linhaSnapshot = linha.match(
      /^\|\s*((?:ENG|ESP|ITA|BRA)\d{2})\s+[^|]*\|\s*([^|]+?)\s*\|\s*$/
    );
    if (linhaSnapshot) {
      const clubeId = linhaSnapshot[1] as string;
      const elenco = linhaSnapshot[2] as string;
      for (const bruto of elenco.split(",")) {
        const texto = bruto.trim();
        const match = texto.match(/^(.+?)\s*\(([A-Z]{2,3})\)$/);
        if (!match) {
          continue;
        }
        let nome = (match[1] as string).trim();
        // O snapshot pode listar "A e B (POS)": fica com o segundo nome.
        if (nome.includes(" e ")) {
          nome = (nome.split(" e ").pop() as string).trim();
        }
        const posicao = match[2] as string;
        if (nome.length > 2 && posicao.length >= 2) {
          snapshot.push({ clubeId, nome, posicao });
        }
      }
    }
  }

  // Remove duplicados de nome (o mesmo athlete pode aparecer em duas linhas).
  const vistos = new Set<string>();
  const unicos = snapshot.filter((j) => {
    const chave = normalizar(j.nome);
    if (vistos.has(chave)) {
      return false;
    }
    vistos.add(chave);
    return true;
  });

  for (const pool of Object.values(pools)) {
    if (pool.primeiros.length === 0 || pool.sobrenomes.length === 0) {
      throw new Error("gerarDados: pool de nomes incompleto; verifique ELENCO.md secao 5.1");
    }
  }

  if (unicos.length < 200) {
    throw new Error(`gerarDados: snapshot com apenas ${unicos.length} jogadores; verifique ELENCO.md`);
  }

  return { snapshot: unicos, pools };
}

/**
 * Converte o rotulo de uma regiao de nomes no codigo de pais.
 *
 * @param rotulo - rotulo como "Ingles" ou "Alemao/holandeses/etc."
 * @returns codigo de pais
 */
function paisDaRegiao(rotulo: string): string {
  const normal = normalizar(rotulo);
  if (normal.startsWith("ingles")) {
    return "ENG";
  }
  if (normal.startsWith("espanhol")) {
    return "ESP";
  }
  if (normal.startsWith("italiano")) {
    return "ITA";
  }
  if (normal.startsWith("brasileiro")) {
    return "BRA";
  }
  if (normal.startsWith("frances")) {
    return "FRA";
  }
  return "ALE";
}

/**
 * Mantem as escolhas manuais do arquivo JSON existente (por exemplo, desativar
 * uma liga opcional) quando a geracao roda de novo.
 *
 * @param caminho - caminho do JSON de saida
 * @param ligas - ligas recem-lidas
 */
function preservarAtivas(caminho: string, ligas: LigaLida[]): LigaLida[] {
  if (!existsSync(caminho)) {
    return ligas;
  }
  try {
    const anterior = JSON.parse(readFileSync(caminho, "utf8")) as { ligas: LigaLida[] };
    const porId = new Map(anterior.ligas.map((l) => [l.id, l]));
    for (const liga of ligas) {
      const antiga = porId.get(liga.id);
      if (antiga && typeof antiga.ativa === "boolean") {
        liga.ativa = antiga.ativa;
      }
    }
  } catch {
    // JSON corrompido: segue com os valores novos.
  }
  return ligas;
}

/** Funcao principal: le os documentos e escreve os JSON. */
function principal(): void {
  const markdownLigas = ler("LIGAS.md");
  const markdownElenco = ler("ELENCO.md");

  const { ligas: ligasLidas, clubes } = lerLigas(markdownLigas);
  const { snapshot, pools } = lerElenco(markdownElenco);

  mkdirSync(saidaDados, { recursive: true });

  const caminhoLigas = resolve(saidaDados, "ligas.json");
  const ligas = preservarAtivas(caminhoLigas, ligasLidas);

  const dados: DadosGerados = { ligas, clubes, snapshot, pools };

  writeFileSync(caminhoLigas, `${JSON.stringify({ ligas, clubes }, null, 2)}\n`, "utf8");
  writeFileSync(
    resolve(saidaDados, "elencoBase.json"),
    `${JSON.stringify({ snapshot, pools }, null, 2)}\n`,
    "utf8"
  );

  const clubesAtivos = clubes.filter((c) =>
    ligas.find((l) => l.id === c.ligaId)?.ativa
  ).length;

  console.log("gerarDados: ok");
  console.log(`  ligas lidas      : ${ligas.length} (ativas: ${ligas.filter((l) => l.ativa).length})`);
  console.log(`  clubes lidos     : ${clubes.length} (ativos: ${clubesAtivos})`);
  console.log(`  jogadores fixos  : ${snapshot.length}`);
  console.log(`  pools de nomes   : ${Object.keys(pools).join(", ")}`);
  console.log(`  saida            : ${saidaDados}`);
  void dados;
}

principal();