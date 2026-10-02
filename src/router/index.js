import { createRouter, createWebHistory } from "vue-router";
import store from "@/store";
import Cookies from "js-cookie";
import { isLocalPreviewEnabled } from "@/utils/local-preview";

const routes = [
  {
    path: "/",
    name: "Home",
    meta: { requiresAuth: true },
    component: () => import("../views/home/home.vue"),
  },

  {
    path: "/bot",
    name: "Bots",
    meta: { requiresAuth: true },
    component: () => import("../views/bot/bot.vue"),
  },

  {
    path: "/inbox",
    name: "Inbox",
    meta: { requiresAuth: true },
    component: () => import("../views/inbox/inbox.vue"),
  },

  {
    path: "/funil",
    name: "Funis",
    meta: { requiresAuth: true },
    component: () => import("../views/funil/funil.vue"),
  },

  {
    path: "/funil/:id/editor",
    name: "funil-editor",
    meta: { requiresAuth: true },
    component: () => import("@/views/funil/FunilEditor.vue"),
  },

  {
    path: "/produto",
    name: "Produtos",
    meta: { requiresAuth: true },
    component: () => import("../views/produto/produto.vue"),
  },

  {
    path: "/grupo",
    name: "Grupos",
    meta: { requiresAuth: true },
    component: () => import("../views/grupos/grupos.vue"),
  },

  {
    path: "/usuario",
    name: "Usuários",
    meta: { requiresAuth: true },
    component: () => import("../views/usuarios/usuarios.vue"),
  },

  {
    path: "/login",
    name: "Login",
    component: () => import("../views/login/login.vue"),
  },

  {
    path: "/parametro",
    name: "Enumeração",
    component: () => import("../views/parametro/parametro.vue"),
  },

  {
    path: "/register",
    name: "Cadastro",
    component: () => import("../views/register/register.vue"),
  },

  // 🔥 CONFIG FORM REAL
  {
    path: "/configuracao",
    name: "Configuração do Sistema",
    component: () => import("../views/configuracao/configuracao.vue"),
    meta: { public: true },
  },

  {
    path: "/log",
    name: "Logs",
    meta: { requiresAuth: true },
    component: () => import("../views/logs/logs.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const isPreview = isLocalPreviewEnabled();
  const isLogged = isPreview || Cookies.get("token") !== undefined;

  const isPublic = to.meta.public === true;
  const requiresAuth = to.meta.requiresAuth === true;

  // rota inexistente
  if (!to.matched.length) return next("/");

  // login/register
  if (to.path === "/login") return isLogged ? next("/") : next();
  if (to.path === "/register") return isLogged ? next("/") : next();

  // auth check
  if (requiresAuth && !isLogged) {
    return next("/login");
  }

  // 🔥 CONFIG BOOTSTRAP (NÃO roda na tela de config)
  if (isLogged && !isPreview && !isPublic && !store.getters["config/isLoaded"]) {
    const ok = await store.dispatch("config/load");

    console.log("[ROUTER] config load result:", ok);

    // 🔥 SE NÃO TEM CONFIG → VAI PARA FORM REAL
    if (!ok) {
      return next("/configuracao");
    }
  }

  return next();
});

export default router;
