export default {
  type: "log",
  title: "Logs",

  headers: [
    { title: "Usuário", key: "usuario_username" },
    { title: "Descrição", key: "content" },
    { title: "Extra", key: "extra" },
    { title: "Data de Cadastro", key: "data_cadastro" },
  ],

  fields: [
    {
      key: "usuario_username",
      label: "Usuário",
      type: "text",
    },
    {
      key: "content",
      label: "Descrição",
      type: "textarea",
    },
    {
      key: "extra",
      label: "Extra",
      type: "json",
    },
    {
      key: "data_cadastro",
      label: "Data de Cadastro",
      type: "text",
    },
  ],

  transformSave(model) {
    return {
      log: model,
    };
  },
};
