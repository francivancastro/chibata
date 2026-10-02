<script setup>
import { ref, watch, onMounted } from "vue";
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
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);

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

  const { data } = await list({
    pageSize: pageSize.value,
    currentPage: page.value,
  });

  items.value = normalizeList(data.data.list);
  total.value = data.data.total ?? 0;
  loading.value = false;
}

function onUpdatePage(value) {
  page.value = value;
}

function onUpdatePageSize(value) {
  pageSize.value = value;
  page.value = 1;
}

watch([page, pageSize], load);

function open(item) {
  selected.value = item;
  dialog.value = true;
}

function close() {
  dialog.value = false;
  load();
}

onMounted(async () => {
  await loadRelations();
  await load();
});
</script>

<template>
  <CrudTable
    :config="config"
    :items="items"
    :loading="loading"
    :status-map="statusMap"
    :total="total"
    :page="page"
    :page-size="pageSize"
    @open="open"
    @update:page="onUpdatePage"
    @update:page-size="onUpdatePageSize"
  />

  <CrudDialog
    v-if="dialog"
    :config="config"
    :item="selected"
    :relations="relations"
    @close="close"
  />
</template>