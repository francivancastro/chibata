<script setup>
import { ref, computed } from "vue";
import EtapaCamposComuns from "./EtapaCamposComuns.vue";

const props = defineProps({
  etapa: {
    type: Object,
    default: () => ({}),
  },
  etapas: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update", "save"]);

const titulo = ref(props.etapa?.titulo || "");
const descricao = ref(props.etapa?.descricao || "");
const ordem = ref(props.etapa?.ordem || "");
const proxima = ref(props.etapa?.proxima_etapa_id ?? null);

const etapasOptions = computed(() => {
  return (props.etapas ?? []).filter((e) => String(e.id) !== String(props.etapa?.id));
});

function save() {
  emit("update", {
    titulo: titulo.value,
    descricao: descricao.value,
    ordem: ordem.value,
    proxima_etapa_id: proxima.value,
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

  <v-select
    label="Próxima etapa"
    :items="etapasOptions"
    item-title="titulo"
    item-value="id"
    v-model="proxima"
    clearable
  />

  <v-btn color="primary" block @click="save"> Salvar </v-btn>
</template>
