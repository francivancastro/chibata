<template>
  <v-navigation-drawer v-model="drawer" :width="isMobile ? 300 : 180" app>
    <template #prepend>
      <div class="pa-3 text-center">
        <v-img contain height="60" src="@/assets/prefs.png" />

        <div class="font-weight-bold mt-2">
          {{ systemName }}
        </div>

        <div v-if="systemDescription" class="text-caption text-grey">
          {{ systemDescription }}
        </div>
      </div>
    </template>

    <v-list class="pt-0">
      <div v-for="(item, i) in routes" :key="i">
        <v-list-item
          v-if="item.to ? services.includes(item.to) : true"
          :to="item.to ? '/' + item.to : '/'"
        >
          <template #prepend>
            <v-icon>{{ item.icon }}</v-icon>
          </template>

          <v-list-item-title>
            {{ item.title }}
          </v-list-item-title>
        </v-list-item>
      </div>
    </v-list>

    <template #append>
      <v-footer class="pa-2 d-flex align-center">
        <v-avatar size="40" color="secondary">
          <v-icon color="white"> mdi-account-circle </v-icon>
        </v-avatar>

        <div class="ml-2">
          <div>{{ user?.usuario?.nome }}</div>

          <v-btn size="x-small" variant="text" @click="logout"> SAIR </v-btn>
        </div>
      </v-footer>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { useDisplay } from "vuetify";
import { useRouter } from "vue-router";

const store = useStore();
const display = useDisplay();
const router = useRouter();

const services = computed(() => store.getters["auth/getServices"]);

const user = computed(() => store.state.auth.user);

const systemName = computed(() => store.getters["config/getNome"]);

const systemDescription = computed(() => store.getters["config/getDescricao"]);

const drawer = computed({
  get: () => store.state.drawer.showDrawer,
  set: () => store.commit("drawer/CHANGE_DRAWER"),
});

const isMobile = computed(() => ["xs", "sm"].includes(display.name.value));

function logout() {
  store.commit("auth/LOGOUT");
  store.commit("config/CLEAR_CONFIG");
  store.commit("drawer/CHANGE_DRAWER", false);

  router.push("/login");
}

const routes = [
  {
    icon: "mdi-home",
    title: "Início",
    to: "",
  },
  {
    icon: "mdi-robot",
    title: "Bot",
    to: "bot",
  },
  {
    icon: "mdi-inbox-arrow-down",
    title: "Inbox",
    to: "inbox",
  },
  {
    icon: "mdi-filter-settings",
    title: "Funil",
    to: "funil",
  },
  {
    icon: "mdi-shopping",
    title: "Produtos",
    to: "produto",
  },
  {
    icon: "mdi-account-box-multiple",
    title: "Grupos",
    to: "grupo",
  },
  {
    icon: "mdi-card-account-details",
    title: "Usuários",
    to: "usuario",
  },
  {
    icon: "mdi-dump-truck",
    title: "Obras",
    to: "projeto",
  },
  {
    icon: "mdi-code-json",
    title: "Parametro",
    to: "parametro",
  },
  {
    icon: "mdi-key-link",
    title: "Logs",
    to: "log",
  },
];
</script>
