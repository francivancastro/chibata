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
                v-model="item.nome"
                label="Nome"
                :rules="notEmptyRule"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="item.cpf"
                label="CPF"
                v-mask="'###.###.###-##'"
                :rules="[(v) => validaCpf(v) || 'CPF Inválido']"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="item.email"
                label="Email"
                :rules="emailRules"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="item.password"
                label="Senha"
                :rules="passwordRules"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="item.grupo"
                :items="grupos"
                item-title="name"
                return-object
                label="Grupo de Acesso"
                :rules="notEmptyRule"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12">
              <v-switch
                v-model="item.status"
                :label="item.status === 0 ? 'Ativo' : 'Inativo'"
                :true-value="0"
                :false-value="1"
                color="success"
                inset
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
      grupos: [],
      statusMap: null,
      isNew: true,
      item: {},
      isLoading: false,

      notEmptyRule: [(v) => !!v || "Campo Obrigatório"],
      emailRules: [
        (v) => !!v || "É necessário um e-mail",
        (v) => /.+@.+\..+/.test(v) || "E-mail inválido",
      ],
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

    passwordRules() {
      if (this.propItem && !this.item.password) return [];
      return [
        (v) =>
          (v || "").length >= 6 || "A senha precisa de pelo menos 6 caracteres",
      ];
    },

    statusItems() {
      if (!this.statusMap) return [];

      if (!Array.isArray(this.statusMap)) {
        return Object.entries(this.statusMap).map(([key, value]) => ({
          title: value,
          value: Number(key),
        }));
      }

      return this.statusMap.map((item) => ({
        title: item.value,
        value: item.key,
      }));
    },
  },

  async created() {
    try {
      const gruposRes = await http.post(`/grupo/list`);

      const list = gruposRes.data?.data?.list || [];

      this.grupos = list.map((g) => ({
        id: g.id,
        name: g.name,
      }));

      const possuiFlag = ["usuario", "grupo", "log"];

      if (possuiFlag.includes(this.type)) {
        const data = await http.post(`/parametro/getValue`, {
          key: [`${this.type}StatusMap`],
        });

        this.statusMap = data.data?.data?.[0]?.value || null;
      }

      if (this.propItem) {
        this.isNew = false;

        this.item = JSON.parse(JSON.stringify(this.propItem));

        if (typeof this.item.grupo === "number") {
          this.item.grupo = this.grupos.find((g) => g.id === this.item.grupo);
        }

        delete this.item.password;
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
          await http.put(`/${this.type}/update`, this.item);
        } else {
          await http.post(`/${this.type}/add`, this.item);
        }

        this.$notify("Item salvo");
        this.closeDialog();
      } catch (err) {
        console.log(err);
        this.$notify({
          title: "Atenção",
          text: "Erro ao salvar",
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

    validaCpf(c) {
      if (!c) return false;

      const notDig = (i) => ![".", "-", " "].includes(i);
      const cpf = c.trim().split("").filter(notDig).map(Number);

      if (cpf.length !== 11) return false;
      if (cpf.every((d) => d === cpf[0])) return false;

      const calc = (base) =>
        cpf
          .slice(0, base)
          .reduce((acc, num, idx) => acc + num * (base + 1 - idx), 0);

      const dv = (base) => {
        const res = 11 - (calc(base) % 11);
        return [10, 11].includes(res) ? 0 : res;
      };

      return dv(9) === cpf[9] && dv(10) === cpf[10];
    },
  },
};
</script>
