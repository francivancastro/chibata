import { createApp } from "vue";

import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";

import Cookies from "js-cookie";

import Notifications from "@kyvg/vue3-notification";

import permission from "@/utils/permissions";
import {
  isLocalPreviewEnabled,
  localPreviewUser,
  requestLocalPreview,
} from "@/utils/local-preview";

async function bootstrap() {
  requestLocalPreview();

  const token = Cookies.get("token");
  const refreshToken = Cookies.get("refreshToken");
  const user = Cookies.get("user");

  if (isLocalPreviewEnabled() && !token) {
    store.commit("auth/LOGIN", {
      accessToken: "local-preview",
    });
    store.commit("auth/setUserData", localPreviewUser);
    store.commit("config/SET_CONFIG", {
      nome: "Prévia local",
      descricao: "Navegação visual sem conexão com a API",
    });
  } else if (token) {
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
