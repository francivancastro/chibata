<template>
  <v-app-bar color="surface" elevation="0" height="64" class="shell-topbar">
    <v-btn icon variant="text" color="primary" aria-label="Alternar menu de navegação" class="shell-nav-toggle" @click="toggleDrawer">
      <PhList :size="21" weight="regular" aria-hidden="true" />
    </v-btn>

    <v-toolbar-title class="d-flex align-center">
      <span class="font-weight-medium">{{ routeTitle }}</span>

    </v-toolbar-title>

    <v-spacer />
    <span v-if="isLocalPreview" class="shell-preview-badge">PRÉVIA LOCAL</span>
    <span class="shell-breadcrumb">{{ systemName || 'Chibata CRM' }} / Workspace</span>
  </v-app-bar>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { isLocalPreviewEnabled } from "@/utils/local-preview";
import { PhList } from "@phosphor-icons/vue";

const store = useStore();
const route = useRoute();

const systemName = computed(() => store.getters["config/getNome"]);
const isLocalPreview = isLocalPreviewEnabled();

const routeTitle = computed(() => ({
  Home: "Visão geral",
  Bots: "Bots de atendimento",
  Inbox: "Inbox",
  Funis: "Funis e automações",
  "funil-editor": "Editor de automação",
  Produtos: "Produtos",
  Grupos: "Grupos de acesso",
  Usuários: "Usuários",
  Enumeração: "Parâmetros",
  Logs: "Logs do sistema",
}[route.name] || "Workspace"));

function toggleDrawer() {
  store.commit("drawer/TOGGLE_DRAWER");
}
</script>
