# Command Center Chibata Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrar o SaaS Chibata do visual Flip7 para o sistema Command Center claro com shell escuro frosted e acento laranja.

**Architecture:** Fazer a troca na camada global de tokens e seletores compartilhados, mantendo os componentes e contratos funcionais atuais. A mudança será incremental em CSS, com revisão visual em Preview Web e validação de rotas/build.

**Tech Stack:** Vue 3, Vite, Vuetify 4, Vue Router, Vuex e CSS global.

**Spec:** `docs/superpowers/specs/2026-10-03-command-center-chibata-design.md`

## Global Constraints

- Preservar rotas, autenticação, Vuex, API e Vue Flow.
- Não instalar dependências ou alterar backend.
- Remover a aparência Flip7 ativa e aplicar Command Center como camada final.
- Workspace claro; shell preto translúcido com blur; laranja como acento dominante.
- Responsividade em 390px, foco visível e reduced-motion.
- Sem commit, push ou publicação automática.

### Task 1: Command Center token replacement

**Files:** `src/assets/styles/command-center.css`

- [ ] Definir tokens `--cc-*` para background, surface, text, orange, shell, semantic statuses, spacing, radii, shadows e motion do design.
- [ ] Remover a camada ativa Flip7 da cascata, sem remover seletores necessários pelas views.
- [ ] Normalizar aliases legados (`--cc-ease`, `--cc-radius-*`, `--cc-shadow-panel`) para evitar variáveis indefinidas.
- [ ] Rodar `npm run build` e `git diff --check`.

### Task 2: Frosted shell

**Files:** `src/assets/styles/command-center.css`, `src/components/AppBar.vue`, `src/components/Drawer.vue`

- [ ] Aplicar shell preto 70%, blur 12px, borda branca sutil, header 64px e sidebar 256px.
- [ ] Aplicar item ativo laranja, item ghost branco translúcido e conta no rodapé.
- [ ] Preservar toggle, logout, links, permissões e store drawer.
- [ ] Verificar Home desktop e mobile.

### Task 3: Light operational workspace

**Files:** `src/assets/styles/command-center.css`, `src/views/home/home.vue`, `src/views/inbox/inbox.vue`, `src/components/crud/CrudTable.vue`

- [ ] Aplicar canvas quente, cards neutros silenciosos, toolbar compacta e table header laranja translúcido.
- [ ] Preservar loading, empty, error e API states.
- [ ] Remover glows Flip7 e converter ações principais para orange compact buttons.
- [ ] Verificar Home, Inbox e uma tela CRUD em desktop/390px.

### Task 4: Auth and flow surfaces

**Files:** `src/assets/styles/command-center.css`, `src/components/design/AuthLayout.vue`, `src/views/funil/FunilEditor.vue`, `src/components/flow/**/*.vue`

- [ ] Aplicar painel laranja e card claro na autenticação.
- [ ] Aplicar editor de fluxo como workspace neutro com toolbar shell e nodes compactos.
- [ ] Preservar eventos, node data, dialogs, API e router.
- [ ] Verificar login, Funil e editor.

### Task 5: Full QA and agent review

**Files:** apenas correções verificadas e documentação de validação se necessário.

- [ ] Abrir Preview Web em desktop e 390px; confirmar shell escuro, workspace claro e overflow ausente.
- [ ] Rodar smoke HTTP para `/`, `/inbox`, `/bot`, `/funil`, `/produto`, `/configuracao`, `/log`, `/login`.
- [ ] Rodar `npm run build` e `git diff --check`.
- [ ] Pedir revisão somente leitura ao Claude e validação independente ao Hermes; resolver achados críticos.
