<script setup>
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";
import { notify } from "@kyvg/vue3-notification";
import http, { errorMessage } from "@/plugins/axios";
import { useCrud } from "@/composables/useCrud";

const props = defineProps({
  config: { type: Object, required: true },
  item: { type: Object, default: null },
  relations: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["close"]);

const store = useStore();
const { create, update, remove } = useCrud(props.config.type);

const form = ref(null);
const saving = ref(false);
const deleting = ref(false);
const internalDialog = ref(true);
const confirmDelete = ref(false);
const model = ref({});
const jsonCache = ref({});
const jsonErrors = ref({});
const errorText = ref("");
const loadingDetail = ref(false);
let changed = false;

const isNew = computed(() => !props.item);
const canSave = computed(() => store.getters["auth/can"](props.config.type, isNew.value ? "add" : "update"));
const canRemove = computed(() => !isNew.value && store.getters["auth/can"](props.config.type, "remove"));
const readonly = computed(() => !canSave.value);
const hasJsonErrors = computed(() => Object.values(jsonErrors.value).some(Boolean));
const recordName = computed(() => model.value?.nome || model.value?.name || props.item?.nome || props.item?.name || "este registro");
const title = computed(() => {
  if (isNew.value) return `Novo registro · ${props.config.title}`;
  return readonly.value ? recordName.value : `Editar ${recordName.value}`;
});

const required = (v) => (v !== null && v !== undefined && String(v).trim() !== "") || "Campo obrigatório";
function rulesFor(field) {
  return field.required ? [required] : [];
}

function normalizeSwitchValue(value) {
  if (value === true || value === false) return value;
  if (value === 1 || value === "1") return true;
  if (value === 0 || value === "0") return false;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "sim", "s", "ativo", "on"].includes(normalized)) return true;
    if (["false", "nao", "não", "n", "inativo", "off"].includes(normalized)) return false;
  }

  return Boolean(value);
}

function normalize(item) {
  const copy = { ...item };

  for (const field of props.config.fields) {
    const key = field.key;
    const value = copy[key];

    if (field.type === "switch") {
      copy[key] = normalizeSwitchValue(value);
    } else if (field.type === "select" && typeof value === "object" && value) {
      copy[key] = value.id;
    } else if (
      field.type === "select" &&
      field.source &&
      copy[key] == null &&
      typeof copy[field.source] === "object" &&
      copy[field.source]
    ) {
      copy[key] = copy[field.source].id;
    }

    if (field.type === "select" && field.source) delete copy[field.source];

    if (field.type === "enum" && typeof value === "object" && value) {
      copy[key] = value.value ?? value.key;
    }
  }

  return copy;
}

function normalizeForSave(source) {
  const copy = { ...source };

  for (const field of props.config.fields) {
    if (field.type === "switch") copy[field.key] = normalizeSwitchValue(copy[field.key]);
    if (field.type !== "select" || !field.source) continue;

    if (copy[field.key] == null && typeof copy[field.source] === "object" && copy[field.source]) {
      copy[field.key] = copy[field.source].id;
    }
    delete copy[field.source];
  }

  return copy;
}

// JSON inválido não é mais descartado em silêncio (M4): o campo mostra o erro
// e o botão Salvar fica bloqueado até corrigir.
function setJson(key, value) {
  jsonCache.value[key] = value;
  try {
    model.value[key] = value?.trim() ? JSON.parse(value) : {};
    jsonErrors.value[key] = "";
  } catch (err) {
    jsonErrors.value[key] = `JSON inválido: ${err.message.replace(/^JSON\.parse: /, "")}`;
  }
}

function fillJsonCache() {
  jsonCache.value = {};
  jsonErrors.value = {};
  for (const field of props.config.fields) {
    if (field.type === "json") {
      jsonCache.value[field.key] = JSON.stringify(model.value[field.key] ?? {}, null, 2);
    }
  }
}

async function init() {
  errorText.value = "";

  if (!props.item) {
    model.value = props.config.defaultModel ? props.config.defaultModel() : {};
    fillJsonCache();
    return;
  }

  let base = props.item;
  if (props.config.fetchDetail) {
    loadingDetail.value = true;
    try {
      base = await props.config.fetchDetail(http, props.item);
    } catch (err) {
      errorText.value = errorMessage(err, "Não foi possível carregar todos os detalhes deste registro.");
    } finally {
      loadingDetail.value = false;
    }
  }

  model.value = { ...(props.config.defaultModel?.() || {}), ...normalize(base) };
  fillJsonCache();
}

watch(() => props.item, init, { immediate: true });

watch(internalDialog, (open) => {
  if (!open) emit("close", { changed });
});

async function save() {
  if (readonly.value || hasJsonErrors.value) return;

  const result = await form.value?.validate();
  if (!result?.valid) return;

  saving.value = true;
  errorText.value = "";

  try {
    const prepared = normalizeForSave(model.value);
    const payload = props.config.transformSave ? props.config.transformSave(prepared) : prepared;

    if (props.item) await update(payload);
    else await create(payload);

    changed = true;
    notify({ type: "success", title: isNew.value ? "Registro criado" : "Alterações salvas", text: recordName.value !== "este registro" ? recordName.value : "" });
    internalDialog.value = false;
  } catch (err) {
    // A2: o diálogo continua aberto e mostra o motivo; nada é perdido.
    errorText.value = errorMessage(err, "O servidor não salvou as alterações.");
  } finally {
    saving.value = false;
  }
}

async function del() {
  deleting.value = true;
  errorText.value = "";

  try {
    await remove(props.item.id);
    changed = true;
    confirmDelete.value = false;
    notify({ type: "success", title: "Registro excluído", text: recordName.value });
    internalDialog.value = false;
  } catch (err) {
    confirmDelete.value = false;
    errorText.value = errorMessage(err, "O servidor não excluiu o registro.");
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <v-dialog v-model="internalDialog" max-width="680" scrollable>
    <v-card>
      <v-card-title>{{ title }}</v-card-title>

      <v-card-text>
        <v-alert v-if="errorText" class="mb-4" type="error" variant="tonal" role="alert">
          <strong>Nada foi salvo.</strong> {{ errorText }}
        </v-alert>

        <v-progress-linear v-if="loadingDetail" indeterminate color="primary" class="mb-4" />

        <v-form ref="form" :readonly="readonly" @submit.prevent="save">
          <div v-for="field in config.fields" :key="field.key" class="crud-field">
            <component
              :is="field.component"
              v-if="field.component"
              :model-value="model[field.key]"
              :field="field"
              :model="model"
              :relations="relations"
              :readonly="readonly"
              @update:model-value="model[field.key] = $event"
            />

            <v-textarea
              v-else-if="field.type === 'json'"
              :model-value="jsonCache[field.key]"
              :label="field.label"
              rows="6"
              auto-grow
              class="crud-json"
              :error-messages="jsonErrors[field.key] || []"
              @update:model-value="setJson(field.key, $event)"
            />

            <v-textarea
              v-else-if="field.type === 'textarea'"
              v-model="model[field.key]"
              :label="field.label"
              :rules="rulesFor(field)"
              rows="3"
              auto-grow
            />

            <v-text-field
              v-else-if="field.type === 'text'"
              v-model="model[field.key]"
              :label="field.required ? `${field.label} *` : field.label"
              :rules="rulesFor(field)"
            />

            <v-text-field
              v-else-if="field.type === 'password'"
              v-model="model[field.key]"
              type="password"
              autocomplete="new-password"
              :label="field.label"
              :rules="rulesFor(field)"
            />

            <v-switch
              v-else-if="field.type === 'switch'"
              v-model="model[field.key]"
              :label="field.label"
              color="primary"
              inset
              hide-details
              class="mb-4"
            />

            <v-select
              v-else-if="field.type === 'select' || field.type === 'enum'"
              v-model="model[field.key]"
              :items="relations?.[field.key] || []"
              item-title="title"
              item-value="value"
              :label="field.required ? `${field.label} *` : field.label"
              :rules="rulesFor(field)"
            />
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-btn v-if="canRemove" variant="outlined" class="btn-danger" :disabled="saving" @click="confirmDelete = true">Excluir…</v-btn>
        <v-spacer />
        <v-btn variant="text" @click="internalDialog = false">{{ readonly ? "Fechar" : "Cancelar" }}</v-btn>
        <v-btn
          v-if="!readonly"
          color="primary"
          variant="flat"
          :loading="saving"
          :disabled="hasJsonErrors || loadingDetail"
          @click="save"
        >
          Salvar
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="confirmDelete" max-width="420">
      <v-card role="alertdialog">
        <v-card-title>Excluir “{{ recordName }}”?</v-card-title>
        <v-card-text>Essa ação não pode ser desfeita.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmDelete = false">Cancelar</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="del">Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<style scoped>
.crud-field + .crud-field { margin-top: 4px; }
.crud-json :deep(textarea) { font-family: var(--ch-mono); font-size: 13px; line-height: 1.6; }
</style>
