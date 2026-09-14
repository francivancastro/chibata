<script setup>
import { Handle, Position } from "@vue-flow/core";

defineProps({
  data: Object,
});
</script>

<template>
  <div class="final">
    <Handle type="target" :position="Position.Top" />

    <div>🏁 Final</div>

    <strong>
      {{ data.etapa.titulo }}
    </strong>
  </div>
</template>

<style scoped>
.final {
  width: 220px;

  padding: 20px;

  text-align: center;

  background: #607d8b;

  color: white;

  border-radius: 50px;

  box-shadow: 0 3px 15px #0003;
}

strong {
  display: block;

  margin-top: 10px;
}
</style>
