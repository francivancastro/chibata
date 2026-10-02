<template>
  <div id="page">
    <div id="table">
      <div style="text-align: center; margin-bottom: 5px">
        <h3>OBRA MUNICIPAL DO MUNICIPIO DE PARAUAPEBAS</h3>
      </div>
      <table border="1" style="width: 100%">
        <tbody>
          <tr>
            <th style="width: 801px" colspan="5">
              <p style="text-align: center"><strong>DADOS</strong></p>
            </th>
          </tr>
          <tr>
            <td style="width: 801px" colspan="4">
              <p>Objeto: {{ person.objeto }}</p>
            </td>
            <!-- <td rowspan="6">
              <img :src="photo" style="width: 125px" />
            </td> -->
          </tr>
          <tr>
            <td style="width: 33.3%" colspan="1">
              <p>Contratado: {{ person.contrato }}</p>
            </td>
            <td style="width: 33.3%" colspan="1">
              <p>Ano: {{ person.ano }}</p>
            </td>
            <td style="width: 33.3%" colspan="2">
              <p>Processo licitatório: {{ person.processo }}</p>
            </td>
          </tr>
          <tr>
            <td style="width: 208px" colspan="2">
              <p>Data Abertura: {{ formatDate(person.dataAbertura) }}</p>
            </td>
            <td style="width: 593px" colspan="2">
              <p>Modalidade licitação: {{ person.modalidade }}</p>
            </td>
          </tr>
          <tr>
            <td style="width: 208px" colspan="2">
              <p>Local de execução: {{ person.localExecucao }}</p>
            </td>
            <td style="width: 593px" colspan="2">
              <p>Origem do recurso: {{ person.origemRecurso }}</p>
            </td>
          </tr>
          <tr>
            <td style="width: 801px" colspan="4">
              <p>Valor estimado: {{ person.valorEstimado }}</p>
            </td>
          </tr>
          <tr>
            <td style="width: 208px" colspan="2">
              <p>Valor contratado: {{ person.valorContratado }}</p>
            </td>
            <td style="width: 593px" colspan="2">
              <p>Valor aditado: {{ person.valorAditado }}</p>
            </td>
          </tr>

          <!-- <tr>
            <th style="width: 801px" colspan="5">
              <p style="text-align: center"><strong>ENDEREÇO</strong></p>
            </th>
          </tr> -->
          <tr>
            <td style="width: 801px" colspan="5">
              <p>Prazo de execução: {{ person.prazoExecucao }}</p>
            </td>
          </tr>
          <tr>
            <td style="width: 198px" colspan="2">
              <p>Data de início: {{ formatDate(person.dataInicio) }}</p>
            </td>
            <td style="width: 603px" colspan="3">
              <p>Data de conclusão: {{ formatDate(person.dataConclusao) }}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- <div id="header">
      <img src="@/assets/docs/header.png" height="60px" />
    </div>
    <div id="background">
      <img src="@/assets/docs/background.png" height="500px" />
    </div>
    <div id="footer">
      <img src="@/assets/docs/rodape.png" height="100px" />
    </div> -->
  </div>
</template>

<script>
export default {
  name: "ficha",
  props: {
    person: Object,
  },
  methods: {
    formatDate(date) {
      if (!date) return null;

      try {
        const [year, month, day] = date.split("-");
        return `${day}/${month}/${year}`;
      } catch (error) {
        return null;
      }
    },
  },
};
</script>

<style scoped>
#page {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 29.6cm;
  width: 21cm;
  font-family: "Nimbus Sans", "Segoe UI", sans-serif;
}
#background {
  text-align: center;
  opacity: 0.15;
}
#header {
  margin-top: 20px;
  margin-right: 20px;
  text-align: right;
}

#footer {
  text-align: right;
  margin-right: 10px;
}

#table {
  position: absolute;
  margin-top: 100px;
  margin-left: 25px;
  margin-right: 25px;
}

table {
  border-collapse: collapse;
  padding: 10px;
}
th {
  background-color: rgb(204, 204, 204);
}
td {
  padding: 2px;
}
</style>
