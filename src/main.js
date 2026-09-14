import { createApp } from "vue";

import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";

import Cookies from "js-cookie";

import Notifications from "@kyvg/vue3-notification";

import permission from "@/utils/permissions";

async function bootstrap() {
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