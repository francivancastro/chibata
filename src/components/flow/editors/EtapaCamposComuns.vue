<script setup>
defineProps({
  titulo: {
    type: String,
    default: "",
  },
  descricao: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:titulo", "update:descricao"]);
</script>

<template>
  <v-text-field
    label="Título"
    :model-value="titulo"
    @update:model-value="emit('update:titulo', $event)"
  />

  <v-textarea
    label="Descrição"
    :model-value="descricao"
    @update:model-value="emit('update:descricao', $event)"
  />
</template>
