<template>
  <v-dialog
    v-model="dialogState"
    max-width="80%"
    @keydown.esc="closeDialog()"
    @click:outside="closeDialog()"
  >
    <PrintThis ref="ficha">
      <Ficha v-if="!isNew" :person="item" />
    </PrintThis>
    <v-card>
      <v-card-title>
        <span class="text-h5">OBRAS</span>
        <v-spacer></v-spacer>
        <v-btn v-if="!isNew" :loading="isLoading" text @click="imprimirFicha">
          <v-icon left>mdi-printer</v-icon>
          FICHA
        </v-btn>
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

      <v-card-text class="pb-0">
        <v-tabs v-model="step">
          <v-tab> Dados </v-tab>
          <v-tab> Licitações </v-tab>
          <v-tab> Projetos </v-tab>
          <v-tab> Contratos </v-tab>
        </v-tabs>
      </v-card-text>

      <v-form ref="form" @submit.prevent="salvar()" :disabled="!isNew">
        <v-window v-model="step">
          <!-- dados pessoais -->
          <v-window-item eager :value="0">
            <v-card-text>
              <v-row>
                <v-col cols="12" md="12">
                  <v-row>
                    <v-col cols="12" md="12">
                      <v-row>
                        <v-col cols="12" md="8">
                          <v-text-field
                            outlined
                            v-model="item.objeto"
                            label="Objeto"
                            :rules="notEmptyRule"
                            hide-details="auto"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="4">
                          <v-select
                            outlined
                            v-model="item.situacao"
                            label="Situação"
                            :items="[
                              'Fase de Licitação',
                              'Execução',
                              'Finalizada',
                            ]"
                            hide-details="auto"
                          ></v-select>
                        </v-col>

                        <v-col cols="12" md="12">
                          <v-text-field
                            outlined
                            v-model="item.contrato"
                            label="Contratado"
                            hide-details="auto"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    outlined
                    v-model="item.ano"
                    label="Ano"
                    :rules="notEmptyRule"
                    hide-details="auto"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    outlined
                    v-model="item.processo"
                    label="Processo licitatório"
                    :rules="notEmptyRule"
                    hide-details="auto"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="4">
                  <v-menu
                    v-model="menu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        :value="formatDate(item.dataAbertura)"
                        label="Data Abertura"
                        prepend-inner-icon="mdi-calendar"
                        outlined
                        :rules="notEmptyRule"
                        v-bind="attrs"
                        v-on="on"
                        hide-details="auto"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="item.dataAbertura"
                      @change="menu = false"
                      :max="date"
                    ></v-date-picker>
                  </v-menu>
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    outlined
                    v-model="item.modalidade"
                    label="Modalidade licitação"
                    :rules="notEmptyRule"
                    hide-details="auto"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    outlined
                    v-model="item.localExecucao"
                    label="Local de execução"
                    :rules="notEmptyRule"
                    hide-details="auto"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    outlined
                    v-model="item.origemRecurso"
                    label="Origem do recurso"
                    hide-details="auto"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    outlined
                    v-model="item.valorEstimado"
                    label="Valor estimado"
                    hide-details="auto"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    outlined
                    v-model="item.valorContratado"
                    label="Valor contratado"
                    hide-details="auto"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    outlined
                    v-model="item.valorAditado"
                    label="Valor aditado"
                    hide-details="auto"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    outlined
                    v-model="item.prazoExecucao"
                    label="Prazo de execução"
                    hide-details="auto"
                    suffix="dias"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="4">
                  <v-menu
                    v-model="menu2"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        :value="formatDate(item.dataInicio)"
                        label="Data de início"
                        :rules="notEmptyRule"
                        prepend-inner-icon="mdi-calendar"
                        outlined
                        v-bind="attrs"
                        v-on="on"
                        hide-details="auto"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="item.dataInicio"
                      :max="date"
                      @change="menu2 = false"
                    ></v-date-picker>
                  </v-menu>
                </v-col>

                <v-col cols="12" md="4">
                  <v-menu
                    v-model="menu3"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        :value="formatDate(item.dataConclusao)"
                        label="Data de conclusão"
                        :rules="notEmptyRule"
                        prepend-inner-icon="mdi-calendar"
                        outlined
                        v-bind="attrs"
                        v-on="on"
                        hide-details="auto"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="item.dataConclusao"
                      :max="date"
                      @change="menu3 = false"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
              </v-row>
            </v-card-text>
          </v-window-item>

          <!-- documentos do paciente -->
          <v-window-item eager :value="1">
            <Licitacoes
              v-model="item.anexo"
              :isEditing="isNew"
              :isLoading="isLoading"
            />
          </v-window-item>

          <v-window-item eager :value="2">
            <Projetos />
          </v-window-item>

          <v-window-item eager :value="3">
            <Contratos />
          </v-window-item>
        </v-window>
      </v-form>

      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          v-if="!isNew"
          v-permission="'remove'"
          text
          color="red"
          :loading="isLoading"
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
import rules from "@/utils/rules.js";

import FileInput from "@/components/FileInput.vue";
import Ficha from "./components/individualRecord.vue";

import PrintThis from "@/components/PrintThis.vue";

import Licitacoes from "./components/licitacoes.vue";
import Projetos from "./components/projetos.vue";
import Contratos from "./components/contratos.vue";

export default {
  props: {
    type: String,
    propItem: Object,
    dialogState: Boolean,
  },
  components: {
    FileInput,
    PrintThis,
    Ficha,
    Licitacoes,
    Projetos,
    Contratos,
  },
  async created() {
    if (this.propItem) {
      this.isNew = false;
      this.item = JSON.parse(JSON.stringify(this.propItem));
      let tempDateAber = new Date(this.item.dataAbertura + 86400000);
      this.item.dataAbertura = tempDateAber.toLocaleDateString("en-ca");
      if (this.item.dataInicio) {
        let tempDateIni = new Date(this.item.dataInicio + 86400000);
        this.item.dataInicio = tempDateIni.toLocaleDateString("en-ca");
      }
      if (this.item.dataConclusao) {
        let tempDateConc = new Date(this.item.dataConclusao + 86400000);
        this.item.dataConclusao = tempDateConc.toLocaleDateString("en-ca");
      }
      // this.setImgPreview();
    }
  },
  data: () => ({
    imgPreview: "",
    rules,
    step: 0,
    date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .substr(0, 10),
    menu: false,
    menu2: false,
    menu3: false,
    isNew: true,
    item: {},
    isLoading: false,
    notEmptyRule: [(v) => !!v || "Campo Obrigatório"],
    boolRule: [(v) => v != undefined || "Campo Obrigatório"],
    arrayRule: [(v) => !!(v && v.length) || "Campo Obrigatório"],
  }),
  methods: {
    getFileType(name) {
      if (name.includes(".png")) return "image/png";
      if (name.includes(".jpeg")) return "image/jpeg";
      if (name.includes(".jpg")) return "image/jpg";
      if (name.includes(".pdf")) return "application/pdf";

      return "";
    },
    imprimirFicha() {
      this.$refs.ficha.print();
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
    async salvar() {
      if (this.isLoading) return;
      if (this.$refs.form.validate()) {
        this.isLoading = true;

        try {
          if (this.propItem) {
            // UPDATE
            await http.put(`/${this.type}/`, this.item);
          } else {
            // CREATE
            await http.post(`/${this.type}`, this.item);
          }
          this.$notify("Item salvo");

          this.closeDialog();
        } catch (error) {
          this.$notify({
            title: "Atenção",
            text: "Erro ao salvar alterações",
            type: "error",
          });
          console.log(error);
        }
      } else {
        this.$notify({
          title: "Atenção",
          text: "Alguns Campos requerem sua atenção, verifique todas as abas",
          type: "error",
        });
      }
    },

    async excluir() {
      this.isLoading = true;

      try {
        await http.delete(`/${this.type}/remove`, { params: {id: this.item.id,}});
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