<script setup>
import { computed, onMounted, ref } from "vue";
import { useDisplay } from "vuetify";
import { useInbox } from "@/composables/useInbox";

const display = useDisplay();
const {
  channelFilters,
  conversations,
  selectedConversation,
  messages,
  pagination,
  loadingChannels,
  loadingConversations,
  loadingMessages,
  sendingMessage,
  errorChannels,
  errorConversations,
  errorMessages,
  errorSending,
  loadChannels,
  loadConversations,
  selectConversation,
  submitMessage,
} = useInbox();

const statusFilter = ref("all");
const channelFilter = ref("");
const messageDraft = ref("");
const mobilePanel = ref("list");

const isMobile = computed(() => ["xs", "sm"].includes(display.name.value));
const filters = computed(() => ({
  status: statusFilter.value === "all" ? undefined : statusFilter.value,
  channel_id: channelFilter.value || undefined,
}));

const contactName = computed(
  () =>
    selectedConversation.value?.contact?.nome ||
    selectedConversation.value?.contact?.name ||
    (selectedConversation.value?.contact_id
      ? `Contato #${selectedConversation.value.contact_id}`
      : "Contato não informado"),
);

function channelFrom(conversation) {
  return conversation?.channel_account?.channel || conversation?.channel || {};
}

function channelName(conversation) {
  return (
    channelFrom(conversation).name ||
    channelFrom(conversation).nome ||
    (conversation?.channel_account_id
      ? `Canal da conta #${conversation.channel_account_id}`
      : "Canal não informado")
  );
}

function channelIcon() {
  return "mdi-message-processing-outline";
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function messageText(message) {
  if (typeof message?.content === "string" && message.content) {
    return message.content;
  }

  return `Mensagem de ${message?.type || "desconhecido"}`;
}

function senderLabel(message) {
  const labels = {
    bot: "Bot",
    human: "Atendente",
    system: "Sistema",
    contact: "Contato",
  };
  return labels[message?.sender_type] || "Mensagem";
}

function conversationStatus(conversation) {
  return conversation?.status === "closed" ? "Fechada" : "Aberta";
}

function canSend() {
  return selectedConversation.value?.status !== "closed" && !sendingMessage.value;
}

async function refreshConversations(page = 1) {
  await loadConversations(filters.value, page);
}

async function chooseConversation(conversation) {
  await selectConversation(conversation);
  if (isMobile.value) mobilePanel.value = "conversation";
}

async function send() {
  if (!canSend()) return;
  const sent = await submitMessage(messageDraft.value);
  if (sent) messageDraft.value = "";
}

function handleComposerKeydown(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    send();
  }
}

onMounted(async () => {
  await Promise.all([loadChannels(), refreshConversations()]);
});
</script>

<template>
  <main class="inbox-page">
    <header class="inbox-header">
      <div>
        <div class="text-overline text-primary">Atendimento</div>
        <h1 class="inbox-title">Unified Inbox</h1>
      </div>
      <v-btn icon="mdi-refresh" variant="text" :loading="loadingConversations" @click="refreshConversations()" />
    </header>

    <nav v-if="isMobile" class="mobile-tabs" aria-label="Navegação da inbox">
      <v-btn :variant="mobilePanel === 'filters' ? 'flat' : 'text'" @click="mobilePanel = 'filters'">Filtros</v-btn>
      <v-btn :variant="mobilePanel === 'list' ? 'flat' : 'text'" @click="mobilePanel = 'list'">Conversas</v-btn>
      <v-btn :variant="mobilePanel === 'conversation' ? 'flat' : 'text'" :disabled="!selectedConversation" @click="mobilePanel = 'conversation'">Conversa</v-btn>
    </nav>

    <section class="inbox-grid">
      <aside class="filters-panel" :class="{ 'mobile-hidden': isMobile && mobilePanel !== 'filters' }">
        <div class="panel-heading">Filtros</div>
        <v-btn-toggle v-model="statusFilter" class="filter-toggle" mandatory divided @update:model-value="refreshConversations()">
          <v-btn value="all">Todas</v-btn>
          <v-btn value="open">Abertas</v-btn>
          <v-btn value="closed">Fechadas</v-btn>
        </v-btn-toggle>

        <v-select
          v-model="channelFilter"
          label="Canal"
          :items="channelFilters"
          item-title="name"
          item-value="id"
          clearable
          density="compact"
          variant="outlined"
          :loading="loadingChannels"
          @update:model-value="refreshConversations()"
        />
        <v-alert v-if="errorChannels" type="error" variant="tonal" density="compact">{{ errorChannels }}</v-alert>
      </aside>

      <section class="conversation-list" :class="{ 'mobile-hidden': isMobile && mobilePanel !== 'list' }">
        <div class="panel-heading d-flex align-center">
          <span>Conversas</span><v-spacer /><span class="text-caption">{{ pagination.total }}</span>
        </div>
        <v-alert v-if="errorConversations" type="error" variant="tonal" density="compact" class="ma-3">{{ errorConversations }}</v-alert>
        <v-progress-linear v-if="loadingConversations" indeterminate color="primary" />
        <div v-else-if="!conversations.length" class="empty-state">Nenhuma conversa encontrada.</div>
        <v-list v-else lines="two" class="conversation-items">
          <v-list-item v-for="conversation in conversations" :key="conversation.id" :active="selectedConversation?.id === conversation.id" @click="chooseConversation(conversation)">
            <template #prepend><v-icon :color="selectedConversation?.id === conversation.id ? 'primary' : undefined">{{ channelIcon(conversation) }}</v-icon></template>
            <v-list-item-title class="font-weight-medium">{{ conversation.contact?.nome || conversation.contact?.name || (conversation.contact_id ? `Contato #${conversation.contact_id}` : "Contato não informado") }}</v-list-item-title>
            <v-list-item-subtitle class="text-truncate">{{ conversation.last_message || conversation.lastMessage ? messageText(conversation.last_message || conversation.lastMessage) : "Última mensagem não disponível" }}</v-list-item-subtitle>
            <template #append><div class="conversation-meta"><span>{{ channelName(conversation) }}</span><small>{{ formatDate(conversation.data_atualizacao || conversation.updated_at) }}</small></div></template>
          </v-list-item>
        </v-list>
        <v-pagination v-if="pagination.total > pagination.pageSize" v-model="pagination.page" :length="Math.ceil(pagination.total / pagination.pageSize)" density="compact" @update:model-value="refreshConversations" />
      </section>

      <section class="conversation-panel" :class="{ 'mobile-hidden': isMobile && mobilePanel !== 'conversation' }">
        <template v-if="selectedConversation">
          <header class="conversation-header">
            <v-btn v-if="isMobile" icon="mdi-arrow-left" variant="text" @click="mobilePanel = 'list'" />
            <div class="conversation-contact"><h2>{{ contactName }}</h2><div class="conversation-subtitle"><v-icon size="16">{{ channelIcon(selectedConversation) }}</v-icon>{{ channelName(selectedConversation) }} · {{ conversationStatus(selectedConversation) }}</div></div>
            <div class="conversation-details"><span>Automação: <strong>{{ selectedConversation.automation_enabled ? "Ativa" : "Desativada" }}</strong></span><span v-if="selectedConversation.assigned_user?.nome || selectedConversation.assigned_user">Atendente: <strong>{{ selectedConversation.assigned_user?.nome || selectedConversation.assigned_user }}</strong></span></div>
          </header>

          <v-alert v-if="errorMessages" type="error" variant="tonal" density="compact" class="ma-3">{{ errorMessages }}</v-alert>
          <div class="messages-area">
            <v-progress-circular v-if="loadingMessages" indeterminate color="primary" />
            <div v-else-if="!messages.length" class="empty-state">Nenhuma mensagem nesta conversa.</div>
            <div v-else class="message-stack">
              <div v-for="message in messages" :key="message.id || message.external_message_id" class="message-row" :class="[message.direction === 'outgoing' ? 'outgoing' : 'incoming', `sender-${message.sender_type || 'contact'}`]">
                <div class="message-bubble"><div class="message-label">{{ senderLabel(message) }} <span v-if="message.status">· {{ message.status }}</span></div><div>{{ messageText(message) }}</div><small>{{ formatDate(message.data_cadastro || message.created_at) }}</small></div>
              </div>
            </div>
          </div>

          <footer class="composer">
            <v-alert v-if="errorSending" type="error" variant="tonal" density="compact" class="mb-2">{{ errorSending }}</v-alert>
            <v-textarea v-model="messageDraft" :disabled="!canSend()" :placeholder="selectedConversation.status === 'closed' ? 'Conversa fechada' : 'Escreva uma resposta...'" rows="2" auto-grow max-rows="5" hide-details variant="outlined" density="compact" @keydown="handleComposerKeydown" />
            <div class="composer-actions"><span class="text-caption">Enter envia · Shift+Enter quebra linha</span><v-btn color="primary" :disabled="!messageDraft.trim() || !canSend()" :loading="sendingMessage" prepend-icon="mdi-send" @click="send">Enviar</v-btn></div>
          </footer>
        </template>
        <div v-else class="empty-conversation"><v-icon size="48" color="grey-lighten-1">mdi-message-text-outline</v-icon><p>Selecione uma conversa para começar.</p></div>
      </section>
    </section>
  </main>
</template>

<style scoped>
.inbox-page { height: calc(100vh - 32px); display: flex; flex-direction: column; padding: 18px 20px 20px; background: #f7f9fb; }
.inbox-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.inbox-title { margin: 0; font-size: 25px; font-weight: 600; color: #1c2b36; }
.mobile-tabs { display: flex; gap: 4px; margin-bottom: 10px; }
.inbox-grid { min-height: 0; flex: 1; display: grid; grid-template-columns: 190px minmax(260px, 340px) minmax(0, 1fr); overflow: hidden; border: 1px solid #dce4e9; background: white; }
.filters-panel, .conversation-list { border-right: 1px solid #dce4e9; }
.filters-panel { padding: 16px 12px; }
.panel-heading { padding: 0 12px 12px; color: #3d4d58; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
.filter-toggle { display: flex; flex-direction: column; align-items: stretch; margin-bottom: 18px; }
.filter-toggle .v-btn { justify-content: flex-start; }
.conversation-items { padding: 0; }
.conversation-items .v-list-item { border-bottom: 1px solid #edf1f3; cursor: pointer; padding-block: 12px; }
.conversation-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; color: #687983; font-size: 11px; }
.conversation-panel { min-width: 0; display: flex; flex-direction: column; }
.conversation-header { display: flex; align-items: center; gap: 12px; padding: 15px 18px; border-bottom: 1px solid #dce4e9; }
.conversation-contact { min-width: 0; flex: 1; }
.conversation-contact h2 { margin: 0; font-size: 18px; color: #1c2b36; }
.conversation-subtitle { display: flex; align-items: center; gap: 5px; color: #657782; font-size: 13px; }
.conversation-details { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; color: #657782; font-size: 12px; }
.messages-area { flex: 1; min-height: 0; overflow-y: auto; padding: 20px; background: #f5f8fa; }
.message-stack { display: flex; flex-direction: column; gap: 10px; }
.message-row { display: flex; max-width: 78%; }
.message-row.outgoing { align-self: flex-end; }
.message-bubble { padding: 9px 12px; border: 1px solid #dce4e9; background: white; color: #293a44; font-size: 14px; white-space: pre-wrap; overflow-wrap: anywhere; }
.outgoing .message-bubble { border-color: #bdd7e8; background: #e9f4fb; }
.sender-bot .message-bubble { border-left: 3px solid #f0aa38; }
.sender-human .message-bubble { border-left: 3px solid #3c91c2; }
.sender-system .message-bubble { border-left: 3px solid #8b99a1; background: #eef1f2; }
.message-label { margin-bottom: 3px; color: #59707c; font-size: 11px; font-weight: 700; }
.message-bubble small { display: block; margin-top: 5px; color: #80909a; font-size: 10px; }
.composer { padding: 12px 16px; border-top: 1px solid #dce4e9; background: white; }
.composer-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
.empty-state, .empty-conversation { display: flex; align-items: center; justify-content: center; padding: 36px 18px; color: #7c8b93; text-align: center; }
.empty-conversation { flex: 1; flex-direction: column; gap: 8px; }
.empty-conversation p { margin: 0; }
.mobile-hidden { display: none !important; }

@media (max-width: 700px) {
  .inbox-page { height: calc(100vh - 16px); padding: 12px; }
  .inbox-grid { display: block; border: 0; background: transparent; overflow: visible; }
  .filters-panel, .conversation-list, .conversation-panel { border: 1px solid #dce4e9; min-height: 0; height: calc(100vh - 122px); background: white; }
  .conversation-details { display: none; }
  .message-row { max-width: 90%; }
}
</style>