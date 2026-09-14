<template>
  <v-app-bar color="primary" elevation="0">
    <v-app-bar-nav-icon color="white" @click="toggleDrawer" />

    <v-toolbar-title class="d-flex align-center">
      <span class="font-weight-bold" style="font-size: 25px; color: white">
        {{ systemName }}
      </span>

      <span
        v-if="!isMobile && systemDescription"
        class="ml-1"
        style="color: white"
      >
        - {{ systemDescription }}
      </span>
    </v-toolbar-title>

    <v-spacer />
  </v-app-bar>
</template>

<script setup>
import { computed } from "vue";
import { useDisplay } from "vuetify";
import { useStore } from "vuex";

const store = useStore();
const display = useDisplay();

const isMobile = computed(() => ["xs", "sm"].includes(display.name.value));

const systemName = computed(() => store.getters["config/getNome"]);

const systemDescription = computed(() => store.getters["config/getDescricao"]);

function toggleDrawer() {
  store.commit("drawer/CHANGE_DRAWER");
}
</script>
