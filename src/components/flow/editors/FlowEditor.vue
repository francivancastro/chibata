<script setup>
import MensagemEditor from "./MensagemEditor.vue";
import ProdutoEditor from "./ProdutoEditor.vue";
import CondicaoEditor from "./CondicaoEditor.vue";
import AcaoEditor from "./AcaoEditor.vue";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "save"]);

const editors = {
  mensagem: MensagemEditor,

  produto: ProdutoEditor,

  condicao: CondicaoEditor,

  acao: AcaoEditor,
};

function update(value) {
  emit("update:modelValue", value);
}
</script>

<template>
  <component
    :is="editors[modelValue.tipo]"
    :modelValue="modelValue"
    @update:modelValue="update"
    @save="$emit('save')"
  />
</template>
