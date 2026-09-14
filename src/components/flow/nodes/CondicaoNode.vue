<script setup>
import { Handle, Position } from "@vue-flow/core";

defineProps({
  data: Object,
});

function options() {
  try {
    return JSON.parse(data.etapa.payload)?.opcoes || {};
  } catch (e) {
    return {};
  }
}
</script>

<template>
  <div class="condition">
    <Handle type="target" :position="Position.Top" />

    <div class="header">❓ Condição</div>

    <div class="title">
      {{ data.etapa.titulo }}
    </div>

    <div class="buttons">
      <div class="option sim">SIM</div>

      <div class="option nao">NÃO</div>
    </div>

    <Handle id="sim" type="source" :position="Position.Bottom" />
  </div>
</template>

<style scoped>
.condition {
  width: 220px;

  background: white;

  border-radius: 12px;

  box-shadow: 0 3px 15px #0002;

  overflow: hidden;
}

.header {
  background: #e91e63;

  color: white;

  padding: 8px;

  font-weight: bold;
}

.title {
  padding: 15px;

  font-weight: bold;
}

.buttons {
  display: flex;
}

.option {
  flex: 1;

  padding: 8px;

  text-align: center;

  font-size: 12px;
}

.sim {
  background: #4caf50;

  color: white;
}

.nao {
  background: #f44336;

  color: white;
}
</style>
