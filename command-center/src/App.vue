<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ActivityFeed from './components/ActivityFeed.vue'
import OfficeSidebar from './components/OfficeSidebar.vue'
import OrchestratorChat from './components/OrchestratorChat.vue'
import PhaserOffice from './components/PhaserOffice.vue'
import { enrichAgencyProfile } from './data/agencyRoster.js'
import { maestriBridge } from './services/maestriBridge.js'
import { createOfficeStore } from './state/officeStore.js'

const { state, refresh, sendMessage } = createOfficeStore(maestriBridge)
const selected = ref(null)
const sidebarOpen = ref(false)
const mobileMode = ref('map')
let refreshTimer

const rooms = computed(() => state.self ? [enrichAgencyProfile({ ...state.self, role: 'Orquestrador principal', operational_state: 'unknown', connections: [], evidence: { source: 'maestri list', freshness: 'snapshot', observed_at: state.lastUpdated } }), ...state.agents.map(enrichAgencyProfile)] : state.agents.map(enrichAgencyProfile))
const selectedRoom = computed(() => selected.value || rooms.value[0] || null)
const updatedLabel = computed(() => state.lastUpdated ? new Date(state.lastUpdated).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'aguardando')

function selectAgent(agent) { selected.value = agent; sidebarOpen.value = false; mobileMode.value = 'inspector' }
onMounted(() => { refresh(); refreshTimer = window.setInterval(refresh, 15000) })
onBeforeUnmount(() => window.clearInterval(refreshTimer))
</script>

<template>
  <div class="office-app">
    <OfficeSidebar :summary="state.summary" :health="state.health" :open="sidebarOpen" @close="sidebarOpen = false" />
    <div class="office-workspace">
      <header class="office-topbar">
        <button class="menu-button" aria-label="Abrir legenda" :aria-expanded="sidebarOpen" aria-controls="office-sidebar" @click="sidebarOpen = true">☰</button>
        <div class="topbar-title"><span class="topbar-mark">⌁</span><div><strong>Command Center Office</strong><span>escritório / {{ state.summary.observed }} agentes observados</span></div></div>
        <div class="topbar-actions"><span class="live-status"><i class="health-light" :class="{ online: state.health?.cli_available }"></i>{{ state.health?.cli_available ? 'live' : 'sem confirmação' }}</span><button class="refresh-button" aria-label="Atualizar estado" @click="refresh">↻</button></div>
      </header>

      <main class="office-main">
        <section class="map-header"><div><p class="eyebrow">MAPA DE OPERAÇÃO</p><h1>Seu time, no mesmo espaço.</h1><p class="map-subtitle">Selecione um agente para ver sua atividade e continuar a conversa.</p></div><div class="map-stats"><span><b>{{ state.summary.observed }}</b> observados</span><span><b>{{ state.summary.offline }}</b> indisponíveis</span><small>última leitura {{ updatedLabel }}</small></div></section>
        <div v-if="state.error" class="bridge-alert" role="alert"><span>!</span><div><strong>A bridge precisa de atenção.</strong><p>{{ state.error }}</p></div><button @click="refresh">Tentar novamente</button></div>
        <div class="office-map-area">
          <nav class="mobile-tabs" aria-label="Modo do escritório">
            <button :class="{ active: mobileMode === 'map' }" @click="mobileMode = 'map'">Mapa</button>
            <button :class="{ active: mobileMode === 'inspector' }" @click="mobileMode = 'inspector'">Sala</button>
            <button :class="{ active: mobileMode === 'chat' }" @click="mobileMode = 'chat'">Chat</button>
          </nav>
          <section class="office-map" :class="{ 'mobile-panel-hidden': mobileMode !== 'map' }" aria-label="Mapa interativo do escritório virtual">
            <div v-if="state.loading" class="map-loading">Carregando o mapa operacional...</div>
            <PhaserOffice v-else :agents="rooms" :selected="selectedRoom" @select="selectAgent" />
            <div class="map-caption"><span>ESTÚDIO / PISO 01</span><span>{{ rooms.length ? 'Selecione um agente no mapa' : 'Aguardando conexão dos agentes' }}</span></div>
          </section>
        </div>
        <section class="office-lower-grid" :class="{ 'mobile-chat-visible': mobileMode === 'chat' }"><OrchestratorChat :messages="state.messages" :sending="state.sending" :target="selectedRoom" :health="state.health" @send="sendMessage" /><ActivityFeed :events="state.activity" /></section>
      </main>
    </div>
    <aside v-if="selectedRoom" class="inspector-panel" :class="{ 'mobile-inspector-visible': mobileMode === 'inspector' }" aria-label="Sala selecionada"><div class="inspector-kicker"><span class="eyebrow">SALA SELECIONADA</span><button aria-label="Limpar seleção" @click="selected = null; mobileMode = 'map'">×</button></div><div class="inspector-avatar"><span class="pixel-avatar avatar-inspector"><span class="avatar-shadow"></span><span class="avatar-head"></span><span class="avatar-body"></span><span class="avatar-tool"></span></span><div><h2>{{ selectedRoom.name }}</h2><p>{{ selectedRoom.role || 'Papel não observado' }}</p></div></div><div v-if="selectedRoom.agency_profile" class="agency-profile"><span class="eyebrow">AGENCY AGENTS / {{ selectedRoom.agency_profile.division }}</span><strong>{{ selectedRoom.agency_profile.title }}</strong><p>{{ selectedRoom.agency_profile.specialty }}</p></div><dl class="evidence-list"><div><dt>Estado</dt><dd>{{ selectedRoom.operational_state || 'desconhecido' }}</dd></div><div><dt>Tarefa atual</dt><dd>{{ selectedRoom.task?.title || 'Nenhuma tarefa observável' }}</dd></div><div><dt>Evidência</dt><dd>{{ selectedRoom.evidence?.source || 'sem sinal' }} · {{ selectedRoom.evidence?.freshness || 'sem freshness' }}</dd></div><div><dt>Próxima ação</dt><dd>{{ selectedRoom.nextAction || 'Aguardando instrução' }}</dd></div><div><dt>Última observação</dt><dd>{{ selectedRoom.evidence?.observed_at || 'sem horário' }}</dd></div></dl><button class="inspector-chat-button" @click="mobileMode = 'chat'">Abrir conversa com Codex</button><div class="inspector-note"><span class="eyebrow">CONEXÕES</span><p>{{ selectedRoom.connections?.length ? selectedRoom.connections.join(' · ') : 'Nenhuma conexão observada' }}</p></div></aside>
  </div>
</template>
