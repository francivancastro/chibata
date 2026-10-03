<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { PhArrowClockwise, PhMagnifyingGlass, PhPlus, PhTreeStructure, PhTray, PhWarningCircle } from "@phosphor-icons/vue";

const props = defineProps({
  config: { type: Object, required: true },
  items: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  page: { type: Number, default: 1 },
  itemsPerPage: { type: Number, default: 25 },
  loading: Boolean,
  statusMap: { type: Array, default: () => [] },
  error: { type: String, default: "" },
  search: { type: String, default: "" },
});

const emit = defineEmits(["open", "retry", "options", "update:search"]);

const router = useRouter();
const store = useStore();

const subtitle = computed(() => ({
  bot: "Cada bot é uma conta do Telegram que responde pelos seus funis.",
  funil: "As jornadas que levam o contato da primeira mensagem ao pedido.",
  produto: "O catálogo que os funis oferecem.",
  usuario: "Quem da equipe acessa o workspace.",
  grupo: "O que cada grupo pode ver e alterar.",
  parametro: "Valores usados pelo sistema.",
}[props.config.type] || ""));

const canAdd = computed(() => store.getters["auth/can"](props.config.type, "add"));
const canEdit = computed(() => store.getters["auth/can"](props.config.type, "update"));

const headers = computed(() => {
  const base = props.config.headers.filter((h) => h.key !== "actions");
  return [...base, { title: "", key: "__open", sortable: false, align: "end", width: 1 }];
});

const searchModel = computed({
  get: () => props.search,
  set: (value) => emit("update:search", value ?? ""),
});

const resultLabel = computed(() => {
  if (props.loading && !props.items.length) return "Carregando…";
  if (props.error) return "";
  if (!props.total) return props.search ? "Nenhum resultado" : "Nenhum registro";
  const start = (props.page - 1) * props.itemsPerPage + 1;
  const end = Math.min(props.page * props.itemsPerPage, props.total);
  return `${start}–${end} de ${props.total}${props.search ? ` para “${props.search}”` : ""}`;
});

function goFlow(item) {
  router.push({ name: "funil-editor", params: { id: item.id } });
}

// Status com um visual só: statusMap da API quando existe; senão 1/true = ativo.
function statusOf(value, header) {
  const fromMap = props.statusMap?.find((i) => Number(i.value) === Number(value));
  if (fromMap) {
    const tone = /verde|green|success/i.test(fromMap.color || "") ? "ok" : /red|vermelh|error|danger/i.test(fromMap.color || "") ? "danger" : "off";
    return { label: fromMap.label, tone };
  }
  if (header.formatter) return null;
  if (value === 1 || value === "1" || value === true) return { label: "Ativo", tone: "ok" };
  if (value === 0 || value === "0" || value === false) return { label: "Pausado", tone: "off" };
  return null;
}
</script>

<template>
  <section class="workspace-page">
    <header class="page-heading">
      <div>
        <h1>{{ config.title }}</h1>
        <p v-if="subtitle" class="page-description">{{ subtitle }}</p>
      </div>
      <v-btn v-if="canAdd" color="primary" @click="emit('open', null)">
        <PhPlus :size="18" aria-hidden="true" />Novo registro
      </v-btn>
    </header>

    <div class="panel records-surface">
      <div class="records-toolbar">
        <v-text-field
          v-model="searchModel"
          label="Buscar em todos os registros"
          hide-details
          clearable
          density="compact"
          class="records-search"
        >
          <template #prepend-inner><PhMagnifyingGlass :size="18" aria-hidden="true" /></template>
        </v-text-field>
        <span class="records-count" aria-live="polite">{{ resultLabel }}</span>
        <v-btn variant="text" :loading="loading" @click="emit('retry')">
          <PhArrowClockwise :size="17" aria-hidden="true" />Atualizar
        </v-btn>
      </div>

      <div v-if="error" class="state-block records-error" role="alert">
        <PhWarningCircle :size="30" aria-hidden="true" />
        <h2>Não foi possível carregar os registros</h2>
        <p>{{ error }}</p>
        <v-btn variant="outlined" @click="emit('retry')">Tentar novamente</v-btn>
      </div>

      <v-data-table-server
        v-else
        class="records-table"
        :headers="headers"
        :items="items"
        :items-length="total"
        :page="page"
        :items-per-page="itemsPerPage"
        :items-per-page-options="[10, 25, 50, 100]"
        :loading="loading"
        disable-sort
        @update:options="emit('options', $event)"
        @click:row="(_, row) => emit('open', row.item)"
      >
        <template #no-data>
          <div class="state-block">
            <PhTray :size="32" aria-hidden="true" />
            <h2>{{ search ? "Nada encontrado" : "Nenhum registro ainda" }}</h2>
            <p>{{ search ? "Tente outro termo de busca." : canAdd ? "Crie o primeiro registro para começar." : "Quando houver registros, eles aparecem aqui." }}</p>
          </div>
        </template>

        <template v-for="h in config.headers" :key="h.key" #[`item.${h.key}`]="{ value }">
          <template v-if="h.key === 'status' && statusOf(value, h)">
            <span :class="['status-dot', `status-dot--${statusOf(value, h).tone}`]">{{ statusOf(value, h).label }}</span>
          </template>
          <span v-else-if="h.formatter">{{ h.formatter(value) }}</span>
          <span v-else-if="h.key !== 'actions'">{{ value ?? "—" }}</span>
        </template>

        <template #[`item.__open`]="{ item }">
          <div class="row-actions">
            <v-btn
              v-if="config.actions"
              size="small"
              variant="outlined"
              :aria-label="`Abrir fluxo de ${item.nome || item.name || 'registro'}`"
              @click.stop="goFlow(item)"
            >
              <PhTreeStructure :size="16" aria-hidden="true" />Fluxo
            </v-btn>
            <v-btn size="small" variant="outlined" @click.stop="emit('open', item)">
              {{ canEdit ? "Editar" : "Ver" }}
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </div>
  </section>
</template>

<style scoped>
.records-surface { overflow: hidden; }
.records-toolbar { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--ch-line); }
.records-search { flex: 1 1 280px; max-width: 440px; }
.records-count { margin-left: auto; font-size: 13px; color: var(--ch-muted); font-variant-numeric: tabular-nums; }
.records-error { color: var(--ch-danger); }
.row-actions { display: flex; justify-content: flex-end; gap: 8px; white-space: nowrap; }
.row-actions .v-btn { min-height: 36px; }
.records-table :deep(td:first-child) { font-weight: 600; }
@media (max-width: 600px) {
  .records-toolbar { padding: 12px; }
  .records-search { max-width: none; }
  .records-count { margin-left: 0; }
}
</style>
