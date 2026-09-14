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
  background: #9c27b0;

  color: white;
}
</style>
