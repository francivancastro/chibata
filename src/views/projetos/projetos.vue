<template>
  <div>
    <CustomTable
      :type="type"
      :tableHeaders="headers"
      :dialog="Dialog"
      :filtros="filters"
    >
      <template v-slot:toolbar>
        <v-btn color="secondary" depressed @click="filterDialog = true">
          <v-badge
            color="success"
            :content="filtersNumber"
            :value="filtersNumber"
            inline
          >
            <v-icon left>mdi-filter-variant </v-icon> Filtros
          </v-badge>
        </v-btn>
        <!-- <v-btn
          v-permission="'detail'"
          color="success"
          depressed
          @click="relatoriosDialog = true"
        >
          <v-icon left>mdi-note-text-outline </v-icon>
          Relatórios
        </v-btn> -->
      </template>
    </CustomTable>
    <!-- <Relatorios
      v-if="relatoriosDialog"
      :filters="filters"
      :dialogState="relatoriosDialog"
      @close-dialog="relatoriosDialog = false"
    /> -->
    <Filtros
      v-model="filters"
      v-if="filterDialog"
      :dialogState="filterDialog"
      @close-dialog="filterDialog = false"
    />
  </div>
</template>

<script>
import CustomTable from "@/components/Table.vue";
import Dialog from "./dialog.vue";
import Filtros from "./components/filtros.vue";
import Relatorios from "./components/relatorios.vue";

export default {
  name: "usuarios",
  components: {
    CustomTable,
    Dialog,
    Filtros,
    Relatorios,
  },
  computed: {
    filtersNumber() {
      return Object.keys(this.filters).length;
    },
  },
  data() {
    return {
      Dialog,
      filterDialog: false,
      relatoriosDialog: false,
      filters: {},
      type: "projeto",
      headers: [
        {
          text: "Objeto",
          align: "left",
          value: "objeto",
        },
        {
          text: "Ano",
          align: "left",
          value: "ano",
        },
        {
          text: "Abertura",
          align: "left",
          value: "dataAbertura",
          formatter: this.dateMask,
        },
        {
          text: "Processo",
          align: "left",
          value: "processo",
        },
        {
          text: "Modalidade",
          align: "left",
          value: "modalidade",
        },
        {
          text: "Valor estimado",
          align: "left",
          value: "valorEstimado",
          formatter: this.moneyMask,
        },
        {
          text: "Situação",
          align: "left",
          value: "situacao",
        },
      ],
    };
  },
  methods: {
    dateMask(value) {
      var d = new Date(0);
      d.setUTCMilliseconds(value);
      return d.toLocaleDateString();
    },
    moneyMask(value) {
      return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    },
  },
};
</script>