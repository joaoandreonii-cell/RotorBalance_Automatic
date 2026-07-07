# RBA v2.0 — Redesign SaaS-ready (Design Doc)

**Data:** 2026-07-06
**Status:** Aprovado pelo usuário
**Escopo:** Reformulação completa da UI/UX do RotorBalance Automatic, relatórios profissionais, tema claro/escuro, arquitetura de dados pronta para SaaS. Client-side (localStorage) nesta fase; sem autenticação/backend.

---

## 1. Contexto

O app implementa o **método de balanceamento de três pontos** (four-run method), conforme a apresentação `BALANCEAMENTO DE TRÊS PONTOS - PDF.pptx`:

1. Divide-se o rotor em 3 posições angulares (0°, 120°, 240°).
2. Fazem-se 4 medições de vibração: `V₀` (sem massa de teste), `V₁` (massa `Mt` em 0°), `V₂` (em 120°), `V₃` (em 240°).
3. Solução analítica (equivalente à interseção gráfica dos arcos):
   - `Px = (V₃² − V₂²) / (2√3·V₀)`
   - `Py = (V₂² + V₃² − 2V₁²) / (6·V₀)`
   - `OP = √(Px² + Py²)`, `ângulo = atan2(Px, Py)` normalizado 0–360°
   - **Massa de correção:** `Mc = Mt × V₀ / OP`, posicionada no ângulo calculado.

A v1 (React + Vite + Capacitor Android) já calcula corretamente, tem diagrama polar SVG, histórico em localStorage, PDF básico e toggle de tema. O redesign preserva a matemática existente (`src/utils/math.js`) e substitui toda a camada de UI.

## 2. Decisões de produto (aprovadas)

| Decisão | Escolha |
|---|---|
| Escopo da versão | Redesign SaaS-ready, client-side, sem login (preparado para plugar Supabase depois) |
| Relatório PDF | Identificação completa + verificação pós-balanceamento + diagrama/memória de cálculo + logo custom |
| Recursos da calculadora | Divisão entre pás, unidade de vibração selecionável, dados da máquina (RPM/raio), modo wizard |
| Plataforma | Web-first responsivo; Capacitor Android mantido intocado |
| Stack visual | Tailwind CSS v4 + lucide-react + Inter (mesma do gestao-frotas) |

## 3. Identidade visual e temas

### 3.1 Design tokens

Copiados do gestao-frotas (`@theme` do Tailwind v4) para o tema escuro; variante clara derivada mantendo os mesmos matizes de primary/status. Troca via atributo `data-theme` em `<html>`; tokens expostos como CSS custom properties para que os componentes usem `var(--color-*)`.

**Escuro (referência gestao-frotas):**

```
bg #0f1117 · surface-1 #161922 · surface-2 #1d212d · surface-3 #232737
border #262b3a · border-strong #343a4d
text #e6e8ed · text-muted #9aa0ae · text-subtle #6b7180
primary #3b82f6 · primary-hover #2563eb · primary-soft rgb(59 130 246/.12)
ok #16a34a · warn #d97706 · critical #dc2626 (+ variantes -soft a 14%)
```

**Claro (derivado):**

```
bg #f6f7f9 · surface-1 #ffffff · surface-2 #f1f3f6 · surface-3 #e9ecf1
border #e2e5ea · border-strong #cdd2da
text #1a1d26 · text-muted #5b6270 · text-subtle #8a909c
primary/ok/warn/critical: mesmos valores (contrastam bem em fundo claro)
```

- Fonte: **Inter** self-hosted (`@fontsource-variable/inter`) — obrigatório para funcionar offline no APK Capacitor (CSP/CDN indisponível).
- Ícones: **lucide-react**.
- Persistência do tema: chave `rba_theme` (compatível com v1); primeiro acesso respeita `prefers-color-scheme`; `meta[name=theme-color]` atualizado na troca.
- Animações discretas (modal-fade/pop, transições 150ms) com `prefers-reduced-motion` respeitado.
- Cores das séries do diagrama polar (V₀/V₁/V₂/V₃/OP) ajustadas por tema para manter contraste.

### 3.2 Linguagem de componentes (padrão gestao-frotas)

- Cards com header (título bold + subtítulo muted) e divisor.
- KPI cards: label pequeno + ícone em círculo `surface-3` no canto + valor grande.
- Nav ativa: fundo `primary-soft` + texto primary.
- Badges de status com `-soft` de fundo e texto na cor cheia.
- Empty states: ícone em círculo + título + texto muted.
- Botões: primary sólido, secundário `surface-2` com borda, destrutivo critical; `focus-visible` com outline primary.

## 4. Shell e navegação

- **Desktop (≥1024px):** sidebar fixa — logo + nome do produto no topo, nav com ícones (Dashboard, Balanceamento, Histórico, Configurações), bloco inferior com toggle de tema e versão.
- **Mobile (<1024px):** header compacto (logo + toggle de tema) e **bottom tab bar** com as 4 seções (padrão nativo Android, safe-area respeitada).
- **react-router-dom** (nova dependência): rotas `/dashboard`, `/balanceamento`, `/historico`, `/configuracoes`. Redirect `/` → `/dashboard`. Roteamento em hash ou history com fallback — validar que funciona no Capacitor WebView (usar `BrowserRouter` com base `./` no build; se houver problema no APK, `HashRouter`).

## 5. Páginas

### 5.1 Dashboard
- KPIs: balanceamentos no mês, redução média de vibração (%), máquinas distintas atendidas, total de sessões.
- Lista das 5 sessões mais recentes (equipamento, data, Mc@ângulo, badge de status da verificação) com link para o histórico.
- CTA primário "Novo balanceamento".
- Empty state completo para primeiro uso.

### 5.2 Balanceamento (núcleo)
Dois modos, alternáveis por segmented control; estado compartilhado (trocar de modo não perde dados):

- **Modo direto:** layout 2 colunas (desktop) — esquerda: card "Identificação" (cliente, equipamento/TAG, local, técnico — opcionais), card "Máquina" (RPM, raio de fixação, nº de pás — opcionais), card "Medições" (unidade selecionável: mm/s, µm, in/s, g; campos V₀, V₁, V₂, V₃, Mt em gramas); direita: diagrama polar ao vivo + painel de resultado.
- **Modo wizard:** stepper de 6 passos — (1) Identificação/máquina, (2) V₀, (3) V₁ @ 0°, (4) V₂ @ 120°, (5) V₃ @ 240° + Mt, (6) Resultado. Cada passo de medição tem ilustração SVG do rotor destacando a posição da massa de teste e instrução curta (conteúdo derivado do PPTX). Validação por passo; navegação livre para trás.
- **Painel de resultado:**
  - Mc (g) + ângulo em destaque; OP e componentes; fórmula com valores aplicados.
  - **Divisão entre pás** (se nº de pás informado): decompõe o vetor Mc no par de pás adjacentes que envolve o ângulo alvo — massas `Ma`/`Mb` por decomposição vetorial (`Ma = Mc·sin(θb−θ)/sin(θb−θa)`, `Mb = Mc·sin(θ−θa)/sin(θb−θa)`), com offset angular da pá 1 configurável (default 0°).
  - **Verificação pós-balanceamento:** campo V_final → `redução % = (V₀ − V_f)/V₀ × 100`; status: ≥90% Excelente (ok) · 70–90% Bom (ok) · 50–70% Aceitável (warn) · <50% Refazer (critical).
  - Ações: Salvar sessão, Exportar PDF, Limpar (com confirmação se houver dados).
- Diagrama polar: SVG responsivo, grid radial com ticks automáticos (reaproveita `niceTick`), círculo V₀, arcos V₁/V₂/V₃, vetor OP com seta e rótulo do ângulo, marcadores de pás quando informadas, cores por tema.

### 5.3 Histórico
- Busca por texto (cliente/equipamento/TAG) + filtro por período.
- Tabela (desktop) / cards (mobile): data, cliente, equipamento, Mc@ângulo, badge de verificação.
- Ações por item: reabrir na calculadora, duplicar, re-exportar PDF, excluir (dialog de confirmação). Limpar tudo em Configurações.

### 5.4 Configurações
- **Perfil:** nome do técnico, empresa, contato (usados no relatório).
- **Logo:** upload de imagem, comprimida/redimensionada client-side (max ~200KB, base64 em localStorage), preview, remover.
- **Preferências:** unidade padrão de vibração, tema (claro/escuro/sistema).
- **Dados:** exportar backup JSON, importar backup (merge com confirmação), limpar tudo.
- **Sobre:** versão, método, crédito.

## 6. Relatório PDF profissional

jsPDF + jspdf-autotable (já no projeto), A4 portrait:

1. **Cabeçalho:** logo custom (ou monograma padrão), nome da empresa, título "Relatório de Balanceamento — Método dos Três Pontos", nº sequencial `RBA-AAAA-NNN` (contador em localStorage), data/hora.
2. **Identificação:** tabela cliente / equipamento (TAG, nome, local) / máquina (RPM, raio, pás) / técnico.
3. **Medições:** tabela V₀–V₃, Mt, com unidade selecionada.
4. **Resultado:** destaque Mc + ângulo; OP; divisão entre pás (tabela pá A/pá B com massas), quando aplicável.
5. **Diagrama polar:** vetorial, renderizado do SVG (pipeline SVG→canvas→PNG já existente na v1), com fundo claro independente do tema da UI.
6. **Verificação:** V₀ vs V_final, % de redução, status com cor.
7. **Memória de cálculo:** fórmulas Px/Py/OP/ângulo/Mc com os valores substituídos.
8. **Rodapé:** campo de assinatura do técnico, "Gerado por RotorBalance Automatic v2.0", paginação N/M.

Sempre em paleta clara e imprimível, independente do tema da interface.

## 7. Arquitetura de dados (SaaS-ready)

### 7.1 Camada repository

`src/data/repository.js`: única porta de acesso a dados da UI. Implementação atual `localStorageRepository`; contrato pensado para trocar por Supabase sem alterar componentes:

```
sessions:  list(), get(id), save(session), remove(id), clear()
settings:  get(), update(partial)         // perfil, logo, unidade, tema
counters:  nextReportNumber()
backup:    export(), import(json)
```

### 7.2 Modelo de sessão (schema v2)

```js
{
  id, createdAt, updatedAt, schemaVersion: 2,
  client:   { name, contact },
  machine:  { tag, name, location, rpm, radius, blades, bladeOffset },
  measurements: { unit, Vo, V1, V2, V3, Mt },
  result:   { Px, Py, OP, angle, Mc },
  bladeSplit: { bladeA, bladeB, massA, massB } | null,
  verification: { Vf, reduction, status } | null,
  report:   { number } | null,
  notes: ""
}
```

### 7.3 Migração v1 → v2

Na inicialização: se existir `rba_sessions` sem `schemaVersion`, converter cada item para o schema v2 (campos novos vazios), preservando resultados. Migração idempotente e testada.

## 8. Matemática nova (TDD)

Em `src/utils/math.js` (funções puras, testadas com Vitest):

- `computeResult(Vo, V1, V2, V3, Mt)` — existente, ganha testes de caracterização (incl. exemplo do PPTX: V₀=8, V₁=11.05, V₂=3.82, V₃=15.09, Mt=4.5).
- `splitBetweenBlades(Mc, angle, blades, bladeOffset)` → `{ bladeA, bladeB, angleA, angleB, massA, massB }`; casos de borda: ângulo exatamente numa pá (100%/0%), blades < 2 → null.
- `reductionPercent(Vo, Vf)` e `qualityStatus(reduction)` → thresholds da seção 5.2.
- `nextReportNumber` e migração v1→v2 também testadas.

## 9. Stack e dependências

| Ação | Pacote |
|---|---|
| Adicionar | `tailwindcss@^4`, `@tailwindcss/vite`, `lucide-react`, `react-router-dom`, `@fontsource-variable/inter`, `clsx` |
| Adicionar (dev) | `vitest` |
| Manter | react 19, vite 6, jspdf, jspdf-autotable, Capacitor 8 |
| Remover | CSS legado embutido, `balanceamento_tres_pontos.jsx` (protótipo solto na raiz) |

Estrutura alvo:

```
src/
  main.jsx, App.jsx (router + shell)
  index.css            (@theme tokens, temas claro/escuro)
  components/
    layout/  (AppShell, Sidebar, BottomNav, ThemeToggle, PageHeader)
    ui/      (Card, Button, Badge, Input, Select, Modal, EmptyState, Toast, Stepper, SegmentedControl)
    balance/ (MeasurementForm, MachineForm, IdentificationForm, WizardMode, PolarDiagram, ResultPanel, BladeSplitCard, VerificationCard)
  pages/     (Dashboard, Balance, History, Settings)
  data/      (repository.js, migrations.js)
  utils/     (math.js, pdf.js, image.js)
```

## 10. Verificação e critérios de aceite

- `npm run build` verde; testes Vitest verdes.
- Playwright: fluxo completo (preencher medições do PPTX → resultado Mc ≈ 4.68g @ ≈90.3°; salvar; histórico; PDF baixa sem erro) nos 2 temas × viewport mobile e desktop; screenshots revisados visualmente.
- Migração: sessões v1 aparecem no histórico v2.
- PDF aberto e inspecionado (layout, diagrama, acentuação pt-BR).
- `npx cap sync android` sem erro (build APK fica a cargo do usuário).

## 11. Fora de escopo (fases futuras)

Autenticação/Supabase, cobrança/planos, multiusuário, i18n (app 100% pt-BR nesta fase), landing page de marketing, PWA install prompt (o build Capacitor cobre o caso mobile).
