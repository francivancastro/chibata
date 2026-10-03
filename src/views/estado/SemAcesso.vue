<template>
  <section class="workspace-page">
    <div class="panel state-card">
      <span class="state-icon"><PhLock :size="24" aria-hidden="true" /></span>
      <h1>Você não tem acesso a {{ tela }}</h1>
      <p>Peça a um administrador para liberar essa área no seu grupo de acesso.</p>
      <RouterLink to="/" class="state-link">Voltar para a visão geral</RouterLink>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { PhLock } from "@phosphor-icons/vue";

const route = useRoute();
const tela = computed(() => (typeof route.query.tela === "string" && route.query.tela) || "esta área");
</script>

<style scoped>
.state-card { max-width: 560px; padding: 32px; display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }
.state-card h1 { margin: 4px 0 0; font-family: var(--ch-display); font-size: 26px; font-weight: 700; letter-spacing: -.02em; }
.state-card p { margin: 0; font-size: 14px; line-height: 1.6; color: var(--ch-ink-2); }
.state-icon { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 12px; background: var(--ch-sunken); color: var(--ch-ink-2); }
.state-link { margin-top: 6px; font-size: 14px; font-weight: 600; }
</style>
