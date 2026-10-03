export default {
  type: "parametro",
  title: "Parâmetros",

  headers: [
    { title: "Nome", key: "description" },
    { title: "Key", key: "key" },
  ],

  fields: [
    { key: "description", label: "Nome", type: "text" },
    { key: "key", label: "Key", type: "text", required: true },
    { key: "value", label: "Valor", type: "json" },
  ],

  transformSave(model) {
    return {
      parametro: model,
    };
  },
};
