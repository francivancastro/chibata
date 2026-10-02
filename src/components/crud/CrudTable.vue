<script setup>
import { useRouter } from "vue-router";
import { ref, computed } from "vue";
import { PhArrowClockwise, PhFolder, PhMagnifyingGlass, PhPlus, PhTreeStructure, PhTray, PhWarningCircle } from "@phosphor-icons/vue";

const props = defineProps({
  config: Object,
  items: Array,
  loading: Boolean,
  statusMap: Array,
  error: { type: String, default: "" },
});

const router = useRouter();

const emit = defineEmits(["open", "retry"]);
const search = ref("");
const subtitle = computed(() => ({
  bot: "Configure seus bots e organize os fluxos de atendimento.",
  funil: "Organize as etapas e conexões da sua automação.",
  produto: "Mantenha seu catálogo e suas ofertas em um só lugar.",
  usuario: "Gerencie os usuários que fazem parte da sua operação.",
  grupo: "Organize os grupos de acesso da sua equipe.",
  parametro: "Ajuste os parâmetros utilizados pelo sistema.",
}[props.config.type] || "Organize, consulte e atualize seus registros."));

function goFlow(item) {
  router.push({
    name: "funil-editor",
    params: {
      id: item.id,
    },
  });
}

function getStatus(value) {
  return props.statusMap?.find((i) => Number(i.value) === Number(value));
}
</script>

<template>
  <section class="workspace-page">
    <header class="page-heading"><div><h1>{{ config.title }}</h1><p class="page-description">{{ subtitle }}</p></div><v-btn color="primary" @click="emit('open', null)"><PhPlus :size="18" weight="regular" aria-hidden="true" />Novo registro</v-btn></header>
    <div class="records-summary"><span class="records-summary-icon"><PhFolder :size="22" weight="regular" aria-hidden="true" /></span><div><span>Registros visíveis</span><strong>{{ loading || error ? 'n/d' : items?.length ?? 0 }}</strong></div><p>{{ config.title }} nesta página</p></div>
    <v-card flat class="records-surface">
    <div class="records-toolbar"><v-text-field v-model="search" label="Buscar registros" hide-details clearable density="compact"><template #prepend-inner><PhMagnifyingGlass :size="18" weight="regular" aria-hidden="true" /></template></v-text-field><v-btn variant="text" :loading="loading" @click="emit('retry')"><PhArrowClockwise :size="17" weight="regular" aria-hidden="true" />Atualizar</v-btn></div>
    <div v-if="error" class="records-error" role="alert">
      <PhWarningCircle :size="30" weight="regular" aria-hidden="true" />
      <strong>Não foi possível carregar os registros</strong>
      <p>{{ error }}</p>
      <v-btn variant="outlined" size="small" @click="emit('retry')">Tentar novamente</v-btn>
    </div>
    <v-data-table
      v-else
      class="records-table"
      :items="items"
      :search="search || ''"
      :loading="loading"
      :headers="config.headers"
      disable-sort
      @click:row="(_, row) => emit('open', row.item)"
    >
      <!-- HEADER -->
      <template #no-data>
        <div class="records-empty"><PhTray :size="34" weight="regular" aria-hidden="true" /><h2>Nenhum registro encontrado</h2><p>{{ search ? 'Experimente outro termo de busca.' : 'Crie seu primeiro registro para começar.' }}</p></div>
      </template>

      <!-- CELULAS -->
      <template
        v-for="h in config.headers"
        :key="h.key"
        v-slot:[`item.${h.key}`]="{ value, item }"
      >
        <!-- AÇÕES -->
        <template v-if="h.key === 'actions'">
          <v-btn
            v-if="config.actions"
            size="small"
            variant="text"
            @click.stop="goFlow(item)"
          ><PhTreeStructure :size="18" weight="regular" aria-hidden="true" /></v-btn>
        </template>

        <!-- STATUS -->
        <v-chip
          v-else-if="h.key === 'status' && getStatus(value)"
          :color="getStatus(value).color"
          size="small"
          variant="outlined"
        >
          {{ getStatus(value).label }}
        </v-chip>

        <!-- FORMATTER -->
        <span v-else-if="h.formatter">
          {{ h.formatter(value) }}
        </span>

        <!-- DEFAULT -->
        <span v-else>
          {{ value }}
        </span>
      </template>
    </v-data-table>
  </v-card>
  </section>
</template>
<style scoped>
.records-summary{display:flex;align-items:center;gap:16px;padding:20px 24px;border:1px solid var(--cc-border);border-radius:16px;background:var(--cc-surface);margin-bottom:24px}.records-summary-icon{display:grid;place-items:center;width:44px;height:44px;border-radius:12px;background:var(--cc-raised);color:var(--cc-accent)}.records-summary span,.records-summary p{font-size:12px;color:var(--cc-muted)}.records-summary strong{display:block;font-size:26px;line-height:1.2;margin-top:4px;font-variant-numeric:tabular-nums}.records-summary p{margin-left:auto}.records-surface{overflow:hidden}.records-toolbar{display:flex;gap:16px;align-items:center;justify-content:space-between;padding:20px;border-bottom:1px solid var(--cc-border)}.records-toolbar .v-input{max-width:460px}.records-toolbar .v-btn,.page-heading .v-btn{gap:8px}.records-error{display:grid;place-content:center;justify-items:center;gap:8px;min-height:236px;padding:32px 24px;color:var(--cc-danger);text-align:center}.records-error strong{color:var(--cc-text);font-size:14px;font-weight:650}.records-error p{max-width:48ch;margin:0;color:var(--cc-muted);font-size:13px;line-height:1.55}.records-error svg{opacity:.92}.records-error .v-btn{margin-top:8px;color:var(--cc-accent);border-color:var(--cc-border-strong)}.records-empty{padding:48px 16px;text-align:center;color:var(--cc-accent)}.records-empty h2{color:var(--cc-text);font-size:18px;margin:16px 0 8px}.records-empty p{font-size:13px;color:var(--cc-muted)}@media(max-width:600px){.records-toolbar{flex-direction:column;align-items:stretch;padding:16px}.records-toolbar .v-input{width:100%}.records-summary{padding:16px}.records-summary p{display:none}}
</style>
