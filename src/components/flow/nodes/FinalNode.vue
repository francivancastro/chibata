<script setup>
import { Handle, Position } from "@vue-flow/core";

defineProps({
  data: Object,
});
</script>

<template>
  <div class="final">
    <Handle type="target" :position="Position.Top" />

    <div class="final-label">Final</div>

    <strong>
      {{ data.etapa.titulo }}
    </strong>
  </div>
</template>

<style scoped>
.final { width: 220px; padding: 20px; border: 1px solid var(--cc-border-strong); border-radius: 18px; color: var(--cc-text); text-align: center; background: var(--cc-raised); box-shadow: 0 12px 28px rgba(0,0,0,.18); }

.final-label { color: var(--cc-accent); font-size: 10px; font-weight: 750; letter-spacing: .12em; text-transform: uppercase; }

strong {
  display: block;
  margin-top: 10px;
}
</style>
