<template>
  <section class="workspace-page">
    <div class="panel state-card" role="alert">
      <span class="state-icon state-icon--warn"><PhWifiSlash :size="24" aria-hidden="true" /></span>
      <h1>Não conseguimos falar com o servidor</h1>
      <p>Suas configurações continuam salvas. Assim que a conexão voltar, você segue para onde estava.</p>
      <div class="state-actions">
        <v-btn color="primary" :loading="checking" @click="tryAgain">Tentar agora</v-btn>
        <span v-if="!checking" class="state-hint">Nova tentativa em <span class="mono">{{ seconds }} s</span></span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { PhWifiSlash } from "@phosphor-icons/vue";

const RETRY_EVERY = 10;

const store = useStore();
const route = useRoute();
const router = useRouter();

const seconds = ref(RETRY_EVERY);
const checking = ref(false);
let timer = null;

function target() {
  const back = route.query.voltar;
  return typeof back === "string" && back.startsWith("/") ? back : "/";
}

async function tryAgain() {
  checking.value = true;
  const result = await store.dispatch("config/load");
  checking.value = false;
  seconds.value = RETRY_EVERY;

  if (result === "ok") router.replace(target());
  else if (result === "empty") router.replace("/configuracao");
}

onMounted(() => {
  timer = window.setInterval(() => {
    if (checking.value) return;
    seconds.value -= 1;
    if (seconds.value <= 0) tryAgain();
  }, 1000);
});

onBeforeUnmount(() => window.clearInterval(timer));
</script>

<style scoped>
.state-card { max-width: 560px; padding: 32px; display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }
.state-card h1 { margin: 4px 0 0; font-family: var(--ch-display); font-size: 26px; font-weight: 700; letter-spacing: -.02em; }
.state-card p { margin: 0; font-size: 14px; line-height: 1.6; color: var(--ch-ink-2); }
.state-icon { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 12px; }
.state-icon--warn { background: var(--ch-warn-soft); color: var(--ch-warn); }
.state-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; margin-top: 8px; }
.state-hint { font-size: 13px; color: var(--ch-muted); }
</style>
