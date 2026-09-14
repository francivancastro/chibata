<template>
  <v-card-text>
    {{ arquivos }}
    <v-data-table
      :headers="headers"
      :items="arquivos"
      @click:row="openFile"
      hide-default-footer
      disable-pagination
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Anexos - Licitação</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-btn
            :disabled="!isEditing || isLoading"
            color="primary"
            class="mb-2"
            @click="$refs.uploader.click()"
          >
            Adicionar
          </v-btn>
          <input
            ref="uploader"
            style="display: none"
            type="file"
            @change="onFileChanged"
          />
        </v-toolbar>
      </template>
      <template v-if="isEditing" v-slot:[`item.actions`]="{ item, index }">
        <v-btn :disabled="isLoading" text @click.stop="deleteItem(item, index)">
          <div class="d-flex flex-column text-caption">
            <v-icon small>mdi-delete</v-icon>
            REMOVER
          </div>
        </v-btn>
      </template>
      <template v-slot:[`item.status`]="{ item }">
        {{ item.id ? "Publicado" : "Pendente" }}
      </template>
    </v-data-table>
  </v-card-text>
</template>

<script>
import http from "@/plugins/axios";

export default {
  props: {
    value: Array,
    isEditing: Boolean,
    isLoading: Boolean,
  },
  created() {
    this.arquivos = JSON.parse(JSON.stringify(this.value));
  },
  watch: {
    arquivos: {
      async handler(newValue) {
        let toEmit = newValue.map((item) => {
          if (item.id) return item;
          else {
            return {
              caminho: item.base,
              tipo: "LICITACAO",
            };
          }
        });

        console.log(toEmit);
        this.$emit("input", toEmit);
      },
      deep: true,
    },
  },

  data: () => ({
    dialog: false,
    arquivos: [],
    headers: [
      { text: "Nome", value: "caminho", sortable: false },
      { text: "Status", value: "status", sortable: false },
      { text: "", value: "actions", sortable: false },
    ],
  }),
  methods: {
    async onFileChanged(e) {
      let selectedFile = e.target.files[0];

      let base64 = await this.convertToBase64(selectedFile);

      this.arquivos.unshift({
        caminho: selectedFile.name,
        base: base64,
      });
    },
    deleteItem(e, index) {
      this.arquivos.splice(index, 1);
    },
    async openFile(file) {
      if (file.base) {
        fetch(file.base)
          .then((res) => res.blob())
          .then((e) => {
            // create temp download url
            const downloadUrl = window.URL.createObjectURL(e);

            // open pdf file on new tab
            window.open(downloadUrl, "__blank");

            // remove temp url
            window.URL.revokeObjectURL(downloadUrl);
          });
        return;
      }
      console.clear();

      try {
        console.log(file);
        let resp = await http.get(`/anexo/download/${file.id}`, {
          responseType: "blob",
        });

        let blobFile = resp.data.slice(
          0,
          resp.data.size,
          this.getFileType(file.caminho)
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
      // console.log(e);
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