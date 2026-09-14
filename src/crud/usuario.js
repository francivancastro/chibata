export default {
  type: "usuario",
  title: "Usuários",

  headers: [
    { title: "Nome", key: "nome" },
    { title: "CPF", key: "cpf" },
    { title: "Email", key: "email" },

    {
      title: "Status",
      key: "status",

      formatter: (v) => (v === 0 ? "Ativo" : "Inativo"),
    },

    {
      title: "Grupo",
      key: "grupo",
      formatter: (v) => v?.name || "-",
    },
  ],

  fields: [
    { key: "nome", label: "Nome", type: "text" },
    { key: "cpf", label: "CPF", type: "text" },
    { key: "email", label: "Email", type: "text" },

    {
      key: "grupo_id",
      label: "Grupo",
      type: "select",
      source: "grupo",
      itemTitle: "name",
      itemValue: "id",
    },

    {
      key: "status",
      label: "Status",
      type: "switch",
    },
  ],

  transformSave(model) {
    const { grupo, ...payload } = model;

    return {
      ...payload,
      status:
        payload.status === true
          ? 1
          : payload.status === false
          ? 0
          : payload.status,
      grupo_id:
        payload.grupo_id != null
          ? payload.grupo_id
          : typeof grupo === "object"
          ? grupo.id
          : grupo,
    };
  },
};
