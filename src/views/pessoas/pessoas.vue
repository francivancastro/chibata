<template>
  <CustomTable :type="type" :tableHeaders="headers" :dialog="Dialog" />
</template>

<script>
import CustomTable from "@/components/Table.vue";
import Dialog from "./dialog.vue";
export default {
  name: "pessoas",
  components: {
    CustomTable,
    Dialog,
  },
  data() {
    return {
      Dialog,
      type: "pessoa",
      headers: [
        {
          text: "Nome",
          align: "left",
          value: "nome",
        },
        {
          text: "CPF",
          align: "left",
          value: "cpf",
        },
        {
          text: "E-mail",
          align: "left",
          value: "email",
        },
        {
          text: "Telefone",
          align: "left",
          value: "telefone",
        },
        {
          text: "Data de Cadastro",
          align: "left",
          value: "data_cadastro",
        },
      ],
    };
  },
};
</script>