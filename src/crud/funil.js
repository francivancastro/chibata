export default {
  type: "funil",
  title: "Funis",

  headers: [
    { title: "Nome", key: "nome" },
    { title: "Bot", key: "nome_bot" },
    { title: "Status", key: "status" },
    {
      title: "Ações",
      key: "actions",
      sortable: false,
    },
  ],

  fields: [
    {
      key: "bot_id",
      label: "Bot",
      type: "select",
      source: "bot",
      itemTitle: "nome",
      itemValue: "id",
      required: true,
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
      key: "status",
      label: "Status",
      type: "switch",
    },
  ],

  actions: [
    {
      label: "Fluxo",
      icon: "mdi-sitemap",
      route: "funil-editor",
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
