<script setup>
import FunilNode from "../FunilNode.vue";

defineProps({
  data: { type: Object, required: true },
});
</script>

<template>
  <FunilNode :data="data" />
</template>
