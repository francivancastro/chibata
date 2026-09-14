<template>
  <CustomTable :type="type" :tableHeaders="headers" :dialog="Dialog" />
</template>

<script>
import CustomTable from "@/components/Table.vue";
import Dialog from "./dialog.vue";
export default {
  name: "acessos",
  components: {
    CustomTable,
    Dialog,
  },
  data() {
    return {
      Dialog,
      type: "acesso",
      headers: [
        {
          text: "Pessoa",
          align: "left",
          value: "pessoa",
        },
        {
          text: "AP",
          align: "left",
          value: "ap_nome",
        },
        {
          text: "mac",
          align: "left",
          value: "mac",
        },
        {
          text: "Dispositivo",
          align: "left",
          value: "dispositivo",
        },
        {
          text: "Data de Acesso",
          align: "left",
          value: "data_cadastro",
        },
      ],
    };
  },
};
</script>
