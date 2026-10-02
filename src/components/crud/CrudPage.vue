<script setup>
import { ref, onMounted } from "vue";
import { useCrud } from "@/composables/useCrud";
import { useCrudRelations } from "@/composables/useCrudRelations";

import CrudTable from "./CrudTable.vue";
import CrudDialog from "./CrudDialog.vue";

const props = defineProps({
  config: Object,
});

const { list } = useCrud(props.config.type);
const { relations, statusMap, loadRelations } = useCrudRelations(props.config);

const items = ref([]);
const loading = ref(false);
const loadError = ref("");

const dialog = ref(false);
const selected = ref(null);

function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

function normalizeList(list) {
  return list.map((item) => {
    const copy = { ...item };

    for (const field of props.config.fields) {
      const value = copy[field.key];

      if (field.type === "select" && typeof value === "object" && value) {
        copy[field.key] = value.name ?? value.title ?? value.id;
      } else if (
        field.type === "select" &&
        field.source &&
        copy[field.key] == null &&
        typeof copy[field.source] === "object" &&
        copy[field.source]
      ) {
        copy[field.key] = copy[field.source].id;
      }

      if (field.type === "enum" && typeof value === "object" && value) {
        copy[field.key] = value.value ?? value.key;
      }
    }

    return copy;
  });
}

async function load() {
  loading.value = true;
  loadError.value = "";
  try {
    const { data } = await list({ pageSize: 10, currentPage: 1 });
    if (!Array.isArray(data?.data?.list)) throw new Error("Invalid response");
    items.value = normalizeList(data.data.list);
  } catch {
    loadError.value = "Não foi possível carregar os registros. Verifique a conexão e tente novamente.";
  } finally {
    loading.value = false;
  }
}

function open(item) {
  selected.value = item;
  dialog.value = true;
}

function close() {
  dialog.value = false;
  load();
}

onMounted(async () => {
  try { await loadRelations(); } catch { /* The list has its own retry state. */ }
  await load();
});
</script>

<template>
  <CrudTable
    :config="config"
    :items="items"
    :loading="loading"
    :status-map="statusMap"
    :error="loadError"
    @retry="load"
    @open="open"
  />

  <CrudDialog
    v-if="dialog"
    :config="config"
    :item="selected"
    :relations="relations"
    @close="close"
  />
</template>
