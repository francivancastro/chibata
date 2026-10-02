<script setup>
import { Handle, Position } from "@vue-flow/core";

defineProps({
  data: Object,
});
</script>

<template>
  <div class="node">
    <Handle type="target" :position="Position.Top" />

    <div class="header">{{ data.etapa.tipo }}</div>

    <div class="title">{{ data.etapa.titulo }}</div>

    <div class="description">{{ data.etapa.descricao || "Sem descrição" }}</div>

    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<style scoped>
.node { width: 220px; overflow: hidden; border: 1px solid var(--cc-border); border-radius: 14px; background: var(--cc-surface); box-shadow: 0 12px 28px rgba(0,0,0,.18); }

.header { padding: 9px 12px; color: var(--cc-accent-strong); background: var(--cc-raised); font-size: 10px; font-weight: 750; letter-spacing: .12em; text-transform: uppercase; }

.title { padding: 14px 12px 5px; color: var(--cc-text); font-weight: 700; }

.description { padding: 0 12px 16px; color: var(--cc-muted); font-size: 12px; line-height: 1.45; }
</style>
