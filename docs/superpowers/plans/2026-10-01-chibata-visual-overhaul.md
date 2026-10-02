# Chibata visual overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current generic dark dashboard treatment with a restrained, professional Chibata workspace language while preserving routes, API contracts, and behavior.

**Architecture:** Keep Vue 3, Vuetify, Vuex, and the current route/view structure. Centralize the visual language in `command-center.css`, migrate the shared shell to a single outline icon family, and tune the highest-visibility screens before applying shared states to CRUD and flow surfaces.

**Tech Stack:** Vue 3, Vuetify 4, Vue Router 4, Vuex 4, native CSS, Phosphor Vue icons.

**Spec:** `docs/superpowers/specs/2026-10-01-chibata-visual-overhaul-design.md`

## Global Constraints

- Preserve every existing route and API payload key.
- Keep local preview development-only and visibly labeled.
- Use one accent color, one radius scale, and one icon family.
- Animate only `transform` and `opacity`, and honor reduced motion.
- Do not introduce fake records, fake credentials, or fake API success states.
- Keep the existing Vue/Vuetify architecture.

## Review Focus

- Narrow viewport navigation must remain reachable and avoid horizontal overflow. Test in the browser at 390px.
- Offline API states must remain explicit and actionable. Test Inbox and one CRUD page without the backend.
- Auth and preview boundaries must remain intact. Test preview entry and logout.
- Icon replacement must not remove route labels or keyboard focus. Test the full sidebar tree.
- Existing modal, search, retry, and form-validation behavior must remain available. Test one CRUD dialog and both auth forms.

---

### Task 1: Install and verify the outline icon family

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces: `@phosphor-icons/vue` available to the shared shell.

- [ ] **Step 1: Verify the dependency is not already installed**

Run: `node -e "const p=require('./package.json'); if (p.dependencies?.['@phosphor-icons/vue']) process.exit(1)"`

Expected: exit 0.

- [ ] **Step 2: Install the icon dependency**

Run: `npm install @phosphor-icons/vue --save`

Expected: `package.json` and lockfile contain the dependency.

- [ ] **Step 3: Verify the package resolves**

Run: `node -e "import('@phosphor-icons/vue').then(m => { if (!m.List || !m.House) process.exit(1) })"`

Expected: exit 0.

### Task 2: Replace visual tokens and shared control states

**Files:**
- Modify: `src/assets/styles/command-center.css`
- Modify: `src/plugins/vuetify.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: the color, typography, shape, and motion decisions in the spec.
- Produces: stable `--cc-*` tokens and shared component states for every route.

- [ ] **Step 1: Write the failing token contract check**

Assert that the stylesheet contains the new canvas, accent, radius, and reduced-motion tokens and does not use the previous lavender accent token.

- [ ] **Step 2: Run the check and confirm it fails against the current stylesheet**

Run the targeted Node assertion before editing.

- [ ] **Step 3: Implement the token and state update**

Replace the current lavender-heavy palette, remove the default Inter-first stack, introduce control hover/focus/pressed states, table row states, shell surfaces, and explicit mobile/reduced-motion rules. Keep component selectors compatible with Vuetify.

- [ ] **Step 4: Run the token check and build**

Run: `npm run build`

Expected: the assertion passes and Vite completes successfully.

### Task 3: Migrate the shared shell to Phosphor icons

**Files:**
- Modify: `src/components/AppBar.vue`
- Modify: `src/components/Drawer.vue`
- Modify: `src/App.vue`

**Interfaces:**
- Consumes: `@phosphor-icons/vue` and current Vuex drawer/auth state.
- Produces: unchanged navigation routes with consistent outline icons and accessible labels.

- [ ] **Step 1: Write the failing shell contract check**

Assert that `Drawer.vue` still uses `v-icon` for route navigation and does not yet import Phosphor icons.

- [ ] **Step 2: Verify the check fails for the desired contract**

Run the assertion before editing.

- [ ] **Step 3: Implement the icon mapping and shell refinement**

Map route items to Phosphor Vue components, render them through `component`, keep the route `to` values unchanged, replace the app-bar menu glyph with an accessible button, and retain preview/logout behavior.

- [ ] **Step 4: Verify shell navigation**

Open the local preview and confirm every sidebar link resolves, the active state is visible, and the menu remains keyboard reachable.

### Task 4: Redesign home and Inbox composition

**Files:**
- Modify: `src/views/home/home.vue`
- Modify: `src/views/inbox/inbox.vue`

**Interfaces:**
- Consumes: existing route links, Inbox API calls, loading/error/empty states.
- Produces: clearer command surface and three-pane Inbox without changing data flow.

- [ ] **Step 1: Capture current browser baselines**

Open `/` and `/inbox?preview=1` at desktop and inspect the current empty/error states.

- [ ] **Step 2: Implement the home composition**

Use a two-column command panel and grouped shortcuts instead of equal card repetition. Keep all existing quick links and copy intent.

- [ ] **Step 3: Implement Inbox hierarchy**

Refine the header, filter rail, conversation list, selected-conversation panel, and offline/empty messages with the shared tokens. Keep all click handlers and API requests.

- [ ] **Step 4: Verify behavior and responsive layout**

Test filters, retry, route links, and 390px width. Confirm no horizontal overflow.

### Task 5: Apply the system to auth, CRUD, configuration, and flow editor

**Files:**
- Modify: `src/components/crud/CrudPage.vue`
- Modify: `src/components/crud/CrudTable.vue`
- Modify: `src/components/Table.vue`
- Modify: `src/views/login/components/card.vue`
- Modify: `src/views/register/components/card.vue`
- Modify: `src/views/configuracao/configuracao.vue`
- Modify: `src/views/funil/FunilEditor.vue`
- Modify: `src/components/flow/FunilNode.vue`
- Modify: `src/components/flow/nodes/*.vue`

**Interfaces:**
- Consumes: shared tokens and current form/table/flow behavior.
- Produces: coherent surfaces and controls across the remaining product views.

- [ ] **Step 1: Implement auth rhythm and validation states**

Retain the name, email, username, password, and password-confirmation registration contract. Improve control spacing and errors without changing request payloads.

- [ ] **Step 2: Implement CRUD and configuration hierarchy**

Keep search, retry, modal, save, cancel, empty, and error behavior. Only change presentation and responsive grouping.

- [ ] **Step 3: Implement flow editor surfaces**

Apply the new canvas, panel, node, and control tokens without changing node behavior or editor routes.

- [ ] **Step 4: Verify route coverage**

Open `/login`, `/register`, `/configuracao`, `/parametro`, `/bot`, `/inbox`, `/funil`, `/produto`, `/grupo`, `/usuario`, and `/log` in preview mode.

### Task 6: Browser acceptance and quality gate

**Files:**
- Modify: none unless a verified issue is found.

**Interfaces:**
- Consumes: all previous tasks.
- Produces: evidence-backed visual and functional verification.

- [ ] **Step 1: Run the production build**

Run: `npm run build`

Expected: Vite succeeds; existing chunk-size warnings may remain documented.

- [ ] **Step 2: Run formatting and source checks**

Run: `git diff --check` and targeted assertions for routes, preview gating, icon imports, and registration fields.

- [ ] **Step 3: Test desktop and mobile in the browser**

Verify the sidebar, Inbox, home, auth, CRUD modal, retry state, preview logout, and no horizontal overflow at 390px.

- [ ] **Step 4: Run the final visual critique**

Check philosophy alignment, hierarchy, craft, functionality, and originality. Repair any verified issue before reporting completion.
