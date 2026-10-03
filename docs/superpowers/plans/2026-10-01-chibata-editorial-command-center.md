# Chibata Dark Modular Command Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the existing Chibata frontend into a distinctive Dark Modular Command Center while preserving every route, frontend contract, real data state, and backend boundary.

**Architecture:** Keep Vue 3, Vuetify, Vuex, Vue Router, the current view structure, and the local preview boundary. Consolidate the visual system in the existing shared stylesheet and Vuetify theme, then refine the shared shell and each page family in dependency order. Use browser-driven visual and route checks as the acceptance layer because the project has no frontend test runner configured.

**Tech Stack:** Vue 3, Vuetify 4, Vue Router 4, Vuex 4, Vite, Phosphor Icons Vue, CSS media queries, Codex browser preview.

**Spec:** `docs/superpowers/specs/2026-10-01-chibata-editorial-command-center-design.md`

## Global Constraints

- Frontend-only changes. Do not modify backend, API endpoints, request methods, payload keys, Vuex modules, permissions, database, secrets, or deployment configuration.
- Preserve route names, URL paths, navigation labels, form field names, local preview behavior, and the Chibata wordmark.
- Use the Dark Modular Command Center palette: canvas `#111827`, surface `#172033`, raised surface `#1D2940`, emerald `#00D084`, border `#2A3A56`, primary text `#F1F5F9`, muted `#91A4C0`.
- Use `"Nimbus Sans", "Segoe UI Variable", "Segoe UI", sans-serif` for display, body, and interface text.
- Do not introduce fake records, fake metrics, fabricated conversations, or new product features.
- Keep loading, empty, error, retry, validation, and unavailable states honest and functional.
- Preserve responsive behavior at desktop and 390px mobile width, with no unintended horizontal overflow.
- Do not commit, push, merge, or delete worktrees without explicit user authorization.

## Review Focus

- **CSS cascade leakage:** obsolete ivory, graphite, or sea-glass rules must not override the dark modular tokens. Test computed background, text, and button colors on representative routes after the token task.
- **Route and contract drift:** navigation, forms, permissions, and API calls must remain unchanged. Test every current route in local preview and inspect the registration field names.
- **Unavailable data honesty:** preview screens must continue to show explicit error or empty states and retry actions without fabricated rows or conversations. Test Products and Inbox while the API is unavailable.
- **Responsive control clipping:** primary actions, fields, filter controls, drawer content, and editor toolbar must remain usable at 390px. Test `scrollWidth <= innerWidth` and inspect screenshots.
- **Interaction accessibility:** focus rings, keyboard activation, reduced motion, and touch target sizing must remain available after visual polish. Test focus-visible styles and reduced-motion computed transitions.

## File Map

- `src/assets/styles/command-center.css`: single source of shared tokens, typography, surfaces, controls, shell, state, responsive, and motion rules.
- `src/plugins/vuetify.js`: default `darkModular` Vuetify theme and shared component defaults.
- `index.html`: browser theme color for the dark navy canvas.
- `src/App.vue`, `src/components/AppBar.vue`, `src/components/Drawer.vue`: authenticated shell composition and navigation presentation.
- `src/views/home/home.vue`, `src/views/inbox/inbox.vue`: high-visibility page compositions.
- `src/components/crud/CrudPage.vue`, `src/components/crud/CrudTable.vue`, `src/components/Table.vue`, `src/views/configuracao/configuracao.vue`, `src/views/logs/logs.vue`: data and settings surfaces.
- `src/components/design/AuthLayout.vue`, `src/views/login/components/card.vue`, `src/views/register/components/card.vue`, `src/views/login/login.vue`, `src/views/register/register.vue`: authentication presentation without contract changes.
- `src/views/funil/FunilEditor.vue`, `src/components/flow/FunilNode.vue`, `src/components/flow/nodes/*.vue`: flow editor surfaces and node visual states.
- `src/views/bot/bot.vue`, `src/views/funil/funil.vue`, `src/views/produto/produto.vue`, `src/views/grupos/grupos.vue`, `src/views/usuarios/usuarios.vue`, `src/views/parametro/parametro.vue`: remaining route surfaces that consume the shared grammar.

---

### Task 1: Consolidate the Dark Modular visual foundation

**Files:**
- Modify: `src/assets/styles/command-center.css`
- Modify: `src/plugins/vuetify.js`
- Modify: `index.html`

**Interfaces:**
- Produces the final `--cc-*` token set, `darkModular` theme, shared button/card/field/table states, and responsive primitives consumed by every later task.
- Does not change any Vue component behavior, data flow, route, or API call.

- [ ] **Step 1: Inventory the current cascade before editing**

Run:

```bash
rg -n "^:root|^\.command-app|^\.shell-|^\.auth-|^\.workspace-page|@media|color-scheme|font-family|rgba\(167|#111315|#A7D8CB" src/assets/styles/command-center.css
```

Expected: all legacy token and override blocks are identified so the final stylesheet can be consolidated without losing required selectors.

- [ ] **Step 2: Consolidate the shared CSS into one dark modular layer**

Keep the existing selector contract, but remove duplicate obsolete declarations and define one final token block with the exact values from the spec. Add explicit states for primary, tonal, outlined, disabled, focus-visible, table hover, field focus, alert, and reduced motion. Keep control transitions property-specific and below 300ms.

- [ ] **Step 3: Set the dark modular Vuetify theme as default**

In `src/plugins/vuetify.js`, set `defaultTheme: 'darkModular'` and define the dark modular colors, while leaving the old theme available only if existing code references it. Keep component defaults compatible with current forms and tables.

- [ ] **Step 4: Align the browser surface color**

Set the `theme-color` meta tag to `#111827` and verify the document background is the same color outside the Vuetify application root.

- [ ] **Step 5: Verify the foundation in the browser**

Run the existing dev server and navigate to `/?preview=1`, `/produto?preview=1`, and `/login`.

Expected: navy canvas, emerald primary actions, Nimbus Sans typography, readable dark fields, no ivory or sea-glass leakage, and no console errors.

---

### Task 2: Refine the shared shell and interaction primitives

**Files:**
- Modify: `src/App.vue`
- Modify: `src/components/AppBar.vue`
- Modify: `src/components/Drawer.vue`
- Modify: `src/assets/styles/command-center.css`

**Interfaces:**
- Consumes Task 1 tokens and theme.
- Produces a shell that preserves `AppBar`, `Drawer`, route links, preview badge, logout behavior, and responsive drawer behavior.

- [ ] **Step 1: Capture the shell contract before editing**

Run:

```bash
sed -n '1,240p' src/components/AppBar.vue
sed -n '1,240p' src/components/Drawer.vue
```

Expected: route titles, `services` filtering, logout sequence, preview marker, and drawer bindings are recorded as protected behavior.

- [ ] **Step 2: Recompose only the shell presentation**

Use the existing Phosphor components and route data. Improve brand grouping, workspace context, topbar hierarchy, active navigation, account footer, and mobile drawer spacing without changing route paths, labels, `services` checks, `logout()`, or store mutations.

- [ ] **Step 3: Add Emil interaction details**

Apply explicit transitions, fine-pointer hover gating, subtle `scale(.97)` press feedback, visible focus rings, and no movement under reduced motion. Do not animate keyboard-driven navigation or introduce keyframe-based shell transitions.

- [ ] **Step 4: Verify shell navigation and keyboard behavior**

Browser checks:

- Open every sidebar link in local preview.
- Activate the skip link with the keyboard.
- Focus the menu toggle, active link, and logout control.
- Set viewport to 390px and open the drawer.

Expected: all links retain their original paths, focus is visible, no content is clipped, and logout remains functional.

---

### Task 3: Recompose Home and Inbox

**Files:**
- Modify: `src/views/home/home.vue`
- Modify: `src/views/inbox/inbox.vue`
- Modify: `src/assets/styles/command-center.css`

**Interfaces:**
- Consumes the shared shell and tokens from Tasks 1 and 2.
- Preserves Home shortcut destinations, Inbox filters, refresh action, conversation selection, composer behavior, API requests, and error/retry states.

- [ ] **Step 1: Capture current Home and Inbox behavior**

Run:

```bash
sed -n '1,220p' src/views/home/home.vue
sed -n '1,420p' src/views/inbox/inbox.vue
```

Expected: existing shortcut routes, filter values, action handlers, and unavailable states are identified before markup changes.

- [ ] **Step 2: Recompose Home as a modular command surface**

Keep all existing destinations and copy that carries product meaning. Use one dominant next-action area, a compact operational shortcut rail, and a flatter tools list. Avoid equal promotional cards and invented statistics.

- [ ] **Step 3: Recompose Inbox as an operational workspace**

Keep the three-pane behavior. Give the queue header, filter rail, conversation list, and preview pane distinct hierarchy. Use surface boundaries only where they communicate grouping. Preserve explicit API errors, retry actions, empty counts, and no fake conversations.

- [ ] **Step 4: Verify Home and Inbox states**

Browser checks:

- Open `/?preview=1` and verify every shortcut target.
- Open `/inbox?preview=1` and verify filters, channel selector, refresh, retry, and empty preview state.
- Test both 1261px desktop and 390px mobile viewports.

Expected: the pages have different composition jobs, buttons are fully visible, and `scrollWidth <= innerWidth` at mobile width.

---

### Task 4: Apply the system to CRUD, configuration, logs, and secondary routes

**Files:**
- Modify: `src/components/crud/CrudPage.vue`
- Modify: `src/components/crud/CrudTable.vue`
- Modify: `src/components/Table.vue`
- Modify: `src/views/configuracao/configuracao.vue`
- Modify: `src/views/logs/logs.vue`
- Modify: `src/views/bot/bot.vue`
- Modify: `src/views/funil/funil.vue`
- Modify: `src/views/produto/produto.vue`
- Modify: `src/views/grupos/grupos.vue`
- Modify: `src/views/usuarios/usuarios.vue`
- Modify: `src/views/parametro/parametro.vue`

**Interfaces:**
- Consumes shared tokens, controls, and shell from Tasks 1 and 2.
- Preserves CRUD configuration objects, dialog open/close behavior, search, pagination, permissions, configuration fields, log rendering, and route-specific data loading.

- [ ] **Step 1: Map shared data-surface states**

Inspect `CrudPage`, `CrudTable`, `Table`, and each secondary view. Record the existing loading, empty, error, retry, search, pagination, and dialog states. Do not change request or payload code.

- [ ] **Step 2: Establish one dark modular page rhythm**

Align page headings, descriptions, primary actions, search controls, summary areas, tables, row hover, dialogs, and feedback states. Reduce repeated card scaffolding and use a panel only when it clarifies grouping.

- [ ] **Step 3: Give logs and configuration distinct hierarchy**

Make logs read as an audit surface and configuration read as a guided form while retaining existing field order, validation, save handlers, and public route behavior.

- [ ] **Step 4: Verify data surfaces without API fabrication**

Browser checks:

- Open `/bot`, `/funil`, `/produto`, `/grupo`, `/usuario`, `/parametro`, `/log`, and `/configuracao` in local preview.
- Trigger search, retry, dialog, and pagination controls where present.
- Confirm unavailable states remain explicit and no fake rows appear.

Expected: all pages share the visual system but retain distinct content hierarchy, and no console errors are introduced.

---

### Task 5: Refine authentication and flow editor surfaces

**Files:**
- Modify: `src/components/design/AuthLayout.vue`
- Modify: `src/views/login/components/card.vue`
- Modify: `src/views/register/components/card.vue`
- Modify: `src/views/login/login.vue`
- Modify: `src/views/register/register.vue`
- Modify: `src/views/funil/FunilEditor.vue`
- Modify: `src/components/flow/FunilNode.vue`
- Modify: `src/components/flow/nodes/*.vue`
- Modify: `src/assets/styles/command-center.css`

**Interfaces:**
- Consumes the shared dark modular system.
- Preserves login and registration validation, approved registration fields, password visibility controls, editor route parameters, node types, node interactions, and unavailable editor retry state.

- [ ] **Step 1: Verify protected auth and editor contracts**

Inspect the auth cards and editor event bindings before styling. Confirm registration contains only the approved name, email, username, password, and confirmation fields. Confirm editor node components keep their existing props and emitted events.

- [ ] **Step 2: Apply the branded auth composition**

Use navy story panel, raised navy form panel, Nimbus Sans hierarchy, emerald primary action, consistent fields, visible validation, password toggle affordance, and accessible focus states. Do not change submit handlers or validation rules.

- [ ] **Step 3: Bring the flow editor into the same material language**

Keep canvas behavior and node interactions. Align toolbar, canvas, node surfaces, selection, unavailable state, and retry action with the dark modular tokens. Use canvas texture only where it communicates the actual editor workspace.

- [ ] **Step 4: Verify auth and editor behavior**

Browser checks:

- Open `/login` and `/register` without preview and verify fields, validation, password visibility, and navigation.
- Open `/funil/1/editor?preview=1` and verify toolbar, unavailable state, retry, and mobile presentation.

Expected: auth remains functional, registration has no CPF field, editor route renders without overflow, and no interaction contract changes.

---

### Task 6: Whole-frontend visual QA and acceptance verification

**Files:**
- Modify only files required by the preceding visual review.
- Verify: `docs/superpowers/specs/2026-10-01-chibata-editorial-command-center-design.md`

**Interfaces:**
- Consumes all completed visual tasks.
- Produces evidence that the frontend redesign is coherent, responsive, accessible, buildable, and contract-safe.

- [ ] **Step 1: Run the route smoke matrix**

Test these paths in preview at desktop width: `/`, `/bot`, `/inbox`, `/funil`, `/produto`, `/grupo`, `/usuario`, `/parametro`, `/log`, `/configuracao`, `/funil/1/editor`.

Expected: each route renders its expected heading or intentional unavailable state, `scrollWidth <= innerWidth`, and browser logs contain no errors.

- [ ] **Step 2: Run the mobile smoke matrix**

Test Home, Inbox, Products, Configuration, Login, Register, and Flow Editor at 390x844.

Expected: no horizontal overflow, primary actions remain visible, drawer and forms are usable, and reduced viewport does not hide essential content.

- [ ] **Step 3: Run design and accessibility review**

Run the project visual detector once over the changed frontend targets. Check computed contrast for primary buttons and focus-visible styles in the browser. If findings are actionable, fix them before the final build and record the result.

- [ ] **Step 4: Run final build and whitespace verification**

Run:

```bash
git diff --check
npm run build
```

Expected: both commands exit successfully. A Vite warning about large Vuetify/icon chunks is acceptable if no build error is introduced.

- [ ] **Step 5: Capture final browser evidence**

Leave the browser on `http://localhost:5175/inbox?preview=1` or the most useful review surface, capture the final screenshot, and report separately that the frontend is live while the API remains unavailable in local preview if that state is still present.

## Execution note

Implement this plan in the current workspace after explicit execution-method selection. Do not auto-commit or publish changes. Keep unrelated pre-existing modifications intact and inspect the final diff before handoff.
