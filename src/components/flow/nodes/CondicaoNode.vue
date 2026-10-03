<script setup>
import { Handle, Position } from "@vue-flow/core";

defineProps({
  data: { type: Object, required: true },
});
</script>

<template>
  <div class="condition" :class="{ 'condition--warn': data.warning }">
    <Handle type="target" :position="Position.Top" />
    <span class="condition-type">Condição<template v-if="data.warning"> · {{ data.warning }}</template></span>
    <strong class="condition-title">{{ data.etapa.titulo || "Sem título" }}</strong>
    <div class="condition-outs" aria-hidden="true">
      <span class="out out--sim">SIM</span>
      <span class="out out--nao">NÃO</span>
    </div>
    <!-- Duas saídas: arrastar de cada uma define o destino de SIM e de NÃO. -->
    <Handle id="sim" type="source" :position="Position.Bottom" :style="{ left: '25%' }" />
    <Handle id="nao" type="source" :position="Position.Bottom" :style="{ left: '75%' }" />
  </div>
</template>

<style scoped>
.condition { width: 220px; box-sizing: border-box; padding: 12px 14px 0; display: flex; flex-direction: column; gap: 3px; border: 1px solid var(--ch-accent); border-radius: 12px; background: var(--ch-accent-soft); color: var(--ch-ink); font-family: var(--ch-font); overflow: hidden; }
.condition-type { font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--ch-accent-hover); }
.condition-title { font-size: 14px; font-weight: 600; line-height: 1.3; }
.condition-outs { display: grid; grid-template-columns: 1fr 1fr; margin: 10px -14px 0; border-top: 1px solid var(--ch-accent-line); }
.out { padding: 6px; text-align: center; font-size: 11px; font-weight: 700; letter-spacing: .06em; }
.out--sim { color: var(--ch-ok); }
.out--nao { color: var(--ch-danger); border-left: 1px solid var(--ch-accent-line); }
.condition--warn { border: 2px solid #D98A1E; }
:global(.vue-flow__node.selected) .condition { box-shadow: 0 0 0 3px var(--ch-accent-line); }
</style>
