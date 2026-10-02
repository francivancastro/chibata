<template>
  <v-container class="workspace-page">
    <header class="page-heading"><div><h1>Configuração do sistema</h1><p class="page-description">Dê identidade ao seu workspace e mantenha as informações da operação organizadas.</p></div><v-chip color="primary" variant="tonal"><PhGearSix :size="16" weight="regular" aria-hidden="true" />Preferências</v-chip></header>
    <div class="settings-grid">
    <v-card class="settings-form" variant="outlined">
    <div class="settings-section-title"><PhBuildings :size="24" weight="regular" class="text-primary" aria-hidden="true" /><div><h2>Identidade do workspace</h2><p>Como sua equipe reconhece este espaço.</p></div></div>
    <v-form @submit.prevent="save">
      <v-text-field v-model="nome" label="Nome do sistema" variant="outlined" density="comfortable" required />

      <v-text-field v-model="descricao" label="Descrição" variant="outlined" density="comfortable" />

      <v-btn type="submit" color="primary" class="mt-4" :loading="loading"><PhCheck :size="18" weight="regular" aria-hidden="true" />Salvar configuração</v-btn>
    </v-form>
    </v-card>
    <aside class="settings-note"><span class="settings-note-icon"><PhSlidersHorizontal :size="24" weight="regular" aria-hidden="true" /></span><h2>Um espaço com a sua identidade</h2><p>O nome e a descrição aparecem na navegação do sistema. Use informações claras para ajudar sua equipe a se localizar.</p><v-divider class="my-6" /><span class="text-caption text-medium-emphasis">As alterações são aplicadas ao salvar.</span></aside>
    </div>
  </v-container>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import http from "@/plugins/axios";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { PhBuildings, PhCheck, PhGearSix, PhSlidersHorizontal } from "@phosphor-icons/vue";

const router = useRouter();
const store = useStore();

const nome = ref("");
const descricao = ref("");
const loading = ref(false);

const config = computed(() => store.state.config);

const userId = computed(() => {
  return store.state.auth.user?.usuario?.id;
});

onMounted(() => {
  if (config.value?.nome) {
    nome.value = config.value.nome;
    descricao.value = config.value.descricao;
  }
});

async function save() {
  loading.value = true;

  try {
    const payload = {
      nome: nome.value,
      descricao: descricao.value,
      usuario_id: userId.value,
    };

    let response;

    if (!config.value?.nome) {
      response = await http.post("/configuracao/add", payload);
    } else {
      response = await http.put("/configuracao/update", payload);
    }

    const { data } = response;

    if (data.errno === 0) {
      // 🔥 1. atualiza Vuex imediatamente
      store.commit("config/SET_CONFIG", {
        nome: nome.value,
        descricao: descricao.value,
      });

      // 🔥 2. opcional: garante sync com backend
      // await store.dispatch("config/load");

      router.push("/");
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}
</script>
<style scoped>
.settings-grid{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(240px,1fr);gap:24px;align-items:start}.settings-form{padding:28px}.settings-section-title{display:flex;gap:14px;align-items:center;margin-bottom:28px}.settings-section-title h2{font-size:18px}.settings-section-title p{font-size:13px;color:var(--cc-muted);margin-top:4px}.settings-note{padding:28px;border-radius:16px;background:var(--cc-subtle);border:1px solid var(--cc-border)}.settings-note-icon{display:inline-grid;place-items:center;width:44px;height:44px;border-radius:12px;background:var(--cc-raised);color:var(--cc-accent);margin-bottom:20px}.settings-note h2{font-size:18px;line-height:1.4;margin-bottom:10px}.settings-note p{color:var(--cc-muted);font-size:14px;line-height:1.7}@media(max-width:900px){.settings-grid{grid-template-columns:1fr}}@media(max-width:600px){.settings-form,.settings-note{padding:20px}}
</style>
