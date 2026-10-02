<template>
  <v-navigation-drawer v-model="drawer" :width="isMobile ? 280 : 256" class="shell-sidebar" app>
    <template #prepend>
      <div class="shell-brand brand-wordmark"><span class="brand-symbol"><PhChatCenteredText :size="22" weight="regular" /></span>chibata</div>
      <div class="shell-workspace"><strong>{{ systemName || 'Meu workspace' }}</strong>{{ systemDescription || 'Central de relacionamento' }}</div>
      <p class="shell-nav-label">Workspace</p>
    </template>

    <v-list class="pt-0">
      <div v-for="(item, i) in routes" :key="i">
        <v-list-item
          v-if="item.to ? services.includes(item.to) : true"
          :to="item.to ? '/' + item.to : '/'"
        >
          <template #prepend>
            <component :is="item.icon" class="shell-icon" :size="19" :weight="routeIsActive(item.to) ? 'duotone' : 'regular'" aria-hidden="true" />
          </template>

          <v-list-item-title>
            {{ item.title }}
          </v-list-item-title>
        </v-list-item>
      </div>
    </v-list>

    <template #append>
      <v-footer class="shell-account d-flex align-center">
        <v-avatar size="36" color="primary" variant="tonal">
          <PhUserCircle :size="20" weight="regular" />
        </v-avatar>

        <div class="ml-2">
          <div class="shell-account-name">{{ user?.usuario?.nome || 'Minha conta' }}</div>

          <v-btn size="x-small" variant="text" @click="logout"><PhSignOut :size="15" weight="regular" aria-hidden="true" />Sair</v-btn>
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
import { clearLocalPreview } from "@/utils/local-preview";
import { useRoute } from "vue-router";
import {
  PhBracketsCurly,
  PhChatCenteredText,
  PhFunnel,
  PhHouseLine,
  PhKey,
  PhRobot,
  PhShoppingBag,
  PhSignOut,
  PhTrayArrowDown,
  PhTruck,
  PhUserCircle,
  PhUserList,
  PhUsersThree,
} from "@phosphor-icons/vue";

const store = useStore();
const display = useDisplay();
const router = useRouter();
const route = useRoute();

const services = computed(() => store.getters["auth/getServices"]);

const user = computed(() => store.state.auth.user);

const systemName = computed(() => store.getters["config/getNome"]);

const systemDescription = computed(() => store.getters["config/getDescricao"]);

const drawer = computed({
  get: () => store.state.drawer.showDrawer,
  set: (value) => store.commit("drawer/SET_DRAWER", value),
});

const isMobile = computed(() => ["xs", "sm"].includes(display.name.value));

function logout() {
  clearLocalPreview();
  store.commit("auth/LOGOUT");
  store.commit("config/CLEAR_CONFIG");
  store.commit("drawer/SET_DRAWER", false);

  router.push("/login");
}

function routeIsActive(path) {
  return path ? route.path.startsWith(`/${path}`) : route.path === "/";
}

const routes = [
  {
    icon: PhHouseLine,
    title: "Início",
    to: "",
  },
  {
    icon: PhRobot,
    title: "Bot",
    to: "bot",
  },
  {
    icon: PhTrayArrowDown,
    title: "Inbox",
    to: "inbox",
  },
  {
    icon: PhFunnel,
    title: "Funil",
    to: "funil",
  },
  {
    icon: PhShoppingBag,
    title: "Produtos",
    to: "produto",
  },
  {
    icon: PhUsersThree,
    title: "Grupos",
    to: "grupo",
  },
  {
    icon: PhUserList,
    title: "Usuários",
    to: "usuario",
  },
  {
    icon: PhTruck,
    title: "Obras",
    to: "projeto",
  },
  {
    icon: PhBracketsCurly,
    title: "Parametro",
    to: "parametro",
  },
  {
    icon: PhKey,
    title: "Logs",
    to: "log",
  },
];
</script>
