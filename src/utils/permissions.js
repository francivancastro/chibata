// v-permission="'add'" esconde o elemento quando o usuário não tem essa ação
// no serviço da rota atual (route.meta.service). Antes o serviço vinha do path
// inteiro e quebrava em rotas aninhadas como /funil/12/editor (M1).
// Também aceita objeto: v-permission="{ service: 'bot', action: 'remove' }".
import router from "@/router";
import store from "@/store";

function allowed(value) {
  if (!value) return true;
  const service = typeof value === "object" ? value.service : router.currentRoute.value?.meta?.service;
  const action = typeof value === "object" ? value.action : value;
  return store.getters["auth/can"](service, action);
}

function apply(el, binding) {
  el.style.display = allowed(binding.value) ? "" : "none";
}

export default {
  mounted: apply,
  updated: apply,
};
