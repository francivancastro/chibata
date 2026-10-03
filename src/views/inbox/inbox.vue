<script setup>
import { computed, onMounted, ref } from "vue";
import { useDisplay } from "vuetify";
import { useInbox } from "@/composables/useInbox";
import { PhArrowClockwise, PhArrowLeft, PhChatCenteredText, PhPaperPlaneTilt } from "@phosphor-icons/vue";

const display = useDisplay();
const {
  channelFilters,
  isLocalPreview,
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
      <div class="inbox-header-copy">
        <h1 class="inbox-title">Inbox</h1>
        <p>Uma fila única para acompanhar cada conversa da operação.</p>
      </div>
      <div class="inbox-header-meta">
        <span class="inbox-header-note">Fila de atendimento</span>
        <v-btn icon variant="text" class="inbox-refresh" aria-label="Atualizar conversas" :loading="loadingConversations" @click="refreshConversations()"><PhArrowClockwise :size="19" weight="regular" aria-hidden="true" /></v-btn>
      </div>
    </header>

    <nav v-if="isMobile" class="mobile-tabs" aria-label="Navegação da inbox">
      <v-btn :variant="mobilePanel === 'filters' ? 'flat' : 'text'" @click="mobilePanel = 'filters'">Filtros</v-btn>
      <v-btn :variant="mobilePanel === 'list' ? 'flat' : 'text'" @click="mobilePanel = 'list'">Conversas</v-btn>
      <v-btn :variant="mobilePanel === 'conversation' ? 'flat' : 'text'" :disabled="!selectedConversation" @click="mobilePanel = 'conversation'">Conversa</v-btn>
    </nav>

    <section class="inbox-grid">
      <aside class="filters-panel" :class="{ 'mobile-hidden': isMobile && mobilePanel !== 'filters' }">
        <div class="panel-heading"><span>Filtrar fila</span><small>Refine a fila</small></div>
        <v-btn-toggle v-model="statusFilter" class="filter-toggle" mandatory divided :disabled="isLocalPreview" @update:model-value="refreshConversations()">
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
          :disabled="isLocalPreview"
          :loading="loadingChannels"
          @update:model-value="refreshConversations()"
        />
        <div v-if="isLocalPreview" class="preview-note" role="status">
          Prévia visual sem conexão com a API. Os canais aparecerão aqui quando o ambiente estiver conectado.
        </div>
        <v-alert v-else-if="errorChannels" class="inline-error" type="error" variant="tonal" density="compact" role="alert">{{ errorChannels }}</v-alert>
      </aside>

      <section class="conversation-list" :class="{ 'mobile-hidden': isMobile && mobilePanel !== 'list' }">
        <div class="panel-heading d-flex align-center">
          <span>Conversas</span><v-spacer /><span class="conversation-count">{{ pagination.total }}</span>
        </div>
        <v-progress-linear v-if="loadingConversations" indeterminate color="primary" role="progressbar" aria-label="Carregando conversas" />
        <div v-else-if="isLocalPreview" class="preview-state" role="status" aria-live="polite">
          <PhChatCenteredText :size="30" weight="regular" aria-hidden="true" />
          <strong>Prévia do Inbox pronta</strong>
          <span>Conecte a API para carregar conversas e mensagens reais.</span>
        </div>
        <div v-else-if="errorConversations" class="list-error-state" role="alert">
          <PhChatCenteredText :size="30" weight="regular" aria-hidden="true" />
          <strong>Não foi possível abrir a fila</strong>
          <span>{{ errorConversations }}</span>
          <v-btn variant="text" size="small" @click="refreshConversations()">Tentar novamente</v-btn>
        </div>
        <div v-else-if="!conversations.length" class="empty-state"><PhChatCenteredText :size="30" weight="regular" aria-hidden="true" /><span>Nenhuma conversa encontrada.</span><small>As novas mensagens aparecerão nesta fila.</small></div>
        <v-list v-else lines="two" class="conversation-items">
          <v-list-item v-for="conversation in conversations" :key="conversation.id" :active="selectedConversation?.id === conversation.id" @click="chooseConversation(conversation)">
            <template #prepend><PhChatCenteredText :size="19" :color="selectedConversation?.id === conversation.id ? 'var(--cc-accent)' : 'var(--cc-muted)'" weight="regular" aria-hidden="true" /></template>
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
            <v-btn v-if="isMobile" icon variant="text" aria-label="Voltar para conversas" @click="mobilePanel = 'list'"><PhArrowLeft :size="19" weight="regular" aria-hidden="true" /></v-btn>
            <div class="conversation-contact"><h2>{{ contactName }}</h2><div class="conversation-subtitle"><PhChatCenteredText :size="16" color="var(--cc-muted)" weight="regular" aria-hidden="true" />{{ channelName(selectedConversation) }} · {{ conversationStatus(selectedConversation) }}</div></div>
            <div class="conversation-details"><span>Automação: <strong>{{ selectedConversation.automation_enabled ? "Ativa" : "Desativada" }}</strong></span><span v-if="selectedConversation.assigned_user?.nome || selectedConversation.assigned_user">Atendente: <strong>{{ selectedConversation.assigned_user?.nome || selectedConversation.assigned_user }}</strong></span></div>
          </header>

          <v-alert v-if="errorMessages" type="error" variant="tonal" density="compact" class="ma-3">{{ errorMessages }}</v-alert>
          <div class="messages-area" aria-live="polite" aria-label="Mensagens da conversa">
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
            <div class="composer-actions"><span class="text-caption">Enter envia · Shift+Enter quebra linha</span><v-btn color="primary" :disabled="!messageDraft.trim() || !canSend()" :loading="sendingMessage" @click="send"><PhPaperPlaneTilt :size="17" weight="regular" aria-hidden="true" />Enviar</v-btn></div>
          </footer>
        </template>
        <div v-else class="empty-conversation"><PhChatCenteredText :size="48" weight="regular" aria-hidden="true" /><p>Selecione uma conversa para começar.</p><small>O histórico e o composer aparecerão aqui.</small></div>
      </section>
    </section>
  </main>
</template>

<style scoped>
.inbox-page { height: calc(100dvh - 64px); display: flex; flex-direction: column; padding: 22px 24px 24px; background: var(--cc-canvas); }
.inbox-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; margin-bottom: 18px; }
.inbox-header-copy p { margin: 5px 0 0; color: var(--cc-muted); font-size: 13px; }
.inbox-title { margin: 4px 0 0; color: var(--cc-text); font-size: clamp(26px, 3vw, 34px); font-weight: 650; letter-spacing: -.035em; }
.inbox-header-meta { display: flex; align-items: center; gap: 10px; }
.inbox-status { display: inline-flex; align-items: center; gap: 7px; padding: 7px 10px; border: 1px solid var(--cc-border); border-radius: 999px; color: var(--cc-muted); background: var(--cc-surface); font-size: 11px; }
.inbox-status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--cc-warning); box-shadow: 0 0 0 3px color-mix(in srgb, var(--cc-warning) 14%, transparent); }
.mobile-tabs { display: flex; gap: 4px; margin-bottom: 10px; }
.inbox-grid { min-height: 0; flex: 1; display: grid; grid-template-columns: 208px minmax(300px, 360px) minmax(0, 1fr); overflow: hidden; border: 1px solid var(--cc-border); border-radius: 18px; background: var(--cc-surface); box-shadow: 0 16px 48px rgba(0, 0, 0, .12); }
.filters-panel, .conversation-list { min-width: 0; overflow-y: auto; border-right: 1px solid var(--cc-border); }
.filters-panel { padding: 18px 13px; background: var(--cc-subtle); }
.panel-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; padding: 0 12px 13px; color: var(--cc-text); font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
.panel-heading small { color: var(--cc-faint); font-size: 10px; font-weight: 500; letter-spacing: 0; text-transform: none; }
.filter-toggle { display: flex; flex-direction: column; align-items: stretch; margin-bottom: 18px; }
.filter-toggle .v-btn { justify-content: flex-start; min-height: 36px; padding-inline: 12px; color: var(--cc-muted); font-size: 12px; }
.conversation-list { background: var(--cc-surface); }
.conversation-count { display: grid; place-items: center; min-width: 24px; height: 22px; padding-inline: 6px; border: 1px solid var(--cc-border); border-radius: 7px; color: var(--cc-muted); font-size: 10px; font-weight: 600; letter-spacing: 0; }
.conversation-items { padding: 0; }
.conversation-items .v-list-item { border-top: 1px solid var(--cc-border); cursor: pointer; padding: 13px 14px; transition: background .16s var(--cc-ease), border-color .16s var(--cc-ease); }
.conversation-items .v-list-item:hover { background: var(--cc-subtle); }
.conversation-items .v-list-item--active { border-left: 2px solid var(--cc-accent); background: color-mix(in srgb, var(--cc-accent) 9%, var(--cc-surface)); }
.conversation-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; color: var(--cc-muted); font-size: 10px; }
.conversation-meta small { color: var(--cc-faint); }
.conversation-panel { min-width: 0; display: flex; flex-direction: column; background: var(--cc-surface); }
.conversation-header { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--cc-border); }
.conversation-contact { min-width: 0; flex: 1; }
.conversation-contact h2 { margin: 0; overflow: hidden; color: var(--cc-text); font-size: 18px; text-overflow: ellipsis; white-space: nowrap; }
.conversation-subtitle { display: flex; align-items: center; gap: 5px; color: var(--cc-muted); font-size: 12px; }
.conversation-details { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; color: var(--cc-muted); font-size: 11px; }
.conversation-details strong { color: var(--cc-text); font-weight: 600; }
.messages-area { flex: 1; min-height: 0; overflow-y: auto; padding: 24px; background: var(--cc-canvas); }
.message-stack { display: flex; flex-direction: column; gap: 10px; }
.message-row { display: flex; max-width: 78%; }
.message-row.outgoing { align-self: flex-end; }
.message-bubble { border-radius: 13px; padding: 10px 13px; border: 1px solid var(--cc-border); background: var(--cc-surface); color: var(--cc-text); font-size: 14px; white-space: pre-wrap; overflow-wrap: anywhere; }
.outgoing .message-bubble { border-color: color-mix(in srgb, var(--cc-accent) 35%, var(--cc-border)); background: color-mix(in srgb, var(--cc-accent) 8%, var(--cc-surface)); }
.sender-bot .message-bubble { background: color-mix(in srgb, var(--cc-warning) 5%, var(--cc-surface)); }
.sender-human .message-bubble { background: color-mix(in srgb, var(--cc-accent) 6%, var(--cc-surface)); }
.sender-system .message-bubble { background: var(--cc-subtle); }
.message-label { margin-bottom: 4px; color: var(--cc-muted); font-size: 11px; font-weight: 700; }
.sender-bot .message-label { color: var(--cc-warning); }
.sender-human .message-label { color: var(--cc-accent); }
.message-bubble small { display: block; margin-top: 6px; color: var(--cc-faint); font-size: 10px; }
.composer { padding: 14px 18px 16px; border-top: 1px solid var(--cc-border); background: var(--cc-surface); }
.composer-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 8px; }
.empty-state, .empty-conversation { display: flex; align-items: center; justify-content: center; padding: 52px 20px; color: var(--cc-muted); text-align: center; }
.empty-state { flex-direction: column; gap: 7px; }
.empty-state small, .empty-conversation small { color: var(--cc-faint); font-size: 11px; }
.empty-conversation { flex: 1; flex-direction: column; gap: 8px; }
.empty-conversation p { margin: 0; color: var(--cc-text); font-size: 14px; }
.mobile-hidden { display: none !important; }

@media (max-width: 959px) {
  .inbox-page { height: calc(100dvh - 64px); padding: 14px; }
  .inbox-header { align-items: flex-start; }
  .inbox-header-meta { align-items: flex-start; }
  .inbox-status { display: none; }
  .inbox-grid { display: block; border: 0; background: transparent; overflow: visible; box-shadow: none; }
  .filters-panel, .conversation-list, .conversation-panel { border: 1px solid var(--cc-border); min-height: 0; height: calc(100dvh - 194px); border-radius: 16px; background: var(--cc-surface); }
  .conversation-details { display: none; }
  .message-row { max-width: 90%; }
}
@media (max-width: 520px) { .inbox-header { margin-bottom: 12px; } .inbox-header-copy p { max-width: 230px; } .inbox-title { font-size: 27px; } .messages-area { padding: 16px 12px; } .composer { padding: 12px; } .composer-actions { align-items: flex-end; } .composer-actions .text-caption { max-width: 155px; line-height: 1.35; } }
@media (prefers-reduced-motion: reduce) { .conversation-items .v-list-item { transition: none; } }

/* Inbox desk: flatter hierarchy, stronger reading order, one intentional surface. */
.inbox-page { padding: 28px 30px 30px; }
.inbox-header { align-items: flex-end; margin-bottom: 24px; }
.inbox-context { display: flex; align-items: center; gap: 8px; color: var(--cc-accent); font-size: 11px; font-weight: 650; letter-spacing: .04em; }
.inbox-context-rule { width: 20px; height: 1px; background: var(--cc-accent); opacity: .7; }
.inbox-title { margin-top: 8px; font-size: clamp(30px, 3.5vw, 44px); letter-spacing: -.055em; }
.inbox-header-copy p { margin-top: 8px; max-width: 48ch; font-size: 14px; line-height: 1.55; }
.inbox-header-meta { gap: 12px; }
.inbox-header-note { color: var(--cc-faint); font-size: 12px; }
.inbox-refresh { width: 42px !important; height: 42px !important; border: 1px solid var(--cc-border); border-radius: 11px !important; color: var(--cc-text); background: var(--cc-surface); }
.inbox-grid { grid-template-columns: 216px minmax(300px, 350px) minmax(0, 1fr); gap: 0; overflow: visible; border: 0; border-radius: 0; background: transparent; box-shadow: none; }
.filters-panel, .conversation-list { border-right: 1px solid var(--cc-border); background: transparent; }
.filters-panel { padding: 9px 24px 0 0; }
.conversation-list { padding: 9px 20px 0 24px; }
.conversation-panel { border: 1px solid var(--cc-border); border-radius: 18px; background: var(--cc-surface); box-shadow: none; }
.panel-heading { padding: 0 0 16px; color: var(--cc-text); font-size: 12px; letter-spacing: .01em; text-transform: none; }
.panel-heading small { color: var(--cc-faint); font-size: 11px; }
.filter-toggle { gap: 4px; margin-bottom: 24px; }
.filter-toggle .v-btn { min-height: 38px; border: 1px solid transparent; border-radius: 9px !important; color: var(--cc-muted); }
.filter-toggle .v-btn:hover { background: rgba(241, 240, 235, .045); color: var(--cc-text); }
.filter-toggle .v-btn--active { color: var(--cc-on-accent); background: var(--cc-accent); }
.inline-error { margin: 10px 0 0 !important; border: 1px solid rgba(232, 165, 160, .22); border-radius: 10px; color: var(--cc-danger) !important; background: rgba(232, 165, 160, .08) !important; font-size: 12px; }
.conversation-error { margin: 0 0 12px !important; }
.conversation-items .v-list-item { margin: 0 0 4px; border: 0; border-radius: 10px; padding: 14px 12px; background: transparent; transition: background-color 150ms var(--cc-ease-out), color 150ms var(--cc-ease-out); }
.conversation-items .v-list-item:hover { background: rgba(241, 240, 235, .045); }
.conversation-items .v-list-item--active { color: var(--cc-text); background: rgba(167, 216, 203, .12); }
.conversation-items .v-list-item--active .v-list-item-subtitle { color: var(--cc-muted); }
.conversation-meta { color: var(--cc-faint); }
.conversation-header { padding: 18px 20px; }
.messages-area { padding: 26px; }
.composer { padding: 16px 20px 18px; }
.empty-state { min-height: 220px; gap: 8px; }
.empty-state .v-icon { color: var(--cc-accent); }
.empty-state svg { color: var(--cc-accent); }
.empty-conversation { padding: 40px; }
.empty-conversation svg { color: var(--cc-accent); opacity: .85; }
.empty-conversation p { margin-top: 4px; font-size: 15px; }
.list-error-state { min-height: 300px; display: grid; place-content: center; justify-items: center; gap: 8px; padding: 36px 24px; color: var(--cc-danger); text-align: center; }
.list-error-state svg { opacity: .9; }
.list-error-state strong { color: var(--cc-text); font-size: 13px; font-weight: 650; }
.list-error-state span { max-width: 24ch; color: var(--cc-muted); font-size: 12px; line-height: 1.5; }
.list-error-state .v-btn { margin-top: 6px; color: var(--cc-accent); }
.preview-note { margin-top: 10px; padding: 11px 12px; border: 1px solid color-mix(in srgb, var(--cc-accent) 22%, var(--cc-border)); border-radius: 10px; color: var(--cc-muted); background: color-mix(in srgb, var(--cc-accent) 5%, var(--cc-surface)); font-size: 11px; line-height: 1.45; }
.preview-state { min-height: 300px; display: grid; place-content: center; justify-items: center; gap: 8px; padding: 36px 24px; color: var(--cc-accent); text-align: center; }
.preview-state strong { color: var(--cc-text); font-size: 13px; font-weight: 650; }
.preview-state span { max-width: 24ch; color: var(--cc-muted); font-size: 12px; line-height: 1.5; }

@media (max-width: 959px) {
  .inbox-page { padding: 18px 16px 20px; }
  .inbox-header { align-items: flex-start; margin-bottom: 16px; }
  .inbox-header-note { display: none; }
  .inbox-grid { display: block; }
  .filters-panel, .conversation-list, .conversation-panel { border: 1px solid var(--cc-border); border-radius: 16px; background: var(--cc-surface); }
  .filters-panel { padding: 18px 14px; }
  .conversation-list { padding: 18px 14px; }
  .conversation-panel { box-shadow: none; }
  .conversation-items .v-list-item { padding-inline: 10px; }
}
@media (max-width: 520px) {
  .inbox-title { font-size: 32px; }
  .inbox-header-copy p { max-width: 30ch; }
  .inbox-refresh { flex: 0 0 auto; }
}
</style>
