<template>
  <v-container class="pa-6">
    <h2>Configuração do Sistema</h2>

    <v-form @submit.prevent="save">
      <v-text-field v-model="nome" label="Nome do sistema" required />

      <v-text-field v-model="descricao" label="Descrição" />

      <v-btn type="submit" color="primary" class="mt-4" :loading="loading">
        Salvar configuração
      </v-btn>
    </v-form>
  </v-container>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import http from "@/plugins/axios";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

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
