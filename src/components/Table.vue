<template>
  <v-card flat>
    <v-data-table
      :headers="tableHeaders"
      :items="items"
      :loading="isLoading"
      :height="tableHeight"
      fixed-header
      :search="busca"
      :server-items-length="totalItens"
      :items-per-page="perPage"
      :page="options.page"
      @update:page="options.page = $event"
      @update:items-per-page="options.itemsPerPage = $event"
      @click:row="(_, { item }) => showDialog(item)"
      disable-sort
    >
      <template #top>
        <v-toolbar flat color="surface" density="compact">
          <v-toolbar-title>{{ routeName }}</v-toolbar-title>

          <v-spacer />

          <v-text-field
            v-model="busca"
            placeholder="Busca"
            clearable
            density="compact"
            hide-details
          ><template #prepend-inner><PhMagnifyingGlass :size="17" weight="regular" aria-hidden="true" /></template></v-text-field>

          <slot name="toolbar" />

          <v-btn v-permission="'add'" color="primary" @click="showDialog()">
            <PhPlus :size="17" weight="regular" aria-hidden="true" />
            Novo
          </v-btn>
        </v-toolbar>
      </template>

      <template #item.status="{ item }">
        <v-chip
          v-if="statusMap[item.status]"
          :color="statusMap[item.status].color"
          label
          variant="outlined"
        >
          {{ statusMap[item.status].label }}
        </v-chip>
      </template>

      <template
        v-for="header in formattedHeaders"
        :key="header.value"
        v-slot:[`item.${header.key}`]="{ value }"
      >
        {{ header.formatter(value) }}
      </template>
    </v-data-table>

    <component
      :is="dialog"
      v-if="dialogState"
      :dialogState="dialogState"
      :propItem="selectedItem"
      :type="type"
      @close-dialog="closeDialog"
    />
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import http from "@/plugins/axios";
import { PhMagnifyingGlass, PhPlus } from "@phosphor-icons/vue";

const props = defineProps({
  type: String,
  tableHeaders: Array,
  dialog: Object,
  filtros: Object,
});

const store = useStore();
const route = useRoute();

const items = ref([]);
const dialogState = ref(false);
const selectedItem = ref(null);
const isLoading = ref(false);
const perPage = ref(window.innerHeight > 800 ? 15 : 10);
const totalItens = ref(0);
const options = ref({ page: 1, itemsPerPage: perPage.value });
const busca = ref("");
const abortController = ref(null);
const statusMap = ref([]);

const possuiFlag = ["usuario", "grupo"];

const routeName = computed(() => route.name);

const formattedHeaders = computed(() =>
  props.tableHeaders.filter((h) => h.formatter),
);

function abortPrevious() {
  if (abortController.value) {
    abortController.value.abort();
  }
  abortController.value = new AbortController();
}

async function getData() {
  isLoading.value = true;

  abortPrevious();

  try {
    const response = await http.post(`/${props.type}/list`, {
      pageSize: options.value.itemsPerPage,
      currentPage: options.value.page,
      signal: abortController.value.signal,
    });

    items.value = response.data.data.list;
    totalItens.value = response.data.data.total;

    if (possuiFlag.includes(props.type)) {
      const data = await http.post(`/parametro/getValue`, {
        key: [`${props.type}StatusMap`],
      });

      statusMap.value = data.data.data[0].value;
    }
  } catch (err) {
    console.log(err);
  }

  isLoading.value = false;
}

watch([options, busca, () => props.filtros], getData, { deep: true });

function showDialog(e) {
  const perms = store.getters["auth/getPermissions"]?.[props.type] || [];

  if (e?.id && !perms.includes("detail")) return;

  selectedItem.value = e || null;
  dialogState.value = true;
}

function closeDialog() {
  dialogState.value = false;
  getData();
}

onMounted(getData);
</script>
