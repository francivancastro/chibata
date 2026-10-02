<template>
  <v-card class="auth-card" variant="flat">
    <header class="auth-form-heading"><h2>Acesse seu workspace</h2><p>Entre com suas credenciais para continuar.</p></header>

    <v-form ref="loginForm" v-model="formValid" @submit.prevent="login">
      <v-text-field
        v-model="servidor.cpf"
        label="Usuário"
        autocomplete="username"
        :rules="[requiredRule]"
      ><template #prepend-inner><PhUser :size="18" weight="regular" aria-hidden="true" /></template></v-text-field>

      <v-text-field
        v-model="servidor.password"
        label="Senha"
        autocomplete="current-password"
        :type="showPassword ? 'text' : 'password'"
        :rules="[requiredRule]"
      ><template #prepend-inner><PhLock :size="18" weight="regular" aria-hidden="true" /></template><template #append-inner><button type="button" class="password-toggle" :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'" @click="showPassword = !showPassword"><component :is="showPassword ? PhEyeSlash : PhEye" :size="18" weight="regular" aria-hidden="true" /></button></template></v-text-field>

      <v-btn
        :loading="isLoading"
        block
        size="large"
        color="primary"
        type="submit"
      >
        Entrar
      </v-btn>

      <v-btn
        block
        size="large"
        variant="outlined"
        color="secondary"
        class="mt-2"
        @click="goRegister"
      >
        Criar uma conta
      </v-btn>

      <v-alert v-if="isError" class="mt-4" type="error" variant="tonal" density="compact">Não foi possível entrar. Confira seus dados e tente novamente.</v-alert>
    </v-form>
  </v-card>
</template>

<script setup>
import { ref } from "vue";
import http from "@/plugins/axios";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { PhEye, PhEyeSlash, PhLock, PhUser } from "@phosphor-icons/vue";

const store = useStore();
const router = useRouter();

const isLoading = ref(false);
const isError = ref(false);
const showPassword = ref(false);

const servidor = ref({
  cpf: "",
  password: "",
});

const formValid = ref(false);

const requiredRule = (v) => !!v || "Campo obrigatório";

async function login() {
  if (isLoading.value) return;

  isLoading.value = true;
  isError.value = false;

  try {
    const { data } = await http.post("/usuario/login", {
      username: servidor.value.cpf,
      password: servidor.value.password,
    });

    if (data.errno !== 0) {
      isError.value = true;
      return;
    }

    store.commit("auth/LOGIN", {
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
      username: data.data.username,
    });

    const profile = await http.get("/usuario/profile");

    if (profile.data.errno === 0) {
      store.commit("auth/setUserData", profile.data.data);
    }

    router.replace("/");
  } catch (err) {
    console.error(err);
    isError.value = true;
  } finally {
    isLoading.value = false;
  }
}

function goRegister() {
  router.push("/register");
}
</script>
