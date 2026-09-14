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
                v-model="item.description"
                label="Nome"
                :rules="notEmptyRule"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="item.key"
                label="Key"
                :rules="notEmptyRule"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="item.value"
                label="Value"
                :rules="notEmptyRule"
                variant="outlined"
              />
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

export default {
  props: {
    type: String,
    propItem: Object,
    dialogState: Boolean,
  },

  emits: ["close-dialog"],

  data() {
    return {
      isSuper: false,
      isNew: true,
      item: {},
      isLoading: false,

      notEmptyRule: [(v) => !!v || "Campo Obrigatório"],
    };
  },

  computed: {
    dialogModel: {
      get() {
        return this.dialogState;
      },
      set(val) {
        if (!val) this.closeDialog();
      },
    },
  },

  async created() {
    if (!this.propItem) return;

    try {
      const res = await http.post(`/parametro/detail`, {
        id: this.propItem.id,
      });

      if (res.data?.errno === 0) {
        // nada obrigatório aqui por enquanto
      }

      this.isNew = false;
      this.isSuper = this.propItem.id === 1;

      this.item = JSON.parse(JSON.stringify(this.propItem));

      // cuidado: só se value for objeto
      if (this.item.value && typeof this.item.value === "object") {
        this.item.value = JSON.stringify(this.item.value, null, 2);
      }
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

      const valid = await this.$refs.form?.validate();
      if (!valid) return;

      this.isLoading = true;

      try {
        if (this.propItem) {
          await http.put(`/${this.type}/update`, {
            parametro: this.item,
          });
        } else {
          await http.post(`/${this.type}/add`, {
            parametro: this.item,
          });
        }

        this.$notify("Item salvo");
        this.closeDialog();
      } catch (err) {
        console.log(err);
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
      } catch (err) {
        console.log(err);
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
