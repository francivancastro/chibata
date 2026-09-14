<template>
  <v-dialog
    v-model="dialogState"
    max-width="600px"
    @keydown.esc="closeDialog()"
    @click:outside="closeDialog()"
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">Situação</span>
        <v-spacer></v-spacer>

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
      <!-- <v-card-text style="color: black">
        <p class="text-h6">Ultimo Atendimento</p>
        <p>
          {{ getStatus(propItem.lastAtendimento.status) }}
        </p>
        <p>
          Data do Status:
          {{ timestampToDate(propItem.lastAtendimento.dataSolicitacao) }}
        </p>
      </v-card-text> -->
      <v-card-text style="color: black">
        <v-form ref="form" @submit.prevent="salvar()" :disabled="isLoading">
          <v-select
            v-model="form.status"
            :items="nextStatusList"
            label="Mover situação para"
            :rules="notEmptyRule"
            outlined
          ></v-select>
          <v-text-field
            placeholder="Observação"
            v-model="form.observacao"
            outlined
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text color="primary" :loading="isLoading" @click="salvar">
          <v-icon left>mdi-content-save</v-icon>
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
    propItem: Object,
    dialogState: Boolean,
  },
  created() {
    if (this.propItem) {
      this.item = JSON.parse(JSON.stringify(this.propItem));
    }
  },
  computed: {
    nextStatusList() {
      let temp = [];

      try {
        switch (this.propItem.lastAtendimento.status) {
          case "ANALISE":
            temp = [
              { text: "Correção", value: "CORRECAO" },
              { text: "Emissão", value: "EMISSAO" },
              { text: "Cancelado", value: "CANCELADO" },
            ];
            break;
          case "CORRECAO":
            temp = [
              { text: "Análise", value: "ANALISE" },
              { text: "Emissão", value: "EMISSAO" },
              { text: "Cancelado", value: "CANCELADO" },
            ];
            break;
          case "EMISSAO":
            temp = [
              { text: "Emitido", value: "EMITIDO" },
              { text: "Cancelado", value: "CANCELADO" },
            ];
            break;
          case "EMITIDO":
            temp = [
              { text: "Entregue", value: "ENTREGUE" },
              { text: "Cancelado", value: "CANCELADO" },
            ];
            break;
          case "ENTREGUE": //ENCERROU O FLUXO
            break;
          case "CANCELADO": //ENCERROU O FLUXO
            break;
          default:
            break;
        }
      } catch (error) {}
      return temp;
    },
  },
  data: () => ({
    item: {},
    form: {},
    isLoading: false,
    notEmptyRule: [(v) => !!v || "Campo Obrigatório"],
  }),
  methods: {
    getStatus(status) {
      if (!status) return "";
      switch (status) {
        case "ANALISE":
          return "Em análise";

        case "CORRECAO":
          return "Necessita de correções";

        case "EMISSAO":
          return "Aguardando emissão de Cartão";

        case "EMITIDO":
          return "Cartão emitido";

        case "ENTREGUE":
          return "Cartão entregue";

        case "CANCELADO":
          return "Atendimento cancelado";

        default:
          return "";
      }
    },
    async salvar() {
      if (this.isLoading) return;
      if (this.$refs.form.validate()) {
        this.isLoading = true;

        this.form.pessoaId = this.propItem.id;

        try {
          await http.post(`/atendimento`, this.form);
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
    timestampToDate(date) {
      if (!date) return null;

      try {
        let tempDate = new Date(date);
        return tempDate.toLocaleString();
      } catch (error) {
        return null;
      }
    },
    formatDate(date) {
      if (!date) return null;

      try {
        const [year, month, day] = date.split("-");
        return `${day}/${month}/${year}`;
      } catch (error) {
        return null;
      }
    },
    closeDialog() {
      this.$emit("close-dialog");
    },
  },
};
</script>

<style scoped>
p {
  padding: 0;
  margin: 0;
}
</style>