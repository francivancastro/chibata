<script setup>
import FunilNode from "../FunilNode.vue";

defineProps({
  data: Object,
});
</script>

<template>
  <div class="wrapper">
    <FunilNode :data="data" />
  </div>
</template>

<style scoped>
.wrapper :deep(.header) {
  background: var(--cc-accent);

  color: var(--cc-on-accent);
}
</style>
