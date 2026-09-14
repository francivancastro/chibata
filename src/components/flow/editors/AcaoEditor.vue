<script setup>
import { ref, computed } from "vue";

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

const actions = [
  {
    label: "Criar pedido",
    value: "create_order",
  },
  {
    label: "Adicionar Order Bump",
    value: "add_order_bump",
  },
  {
    label: "Adicionar Upsell",
    value: "add_upsell",
  },
  {
    label: "Adicionar Downsell",
    value: "add_downsell",
  },
  {
    label: "Criar pagamento",
    value: "create_payment",
  },
];

const acaoSelecionada = ref(null);
const ordem = ref(props.etapa?.ordem || "");
const proxima = ref(props.etapa?.proxima_etapa_id ?? null);

const etapasOptions = computed(() => {
  return (props.etapas ?? []).filter((e) => String(e.id) !== String(props.etapa?.id));
});

function getPayload() {
  try {
    return JSON.parse(props.etapa?.payload || "{}");
  } catch {
    return {};
  }
}

function save() {
  emit("update", {
    ordem: ordem.value,
    proxima_etapa_id: proxima.value,
    payload: JSON.stringify(
      {
        ...getPayload(),
        action: acaoSelecionada.value,
      },
      null,
      2,
    ),
  });

  emit("save");
}

acaoSelecionada.value = getPayload().action ?? null;
</script>

<template>
  <v-select
    label="Ação"
    :items="actions"
    item-title="label"
    item-value="value"
    v-model="acaoSelecionada"
    clearable
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
