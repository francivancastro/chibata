<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { notify } from "@kyvg/vue3-notification";

import { VueFlow, useVueFlow } from "@vue-flow/core";
import "@vue-flow/core/dist/style.css";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";

import { useCrud } from "@/composables/useCrud";
import { errorMessage } from "@/plugins/axios";
import {
  PhArrowLeft,
  PhCheck,
  PhCreditCard,
  PhDiamond,
  PhFlag,
  PhLightning,
  PhChatCenteredText,
  PhShoppingBag,
  PhTreeStructure,
  PhX,
} from "@phosphor-icons/vue";

import MensagemNode from "@/components/flow/nodes/MensagemNode.vue";
import ProdutoNode from "@/components/flow/nodes/ProdutoNode.vue";
import AcaoNode from "@/components/flow/nodes/AcaoNode.vue";
import CondicaoNode from "@/components/flow/nodes/CondicaoNode.vue";
import PagamentoNode from "@/components/flow/nodes/PagamentoNode.vue";
import FinalNode from "@/components/flow/nodes/FinalNode.vue";

import MensagemEditor from "@/components/flow/editors/MensagemEditor.vue";
import ProdutoEditor from "@/components/flow/editors/ProdutoEditor.vue";
import CondicaoEditor from "@/components/flow/editors/CondicaoEditor.vue";
import AcaoEditor from "@/components/flow/editors/AcaoEditor.vue";
import PagamentoEditor from "@/components/flow/editors/PagamentoEditor.vue";
import FinalEditor from "@/components/flow/editors/FinalEditor.vue";

const route = useRoute();
const router = useRouter();

const funilId = String(route.params.id);
const crud = useCrud("funil-etapa");
const funilCrud = useCrud("funil");

const nodes = ref([]);
const edges = ref([]);
const selected = ref(null);
const loading = ref(false);
const loadError = ref("");
const funilNome = ref("");
const botNome = ref("");
const savingNode = ref(false);
const lastSaved = ref(null);
const confirmDelete = ref(false);

const { fitView } = useVueFlow();

const nodeTypes = {
  mensagem: MensagemNode,
  produto: ProdutoNode,
  acao: AcaoNode,
  condicao: CondicaoNode,
  pagamento: PagamentoNode,
  final: FinalNode,
};

const tiposEtapa = [
  { title: "Mensagem", value: "mensagem", icon: PhChatCenteredText },
  { title: "Produto", value: "produto", icon: PhShoppingBag },
  { title: "Condição", value: "condicao", icon: PhDiamond },
  { title: "Ação", value: "acao", icon: PhLightning },
  { title: "Pagamento", value: "pagamento", icon: PhCreditCard },
  { title: "Final", value: "final", icon: PhFlag },
];

const editors = {
  mensagem: MensagemEditor,
  produto: ProdutoEditor,
  condicao: CondicaoEditor,
  acao: AcaoEditor,
  pagamento: PagamentoEditor,
  final: FinalEditor,
};

const defaultPayloads = {
  mensagem: null,
  produto: JSON.stringify({ produto_id: null, origem: "principal" }),
  condicao: JSON.stringify({ pergunta: "", opcoes: { sim: null, nao: null } }),
  acao: JSON.stringify({ action: "create_order" }),
  pagamento: JSON.stringify({ gateway_code: "pushinpay", environment: "production", payment_context: "main_order" }),
  final: JSON.stringify({ action: "finish" }),
};

/*
 * Posições do layout (A4). A API de etapas ainda não tem campos de posição,
 * então o layout fica salvo neste navegador. Quando o backend ganhar pos_x/pos_y,
 * troque readLayout/writeLayout por esses campos.
 */
const LAYOUT_KEY = `chibata:funil-layout:${funilId}`;

function readLayout() {
  try {
    return JSON.parse(window.localStorage.getItem(LAYOUT_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeLayout() {
  try {
    const layout = Object.fromEntries(nodes.value.map((n) => [n.id, { x: Math.round(n.position.x), y: Math.round(n.position.y) }]));
    window.localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
  } catch {
    /* Sem storage (aba privada): o layout volta ao automático na próxima vez. */
  }
}

function parsePayload(payload) {
  if (!payload) return {};
  if (typeof payload === "object") return payload;
  try {
    return payload ? JSON.parse(payload) : {};
  } catch {
    return {};
  }
}

// A API espera o payload como texto JSON; texto inválido vira null em vez de quebrar o salvamento.
function normalizePayloadForSave(payload) {
  if (payload == null) return null;
  if (typeof payload === "string") {
    try {
      JSON.parse(payload);
      return payload;
    } catch {
      return null;
    }
  }
  return JSON.stringify(payload);
}

function warningFor(etapa) {
  const payload = parsePayload(etapa.payload);
  if (etapa.tipo === "produto" && !payload.produto_id) return "sem produto";
  if (etapa.tipo === "condicao" && (!payload.opcoes?.sim || !payload.opcoes?.nao)) return "caminho faltando";
  return "";
}

function buildNodes(etapas) {
  const layout = readLayout();
  return etapas.map((etapa, index) => {
    const id = String(etapa.id);
    return {
      id,
      type: nodeTypes[etapa.tipo] ? etapa.tipo : "mensagem",
      position: layout[id] || { x: (index % 4) * 280, y: Math.floor(index / 4) * 200 },
      data: { etapa, warning: warningFor(etapa) },
    };
  });
}

function buildEdges(etapas) {
  const ids = new Set(etapas.map((e) => String(e.id)));
  const result = [];

  etapas.forEach((etapa) => {
    const source = String(etapa.id);

    if (etapa.fallback_etapa_id && ids.has(String(etapa.fallback_etapa_id))) {
      result.push({
        id: `${source}-fallback-${etapa.fallback_etapa_id}`,
        source,
        target: String(etapa.fallback_etapa_id),
        label: "FALLBACK",
        class: "edge-fallback",
      });
    }

    if (etapa.tipo === "condicao") {
      const { opcoes = {} } = parsePayload(etapa.payload);
      Object.entries(opcoes).forEach(([label, target]) => {
        if (target == null || !ids.has(String(target))) return; // sem destino: sem aresta "null"
        result.push({
          id: `${source}-${label}-${target}`,
          source,
          sourceHandle: label,
          target: String(target),
          label: label === "sim" ? "SIM" : label === "nao" ? "NÃO" : label.toUpperCase(),
          class: `edge-${label}`,
        });
      });
      return;
    }

    if (etapa.proxima_etapa_id && ids.has(String(etapa.proxima_etapa_id))) {
      result.push({ id: `${source}-${etapa.proxima_etapa_id}`, source, target: String(etapa.proxima_etapa_id) });
    }
  });

  return result;
}

const warnings = computed(() =>
  nodes.value
    .filter((n) => n.data?.warning)
    .map((n) => ({ id: n.id, text: `“${n.data.etapa.titulo || "Etapa"}”: ${n.data.warning}` })),
);

const savedLabel = computed(() =>
  lastSaved.value
    ? `Salvo às ${new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(lastSaved.value)}`
    : "Alterações são salvas ao confirmar cada etapa",
);

async function loadFunil() {
  try {
    const { data } = await funilCrud.detail(funilId);
    const funil = data?.data?.funil || data?.data || {};
    funilNome.value = funil.nome || "";
    botNome.value = funil.nome_bot || funil.bot?.nome || "";
  } catch {
    /* O título cai para "Funil #id". */
  }
}

async function load({ keepSelection = false } = {}) {
  loading.value = !nodes.value.length;
  loadError.value = "";

  try {
    const response = await crud.list({ funil_id: funilId });
    const body = response?.data;
    const etapas = Array.isArray(body?.data)
      ? body.data
      : Array.isArray(body?.data?.list)
        ? body.data.list
        : Array.isArray(body?.list)
          ? body.list
          : [];

    const selectedId = selected.value?.id;
    nodes.value = buildNodes(etapas);
    edges.value = buildEdges(etapas);

    if (keepSelection && selectedId != null) {
      selected.value = etapas.find((e) => String(e.id) === String(selectedId)) || null;
    }

    if (!keepSelection) setTimeout(() => fitView({ padding: 0.2 }), 200);
  } catch (err) {
    nodes.value = [];
    edges.value = [];
    loadError.value = errorMessage(err, "Não foi possível carregar as etapas deste funil.");
  } finally {
    loading.value = false;
  }
}

async function createNode(tipo) {
  try {
    const response = await crud.create({
      funil_id: funilId,
      tipo,
      titulo: `Nova etapa de ${tiposEtapa.find((t) => t.value === tipo)?.title.toLowerCase() || "fluxo"}`,
      descricao: "",
      ordem: nodes.value.length + 1,
      payload: defaultPayloads[tipo],
    });
    const created = response?.data?.data;
    lastSaved.value = new Date();
    await load({ keepSelection: true });
    if (created?.id != null) selected.value = nodes.value.find((n) => n.id === String(created.id))?.data.etapa || null;
  } catch (err) {
    notify({ type: "error", title: "Etapa não criada", text: errorMessage(err) });
  }
}

function selectNode(event) {
  const node = event?.node ?? event;
  if (!node?.data?.etapa) return;
  selected.value = node.data.etapa;
}

function focusNode(id) {
  const node = nodes.value.find((n) => n.id === id);
  if (!node) return;
  selected.value = node.data.etapa;
  fitView({ nodes: [id], padding: 1.2, duration: 300 });
}

function closeEditor() {
  selected.value = null;
}

const editorComponent = computed(() => editors[selected.value?.tipo] ?? null);
const etapasDisponiveis = computed(() => nodes.value.map((node) => node?.data?.etapa).filter(Boolean));
const selectedType = computed(() => tiposEtapa.find((t) => t.value === selected.value?.tipo)?.title || "Etapa");

function updateNode(data) {
  if (!selected.value) return;
  selected.value = { ...selected.value, ...data };
}

async function persist(etapa, successText) {
  savingNode.value = true;
  try {
    await crud.update({ ...etapa, id: etapa.id, payload: normalizePayloadForSave(etapa.payload) });
    lastSaved.value = new Date();
    if (successText) notify({ type: "success", title: successText });
    await load({ keepSelection: true });
    return true;
  } catch (err) {
    notify({ type: "error", title: "Não foi salvo", text: errorMessage(err) });
    return false;
  } finally {
    savingNode.value = false;
  }
}

function saveNode() {
  if (selected.value) persist(selected.value, "Etapa salva");
}

// Arrastar de uma saída até outra etapa cria a conexão de verdade (antes não persistia).
async function onConnect({ source, sourceHandle, target }) {
  const etapa = nodes.value.find((n) => n.id === source)?.data.etapa;
  if (!etapa || source === target) return;
  if (etapa.tipo === "final") return; // etapa final não tem próxima

  if (etapa.tipo === "condicao") {
    const payload = parsePayload(etapa.payload);
    const opcoes = { ...(payload.opcoes || {}), [sourceHandle || "sim"]: String(target) };
    await persist({ ...etapa, payload: JSON.stringify({ ...payload, opcoes }, null, 2) }, "Conexão salva");
  } else {
    await persist({ ...etapa, proxima_etapa_id: target }, "Conexão salva");
  }
}

async function deleteNode() {
  if (!selected.value) return;
  try {
    await crud.remove(selected.value.id);
    confirmDelete.value = false;
    selected.value = null;
    lastSaved.value = new Date();
    await load({ keepSelection: true });
  } catch (err) {
    confirmDelete.value = false;
    notify({ type: "error", title: "Etapa não excluída", text: errorMessage(err) });
  }
}

function goBack() {
  if (window.history.length > 1) router.back();
  else router.push("/funil");
}

onMounted(() => {
  loadFunil();
  load();
});
</script>

<template>
  <div class="flow-workspace">
    <header class="flow-header">
      <v-btn icon variant="text" aria-label="Voltar para funis" @click="goBack">
        <PhArrowLeft :size="20" aria-hidden="true" />
      </v-btn>
      <div class="flow-heading">
        <span class="flow-eyebrow">Funil<template v-if="botNome"> · {{ botNome }}</template></span>
        <h1>{{ funilNome || `Funil #${funilId}` }}</h1>
      </div>
      <span class="flow-saved" :class="{ 'flow-saved--ok': lastSaved }" role="status">
        <PhCheck v-if="lastSaved" :size="16" aria-hidden="true" />{{ savingNode ? "Salvando…" : savedLabel }}
      </span>
    </header>

    <div class="flow-body">
      <aside class="flow-palette" aria-label="Adicionar etapa">
        <h2>Adicionar etapa</h2>
        <button v-for="tipo in tiposEtapa" :key="tipo.value" type="button" class="palette-item" @click="createNode(tipo.value)">
          <component :is="tipo.icon" :size="18" aria-hidden="true" />{{ tipo.title }}
        </button>

        <div v-if="warnings.length" class="flow-warnings" role="status">
          <strong>{{ warnings.length === 1 ? "1 aviso" : `${warnings.length} avisos` }} no fluxo</strong>
          <button v-for="w in warnings" :key="w.id" type="button" @click="focusNode(w.id)">{{ w.text }}</button>
        </div>
        <p class="flow-hint">Arraste de uma saída até outra etapa para conectar. O layout fica salvo neste navegador.</p>
      </aside>

      <section class="flow-canvas" aria-label="Fluxo do funil">
        <div v-if="loading" class="state-block"><v-progress-circular indeterminate color="primary" /><p>Carregando etapas…</p></div>
        <div v-else-if="loadError" class="state-block" role="alert">
          <PhTreeStructure :size="32" aria-hidden="true" />
          <h2>Não foi possível abrir o editor</h2>
          <p>{{ loadError }}</p>
          <v-btn color="primary" @click="load()">Tentar novamente</v-btn>
        </div>
        <div v-else-if="!nodes.length" class="state-block">
          <PhTreeStructure :size="32" aria-hidden="true" />
          <h2>Este funil ainda não tem etapas</h2>
          <p>Comece com uma mensagem de boas-vindas.</p>
          <v-btn color="primary" @click="createNode('mensagem')">Adicionar mensagem</v-btn>
        </div>
        <VueFlow
          v-else
          v-model:nodes="nodes"
          v-model:edges="edges"
          :node-types="nodeTypes"
          :default-edge-options="{ type: 'smoothstep' }"
          fit-view-on-init
          @node-click="selectNode"
          @pane-click="closeEditor"
          @node-drag-stop="writeLayout"
          @connect="onConnect"
        >
          <Background :gap="20" pattern-color="#C6CABE" />
          <Controls />
          <MiniMap pannable zoomable />
        </VueFlow>
      </section>

      <aside v-if="selected" class="flow-inspector" aria-label="Editar etapa">
        <div class="inspector-head">
          <div>
            <span class="inspector-type">{{ selectedType }}</span>
            <h2>{{ selected.titulo || "Sem título" }}</h2>
          </div>
          <v-btn icon variant="text" aria-label="Fechar painel" @click="closeEditor"><PhX :size="18" aria-hidden="true" /></v-btn>
        </div>
        <div class="inspector-body">
          <component
            :is="editorComponent"
            v-if="editorComponent"
            :key="selected.id"
            :etapa="selected"
            :etapas="etapasDisponiveis"
            @update="updateNode"
            @save="saveNode"
          />
        </div>
        <div class="inspector-foot">
          <v-btn variant="outlined" class="btn-danger" @click="confirmDelete = true">Excluir etapa…</v-btn>
        </div>
      </aside>
    </div>

    <v-dialog v-model="confirmDelete" max-width="420">
      <v-card role="alertdialog">
        <v-card-title>Excluir “{{ selected?.titulo || "etapa" }}”?</v-card-title>
        <v-card-text>As conexões que chegam nela ficam sem destino.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmDelete = false">Cancelar</v-btn>
          <v-btn color="error" variant="flat" @click="deleteNode">Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.flow-workspace { height: 100dvh; display: flex; flex-direction: column; background: var(--ch-bg); }
.flow-header { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 10px 20px; background: var(--ch-surface); border-bottom: 1px solid var(--ch-line); }
.flow-heading { display: flex; flex-direction: column; min-width: 0; }
.flow-eyebrow { font-size: 12px; color: var(--ch-muted); }
.flow-heading h1 { margin: 0; font-family: var(--ch-display); font-size: 22px; font-weight: 700; letter-spacing: -.01em; color: var(--ch-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.flow-saved { margin-left: auto; display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--ch-muted); }
.flow-saved--ok { color: var(--ch-ok); }

.flow-body { flex: 1; min-height: 0; display: flex; }
.flow-palette { width: 220px; flex-shrink: 0; padding: 18px 14px; box-sizing: border-box; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; background: var(--ch-surface); border-right: 1px solid var(--ch-line); }
.flow-palette h2 { margin: 0 4px 4px; font-size: 12px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--ch-muted); }
.palette-item { display: flex; align-items: center; gap: 10px; min-height: 44px; padding: 0 12px; border: 1px solid var(--ch-line); border-radius: var(--ch-radius); background: var(--ch-surface); font: inherit; font-size: 14px; color: var(--ch-ink); text-align: left; cursor: pointer; }
.palette-item svg { color: var(--ch-accent); }
.palette-item:hover { border-color: var(--ch-accent-line); background: var(--ch-accent-soft); }
.flow-warnings { margin-top: 12px; padding: 12px; border-radius: var(--ch-radius); background: var(--ch-warn-soft); display: flex; flex-direction: column; gap: 6px; }
.flow-warnings strong { font-size: 13px; color: var(--ch-warn-ink); }
.flow-warnings button { padding: 4px 0; border: 0; background: transparent; font: inherit; font-size: 13px; line-height: 1.4; color: var(--ch-ink-2); text-align: left; text-decoration: underline; cursor: pointer; }
.flow-hint { margin: auto 4px 0; padding-top: 12px; font-size: 12px; line-height: 1.5; color: var(--ch-muted); }

.flow-canvas { flex: 1; min-width: 0; position: relative; display: flex; }
.flow-canvas > .state-block { flex: 1; }
.flow-canvas :deep(.vue-flow) { width: 100%; height: 100%; }
.flow-canvas :deep(.vue-flow__edge-path) { stroke: var(--ch-faint); stroke-width: 2; }
.flow-canvas :deep(.edge-sim .vue-flow__edge-path) { stroke: var(--ch-ok); }
.flow-canvas :deep(.edge-nao .vue-flow__edge-path) { stroke: var(--ch-danger); }
.flow-canvas :deep(.edge-fallback .vue-flow__edge-path) { stroke: var(--ch-danger); stroke-dasharray: 6 4; }
.flow-canvas :deep(.vue-flow__edge-textbg) { fill: var(--ch-bg); }
.flow-canvas :deep(.vue-flow__edge-text) { font-size: 12px; font-weight: 700; }
.flow-canvas :deep(.vue-flow__handle) { width: 12px; height: 12px; background: var(--ch-surface); border: 2px solid var(--ch-accent); }

.flow-inspector { width: 340px; flex-shrink: 0; display: flex; flex-direction: column; background: var(--ch-surface); border-left: 1px solid var(--ch-line); }
.inspector-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; padding: 18px 20px 14px; border-bottom: 1px solid var(--ch-line); }
.inspector-type { font-size: 12px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--ch-accent); }
.inspector-head h2 { margin: 2px 0 0; font-size: 18px; font-weight: 600; }
.inspector-body { flex: 1; overflow-y: auto; padding: 18px 20px; }
.inspector-foot { padding: 12px 20px 18px; border-top: 1px solid var(--ch-line); }

@media (max-width: 900px) {
  .flow-body { flex-direction: column; }
  .flow-palette { width: 100%; flex-direction: row; flex-wrap: wrap; border-right: 0; border-bottom: 1px solid var(--ch-line); }
  .flow-palette h2, .flow-hint { width: 100%; }
  .palette-item { flex: 1 1 140px; }
  .flow-canvas { min-height: 60dvh; }
  .flow-inspector { width: 100%; border-left: 0; border-top: 1px solid var(--ch-line); }
}
</style>
