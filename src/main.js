import { createApp } from "vue";
import Cookies from "js-cookie";

import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";

import Notifications from "@kyvg/vue3-notification";

import permission from "@/utils/permissions";
import {
  isLocalPreviewEnabled,
  localPreviewUser,
  requestLocalPreview,
} from "@/utils/local-preview";

// Remove duplicatas legadas de cookies criados com path "" (escopo de diretório).
// Se o mesmo nome existe em mais de um path, unifica tudo em path "/".
function normalizeCookie(name, expires) {
  const occurrences = document.cookie
    .split(";")
    .map((c) => c.trim())
    .filter((c) => c.startsWith(`${name}=`)).length;

  if (occurrences <= 1) return;

  const value = Cookies.get(name);

  const segments = window.location.pathname.split("/").filter(Boolean);
  const paths = ["/", ""];
  let acc = "";
  for (const segment of segments) {
    acc += `/${segment}`;
    paths.push(acc);
  }

  for (const path of paths) {
    Cookies.remove(name, { path });
  }

  if (value !== undefined) {
    Cookies.set(name, value, { path: "/", expires });
  }
}

function bootstrap() {
  normalizeCookie("token", 1);
  normalizeCookie("refreshToken", 7);
  normalizeCookie("user", 1);
  normalizeCookie("config", 1);

  requestLocalPreview();

  // O store de auth já lê token, refreshToken e user dos cookies (com tratamento
  // de cookie corrompido). Aqui só entra a prévia local, que não tem API.
  if (isLocalPreviewEnabled() && !store.getters["auth/isLogged"]) {
    store.commit("auth/LOGIN", { accessToken: "local-preview" });
    store.commit("auth/setUserData", localPreviewUser);
    store.commit("config/SET_CONFIG", {
      nome: "Prévia local",
      descricao: "Navegação visual sem conexão com a API",
    });
  }

  const app = createApp(App);

  app.use(router);
  app.use(store);
  app.use(vuetify);
  app.use(Notifications);

  app.directive("permission", permission);

  app.mount("#app");
}

bootstrap();
