<template>
  <v-row>
    <v-col cols="12">
      <v-btn v-if="item.id" @click="download(item)">
        <v-icon left> mdi-download-circle </v-icon>
        {{ label }}
      </v-btn>
      <v-file-input
        v-else
        v-model="item"
        v-bind="$attrs"
        :label="label"
        :rules="[...fileSizeRule]"
      ></v-file-input>
    </v-col>
  </v-row>
</template>

<script>
import rules from "@/utils/rules.js";
import http from "@/plugins/axios";

export default {
  props: {
    value: Object,
    label: String,
  },
  created() {
    if (this.value) {
      let temp = JSON.parse(JSON.stringify(this.value));
      this.item = temp;
    }
  },
  watch: {
    item: {
      async handler(newValue) {
        let temp = {};

        if (newValue.lastModified) {
          temp = await this.changeFile(newValue, "PROCURACAO");
        }

        this.$emit("input", temp);
      },
      deep: true,
    },
  },
  data: () => ({
    rules,
    item: {},
    fileSizeRule: [
      (value) =>
        !value ||
        value.size < 10000000 ||
        "O Arquivo não pode ser maior que 10 MB",
    ],
  }),
  methods: {
    async download(file) {
      console.clear();

      try {
        let resp = await http.get(`/documento/download/${file.id}`, {
          responseType: "blob",
        });

        let blobFile = resp.data.slice(
          0,
          resp.data.size,
          this.getFileType(file.nome)
        );

        // create temp download url
        const downloadUrl = window.URL.createObjectURL(blobFile);

        // open pdf file on new tab
        window.open(downloadUrl, "__blank");

        // remove temp url
        window.URL.revokeObjectURL(downloadUrl);
      } catch (e) {
        console.log(e);
      }
    },
    async changeFile(file, type) {
      if (file) {
        let base64 = await this.convertToBase64(file);
        let temp = {
          tipo: type,
          nome: base64,
        };

        return temp;
      }
    },
    async convertToBase64(file) {
      let base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      return base64;
    },
    getFileType(name) {
      if (name.includes(".png")) return "image/png";
      if (name.includes(".jpeg")) return "image/jpeg";
      if (name.includes(".jpg")) return "image/jpg";
      if (name.includes(".pdf")) return "application/pdf";

      return "";
    },
  },
};
</script>

