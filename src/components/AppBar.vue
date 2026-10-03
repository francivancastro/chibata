<template>
  <v-app-bar elevation="0" height="60" class="shell-topbar">
    <v-btn icon variant="text" aria-label="Alternar menu de navegação" class="shell-nav-toggle" @click="toggleDrawer">
      <PhList :size="21" aria-hidden="true" />
    </v-btn>

    <v-toolbar-title>{{ routeTitle }}</v-toolbar-title>

    <v-spacer />
    <span v-if="isLocalPreview" class="shell-preview-badge">Prévia local · sem API</span>
    <span class="shell-breadcrumb">{{ systemName || "Chibata" }}</span>
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
const routeTitle = computed(() => route.meta.title || "Workspace");

function toggleDrawer() {
  store.commit("drawer/TOGGLE_DRAWER");
}
</script>
