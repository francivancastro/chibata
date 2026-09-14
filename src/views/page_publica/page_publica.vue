<template>
  <v-container fluid>
    <v-row align-content="center" justify="center" style="padding: 30px">
      <a href="https://parauapebas.pa.gov.br/">
        <v-img position="center " max-width="375" src="@/assets/prefeitura.png">
        </v-img>
      </a>
    </v-row>
    <p class="title text-center">
      Sistema de transparência dos projetos e obras da prefeitura municipal
    </p>

    <Obras />
  </v-container>
</template>

<script>
import Obras from "@/views/projetos/projetos.vue";
export default {
  components: {
    Obras,
  },
};
</script>

<style scoped>
</style>