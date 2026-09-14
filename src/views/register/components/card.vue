<template>
  <v-card class="pa-5 text-center" variant="outlined">
    <h2 style="height: 55px">Cadastro</h2>

    <v-form ref="formRef" v-model="formValid" @submit.prevent="register">
      <v-text-field
        v-model="form.nome"
        label="Nome"
        prepend-inner-icon="mdi-account"
        :rules="[requiredRule]"
      />

      <v-text-field
        v-model="form.cpf"
        label="CPF"
        prepend-inner-icon="mdi-card-account-details"
        :rules="[requiredRule]"
      />

      <v-text-field
        v-model="form.email"
        label="E-mail"
        prepend-inner-icon="mdi-email"
        :rules="[requiredRule, emailRule]"
      />

      <v-text-field
        v-model="form.username"
        label="Username"
        prepend-inner-icon="mdi-account-circle"
        :rules="[requiredRule]"
        :error-messages="usernameError"
        :loading="checkingUsername"
        @blur="checkUsername"
      />

      <v-text-field
        v-model="form.password"
        label="Senha"
        prepend-inner-icon="mdi-lock"
        :type="showPassword ? 'text' : 'password'"
        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="showPassword = !showPassword"
        :rules="[requiredRule]"
      />

      <v-text-field
        v-model="form.confirmPassword"
        label="Repetir senha"
        prepend-inner-icon="mdi-lock-check"
        :type="showPassword ? 'text' : 'password'"
        :rules="[requiredRule, passwordMatchRule]"
      />

      <v-btn
        :loading="isLoading"
        block
        size="large"
        color="primary"
        type="submit"
      >
        Cadastrar
      </v-btn>

      <div v-if="isError" class="text-red mt-2">
        Erro ao cadastrar, tente novamente
      </div>
    </v-form>
  </v-card>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import http from "@/plugins/axios";

const router = useRouter();

const formRef = ref(null);

const isLoading = ref(false);
const isError = ref(false);
const showPassword = ref(false);
const formValid = ref(false);

const checkingUsername = ref(false);
const usernameError = ref("");

const form = ref({
  nome: "",
  cpf: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
});

const requiredRule = (v) => !!v || "Campo obrigatório";

const emailRule = (v) => /.+@.+\..+/.test(v) || "E-mail inválido";

const passwordMatchRule = (v) =>
  v === form.value.password || "Senhas não conferem";

async function validateUsername() {
  if (!form.value.username) {
    usernameError.value = "Campo obrigatório";
    return false;
  }

  checkingUsername.value = true;
  usernameError.value = "";

  try {
    const { data } = await http.post("/usuario/isUsuarioExist", {
      username: form.value.username,
    });

    if (data.errno === 1) {
      usernameError.value = data.msg;
      return false;
    }

    return true;
  } catch {
    usernameError.value = "Erro ao validar username";
    return false;
  } finally {
    checkingUsername.value = false;
  }
}

async function checkUsername() {
  await validateUsername();
}

async function register() {
  if (isLoading.value) return;

  const { valid } = await formRef.value.validate();

  if (!valid) return;

  const usernameOk = await validateUsername();

  if (!usernameOk) return;

  isLoading.value = true;
  isError.value = false;

  try {
    const { data } = await http.post("/usuario/register", {
      nome: form.value.nome,
      cpf: form.value.cpf,
      email: form.value.email,
      username: form.value.username,
      password: form.value.password,
    });

    if (data.errno !== 0) {
      isError.value = true;
      return;
    }

    router.push("/login");
  } catch {
    isError.value = true;
  } finally {
    isLoading.value = false;
  }
}
</script>