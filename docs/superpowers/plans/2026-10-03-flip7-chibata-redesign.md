# Flip7 Chibata Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar integralmente o sistema visual Flip7 ao SaaS Chibata, preservando comportamento, rotas, autenticação, Vuex e contratos da API.

**Architecture:** Centralizar tokens e padrões no CSS global já importado pelo Vuetify, modernizar o shell compartilhado e depois migrar telas por famílias de componentes. A implementação será incremental: cada fase mantém o app compilável e usa o Preview Web para validar visual, estados e mobile.

**Tech Stack:** Vue 3, Vite, Vuetify 4, Vue Router, Vuex, CSS global existente.

**Spec:** `docs/superpowers/specs/2026-10-03-flip7-chibata-design.md`

## Global Constraints

- Preservar rotas, autenticação, Vuex, contratos da API e integrações existentes.
- Não instalar dependências novas nem alterar banco, PHP, 9Router, Claude, Hermes ou OpenDesign.
- Converter valores `rpx` da referência para CSS web usando escala base de 8px.
- Usar teal `#2BA8A2`, gold `#FFD23F`, coral `#EF6C4A`, cream `#FFF8E7`, sky `#5DADE2` e seus tokens derivados.
- Manter loading, empty, error, success e unknown states honestos.
- Garantir foco visível, contraste AA, `prefers-reduced-motion` e responsividade em 390px.
- Não commitar, publicar ou fazer push automaticamente.

## Review Focus

- CSS global legado ou duplicado sobrescrevendo os tokens Flip7 — verificar cascata e computed styles no shell e no login.
- Vuetify aplicando cores/raios incompatíveis — verificar botões, inputs, dialogs e tabelas reais.
- Telas administrativas com densidade alta quebrando em mobile — verificar 390px, tabelas, drawers e dialogs.
- Estados de API perdendo contexto durante o redesign — verificar Inbox, CRUD e Funil em loading, vazio e erro.
- Motion prejudicando acessibilidade — ativar reduced-motion e confirmar remoção de pulso, bounce e confete.

### Task 1: Flip7 token layer and CSS foundation

**Files:**
- Modify: `src/assets/styles/command-center.css`
- Inspect only: `src/plugins/vuetify.js`, `src/App.vue`, `src/components/AppBar.vue`, `src/components/Drawer.vue`

**Interfaces:**
- Produces CSS custom properties and shared utility classes consumed by shell, views and Vuetify overrides.
- Must keep the existing import contract from `src/plugins/vuetify.js`.

- [ ] **Step 1: Capture baseline**

Run `npm run build` and record the current result. Run `git diff --check`.

- [ ] **Step 2: Replace the active token layer**

Define `--flip-*` variables for the approved palette, 8px spacing scale, 16/24px radii, teal/coral/gold/sky shadows, focus ring, typography and motion. Neutralize obsolete Dark Modular/editorial root declarations only when the final Flip7 variables supersede them. Preserve selectors used by existing views.

- [ ] **Step 3: Add safe shared states**

Add shared focus, active, disabled, loading, alert and reduced-motion rules. Keep button labels readable and avoid color-only state communication.

- [ ] **Step 4: Verify foundation**

Run `npm run build` and `git diff --check`. Expected: build succeeds; only known bundle-size warnings may remain.

### Task 2: Flip7 application shell

**Files:**
- Modify: `src/App.vue`
- Modify: `src/components/AppBar.vue`
- Modify: `src/components/Drawer.vue`
- Modify: `src/assets/styles/command-center.css`

**Interfaces:**
- Consumes Task 1 tokens and existing `drawer` Vuex module.
- Produces the shared navigation, page frame and mobile drawer behavior used by every authenticated view.

- [ ] **Step 1: Preserve shell behavior**

Audit current `showNavigation`, drawer toggle, route link and logout behavior before visual edits. Do not alter store mutations or router guards.

- [ ] **Step 2: Implement Flip7 shell styling**

Apply cream/base surfaces, teal navigation, gold active route, pill controls, tactile states, compact desktop header and explicit mobile collapse. Keep existing semantic labels and ARIA attributes.

- [ ] **Step 3: Verify shell**

Open `/` and `/login` in Preview Web at desktop and 390px. Confirm navigation, drawer toggle, focus ring and no horizontal overflow. Run `npm run build`.

### Task 3: Core product screens

**Files:**
- Modify: `src/views/home/home.vue`
- Modify: `src/views/inbox/inbox.vue`
- Modify: `src/views/bot/bot.vue`
- Modify: `src/views/funil/funil.vue`
- Modify: `src/views/funil/FunilEditor.vue`
- Modify: `src/components/flow/FunilNode.vue`
- Modify: `src/components/flow/editors/*.vue`
- Modify: `src/components/flow/nodes/*.vue`
- Modify: `src/assets/styles/command-center.css`

**Interfaces:**
- Consumes shell and tokens from Tasks 1–2.
- Must preserve existing API calls, Vuex bindings, route params and flow-editor events.

- [ ] **Step 1: Map existing states**

Read each view and record loading, empty, error, success and interaction states before styling. Keep the current state branches intact.

- [ ] **Step 2: Apply Flip7 hierarchy**

Use colored state bars, 24px cards, gold primary actions, coral warnings, teal informational surfaces, dashed section separators and restrained celebratory motion. Use icons/emoji only as visual complements with text labels intact.

- [ ] **Step 3: Preserve flow editor usability**

Style nodes, editors, controls and minimap without changing Vue Flow configuration, node data or event contracts. Ensure selected, invalid and disabled states remain distinguishable without color alone.

- [ ] **Step 4: Verify core screens**

Check `/`, `/inbox`, `/bot`, `/funil` and `/funil/:id/editor` in Preview Web at desktop and 390px. Verify no fake data was introduced, API-dependent states remain honest, and `npm run build` passes.

### Task 4: Shared CRUD, authentication and administrative screens

**Files:**
- Modify: `src/components/crud/CrudPage.vue`
- Modify: `src/components/crud/CrudTable.vue`
- Modify: `src/components/crud/CrudDialog.vue`
- Modify: `src/components/crud/CrudField.vue`
- Modify: `src/components/Table.vue`
- Modify: `src/components/design/AuthLayout.vue`
- Modify: `src/views/login/**/*.vue`
- Modify: `src/views/register/**/*.vue`
- Modify: `src/views/produto/produto.vue`
- Modify: `src/views/pessoas/pessoas.vue`
- Modify: `src/views/projetos/**/*.vue`
- Modify: `src/views/usuarios/**/*.vue`
- Modify: `src/views/grupos/**/*.vue`
- Modify: `src/views/acessos/**/*.vue`
- Modify: `src/views/parametro/**/*.vue`
- Modify: `src/views/configuracao/configuracao.vue`
- Modify: `src/views/logs/logs.vue`
- Modify: `src/assets/styles/command-center.css`

**Interfaces:**
- Consumes the shared tokens and shell.
- Must preserve CrudPage config shape, dialog submit behavior, table slots, auth forms, route guards and API services.

- [ ] **Step 1: Style shared CRUD primitives first**

Apply labels-above-input, cream input surfaces, visible validation errors, pill actions, table state bars and mobile overflow behavior without changing CRUD config or service calls.

- [ ] **Step 2: Style authentication**

Apply the Flip7 logo/banner treatment and teal/coral/gold surfaces to login and register while preserving form validation and redirects.

- [ ] **Step 3: Migrate administrative views**

Use the shared primitives so Produto, Pessoas, Projetos, Usuários, Grupos, Acessos, Parâmetros, Configuração and Logs are visually consistent and calmer where data density is high.

- [ ] **Step 4: Verify administrative flows**

Open `/login`, `/register`, `/produto`, `/configuracao`, `/log` and one representative CRUD dialog. Verify labels, focus, empty/error states, mobile table behavior and `npm run build`.

### Task 5: Visual QA and regression pass

**Files:**
- Modify only files required by verified regressions from Tasks 1–4.
- Update: `docs/` with a concise validation record if needed.

- [ ] **Step 1: Desktop pass**

Run the Preview Web at desktop and inspect Home, Inbox, Bot, Funil, login, a CRUD view and a dialog. Confirm consistent palette, radii, shadows, typography and active states.

- [ ] **Step 2: Mobile pass**

Resize Preview Web to 390x844. Check drawer, cards, forms, tables, flow editor and dialogs for clipping or horizontal scroll.

- [ ] **Step 3: Accessibility pass**

Tab through shell and representative forms; verify focus, labels, live regions, alert roles and reduced-motion behavior.

- [ ] **Step 4: Regression commands**

Run `npm run build`, `git diff --check`, and HTTP smoke checks for `/`, `/bot`, `/inbox`, `/funil`, `/produto`, `/configuracao` and `/log`. Expected: build succeeds, diff check is clean, and all routes return HTTP 200 through the running preview.

- [ ] **Step 5: Final review**

Ask Claude Code for a read-only code review of the final diff and Hermes for an independent validation report. Resolve critical/important findings, then report verified evidence separately from remaining assumptions.
