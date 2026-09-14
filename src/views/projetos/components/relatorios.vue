<template>
  <v-dialog
    v-model="dialogState"
    max-width="600px"
    @keydown.esc="closeDialog()"
    @click:outside="closeDialog()"
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">Relatórios</span>
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
              <v-text-field
                v-model="form.titulo"
                outlined
                label="Título do Relatório"
                :rules="notEmptyRule"
                hide-details="auto"
              ></v-text-field>
            </v-col>
            <v-col cols="12" class="pb-0">
              <v-autocomplete
                outlined
                multiple
                label="Campos para exibição"
                v-model="form.exibicao"
                :items="tableHeaders"
                item-text="text"
                item-value="value"
                hide-details="auto"
                :rules="arrayRule"
                return-object
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" class="pb-0">
              <v-radio-group
                label="Tipo de Relatório"
                v-model="form.tipo"
                row
                class="ma-1"
                :rules="boolRule"
                hide-details="auto"
              >
                <v-radio label=".csv (Excel)" :value="'csv'"></v-radio>
                <v-radio label=".pdf" :value="'pdf'"></v-radio>
              </v-radio-group>
            </v-col>
            <v-col cols="12" v-if="form.tipo == 'pdf'">
              <v-radio-group
                label="Orientação"
                v-model="form.orientacao"
                row
                class="ma-1"
                :rules="boolRule"
                hide-details="auto"
              >
                <v-radio label="Retrato" :value="'portrait'"></v-radio>
                <v-radio label="Paisagem" :value="'landscape'"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text color="primary" @click="print">
          <v-icon left>mdi-printer</v-icon>
          Imprimir
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import http from "@/plugins/axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default {
  props: {
    filters: Object,
    dialogState: Boolean,
  },
  data: () => ({
    form: {
      titulo: "Relatório",
      // tipo: "csv",
      exibicao: [
        {
          text: "Nome",
          value: "nome",
        },
      ],
    },
    tableHeaders: [
      {
        text: "Nome",
        value: "nome",
      },
      {
        text: "Status",
        value: "lastAtendimento",
      },
      {
        text: "Celular",
        value: "celular",
      },
      {
        text: "Email",
        value: "email",
      },
      {
        text: "CPF",
        value: "cpf",
      },
      {
        text: "Cartão do SUS",
        value: "cartaoSus",
      },
      {
        text: "NIS",
        value: "nis",
      },
      {
        text: "Usuário de BPC?",
        value: "bpc",
      },
      {
        text: "CadÚnico atualizado?",
        value: "cadUnico",
      },
      {
        text: "Data do cadastro",
        value: "dataCadastro",
      },
      {
        text: "Nascimento",
        value: "dataNascimento",
      },
      {
        text: "CID",
        value: "cid",
      },
      {
        text: "Deficiência adquirida",
        value: "deficienciaAdquirida",
      },
      {
        text: "Descrição da deficiência",
        value: "descricao",
      },
      {
        text: "Endereço",
        value: "endereco",
      },
      {
        text: "Bairro",
        value: "bairro",
      },
      {
        text: "Escolaridade",
        value: "escolaridade",
      },
      {
        text: "Nome da mãe",
        value: "mae",
      },
      {
        text: "Renda familiar",
        value: "rendaFamiliar",
      },
      {
        text: "Sexo",
        value: "sexo",
      },
      {
        text: "Ocupação",
        value: "ocupacao",
      },
      {
        text: "É próprio responsável?",
        value: "proprioResponsavel",
      },
      {
        text: "Nome do responsável",
        value: "nomeResponsavel",
      },
      {
        text: "CPF do responsável",
        value: "cpfResponsavel",
      },
      {
        text: "Sexo do responsável",
        value: "sexoResponsavel",
      },
      {
        text: "Tipo de responsável",
        value: "tipoResponsavel",
      },
      {
        text: "Nascimento do responsável",
        value: "dataNascimentoResponsavel",
      },
      {
        text: "Contato do responsável",
        value: "contatoResponsavel",
      },
    ],
    notEmptyRule: [(v) => !!v || "Campo Obrigatório"],
    boolRule: [(v) => v != undefined || "Campo Obrigatório"],
    arrayRule: [(v) => !!(v && v.length) || "Campo Obrigatório"],
  }),
  methods: {
    print() {
      if (!this.$refs.form.validate()) return;

      if (this.form.tipo == "csv") this.excel();
      else this.pdf();

      // this.closeDialog();
    },
    parseData(data) {
      let temp = [];

      data.forEach((element) => {
        let item = element;

        for (const key in element) {
          if (typeof element[key] == "boolean")
            item[key] = element[key] ? "Sim" : "Não";
        }

        if (this.form.exibicao.some((e) => e.value === "bairro")) {
          item.bairro = element.endereco.bairro;
        }

        if (this.form.exibicao.some((e) => e.value === "endereco")) {
          item.endereco = this.makeAddress(item.endereco);
        }

        item.lastAtendimento = element.lastAtendimento.status;
        item.dataNascimentoResponsavel = this.timestampToDate(
          element.dataNascimentoResponsavel
        );
        item.dataNascimento = this.timestampToDate(element.dataNascimento);

        item.dataCadastro = this.timestampToDate(element.dataCadastro);

        temp.push(item);
      });

      return temp;
    },
    async getData() {
      let temp = [];
      try {
        var response = await http.get("/projeto", { params: this.filters });
        temp = response.data.data.list;
      } catch (error) {
        this.showError();
      }

      return this.parseData(temp);
    },
    async pdf() {
      try {
        var data = await this.getData();

        const doc = new jsPDF(this.form.orientacao);

        var img = new Image();
        img.src = "assets/docs/header_min.png";
        var header_position = this.form.orientacao == "portrait" ? 128 : 215;
        doc.addImage(img, "PNG", header_position, 5);

        doc.text(this.form.titulo, 14, 25);

        autoTable(doc, {
          startY: 28,

          body: data,
          columns: this.form.exibicao.map((el) => {
            return { header: el.text, dataKey: el.value };
          }),
        });

        doc.output("dataurlnewwindow", "relatorio.pdf");
      } catch (error) {
        console.log(error);
        this.showError();
      }
    },

    async excel() {
      var toExport = [];
      var data = await this.getData();

      try {
        data.forEach((item) => {
          let temp = {};
          this.form.exibicao.forEach((element) => {
            temp[element.text] = item[element.value] ?? "";
          });
          toExport.push(temp);
        });

        let filename = this.form.titulo + ".csv";
        var data = [];
        var rows = toExport;
        data.push(this.form.exibicao.map((el) => el.text).join(";"));
        for (var i = 0; i < rows.length; i++) {
          var row = [],
            cols = rows[i];
          let values = Object.values(cols);
          for (var j = 0; j < values.length; j++) {
            row.push(values[j]);
          }
          data.push(row.join(";"));
        }
        var csv_file, download_link;
        csv_file = new Blob(["\ufeff", data.join("\n")], {
          type: "text/csv",
        });
        download_link = document.createElement("a");
        download_link.download = filename;
        download_link.href = window.URL.createObjectURL(csv_file);
        download_link.style.display = "none";
        document.body.appendChild(download_link);
        download_link.click();
      } catch (error) {
        this.showError();
      }
    },
    makeAddress(endereco) {
      let temp = `${endereco.logradouro.trim()}, ${endereco.numero.trim()} `;
      if (endereco.complemento) temp += endereco.complemento.trim();
      return `${temp} - ${endereco.bairro}`;
    },
    timestampToDate(date, withHour) {
      if (!date) return null;

      try {
        let tempDate = new Date(date + 86400000);
        if (withHour) return tempDate.toLocaleString();
        return tempDate.toLocaleDateString();
      } catch (error) {
        return null;
      }
    },
    showError() {
      this.$notify({
        title: "Atenção",
        text: "Erro ao gerar Relatório",
        type: "error",
      });
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