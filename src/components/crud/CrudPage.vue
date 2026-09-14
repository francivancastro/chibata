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
    pageSize: 10,
    currentPage: 1,
  });

  items.value = normalizeList(data.data.list);
  loading.value = false;
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