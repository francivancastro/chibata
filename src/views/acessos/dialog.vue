<template>
  <v-dialog
    v-model="dialogState"
    max-width="600px"
    @keydown.esc="closeDialog()"
    @click:outside="closeDialog()"
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ type.toUpperCase() }}</span>
        <v-spacer></v-spacer>

        <v-btn
          v-if="!isNew"
          v-permission="'update'"
          :loading="isLoading"
          text
          @click="isNew = true"
        >
          <v-icon left>mdi-pencil</v-icon>
          Editar
        </v-btn>
        <v-btn
          text
          color="primary"
          :disabled="isLoading"
          @click="closeDialog()"
        >
          <v-icon left>mdi-close</v-icon>
          Fechar
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" @submit.prevent="salvar()" :disabled="!isNew">
          <v-row>
            <v-col cols="12" md="12">
              <v-text-field
                outlined
                v-model="item.nome"
                label="Nome"
                :rules="notEmptyRule"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="12">
              <v-text-field
                outlined
                v-model="item.cpf"
                label="cpf"
                :rules="notEmptyRule"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="12">
              <v-text-field
                outlined
                v-model="item.email"
                label="email"
                :rules="notEmptyRule"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="12">
              <v-text-field
                outlined
                v-model="item.telefone"
                label="telefone"
                :rules="notEmptyRule"
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          v-if="!isNew"
          v-permission="'remove'"
          text
          color="red"
          :loading="isLoading"
          :disabled="isSuper"
          @click="excluir"
        >
          <v-icon left>mdi-delete</v-icon>
          Excluir
        </v-btn>
        <v-btn
          :disabled="!isNew"
          text
          color="primary"
          :loading="isLoading"
          @click="salvar"
        >
          <v-icon left>mdi-content-save</v-icon>
          Salvar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import http from "@/plugins/axios";
import { list2Tree, tree2List } from "@/utils/tree.js";

export default {
  props: {
    type: String,
    propItem: Object,
    dialogState: Boolean,
  },
  async created() {
    if (this.propItem) {
      let tempList = await http.post(`/pessoa/detail`, { id: this.propItem.id });

      if (tempList.errno == 0) {
        this.selectedPermissions = tempList.data.regraList;
      }
      this.isNew = false;
      this.isSuper = this.propItem.id == 1;
      this.item = JSON.parse(JSON.stringify(this.propItem));
    }
  },
  data: () => ({
    isSuper: false,
    isNew: true,
    item: {},
    isLoading: false,
    notEmptyRule: [(v) => !!v || "Campo Obrigatório"],
  }),
  methods: {
    async salvar() {
      if (this.isLoading) return;
      if (this.$refs.form.validate()) {
        this.isLoading = true;

        try {
          if (this.propItem) {
            // UPDATE
            delete this.item.listaController;
            await http.put(`/${this.type}/update`, { pessoa: this.item });
          } else {
            // CREATE
            await http.post(`/${this.type}/add`, { pessoa: this.item });
          }
          this.$notify("Item salvo");
        } catch (error) {
          this.$notify({
            title: "Atenção",
            text: "Erro ao salvar alterações",
            type: "error",
          });
          console.log(error);
        }

        this.closeDialog();
      }
    },
    async excluir() {
      this.isLoading = true;

      try {
        await http.delete(`/${this.type}/remove`, {
          params: { id: this.item.id },
        });
        this.$notify("Item excluido");
      } catch (error) {
        this.$notify({
          title: "Atenção",
          text: "Erro ao excluir",
          type: "error",
        });
      }

      this.closeDialog();
    },
    closeDialog() {
      this.$emit("close-dialog");
    },
  },
};
</script>

<style>
.theme--light.v-input--is-disabled,
.theme--light.v-input--is-disabled input {
  color: black;
}
.v-input--is-disabled label.v-label.v-label--active {
  color: var(--v-primary-base) !important;
}
</style>
