import { createRouter, createWebHistory } from "vue-router";
import store from "@/store";
import { isLocalPreviewEnabled } from "@/utils/local-preview";

/*
 * meta.service: serviço de permissão da tela ("bot" em "bot:read").
 * Sem service = qualquer usuário logado. Antes as rotas só checavam login (M2).
 */
const routes = [
  { path: "/", name: "Home", meta: { requiresAuth: true, title: "Visão geral" }, component: () => import("../views/home/home.vue") },
  { path: "/inbox", name: "Inbox", meta: { requiresAuth: true, service: "inbox", title: "Inbox" }, component: () => import("../views/inbox/inbox.vue") },
  { path: "/funil", name: "Funis", meta: { requiresAuth: true, service: "funil", title: "Funis" }, component: () => import("../views/funil/funil.vue") },
  { path: "/funil/:id/editor", name: "funil-editor", meta: { requiresAuth: true, service: "funil", title: "Editor de funil", fullscreen: true }, component: () => import("@/views/funil/FunilEditor.vue") },
  { path: "/bot", name: "Bots", meta: { requiresAuth: true, service: "bot", title: "Bots" }, component: () => import("../views/bot/bot.vue") },
  { path: "/channel", name: "Canais", meta: { requiresAuth: true, title: "Canais" }, component: () => import("../views/channel/channel.vue") },
  { path: "/channel-account", alias: "/channel_account", name: "Contas de Canais", meta: { requiresAuth: true, title: "Contas de canais" }, component: () => import("../views/channel_account/channel_account.vue") },
  { path: "/produto", name: "Produtos", meta: { requiresAuth: true, service: "produto", title: "Produtos" }, component: () => import("../views/produto/produto.vue") },
  { path: "/grupo", name: "Grupos", meta: { requiresAuth: true, service: "grupo", title: "Grupos de acesso" }, component: () => import("../views/grupos/grupos.vue") },
  { path: "/usuario", name: "Usuários", meta: { requiresAuth: true, service: "usuario", title: "Usuários" }, component: () => import("../views/usuarios/usuarios.vue") },
  { path: "/parametro", name: "Enumeração", meta: { requiresAuth: true, service: "parametro", title: "Parâmetros" }, component: () => import("../views/parametro/parametro.vue") },
  { path: "/log", name: "Logs", meta: { requiresAuth: true, service: "log", title: "Auditoria" }, component: () => import("../views/logs/logs.vue") },
  { path: "/configuracao", name: "Configuração do Sistema", meta: { requiresAuth: true, skipConfig: true, title: "Configuração" }, component: () => import("../views/configuracao/configuracao.vue") },
  { path: "/indisponivel", name: "Indisponível", meta: { requiresAuth: true, skipConfig: true, title: "Servidor indisponível" }, component: () => import("../views/estado/ServidorIndisponivel.vue") },
  { path: "/sem-acesso", name: "Sem acesso", meta: { requiresAuth: true, title: "Sem acesso" }, component: () => import("../views/estado/SemAcesso.vue") },
  { path: "/login", name: "Login", meta: { guestOnly: true }, component: () => import("../views/login/login.vue") },
  { path: "/register", name: "Cadastro", meta: { guestOnly: true }, component: () => import("../views/register/register.vue") },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const isPreview = isLocalPreviewEnabled();
  const isLogged = isPreview || store.getters["auth/isLogged"];

  if (!to.matched.length) return "/";

  if (to.meta.guestOnly) {
    if (!isLogged) return true;
    const redirect = typeof to.query.redirect === "string" && to.query.redirect.startsWith("/") ? to.query.redirect : "/";
    return redirect;
  }

  if (to.meta.requiresAuth && !isLogged) {
    return { path: "/login", query: to.fullPath !== "/" ? { redirect: to.fullPath } : {} };
  }

  if (to.meta.service && !store.getters["auth/can"](to.meta.service)) {
    return { path: "/sem-acesso", query: { tela: to.meta.title || to.meta.service } };
  }

  if (isLogged && !isPreview && !to.meta.skipConfig && !store.getters["config/isLoaded"]) {
    const result = await store.dispatch("config/load");
    if (result === "empty") return "/configuracao";
    if (result === "error") return { path: "/indisponivel", query: { voltar: to.fullPath } };
  }

  return true;
});

export default router;
