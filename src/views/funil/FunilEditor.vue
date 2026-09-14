<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import { VueFlow, useVueFlow } from "@vue-flow/core";
import "@vue-flow/core/dist/style.css";

import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";

import { useCrud } from "@/composables/useCrud";

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

  try {
    const response = await crud.list({
      funil_id: funilId,
    });

    const etapas = response.data.data ?? response.data;

    nodes.value = buildNodes(etapas);
    edges.value = buildEdges(etapas);

    setTimeout(() => fitView(), 300);
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
  <v-container fluid class="pa-0">
    <v-toolbar density="compact">
      <v-btn icon="mdi-arrow-left" @click="router.back()" />

      <v-toolbar-title> Editor do Funil {{ funilId }} </v-toolbar-title>

      <v-spacer />
      <v-btn
        color="success"
        prepend-icon="mdi-plus"
        @click="showAddDialog = true"
      >
        Novo
      </v-btn>

      <v-btn
        color="primary"
        prepend-icon="mdi-content-save"
        @click="savePositions"
      >
        Salvar
      </v-btn>
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
      <div class="canvas">
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

          <v-btn
            icon="mdi-close"
            size="small"
            variant="text"
            @click.stop.prevent="closeEditor"
          />
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
.editor {
  height: calc(100vh - 64px);
  display: flex;
}

.canvas {
  flex: 1;
  background: #f5f5f5;
}

.sidebar {
  width: 380px;
  border-radius: 0;
  overflow: auto;
}

.vue-flow {
  width: 100%;
  height: 100%;
}
</style>
