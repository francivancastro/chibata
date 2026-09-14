<template>
  <v-card class="pa-5 text-center" variant="outlined">
    <h2 style="height: 55px">Acesso</h2>

    <v-form ref="loginForm" v-model="formValid" @submit.prevent="login">
      <v-text-field
        v-model="servidor.cpf"
        label="Username"
        prepend-inner-icon="mdi-account"
        :rules="[requiredRule]"
      />

      <v-text-field
        v-model="servidor.password"
        label="Senha"
        prepend-inner-icon="mdi-lock"
        :type="showPassword ? 'text' : 'password'"
        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="showPassword = !showPassword"
        :rules="[requiredRule]"
      />

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
        Registrar
      </v-btn>

      <div v-if="isError" class="text-red mt-2">
        Houve um erro, tente novamente
      </div>
    </v-form>
  </v-card>
</template>

<script setup>
import { ref } from "vue";
import http from "@/plugins/axios";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

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