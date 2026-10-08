# LOCALIZACAO.md — Internacionalização (i18n)

> Entrada obrigatória do projeto. Define como o jogo suporta pt-BR, pt-PT e en
> sem strings hardcoded na interface.

---

## 1. Objetivo

- Zero strings literais em componentes de UI.
- Tradução centralizada em arquivos JSON por idioma.
- Fallback automático para pt-BR.
- Detecção de chaves faltando em desenvolvimento.

---

## 2. Estrutura de chaves

### 2.1 Convenção de nomes

```
namespace.secao.componente.chave
```

Exemplos:
- `ui.menu.botao.iniciarJogo`
- `ui.dashboard.titulo.classificacao`
- `ui.elenco.coluna.nome`
- `ui.taticas.campo.posicao.gol`
- `narracao.evento.gol.normal`
- `sistema.erro.saveCorrompido`

### 2.2 Regras

| Regra | Descrição |
|---|---|
| Minúsculas | Tudo em lowerCase com ponto como separador |
| Namespaces | `ui`, `narracao`, `sistema`, `menu`, `elenco`, `taticas`, `mercado`, `financas`, `partida` |
| Profundidade máxima | 5 níveis (namespace.secao.componente.sub.chave) |
| Ordem alfabética | Obrigatória dentro de cada arquivo JSON |
| Sem duplicatas | Uma chave aparece uma única vez |

---

## 3. Onde ficam os arquivos

```
src/
  i18n/
    index.ts           # API pública (t(), validarChaves, etc.)
    pt-BR.json         # Português do Brasil (referência)
    pt-PT.json         # Português de Portugal
    en.json            # Inglês
    chavesNaoTraduzidas.json  # lista de nomes próprios que NÃO se traduzem
```

### 3.1 Formato do JSON

```json
{
  "ui": {
    "menu": {
      "botao": {
        "iniciarJogo": "Iniciar jogo",
        "continuar": "Continuar",
        "carregar": "Carregar",
        "definicoes": "Definições",
        "creditos": "Créditos",
        "sair": "Sair"
      },
      "titulo": "Football Manager"
    },
    "dashboard": {
      "titulo": {
        "classificacao": "Classificação",
        "proximoJogo": "Próximo jogo",
        "caixa": "Caixa do clube"
      }
    }
  },
  "narracao": {
    "evento": {
      "gol": {
        "normal": "{minuto}' — GOOOL! {jogador} marca para o {time}!",
        "contraAtaque": "{minuto}' — Contragolpe! {jogador} define para o {time}!"
      }
    }
  }
}
```

- Indentação: 2 espaços
- Sem comentários no JSON (use este documento como referência)
- Aspas duplas obrigatórias
- Vírgula final proibida no último item

---

## 4. Código: `src/i18n/index.ts`

```ts
type IdiomaSuportado = "pt-BR" | "pt-PT" | "en";

type ChaveTraducao = string; // validador em tempo de build checa se existe

interface ParametrosTraducao {
  [chave: string]: string | number;
}

let idiomaAtual: IdiomaSuportado = "pt-BR";
const cache: Record<IdiomaSuportado, Record<string, string>> = {
  "pt-BR": {},
  "pt-PT": {},
  en: {}
};
const chavesNaoTraduzidas: Set<string> = new Set();

/**
 * Carrega os arquivos de tradução (chamado uma vez no bootstrap)
 */
export async function carregarTraducao(): Promise<void> {
  const [ptBR, ptPT, en, naoTrad] = await Promise.all([
    import("./pt-BR.json"),
    import("./pt-PT.json"),
    import("./en.json"),
    import("./chavesNaoTraduzidas.json")
  ]);
  
  cache["pt-BR"] = achatar(ptBR.default);
  cache["pt-PT"] = achatar(ptPT.default);
  cache.en = achatar(en.default);
  chavesNaoTraduzidas.addAll(naoTrad.default);
}

/**
 * Função principal de tradução
 * @param chave - ex.: "ui.menu.botao.iniciarJogo"
 * @param params - ex.: { jogador: "Haaland", minuto: 23 }
 */
export function t(chave: ChaveTraducao, params?: ParametrosTraducao): string {
  const dict = cache[idiomaAtual] || cache["pt-BR"];
  let template = dict[chave];
  
  if (!template) {
    // Fallback para pt-BR
    template = cache["pt-BR"][chave];
    
    if (!template) {
      // Desenvolvimento: avisa no console
      if (import.meta.env.DEV) {
        console.warn(`[i18n] Chave faltando: "${chave}" em ${idiomaAtual}`);
      }
      // Último recurso: devolve a própria chave
      return chave;
    }
  }
  
  // Interpolação simples {chave}
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      template = template.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  
  return template;
}

/**
 * Define o idioma ativo
 */
export function definirIdioma(idioma: IdiomaSuportado): void {
  if (cache[idioma]) {
    idiomaAtual = idioma;
  }
}

/**
 * Valida se todas as chaves existem em todos os idiomas
 * Usado em teste automatizado
 */
export function validarChaves(): { faltando: string[]; sobrando: string[] } {
  const ref = Object.keys(cache["pt-BR"]).sort();
  const faltando: string[] = [];
  const sobrando: string[] = [];
  
  for (const idioma of ["pt-PT", "en"] as IdiomaSuportado[]) {
    const keys = Object.keys(cache[idioma]).sort();
    for (const k of ref) {
      if (!keys.includes(k)) faltando.push(`${idioma}: ${k}`);
    }
    for (const k of keys) {
      if (!ref.includes(k)) sobrando.push(`${idioma}: ${k}`);
    }
  }
  
  return { faltando, sobrando };
}

/**
 * Achata objeto aninhado em chaves com ponto
 * { ui: { menu: { botao: "X" } } } -> { "ui.menu.botao": "X" }
 */
function achatar(obj: Record<string, any>, prefixo = ""): Record<string, string> {
  const resultado: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const chave = prefixo ? `${prefixo}.${k}` : k;
    if (typeof v === "string") {
      resultado[chave] = v;
    } else if (typeof v === "object" && v !== null) {
      Object.assign(resultado, achatar(v, chave));
    }
  }
  return resultado;
}
```

---

## 5. Parâmetros e interpolação

### 5.1 Sintaxe

```ts
t("narracao.evento.gol.normal", { 
  minuto: 23, 
  jogador: "Haaland", 
  time: "Manchester City" 
});
// "23' — GOOOL! Haaland marca para o Manchester City!"
```

### 5.2 Pluralização

Português (pt-BR e pt-PT) tem 2 formas: singular (1) e plural (≠1).
Inglês tem 2 formas: one (1) e other (≠1).

**Declaração no JSON:**

```json
{
  "ui": {
    "elenco": {
      "gols": {
        "singular": "{count} gol",
        "plural": "{count} gols"
      }
    }
  }
}
```

**Helper de plural:**

```ts
export function tPlural(
  chaveSingular: string,
  chavePlural: string,
  count: number,
  params?: ParametrosTraducao
): string {
  const chave = count === 1 ? chaveSingular : chavePlural;
  return t(chave, { ...params, count });
}
```

Uso: `tPlural("ui.elenco.gols.singular", "ui.elenco.gols.plural", gols, { jogador: "Haaland" })`

---

## 6. Formatação por idioma

| Item | pt-BR | pt-PT | en |
|---|---|---|---|
| Decimal | `1.234,56` | `1.234,56` | `1,234.56` |
| Milhar | `.` | `.` | `,` |
| Moeda (CR) | `CR 1.234.567` | `1.234.567 CR` | `CR 1,234,567` |
| Porcentagem | `75%` | `75%` | `75%` |
| Data curta | `dd/MM/yyyy` | `dd/MM/yyyy` | `MM/dd/yyyy` |
| Data longa | `dd 'de' MMMM 'de' yyyy` | `dd 'de' MMMM 'de' yyyy` | `MMMM dd, yyyy` |

**Helper de formatação:**

```ts
export function formatarNumero(valor: number, opcoes?: Intl.NumberFormatOptions): string {
  const locale = idiomaAtual === "en" ? "en-US" : "pt-BR";
  return new Intl.NumberFormat(locale, opcoes).format(valor);
}

export function formatarMoeda(valor: number): string {
  return formatarNumero(valor, { 
    style: "currency", 
    currency: "CR", 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  });
}

export function formatarData(data: Date, curta = false): string {
  const locale = idiomaAtual === "en" ? "en-US" : "pt-BR";
  const options: Intl.DateTimeFormatOptions = curta
    ? { day: "2-digit", month: "2-digit", year: "numeric" }
    : { day: "2-digit", month: "long", year: "numeric" };
  return new Intl.DateTimeFormat(locale, options).format(data);
}
```

---

## 7. Nomes próprios (não traduzem)

Nomes de clubes, jogadores, cidades, países, estádios e competições **nunca** são
traduzidos. Eles vêm do banco de dados como strings literais.

### 7.1 Como marcar

Arquivo `src/i18n/chavesNaoTraduzidas.json`:

```json
[
  "Manchester City",
  "Liverpool",
  "Erling Haaland",
  "Kevin De Bruyne",
  "Premier League",
  "Etihad Stadium",
  "La Liga EA Sports",
  "Real Madrid",
  "Kylian Mbappé",
  "Serie A Enilive",
  "Inter de Milão",
  "Lautaro Martínez",
  "Campeonato Brasileiro Série A",
  "Flamengo",
  "Gerson"
]
```

### 7.2 Regra no tradutor

O tradutor (pessoa ou ferramenta) **não deve alterar** nenhum valor que esteja
nessa lista. O script `validarChaves` pode checar se alguma chave de tradução
contém um nome próprio conhecido e avisar.

---

## 8. Layout e responsividade com textos longos

Inglês e português de Portugal podem ter strings 20–30% maiores que pt-BR.

### 8.1 Estratégias

| Componente | Estratégia |
|---|---|
| Botões | `min-width` baseado no texto mais longo; `text-overflow: ellipsis` + tooltip |
| Tabelas (grade de elenco) | Colunas com `min-width`; cabeçalho com `white-space: nowrap`; overflow horizontal na tabela |
| Cards de jogador | `flex-wrap`; texto com `line-clamp: 2` e tooltip no hover |
| Dropdowns | `max-width: 100vw`; scroll interno |
| Narração | Container com `max-width: 90ch`; quebra de linha natural |

### 8.2 CSS sugerido

```css
:root {
  --i18n-max-btn-width: max-content;
  --i18n-table-min-col: 80px;
}

.btn-i18n {
  min-width: var(--i18n-max-btn-width);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tabela-elenco th {
  white-space: nowrap;
  min-width: var(--i18n-table-min-col);
}

.texto-truncado {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

## 9. Regras de invariantes (testar em `tests/i18n.test.ts`)

1. Busca automatizada por aspas duplas em `src/ui/**/*.tsx` não encontra strings
   de interface (exceto chaves de tradução passadas para `t()`)
2. `validarChaves()` retorna `faltando: []` e `sobrando: []`
3. Fallback para pt-BR funciona: chave só em en devolve pt-BR
4. `chavesNaoTraduzidas.json` contém pelo menos 50 entradas (clubes + jogadores)
5. Nenhuma chave de `chavesNaoTraduzidas.json` aparece como valor em pt-BR.json
   (exceto se for chave de narração que usa o nome como variável)
6. `formatarMoeda(1234567)` devolve string formatada corretamente para os 3 idiomas
7. `tPlural` escolhe forma correta para 0, 1, 2, 5 em pt-BR e en
8. Build falha se `validarChaves()` encontrar problemas (script no `package.json`)