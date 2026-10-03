<script setup>
defineProps({ events: { type: Array, default: () => [] } })
</script>

<template>
  <section class="feed-panel" aria-labelledby="feed-title">
    <div class="section-heading"><div><p class="eyebrow">TRILHA DE OPERAÇÃO</p><h3 id="feed-title">Atividade observada</h3></div><span class="source-tag">snapshot / bridge</span></div>
    <div v-if="!events.length" class="feed-empty">Nenhum evento observado ainda.</div>
    <ol v-else class="activity-list"><li v-for="event in events.slice(0, 5)" :key="event.event_id"><span class="feed-line"></span><div><strong>{{ event.agent || 'Sistema' }}</strong><p>{{ event.type === 'agent.snapshot' ? 'Presença observada no inventário' : event.type }}</p><time>{{ event.observed_at || 'sem horário' }}</time></div></li></ol>
  </section>
</template>
