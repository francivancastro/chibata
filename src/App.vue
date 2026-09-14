<template>
  <v-app style="background-color: #e6f4ff">
    <AppBar v-if="showNavigation" />
    <Drawer v-if="showNavigation" />

    <v-main>
      <router-view />
    </v-main>

    <notifications position="bottom left" />
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

const hiddenRoutes = ["Login", "Obras"];

const isLogged = computed(() => store.getters["auth/isLogged"]);

const showNavigation = computed(() => {
  return isLogged.value && !hiddenRoutes.includes(route.name);
});
</script>

<style>
/* custom scrollbar */
::-webkit-scrollbar {
  width: 11px;
}

::-webkit-scrollbar-track {
  background-color: white;
}

::-webkit-scrollbar-thumb {
  background-color: #d6dee1;
  border-radius: 20px;
  border: 3px solid transparent;
  background-clip: content-box;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #a8bbbf;
}
</style>
