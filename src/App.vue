<template>
  <v-app class="command-app">
    <a class="skip-link" href="#main-content">Ir para o conteúdo</a>
    <AppBar v-if="showNavigation" />
    <Drawer v-if="showNavigation" />

    <v-main id="main-content">
      <router-view />
    </v-main>

    <notifications position="bottom right" :max="4" :duration="5000" />
  </v-app>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

import AppBar from "@/components/AppBar.vue";
import Drawer from "@/components/Drawer.vue";

const store = useStore();
const route = useRoute();

const isLogged = computed(() => store.getters["auth/isLogged"]);

// O editor de funil usa a tela inteira; login e cadastro não têm navegação.
const showNavigation = computed(
  () => isLogged.value && !route.meta.guestOnly && !route.meta.fullscreen && route.name !== undefined,
);
</script>

<style>
::-webkit-scrollbar { width: 11px; height: 11px; }
::-webkit-scrollbar-track { background-color: var(--ch-bg); }
::-webkit-scrollbar-thumb {
  background-color: var(--ch-line-strong);
  border-radius: 20px;
  border: 3px solid transparent;
  background-clip: content-box;
}
::-webkit-scrollbar-thumb:hover { background-color: var(--ch-faint); }
</style>
