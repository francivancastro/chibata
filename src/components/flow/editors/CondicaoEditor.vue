<script setup>
import { computed } from "vue";
import { useCrud } from "@/composables/useCrud";
import EtapaCamposComuns from "./EtapaCamposComuns.vue";

const props = defineProps({
  etapa: Object,
  etapas: Array,
});

const emit = defineEmits(["update", "save"]);
const { create: createEtapa, update: updateEtapa } = useCrud("funil-etapa");

const payload = computed(() => {
  try {
    return JSON.parse(props.etapa?.payload || "{}");
  } catch {
    return {};
  }
});

const etapasDisponiveis = computed(() => {
  const items = (props.etapas || [])
    .filter((item) => item?.id && String(item.id) !== String(props.etapa?.id))
    .map((item) => ({
      title: `#${item.id} — ${item.titulo || `Etapa ${item.id}`}`,
      value: String(item.id),
    }));

  // garante que valores órfãos (etapa removida) apareçam sem quebrar o select
  for (const key of ["sim", "nao"]) {
    const current = payload.value?.opcoes?.[key];

    if (current == null) continue;

    const exists = items.some((i) => i.value === String(current));

    if (!exists) {
      items.push({
        title: `#${current} — Etapa não encontrada`,
        value: String(current),
      });
    }
  }

  return items;
});

function normalizeOpcaoValue(value) {
  if (value == null || value === "") return null;

  const num = Number(value);
  return Number.isNaN(num) ? String(value) : num;
}

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

function updateTitulo(value) {
  emit("update", {
    ...props.etapa,
    titulo: value,
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

function isNewEtapa() {
  return !props.etapa?.id || String(props.etapa.id).startsWith("temp-");
}

async function saveEtapa() {
  const dataToSave = {
    ...props.etapa,
    payload: JSON.stringify(payload.value, null, 2),
  };

  try {
    if (isNewEtapa()) {
      const { id, ...rest } = dataToSave;
      const response = await createEtapa(rest);
      const created = response?.data?.data ?? response?.data?.item ?? response?.data ?? {};
      const persisted = {
        ...dataToSave,
        ...created,
        id: created?.id ?? dataToSave.id,
      };

      emit("update", persisted);
      emit("save", persisted);
      return;
    }

    await updateEtapa({
      id: dataToSave.id,
      ...dataToSave,
    });

    emit("update", dataToSave);
    emit("save", dataToSave);
  } catch (error) {
    console.error("Erro ao salvar etapa:", error);
  }
}

function updateOpcao(label, value) {
  updatePayload({
    ...payload.value,
    opcoes: {
      ...(payload.value.opcoes || {}),
      [label]: normalizeOpcaoValue(value),
    },
  });
}
</script>

<template>
  <EtapaCamposComuns
    :titulo="props.etapa?.titulo || ''"
    :descricao="props.etapa?.descricao || ''"
    @update:titulo="updateTitulo"
    @update:descricao="updateDescricao"
  />

  <v-text-field
    label="Pergunta"
    :model-value="payload.pergunta || ''"
    @update:model-value="updatePergunta"
  />

  <v-text-field
    label="Ordem"
    :model-value="props.etapa?.ordem ?? ''"
    type="number"
    @update:model-value="updateOrdem"
  />

  <v-select
    label="SIM vai para etapa"
    :model-value="payload.opcoes?.sim != null ? String(payload.opcoes.sim) : null"
    :items="etapasDisponiveis"
    item-title="title"
    item-value="value"
    clearable
    @update:model-value="(value) => updateOpcao('sim', value ?? null)"
  />

  <v-select
    label="NÃO vai para etapa"
    :model-value="payload.opcoes?.nao != null ? String(payload.opcoes.nao) : null"
    :items="etapasDisponiveis"
    item-title="title"
    item-value="value"
    clearable
    @update:model-value="(value) => updateOpcao('nao', value ?? null)"
  />

  <v-btn color="primary" block @click="saveEtapa">Salvar</v-btn>
</template>
