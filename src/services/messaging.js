import http from "@/plugins/axios";

export function listChannels(payload = {}) {
  return http.post("/channel/list", payload);
}

export function listConversations(payload = {}) {
  return http.post("/conversation/list", payload);
}

export function detailConversation(id) {
  return http.post("/conversation/detail", { id });
}

export function listMessages(payload = {}) {
  return http.post("/message/list", payload);
}

export function sendMessage(payload) {
  return http.post("/message/send", payload);
}