import { createApp } from "vue";

import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";

import Cookies from "js-cookie";

import Notifications from "@kyvg/vue3-notification";

import permission from "@/utils/permissions";

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

async function bootstrap() {
  normalizeCookie("token", 1);
  normalizeCookie("refreshToken", 7);
  normalizeCookie("user", 1);
  normalizeCookie("config", 1);

  const token = Cookies.get("token");
  const refreshToken = Cookies.get("refreshToken");
  const user = Cookies.get("user");

  if (token) {
    store.commit("auth/LOGIN", {
      accessToken: token,
      refreshToken: refreshToken || "",
    });
  }

  if (user) {
    store.commit("auth/setUserData", JSON.parse(user));
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