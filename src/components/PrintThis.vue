<template>
  <vue-html2pdf
    :show-layout="false"
    :float-layout="true"
    :enable-download="false"
    :preview-modal="true"
    :paginate-elements-by-height="1400"
    filename="doc"
    :pdf-quality="2"
    :manual-pagination="false"
    pdf-format="a4"
    pdf-orientation="portrait"
    pdf-content-width="800px"
    ref="html2Pdf"
  >
    <section slot="pdf-content">
      <slot></slot>
      <!-- PDF Content Here -->
    </section>
  </vue-html2pdf>
</template>

<script>
import VueHtml2pdf from "vue-html2pdf";

export default {
  name: "print-this",
  methods: {
    print() {
      this.$refs.html2Pdf.generatePdf();
    },
  },

  components: {
    VueHtml2pdf,
  },
};
</script>


