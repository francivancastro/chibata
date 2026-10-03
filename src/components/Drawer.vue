<template>
  <v-navigation-drawer v-model="drawer" :width="232" class="shell-sidebar" app>
    <div class="shell-brand"><span class="brand-symbol" aria-hidden="true">c</span>chibata</div>
    <div class="shell-workspace">
      <strong>{{ systemName || "Meu workspace" }}</strong>
      <span>{{ systemDescription || "Workspace" }}</span>
    </div>

    <nav aria-label="Navegação principal">
      <template v-for="section in visibleSections" :key="section.label">
        <p class="shell-nav-label">{{ section.label }}</p>
        <v-list class="pt-0" density="compact" nav>
          <v-list-item
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            :exact="item.to === '/'"
            :active="isActive(item.to)"
          >
            <template #prepend>
              <component :is="item.icon" class="shell-icon" :size="18" aria-hidden="true" />
            </template>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </template>
    </nav>

    <template #append>
      <div class="shell-account d-flex align-center">
        <v-avatar size="32" color="primary" variant="tonal">
          <span class="text-caption font-weight-bold">{{ initials }}</span>
        </v-avatar>
        <div class="flex-grow-1" style="min-width: 0">
          <div class="shell-account-name text-truncate">{{ userName }}</div>
          <div class="shell-account-role text-truncate">{{ userRole }}</div>
        </div>
        <v-btn icon variant="text" aria-label="Sair" @click="logout">
          <PhSignOut :size="18" aria-hidden="true" />
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, watch } from "vue";
import { useDisplay } from "vuetify";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { clearLocalPreview } from "@/utils/local-preview";
import {
  PhBracketsCurly,
  PhChatCenteredText,
  PhFileText,
  PhFunnel,
  PhGearSix,
  PhHouseLine,
  PhRobot,
  PhPlugsConnected,
  PhShareNetwork,
  PhShoppingBag,
  PhSignOut,
  PhUserList,
  PhUsersThree,
} from "@phosphor-icons/vue";

const store = useStore();
const route = useRoute();
const router = useRouter();

const sections = [
  {
    label: "Operação",
    items: [
      { title: "Visão geral", to: "/", icon: PhHouseLine },
      { title: "Inbox", to: "/inbox", service: "inbox", icon: PhChatCenteredText },
      { title: "Funis", to: "/funil", service: "funil", icon: PhFunnel },
      { title: "Bots", to: "/bot", service: "bot", icon: PhRobot },
      { title: "Canais", to: "/channel", icon: PhShareNetwork },
      { title: "Contas de canais", to: "/channel-account", icon: PhPlugsConnected },
      { title: "Produtos", to: "/produto", service: "produto", icon: PhShoppingBag },
    ],
  },
  {
    label: "Administração",
    items: [
      { title: "Usuários", to: "/usuario", service: "usuario", icon: PhUserList },
      { title: "Grupos de acesso", to: "/grupo", service: "grupo", icon: PhUsersThree },
      { title: "Parâmetros", to: "/parametro", service: "parametro", icon: PhBracketsCurly },
      { title: "Auditoria", to: "/log", service: "log", icon: PhFileText },
      { title: "Configuração", to: "/configuracao", icon: PhGearSix },
    ],
  },
];

const can = computed(() => store.getters["auth/can"]);
const visibleSections = computed(() =>
  sections
    .map((section) => ({ ...section, items: section.items.filter((item) => can.value(item.service)) }))
    .filter((section) => section.items.length),
);

const user = computed(() => store.state.auth.user);
const userName = computed(() => user.value?.usuario?.nome || user.value?.nome || "Minha conta");
const userRole = computed(() => user.value?.usuario?.grupo?.name || user.value?.grupo?.name || "Workspace");
const initials = computed(() =>
  userName.value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join(""),
);

const systemName = computed(() => store.getters["config/getNome"]);
const systemDescription = computed(() => store.getters["config/getDescricao"]);

const drawer = computed({
  get: () => store.state.drawer.showDrawer,
  set: (value) => store.commit("drawer/SET_DRAWER", value),
});

const display = useDisplay();
// No celular, o menu fecha ao trocar de tela.
watch(
  () => route.fullPath,
  () => {
    if (display.mdAndDown.value) store.commit("drawer/SET_DRAWER", false);
  },
);

function isActive(path) {
  return path === "/" ? route.path === "/" : route.path === path || route.path.startsWith(`${path}/`);
}

function logout() {
  clearLocalPreview();
  store.commit("auth/LOGOUT");
  store.commit("config/CLEAR_CONFIG");
  router.push("/login");
}
</script>
