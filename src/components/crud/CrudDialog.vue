<script setup>
import { ref, watch, computed } from "vue";
import http from "@/plugins/axios";
import { useCrud } from "@/composables/useCrud";

const props = defineProps({
  config: Object,
  item: Object,
  relations: Object,
});

const emit = defineEmits(["close"]);

const { create, update, remove } = useCrud(props.config.type);

const form = ref(null);
const loading = ref(false);
const internalDialog = ref(true);
const model = ref({});
const jsonCache = ref({});

const isNew = computed(() => !props.item);

function normalizeSwitchValue(value) {
  if (value === true || value === false) return value;

  if (value === 1 || value === "1") return true;
  if (value === 0 || value === "0") return false;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["1", "true", "sim", "s", "ativo", "on"].includes(normalized)) {
      return true;
    }

    if (["0", "false", "nao", "não", "n", "inativo", "off"].includes(normalized)) {
      return false;
    }
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

    if (field.type === "select" && field.source) {
      delete copy[field.source];
    }

    if (field.type === "enum" && typeof value === "object" && value) {
      copy[key] = value.value ?? value.key;
    }
  }

  return copy;
}

function normalizeForSave(model) {
  const copy = { ...model };

  for (const field of props.config.fields) {
    if (field.type === "switch") {
      copy[field.key] = normalizeSwitchValue(copy[field.key]);
    }

    if (field.type !== "select" || !field.source) continue;

    if (
      copy[field.key] == null &&
      typeof copy[field.source] === "object" &&
      copy[field.source]
    ) {
      copy[field.key] = copy[field.source].id;
    }

    delete copy[field.source];
  }

  return copy;
}

function setJsonCache(key, value) {
  jsonCache.value[key] = value;

  try {
    model.value[key] = JSON.parse(value);
  } catch {}
}

async function init() {
  if (!props.item) {
    model.value = props.config.defaultModel ? props.config.defaultModel() : {};

    jsonCache.value = {};

    for (const field of props.config.fields) {
      if (field.type === "json") {
        jsonCache.value[field.key] = JSON.stringify(
          model.value[field.key] ?? {},
          null,
          2,
        );
      }
    }

    internalDialog.value = true;
    return;
  }

  let base = props.item;

  if (props.config.fetchDetail) {
    base = await props.config.fetchDetail(http, props.item);
  }

  const defaults = props.config.defaultModel?.() || {};

  model.value = {
    ...defaults,
    ...normalize(base),
  };

  jsonCache.value = {};

  for (const field of props.config.fields) {
    if (field.type === "json") {
      jsonCache.value[field.key] = JSON.stringify(
        model.value[field.key] ?? {},
        null,
        2,
      );
    }
  }

  internalDialog.value = true;
}

watch(() => props.item, init, { immediate: true });

watch(
  () => internalDialog.value,
  (v) => {
    if (!v) emit("close");
  },
);

async function save() {
  const result = await form.value?.validate();
  if (!result?.valid) return;

  loading.value = true;

  try {
    const preparedModel = normalizeForSave(model.value);
    const payload = props.config.transformSave
      ? props.config.transformSave(preparedModel)
      : preparedModel;

    if (props.item) {
      await update(payload);
    } else {
      await create(payload);
    }

    internalDialog.value = false;
  } finally {
    loading.value = false;
  }
}

async function del() {
  loading.value = true;

  try {
    await remove(props.item.id);
    internalDialog.value = false;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-dialog v-model="internalDialog" max-width="700">
    <v-card>
      <v-card-title>{{ config.title }}</v-card-title>

      <v-card-text>
        <v-form ref="form">
          <div v-for="field in config.fields" :key="field.key">
            <component
              v-if="field.component"
              :is="field.component"
              :model-value="model[field.key]"
              :field="field"
              :model="model"
              :relations="relations"
              @update:model-value="model[field.key] = $event"
            />

            <v-textarea
              v-else-if="field.type === 'json'"
              v-model="jsonCache[field.key]"
              :label="field.label"
              rows="8"
              auto-grow
              @update:model-value="setJsonCache(field.key, $event)"
            />

            <v-textarea
              v-else-if="field.type === 'textarea'"
              v-model="model[field.key]"
              :label="field.label"
              density="compact"
            />

            <v-text-field
              v-else-if="field.type === 'text'"
              v-model="model[field.key]"
              :label="field.label"
              density="compact"
            />

            <v-text-field
              v-else-if="field.type === 'password'"
              v-model="model[field.key]"
              type="password"
              :label="field.label"
            />

            <v-switch
              v-else-if="field.type === 'switch'"
              v-model="model[field.key]"
              :label="field.label"
              color="primary"
            />

            <v-select
              v-else-if="field.type === 'select'"
              v-model="model[field.key]"
              :items="relations?.[field.key] || []"
              item-title="title"
              item-value="value"
              :label="field.label"
            />

            <v-select
              v-else-if="field.type === 'enum'"
              v-model="model[field.key]"
              :items="relations?.[field.key] || []"
              item-title="title"
              item-value="value"
              :label="field.label"
            />
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn @click="internalDialog = false">Cancelar</v-btn>
        <v-btn v-if="!isNew" color="red" :loading="loading" @click="del"
          >Excluir</v-btn
        >
        <v-btn color="primary" :loading="loading" @click="save">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
