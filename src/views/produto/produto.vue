<script setup>
import CrudPage from "@/components/crud/CrudPage.vue";
import config from "@/crud/produto";
</script>

<template>
  <CrudPage :config="config" />
</template>
