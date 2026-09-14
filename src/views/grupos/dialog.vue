<template>
  <v-dialog
    v-model="dialogModel"
    max-width="600px"
    @keydown.esc="closeDialog"
    @click:outside="closeDialog"
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ type?.toUpperCase() }}</span>
        <v-spacer />

        <v-btn
          v-if="!isNew"
          v-permission="'update'"
          :disabled="isSuper"
          :loading="isLoading"
          variant="text"
          @click="isNew = true"
        >
          <v-icon start>mdi-pencil</v-icon>
          Editar
        </v-btn>

        <v-btn
          variant="text"
          color="primary"
          :disabled="isLoading"
          @click="closeDialog"
        >
          <v-icon start>mdi-close</v-icon>
          Fechar
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="salvar" :disabled="!isNew">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="item.name"
                label="Nome"
                :rules="notEmptyRule"
                variant="outlined"
              />
            </v-col>
          </v-row>

          <v-row v-for="grupo in permissoes" :key="grupo.description">
            <v-col cols="12">
              <p class="mb-0 font-weight-bold">
                {{ grupo.description?.toUpperCase() }}
              </p>

              <v-row>
                <v-col
                  v-for="perm in grupo.children"
                  :key="perm.id"
                  cols="12"
                  sm="4"
                  md="4"
                  class="py-0"
                >
                  <v-checkbox
                    v-model="selectedPermissions"
                    :label="perm.description"
                    :value="perm.id"
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn
          v-if="!isNew"
          v-permission="'remove'"
          color="red"
          variant="text"
          :loading="isLoading"
          :disabled="isSuper"
          @click="excluir"
        >
          <v-icon start>mdi-delete</v-icon>
          Excluir
        </v-btn>

        <v-btn
          :disabled="!isNew"
          color="primary"
          variant="text"
          :loading="isLoading"
          @click="salvar"
        >
          <v-icon start>mdi-content-save</v-icon>
          Salvar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import http from "@/plugins/axios";
import { list2Tree } from "@/utils/tree.js";

export default {
  props: {
    type: String,
    propItem: Object,
    dialogState: Boolean,
  },

  emits: ["close-dialog"],

  data() {
    return {
      dialogModel: this.dialogState,
      isSuper: false,
      permissoes: [],
      selectedPermissions: [],
      isNew: true,
      item: {},
      isLoading: false,
      notEmptyRule: [(v) => !!v || "Campo Obrigatório"],
    };
  },

  watch: {
    dialogState(val) {
      this.dialogModel = val;
    },
    dialogModel(val) {
      if (!val) this.closeDialog();
    },
  },

  async created() {
    const data = await http.post(`/regra/list`);
    this.permissoes = list2Tree(data.data.data);

    if (!this.propItem) return;

    try {
      const tempList = await http.post(`/grupo/detail`, {
        id: this.propItem.id,
      });

      if (tempList.data?.errno === 0) {
        tempList.data.data.regraList.forEach((el) => {
          this.selectedPermissions.push(el.id);
        });
      }

      this.isNew = false;
      this.isSuper = this.propItem.id === 1;
      this.item = JSON.parse(JSON.stringify(this.propItem));
    } catch (err) {
      console.log(err);
    }
  },

  methods: {
    closeDialog() {
      this.$emit("close-dialog");
    },

    async salvar() {
      if (this.isLoading) return;

      const valid = this.$refs.form?.validate();
      if (!valid) return;

      this.isLoading = true;

      try {
        if (this.propItem) {
          delete this.item.listaController;

          await http.put(`/${this.type}/update`, {
            grupo: this.item,
            regraList: this.selectedPermissions,
          });
        } else {
          await http.post(`/${this.type}/add`, {
            grupo: this.item,
            regraList: this.selectedPermissions,
          });
        }

        this.$notify("Item salvo");
        this.closeDialog();
      } catch (error) {
        console.log(error);
        this.$notify({
          title: "Atenção",
          text: "Erro ao salvar alterações",
          type: "error",
        });
      }

      this.isLoading = false;
    },

    async excluir() {
      this.isLoading = true;

      try {
        await http.delete(`/${this.type}/remove`, {
          params: { id: this.item.id },
        });

        this.$notify("Item excluído");
        this.closeDialog();
      } catch (error) {
        console.log(error);
        this.$notify({
          title: "Atenção",
          text: "Erro ao excluir",
          type: "error",
        });
      }

      this.isLoading = false;
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