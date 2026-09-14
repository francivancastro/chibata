<script setup>
import { ref, watch, onMounted } from "vue";
import http from "@/plugins/axios";
import { list2Tree } from "@/utils/tree";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);

const permissoes = ref([]);
const selected = ref([]);

function normalize(value) {
  if (!Array.isArray(value)) return [];
  return value.map(v => (typeof v === "object" ? v.id : v));
}

watch(
  () => props.modelValue,
  (value) => {
    selected.value = normalize(value || []);
  },
  { immediate: true }
);

watch(
  selected,
  (value) => {
    if (JSON.stringify(value) !== JSON.stringify(props.modelValue)) {
      emit("update:modelValue", [...value]);
    }
  },
  { deep: false }
);

onMounted(async () => {
  const response = await http.post("/regra/list");
  permissoes.value = list2Tree(response?.data?.data || []);
});

function toggle(id, checked) {
  const set = new Set(selected.value);
  if (checked) set.add(id);
  else set.delete(id);
  selected.value = [...set];
}

function isChecked(id) {
  return selected.value.includes(id);
}
</script>

<template>
  <v-row v-for="grupo in permissoes" :key="grupo.id">
    <v-col cols="12">
      <div class="font-weight-bold mb-2">
        {{ grupo.description }}
      </div>

      <v-row>
        <v-col
          v-for="perm in grupo.children || []"
          :key="perm.id"
          cols="12"
          sm="4"
        >
          <v-checkbox
            :model-value="isChecked(perm.id)"
            @update:model-value="val => toggle(perm.id, val)"
            :label="perm.description"
            hide-details
          />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>