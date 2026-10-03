<script setup>
import { computed } from "vue";
import { Handle, Position } from "@vue-flow/core";

const props = defineProps({
  data: { type: Object, required: true },
});

const LABELS = {
  mensagem: "Mensagem",
  produto: "Produto",
  condicao: "Condição",
  acao: "Ação",
  pagamento: "Pagamento",
  final: "Final",
};

const etapa = computed(() => props.data?.etapa || {});
const typeLabel = computed(() => LABELS[etapa.value.tipo] || etapa.value.tipo || "Etapa");
const warning = computed(() => props.data?.warning || "");
</script>

<template>
  <div class="node" :class="[`node--${etapa.tipo}`, { 'node--warn': warning }]">
    <Handle type="target" :position="Position.Top" />
    <span class="node-type">{{ typeLabel }}<template v-if="warning"> · {{ warning }}</template></span>
    <strong class="node-title">{{ etapa.titulo || "Sem título" }}</strong>
    <span v-if="etapa.descricao" class="node-desc">{{ etapa.descricao }}</span>
    <Handle v-if="etapa.tipo !== 'final'" type="source" :position="Position.Bottom" />
  </div>
</template>

<style scoped>
.node { width: 220px; box-sizing: border-box; padding: 12px 14px; display: flex; flex-direction: column; gap: 3px; border: 1px solid var(--ch-line-strong); border-radius: 12px; background: var(--ch-surface); color: var(--ch-ink); font-family: var(--ch-font); }
.node-type { font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--ch-muted); }
.node-title { font-size: 14px; font-weight: 600; line-height: 1.3; }
.node-desc { font-size: 12px; line-height: 1.45; color: var(--ch-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.node--warn { border: 2px solid #D98A1E; }
.node--warn .node-type { color: var(--ch-warn-ink); }
.node--final { background: var(--ch-ink); border-color: var(--ch-ink); color: #FFFFFF; }
.node--final .node-type, .node--final .node-desc { color: #C6CABE; }
:global(.vue-flow__node.selected) .node { box-shadow: 0 0 0 3px var(--ch-accent-line); border-color: var(--ch-accent); }
</style>
