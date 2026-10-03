import { computed, onBeforeUnmount, ref } from "vue";
import {
  detailConversation,
  listChannels,
  listConversations,
  listMessages,
  sendMessage,
} from "@/services/messaging";
import { errorMessage } from "@/plugins/axios";
import { isLocalPreviewEnabled } from "@/utils/local-preview";

// Sem WebSocket ainda: a fila e a conversa aberta são atualizadas por polling (M7).
const POLL_MESSAGES_MS = 8000;
const POLL_CONVERSATIONS_MS = 20000;

function responseData(response) {
  return response?.data?.data ?? {};
}

function responseList(response) {
  const data = responseData(response);
  return Array.isArray(data) ? data : data.list || [];
}

function messageKey(message) {
  return message?.id ?? message?.external_message_id ?? message?._tempId;
}

export function useInbox() {
  const isLocalPreview = isLocalPreviewEnabled();
  const channels = ref([]);
  const conversations = ref([]);
  const selectedConversation = ref(null);
  const messages = ref([]);
  const pagination = ref({ page: 1, pageSize: 20, total: 0 });
  const lastUpdated = ref(null);
  const lastFilters = ref({});

  const loadingChannels = ref(false);
  const loadingConversations = ref(false);
  const loadingMessages = ref(false);
  const sendingMessage = ref(false);

  const errorChannels = ref("");
  const errorConversations = ref("");
  const errorMessages = ref("");
  const errorSending = ref("");

  // Cada seleção ganha um número; respostas de uma seleção antiga são ignoradas.
  let selectionId = 0;
  let pollTimer = null;
  let pollTick = 0;

  const channelFilters = computed(() =>
    channels.value.filter((channel) => channel?.status !== 0 && channel?.status !== "0"),
  );

  async function loadChannels() {
    if (isLocalPreview) {
      channels.value = [];
      errorChannels.value = "";
      return;
    }

    loadingChannels.value = true;
    errorChannels.value = "";

    try {
      channels.value = responseList(await listChannels());
    } catch (error) {
      errorChannels.value = errorMessage(error, "Não foi possível carregar os canais.");
    } finally {
      loadingChannels.value = false;
    }
  }

  async function loadConversations(filters = {}, page = 1, { silent = false } = {}) {
    lastFilters.value = filters;

    if (isLocalPreview) {
      conversations.value = [];
      errorConversations.value = "";
      pagination.value = { ...pagination.value, page, total: 0 };
      return;
    }

    if (!silent) {
      loadingConversations.value = true;
      errorConversations.value = "";
    }

    try {
      const response = await listConversations({
        ...filters,
        pageSize: pagination.value.pageSize,
        currentPage: page,
      });
      const data = responseData(response);

      conversations.value = responseList(response);
      pagination.value = {
        ...pagination.value,
        page,
        total: Number(data.total ?? conversations.value.length),
      };
      lastUpdated.value = new Date();
      if (silent) errorConversations.value = "";
    } catch (error) {
      if (!silent) {
        errorConversations.value = errorMessage(error, "Não foi possível carregar as conversas.");
      }
    } finally {
      if (!silent) loadingConversations.value = false;
    }
  }

  async function fetchMessages(conversationId) {
    const response = await listMessages({
      conversation_id: conversationId,
      pageSize: 100,
      currentPage: 1,
    });
    return responseList(response);
  }

  function mergeMessages(serverMessages) {
    // Mantém mensagens locais que ainda estão enviando ou falharam.
    const pending = messages.value.filter((m) => m._state === "sending" || m._state === "failed");
    messages.value = [...serverMessages, ...pending];
  }

  async function selectConversation(conversation) {
    const current = ++selectionId;
    selectedConversation.value = conversation;
    messages.value = [];
    errorMessages.value = "";
    errorSending.value = "";

    if (!conversation?.id) return;

    loadingMessages.value = true;

    try {
      const detail = await detailConversation(conversation.id);
      if (current !== selectionId) return;
      const detailData = responseData(detail);
      selectedConversation.value = detailData.conversation || (detailData?.id ? detailData : conversation);

      const list = await fetchMessages(conversation.id);
      if (current !== selectionId) return;
      messages.value = list;
      lastUpdated.value = new Date();
    } catch (error) {
      if (current !== selectionId) return;
      errorMessages.value = errorMessage(error, "Não foi possível carregar as mensagens.");
    } finally {
      if (current === selectionId) loadingMessages.value = false;
    }
  }

  async function refreshOpenConversation() {
    const conversationId = selectedConversation.value?.id;
    if (!conversationId || loadingMessages.value) return;
    const current = selectionId;

    try {
      const list = await fetchMessages(conversationId);
      if (current !== selectionId) return;
      mergeMessages(list);
      lastUpdated.value = new Date();
    } catch {
      /* Polling silencioso: o próximo ciclo tenta de novo. */
    }
  }

  async function deliver(localMessage) {
    const conversationId = selectedConversation.value?.id;
    localMessage._state = "sending";
    localMessage._error = "";

    try {
      const response = await sendMessage({
        conversation_id: conversationId,
        content: localMessage.content,
      });
      const sent = responseData(response).message || responseData(response);
      const index = messages.value.findIndex((m) => m._tempId === localMessage._tempId);

      if (sent?.id) {
        if (index !== -1) messages.value.splice(index, 1, sent);
      } else if (index !== -1) {
        // A API não devolveu a mensagem: marca como enviada e o polling traz a versão do servidor.
        messages.value[index] = { ...localMessage, _state: "sent" };
      }
      return true;
    } catch (error) {
      const index = messages.value.findIndex((m) => m._tempId === localMessage._tempId);
      if (index !== -1) {
        messages.value[index] = {
          ...localMessage,
          _state: "failed",
          _error: errorMessage(error, "Não foi possível enviar."),
        };
      }
      return false;
    }
  }

  async function submitMessage(content) {
    const conversationId = selectedConversation.value?.id;
    const value = content?.trim();

    if (!conversationId || !value || sendingMessage.value) return false;

    sendingMessage.value = true;
    errorSending.value = "";

    // Aparece na hora como "enviando"; vira "falhou" com opção de reenviar.
    const localMessage = {
      _tempId: `temp-${Date.now()}`,
      _state: "sending",
      content: value,
      direction: "outgoing",
      sender_type: "human",
      created_at: new Date().toISOString(),
    };
    messages.value.push(localMessage);

    try {
      return await deliver(localMessage);
    } finally {
      sendingMessage.value = false;
    }
  }

  async function retryMessage(message) {
    const index = messages.value.findIndex((m) => m._tempId === message._tempId);
    if (index === -1) return;
    messages.value[index] = { ...message, _state: "sending", _error: "" };
    await deliver(messages.value[index]);
  }

  function startPolling() {
    if (isLocalPreview || pollTimer) return;
    pollTimer = window.setInterval(() => {
      if (document.hidden) return;
      pollTick += 1;
      refreshOpenConversation();
      if ((pollTick * POLL_MESSAGES_MS) % POLL_CONVERSATIONS_MS < POLL_MESSAGES_MS) {
        loadConversations(lastFilters.value, pagination.value.page, { silent: true });
      }
    }, POLL_MESSAGES_MS);
  }

  function stopPolling() {
    window.clearInterval(pollTimer);
    pollTimer = null;
  }

  onBeforeUnmount(stopPolling);

  return {
    isLocalPreview,
    channels,
    channelFilters,
    conversations,
    selectedConversation,
    messages,
    pagination,
    lastUpdated,
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
    retryMessage,
    startPolling,
    stopPolling,
    messageKey,
  };
}
