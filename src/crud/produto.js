export default {
  type: "produto",
  title: "Produtos",

  headers: [
    { title: "Nome", key: "nome" },
    { title: "Bot", key: "nome_bot" },
    { title: "Preco", key: "preco" },
    { title: "Estoque", key: "estoque" },
    { title: "Status", key: "status" },
  ],

  fields: [
    {
      key: "bot_id",
      label: "Bot",
      type: "select",
      source: "bot",
      itemTitle: "nome",
      itemValue: "id",
    },
    {
      key: "nome",
      label: "Nome",
      type: "text",
      required: true,
    },
    {
      key: "descricao",
      label: "Descrição",
      type: "textarea",
    },
    {
      key: "preco",
      label: "Preço",
      type: "text",
    },
    {
      key: "estoque",
      label: "Estoque",
      type: "text",
    },
    {
      key: "status",
      label: "Status",
      type: "switch",
    },
  ],

  defaultModel() {
    return {
      status: 1,
    };
  },

  transformSave(model) {
    const statusValue =
      model?.status === true || model?.status === "1" || model?.status === 1
        ? 1
        : model?.status === false ||
            model?.status === "0" ||
            model?.status === 0
          ? 0
          : model?.status;
    return {
      ...model,
      status: statusValue,
    };
  },
};
