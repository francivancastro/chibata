<script setup>
import { Handle, Position } from "@vue-flow/core";

defineProps({
  data: Object,
});
</script>

<template>
  <div class="node">
    <Handle type="target" :position="Position.Top" />

    <div class="header">
      
      {{ data.etapa.tipo }}
      
    </div>

    <div class="title">
      
      {{ data.etapa.titulo }}
      
    </div>

    <div class="description">
      
      {{ data.etapa.descricao }}
      
    </div>

    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<style scoped>
.node {
  width: 220px;

  background: white;

  border-radius: 12px;

  box-shadow: 0 3px 15px #0002;

  overflow: hidden;

  border: 2px solid #ddd;
}

.header {
  padding: 8px;

  font-size: 12px;

  font-weight: bold;

  text-transform: uppercase;

  background: #eee;
}

.title {
  padding: 12px 10px 5px;

  font-weight: bold;
}

.description {
  padding: 0 10px 15px;

  font-size: 13px;

  color: #666;
}
</style>
