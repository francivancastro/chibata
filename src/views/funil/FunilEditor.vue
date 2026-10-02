<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import { VueFlow, useVueFlow } from "@vue-flow/core";
import "@vue-flow/core/dist/style.css";

import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";

import { useCrud } from "@/composables/useCrud";
import { PhArrowLeft, PhFloppyDisk, PhPlus, PhTreeStructure, PhX } from "@phosphor-icons/vue";

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

const route = useRoute();
const router = useRouter();

const funilId = route.params.id;
const crud = useCrud("funil-etapa");

const nodes = ref([]);
const edges = ref([]);
const selected = ref(null);
const loading = ref(false);
const loadError = ref("");

const { fitView } = useVueFlow();

const nodeTypes = {
  mensagem: MensagemNode,
  produto: ProdutoNode,
  acao: AcaoNode,
  condicao: CondicaoNode,
  pagamento: PagamentoNode,
  final: FinalNode,
};

const showAddDialog = ref(false);

const novoTipo = ref("mensagem");

const tiposEtapa = [
  {
    title: "Mensagem",
    value: "mensagem",
  },
  {
    title: "Produto",
    value: "produto",
  },
  {
    title: "Condição",
    value: "condicao",
  },
  {
    title: "Ação",
    value: "acao",
  },
  {
    title: "Pagamento",
    value: "pagamento",
  },
  {
    title: "Final",
    value: "final",
  },
];

function closeEditor(event) {
  event?.stopPropagation?.();
  selected.value = null;
}

function parsePayload(payload) {
  try {
    return payload ? JSON.parse(payload) : {};
  } catch {
    return {};
  }
}

function buildNodes(etapas) {
  return etapas.map((etapa, index) => ({
    id: String(etapa.id),
    type: etapa.tipo,
    position: {
      x: (index % 4) * 300,
      y: Math.floor(index / 4) * 220,
    },
    data: {
      etapa,
    },
  }));
}

function buildEdges(etapas) {
  const result = [];

  etapas.forEach((etapa) => {
    if (etapa.proxima_etapa_id) {
      result.push({
        id: `${etapa.id}-${etapa.proxima_etapa_id}`,
        source: String(etapa.id),
        target: String(etapa.proxima_etapa_id),
        animated: true,
      });
    }

    if (etapa.tipo === "condicao") {
      const payload = parsePayload(etapa.payload);

      if (payload.opcoes) {
        Object.entries(payload.opcoes).forEach(([label, target]) => {
          result.push({
            id: `${etapa.id}-${label}-${target}`,
            source: String(etapa.id),
            target: String(target),
            label: label.toUpperCase(),
            animated: true,
          });
        });
      }
    }
  });

  return result;
}

async function load() {
  loading.value = true;
  loadError.value = "";

  try {
    const response = await crud.list({
      funil_id: funilId,
    });

    const etapas = response.data.data ?? response.data;

    nodes.value = buildNodes(etapas);
    edges.value = buildEdges(etapas);

    setTimeout(() => fitView(), 300);
  } catch {
    nodes.value = [];
    edges.value = [];
    loadError.value = "Não foi possível carregar as etapas deste funil. Verifique a conexão e tente novamente.";
  } finally {
    loading.value = false;
  }
}

async function createNode() {
  const payloads = {
    mensagem: null,

    produto: JSON.stringify({
      produto_id: null,
      origem: "principal",
    }),

    condicao: JSON.stringify({
      pergunta: "",
      opcoes: {
        sim: null,
        nao: null,
      },
    }),

    acao: JSON.stringify({
      action: "create_order",
    }),

    pagamento: JSON.stringify({
      action: "create_payment",
    }),

    final: JSON.stringify({
      action: "finish",
    }),
  };

  try {
    const requestPayload = {
      funil_id: String(funilId),
      tipo: novoTipo.value,
      titulo: "Nova etapa",
      descricao: "",
      ordem: nodes.value.length + 1,
      payload: payloads[novoTipo.value],
    };

    const response = await crud.create(requestPayload);

    const serverData = response?.data?.data ?? response?.data?.item ?? response?.data ?? {};

    const etapa = {
      ...requestPayload,
      ...serverData,
      id: serverData?.id ? String(serverData.id) : `temp-${Date.now()}`,
      tipo: serverData?.tipo ?? requestPayload.tipo,
      titulo: serverData?.titulo ?? requestPayload.titulo,
      descricao: serverData?.descricao ?? requestPayload.descricao,
      ordem: serverData?.ordem ?? requestPayload.ordem,
      payload: serverData?.payload ?? requestPayload.payload,
    };

    const node = {
      id: String(etapa.id),
      type: etapa.tipo,
      position: {
        x: 300 + ((nodes.value.length % 4) * 300),
        y: 300 + (Math.floor(nodes.value.length / 4) * 220),
      },
      data: {
        etapa,
      },
    };

    nodes.value.push(node);
    selected.value = etapa;
    showAddDialog.value = false;

    await load();
  } catch (error) {
    console.error("Erro ao criar etapa:", error);
  }
}

function selectNode(event) {
  const node = event?.node ?? event;

  if (!node?.data?.etapa) return;

  event?.originalEvent?.stopPropagation?.();
  event?.event?.stopPropagation?.();

  selected.value = node.data.etapa;
}

const editorComponent = computed(() => {
  const tipo = selected.value?.tipo;

  const editors = {
    mensagem: MensagemEditor,
    produto: ProdutoEditor,
    condicao: CondicaoEditor,
    acao: AcaoEditor,
  };

  return tipo ? (editors[tipo] ?? null) : null;
});

const etapasDisponiveis = computed(() => {
  return nodes.value.map((node) => node?.data?.etapa).filter(Boolean);
});
async function updateNode(data) {
  if (!selected.value) return;

  const updated = {
    ...selected.value,
    ...data,
  };

  selected.value = updated;

  const node = nodes.value.find((item) => item.id === String(updated.id));

  if (node) {
    node.data.etapa = updated;
  }
}

async function saveNode() {
  if (!selected.value) return;

  const payload = {
    ...selected.value,
  };

  const isNew = !payload.id || String(payload.id).startsWith("temp-");

  try {
    if (isNew) {
      const { id, ...rest } = payload;
      const response = await crud.create(rest);
      const created = response?.data?.data ?? response?.data?.item ?? response?.data ?? {};
      const persisted = {
        ...payload,
        ...created,
        id: created?.id ?? payload.id,
      };

      selected.value = persisted;

      const node = nodes.value.find((item) => item.id === String(payload.id));
      if (node) {
        node.id = String(persisted.id);
        node.data.etapa = persisted;
      }

      await load();
      return;
    }

    await crud.update({
      id: payload.id,
      ...payload,
    });
  } catch (error) {
    console.error("Erro ao salvar etapa:", error);
  }
}

async function deleteNode() {
  if (!selected.value) return;

  const ok = window.confirm('Confirma exclusão desta etapa?');
  if (!ok) return;

  try {
    await crud.remove(selected.value.id);

    // remover do fluxo localmente
    const idStr = String(selected.value.id);
    nodes.value = nodes.value.filter((n) => String(n.id) !== idStr);
    edges.value = edges.value.filter(
      (e) => String(e.source) !== idStr && String(e.target) !== idStr,
    );

    selected.value = null;
  } catch (error) {
    console.error('Erro ao excluir etapa:', error);
  }
}

function savePositions() {
  console.log(
    nodes.value.map((node) => ({
      id: node.id,
      x: node.position.x,
      y: node.position.y,
    })),
  );
}

function typeLabel(tipo) {
  const labels = {
    mensagem: "Mensagem",
    produto: "Produto",
    condicao: "Condição",
    acao: "Ação",
    pagamento: "Pagamento",
    final: "Final",
  };

  return labels[tipo] ?? tipo;
}

onMounted(load);
</script>

<template>
  <v-container fluid class="flow-workspace pa-0">
    <v-toolbar class="flow-toolbar" density="compact">
      <v-btn icon variant="text" aria-label="Voltar para o funil" @click="router.back()"><PhArrowLeft :size="20" weight="regular" aria-hidden="true" /></v-btn>

      <v-toolbar-title><strong>Editor do funil {{ funilId }}</strong><span class="flow-toolbar-context">Automação</span></v-toolbar-title>

      <v-spacer />
      <v-btn
        color="primary"
        @click="showAddDialog = true"
      ><PhPlus :size="18" weight="regular" aria-hidden="true" />Novo</v-btn>

      <v-btn
        color="primary"
        @click="savePositions"
      ><PhFloppyDisk :size="18" weight="regular" aria-hidden="true" />Salvar</v-btn>
    </v-toolbar>

    <v-dialog v-model="showAddDialog" max-width="420">
      <v-card>
        <v-card-title> Nova etapa </v-card-title>

        <v-card-text>
          <v-select
            v-model="novoTipo"
            :items="tiposEtapa"
            item-title="title"
            item-value="value"
            label="Tipo"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn variant="text" @click="showAddDialog = false">
            Cancelar
          </v-btn>

          <v-btn color="primary" @click="createNode"> Criar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div class="editor">
      <div v-if="loading" class="editor-state"><v-progress-circular indeterminate color="primary" /><p>Carregando etapas...</p></div>
      <div v-else-if="loadError" class="editor-state"><PhTreeStructure :size="34" weight="regular" aria-hidden="true" /><h2>Editor temporariamente indisponível</h2><p>{{ loadError }}</p><v-btn color="primary" @click="load">Tentar novamente</v-btn></div>
      <div v-else class="canvas">
        <VueFlow
          v-model:nodes="nodes"
          v-model:edges="edges"
          :node-types="nodeTypes"
          @node-click="selectNode"
          @pane-click="closeEditor"
          fit-view-on-init
        >
          <Background />
          <Controls />
          <MiniMap />
        </VueFlow>
      </div>

      <v-card v-if="selected" class="sidebar" @click.stop>
        <v-card-title class="d-flex align-center">
          {{ selected.titulo }}

          <v-spacer />

          <v-btn icon size="small" variant="text" aria-label="Fechar editor" @click.stop.prevent="closeEditor"><PhX :size="18" weight="regular" aria-hidden="true" /></v-btn>
        </v-card-title>

        <v-card-text>
          <v-chip color="primary" size="small">
            {{ typeLabel(selected.tipo) }}
          </v-chip>

          <v-divider class="my-4" />

          <component
            v-if="editorComponent && selected"
            :is="editorComponent"
            :key="selected.id"
            :etapa="selected"
            :etapas="etapasDisponiveis"
            @update="updateNode"
            @save="saveNode"
          />

          <v-alert v-else type="info">
            Este tipo de nó não possui editor.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="red" variant="text" @click="deleteNode">Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-container>
</template>

<style scoped>
.flow-workspace { background: var(--cc-canvas); }
.flow-toolbar { min-height: 64px; padding: 0 14px; border-bottom: 1px solid var(--cc-border); background: var(--cc-surface) !important; color: var(--cc-text); }
.flow-toolbar .v-toolbar-title { display: flex; align-items: center; gap: 10px; min-width: 0; margin-inline-start: 8px; }
.flow-toolbar-context { padding: 4px 7px; border: 1px solid var(--cc-border); border-radius: 6px; color: var(--cc-accent); font-size: 10px; font-weight: 650; letter-spacing: .04em; line-height: 1; }
.flow-toolbar strong { overflow: hidden; font-size: 14px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.flow-toolbar .v-btn { gap: 8px; }
.editor {
  height: calc(100dvh - 64px);
  display: flex;
}

.canvas {
  flex: 1;
  min-width: 0;
  background: var(--cc-canvas);
  background-image: radial-gradient(circle at 1px 1px, rgba(0, 208, 132, .12) 1px, transparent 0);
  background-size: 24px 24px;
}
.editor-state { display: grid; place-content: center; justify-items: center; flex: 1; min-width: 0; gap: 10px; padding: 32px; color: var(--cc-accent); background: var(--cc-surface); text-align: center; }
.editor-state h2 { margin: 4px 0 0; color: var(--cc-text); font-size: 18px; }
.editor-state p { max-width: 400px; margin: 0; color: var(--cc-muted); font-size: 13px; line-height: 1.55; }

.sidebar {
  width: min(380px, 40vw);
  background: var(--cc-surface);
  border-left: 1px solid var(--cc-border);
  border-radius: 0;
  overflow: auto;
}
.sidebar :deep(.v-card-title) { padding: 18px 20px 14px; border-bottom: 1px solid var(--cc-border); font-size: 16px; }
.sidebar :deep(.v-card-text) { padding: 18px 20px; }
.sidebar :deep(.v-card-actions) { padding: 12px 20px 18px; border-top: 1px solid var(--cc-border); }

.vue-flow {
  width: 100%;
  height: 100%;
}
@media (max-width: 600px) {
  .flow-toolbar { padding-inline: 8px; }
  .flow-toolbar strong { max-width: 150px; }
  .flow-toolbar-context { display: none; }
  .editor { flex-direction: column; height: auto; min-height: calc(100dvh - 64px); }
  .canvas { min-height: 55dvh; }
  .vue-flow { min-height: 55dvh; }
  .sidebar { width: 100%; max-height: 45dvh; border-left: 0; border-top: 1px solid var(--cc-border); }
}
</style>
