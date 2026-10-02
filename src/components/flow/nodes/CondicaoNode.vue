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

    <div class="header">Condição</div>

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
.condition { width: 220px; overflow: hidden; border: 1px solid var(--cc-border); border-radius: 14px; background: var(--cc-surface); box-shadow: 0 12px 28px rgba(0,0,0,.18); }

.header { padding: 9px 12px; color: var(--cc-on-accent); background: var(--cc-accent); font-size: 10px; font-weight: 750; letter-spacing: .12em; text-transform: uppercase; }

.title { padding: 15px 12px; color: var(--cc-text); font-weight: 700; }

.buttons {
  display: flex;
}

.option { flex: 1; padding: 9px; color: var(--cc-on-accent); text-align: center; font-size: 10px; font-weight: 750; letter-spacing: .08em; }

.sim { background: var(--cc-success); }

.nao { background: var(--cc-danger); }
</style>
