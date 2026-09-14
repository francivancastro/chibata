<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <Card :style="{ width: isMobile ? '100%' : '30%' }" />
  </v-container>
</template>

<script setup>
import { computed } from "vue";
import { useDisplay } from "vuetify";
import Card from "./components/card.vue";

const display = useDisplay();

const isMobile = computed(() => ["xs", "sm"].includes(display.name.value));
</script>
