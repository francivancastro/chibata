<script setup>
import { ref, onMounted, computed } from "vue";
import { useCrud } from "@/composables/useCrud";

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

const produtos = ref([]);
const produtoSelecionado = ref(null);
const titulo = ref(props.etapa?.titulo || "");
const ordem = ref(props.etapa?.ordem || "");
const origem = ref(props.etapa?.origem || "principal");
const proxima = ref(props.etapa?.proxima_etapa_id ?? null);

const etapasOptions = computed(() => {
  return (props.etapas ?? []).filter((e) => String(e.id) !== String(props.etapa?.id));
});

const origemOptions = [
  { title: "Principal", value: "principal" },
  { title: "Upsell", value: "upsell" },
  { title: "Downsell", value: "downsell" },
  { title: "Order bump", value: "order_bump" },
];

const { list } = useCrud("produto");

async function load() {
  try {
    const response = await list({
      pageSize: 0,
    });

    produtos.value = response.data?.data?.list ?? [];

    const payload = getPayload();
    produtoSelecionado.value = payload?.produto_id ? String(payload.produto_id) : null;
    origem.value = payload?.origem ?? props.etapa?.origem ?? "principal";
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    produtos.value = [];
  }
}

function getPayload() {
  try {
    return JSON.parse(props.etapa?.payload || "{}");
  } catch {
    return {};
  }
}

function save() {
  emit("update", {
    titulo: titulo.value,
    ordem: ordem.value,
    produto_id: produtoSelecionado.value,
    origem: origem.value,
    proxima_etapa_id: proxima.value,
    payload: JSON.stringify(
      {
        ...getPayload(),
        produto_id: produtoSelecionado.value,
        origem: origem.value,
      },
      null,
      2,
    ),
  });

  emit("save");
}

onMounted(load);
</script>

<template>
  <v-select
    label="Produto"
    :items="produtos"
    item-title="nome"
    item-value="id"
    v-model="produtoSelecionado"
    clearable
  />

  <v-select
    label="Origem"
    :items="origemOptions"
    item-title="title"
    item-value="value"
    v-model="origem"
    clearable
  />

  <v-text-field label="Título" v-model="titulo" />

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
