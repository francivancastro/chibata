<script setup>
import { ref } from "vue";
import EtapaCamposComuns from "./EtapaCamposComuns.vue";

const props = defineProps({
  etapa: {
    type: Object,
    default: () => ({
      payload: "{}",
    }),
  },
  etapas: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update", "save"]);

function getPayload() {
  try {
    return typeof props.etapa?.payload === "string"
      ? JSON.parse(props.etapa.payload || "{}")
      : (props.etapa?.payload ?? {});
  } catch {
    return {};
  }
}

const titulo = ref(props.etapa?.titulo || "");
const descricao = ref(props.etapa?.descricao || "");
const ordem = ref(props.etapa?.ordem || "");

function save() {
  emit("update", {
    titulo: titulo.value,
    descricao: descricao.value,
    ordem: ordem.value,
    proxima_etapa_id: null,
    payload: JSON.stringify(
      {
        ...getPayload(),
      },
      null,
      2,
    ),
  });

  emit("save");
}
</script>

<template>
  <EtapaCamposComuns
    v-model:titulo="titulo"
    v-model:descricao="descricao"
  />

  <v-text-field label="Ordem" v-model="ordem" type="number" />

  <v-alert type="info" density="compact" class="mb-4">
    Etapa final: não possui próxima etapa.
  </v-alert>

  <v-btn color="primary" block @click="save"> Salvar </v-btn>
</template>
