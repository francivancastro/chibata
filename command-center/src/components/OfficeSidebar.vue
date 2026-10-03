<script setup>
defineProps({ summary: { type: Object, required: true }, health: Object, open: Boolean })
const emit = defineEmits(['close'])
</script>

<template>
  <aside id="office-sidebar" class="office-sidebar" :class="{ 'is-open': open }" aria-label="Legenda do escritório">
    <div class="sidebar-brand"><span class="brand-mark">⌁</span><span><strong>CHIBATA</strong><small>office / local</small></span><button class="drawer-close" aria-label="Fechar menu" @click="emit('close')">×</button></div>
    <div class="sidebar-section"><p class="eyebrow">ESTADOS OBSERVADOS</p><div class="legend-list"><span><i class="status-dot status-orange"></i>Trabalhando <b>{{ summary.working }}</b></span><span><i class="status-dot status-muted"></i>Aguardando <b>{{ summary.waiting }}</b></span><span><i class="status-dot status-success"></i>Concluído <b>{{ summary.completed }}</b></span><span><i class="status-dot status-danger"></i>Indisponível <b>{{ summary.offline }}</b></span><span><i class="status-dot status-muted"></i>Sem confirmação <b>{{ summary.unknown }}</b></span></div></div>
    <div class="sidebar-section sidebar-note"><p class="eyebrow">FONTE</p><p>Estados vêm do inventário e sinais observáveis da bridge local. Animação nunca prova trabalho.</p></div>
    <div class="sidebar-foot"><span class="health-light" :class="{ online: health?.cli_available }"></span>{{ health?.cli_available ? 'Maestri conectado' : 'Maestri não confirmado' }}</div>
  </aside>
</template>
