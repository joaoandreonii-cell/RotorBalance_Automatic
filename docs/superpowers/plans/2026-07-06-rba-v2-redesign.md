# RBA v2.0 — Redesign SaaS-ready — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever a UI do RotorBalance Automatic no padrão visual do gestao-frotas (Tailwind v4 + Inter + lucide), com tema claro/escuro, wizard guiado, divisão entre pás, verificação pós-balanceamento, relatório PDF profissional e camada de dados SaaS-ready.

**Architecture:** SPA React 19 + Vite 6 + react-router. UI em Tailwind CSS v4 com tokens em CSS custom properties trocados por `data-theme`. Matemática pura em `src/utils/math.js` (TDD/Vitest). Acesso a dados exclusivamente via `src/data/repository.js` (localStorage hoje, Supabase no futuro). PDF via jsPDF+autotable com paleta clara fixa. Capacitor Android permanece intocado.

**Tech Stack:** react 19, vite 6, tailwindcss@4 (+@tailwindcss/vite), lucide-react, react-router-dom, @fontsource-variable/inter, clsx, jspdf 2.x + jspdf-autotable 3.x (já instalados), vitest (dev).

**Spec:** `docs/superpowers/specs/2026-07-06-rba-v2-redesign-design.md` — ler antes de começar.

## Global Constraints

- Idioma da UI e do relatório: **pt-BR** (acentuação correta em todo texto).
- Fonte **Inter self-hosted** (`@fontsource-variable/inter`) — proibido CDN (APK offline).
- Tokens de cor EXATAMENTE os da spec §3.1 (dark = gestao-frotas; light = derivado).
- Chave de tema no localStorage: `rba_theme` (valores `light`|`dark`|`system`); sessões: `rba_sessions`; settings: `rba_settings`; contador: `rba_report_counter`.
- Toda a matemática existente em `src/utils/math.js` é preservada (mesmas fórmulas/valores).
- UI nunca acessa `localStorage` direto — somente via `repository`.
- PDF sempre em paleta clara, independente do tema da UI.
- Projeto é JavaScript (JSX), 4 espaços de indentação, aspas duplas — seguir o estilo existente.
- Commits pequenos e frequentes, mensagens em inglês `feat:/refactor:/test:/chore:`, com `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Exemplo canônico (do PPTX, usado em testes e verificação): V₀=8, V₁=11.05, V₂=3.82, V₃=15.09, Mt=4.5 → OP≈7.690, ângulo≈90.3°, **Mc≈4.68 g**.

## File Structure (alvo)

```
src/
  main.jsx                       # bootstrap: tema, migração, router, providers
  App.jsx                        # rotas (Routes) dentro do AppShell
  index.css                      # @theme inline + tokens dark/light + base
  theme/ThemeContext.jsx         # ThemeProvider, useTheme
  data/
    repository.js                # createRepository(storage) + repository singleton
    migrations.js                # migrateV1Sessions(storage)
  utils/
    math.js                      # (existente) + splitBetweenBlades, reductionPercent, qualityStatus
    math.test.js                 # Vitest
    format.js                    # fmtNum, fmtDate, fmtDateTime
    svg.js                       # svgElementToPngDataUrl
    image.js                     # fileToCompressedDataUrl (logo)
    pdf.js                       # generatePdfReport (reescrito)
    repository.test.js → src/data/repository.test.js
  components/
    ui/ (Button, Card, StatCard, Badge, Input, Select, Modal, ConfirmDialog,
         EmptyState, SegmentedControl, Stepper, Toast)
    layout/ (AppShell, Sidebar, BottomNav, PageHeader, ThemeToggle)
    balance/ (PolarDiagram, diagramPalettes, IdentificationForm, MachineForm,
              MeasurementsForm, ResultPanel, BladeSplitCard, VerificationCard,
              WizardMode, RotorIllustration)
  pages/ (DashboardPage, BalancePage, HistoryPage, SettingsPage)
```

Removidos ao final: `src/components/{Header,Calculator,History,HelpModal,Diagram,ThemeToggle}.jsx`, `balanceamento_tres_pontos.jsx` (raiz), CSS antigo.

---

### Task 1: Dependências, Tailwind v4 e design tokens

**Files:**
- Modify: `package.json` (deps + script test)
- Modify: `vite.config.js`
- Create: `src/index.css` (substitui conteúdo antigo)
- Modify: `index.html` (title/meta)

**Interfaces:**
- Produces: classes Tailwind `bg-bg`, `bg-surface-1/2/3`, `border-border`, `border-border-strong`, `text-text`, `text-text-muted`, `text-text-subtle`, `bg-primary`, `text-primary`, `bg-primary-soft`, `text-ok/warn/critical`, `bg-ok-soft/warn-soft/critical-soft`; vars de diagrama `--dg-*`; troca de tema via `data-theme` no `<html>`.

- [ ] **Step 1: Instalar dependências**

```bash
npm install tailwindcss@^4 @tailwindcss/vite lucide-react react-router-dom @fontsource-variable/inter clsx
npm install -D vitest
```

- [ ] **Step 2: Adicionar script de teste ao package.json**

Em `"scripts"`, adicionar: `"test": "vitest run"`.

- [ ] **Step 3: Plugar Tailwind no Vite**

`vite.config.js`:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
});
```

- [ ] **Step 4: Reescrever `src/index.css` com os tokens**

Substituir TODO o conteúdo por:

```css
@import "@fontsource-variable/inter";
@import "tailwindcss";

@theme inline {
    --color-bg: var(--bg);
    --color-surface-1: var(--surface-1);
    --color-surface-2: var(--surface-2);
    --color-surface-3: var(--surface-3);
    --color-border: var(--border);
    --color-border-strong: var(--border-strong);
    --color-text: var(--text);
    --color-text-muted: var(--text-muted);
    --color-text-subtle: var(--text-subtle);
    --color-primary: var(--primary);
    --color-primary-hover: var(--primary-hover);
    --color-primary-soft: var(--primary-soft);
    --color-ok: var(--ok);
    --color-ok-soft: var(--ok-soft);
    --color-warn: var(--warn);
    --color-warn-soft: var(--warn-soft);
    --color-critical: var(--critical);
    --color-critical-soft: var(--critical-soft);
    --font-sans: "Inter Variable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
}

:root,
:root[data-theme="dark"] {
    --bg: #0f1117;
    --surface-1: #161922;
    --surface-2: #1d212d;
    --surface-3: #232737;
    --border: #262b3a;
    --border-strong: #343a4d;
    --text: #e6e8ed;
    --text-muted: #9aa0ae;
    --text-subtle: #6b7180;
    --primary: #3b82f6;
    --primary-hover: #2563eb;
    --primary-soft: rgb(59 130 246 / 0.12);
    --ok: #16a34a;
    --ok-soft: rgb(22 163 74 / 0.14);
    --warn: #d97706;
    --warn-soft: rgb(217 119 6 / 0.14);
    --critical: #dc2626;
    --critical-soft: rgb(220 38 38 / 0.14);
    --dg-face: #12151d;
    --dg-grid: #262b3a;
    --dg-grid-soft: #1d2130;
    --dg-label: #6b7180;
    --dg-vo: #5eead4;
    --dg-v1: #38bdf8;
    --dg-v2: #4ade80;
    --dg-v3: #f472b6;
    --dg-op: #f59e0b;
}

:root[data-theme="light"] {
    --bg: #f6f7f9;
    --surface-1: #ffffff;
    --surface-2: #f1f3f6;
    --surface-3: #e9ecf1;
    --border: #e2e5ea;
    --border-strong: #cdd2da;
    --text: #1a1d26;
    --text-muted: #5b6270;
    --text-subtle: #8a909c;
    --primary: #3b82f6;
    --primary-hover: #2563eb;
    --primary-soft: rgb(59 130 246 / 0.12);
    --ok: #16a34a;
    --ok-soft: rgb(22 163 74 / 0.14);
    --warn: #d97706;
    --warn-soft: rgb(217 119 6 / 0.14);
    --critical: #dc2626;
    --critical-soft: rgb(220 38 38 / 0.14);
    --dg-face: #fbfcfe;
    --dg-grid: #d7dbe2;
    --dg-grid-soft: #e7eaef;
    --dg-label: #8a909c;
    --dg-vo: #0d9488;
    --dg-v1: #0284c7;
    --dg-v2: #16a34a;
    --dg-v3: #db2777;
    --dg-op: #d97706;
}

@layer base {
    html,
    body,
    #root {
        height: 100%;
    }

    body {
        background-color: var(--bg);
        color: var(--text);
        font-family: var(--font-sans);
        -webkit-font-smoothing: antialiased;
        overflow-x: hidden;
    }

    *:focus-visible {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
        border-radius: 4px;
    }

    input[type="date"]::-webkit-calendar-picker-indicator {
        cursor: pointer;
    }
    :root[data-theme="dark"] input[type="date"]::-webkit-calendar-picker-indicator {
        filter: invert(0.75);
    }
}

@layer utilities {
    .scrollbar-thin {
        scrollbar-width: thin;
        scrollbar-color: var(--border-strong) transparent;
    }
    .scrollbar-thin::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    .scrollbar-thin::-webkit-scrollbar-thumb {
        background-color: var(--border-strong);
        border-radius: 4px;
    }
}

@keyframes modal-fade {
    from { opacity: 0; }
    to { opacity: 1; }
}
@keyframes modal-pop {
    from { opacity: 0; transform: scale(0.97); }
    to { opacity: 1; transform: scale(1); }
}
@keyframes toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

- [ ] **Step 5: Atualizar `index.html`**

Garantir (mantendo o favicon existente): `<html lang="pt-BR">`, `<title>RotorBalance Automatic</title>`, `<meta name="theme-color" content="#0f1117" />`, viewport com `viewport-fit=cover`.

- [ ] **Step 6: Verificar que o app antigo ainda sobe (CSS novo coexiste)**

Run: `npm run build`
Expected: build verde (a UI antiga perde estilo — ok, será substituída nas próximas tasks; não pode haver erro de build).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vite.config.js src/index.css index.html
git commit -m "feat: add tailwind v4 design tokens with dark/light themes"
```

---

### Task 2: Matemática nova (TDD)

**Files:**
- Modify: `src/utils/math.js`
- Create: `src/utils/math.test.js`
- Create: `src/utils/format.js`

**Interfaces:**
- Consumes: `computeResult(Vo, V1, V2, V3, Mt)` existente → `{ Px, Py, OP, angle, Mc }`.
- Produces:
  - `splitBetweenBlades(Mc, angle, blades, bladeOffset = 0)` → `{ bladeA, bladeB, angleA, angleB, massA, massB } | null` (null se `blades < 3` ou entradas inválidas; pás numeradas de 1; pá 1 em `bladeOffset`°).
  - `reductionPercent(Vo, Vf)` → número (%; pode ser negativo).
  - `qualityStatus(reduction)` → `{ key: "excellent"|"good"|"acceptable"|"redo", label: "Excelente"|"Bom"|"Aceitável"|"Refazer", tone: "ok"|"warn"|"critical" }`.
  - `format.js`: `fmtNum(n, dec = 2)` (pt-BR, vírgula decimal), `fmtDate(iso)` → `dd/mm/aaaa`, `fmtDateTime(iso)` → `dd/mm/aaaa HH:MM`.

- [ ] **Step 1: Escrever os testes (falhando)**

`src/utils/math.test.js`:

```js
import { describe, it, expect } from "vitest";
import {
    computeResult,
    splitBetweenBlades,
    reductionPercent,
    qualityStatus,
} from "./math.js";

describe("computeResult (caracterização — exemplo do PPTX)", () => {
    it("resolve V0=8, V1=11.05, V2=3.82, V3=15.09, Mt=4.5", () => {
        const r = computeResult(8, 11.05, 3.82, 15.09, 4.5);
        expect(r.OP).toBeCloseTo(7.69, 2);
        expect(r.angle).toBeCloseTo(90.3, 1);
        expect(r.Mc).toBeCloseTo(4.68, 2);
    });

    it("retorna null quando OP ≈ 0 (vibrações iguais)", () => {
        expect(computeResult(8, 8, 8, 8, 4.5)).toBeNull();
    });
});

describe("splitBetweenBlades", () => {
    it("divide entre pás adjacentes (6 pás, alvo 90°)", () => {
        const s = splitBetweenBlades(10, 90, 6, 0);
        // pás em 0,60,120,...; alvo 90° fica entre pá 2 (60°) e pá 3 (120°)
        expect(s.bladeA).toBe(2);
        expect(s.bladeB).toBe(3);
        expect(s.angleA).toBe(60);
        expect(s.angleB).toBe(120);
        // simetria: massas iguais
        expect(s.massA).toBeCloseTo(s.massB, 6);
        // recomposição vetorial devolve o vetor original
        const rad = (d) => (d * Math.PI) / 180;
        const x = s.massA * Math.sin(rad(s.angleA)) + s.massB * Math.sin(rad(s.angleB));
        const y = s.massA * Math.cos(rad(s.angleA)) + s.massB * Math.cos(rad(s.angleB));
        expect(Math.sqrt(x * x + y * y)).toBeCloseTo(10, 6);
        expect((Math.atan2(x, y) * 180) / Math.PI).toBeCloseTo(90, 6);
    });

    it("alvo exatamente numa pá → 100% nela", () => {
        const s = splitBetweenBlades(10, 120, 6, 0);
        expect(s.massA).toBeCloseTo(10, 6);
        expect(s.massB).toBeCloseTo(0, 6);
        expect(s.angleA).toBe(120);
    });

    it("respeita o offset da pá 1", () => {
        const s = splitBetweenBlades(10, 90, 4, 30);
        // pás em 30,120,210,300 → alvo 90 entre pá 1 (30°) e pá 2 (120°)
        expect(s.angleA).toBe(30);
        expect(s.angleB).toBe(120);
    });

    it("retorna null para menos de 3 pás ou entradas inválidas", () => {
        expect(splitBetweenBlades(10, 90, 2, 0)).toBeNull();
        expect(splitBetweenBlades(0, 90, 6, 0)).toBeNull();
        expect(splitBetweenBlades(10, 90, null, 0)).toBeNull();
    });
});

describe("verificação pós-balanceamento", () => {
    it("calcula % de redução", () => {
        expect(reductionPercent(8, 0.8)).toBeCloseTo(90, 6);
        expect(reductionPercent(8, 4)).toBeCloseTo(50, 6);
        expect(reductionPercent(8, 10)).toBeCloseTo(-25, 6);
    });

    it("classifica o status", () => {
        expect(qualityStatus(95)).toEqual({ key: "excellent", label: "Excelente", tone: "ok" });
        expect(qualityStatus(90)).toEqual({ key: "excellent", label: "Excelente", tone: "ok" });
        expect(qualityStatus(75)).toEqual({ key: "good", label: "Bom", tone: "ok" });
        expect(qualityStatus(60)).toEqual({ key: "acceptable", label: "Aceitável", tone: "warn" });
        expect(qualityStatus(20)).toEqual({ key: "redo", label: "Refazer", tone: "critical" });
    });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/utils/math.test.js`
Expected: FAIL (`splitBetweenBlades is not a function` etc.). O teste de caracterização de `computeResult` deve PASSAR (função já existe) — se falhar, PARE e investigue antes de seguir.

- [ ] **Step 3: Implementar em `src/utils/math.js` (append ao final do arquivo)**

```js
/* ─── Divisão da massa de correção entre pás adjacentes ──────────────────── */

export function splitBetweenBlades(Mc, angle, blades, bladeOffset = 0) {
    if (!Mc || Mc <= 0 || !blades || blades < 3 || !isFinite(angle)) return null;
    const pitch = 360 / blades;
    const rel = (((angle - bladeOffset) % 360) + 360) % 360;
    const k = Math.floor(rel / pitch);
    const alpha = rel - k * pitch;          // ângulo da pá A até o alvo
    const beta = pitch - alpha;             // do alvo até a pá B
    const sinP = Math.sin(toRad(pitch));
    const norm = (a) => ((a % 360) + 360) % 360;
    return {
        bladeA: k + 1,
        bladeB: ((k + 1) % blades) + 1,
        angleA: norm(bladeOffset + k * pitch),
        angleB: norm(bladeOffset + (k + 1) * pitch),
        massA: (Mc * Math.sin(toRad(beta))) / sinP,
        massB: (Mc * Math.sin(toRad(alpha))) / sinP,
    };
}

/* ─── Verificação pós-balanceamento ──────────────────────────────────────── */

export function reductionPercent(Vo, Vf) {
    return ((Vo - Vf) / Vo) * 100;
}

export function qualityStatus(reduction) {
    if (reduction >= 90) return { key: "excellent", label: "Excelente", tone: "ok" };
    if (reduction >= 70) return { key: "good", label: "Bom", tone: "ok" };
    if (reduction >= 50) return { key: "acceptable", label: "Aceitável", tone: "warn" };
    return { key: "redo", label: "Refazer", tone: "critical" };
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/utils/math.test.js`
Expected: PASS (todos).

- [ ] **Step 5: Criar `src/utils/format.js`**

```js
/* ─── Formatação pt-BR ───────────────────────────────────────────────────── */

export function fmtNum(n, dec = 2) {
    if (n === null || n === undefined || !isFinite(n)) return "—";
    return n.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

export function fmtDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("pt-BR");
}

export function fmtDateTime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}
```

- [ ] **Step 6: Commit**

```bash
git add src/utils/math.js src/utils/math.test.js src/utils/format.js
git commit -m "feat: add blade split, verification math and pt-BR formatters (TDD)"
```

---

### Task 3: Camada de dados — repository + migração v1→v2 (TDD)

**Files:**
- Create: `src/data/repository.js`
- Create: `src/data/migrations.js`
- Create: `src/data/repository.test.js`
- Delete (ao final da task): `src/utils/storage.js` NÃO deletar ainda — será removido na Task 13 (a UI antiga ainda o usa).

**Interfaces:**
- Produces (usado por TODAS as páginas):
  - `repository` (singleton sobre `localStorage`) e `createRepository(storage)` para testes.
  - `repository.sessions.list()` → array ordenado do mais recente; `.get(id)`; `.save(session)` → sessão com `id/createdAt/updatedAt/schemaVersion` preenchidos (upsert por `id`); `.remove(id)`; `.clear()`.
  - `repository.settings.get()` → `{ technician, company, contact, logo, defaultUnit, theme }` (defaults: strings vazias, `logo: null`, `defaultUnit: "mm/s"`, `theme: "system"`); `.update(partial)` → objeto atualizado.
  - `repository.nextReportNumber()` → `"RBA-2026-001"` (sequencial por ano).
  - `repository.backup.export()` → objeto `{ exportedAt, settings, sessions }`; `.import(data, { merge })` → `{ imported }`; com `merge: true` mantém sessões existentes (dedup por id), senão substitui tudo.
  - `migrations.js`: `migrateV1Sessions(storage)` — converte itens sem `schemaVersion` para o schema v2 (spec §7.2/§7.3), idempotente.
- Modelo de sessão v2 (spec §7.2):

```js
{
  id, createdAt, updatedAt, schemaVersion: 2,
  client: { name: "", contact: "" },
  machine: { tag: "", name: "", location: "", rpm: null, radius: null, blades: null, bladeOffset: 0 },
  measurements: { unit: "mm/s", Vo, V1, V2, V3, Mt },       // números
  result: { Px, Py, OP, angle, Mc },
  bladeSplit: { bladeA, bladeB, angleA, angleB, massA, massB } | null,
  verification: { Vf, reduction, status } | null,           // status = key ("excellent"...)
  report: { number } | null,
  notes: ""
}
```

- [ ] **Step 1: Escrever testes (falhando)** — `src/data/repository.test.js`:

```js
import { describe, it, expect, beforeEach } from "vitest";
import { createRepository } from "./repository.js";
import { migrateV1Sessions } from "./migrations.js";

function memStorage() {
    const m = new Map();
    return {
        getItem: (k) => (m.has(k) ? m.get(k) : null),
        setItem: (k, v) => m.set(k, String(v)),
        removeItem: (k) => m.delete(k),
    };
}

let storage, repo;
beforeEach(() => {
    storage = memStorage();
    repo = createRepository(storage);
});

describe("sessions", () => {
    it("save gera id/timestamps e list retorna mais recente primeiro", () => {
        const a = repo.sessions.save({ notes: "a" });
        const b = repo.sessions.save({ notes: "b" });
        expect(a.id).toBeTruthy();
        expect(a.schemaVersion).toBe(2);
        expect(a.createdAt).toBeTruthy();
        const list = repo.sessions.list();
        expect(list.map((s) => s.notes)).toEqual(["b", "a"]);
        expect(repo.sessions.get(b.id).notes).toBe("b");
    });

    it("save com id existente atualiza (upsert)", () => {
        const a = repo.sessions.save({ notes: "a" });
        repo.sessions.save({ ...a, notes: "editada" });
        expect(repo.sessions.list()).toHaveLength(1);
        expect(repo.sessions.get(a.id).notes).toBe("editada");
        expect(repo.sessions.get(a.id).createdAt).toBe(a.createdAt);
    });

    it("remove e clear", () => {
        const a = repo.sessions.save({});
        repo.sessions.remove(a.id);
        expect(repo.sessions.list()).toEqual([]);
        repo.sessions.save({});
        repo.sessions.clear();
        expect(repo.sessions.list()).toEqual([]);
    });
});

describe("settings", () => {
    it("retorna defaults e faz merge no update", () => {
        expect(repo.settings.get()).toEqual({
            technician: "", company: "", contact: "",
            logo: null, defaultUnit: "mm/s", theme: "system",
        });
        repo.settings.update({ company: "ACME" });
        expect(repo.settings.get().company).toBe("ACME");
        expect(repo.settings.get().defaultUnit).toBe("mm/s");
    });
});

describe("nextReportNumber", () => {
    it("sequencial por ano com padding", () => {
        const year = new Date().getFullYear();
        expect(repo.nextReportNumber()).toBe(`RBA-${year}-001`);
        expect(repo.nextReportNumber()).toBe(`RBA-${year}-002`);
    });
});

describe("backup", () => {
    it("export/import substitui ou faz merge", () => {
        repo.sessions.save({ notes: "x" });
        repo.settings.update({ company: "ACME" });
        const data = repo.backup.export();
        expect(data.sessions).toHaveLength(1);
        expect(data.settings.company).toBe("ACME");

        const repo2 = createRepository(memStorage());
        repo2.sessions.save({ notes: "local" });
        repo2.backup.import(data, { merge: true });
        expect(repo2.sessions.list()).toHaveLength(2);

        const repo3 = createRepository(memStorage());
        repo3.sessions.save({ notes: "some" });
        repo3.backup.import(data, { merge: false });
        expect(repo3.sessions.list()).toHaveLength(1);
        expect(repo3.settings.get().company).toBe("ACME");
    });
});

describe("migração v1 → v2", () => {
    it("converte sessão v1 preservando resultado, e é idempotente", () => {
        const v1 = [{
            id: "abc123",
            timestamp: "2025-05-01T10:00:00.000Z",
            name: "Mc 4.68g @ 90.3°",
            raw: { Vo: "8", V1: "11,05", V2: "3.82", V3: "15.09", Mt: "4.5" },
            result: { Mc: 4.68, angle: 90.3, OP: 7.69, Px: 7.69, Py: -0.04 },
        }];
        storage.setItem("rba_sessions", JSON.stringify(v1));
        migrateV1Sessions(storage);
        const list = createRepository(storage).sessions.list();
        expect(list).toHaveLength(1);
        const s = list[0];
        expect(s.schemaVersion).toBe(2);
        expect(s.id).toBe("abc123");
        expect(s.createdAt).toBe("2025-05-01T10:00:00.000Z");
        expect(s.measurements).toEqual({ unit: "mm/s", Vo: 8, V1: 11.05, V2: 3.82, V3: 15.09, Mt: 4.5 });
        expect(s.result.Mc).toBe(4.68);
        expect(s.verification).toBeNull();
        // idempotente
        migrateV1Sessions(storage);
        expect(createRepository(storage).sessions.list()).toHaveLength(1);
    });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/data/repository.test.js`
Expected: FAIL (módulos não existem).

- [ ] **Step 3: Implementar `src/data/repository.js`**

```js
/* ─── Porta única de acesso a dados (localStorage hoje, Supabase amanhã) ─── */

const KEYS = {
    sessions: "rba_sessions",
    settings: "rba_settings",
    counter: "rba_report_counter",
};

const DEFAULT_SETTINGS = {
    technician: "",
    company: "",
    contact: "",
    logo: null,
    defaultUnit: "mm/s",
    theme: "system",
};

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export function createRepository(storage = globalThis.localStorage) {
    const read = (key, fallback) => {
        try {
            const v = storage.getItem(key);
            return v ? JSON.parse(v) : fallback;
        } catch {
            return fallback;
        }
    };
    const write = (key, value) => storage.setItem(key, JSON.stringify(value));

    const sessions = {
        list: () => read(KEYS.sessions, []),
        get: (id) => sessions.list().find((s) => s.id === id) ?? null,
        save(session) {
            const all = sessions.list();
            const now = new Date().toISOString();
            const idx = session.id ? all.findIndex((s) => s.id === session.id) : -1;
            const entry = {
                ...session,
                id: session.id ?? newId(),
                createdAt: idx >= 0 ? all[idx].createdAt : (session.createdAt ?? now),
                updatedAt: now,
                schemaVersion: 2,
            };
            if (idx >= 0) all[idx] = entry;
            else all.unshift(entry);
            write(KEYS.sessions, all);
            return entry;
        },
        remove(id) {
            write(KEYS.sessions, sessions.list().filter((s) => s.id !== id));
        },
        clear() {
            write(KEYS.sessions, []);
        },
    };

    const settings = {
        get: () => ({ ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) }),
        update(partial) {
            const next = { ...settings.get(), ...partial };
            write(KEYS.settings, next);
            return next;
        },
    };

    return {
        sessions,
        settings,
        nextReportNumber() {
            const year = new Date().getFullYear();
            const c = read(KEYS.counter, {});
            const seq = c.year === year ? c.seq + 1 : 1;
            write(KEYS.counter, { year, seq });
            return `RBA-${year}-${String(seq).padStart(3, "0")}`;
        },
        backup: {
            export: () => ({
                exportedAt: new Date().toISOString(),
                settings: settings.get(),
                sessions: sessions.list(),
            }),
            import(data, { merge = true } = {}) {
                const incoming = Array.isArray(data?.sessions) ? data.sessions : [];
                if (merge) {
                    const existing = sessions.list();
                    const ids = new Set(existing.map((s) => s.id));
                    write(KEYS.sessions, [...incoming.filter((s) => !ids.has(s.id)), ...existing]);
                } else {
                    write(KEYS.sessions, incoming);
                }
                if (data?.settings) settings.update(data.settings);
                return { imported: incoming.length };
            },
        },
    };
}

export const repository = createRepository();
```

- [ ] **Step 4: Implementar `src/data/migrations.js`**

```js
/* ─── Migração de dados v1 → schema v2 ───────────────────────────────────── */

const num = (s) => {
    const n = parseFloat(String(s ?? "").replace(",", "."));
    return isNaN(n) ? null : n;
};

export function migrateV1Sessions(storage = globalThis.localStorage) {
    let all;
    try {
        all = JSON.parse(storage.getItem("rba_sessions") ?? "[]");
    } catch {
        return;
    }
    if (!Array.isArray(all) || all.every((s) => s.schemaVersion === 2)) return;

    const migrated = all.map((s) => {
        if (s.schemaVersion === 2) return s;
        return {
            id: s.id,
            createdAt: s.timestamp ?? new Date().toISOString(),
            updatedAt: s.timestamp ?? new Date().toISOString(),
            schemaVersion: 2,
            client: { name: "", contact: "" },
            machine: { tag: "", name: "", location: "", rpm: null, radius: null, blades: null, bladeOffset: 0 },
            measurements: {
                unit: "mm/s",
                Vo: num(s.raw?.Vo), V1: num(s.raw?.V1), V2: num(s.raw?.V2),
                V3: num(s.raw?.V3), Mt: num(s.raw?.Mt),
            },
            result: s.result ?? null,
            bladeSplit: null,
            verification: null,
            report: null,
            notes: s.name ?? "",
        };
    });
    storage.setItem("rba_sessions", JSON.stringify(migrated));
}
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npx vitest run`
Expected: PASS (math + repository).

- [ ] **Step 6: Commit**

```bash
git add src/data/
git commit -m "feat: add SaaS-ready repository layer and v1->v2 migration (TDD)"
```

---

### Task 4: ThemeContext + primitivos de UI

**Files:**
- Create: `src/theme/ThemeContext.jsx`
- Create: `src/components/ui/Button.jsx`, `Card.jsx`, `StatCard.jsx`, `Badge.jsx`, `Input.jsx`, `Select.jsx`, `Modal.jsx`, `ConfirmDialog.jsx`, `EmptyState.jsx`, `SegmentedControl.jsx`, `Stepper.jsx`, `Toast.jsx`

**Interfaces:**
- Consumes: `repository.settings` (Task 3).
- Produces (assinaturas exatas usadas pelas páginas):
  - `ThemeProvider({ children })`, `useTheme()` → `{ theme, resolved, setTheme }` (`theme`: "light"|"dark"|"system"; `resolved`: "light"|"dark").
  - `Button({ variant = "secondary", size = "md", icon: Icon, children, className, ...rest })` — variants: `primary|secondary|ghost|danger`; sizes: `sm|md`.
  - `Card({ title, subtitle, actions, children, className })` — header só aparece se `title`.
  - `StatCard({ label, value, sub, icon: Icon, tone = "neutral" })` — tone: `neutral|primary|ok|warn|critical`.
  - `Badge({ tone = "neutral", children })` — tone: `neutral|primary|ok|warn|critical`.
  - `Input({ label, sub, suffix, error, className, ...rest })` (forwardRef não necessário).
  - `Select({ label, options, className, ...rest })` — `options: [{ value, label }]`.
  - `Modal({ open, onClose, title, children, footer, size = "md" })`.
  - `ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Excluir", danger = true })`.
  - `EmptyState({ icon: Icon, title, text, action })`.
  - `SegmentedControl({ value, onChange, options })` — `options: [{ value, label, icon?: Icon }]`.
  - `Stepper({ steps, current, onSelect })` — `steps: [{ label }]`, `current` 0-based; passos anteriores clicáveis.
  - `ToastProvider({ children })`, `useToast()` → `toast(msg, type = "success"|"error"|"info")`.

- [ ] **Step 1: Criar `src/theme/ThemeContext.jsx`**

```jsx
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { repository } from "../data/repository.js";

const ThemeContext = createContext(null);

const systemTheme = () =>
    window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";

function apply(resolved) {
    document.documentElement.setAttribute("data-theme", resolved);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", resolved === "dark" ? "#0f1117" : "#f6f7f9");
}

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        // Lê o valor BRUTO de rba_settings (settings.get() aplicaria o default
        // "system" e mascararia o tema legado da v1 em rba_theme).
        let stored = null;
        try {
            stored = JSON.parse(localStorage.getItem("rba_settings") ?? "{}").theme ?? null;
        } catch { /* ignora */ }
        const legacy = localStorage.getItem("rba_theme");
        const t = stored ?? legacy ?? "system";
        return ["light", "dark", "system"].includes(t) ? t : "system";
    });
    const resolved = theme === "system" ? systemTheme() : theme;

    useEffect(() => {
        apply(resolved);
    }, [resolved]);

    useEffect(() => {
        if (theme !== "system") return;
        const mq = window.matchMedia("(prefers-color-scheme: light)");
        const fn = () => apply(systemTheme());
        mq.addEventListener("change", fn);
        return () => mq.removeEventListener("change", fn);
    }, [theme]);

    const setTheme = useCallback((next) => {
        setThemeState(next);
        repository.settings.update({ theme: next });
        localStorage.setItem("rba_theme", next); // compat v1
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
```

*(Exceção consciente à regra "UI não toca localStorage": o ThemeProvider é a camada de tema, e mantém a chave legada `rba_theme` por compatibilidade. Todo o resto passa pelo repository.)*

- [ ] **Step 2: Criar primitivos**

`src/components/ui/Button.jsx`:

```jsx
import clsx from "clsx";

const VARIANTS = {
    primary: "bg-primary text-white hover:bg-primary-hover",
    secondary: "bg-surface-2 text-text border border-border hover:bg-surface-3",
    ghost: "text-text-muted hover:text-text hover:bg-surface-2",
    danger: "bg-critical text-white hover:opacity-90",
};
const SIZES = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-10 px-4 text-sm gap-2",
};

export default function Button({ variant = "secondary", size = "md", icon: Icon, children, className, ...rest }) {
    return (
        <button
            className={clsx(
                "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
                "disabled:opacity-45 disabled:pointer-events-none cursor-pointer select-none",
                VARIANTS[variant], SIZES[size], className
            )}
            {...rest}
        >
            {Icon && <Icon size={size === "sm" ? 14 : 16} strokeWidth={2} />}
            {children}
        </button>
    );
}
```

`src/components/ui/Card.jsx`:

```jsx
import clsx from "clsx";

export default function Card({ title, subtitle, actions, children, className }) {
    return (
        <section className={clsx("bg-surface-1 border border-border rounded-xl", className)}>
            {title && (
                <header className="flex items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-border">
                    <div>
                        <h2 className="text-sm font-semibold text-text">{title}</h2>
                        {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
                    </div>
                    {actions}
                </header>
            )}
            <div className="p-5">{children}</div>
        </section>
    );
}
```

`src/components/ui/StatCard.jsx`:

```jsx
import clsx from "clsx";

const TONES = {
    neutral: "text-text",
    primary: "text-primary",
    ok: "text-ok",
    warn: "text-warn",
    critical: "text-critical",
};

export default function StatCard({ label, value, sub, icon: Icon, tone = "neutral" }) {
    return (
        <div className="bg-surface-1 border border-border rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-text-muted leading-tight">{label}</p>
                {Icon && (
                    <span className="w-9 h-9 rounded-lg bg-surface-3 flex items-center justify-center shrink-0">
                        <Icon size={16} className={clsx(TONES[tone])} />
                    </span>
                )}
            </div>
            <p className={clsx("text-2xl font-bold leading-none", TONES[tone])}>{value}</p>
            {sub && <p className="text-xs text-text-subtle">{sub}</p>}
        </div>
    );
}
```

`src/components/ui/Badge.jsx`:

```jsx
import clsx from "clsx";

const TONES = {
    neutral: "bg-surface-3 text-text-muted",
    primary: "bg-primary-soft text-primary",
    ok: "bg-ok-soft text-ok",
    warn: "bg-warn-soft text-warn",
    critical: "bg-critical-soft text-critical",
};

export default function Badge({ tone = "neutral", children }) {
    return (
        <span className={clsx("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap", TONES[tone])}>
            {children}
        </span>
    );
}
```

`src/components/ui/Input.jsx`:

```jsx
import clsx from "clsx";

export default function Input({ label, sub, suffix, error, className, ...rest }) {
    return (
        <label className={clsx("block", className)}>
            {label && (
                <span className="block text-xs font-medium text-text-muted mb-1.5">
                    {label}
                    {sub && <span className="text-text-subtle font-normal"> · {sub}</span>}
                </span>
            )}
            <span className="relative block">
                <input
                    className={clsx(
                        "w-full h-10 rounded-lg bg-surface-2 border px-3 text-sm text-text placeholder:text-text-subtle",
                        "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft transition-colors",
                        error ? "border-critical" : "border-border",
                        suffix && "pr-14"
                    )}
                    {...rest}
                />
                {suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-subtle pointer-events-none">
                        {suffix}
                    </span>
                )}
            </span>
            {error && <span className="block text-xs text-critical mt-1">{error}</span>}
        </label>
    );
}
```

`src/components/ui/Select.jsx`:

```jsx
import clsx from "clsx";

export default function Select({ label, options, className, ...rest }) {
    return (
        <label className={clsx("block", className)}>
            {label && <span className="block text-xs font-medium text-text-muted mb-1.5">{label}</span>}
            <select
                className={clsx(
                    "w-full h-10 rounded-lg bg-surface-2 border border-border px-3 text-sm text-text",
                    "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft transition-colors cursor-pointer"
                )}
                {...rest}
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </label>
    );
}
```

`src/components/ui/Modal.jsx`:

```jsx
import { useEffect } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

const SIZES = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

export default function Modal({ open, onClose, title, children, footer, size = "md" }) {
    useEffect(() => {
        if (!open) return;
        const fn = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", fn);
        return () => window.removeEventListener("keydown", fn);
    }, [open, onClose]);

    if (!open) return null;
    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/55 [animation:modal-fade_120ms_ease-out]"
            onClick={onClose}
        >
            <div
                className={clsx(
                    "w-full bg-surface-1 border border-border rounded-xl shadow-2xl [animation:modal-pop_140ms_ease-out]",
                    SIZES[size]
                )}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <header className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
                    <h2 className="text-sm font-semibold text-text">{title}</h2>
                    <button className="text-text-muted hover:text-text cursor-pointer" onClick={onClose} aria-label="Fechar">
                        <X size={18} />
                    </button>
                </header>
                <div className="p-5 max-h-[70vh] overflow-y-auto scrollbar-thin">{children}</div>
                {footer && <footer className="flex justify-end gap-2 px-5 py-4 border-t border-border">{footer}</footer>}
            </div>
        </div>
    );
}
```

`src/components/ui/ConfirmDialog.jsx`:

```jsx
import Modal from "./Modal.jsx";
import Button from "./Button.jsx";

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Excluir", danger = true }) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            size="sm"
            footer={
                <>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button variant={danger ? "danger" : "primary"} onClick={() => { onConfirm(); onClose(); }}>
                        {confirmLabel}
                    </Button>
                </>
            }
        >
            <p className="text-sm text-text-muted">{message}</p>
        </Modal>
    );
}
```

`src/components/ui/EmptyState.jsx`:

```jsx
export default function EmptyState({ icon: Icon, title, text, action }) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-10 px-6">
            {Icon && (
                <span className="w-12 h-12 rounded-full bg-surface-3 flex items-center justify-center mb-3">
                    <Icon size={20} className="text-text-muted" />
                </span>
            )}
            <p className="text-sm font-semibold text-text">{title}</p>
            {text && <p className="text-xs text-text-muted mt-1 max-w-sm">{text}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
```

`src/components/ui/SegmentedControl.jsx`:

```jsx
import clsx from "clsx";

export default function SegmentedControl({ value, onChange, options }) {
    return (
        <div className="inline-flex bg-surface-2 border border-border rounded-lg p-1 gap-1">
            {options.map(({ value: v, label, icon: Icon }) => (
                <button
                    key={v}
                    onClick={() => onChange(v)}
                    className={clsx(
                        "inline-flex items-center gap-1.5 rounded-md px-3 h-8 text-xs font-medium transition-colors cursor-pointer",
                        v === value ? "bg-primary-soft text-primary" : "text-text-muted hover:text-text"
                    )}
                >
                    {Icon && <Icon size={14} />}
                    {label}
                </button>
            ))}
        </div>
    );
}
```

`src/components/ui/Stepper.jsx`:

```jsx
import { Check } from "lucide-react";
import clsx from "clsx";

export default function Stepper({ steps, current, onSelect }) {
    return (
        <ol className="flex items-center gap-1 overflow-x-auto scrollbar-thin pb-1">
            {steps.map(({ label }, i) => {
                const done = i < current;
                const active = i === current;
                return (
                    <li key={label} className="flex items-center gap-1 shrink-0">
                        {i > 0 && <span className={clsx("w-5 h-px", done || active ? "bg-primary" : "bg-border-strong")} />}
                        <button
                            onClick={() => done && onSelect(i)}
                            disabled={!done && !active}
                            className={clsx(
                                "flex items-center gap-1.5 rounded-full pl-1 pr-2.5 py-1 text-[11px] font-medium transition-colors",
                                active && "bg-primary-soft text-primary",
                                done && "text-text-muted hover:text-text cursor-pointer",
                                !done && !active && "text-text-subtle"
                            )}
                        >
                            <span
                                className={clsx(
                                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                                    active && "bg-primary text-white",
                                    done && "bg-ok-soft text-ok",
                                    !done && !active && "bg-surface-3 text-text-subtle"
                                )}
                            >
                                {done ? <Check size={11} /> : i + 1}
                            </span>
                            {label}
                        </button>
                    </li>
                );
            })}
        </ol>
    );
}
```

`src/components/ui/Toast.jsx`:

```jsx
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import clsx from "clsx";

const ToastContext = createContext(null);
const ICONS = { success: CheckCircle2, error: XCircle, info: Info };
const TONES = {
    success: "border-ok/40 text-ok",
    error: "border-critical/40 text-critical",
    info: "border-primary/40 text-primary",
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const idRef = useRef(0);

    const toast = useCallback((msg, type = "success") => {
        const id = ++idRef.current;
        setToasts((t) => [...t, { id, msg, type }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
    }, []);

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 items-center pointer-events-none">
                {toasts.map(({ id, msg, type }) => {
                    const Icon = ICONS[type] ?? Info;
                    return (
                        <div
                            key={id}
                            className={clsx(
                                "flex items-center gap-2 bg-surface-1 border rounded-lg px-4 py-2.5 shadow-lg text-sm text-text",
                                "[animation:toast-in_150ms_ease-out]", TONES[type] ?? TONES.info
                            )}
                        >
                            <Icon size={16} className="shrink-0" />
                            {msg}
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: verde (componentes ainda não usados; sem erros de sintaxe/import).

- [ ] **Step 4: Commit**

```bash
git add src/theme/ src/components/ui/
git commit -m "feat: add theme context and UI primitives (buttons, cards, modals, toasts)"
```

---

### Task 5: App shell, navegação e rotas

**Files:**
- Create: `src/components/layout/AppShell.jsx`, `Sidebar.jsx`, `BottomNav.jsx`, `PageHeader.jsx`, `ThemeToggle.jsx`
- Create: `src/pages/DashboardPage.jsx`, `BalancePage.jsx`, `HistoryPage.jsx`, `SettingsPage.jsx` (placeholders nesta task; conteúdo real nas Tasks 7–12)
- Modify: `src/App.jsx` (substituir todo o conteúdo)
- Modify: `src/main.jsx` (substituir todo o conteúdo)
- Modify: `vercel.json` (adicionar rewrites SPA, preservando chaves existentes)

**Interfaces:**
- Consumes: `ThemeProvider/useTheme`, `ToastProvider` (Task 4), `migrateV1Sessions` (Task 3).
- Produces: rotas `/dashboard`, `/balanceamento`, `/historico`, `/configuracoes` (redirect `/` → `/dashboard`); `PageHeader({ title, subtitle, actions })`; item de navegação compartilhado `NAV_ITEMS` exportado de `Sidebar.jsx`.

- [ ] **Step 1: Criar `src/components/layout/ThemeToggle.jsx`**

```jsx
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../theme/ThemeContext.jsx";

export default function ThemeToggle() {
    const { resolved, setTheme } = useTheme();
    const dark = resolved === "dark";
    return (
        <button
            onClick={() => setTheme(dark ? "light" : "dark")}
            title={dark ? "Modo claro" : "Modo escuro"}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
        >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
    );
}
```

- [ ] **Step 2: Criar `src/components/layout/Sidebar.jsx`**

```jsx
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Scale, History, Settings, Disc3 } from "lucide-react";
import clsx from "clsx";
import ThemeToggle from "./ThemeToggle.jsx";

export const NAV_ITEMS = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/balanceamento", label: "Balanceamento", icon: Scale },
    { to: "/historico", label: "Histórico", icon: History },
    { to: "/configuracoes", label: "Configurações", icon: Settings },
];

export default function Sidebar() {
    return (
        <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 bg-surface-1 border-r border-border">
            <div className="flex items-center gap-3 px-4 py-5">
                <span className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <Disc3 size={20} className="text-white" />
                </span>
                <div className="leading-tight">
                    <p className="text-sm font-bold text-text">RotorBalance</p>
                    <p className="text-[10px] tracking-widest text-text-subtle font-semibold">AUTOMATIC</p>
                </div>
            </div>

            <nav className="flex-1 px-3 space-y-1 mt-2">
                {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            clsx(
                                "flex items-center gap-3 rounded-lg px-3 h-10 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary-soft text-primary"
                                    : "text-text-muted hover:text-text hover:bg-surface-2"
                            )
                        }
                    >
                        <Icon size={17} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            <div className="flex items-center justify-between px-4 py-4 border-t border-border">
                <span className="text-[11px] text-text-subtle">RBA v2.0 · 3 pontos</span>
                <ThemeToggle />
            </div>
        </aside>
    );
}
```

- [ ] **Step 3: Criar `src/components/layout/BottomNav.jsx`**

```jsx
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { NAV_ITEMS } from "./Sidebar.jsx";

export default function BottomNav() {
    return (
        <nav
            className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface-1 border-t border-border flex"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                        clsx(
                            "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                            isActive ? "text-primary" : "text-text-subtle"
                        )
                    }
                >
                    <Icon size={19} />
                    {label}
                </NavLink>
            ))}
        </nav>
    );
}
```

- [ ] **Step 4: Criar `src/components/layout/PageHeader.jsx` e `AppShell.jsx`**

`PageHeader.jsx`:

```jsx
export default function PageHeader({ title, subtitle, actions }) {
    return (
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
            <div>
                <h1 className="text-xl font-bold text-text">{title}</h1>
                {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}
```

`AppShell.jsx`:

```jsx
import { Outlet } from "react-router-dom";
import { Disc3 } from "lucide-react";
import Sidebar from "./Sidebar.jsx";
import BottomNav from "./BottomNav.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export default function AppShell() {
    return (
        <div className="flex min-h-screen bg-bg">
            <Sidebar />
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Header mobile */}
                <header
                    className="lg:hidden sticky top-0 z-40 bg-surface-1 border-b border-border flex items-center justify-between px-4 h-14"
                    style={{ paddingTop: "env(safe-area-inset-top)" }}
                >
                    <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <Disc3 size={17} className="text-white" />
                        </span>
                        <p className="text-sm font-bold text-text">
                            RotorBalance <span className="text-[10px] text-text-subtle font-semibold tracking-widest">AUTOMATIC</span>
                        </p>
                    </div>
                    <ThemeToggle />
                </header>

                <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 pb-24 lg:pb-8 max-w-6xl w-full mx-auto">
                    <Outlet />
                </main>
            </div>
            <BottomNav />
        </div>
    );
}
```

- [ ] **Step 5: Páginas placeholder**

Cada uma em `src/pages/`, mesmo formato (troque título):

```jsx
import PageHeader from "../components/layout/PageHeader.jsx";

export default function DashboardPage() {
    return <PageHeader title="Dashboard" subtitle="Visão geral dos balanceamentos" />;
}
```

(`BalancePage` → "Balanceamento" / "Método dos três pontos"; `HistoryPage` → "Histórico" / "Sessões salvas"; `SettingsPage` → "Configurações" / "Perfil, relatórios e dados".)

- [ ] **Step 6: Reescrever `src/App.jsx` e `src/main.jsx`**

`App.jsx`:

```jsx
import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import BalancePage from "./pages/BalancePage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

export default function App() {
    return (
        <Routes>
            <Route element={<AppShell />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/balanceamento" element={<BalancePage />} />
                <Route path="/historico" element={<HistoryPage />} />
                <Route path="/configuracoes" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
        </Routes>
    );
}
```

`main.jsx`:

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { migrateV1Sessions } from "./data/migrations.js";
import { ThemeProvider } from "./theme/ThemeContext.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";

migrateV1Sessions();

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <ThemeProvider>
                <ToastProvider>
                    <App />
                </ToastProvider>
            </ThemeProvider>
        </BrowserRouter>
    </React.StrictMode>
);
```

- [ ] **Step 7: SPA rewrites no `vercel.json`**

Ler o arquivo existente e ADICIONAR (sem apagar chaves existentes):

```json
"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
```

- [ ] **Step 8: Verificar no navegador**

Run: `npm run dev` e abrir http://localhost:5173 — deve redirecionar para `/dashboard`, mostrar sidebar (desktop) e bottom-nav (viewport móvel), navegação entre as 4 páginas funcionando, toggle de tema alternando claro/escuro com persistência após reload.
Expected: sem erros no console. **A UI antiga deixa de existir aqui** — os componentes antigos ficam órfãos (removidos na Task 13).

- [ ] **Step 9: Commit**

```bash
git add src/ vercel.json
git commit -m "feat: add app shell with sidebar, bottom nav and routed pages"
```

---

### Task 6: PolarDiagram tema-aware + util SVG→PNG

**Files:**
- Create: `src/components/balance/diagramPalettes.js`
- Create: `src/components/balance/PolarDiagram.jsx` (porta de `src/components/Diagram.jsx` — ler o original antes)
- Create: `src/utils/svg.js`

**Interfaces:**
- Consumes: `toRad`, `niceTick` de `utils/math.js`; `useTheme` (Task 4).
- Produces:
  - `PolarDiagram({ pv, result, blades = null, bladeOffset = 0, palette = null })` — `pv = { Vo, V1, V2, V3 }` (números ou null), `result = { Px, Py, OP, angle, Mc } | null`; `palette`: chave `"dark"|"light"|"print"` (default: tema atual via `useTheme`). Renderiza `<svg viewBox="0 0 400 400">`.
  - `PALETTES` (mesmo arquivo diagramPalettes): `{ dark, light, print }`, cada uma `{ face, grid, gridSoft, label, vo, v1, v2, v3, op, text }`.
  - `svg.js`: `async svgElementToPngDataUrl(svgEl, size = 900)` → dataURL PNG.

- [ ] **Step 1: Criar `src/components/balance/diagramPalettes.js`**

```js
export const PALETTES = {
    dark: {
        face: "#12151d", grid: "#262b3a", gridSoft: "#1d2130", label: "#6b7180",
        vo: "#5eead4", v1: "#38bdf8", v2: "#4ade80", v3: "#f472b6", op: "#f59e0b",
        text: "#9aa0ae",
    },
    light: {
        face: "#fbfcfe", grid: "#d7dbe2", gridSoft: "#e7eaef", label: "#8a909c",
        vo: "#0d9488", v1: "#0284c7", v2: "#16a34a", v3: "#db2777", op: "#d97706",
        text: "#5b6270",
    },
    print: {
        face: "#ffffff", grid: "#d0d5dd", gridSoft: "#e5e8ee", label: "#7a8290",
        vo: "#0d9488", v1: "#0284c7", v2: "#16a34a", v3: "#db2777", op: "#d97706",
        text: "#334155",
    },
};
```

- [ ] **Step 2: Criar `src/components/balance/PolarDiagram.jsx`**

Portar a geometria de `src/components/Diagram.jsx` (scale, pts, pPt, rings, aaPath — manter os `useMemo` idênticos) trocando TODAS as cores hardcoded pela paleta e adicionando marcadores de pás:

```jsx
import { useMemo } from "react";
import { toRad, niceTick } from "../../utils/math.js";
import { useTheme } from "../../theme/ThemeContext.jsx";
import { PALETTES } from "./diagramPalettes.js";

const VBOX = 400;
const C = VBOX / 2;

function mToS(mx, my, s) {
    return [C + mx * s, C - my * s];
}

export default function PolarDiagram({ pv, result, blades = null, bladeOffset = 0, palette = null }) {
    const themeCtx = useTheme();
    const P = PALETTES[palette ?? themeCtx?.resolved ?? "dark"];
    const { Vo, V1, V2, V3 } = pv;
    const ARC_C = [P.v1, P.v2, P.v3];

    const scale = useMemo(() => {
        if (!Vo) return null;
        const ext = Math.max(V1 || 0, V2 || 0, V3 || 0, Vo * 0.6);
        return ((VBOX / 2) * 0.76) / (Vo + ext);
    }, [Vo, V1, V2, V3]);

    const pts = useMemo(() => {
        if (!Vo || !scale) return null;
        return [
            mToS(0, Vo, scale),
            mToS(Vo * Math.sin(toRad(120)), Vo * Math.cos(toRad(120)), scale),
            mToS(Vo * Math.sin(toRad(240)), Vo * Math.cos(toRad(240)), scale),
        ];
    }, [Vo, scale]);

    const pPt = useMemo(
        () => (!result || !scale ? null : mToS(result.Px, result.Py, scale)),
        [result, scale]
    );

    const rings = useMemo(() => {
        if (!Vo || !scale) return [];
        const step = niceTick(Vo);
        const ext = Vo + Math.max(V1 || 0, V2 || 0, V3 || 0, Vo * 0.6);
        const r = [];
        for (let v = step; v <= ext * 1.1; v += step)
            r.push({ v, sr: v * scale, major: v % (step * 2) === 0 });
        return r;
    }, [Vo, V1, V2, V3, scale]);

    const aaPath = useMemo(() => {
        if (!result || !scale || !Vo) return null;
        const ar = Vo * scale * 0.32;
        const a = result.angle;
        return `M ${C} ${C - ar} A ${ar} ${ar} 0 ${a > 180 ? 1 : 0} 1 ${C + ar * Math.sin(toRad(a))} ${C - ar * Math.cos(toRad(a))}`;
    }, [result, scale, Vo]);

    const bladeMarks = useMemo(() => {
        if (!blades || blades < 3) return [];
        const rOut = (VBOX / 2) * 0.86;
        return Array.from({ length: blades }, (_, i) => {
            const a = toRad(bladeOffset + (i * 360) / blades);
            return {
                x1: C + rOut * 0.94 * Math.sin(a), y1: C - rOut * 0.94 * Math.cos(a),
                x2: C + rOut * Math.sin(a), y2: C - rOut * Math.cos(a),
            };
        });
    }, [blades, bladeOffset]);

    return (
        <svg viewBox={`0 0 ${VBOX} ${VBOX}`} style={{ display: "block", width: "100%", height: "auto" }} aria-label="Diagrama polar">
            <rect width={VBOX} height={VBOX} fill={P.face} rx={12} />

            {/* Anéis de grade */}
            {rings.map(({ v, sr, major }, i) => (
                <g key={i}>
                    <circle cx={C} cy={C} r={sr} fill="none" stroke={major ? P.grid : P.gridSoft} strokeWidth={major ? 0.8 : 0.5} />
                    {major && Vo && (
                        <text x={C + 4} y={C - sr - 3} fill={P.label} fontSize="6.5" fontFamily="monospace">
                            {v.toFixed(v < 1 ? 2 : v < 10 ? 1 : 0)}
                        </text>
                    )}
                </g>
            ))}

            {/* Raios */}
            {Array.from({ length: 12 }, (_, i) => {
                const a = i * 30;
                const r = (VBOX / 2) * 0.86;
                return (
                    <line key={a} x1={C} y1={C}
                        x2={C + r * Math.sin(toRad(a))} y2={C - r * Math.cos(toRad(a))}
                        stroke={a % 90 === 0 ? P.grid : P.gridSoft} strokeWidth={a % 90 === 0 ? 0.8 : 0.5} />
                );
            })}

            {/* Rótulos de ângulo */}
            {Array.from({ length: 12 }, (_, i) => {
                const a = i * 30;
                const lr = (VBOX / 2) * 0.93;
                const key = a % 120 === 0;
                return (
                    <text key={a} x={C + lr * Math.sin(toRad(a))} y={C - lr * Math.cos(toRad(a))}
                        textAnchor="middle" dominantBaseline="middle"
                        fill={key ? P.text : P.label} fontSize={key ? 9 : 7}
                        fontFamily="monospace" fontWeight={key ? 600 : 400}>
                        {a}°
                    </text>
                );
            })}

            {/* Marcadores de pás */}
            {bladeMarks.map((m, i) => (
                <line key={i} {...m} stroke={P.op} strokeWidth={2} opacity={0.55} strokeLinecap="round" />
            ))}

            {/* Círculo V0 */}
            {Vo && scale && (
                <>
                    <circle cx={C} cy={C} r={Vo * scale} fill="none" stroke={P.vo} strokeOpacity={0.15} strokeWidth={8} />
                    <circle cx={C} cy={C} r={Vo * scale} fill="none" stroke={P.vo} strokeWidth={1.8} />
                </>
            )}

            {/* Arcos V1 V2 V3 */}
            {pts && [{ v: V1, i: 0 }, { v: V2, i: 1 }, { v: V3, i: 2 }].map(({ v, i }) =>
                v && scale ? (
                    <g key={i}>
                        <circle cx={pts[i][0]} cy={pts[i][1]} r={v * scale} fill="none" stroke={ARC_C[i]} strokeOpacity={0.12} strokeWidth={4} />
                        <circle cx={pts[i][0]} cy={pts[i][1]} r={v * scale} fill="none" stroke={ARC_C[i]} strokeWidth={1.2} strokeDasharray="6 3.5" opacity={0.85} />
                    </g>
                ) : null
            )}

            {/* Arco do ângulo + vetor OP */}
            {aaPath && (
                <>
                    <path d={aaPath} fill="none" stroke={P.op} strokeOpacity={0.35} strokeWidth={6} strokeLinecap="round" />
                    <path d={aaPath} fill="none" stroke={P.op} strokeWidth={1.5} strokeLinecap="round" />
                    <line x1={C} y1={C} x2={C} y2={C - Vo * scale * 0.32} stroke={P.op} strokeOpacity={0.3} strokeWidth={1} strokeDasharray="3 3" />
                </>
            )}
            {pPt && (
                <>
                    <line x1={C} y1={C} x2={pPt[0]} y2={pPt[1]} stroke={P.op} strokeOpacity={0.25} strokeWidth={6} />
                    <line x1={C} y1={C} x2={pPt[0]} y2={pPt[1]} stroke={P.op} strokeWidth={2} strokeLinecap="round" />
                </>
            )}

            {/* Pontos 1/2/3 */}
            {pts && pts.map(([x, y], i) => (
                <g key={i}>
                    <circle cx={x} cy={y} r={10} fill={ARC_C[i]} fillOpacity={0.12} />
                    <circle cx={x} cy={y} r={4} fill={ARC_C[i]} />
                    <text x={x + (i === 2 ? -13 : 13)} y={y + (i === 0 ? -13 : 5)}
                        fill={ARC_C[i]} fontSize={9} fontFamily="monospace" fontWeight={600}
                        textAnchor={i === 2 ? "end" : "start"}>
                        {["1·0°", "2·120°", "3·240°"][i]}
                    </text>
                </g>
            ))}

            {/* Origem e ponto P */}
            <circle cx={C} cy={C} r={5} fill={P.face} stroke={P.label} strokeWidth={1.5} />
            <circle cx={C} cy={C} r={2} fill={P.label} />
            {pPt && (
                <>
                    <circle cx={pPt[0]} cy={pPt[1]} r={12} fill={P.op} fillOpacity={0.12} />
                    <circle cx={pPt[0]} cy={pPt[1]} r={5} fill={P.op} />
                    <line x1={pPt[0] - 8} y1={pPt[1]} x2={pPt[0] + 8} y2={pPt[1]} stroke={P.op} strokeWidth={1.5} opacity={0.7} />
                    <line x1={pPt[0]} y1={pPt[1] - 8} x2={pPt[0]} y2={pPt[1] + 8} stroke={P.op} strokeWidth={1.5} opacity={0.7} />
                    <text x={pPt[0] + 11} y={pPt[1] - 9} fill={P.op} fontSize={10} fontFamily="monospace" fontWeight={700}>P</text>
                </>
            )}

            {!Vo && (
                <text x={C} y={C} textAnchor="middle" dominantBaseline="middle" fill={P.label} fontSize={11} fontFamily="monospace">
                    Insira os valores para visualizar
                </text>
            )}
        </svg>
    );
}
```

Nota: sem gradientes/filtros SVG (glow) — eles quebram a rasterização do PDF e o visual flat combina com o novo design.

- [ ] **Step 3: Criar `src/utils/svg.js`**

```js
/* ─── Rasterização de SVG para PNG (usado no relatório PDF) ──────────────── */

export function svgElementToPngDataUrl(svgEl, size = 900) {
    return new Promise((resolve, reject) => {
        const clone = svgEl.cloneNode(true);
        clone.setAttribute("width", String(size));
        clone.setAttribute("height", String(size));
        const data = new XMLSerializer().serializeToString(clone);
        const url = URL.createObjectURL(new Blob([data], { type: "image/svg+xml;charset=utf-8" }));
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            canvas.getContext("2d").drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Falha ao rasterizar o diagrama"));
        };
        img.src = url;
    });
}
```

- [ ] **Step 4: Verificação rápida**

Adicionar temporariamente em `BalancePage.jsx`: `<div className="max-w-md"><PolarDiagram pv={{ Vo: 8, V1: 11.05, V2: 3.82, V3: 15.09 }} result={{ Px: 7.69, Py: -0.04, OP: 7.69, angle: 90.3, Mc: 4.68 }} blades={6} /></div>`.
Run: `npm run dev` — diagrama renderiza nos 2 temas (cores mudam ao alternar), marcas de 6 pás visíveis. Remover o trecho temporário depois de conferir.

- [ ] **Step 5: Commit**

```bash
git add src/components/balance/ src/utils/svg.js
git commit -m "feat: add theme-aware polar diagram with blade markers and svg rasterizer"
```

---

### Task 7: Página Balanceamento — modo direto

**Files:**
- Create: `src/components/balance/IdentificationForm.jsx`, `MachineForm.jsx`, `MeasurementsForm.jsx`, `ResultPanel.jsx`, `BladeSplitCard.jsx`, `VerificationCard.jsx`
- Modify: `src/pages/BalancePage.jsx` (substituir placeholder)

**Interfaces:**
- Consumes: `parseVal`, `computeResult`, `splitBetweenBlades`, `reductionPercent`, `qualityStatus` (math); `fmtNum` (format); `repository` (Task 3); primitivos ui (Task 4); `PolarDiagram` (Task 6); `useToast`.
- Produces:
  - Estado do formulário (raw strings) — formato usado também pelo Wizard (Task 8) e seed do Histórico (Task 10):

```js
const EMPTY_FORM = {
    client: { name: "", contact: "" },
    technician: "",
    machine: { tag: "", name: "", location: "", rpm: "", radius: "", blades: "", bladeOffset: "0" },
    meas: { unit: "mm/s", Vo: "", V1: "", V2: "", V3: "", Mt: "" },
    verification: { Vf: "" },
    notes: "",
};
```

  - `IdentificationForm({ value, onChange })`, `MachineForm({ value, onChange })`, `MeasurementsForm({ value, onChange, pv })` — `onChange(partial)` faz merge raso na respectiva seção.
  - `ResultPanel({ result, meas })`, `BladeSplitCard({ split })`, `VerificationCard({ Vo, unit, value, onChange, reduction, status })`.
  - `buildSession(form, derived, sessionId)` → objeto sessão v2 (spec §7.2, campos numéricos parseados; inclui `technician`).
  - Histórico (Task 10) reabre sessão via `navigate("/balanceamento", { state: { session } })` e duplica via `{ state: { session, duplicate: true } }` — BalancePage lê `useLocation().state`.

- [ ] **Step 1: Criar `MeasurementsForm.jsx`**

```jsx
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import { useTheme } from "../../theme/ThemeContext.jsx";
import { PALETTES } from "./diagramPalettes.js";

export const UNITS = ["mm/s", "µm", "in/s", "g"].map((u) => ({ value: u, label: u }));

const FIELDS = [
    { key: "Vo", sym: "V₀", label: "Vibração original", sub: "sem massa de teste", pk: "vo" },
    { key: "V1", sym: "V₁", label: "Massa em 0°", sub: "posição 1", pk: "v1" },
    { key: "V2", sym: "V₂", label: "Massa em 120°", sub: "posição 2", pk: "v2" },
    { key: "V3", sym: "V₃", label: "Massa em 240°", sub: "posição 3", pk: "v3" },
];

export default function MeasurementsForm({ value, onChange, pv }) {
    const { resolved } = useTheme();
    const P = PALETTES[resolved];
    return (
        <div className="space-y-3">
            <Select
                label="Unidade de vibração"
                options={UNITS}
                value={value.unit}
                onChange={(e) => onChange({ unit: e.target.value })}
            />
            {FIELDS.map(({ key, sym, label, sub, pk }) => (
                <div key={key} className="flex items-center gap-3">
                    <span
                        className="w-9 h-9 rounded-lg bg-surface-3 flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ color: P[pk] }}
                    >
                        {sym}
                    </span>
                    <Input
                        className="flex-1"
                        label={label}
                        sub={sub}
                        suffix={value.unit}
                        placeholder="0,00"
                        inputMode="decimal"
                        value={value[key]}
                        error={value[key] && pv[key] === null ? "Valor inválido" : undefined}
                        onChange={(e) => onChange({ [key]: e.target.value })}
                    />
                </div>
            ))}
            <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-surface-3 flex items-center justify-center text-xs font-bold shrink-0 text-warn">
                    Mₜ
                </span>
                <Input
                    className="flex-1"
                    label="Massa de teste"
                    sub="gramas"
                    suffix="g"
                    placeholder="0,00"
                    inputMode="decimal"
                    value={value.Mt}
                    error={value.Mt && pv.Mt === null ? "Valor inválido" : undefined}
                    onChange={(e) => onChange({ Mt: e.target.value })}
                />
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Criar `IdentificationForm.jsx` e `MachineForm.jsx`**

`IdentificationForm.jsx`:

```jsx
import Input from "../ui/Input.jsx";

export default function IdentificationForm({ value, onChange }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Cliente / Empresa" placeholder="Ex.: Metalúrgica Alfa"
                value={value.client.name}
                onChange={(e) => onChange({ client: { ...value.client, name: e.target.value } })} />
            <Input label="Contato" placeholder="E-mail ou telefone"
                value={value.client.contact}
                onChange={(e) => onChange({ client: { ...value.client, contact: e.target.value } })} />
            <Input label="Técnico responsável" placeholder="Seu nome"
                value={value.technician}
                onChange={(e) => onChange({ technician: e.target.value })} />
            <Input label="Notas" placeholder="Observações (opcional)"
                value={value.notes}
                onChange={(e) => onChange({ notes: e.target.value })} />
        </div>
    );
}
```

`MachineForm.jsx`:

```jsx
import Input from "../ui/Input.jsx";

export default function MachineForm({ value, onChange }) {
    const set = (k) => (e) => onChange({ machine: { ...value.machine, [k]: e.target.value } });
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Input label="TAG" placeholder="VT-001" value={value.machine.tag} onChange={set("tag")} />
            <Input label="Equipamento" placeholder="Exaustor" value={value.machine.name} onChange={set("name")} />
            <Input label="Local" placeholder="Setor / linha" value={value.machine.location} onChange={set("location")} />
            <Input label="Rotação" suffix="RPM" inputMode="numeric" placeholder="1750" value={value.machine.rpm} onChange={set("rpm")} />
            <Input label="Raio de fixação" suffix="mm" inputMode="decimal" placeholder="150" value={value.machine.radius} onChange={set("radius")} />
            <Input label="Nº de pás" sub="p/ divisão" inputMode="numeric" placeholder="6" value={value.machine.blades} onChange={set("blades")} />
            <Input label="Pá 1 em" sub="offset angular" suffix="°" inputMode="decimal" placeholder="0" value={value.machine.bladeOffset} onChange={set("bladeOffset")} />
        </div>
    );
}
```

- [ ] **Step 3: Criar `ResultPanel.jsx`, `BladeSplitCard.jsx`, `VerificationCard.jsx`**

`ResultPanel.jsx`:

```jsx
import { fmtNum } from "../../utils/format.js";

export default function ResultPanel({ result, meas }) {
    if (!result) {
        return (
            <p className="text-sm text-text-muted">
                Preencha as quatro medições e a massa de teste para calcular a massa de correção.
            </p>
        );
    }
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-2 rounded-lg p-3">
                    <p className="text-[11px] text-text-subtle">Distância OP</p>
                    <p className="text-lg font-bold text-text">{fmtNum(result.OP, 3)}</p>
                </div>
                <div className="bg-surface-2 rounded-lg p-3">
                    <p className="text-[11px] text-text-subtle">Ângulo</p>
                    <p className="text-lg font-bold text-text">{fmtNum(result.angle, 1)}°</p>
                </div>
            </div>
            <div className="bg-primary-soft border border-primary/25 rounded-xl p-5 text-center">
                <p className="text-[11px] font-semibold tracking-wider text-primary uppercase">Massa de correção</p>
                <p className="text-4xl font-bold text-text mt-1">
                    {fmtNum(result.Mc)} <span className="text-lg text-text-muted">g</span>
                </p>
                <p className="text-sm text-text-muted mt-1">
                    posicionar em <span className="font-semibold text-primary">{fmtNum(result.angle, 1)}°</span>
                </p>
            </div>
            <p className="text-[11px] text-text-subtle font-mono leading-relaxed">
                Mc = Mₜ × V₀ / OP = {meas.Mt} × {meas.Vo} / {fmtNum(result.OP, 3)} = {fmtNum(result.Mc)} g
            </p>
        </div>
    );
}
```

`BladeSplitCard.jsx`:

```jsx
import { fmtNum } from "../../utils/format.js";

export default function BladeSplitCard({ split }) {
    if (!split) return null;
    return (
        <div className="bg-surface-2 rounded-lg p-4">
            <p className="text-xs font-semibold text-text mb-2">Divisão entre pás adjacentes</p>
            <div className="grid grid-cols-2 gap-3">
                {[["A", split.bladeA, split.angleA, split.massA], ["B", split.bladeB, split.angleB, split.massB]].map(
                    ([tag, blade, angle, mass]) => (
                        <div key={tag} className="border border-border rounded-lg p-3 text-center">
                            <p className="text-[11px] text-text-subtle">Pá {blade} · {fmtNum(angle, 0)}°</p>
                            <p className="text-base font-bold text-text">{fmtNum(mass)} g</p>
                        </div>
                    )
                )}
            </div>
            <p className="text-[11px] text-text-subtle mt-2">
                Fixe as duas massas nas pás indicadas — o efeito combinado equivale à massa de correção no ângulo calculado.
            </p>
        </div>
    );
}
```

`VerificationCard.jsx`:

```jsx
import Input from "../ui/Input.jsx";
import Badge from "../ui/Badge.jsx";
import { fmtNum } from "../../utils/format.js";

export default function VerificationCard({ Vo, unit, value, onChange, reduction, status }) {
    return (
        <div className="bg-surface-2 rounded-lg p-4 space-y-3">
            <p className="text-xs font-semibold text-text">Verificação pós-balanceamento</p>
            <Input
                label="Vibração final"
                sub="após instalar a massa de correção"
                suffix={unit}
                placeholder="0,00"
                inputMode="decimal"
                value={value.Vf}
                onChange={(e) => onChange({ Vf: e.target.value })}
            />
            {reduction !== null && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-text-muted">
                        Redução: <span className="font-bold text-text">{fmtNum(reduction, 1)}%</span>
                        <span className="text-text-subtle"> (V₀ {fmtNum(Vo)} → {value.Vf} {unit})</span>
                    </p>
                    <Badge tone={status.tone}>{status.label}</Badge>
                </div>
            )}
        </div>
    );
}
```

- [ ] **Step 4: Reescrever `src/pages/BalancePage.jsx` (modo direto completo)**

```jsx
import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Save, Eraser } from "lucide-react";
import PageHeader from "../components/layout/PageHeader.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import IdentificationForm from "../components/balance/IdentificationForm.jsx";
import MachineForm from "../components/balance/MachineForm.jsx";
import MeasurementsForm from "../components/balance/MeasurementsForm.jsx";
import ResultPanel from "../components/balance/ResultPanel.jsx";
import BladeSplitCard from "../components/balance/BladeSplitCard.jsx";
import VerificationCard from "../components/balance/VerificationCard.jsx";
import PolarDiagram from "../components/balance/PolarDiagram.jsx";
import { parseVal, computeResult, splitBetweenBlades, reductionPercent, qualityStatus } from "../utils/math.js";
import { repository } from "../data/repository.js";

export const EMPTY_FORM = {
    client: { name: "", contact: "" },
    technician: "",
    machine: { tag: "", name: "", location: "", rpm: "", radius: "", blades: "", bladeOffset: "0" },
    meas: { unit: "mm/s", Vo: "", V1: "", V2: "", V3: "", Mt: "" },
    verification: { Vf: "" },
    notes: "",
};

const numToStr = (n) => (n === null || n === undefined ? "" : String(n));

export function sessionToForm(s) {
    return {
        client: { name: s.client?.name ?? "", contact: s.client?.contact ?? "" },
        technician: s.technician ?? "",
        machine: {
            tag: s.machine?.tag ?? "", name: s.machine?.name ?? "", location: s.machine?.location ?? "",
            rpm: numToStr(s.machine?.rpm), radius: numToStr(s.machine?.radius),
            blades: numToStr(s.machine?.blades), bladeOffset: numToStr(s.machine?.bladeOffset ?? 0) || "0",
        },
        meas: {
            unit: s.measurements?.unit ?? "mm/s",
            Vo: numToStr(s.measurements?.Vo), V1: numToStr(s.measurements?.V1),
            V2: numToStr(s.measurements?.V2), V3: numToStr(s.measurements?.V3),
            Mt: numToStr(s.measurements?.Mt),
        },
        verification: { Vf: numToStr(s.verification?.Vf) },
        notes: s.notes ?? "",
    };
}

export default function BalancePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const toast = useToast();
    const seed = location.state?.session;
    const isDuplicate = location.state?.duplicate;

    const [form, setForm] = useState(() => {
        if (seed) return sessionToForm(seed);
        const s = repository.settings.get();
        return { ...EMPTY_FORM, technician: s.technician, meas: { ...EMPTY_FORM.meas, unit: s.defaultUnit } };
    });
    const [sessionId, setSessionId] = useState(seed && !isDuplicate ? seed.id : null);
    const [reportNumber, setReportNumber] = useState(seed && !isDuplicate ? seed.report?.number ?? null : null);
    const [confirmClear, setConfirmClear] = useState(false);
    const diagramRef = useRef(null);
    const printRef = useRef(null);

    const patch = (partial) => setForm((f) => ({ ...f, ...partial }));
    const patchMeas = (partial) => setForm((f) => ({ ...f, meas: { ...f.meas, ...partial } }));
    const patchVerif = (partial) => setForm((f) => ({ ...f, verification: { ...f.verification, ...partial } }));

    const pv = useMemo(() => ({
        Vo: parseVal(form.meas.Vo), V1: parseVal(form.meas.V1), V2: parseVal(form.meas.V2),
        V3: parseVal(form.meas.V3), Mt: parseVal(form.meas.Mt),
    }), [form.meas]);

    const allFilled = pv.Vo && pv.V1 && pv.V2 && pv.V3 && pv.Mt;
    const result = useMemo(
        () => (allFilled ? computeResult(pv.Vo, pv.V1, pv.V2, pv.V3, pv.Mt) : null),
        [allFilled, pv]
    );

    const blades = parseInt(form.machine.blades, 10) || null;
    const bladeOffset = parseFloat(form.machine.bladeOffset) || 0;
    const split = useMemo(
        () => (result && blades ? splitBetweenBlades(result.Mc, result.angle, blades, bladeOffset) : null),
        [result, blades, bladeOffset]
    );

    const Vf = parseVal(form.verification.Vf);
    const reduction = result && Vf !== null && pv.Vo ? reductionPercent(pv.Vo, Vf) : null;
    const status = reduction !== null ? qualityStatus(reduction) : null;

    const buildSession = () => ({
        ...(sessionId ? { id: sessionId } : {}),
        client: { ...form.client },
        technician: form.technician,
        machine: {
            tag: form.machine.tag, name: form.machine.name, location: form.machine.location,
            rpm: parseVal(form.machine.rpm), radius: parseVal(form.machine.radius),
            blades, bladeOffset,
        },
        measurements: { unit: form.meas.unit, Vo: pv.Vo, V1: pv.V1, V2: pv.V2, V3: pv.V3, Mt: pv.Mt },
        result: result && { Px: result.Px, Py: result.Py, OP: result.OP, angle: result.angle, Mc: result.Mc },
        bladeSplit: split,
        verification: reduction !== null ? { Vf, reduction, status: status.key } : null,
        report: reportNumber ? { number: reportNumber } : null,
        notes: form.notes,
    });

    const handleSave = () => {
        if (!result) return;
        const saved = repository.sessions.save(buildSession());
        setSessionId(saved.id);
        toast("Sessão salva com sucesso!");
    };

    const handleClear = () => {
        setForm({ ...EMPTY_FORM, technician: repository.settings.get().technician });
        setSessionId(null);
        setReportNumber(null);
        navigate(".", { replace: true, state: null });
    };

    const dirty = JSON.stringify(form.meas) !== JSON.stringify(EMPTY_FORM.meas) || form.client.name;

    return (
        <>
            <PageHeader
                title="Balanceamento"
                subtitle="Método dos três pontos — 4 medições, posições 0° · 120° · 240°"
            />

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5 items-start">
                <div className="space-y-5">
                    <Card title="Identificação" subtitle="Cliente e responsável (aparece no relatório)">
                        <IdentificationForm value={form} onChange={patch} />
                    </Card>
                    <Card title="Máquina" subtitle="Dados do equipamento (opcional)">
                        <MachineForm value={form} onChange={patch} />
                    </Card>
                    <Card title="Medições" subtitle="Vibrações medidas nas 4 rodadas">
                        <MeasurementsForm value={form.meas} onChange={patchMeas} pv={pv} />
                    </Card>
                </div>

                <div className="space-y-5 xl:sticky xl:top-8">
                    <Card title="Diagrama polar" subtitle="Interseção dos arcos → ponto P">
                        <div ref={diagramRef}>
                            <PolarDiagram pv={pv} result={result} blades={blades} bladeOffset={bladeOffset} />
                        </div>
                    </Card>
                    <Card title="Resultado">
                        <div className="space-y-4">
                            <ResultPanel result={result} meas={form.meas} />
                            {result && <BladeSplitCard split={split} />}
                            {result && (
                                <VerificationCard
                                    Vo={pv.Vo} unit={form.meas.unit}
                                    value={form.verification} onChange={patchVerif}
                                    reduction={reduction} status={status}
                                />
                            )}
                            <div className="flex flex-wrap gap-2 pt-1">
                                <Button variant="primary" icon={Save} disabled={!result} onClick={handleSave}>
                                    Salvar
                                </Button>
                                <Button icon={Eraser} onClick={() => (dirty ? setConfirmClear(true) : handleClear())}>
                                    Limpar
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Diagrama oculto em paleta de impressão (usado pelo PDF — Task 9) */}
            <div ref={printRef} className="hidden" aria-hidden="true">
                <PolarDiagram pv={pv} result={result} blades={blades} bladeOffset={bladeOffset} palette="print" />
            </div>

            <ConfirmDialog
                open={confirmClear}
                onClose={() => setConfirmClear(false)}
                onConfirm={handleClear}
                title="Limpar formulário"
                message="Todos os dados preenchidos serão descartados. Continuar?"
                confirmLabel="Limpar"
            />
        </>
    );
}
```

- [ ] **Step 5: Verificar no navegador**

Run: `npm run dev` → `/balanceamento`. Inserir o exemplo canônico (8 / 11,05 / 3,82 / 15,09 / 4,5): resultado deve exibir **Mc 4,68 g @ 90,3°**; com "Nº de pás" = 6, divisão deve mostrar Pá 2 (60°) e Pá 3 (120°) com massas coerentes; Vf = 0,8 → redução 90% + badge "Excelente"; salvar → toast. Testar nos 2 temas.
Expected: sem erros no console; valores exatos conforme acima.

- [ ] **Step 6: Commit**

```bash
git add src/components/balance/ src/pages/BalancePage.jsx
git commit -m "feat: add balance page with forms, result panel, blade split and verification"
```

---

### Task 8: Modo wizard guiado

**Files:**
- Create: `src/components/balance/RotorIllustration.jsx`
- Create: `src/components/balance/WizardMode.jsx`
- Modify: `src/pages/BalancePage.jsx` (adicionar SegmentedControl de modo)

**Interfaces:**
- Consumes: `EMPTY_FORM`/estado do BalancePage (Task 7), `Stepper`, `SegmentedControl`, `Button`, `Input`, `Card` (Task 4), `PolarDiagram`, forms (Task 7).
- Produces: `WizardMode({ form, patch, patchMeas, patchVerif, pv, result, split, reduction, status, onSave, saveDisabled, extraActions })` — stepper interno; `RotorIllustration({ highlight })` (`highlight`: null|1|2|3 — posição destacada).

- [ ] **Step 1: Criar `RotorIllustration.jsx`**

SVG didático do rotor (não é o diagrama polar): círculo do rotor, cubo central, 3 posições numeradas; a posição destacada ganha um chip "Mₜ" âmbar:

```jsx
import { useTheme } from "../../theme/ThemeContext.jsx";
import { PALETTES } from "./diagramPalettes.js";
import { toRad } from "../../utils/math.js";

const POS = [
    { n: 1, angle: 0 },
    { n: 2, angle: 120 },
    { n: 3, angle: 240 },
];

export default function RotorIllustration({ highlight = null }) {
    const { resolved } = useTheme();
    const P = PALETTES[resolved];
    const C = 90, R = 62;
    return (
        <svg viewBox="0 0 180 180" className="w-40 mx-auto block" aria-hidden="true">
            <circle cx={C} cy={C} r={R + 12} fill={P.face} stroke={P.grid} strokeWidth={1.5} />
            <circle cx={C} cy={C} r={R} fill="none" stroke={P.gridSoft} strokeWidth={1} strokeDasharray="4 3" />
            <circle cx={C} cy={C} r={14} fill={P.gridSoft} stroke={P.grid} strokeWidth={1.5} />
            <circle cx={C} cy={C} r={4} fill={P.label} />
            {POS.map(({ n, angle }) => {
                const x = C + R * Math.sin(toRad(angle));
                const y = C - R * Math.cos(toRad(angle));
                const active = highlight === n;
                const color = [P.v1, P.v2, P.v3][n - 1];
                return (
                    <g key={n}>
                        <line x1={C} y1={C} x2={x} y2={y} stroke={P.gridSoft} strokeWidth={1} />
                        <circle cx={x} cy={y} r={active ? 13 : 10} fill={active ? color : P.face} stroke={color} strokeWidth={2} />
                        <text x={x} y={y + 3.5} textAnchor="middle" fontSize={10} fontWeight={700}
                            fill={active ? "#ffffff" : color} fontFamily="monospace">
                            {n}
                        </text>
                        {active && (
                            <g>
                                <rect x={x - 13} y={y - 30} width={26} height={13} rx={6.5} fill={P.op} />
                                <text x={x} y={y - 20.5} textAnchor="middle" fontSize={8.5} fontWeight={700} fill="#fff">
                                    Mₜ
                                </text>
                            </g>
                        )}
                        <text x={C + (R + 22) * Math.sin(toRad(angle))} y={C - (R + 22) * Math.cos(toRad(angle)) + 3}
                            textAnchor="middle" fontSize={8} fill={P.label} fontFamily="monospace">
                            {angle}°
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}
```

- [ ] **Step 2: Criar `WizardMode.jsx`**

```jsx
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Stepper from "../ui/Stepper.jsx";
import IdentificationForm from "./IdentificationForm.jsx";
import MachineForm from "./MachineForm.jsx";
import RotorIllustration from "./RotorIllustration.jsx";
import PolarDiagram from "./PolarDiagram.jsx";
import ResultPanel from "./ResultPanel.jsx";
import BladeSplitCard from "./BladeSplitCard.jsx";
import VerificationCard from "./VerificationCard.jsx";
import { UNITS } from "./MeasurementsForm.jsx";
import Select from "../ui/Select.jsx";

const STEPS = [
    { label: "Identificação" },
    { label: "V₀ original" },
    { label: "V₁ · 0°" },
    { label: "V₂ · 120°" },
    { label: "V₃ · 240°" },
    { label: "Resultado" },
];

const MEAS_STEPS = {
    1: {
        key: "Vo", highlight: null, title: "Primeira medição — vibração original",
        text: "Com o rotor em operação normal e SEM nenhuma massa de teste, meça e registre a vibração original V₀.",
    },
    2: {
        key: "V1", highlight: 1, title: "Segunda medição — massa na posição 1",
        text: "Pare o rotor, fixe a massa de teste Mₜ na posição 1 (0°), opere novamente e registre a vibração V₁.",
    },
    3: {
        key: "V2", highlight: 2, title: "Terceira medição — massa na posição 2",
        text: "Retire a massa da posição 1 e fixe-a na posição 2 (120°). Registre a vibração V₂.",
    },
    4: {
        key: "V3", highlight: 3, title: "Quarta medição — massa na posição 3",
        text: "Retire a massa da posição 2 e fixe-a na posição 3 (240°). Registre a vibração V₃.",
    },
};

export default function WizardMode({
    form, patch, patchMeas, patchVerif, pv, result, split, reduction, status, onSave, saveDisabled, extraActions,
}) {
    const [step, setStep] = useState(0);

    const canAdvance = () => {
        if (step === 0) return true;
        if (step === 1) return pv.Vo !== null;
        if (step === 2) return pv.V1 !== null && pv.Mt !== null;
        if (step === 3) return pv.V2 !== null;
        if (step === 4) return pv.V3 !== null;
        return false;
    };

    const meas = MEAS_STEPS[step];

    return (
        <div className="max-w-2xl mx-auto space-y-5">
            <Stepper steps={STEPS} current={step} onSelect={setStep} />

            {step === 0 && (
                <Card title="Identificação e máquina" subtitle="Dados usados no relatório (opcionais)">
                    <div className="space-y-4">
                        <IdentificationForm value={form} onChange={patch} />
                        <MachineForm value={form} onChange={patch} />
                        <Select
                            label="Unidade de vibração"
                            options={UNITS}
                            value={form.meas.unit}
                            onChange={(e) => patchMeas({ unit: e.target.value })}
                        />
                    </div>
                </Card>
            )}

            {meas && (
                <Card title={meas.title}>
                    <div className="space-y-4">
                        <RotorIllustration highlight={meas.highlight} />
                        <p className="text-sm text-text-muted text-center max-w-md mx-auto">{meas.text}</p>
                        <div className="max-w-xs mx-auto space-y-3">
                            <Input
                                label={`Vibração ${["", "V₀", "V₁", "V₂", "V₃"][step]}`}
                                suffix={form.meas.unit}
                                placeholder="0,00"
                                inputMode="decimal"
                                autoFocus
                                value={form.meas[meas.key]}
                                onChange={(e) => patchMeas({ [meas.key]: e.target.value })}
                            />
                            {step === 2 && (
                                <Input
                                    label="Massa de teste Mₜ"
                                    sub="a mesma nas 3 posições"
                                    suffix="g"
                                    placeholder="0,00"
                                    inputMode="decimal"
                                    value={form.meas.Mt}
                                    onChange={(e) => patchMeas({ Mt: e.target.value })}
                                />
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {step === 5 && (
                <Card title="Resultado">
                    <div className="space-y-4">
                        <div className="max-w-sm mx-auto">
                            <PolarDiagram
                                pv={pv} result={result}
                                blades={parseInt(form.machine.blades, 10) || null}
                                bladeOffset={parseFloat(form.machine.bladeOffset) || 0}
                            />
                        </div>
                        <ResultPanel result={result} meas={form.meas} />
                        {result && <BladeSplitCard split={split} />}
                        {result && (
                            <VerificationCard
                                Vo={pv.Vo} unit={form.meas.unit}
                                value={form.verification} onChange={patchVerif}
                                reduction={reduction} status={status}
                            />
                        )}
                        <div className="flex flex-wrap gap-2">
                            <Button variant="primary" disabled={saveDisabled} onClick={onSave}>Salvar</Button>
                            {extraActions}
                        </div>
                    </div>
                </Card>
            )}

            <div className="flex justify-between">
                <Button icon={ArrowLeft} disabled={step === 0} onClick={() => setStep(step - 1)}>
                    Voltar
                </Button>
                {step < 5 && (
                    <Button variant="primary" icon={ArrowRight} disabled={!canAdvance()} onClick={() => setStep(step + 1)}>
                        Avançar
                    </Button>
                )}
            </div>
        </div>
    );
}
```

- [ ] **Step 3: Integrar no `BalancePage.jsx`**

Adicionar estado e SegmentedControl abaixo do PageHeader:

```jsx
import { PenLine, Wand2 } from "lucide-react";
import SegmentedControl from "../components/ui/SegmentedControl.jsx";
import WizardMode from "../components/balance/WizardMode.jsx";

// dentro do componente:
const [mode, setMode] = useState("direct");

// logo após <PageHeader ...>:
<div className="mb-5">
    <SegmentedControl
        value={mode}
        onChange={setMode}
        options={[
            { value: "direct", label: "Modo direto", icon: PenLine },
            { value: "wizard", label: "Modo guiado", icon: Wand2 },
        ]}
    />
</div>
```

Envolver o grid do modo direto em `{mode === "direct" && (...)}` e adicionar:

```jsx
{mode === "wizard" && (
    <WizardMode
        form={form} patch={patch} patchMeas={patchMeas} patchVerif={patchVerif}
        pv={pv} result={result} split={split} reduction={reduction} status={status}
        onSave={handleSave} saveDisabled={!result}
    />
)}
```

(O diagrama oculto de impressão e o ConfirmDialog ficam FORA do condicional — servem aos dois modos.)

- [ ] **Step 4: Verificar no navegador**

Run: `npm run dev` → alternar para "Modo guiado", percorrer os 6 passos com o exemplo canônico. "Avançar" deve ficar desabilitado até o campo do passo estar válido; ilustração destaca a posição correta (passo V₂ → posição 2 preenchida com chip Mₜ); passo final mostra Mc 4,68 g; alternar de volta para "Modo direto" preserva os valores digitados.
Expected: sem erros no console.

- [ ] **Step 5: Commit**

```bash
git add src/components/balance/ src/pages/BalancePage.jsx
git commit -m "feat: add guided wizard mode with rotor illustrations"
```

---

### Task 9: Relatório PDF profissional

**Files:**
- Modify: `src/utils/pdf.js` (substituir TODO o conteúdo)
- Modify: `src/pages/BalancePage.jsx` (botão Exportar PDF nos dois modos)

**Interfaces:**
- Consumes: `svgElementToPngDataUrl` (Task 6), `fmtNum`, `fmtDateTime` (Task 2), sessão v2 + `repository.nextReportNumber()` (Task 3).
- Produces: `async generatePdfReport({ session, settings, diagramSvgElement })` — gera e baixa o PDF; `diagramSvgElement` pode ser null (PDF sai sem diagrama). Usado também pelo Histórico (Task 10).

- [ ] **Step 1: Reescrever `src/utils/pdf.js`**

```js
/* ─── Relatório PDF profissional (paleta clara fixa) ─────────────────────── */
import jsPDF from "jspdf";
import "jspdf-autotable";
import { fmtNum, fmtDateTime } from "./format.js";
import { svgElementToPngDataUrl } from "./svg.js";

const C = {
    text: [26, 29, 38],
    muted: [91, 98, 112],
    subtle: [138, 144, 156],
    primary: [37, 99, 235],
    primarySoft: [239, 246, 255],
    border: [226, 229, 234],
    stripe: [246, 247, 249],
    ok: [22, 163, 74],
    warn: [217, 119, 6],
    critical: [220, 38, 38],
};

const STATUS = {
    excellent: { label: "Excelente", color: C.ok },
    good: { label: "Bom", color: C.ok },
    acceptable: { label: "Aceitável", color: C.warn },
    redo: { label: "Refazer", color: C.critical },
};

const TABLE = {
    theme: "grid",
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2.6, textColor: C.text, lineColor: C.border, lineWidth: 0.15 },
    headStyles: { fillColor: C.primarySoft, textColor: C.primary, fontStyle: "bold" },
    alternateRowStyles: { fillColor: C.stripe },
};

const dash = (v) => (v === null || v === undefined || v === "" ? "—" : String(v));

function sectionTitle(doc, label, margin, y) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...C.primary);
    doc.text(label.toUpperCase(), margin, y);
    return y + 3;
}

export async function generatePdfReport({ session, settings, diagramSvgElement }) {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const M = 16;
    let y = 18;

    const { client = {}, machine = {}, measurements: me = {}, result, bladeSplit, verification, report, notes } = session;
    const unit = me.unit ?? "mm/s";

    /* Cabeçalho */
    let xText = M;
    if (settings.logo) {
        try {
            const fmt = settings.logo.startsWith("data:image/png") ? "PNG" : "JPEG";
            doc.addImage(settings.logo, fmt, M, y - 4, 22, 22, undefined, "FAST");
            xText = M + 28;
        } catch { /* logo inválida — segue sem */ }
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...C.text);
    doc.text(settings.company || "RotorBalance Automatic", xText, y + 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...C.muted);
    doc.text("Relatório de Balanceamento — Método dos Três Pontos", xText, y + 8);
    doc.setFontSize(8.5);
    doc.setTextColor(...C.subtle);
    const headRight = `${report?.number ?? ""}`;
    if (headRight) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C.primary);
        doc.text(headRight, W - M, y + 2, { align: "right" });
        doc.setFont("helvetica", "normal");
    }
    doc.setTextColor(...C.subtle);
    doc.text(fmtDateTime(session.updatedAt ?? new Date().toISOString()), W - M, y + 8, { align: "right" });
    y += 16;
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(M, y, W - M, y);
    y += 8;

    /* Identificação */
    y = sectionTitle(doc, "Identificação", M, y);
    doc.autoTable({
        ...TABLE,
        startY: y,
        margin: { left: M, right: M },
        head: [["Cliente", "Contato", "Técnico responsável"]],
        body: [[dash(client.name), dash(client.contact), dash(session.technician || settings.technician)]],
    });
    y = doc.lastAutoTable.finalY + 2;
    doc.autoTable({
        ...TABLE,
        startY: y,
        margin: { left: M, right: M },
        head: [["TAG", "Equipamento", "Local", "Rotação", "Raio fixação", "Nº de pás"]],
        body: [[
            dash(machine.tag), dash(machine.name), dash(machine.location),
            machine.rpm ? `${machine.rpm} RPM` : "—",
            machine.radius ? `${fmtNum(machine.radius, 0)} mm` : "—",
            dash(machine.blades),
        ]],
    });
    y = doc.lastAutoTable.finalY + 7;

    /* Medições */
    y = sectionTitle(doc, "Medições", M, y);
    doc.autoTable({
        ...TABLE,
        startY: y,
        margin: { left: M, right: M },
        head: [["Rodada", "Condição", "Símbolo", "Valor"]],
        body: [
            ["1ª", "Sem massa de teste", "V0", `${fmtNum(me.Vo)} ${unit}`],
            ["2ª", "Massa de teste na posição 1 (0°)", "V1", `${fmtNum(me.V1)} ${unit}`],
            ["3ª", "Massa de teste na posição 2 (120°)", "V2", `${fmtNum(me.V2)} ${unit}`],
            ["4ª", "Massa de teste na posição 3 (240°)", "V3", `${fmtNum(me.V3)} ${unit}`],
            ["—", "Massa de teste utilizada", "Mt", `${fmtNum(me.Mt)} g`],
        ],
    });
    y = doc.lastAutoTable.finalY + 7;

    /* Resultado (destaque) */
    if (result) {
        y = sectionTitle(doc, "Resultado", M, y);
        doc.setFillColor(...C.primarySoft);
        doc.setDrawColor(...C.primary);
        doc.setLineWidth(0.2);
        doc.roundedRect(M, y, W - 2 * M, 20, 2, 2, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.setTextColor(...C.text);
        doc.text(`Massa de correção: ${fmtNum(result.Mc)} g  @  ${fmtNum(result.angle, 1)}°`, W / 2, y + 9, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...C.muted);
        doc.text(
            `OP = ${fmtNum(result.OP, 3)} · Px = ${fmtNum(result.Px, 4)} · Py = ${fmtNum(result.Py, 4)}`,
            W / 2, y + 15.5, { align: "center" }
        );
        y += 27;

        if (bladeSplit) {
            doc.autoTable({
                ...TABLE,
                startY: y,
                margin: { left: M, right: M },
                head: [["Divisão entre pás", "Pá", "Ângulo", "Massa"]],
                body: [
                    ["Massa A", `Pá ${bladeSplit.bladeA}`, `${fmtNum(bladeSplit.angleA, 0)}°`, `${fmtNum(bladeSplit.massA)} g`],
                    ["Massa B", `Pá ${bladeSplit.bladeB}`, `${fmtNum(bladeSplit.angleB, 0)}°`, `${fmtNum(bladeSplit.massB)} g`],
                ],
            });
            y = doc.lastAutoTable.finalY + 7;
        }
    }

    /* Verificação pós-balanceamento */
    if (verification && result) {
        y = sectionTitle(doc, "Verificação pós-balanceamento", M, y);
        const st = STATUS[verification.status] ?? STATUS.redo;
        doc.autoTable({
            ...TABLE,
            startY: y,
            margin: { left: M, right: M },
            head: [["Vibração original", "Vibração final", "Redução", "Status"]],
            body: [[
                `${fmtNum(me.Vo)} ${unit}`,
                `${fmtNum(verification.Vf)} ${unit}`,
                `${fmtNum(verification.reduction, 1)}%`,
                st.label,
            ]],
            didParseCell(data) {
                if (data.section === "body" && data.column.index === 3) {
                    data.cell.styles.textColor = st.color;
                    data.cell.styles.fontStyle = "bold";
                }
            },
        });
        y = doc.lastAutoTable.finalY + 7;
    }

    /* Memória de cálculo */
    if (result) {
        if (y > H - 70) { doc.addPage(); y = 18; }
        y = sectionTitle(doc, "Memória de cálculo", M, y);
        doc.setFont("courier", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...C.muted);
        // Apenas caracteres WinAnsi (fontes padrão do jsPDF): sem −, √, θ, subscritos
        const lines = [
            `Px = (V3² - V2²) / (2·sqrt(3)·V0) = (${fmtNum(me.V3)}² - ${fmtNum(me.V2)}²) / (2·sqrt(3)·${fmtNum(me.Vo)}) = ${fmtNum(result.Px, 4)}`,
            `Py = (V2² + V3² - 2·V1²) / (6·V0) = (${fmtNum(me.V2)}² + ${fmtNum(me.V3)}² - 2·${fmtNum(me.V1)}²) / (6·${fmtNum(me.Vo)}) = ${fmtNum(result.Py, 4)}`,
            `OP = sqrt(Px² + Py²) = ${fmtNum(result.OP, 4)}`,
            `Ângulo = atan2(Px, Py) = ${fmtNum(result.angle, 2)}°`,
            `Mc = Mt × V0 / OP = ${fmtNum(me.Mt)} × ${fmtNum(me.Vo)} / ${fmtNum(result.OP, 4)} = ${fmtNum(result.Mc)} g`,
        ];
        lines.forEach((l) => { doc.text(l, M, y + 4); y += 4.5; });
        doc.setFont("helvetica", "normal");
        y += 6;
    }

    /* Diagrama polar */
    if (diagramSvgElement) {
        try {
            const png = await svgElementToPngDataUrl(diagramSvgElement, 900);
            const size = 105;
            if (y + size > H - 45) { doc.addPage(); y = 18; }
            y = sectionTitle(doc, "Diagrama polar", M, y);
            doc.addImage(png, "PNG", (W - size) / 2, y + 1, size, size);
            y += size + 8;
        } catch { /* segue sem diagrama */ }
    }

    /* Notas */
    if (notes) {
        if (y > H - 55) { doc.addPage(); y = 18; }
        y = sectionTitle(doc, "Notas", M, y);
        doc.setFontSize(9);
        doc.setTextColor(...C.muted);
        const split = doc.splitTextToSize(notes, W - 2 * M);
        doc.text(split, M, y + 4);
        y += split.length * 4.5 + 8;
    }

    /* Assinatura */
    if (y > H - 45) { doc.addPage(); y = 18; }
    y = Math.max(y + 10, H - 42);
    doc.setDrawColor(...C.subtle);
    doc.setLineWidth(0.3);
    doc.line(W / 2 - 40, y, W / 2 + 40, y);
    doc.setFontSize(9);
    doc.setTextColor(...C.text);
    doc.text(session.technician || settings.technician || "Técnico responsável", W / 2, y + 5, { align: "center" });
    doc.setFontSize(7.5);
    doc.setTextColor(...C.subtle);
    doc.text("Técnico responsável", W / 2, y + 9.5, { align: "center" });

    /* Rodapé em todas as páginas */
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setDrawColor(...C.border);
        doc.setLineWidth(0.2);
        doc.line(M, H - 12, W - M, H - 12);
        doc.setFontSize(7);
        doc.setTextColor(...C.subtle);
        doc.text("Gerado por RotorBalance Automatic v2.0 — Método dos Três Pontos (0° · 120° · 240°)", M, H - 8);
        doc.text(`Página ${i} de ${pages}`, W - M, H - 8, { align: "right" });
    }

    const safe = (s) => String(s || "").replace(/[^\p{L}\p{N}-]+/gu, "-").replace(/^-+|-+$/g, "");
    const name = [report?.number, safe(machine.tag)].filter(Boolean).join("_") || `RBA_${new Date().toISOString().slice(0, 10)}`;
    doc.save(`${name}.pdf`);
}
```

- [ ] **Step 2: Botão PDF no `BalancePage.jsx`**

```jsx
import { FileDown } from "lucide-react";
import { generatePdfReport } from "../utils/pdf.js";

// dentro do componente:
const handlePdf = async () => {
    if (!result) return;
    try {
        let number = reportNumber;
        if (!number) {
            number = repository.nextReportNumber();
            setReportNumber(number);
        }
        const saved = repository.sessions.save({ ...buildSession(), report: { number } });
        setSessionId(saved.id);
        const svgEl = printRef.current?.querySelector("svg");
        await generatePdfReport({ session: saved, settings: repository.settings.get(), diagramSvgElement: svgEl });
        toast("PDF exportado!");
    } catch (err) {
        console.error(err);
        toast("Erro ao gerar PDF", "error");
    }
};
```

No modo direto, entre Salvar e Limpar: `<Button icon={FileDown} disabled={!result} onClick={handlePdf}>Exportar PDF</Button>`.
No wizard: `extraActions={<Button icon={FileDown} disabled={!result} onClick={handlePdf}>Exportar PDF</Button>}`.

- [ ] **Step 3: Verificar**

Run: `npm run dev` → exemplo canônico → Exportar PDF. Abrir o arquivo baixado e conferir: logo ausente ok, número RBA-AAAA-001, tabelas de identificação/medições, destaque do resultado, memória de cálculo, diagrama em fundo BRANCO (mesmo com UI em tema escuro), rodapé com paginação, acentuação correta (ç, ã, °, ²).
Expected: PDF completo e legível; exportar de novo gera RBA-AAAA-002.

- [ ] **Step 4: Commit**

```bash
git add src/utils/pdf.js src/pages/BalancePage.jsx
git commit -m "feat: add professional PDF report with full identification and calc memory"
```

---

### Task 10: Página Histórico

**Files:**
- Modify: `src/pages/HistoryPage.jsx` (substituir placeholder)

**Interfaces:**
- Consumes: `repository.sessions`, `repository.settings`, `repository.nextReportNumber` (Task 3); ui (Task 4); `PolarDiagram` (Task 6); `generatePdfReport` (Task 9); `fmtNum`, `fmtDateTime` (Task 2); `useToast`.
- Produces: navegação para BalancePage com `state: { session }` (reabrir) e `state: { session, duplicate: true }` (duplicar) — contrato da Task 7.

- [ ] **Step 1: Implementar `HistoryPage.jsx`**

```jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FolderOpen, Copy, FileDown, Trash2, History as HistoryIcon, Plus } from "lucide-react";
import PageHeader from "../components/layout/PageHeader.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import Input from "../components/ui/Input.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import PolarDiagram from "../components/balance/PolarDiagram.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { repository } from "../data/repository.js";
import { generatePdfReport } from "../utils/pdf.js";
import { fmtNum, fmtDateTime } from "../utils/format.js";

const STATUS = {
    excellent: { label: "Excelente", tone: "ok" },
    good: { label: "Bom", tone: "ok" },
    acceptable: { label: "Aceitável", tone: "warn" },
    redo: { label: "Refazer", tone: "critical" },
};

export default function HistoryPage() {
    const navigate = useNavigate();
    const toast = useToast();
    const [sessions, setSessions] = useState(() => repository.sessions.list());
    const [q, setQ] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [confirm, setConfirm] = useState(null);
    const [pdfSession, setPdfSession] = useState(null);

    const refresh = () => setSessions(repository.sessions.list());

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        return sessions.filter((s) => {
            if (needle) {
                const hay = [s.client?.name, s.machine?.tag, s.machine?.name, s.machine?.location, s.notes]
                    .filter(Boolean).join(" ").toLowerCase();
                if (!hay.includes(needle)) return false;
            }
            const d = s.createdAt?.slice(0, 10);
            if (from && d < from) return false;
            if (to && d > to) return false;
            return true;
        });
    }, [sessions, q, from, to]);

    // Re-exportação de PDF: renderiza o diagrama oculto e gera após o paint
    useEffect(() => {
        if (!pdfSession) return;
        const t = setTimeout(async () => {
            try {
                let session = pdfSession;
                if (!session.report?.number) {
                    session = repository.sessions.save({ ...session, report: { number: repository.nextReportNumber() } });
                    refresh();
                }
                const svgEl = document.getElementById("history-print-diagram")?.querySelector("svg");
                await generatePdfReport({ session, settings: repository.settings.get(), diagramSvgElement: svgEl });
                toast("PDF exportado!");
            } catch (err) {
                console.error(err);
                toast("Erro ao gerar PDF", "error");
            } finally {
                setPdfSession(null);
            }
        }, 60);
        return () => clearTimeout(t);
    }, [pdfSession]);

    const handleDelete = (id) => {
        repository.sessions.remove(id);
        refresh();
        toast("Sessão excluída.");
    };

    return (
        <>
            <PageHeader
                title="Histórico"
                subtitle={`${sessions.length} sessão(ões) salva(s)`}
                actions={
                    <Button variant="primary" icon={Plus} onClick={() => navigate("/balanceamento")}>
                        Novo balanceamento
                    </Button>
                }
            />

            <Card className="mb-5">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 items-end">
                    <label className="block">
                        <span className="block text-xs font-medium text-text-muted mb-1.5">Buscar</span>
                        <span className="relative block">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
                            <input
                                className="w-full h-10 rounded-lg bg-surface-2 border border-border pl-9 pr-3 text-sm text-text placeholder:text-text-subtle focus:outline-none focus:border-primary"
                                placeholder="Cliente, TAG, equipamento…"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                            />
                        </span>
                    </label>
                    <Input label="De" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                    <Input label="Até" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </div>
            </Card>

            {filtered.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={HistoryIcon}
                        title={sessions.length === 0 ? "Nenhuma sessão salva ainda" : "Nada encontrado"}
                        text={sessions.length === 0
                            ? "Faça um balanceamento e salve a sessão para vê-la aqui."
                            : "Ajuste a busca ou o período."}
                        action={sessions.length === 0 && (
                            <Button variant="primary" icon={Plus} onClick={() => navigate("/balanceamento")}>
                                Novo balanceamento
                            </Button>
                        )}
                    />
                </Card>
            ) : (
                <div className="space-y-3">
                    {filtered.map((s) => {
                        const st = s.verification ? STATUS[s.verification.status] : null;
                        return (
                            <div key={s.id} className="bg-surface-1 border border-border rounded-xl p-4 flex flex-wrap items-center gap-3">
                                <div className="flex-1 min-w-[180px]">
                                    <p className="text-sm font-semibold text-text">
                                        {s.machine?.name || s.machine?.tag || "Equipamento sem nome"}
                                        {s.machine?.tag && s.machine?.name ? ` · ${s.machine.tag}` : ""}
                                    </p>
                                    <p className="text-xs text-text-muted mt-0.5">
                                        {[s.client?.name, fmtDateTime(s.createdAt)].filter(Boolean).join(" · ")}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-text">
                                        {s.result ? `${fmtNum(s.result.Mc)} g @ ${fmtNum(s.result.angle, 1)}°` : "—"}
                                    </p>
                                    <div className="mt-1 flex justify-end gap-1.5">
                                        {s.report?.number && <Badge tone="primary">{s.report.number}</Badge>}
                                        {st ? <Badge tone={st.tone}>{st.label}</Badge> : <Badge>Sem verificação</Badge>}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button size="sm" variant="ghost" icon={FolderOpen} title="Reabrir"
                                        onClick={() => navigate("/balanceamento", { state: { session: s } })} />
                                    <Button size="sm" variant="ghost" icon={Copy} title="Duplicar"
                                        onClick={() => navigate("/balanceamento", { state: { session: s, duplicate: true } })} />
                                    <Button size="sm" variant="ghost" icon={FileDown} title="Exportar PDF"
                                        disabled={!s.result || !!pdfSession}
                                        onClick={() => setPdfSession(s)} />
                                    <Button size="sm" variant="ghost" icon={Trash2} title="Excluir"
                                        className="hover:text-critical"
                                        onClick={() => setConfirm(s.id)} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Diagrama oculto para re-exportação */}
            {pdfSession?.result && (
                <div id="history-print-diagram" className="hidden" aria-hidden="true">
                    <PolarDiagram
                        pv={pdfSession.measurements}
                        result={pdfSession.result}
                        blades={pdfSession.machine?.blades}
                        bladeOffset={pdfSession.machine?.bladeOffset ?? 0}
                        palette="print"
                    />
                </div>
            )}

            <ConfirmDialog
                open={!!confirm}
                onClose={() => setConfirm(null)}
                onConfirm={() => handleDelete(confirm)}
                title="Excluir sessão"
                message="Esta sessão será removida permanentemente. Continuar?"
            />
        </>
    );
}
```

- [ ] **Step 2: Verificar**

Run: `npm run dev` → salvar 2 sessões com clientes/TAGs diferentes → `/historico`: busca filtra, datas filtram, reabrir carrega os valores na calculadora, duplicar carrega sem manter o id (salvar cria nova), re-exportar PDF baixa com diagrama, excluir pede confirmação.
Expected: tudo funcional nos 2 temas.

- [ ] **Step 3: Commit**

```bash
git add src/pages/HistoryPage.jsx
git commit -m "feat: add history page with search, filters and per-session actions"
```

---

### Task 11: Dashboard

**Files:**
- Modify: `src/pages/DashboardPage.jsx` (substituir placeholder)

**Interfaces:**
- Consumes: `repository.sessions` (Task 3), `StatCard`, `Card`, `Badge`, `Button`, `EmptyState` (Task 4), `fmtNum`, `fmtDateTime` (Task 2).

- [ ] **Step 1: Implementar `DashboardPage.jsx`**

```jsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Scale, TrendingDown, Factory, Archive, ArrowRight, Gauge } from "lucide-react";
import PageHeader from "../components/layout/PageHeader.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { repository } from "../data/repository.js";
import { fmtNum, fmtDateTime } from "../utils/format.js";

const STATUS = {
    excellent: { label: "Excelente", tone: "ok" },
    good: { label: "Bom", tone: "ok" },
    acceptable: { label: "Aceitável", tone: "warn" },
    redo: { label: "Refazer", tone: "critical" },
};

export default function DashboardPage() {
    const navigate = useNavigate();
    const sessions = useMemo(() => repository.sessions.list(), []);

    const stats = useMemo(() => {
        const now = new Date();
        const monthCount = sessions.filter((s) => {
            const d = new Date(s.createdAt);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
        const verified = sessions.filter((s) => s.verification);
        const avgReduction = verified.length
            ? verified.reduce((acc, s) => acc + s.verification.reduction, 0) / verified.length
            : null;
        const machines = new Set(
            sessions.map((s) => s.machine?.tag || s.machine?.name).filter(Boolean)
        ).size;
        return { monthCount, avgReduction, machines, total: sessions.length };
    }, [sessions]);

    return (
        <>
            <PageHeader
                title="Dashboard"
                subtitle="Visão geral dos balanceamentos"
                actions={
                    <Button variant="primary" icon={Plus} onClick={() => navigate("/balanceamento")}>
                        Novo balanceamento
                    </Button>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Balanceamentos no mês" value={stats.monthCount} icon={Scale} tone="primary" />
                <StatCard
                    label="Redução média de vibração"
                    value={stats.avgReduction !== null ? `${fmtNum(stats.avgReduction, 0)}%` : "—"}
                    sub={stats.avgReduction === null ? "sem verificações ainda" : "sessões verificadas"}
                    icon={TrendingDown} tone="ok"
                />
                <StatCard label="Máquinas atendidas" value={stats.machines} icon={Factory} />
                <StatCard label="Total de sessões" value={stats.total} icon={Archive} />
            </div>

            <Card
                title="Sessões recentes"
                subtitle="Últimos balanceamentos salvos"
                actions={
                    sessions.length > 0 && (
                        <Button size="sm" variant="ghost" onClick={() => navigate("/historico")}>
                            Ver todas <ArrowRight size={14} />
                        </Button>
                    )
                }
            >
                {sessions.length === 0 ? (
                    <EmptyState
                        icon={Gauge}
                        title="Nenhum balanceamento ainda"
                        text="Comece o primeiro balanceamento pelo método dos três pontos — o resultado aparece aqui."
                        action={
                            <Button variant="primary" icon={Plus} onClick={() => navigate("/balanceamento")}>
                                Começar agora
                            </Button>
                        }
                    />
                ) : (
                    <ul className="divide-y divide-border">
                        {sessions.slice(0, 5).map((s) => {
                            const st = s.verification ? STATUS[s.verification.status] : null;
                            return (
                                <li key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-text truncate">
                                            {s.machine?.name || s.machine?.tag || s.client?.name || "Sessão"}
                                        </p>
                                        <p className="text-xs text-text-muted">{fmtDateTime(s.createdAt)}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-text whitespace-nowrap">
                                        {s.result ? `${fmtNum(s.result.Mc)} g @ ${fmtNum(s.result.angle, 1)}°` : "—"}
                                    </p>
                                    {st && <Badge tone={st.tone}>{st.label}</Badge>}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </Card>
        </>
    );
}
```

- [ ] **Step 2: Verificar**

Run: `npm run dev` → `/dashboard` com sessões salvas: KPIs corretos (contagem do mês, média de redução só das verificadas, máquinas distintas), lista das 5 recentes, CTA navega. Sem sessões: empty state com CTA.

- [ ] **Step 3: Commit**

```bash
git add src/pages/DashboardPage.jsx
git commit -m "feat: add dashboard with KPIs and recent sessions"
```

---

### Task 12: Página Configurações + upload de logo

**Files:**
- Create: `src/utils/image.js`
- Modify: `src/pages/SettingsPage.jsx` (substituir placeholder)

**Interfaces:**
- Consumes: `repository.settings`, `repository.backup`, `repository.sessions` (Task 3); `useTheme` (Task 4); ui; `UNITS` (Task 7); `useToast`.
- Produces: `image.js`: `async fileToCompressedDataUrl(file, { maxDim = 512, quality = 0.85 })` → dataURL (PNG se o arquivo for PNG — preserva transparência —, senão JPEG).

- [ ] **Step 1: Criar `src/utils/image.js`**

```js
/* ─── Compressão de imagem client-side (logo do relatório) ───────────────── */

export function fileToCompressedDataUrl(file, { maxDim = 512, quality = 0.85 } = {}) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Falha ao ler o arquivo"));
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
                const canvas = document.createElement("canvas");
                canvas.width = Math.max(1, Math.round(img.width * scale));
                canvas.height = Math.max(1, Math.round(img.height * scale));
                canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
                const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
                resolve(canvas.toDataURL(mime, quality));
            };
            img.onerror = () => reject(new Error("Imagem inválida"));
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}
```

- [ ] **Step 2: Implementar `SettingsPage.jsx`**

```jsx
import { useRef, useState } from "react";
import { Upload, Trash2, Download, FileUp, AlertTriangle } from "lucide-react";
import PageHeader from "../components/layout/PageHeader.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { useTheme } from "../theme/ThemeContext.jsx";
import { repository } from "../data/repository.js";
import { fileToCompressedDataUrl } from "../utils/image.js";
import { UNITS } from "../components/balance/MeasurementsForm.jsx";

export default function SettingsPage() {
    const toast = useToast();
    const { theme, setTheme } = useTheme();
    const [settings, setSettings] = useState(() => repository.settings.get());
    const [confirmClear, setConfirmClear] = useState(false);
    const [importData, setImportData] = useState(null);
    const logoInput = useRef(null);
    const importInput = useRef(null);

    const update = (partial) => setSettings(repository.settings.update(partial));

    const handleLogo = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        try {
            const dataUrl = await fileToCompressedDataUrl(file);
            update({ logo: dataUrl });
            toast("Logo atualizada!");
        } catch {
            toast("Não foi possível processar a imagem", "error");
        }
    };

    const handleExport = () => {
        const blob = new Blob([JSON.stringify(repository.backup.export(), null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `rba-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
        toast("Backup exportado!");
    };

    const handleImportFile = (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                setImportData(JSON.parse(reader.result));
            } catch {
                toast("Arquivo de backup inválido", "error");
            }
        };
        reader.readAsText(file);
    };

    return (
        <>
            <PageHeader title="Configurações" subtitle="Perfil, relatório e dados" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                <Card title="Perfil" subtitle="Usado no cabeçalho e assinatura do relatório">
                    <div className="space-y-3">
                        <Input label="Técnico responsável" placeholder="Seu nome" value={settings.technician}
                            onChange={(e) => update({ technician: e.target.value })} />
                        <Input label="Empresa" placeholder="Nome da empresa" value={settings.company}
                            onChange={(e) => update({ company: e.target.value })} />
                        <Input label="Contato" placeholder="E-mail ou telefone" value={settings.contact}
                            onChange={(e) => update({ contact: e.target.value })} />
                    </div>
                </Card>

                <Card title="Logo do relatório" subtitle="Aparece no cabeçalho do PDF (white-label)">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-lg border border-dashed border-border-strong bg-surface-2 flex items-center justify-center overflow-hidden shrink-0">
                            {settings.logo
                                ? <img src={settings.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                                : <span className="text-[10px] text-text-subtle text-center px-1">Sem logo</span>}
                        </div>
                        <div className="space-y-2">
                            <input ref={logoInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogo} />
                            <Button icon={Upload} onClick={() => logoInput.current?.click()}>Enviar logo</Button>
                            {settings.logo && (
                                <Button variant="ghost" icon={Trash2} onClick={() => update({ logo: null })}>Remover</Button>
                            )}
                        </div>
                    </div>
                </Card>

                <Card title="Preferências">
                    <div className="grid grid-cols-2 gap-3">
                        <Select label="Unidade padrão" options={UNITS} value={settings.defaultUnit}
                            onChange={(e) => update({ defaultUnit: e.target.value })} />
                        <Select label="Tema"
                            options={[
                                { value: "system", label: "Sistema" },
                                { value: "light", label: "Claro" },
                                { value: "dark", label: "Escuro" },
                            ]}
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)} />
                    </div>
                </Card>

                <Card title="Dados" subtitle="Backup local em JSON">
                    <div className="flex flex-wrap gap-2">
                        <Button icon={Download} onClick={handleExport}>Exportar backup</Button>
                        <input ref={importInput} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
                        <Button icon={FileUp} onClick={() => importInput.current?.click()}>Importar backup</Button>
                        <Button variant="danger" icon={AlertTriangle} onClick={() => setConfirmClear(true)}>
                            Limpar histórico
                        </Button>
                    </div>
                </Card>

                <Card title="Sobre" className="lg:col-span-2">
                    <p className="text-sm text-text-muted leading-relaxed">
                        <span className="font-semibold text-text">RotorBalance Automatic v2.0</span> — balanceamento de rotores
                        em um plano pelo método dos três pontos (four-run method), sem medição de fase.
                        Quatro medições de vibração (V₀, V₁ @ 0°, V₂ @ 120°, V₃ @ 240°) determinam a massa de correção:
                        Mc = Mₜ × V₀ / OP.
                    </p>
                </Card>
            </div>

            <ConfirmDialog
                open={confirmClear}
                onClose={() => setConfirmClear(false)}
                onConfirm={() => { repository.sessions.clear(); toast("Histórico limpo."); }}
                title="Limpar histórico"
                message="TODAS as sessões salvas serão excluídas permanentemente. As configurações são mantidas. Continuar?"
                confirmLabel="Limpar tudo"
            />
            <ConfirmDialog
                open={!!importData}
                onClose={() => setImportData(null)}
                onConfirm={() => {
                    const { imported } = repository.backup.import(importData, { merge: true });
                    setSettings(repository.settings.get());
                    toast(`${imported} sessão(ões) importada(s).`);
                }}
                title="Importar backup"
                message={`O backup contém ${importData?.sessions?.length ?? 0} sessão(ões). Elas serão mescladas ao histórico atual (sem duplicar ids). Continuar?`}
                confirmLabel="Importar"
                danger={false}
            />
        </>
    );
}
```

- [ ] **Step 3: Verificar**

Run: `npm run dev` → `/configuracoes`: preencher perfil (persiste após reload), enviar logo (preview aparece; exportar PDF novamente → logo no cabeçalho), trocar tema pelo select, exportar backup (JSON baixa), importar o mesmo backup (0 novas, mescla sem duplicar), limpar histórico com confirmação.
Expected: tudo persistente e sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/utils/image.js src/pages/SettingsPage.jsx
git commit -m "feat: add settings page with profile, logo upload, preferences and backup"
```

---

### Task 13: Limpeza do código v1 + bump de versão

**Files:**
- Delete: `src/components/Header.jsx`, `src/components/Calculator.jsx`, `src/components/History.jsx`, `src/components/HelpModal.jsx`, `src/components/Diagram.jsx`, `src/components/ThemeToggle.jsx`, `src/utils/storage.js`, `balanceamento_tres_pontos.jsx` (raiz)
- Modify: `package.json` (version → `2.0.0`)

- [ ] **Step 1: Confirmar que nada importa os arquivos antigos**

Run: `grep -rn "utils/storage\|components/Header\|components/Calculator\|components/History\.jsx\|HelpModal\|components/Diagram\|components/ThemeToggle" src/ index.html`
Expected: nenhuma ocorrência (se houver, corrigir o import antes de deletar).

- [ ] **Step 2: Deletar arquivos órfãos**

```bash
git rm src/components/Header.jsx src/components/Calculator.jsx src/components/History.jsx \
  src/components/HelpModal.jsx src/components/Diagram.jsx src/components/ThemeToggle.jsx \
  src/utils/storage.js balanceamento_tres_pontos.jsx
```

- [ ] **Step 3: Bump de versão**

`package.json`: `"version": "2.0.0"`.

- [ ] **Step 4: Build + testes**

Run: `npm run test && npm run build`
Expected: testes PASS, build verde.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove v1 UI components and bump version to 2.0.0"
```

---

### Task 14: Verificação final (Playwright + Capacitor)

**Files:** nenhum novo (correções pontuais se a verificação achar problemas).

- [ ] **Step 1: Testes e build**

Run: `npm run test && npm run build`
Expected: tudo verde.

- [ ] **Step 2: Fluxo completo no navegador (Playwright MCP ou manual)**

Com `npm run dev` rodando, executar o roteiro:

1. `/dashboard` — empty state ou KPIs; CTA leva a `/balanceamento`.
2. Modo direto: preencher exemplo canônico (8 / 11,05 / 3,82 / 15,09 / 4,5) → **Mc 4,68 g @ 90,3°**; pás=6 → divisão Pá 2/Pá 3; Vf=0,8 → 90% "Excelente".
3. Salvar → toast; Exportar PDF → arquivo baixa; abrir e inspecionar (checklist da Task 9 Step 3).
4. Modo guiado: percorrer os 6 passos; valores preservados ao alternar modos.
5. `/historico` — buscar, reabrir, duplicar, re-exportar PDF, excluir.
6. `/configuracoes` — perfil, logo (re-exportar PDF com logo), backup export/import, tema claro/escuro/sistema.
7. Tema claro E escuro: screenshot de cada página; revisar contraste e sobreposições.
8. Viewport 390×844 (mobile): bottom-nav presente, sem overflow horizontal, formulários utilizáveis.
9. Migração v1: injetar no console
   `localStorage.setItem("rba_sessions", JSON.stringify([{id:"legacy1",timestamp:"2025-05-01T10:00:00.000Z",name:"Mc 4.68g @ 90.3°",raw:{Vo:"8",V1:"11.05",V2:"3.82",V3:"15.09",Mt:"4.5"},result:{Mc:4.68,angle:90.3,OP:7.69,Px:7.69,Py:-0.04}}]))`
   e recarregar → sessão aparece no histórico.

Expected: zero erros de console em todas as etapas; valores numéricos exatos.

- [ ] **Step 3: Capacitor sync**

Run: `npx cap sync android`
Expected: "Sync finished" sem erros (build do APK fica a cargo do usuário).

- [ ] **Step 4: Commit final (se houve correções)**

```bash
git add -A
git commit -m "fix: final polish from end-to-end verification"
```

---

## Verificação de cobertura da spec

| Spec § | Item | Task |
|---|---|---|
| 3.1 | Tokens dark/light, Inter, data-theme | 1 |
| 3.2 | Linguagem de componentes | 4 |
| 4 | Sidebar/bottom-nav/rotas | 5 |
| 5.1 | Dashboard KPIs + recentes | 11 |
| 5.2 | Modo direto + resultado + pás + verificação | 7 |
| 5.2 | Wizard com ilustrações | 8 |
| 5.2 | Diagrama polar tema-aware | 6 |
| 5.3 | Histórico completo | 10 |
| 5.4 | Configurações + logo + backup | 12 |
| 6 | PDF profissional | 9 |
| 7 | Repository + schema v2 + migração | 3 |
| 8 | Matemática nova TDD | 2 |
| 9 | Stack/deps/estrutura | 1, 13 |
| 10 | Critérios de aceite | 14 |




