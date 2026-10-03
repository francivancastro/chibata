<script setup>
import AgentCard from './AgentCard.vue'

defineProps({ agents: { type: Array, default: () => [] }, loading: Boolean, selected: Object })
const emit = defineEmits(['select'])
</script>

<template>
  <div v-if="loading" class="room-grid room-grid-skeleton" aria-label="Carregando salas" aria-busy="true">
    <div v-for="item in 4" :key="item" class="room-skeleton"><span></span><b></b><i></i></div>
  </div>
  <div v-else-if="!agents.length" class="empty-map">
    <span class="empty-map-mark">+</span>
    <strong>Nenhum agente observado</strong>
    <p>A bridge não encontrou agentes conectados neste momento.</p>
  </div>
  <div v-else class="room-grid">
    <AgentCard v-for="agent in agents" :key="agent.name" :agent="agent" :selected="selected?.name === agent.name" @select="emit('select', $event)" />
  </div>
</template>
