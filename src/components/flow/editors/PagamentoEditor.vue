<script setup>
import { ref, computed } from "vue";
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

const environmentOptions = [
  { title: "Production", value: "production" },
  { title: "Sandbox", value: "sandbox" },
];

const contextOptions = [
  { title: "Pedido principal", value: "main_order" },
  { title: "Upsell", value: "upsell" },
  { title: "Downsell", value: "downsell" },
];

function getPayload() {
  try {
    return typeof props.etapa?.payload === "string"
      ? JSON.parse(props.etapa.payload || "{}")
      : (props.etapa?.payload ?? {});
  } catch {
    return {};
  }
}

const initialPayload = getPayload();

const titulo = ref(props.etapa?.titulo || "");
const descricao = ref(props.etapa?.descricao || "");
const ordem = ref(props.etapa?.ordem || "");
const proxima = ref(props.etapa?.proxima_etapa_id ?? null);
const fallback = ref(props.etapa?.fallback_etapa_id ?? null);

const gatewayCode = ref(initialPayload.gateway_code ?? null);
const environment = ref(initialPayload.environment ?? "production");
const paymentContext = ref(initialPayload.payment_context ?? "main_order");

const etapasOptions = computed(() => {
  return (props.etapas ?? []).filter(
    (e) => String(e.id) !== String(props.etapa?.id),
  );
});

function save() {
  emit("update", {
    titulo: titulo.value,
    descricao: descricao.value,
    ordem: ordem.value,
    proxima_etapa_id: proxima.value,
    fallback_etapa_id: fallback.value,
    payload: JSON.stringify(
      {
        ...getPayload(),
        gateway_code: gatewayCode.value,
        environment: environment.value,
        payment_context: paymentContext.value,
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

  <v-text-field label="Gateway" v-model="gatewayCode" />

  <v-select
    label="Ambiente"
    :items="environmentOptions"
    item-title="title"
    item-value="value"
    v-model="environment"
  />

  <v-select
    label="Contexto do pagamento"
    :items="contextOptions"
    item-title="title"
    item-value="value"
    v-model="paymentContext"
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

  <v-select
    label="Etapa de fallback"
    :items="etapasOptions"
    item-title="titulo"
    item-value="id"
    v-model="fallback"
    clearable
  />

  <v-btn color="primary" block @click="save"> Salvar </v-btn>
</template>
