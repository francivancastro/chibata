<template>
  <v-card class="auth-card" variant="flat">
    <header class="auth-form-heading"><h2>Crie sua conta</h2><p>Seu próximo atendimento começa com uma conexão.</p></header>

    <v-form ref="formRef" v-model="formValid" @submit.prevent="register">
      <v-text-field
        v-model="form.nome"
        label="Nome"
        :rules="[requiredRule]"
      ><template #prepend-inner><PhUser :size="18" weight="regular" aria-hidden="true" /></template></v-text-field>

      <v-text-field
        v-model="form.email"
        label="E-mail"
        :rules="[requiredRule, emailRule]"
      ><template #prepend-inner><PhEnvelope :size="18" weight="regular" aria-hidden="true" /></template></v-text-field>

      <v-text-field
        v-model="form.username"
        label="Usuário"
        :rules="[requiredRule]"
        :error-messages="usernameError"
        :loading="checkingUsername"
        @blur="checkUsername"
      ><template #prepend-inner><PhAt :size="18" weight="regular" aria-hidden="true" /></template></v-text-field>

      <v-text-field
        v-model="form.password"
        label="Senha"
        :type="showPassword ? 'text' : 'password'"
        :rules="[requiredRule]"
      ><template #prepend-inner><PhLock :size="18" weight="regular" aria-hidden="true" /></template><template #append-inner><button type="button" class="password-toggle" :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'" @click="showPassword = !showPassword"><component :is="showPassword ? PhEyeSlash : PhEye" :size="18" weight="regular" aria-hidden="true" /></button></template></v-text-field>

      <v-text-field
        v-model="form.confirmPassword"
        label="Repetir senha"
        :type="showPassword ? 'text' : 'password'"
        :rules="[requiredRule, passwordMatchRule]"
      ><template #prepend-inner><PhLockKey :size="18" weight="regular" aria-hidden="true" /></template></v-text-field>

      <v-btn
        :loading="isLoading"
        block
        size="large"
        color="primary"
        type="submit"
      >
        Cadastrar
      </v-btn>

      <v-alert v-if="isError" class="mt-4" type="error" variant="tonal" density="compact">Não foi possível concluir o cadastro. Confira os campos e tente novamente.</v-alert>
    </v-form>
    <RouterLink class="auth-back" to="/login">Já tem uma conta? Entrar</RouterLink>
  </v-card>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import http from "@/plugins/axios";
import { PhAt, PhEnvelope, PhEye, PhEyeSlash, PhLock, PhLockKey, PhUser } from "@phosphor-icons/vue";

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
