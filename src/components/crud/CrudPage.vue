<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useCrud } from "@/composables/useCrud";
import { useCrudRelations } from "@/composables/useCrudRelations";
import { errorMessage } from "@/plugins/axios";

import CrudTable from "./CrudTable.vue";
import CrudDialog from "./CrudDialog.vue";

const props = defineProps({
  config: { type: Object, required: true },
});

const { list } = useCrud(props.config.type);
const { relations, statusMap, loadRelations } = useCrudRelations(props.config);

const items = ref([]);
const total = ref(0);
const page = ref(1);
const itemsPerPage = ref(25);
const search = ref("");
const loading = ref(false);
const loadError = ref("");

const dialog = ref(false);
const selected = ref(null);

// Paginação e busca agora vão para o servidor (A3). Antes só os 10 primeiros
// registros chegavam e a busca procurava só neles.
// O nome do campo de busca pode variar por backend: config.searchKey (padrão "search").
const searchKey = props.config.searchKey || "search";

let requestId = 0;
let searchTimer = null;

function normalizeList(rows) {
  return rows.map((item) => {
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
  const current = ++requestId;
  loading.value = true;
  loadError.value = "";

  const payload = { pageSize: itemsPerPage.value, currentPage: page.value };
  const term = search.value?.trim();
  if (term) payload[searchKey] = term;

  try {
    const { data } = await list(payload);
    if (current !== requestId) return;

    const rows = data?.data?.list;
    if (!Array.isArray(rows)) throw new Error("Resposta inesperada do servidor.");

    items.value = normalizeList(rows);
    total.value = Number(data.data.total ?? rows.length);
  } catch (err) {
    if (current !== requestId) return;
    items.value = [];
    total.value = 0;
    loadError.value = errorMessage(err, "Não foi possível carregar os registros.");
  } finally {
    if (current === requestId) loading.value = false;
  }
}

function onOptions({ page: nextPage, itemsPerPage: perPage }) {
  const changed = nextPage !== page.value || perPage !== itemsPerPage.value;
  page.value = nextPage;
  itemsPerPage.value = perPage;
  if (changed) load();
}

watch(search, () => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    page.value = 1;
    load();
  }, 350);
});

function open(item) {
  selected.value = item;
  dialog.value = true;
}

function close({ changed } = {}) {
  dialog.value = false;
  if (changed) load();
}

onMounted(async () => {
  try {
    await loadRelations();
  } catch {
    /* A lista tem o próprio estado de erro. */
  }
  await load();
});

onBeforeUnmount(() => window.clearTimeout(searchTimer));
</script>

<template>
  <CrudTable
    v-model:search="search"
    :config="config"
    :items="items"
    :total="total"
    :page="page"
    :items-per-page="itemsPerPage"
    :loading="loading"
    :status-map="statusMap"
    :error="loadError"
    @options="onOptions"
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
