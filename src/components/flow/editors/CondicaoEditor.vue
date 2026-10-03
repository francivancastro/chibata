<script setup>
import { computed } from "vue";

const props = defineProps({
  etapa: Object,
  etapas: Array,
});

const emit = defineEmits(["update", "save"]);

const payload = computed(() => {
  try {
    return JSON.parse(props.etapa?.payload || "{}");
  } catch {
    return {};
  }
});

const etapasDisponiveis = computed(() => {
  return (props.etapas || [])
    .filter((item) => item?.id && item.id !== props.etapa?.id)
    .map((item) => ({
      title: item.titulo || `Etapa ${item.id}`,
      value: String(item.id),
    }));
});

function updatePayload(nextPayload) {
  emit("update", {
    ...props.etapa,
    payload: JSON.stringify(nextPayload, null, 2),
  });
}

function updatePergunta(value) {
  updatePayload({
    ...payload.value,
    pergunta: value,
  });
}

function updateDescricao(value) {
  emit("update", {
    ...props.etapa,
    descricao: value,
  });
}

function updateOrdem(value) {
  emit("update", {
    ...props.etapa,
    ordem: value,
  });
}

// Antes este editor salvava na API e o pai salvava de novo (duas requisições, M9).
// Agora só entrega os dados; quem persiste é o FunilEditor.
function saveEtapa() {
  emit("update", { ...props.etapa, payload: JSON.stringify(payload.value, null, 2) });
  emit("save");
}

function updateOpcao(label, value) {
  updatePayload({
    ...payload.value,
    opcoes: {
      ...(payload.value.opcoes || {}),
      [label]: value ? String(value) : null,
    },
  });
}
</script>

<template>
  <v-text-field
    label="Pergunta"
    :model-value="payload.pergunta || ''"
    @update:model-value="updatePergunta"
  />

  <v-textarea
    label="Mensagem"
    :model-value="props.etapa?.descricao || ''"
    @update:model-value="updateDescricao"
  />

  <v-text-field
    label="Ordem"
    :model-value="props.etapa?.ordem ?? ''"
    type="number"
    @update:model-value="updateOrdem"
  />

  <v-select
    label="SIM vai para etapa"
    :model-value="payload.opcoes?.sim ?? null"
    :items="etapasDisponiveis"
    item-title="title"
    item-value="value"
    clearable
    @update:model-value="(value) => updateOpcao('sim', value ?? null)"
  />

  <v-select
    label="NÃO vai para etapa"
    :model-value="payload.opcoes?.nao ?? null"
    :items="etapasDisponiveis"
    item-title="title"
    item-value="value"
    clearable
    @update:model-value="(value) => updateOpcao('nao', value ?? null)"
  />

  <v-btn color="primary" block @click="saveEtapa">Salvar</v-btn>
</template>
