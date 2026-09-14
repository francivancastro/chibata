import { computed, ref } from "vue";
import {
  detailConversation,
  listChannels,
  listConversations,
  listMessages,
  sendMessage,
} from "@/services/messaging";

function responseData(response) {
  return response?.data?.data ?? {};
}

function responseList(response) {
  const data = responseData(response);
  return Array.isArray(data) ? data : data.list || [];
}

export function useInbox() {
  const channels = ref([]);
  const conversations = ref([]);
  const selectedConversation = ref(null);
  const messages = ref([]);
  const pagination = ref({ page: 1, pageSize: 20, total: 0 });

  const loadingChannels = ref(false);
  const loadingConversations = ref(false);
  const loadingMessages = ref(false);
  const sendingMessage = ref(false);

  const errorChannels = ref("");
  const errorConversations = ref("");
  const errorMessages = ref("");
  const errorSending = ref("");

  const channelFilters = computed(() =>
    channels.value.filter((channel) => channel?.status !== 0 && channel?.status !== "0"),
  );

  function getError(error, fallback) {
    return error?.response?.data?.message || error?.response?.data?.error || fallback;
  }

  async function loadChannels() {
    loadingChannels.value = true;
    errorChannels.value = "";

    try {
      channels.value = responseList(await listChannels());
    } catch (error) {
      errorChannels.value = getError(error, "Não foi possível carregar os canais.");
    } finally {
      loadingChannels.value = false;
    }
  }

  async function loadConversations(filters = {}, page = 1) {
    loadingConversations.value = true;
    errorConversations.value = "";

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
        total: Number(data.total || conversations.value.length),
      };
    } catch (error) {
      errorConversations.value = getError(
        error,
        "Não foi possível carregar as conversas.",
      );
    } finally {
      loadingConversations.value = false;
    }
  }

  async function selectConversation(conversation) {
    selectedConversation.value = conversation;
    messages.value = [];
    errorMessages.value = "";

    if (!conversation?.id) return;

    loadingMessages.value = true;

    try {
      const detail = await detailConversation(conversation.id);
      const detailData = responseData(detail);
      selectedConversation.value = detailData.conversation || detailData || conversation;

      const response = await listMessages({
        conversation_id: conversation.id,
        pageSize: 100,
        currentPage: 1,
      });
      messages.value = responseList(response);
    } catch (error) {
      errorMessages.value = getError(
        error,
        "Não foi possível carregar as mensagens.",
      );
    } finally {
      loadingMessages.value = false;
    }
  }

  async function submitMessage(content) {
    const conversationId = selectedConversation.value?.id;
    const value = content?.trim();

    if (!conversationId || !value || sendingMessage.value) return false;

    sendingMessage.value = true;
    errorSending.value = "";

    try {
      const response = await sendMessage({
        conversation_id: conversationId,
        content: value,
      });
      const sentMessage = responseData(response).message || responseData(response);

      if (sentMessage?.id) messages.value.push(sentMessage);
      return true;
    } catch (error) {
      errorSending.value = getError(error, "Não foi possível enviar a mensagem.");
      return false;
    } finally {
      sendingMessage.value = false;
    }
  }

  return {
    channels,
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
  };
}