import { createApp } from "vue";

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

function bootstrap() {
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
