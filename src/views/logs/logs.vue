<template>
  <v-container class="workspace-page">
    <h1>Logs do sistema</h1>
    <p class="page-description">Acompanhe o histórico da sua operação.</p>
    <v-card class="empty-panel" variant="outlined">
      <PhFileText :size="40" weight="regular" aria-hidden="true" />
      <h2>Histórico ainda indisponível</h2>
      <p>A integração de auditoria ainda não foi implementada nesta versão.</p>
    </v-card>
  </v-container>
</template>
<script setup>
import { PhFileText } from "@phosphor-icons/vue";
</script>
