# Command Center Office Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir um frontend Vue/Vite separado com bridge local segura para conversar com o Codex e acompanhar os agentes do Maestri em um escritório virtual.

**Architecture:** O app em `command-center/` será um frontend independente, servido pelo Vite, consumindo uma bridge Node local em loopback. A bridge terá uma whitelist de operações (`list`, `ask`, `check`), normalizará a saída textual da CLI e nunca aceitará comandos arbitrários vindos do navegador.

**Tech Stack:** Vue 3, Vite já instalado no workspace, CSS nativo, Node.js built-in `http`/`child_process`, Node test runner.

**Spec:** `docs/superpowers/specs/2026-10-03-command-center-office-design.md`

## Global Constraints

- O escritório fica em `command-center/` e não altera o SaaS existente.
- A bridge escuta somente em `127.0.0.1`.
- O frontend nunca recebe API keys, tokens ou credenciais.
- Mensagens do usuário são dados, nunca comandos shell.
- A bridge rejeita hosts externos, content types inválidos, payloads acima de 8.000 caracteres e excesso de requisições locais.
- Não haverá endpoints destrutivos na primeira versão.
- Estados de agente só podem ser afirmados quando observáveis pela CLI/processo; caso contrário usar `indisponível` ou `não observado`.
- O visual usa o Command Center aprovado: workspace claro, shell escuro translúcido e laranja como ação principal.
- Loading, vazio, erro, offline, foco de teclado e viewport estreita precisam ser tratados explicitamente.

## Review Focus

- Mensagem contendo aspas, newline ou caracteres de shell deve chegar como argumento único ao Codex, sem execução adicional; cobrir no teste da bridge.
- CLI ausente, timeout e saída inválida devem retornar erro JSON estável, sem travar o servidor; cobrir no teste da bridge.
- Agente sem estado observável não pode aparecer como “trabalhando”; cobrir no normalizador e no cartão visual.
- Inventário ausente ou parcial deve manter nomes/workspaces observados, sem criar agentes hardcoded; cobrir no parser.
- Lista vazia ou Maestri indisponível deve produzir empty/offline state útil, não uma tela vazia; cobrir no estado do frontend.
- Janela de 390px não deve criar overflow horizontal nem ocultar o composer; cobrir no build e smoke browser.

---

### Task 1: Scaffold do app independente

**Files:**
- Create: `command-center/package.json`
- Create: `command-center/index.html`
- Create: `command-center/vite.config.js`
- Create: `command-center/src/main.js`
- Create: `command-center/src/App.vue`
- Create: `command-center/src/styles/office.css`

**Interfaces:**
- Produces a Vite entrypoint executável via `npm run dev` dentro de `command-center/`.
- Produces a `/api` proxy local para a bridge em `127.0.0.1:4312`.

- [ ] **Step 1: Write the minimal scaffold files and scripts**
- [ ] **Step 2: Run `npm run build` from `command-center/` and verify the empty shell bundles**
- [ ] **Step 3: Commit `feat(office): scaffold command center office app`**

### Task 2: Bridge local Maestri

**Files:**
- Create: `command-center/bridge/maestri-cli.mjs`
- Create: `command-center/bridge/server.mjs`
- Create: `command-center/bridge/maestri-cli.test.mjs`
- Modify: `command-center/package.json`

**Interfaces:**
- `runMaestri(args, options) -> Promise<{ stdout: string, stderr: string, code: number }>` accepts only whitelisted argument arrays.
- `parseMaestriList(output) -> { agents: Agent[], portals: Portal[], notes: Note[] }` without inventing missing agents.
- `normalizeAgentState(agentOutput, now) -> 'working' | 'waiting' | 'offline' | 'unknown'` with an explicit freshness TTL.
- `POST /api/chat` accepts `{ message: string }`, creates one `message_id`/`request_id`, and returns `{ ok: true, message: Message }` or `{ ok: false, error: ErrorPayload }`.
- `GET /api/agents`, `GET /api/activity`, `GET /api/health` return `{ schema_version: 1, request_id, observed_at, source, ... }`.

- [ ] **Step 1: Write failing Node tests for argument validation, host/content-type/size/rate limits, parsing, TTL, timeout and error payloads**
- [ ] **Step 2: Run `node --test command-center/bridge/maestri-cli.test.mjs` and verify failure**
- [ ] **Step 3: Implement the whitelist, process runner, parsers and HTTP handlers**
- [ ] **Step 4: Run the Node tests and verify pass**
- [ ] **Step 5: Start the bridge on loopback and verify `/api/health` plus `/api/agents` with the real Maestri CLI**
- [ ] **Step 6: Commit `feat(office): add safe local maestri bridge`**

### Task 3: Escritório visual e estados operacionais

**Files:**
- Create: `command-center/src/services/maestriBridge.js`
- Create: `command-center/src/state/officeStore.js`
- Create: `command-center/src/components/OfficeSidebar.vue`
- Create: `command-center/src/components/AgentGrid.vue`
- Create: `command-center/src/components/AgentCard.vue`
- Create: `command-center/src/components/ActivityFeed.vue`
- Create: `command-center/src/components/OrchestratorChat.vue`
- Modify: `command-center/src/App.vue`
- Modify: `command-center/src/styles/office.css`

**Interfaces:**
- Store state: `{ agents, activity, messages, health, loading, error, lastUpdated }`.
- `refreshAgents()`, `refreshActivity()`, `sendMessage(message)`, `setPolling(enabled)`.
- Components consume only normalized store data and emit user intent; no component executes shell commands.

- [ ] **Step 1: Add store/service tests for loading, offline, empty and successful chat transitions**
- [ ] **Step 2: Implement the Command Center layout with Codex as the primary workspace**
- [ ] **Step 3: Implement agent cards for Forge, Atlas, Lumen, Cipher and Sage with role, connection and observed state**
- [ ] **Step 4: Implement chat composer, message history, pending state and inline errors**
- [ ] **Step 5: Implement activity feed and explicit offline/unknown states**
- [ ] **Step 6: Run `npm run build` and verify no frontend build errors**
- [ ] **Step 7: Commit `feat(office): build virtual command center workspace`**

### Task 4: Integração e verificação visual

**Files:**
- Modify: `command-center/src/styles/office.css`
- Create: `docs/superpowers/verification/2026-10-03-command-center-office.md`

**Interfaces:**
- The final app must be runnable with bridge and frontend as separate local processes.

- [ ] **Step 1: Start bridge and Vite dev server using the documented scripts**
- [ ] **Step 2: Verify health, agent inventory, and a controlled Codex chat message through the UI**
- [ ] **Step 3: Verify loading, empty, error/offline and unknown-state behavior**
- [ ] **Step 4: Verify desktop and 390px viewport with no horizontal overflow and visible composer**
- [ ] **Step 5: Record commands, URLs, results and known limitations in the verification note**
- [ ] **Step 6: Commit `test(office): verify command center bridge and responsive UI`**

## Final Verification

- `npm run build` passes from `command-center/`.
- `node --test command-center/bridge/maestri-cli.test.mjs` passes.
- `/api/health` reports bridge and CLI availability separately.
- `/api/agents` matches the connected Maestri topology at verification time.
- The chat response is real or explicitly reports the bridge error; no fake success is shown.
- The original SaaS build remains unchanged and passes its existing `npm run build`.
