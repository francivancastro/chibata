<script setup>
import { computed, ref } from "vue";

// Editor de Pagamento e Final, que antes não tinham editor nenhum (M9).
const props = defineProps({
  etapa: { type: Object, default: () => ({}) },
  etapas: { type: Array, default: () => [] },
});

const emit = defineEmits(["update", "save"]);

const titulo = ref(props.etapa?.titulo || "");
const descricao = ref(props.etapa?.descricao || "");
const proxima = ref(props.etapa?.proxima_etapa_id ?? null);
const isFinal = computed(() => props.etapa?.tipo === "final");

const etapasOptions = computed(() =>
  (props.etapas ?? []).filter((e) => String(e.id) !== String(props.etapa?.id)),
);

function save() {
  emit("update", {
    titulo: titulo.value,
    descricao: descricao.value,
    ...(isFinal.value ? {} : { proxima_etapa_id: proxima.value }),
  });
  emit("save");
}
</script>

<template>
  <v-text-field v-model="titulo" label="Título" />
  <v-textarea v-model="descricao" :label="isFinal ? 'Mensagem de encerramento' : 'Mensagem enviada'" rows="3" auto-grow />
  <v-select
    v-if="!isFinal"
    v-model="proxima"
    label="Depois do pagamento, vai para"
    :items="etapasOptions"
    item-title="titulo"
    item-value="id"
    clearable
  />
  <v-btn color="primary" variant="flat" block @click="save">Salvar etapa</v-btn>
</template>
