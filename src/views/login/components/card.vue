<template>
  <v-card class="auth-card" variant="flat">
    <header class="auth-form-heading">
      <h2>Entrar</h2>
      <p>Use o usuário e a senha do seu workspace.</p>
    </header>

    <v-alert v-if="sessionExpired" class="mb-5" type="info" variant="tonal" density="compact" role="status">
      Sua sessão expirou. Entre de novo para continuar de onde parou.
    </v-alert>

    <v-form ref="loginForm" @submit.prevent="login">
      <v-text-field
        v-model="credentials.username"
        label="Usuário"
        autocomplete="username"
        :rules="[requiredRule]"
      />

      <v-text-field
        v-model="credentials.password"
        label="Senha"
        autocomplete="current-password"
        :type="showPassword ? 'text' : 'password'"
        :rules="[requiredRule]"
      >
        <template #append-inner>
          <button
            type="button"
            class="password-toggle"
            :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
            :aria-pressed="showPassword"
            @click="showPassword = !showPassword"
          >
            <component :is="showPassword ? PhEyeSlash : PhEye" :size="20" aria-hidden="true" />
          </button>
        </template>
      </v-text-field>

      <v-alert v-if="errorText" class="mb-4" type="error" variant="tonal" density="compact" role="alert">{{ errorText }}</v-alert>

      <v-btn :loading="isLoading" block size="large" color="primary" type="submit">Entrar</v-btn>
    </v-form>

    <p class="auth-back">Ainda não tem conta? <RouterLink to="/register">Criar conta</RouterLink></p>
  </v-card>
</template>

<script setup>
import { computed, ref } from "vue";
import http, { errorMessage } from "@/plugins/axios";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { PhEye, PhEyeSlash } from "@phosphor-icons/vue";

const store = useStore();
const route = useRoute();
const router = useRouter();

const loginForm = ref(null);
const isLoading = ref(false);
const errorText = ref("");
const showPassword = ref(false);
const credentials = ref({ username: "", password: "" });

const sessionExpired = computed(() => route.query.expired === "1");
const requiredRule = (v) => !!v || "Campo obrigatório";

function redirectTarget() {
  const target = route.query.redirect;
  return typeof target === "string" && target.startsWith("/") && !target.startsWith("//") ? target : "/";
}

async function login() {
  if (isLoading.value) return;

  const { valid } = await loginForm.value.validate();
  if (!valid) return;

  isLoading.value = true;
  errorText.value = "";

  try {
    const { data } = await http.post("/usuario/login", {
      username: credentials.value.username,
      password: credentials.value.password,
    });
    const { accessToken, refreshToken } = data.data;

    // Busca o perfil ANTES de gravar a sessão: se falhar, o usuário não fica
    // "meio logado" sem permissões (M8).
    const profile = await http.get("/usuario/profile", { headers: { Authorization: accessToken } });

    store.commit("auth/LOGIN", { accessToken, refreshToken });
    store.commit("auth/setUserData", profile.data.data);

    router.replace(redirectTarget());
  } catch (err) {
    errorText.value = err?.network
      ? errorMessage(err)
      : "Não foi possível entrar. Confira usuário e senha e tente de novo.";
  } finally {
    isLoading.value = false;
  }
}
</script>
