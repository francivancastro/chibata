<template>
  <v-card class="auth-card" variant="flat">
    <header class="auth-form-heading"><h2>Criar conta</h2><p>Leva um minuto. Depois você conecta seu primeiro bot.</p></header>

    <v-form ref="formRef" v-model="formValid" @submit.prevent="register">
      <v-text-field
        v-model="form.nome"
        label="Nome"
        :rules="[requiredRule]"
      ></v-text-field>

      <v-text-field
        v-model="form.email"
        label="E-mail"
        :rules="[requiredRule, emailRule]"
      ></v-text-field>

      <v-text-field
        v-model="form.username"
        label="Usuário"
        :rules="[requiredRule]"
        :error-messages="usernameError"
        :loading="checkingUsername"
        @blur="checkUsername"
      ></v-text-field>

      <v-text-field
        v-model="form.password"
        label="Senha"
        :type="showPassword ? 'text' : 'password'"
        :rules="[requiredRule]"
      ><template #append-inner><button type="button" class="password-toggle" 
:aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'" :aria-pressed="showPassword" @click="showPassword = !showPassword"><component :is="showPassword ? PhEyeSlash : PhEye" :size="20" aria-hidden="true" /></button></template></v-text-field>

      <v-text-field
        v-model="form.confirmPassword"
        label="Repetir senha"
        :type="showPassword ? 'text' : 'password'"
        :rules="[requiredRule, passwordMatchRule]"
      ></v-text-field>

      <v-btn
        :loading="isLoading"
        block
        size="large"
        color="primary"
        type="submit"
      >
        Cadastrar
      </v-btn>

      <v-alert v-if="isError" class="mt-4" type="error" variant="tonal" density="compact" role="alert">{{ errorText }}</v-alert>
    </v-form>
    <RouterLink class="auth-back" to="/login">Já tem uma conta? Entrar</RouterLink>
  </v-card>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import http, { errorMessage } from "@/plugins/axios";
import { notify } from "@kyvg/vue3-notification";
import { PhEye, PhEyeSlash } from "@phosphor-icons/vue";

const router = useRouter();

const formRef = ref(null);

const isLoading = ref(false);
const isError = ref(false);
const errorText = ref("");
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
    // allowErrno: aqui errno 1 é resposta esperada ("usuário já existe"), não falha.
    const { data } = await http.post(
      "/usuario/isUsuarioExist",
      { username: form.value.username },
      { allowErrno: true },
    );

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
    await http.post("/usuario/register", {
      nome: form.value.nome,
      email: form.value.email,
      username: form.value.username,
      password: form.value.password,
    });

    notify({ type: "success", title: "Conta criada", text: "Entre com o usuário e a senha que você acabou de criar." });
    router.push("/login");
  } catch (err) {
    isError.value = true;
    errorText.value = errorMessage(err, "Não foi possível concluir o cadastro. Confira os campos e tente novamente.");
  } finally {
    isLoading.value = false;
  }
}
</script>
