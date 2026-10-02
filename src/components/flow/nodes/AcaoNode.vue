<script setup>
import FunilNode from "../FunilNode.vue";

defineProps({
  data: Object,
});
</script>

<template>
  <FunilNode :data="data" />
</template>

<style scoped>
:deep(.header) {
  background: var(--cc-warning);

  color: var(--cc-on-accent);
}
</style>
