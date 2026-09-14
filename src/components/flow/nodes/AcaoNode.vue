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
  background: #ff9800;

  color: white;
}
</style>
