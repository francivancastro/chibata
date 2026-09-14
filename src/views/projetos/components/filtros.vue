<template>
  <v-dialog
    v-model="dialogState"
    max-width="800px"
    @keydown.esc="closeDialog()"
    @click:outside="closeDialog()"
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">Filtros</span>
        <v-spacer></v-spacer>
        <v-btn text color="primary" @click="closeDialog()">
          <v-icon left>mdi-close</v-icon>
          Fechar
        </v-btn>
      </v-card-title>
      <v-card-text style="color: black">
        <v-form ref="form">
          <v-row>
            <v-col cols="12" class="pb-0">
              <span>Filtrar por período de cadastro</span>
            </v-col>
            <v-col cols="6">
              <v-text-field
                outlined
                v-model="filters.cadastroInicio"
                label="Data inicial"
                v-mask="'##/##/####'"
                :rules="[
                  (v) =>
                    (dateIsValid(v) && cadastroInRange()) || 'Data Inválida',
                ]"
                validate-on-blur
                hide-details="auto"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                outlined
                v-model="filters.cadastroFim"
                label="Data final"
                v-mask="'##/##/####'"
                :rules="[
                  (v) =>
                    (dateIsValid(v) && cadastroInRange()) || 'Data Inválida',
                ]"
                validate-on-blur
                hide-details="auto"
              ></v-text-field>
            </v-col>
            <v-col cols="12" class="py-0">
              <span>Filtrar por data de nascimento</span>
            </v-col>
            <v-col cols="6">
              <v-text-field
                outlined
                v-model="filters.nascimentoInicio"
                label="Data inicial"
                v-mask="'##/##/####'"
                :rules="[
                  (v) =>
                    (dateIsValid(v) && nascimentoInRange()) || 'Data Inválida',
                ]"
                validate-on-blur
                hide-details="auto"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                outlined
                v-model="filters.nascimentoFim"
                label="Data final"
                v-mask="'##/##/####'"
                :rules="[
                  (v) =>
                    (dateIsValid(v) && nascimentoInRange()) || 'Data Inválida',
                ]"
                validate-on-blur
                hide-details="auto"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-select
                outlined
                v-model="filters.proprioResponsavel"
                label="PCD é própria responsável?"
                :items="[
                  { text: 'Sim', value: 1 },
                  { text: 'Não', value: 0 },
                ]"
                hide-details="auto"
              ></v-select>
            </v-col>
            <v-col cols="3">
              <v-select
                outlined
                v-model="filters.sexo"
                label="Sexo"
                :items="['Masculino', 'Feminino', 'Outro(a)']"
                hide-details="auto"
              ></v-select>
            </v-col>
            <v-col cols="3">
              <v-select
                outlined
                v-model="filters.status"
                label="Status"
                :items="[
                  { text: 'Análise', value: 'ANALISE' },
                  { text: 'Correção', value: 'CORRECAO' },
                  { text: 'Emissão', value: 'EMISSAO' },
                  { text: 'Emitido', value: 'EMITIDO' },
                  { text: 'Entregue', value: 'ENTREGUE' },
                  { text: 'Cancelado', value: 'CANCELADO' },
                ]"
                hide-details="auto"
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-select
                outlined
                v-model="filters.rendaFamiliar"
                label="Renda Familiar"
                :items="[
                  'Até um salário mínimo',
                  'Entre 1 e 3 salários mínimos',
                  'Acima de 3 salários mínimos',
                ]"
                hide-details="auto"
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-select
                outlined
                v-model="filters.escolaridade"
                label="Escolaridade"
                :items="[
                  'Creche',
                  'Fundamental Incompleto',
                  'Fundamental Completo',
                  'Médio Incompleto',
                  'Médio Completo',
                  'Superior Incompleto',
                  'Superior Completo',
                  'Pós Graduação',
                  'Mestrado',
                  'Doutorado',
                  'Outro',
                  'Sem Instrução',
                ]"
                hide-details="auto"
              ></v-select>
            </v-col>
            <v-col cols="4">
              <v-select
                outlined
                v-model="filters.bpc"
                label="Usuário de BPC?"
                :items="[
                  { text: 'Sim', value: 1 },
                  { text: 'Não', value: 0 },
                ]"
                hide-details="auto"
              ></v-select>
            </v-col>
            <v-col cols="4">
              <v-select
                outlined
                v-model="filters.cadUnico"
                label="Cad Unico Atualizado?"
                :items="[
                  { text: 'Sim', value: 1 },
                  { text: 'Não', value: 0 },
                ]"
                hide-details="auto"
              ></v-select>
            </v-col>
            <v-col cols="4">
              <v-select
                outlined
                v-model="filters.deficienciaAdquirida"
                label="Deficiencia Adquirida"
                :items="[
                  { text: 'Sim', value: 1 },
                  { text: 'Não', value: 0 },
                ]"
                hide-details="auto"
              ></v-select>
            </v-col>
            <v-col cols="12">
              <v-autocomplete
                outlined
                multiple
                label="Bairro"
                v-model="filters.bairro"
                :items="bairros"
                item-text="bairro"
                item-value="bairro"
                hide-details="auto"
              ></v-autocomplete>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text color="primary" @click="clean">
          <v-icon left>mdi-delete-empty</v-icon>
          Limpar Filtros
        </v-btn>
        <v-btn text color="primary" @click="save">
          <v-icon left>mdi-content-save</v-icon>
          Salvar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import bairros from "@/utils/listas/bairros.js";

export default {
  props: {
    value: Object,
    dialogState: Boolean,
  },
  created() {
    if (this.value) {
      this.filters = JSON.parse(JSON.stringify(this.value));
      if (this.value.bairro) this.filters.bairro = this.value.bairro.split(",");
      if (this.value.cid) this.filters.cid = this.value.cid.split(",");
    }
  },
  data: () => ({
    bairros,
    filters: {},
  }),
  methods: {
    clean() {
      this.filters = {};
      this.$emit("input", this.filters);
      this.closeDialog();
    },
    save() {
      if (!this.$refs.form.validate()) return;
      if (this.filters.bairro)
        this.filters.bairro = this.filters.bairro.join(",");
      if (this.filters.cid) this.filters.cid = this.filters.cid.join(",");

      this.$emit("input", this.filters);
      this.closeDialog();
    },
    closeDialog() {
      this.$emit("close-dialog");
    },
    cadastroInRange() {
      if (this.filters.cadastroInicio && this.filters.cadastroFim) {
        let inicio = this.parseDate(this.filters.cadastroInicio);

        let final = this.parseDate(this.filters.cadastroFim);

        const dateInicio = new Date(inicio);

        const dateFinal = new Date(final);

        return dateInicio < dateFinal;
      } else {
        return true;
      }
    },
    nascimentoInRange() {
      if (this.filters.nascimentoInicio && this.filters.nascimentoFim) {
        let inicio = this.parseDate(this.filters.nascimentoInicio);

        let final = this.parseDate(this.filters.nascimentoFim);

        const dateInicio = new Date(inicio);

        const dateFinal = new Date(final);

        return dateInicio < dateFinal;
      } else {
        return true;
      }
    },
    parseDate(date) {
      // return YYYY-MM-DD format
      if (!date) return null;

      const [day, month, year] = date.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    },
    dateIsValid(dateStr) {
      if (!dateStr) return true;

      dateStr = this.parseDate(dateStr);

      const regex = /^\d{4}-\d{2}-\d{2}$/;

      if (dateStr.match(regex) === null) {
        return false;
      }

      const date = new Date(dateStr);

      let maxDate = Date.now();

      if (date.getFullYear() < 1900) return false;

      if (date > maxDate) return false;

      const timestamp = date.getTime();

      if (typeof timestamp !== "number" || Number.isNaN(timestamp)) {
        return false;
      }

      return date.toISOString().startsWith(dateStr);
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