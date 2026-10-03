import PermissionField from "@/components/crud/fields/PermissionField.vue";

export default {
  type: "grupo",

  title: "Grupos",

  headers: [
    { title: "Nome", key: "name" },
    {
      title: "Status",
      key: "status",
      formatter: (v) => (v === 0 ? "Ativo" : "Inativo"),
    },
  ],

  fields: [
    { key: "name", label: "Nome", type: "text", required: true },
    { key: "regraList", component: PermissionField },
    {
      key: "status",
      label: "Status",
      type: "switch",
    },
  ],

  defaultModel() {
    return {
      regraList: [],
    };
  },

  async fetchDetail(http, item) {
    const { data } = await http.post("/grupo/detail", {
      id: item.id,
    });

    const detail = data?.data || {};

    return {
      ...detail,
      name: detail.name ?? item.name ?? "",
      regraList: (detail.regraList || []).map((v) =>
        typeof v === "object" ? v.id : v,
      ),
    };
  },

  transformSave(model) {
    const { regraList, grupo: nestedGrupo, ...payload } = model;
    const grupoPayload = {
      ...(typeof nestedGrupo === "object" && nestedGrupo ? nestedGrupo : {}),
      ...payload,
    };

    return {
      grupo: grupoPayload,
      regraList: Array.isArray(regraList)
        ? regraList.map((v) => (typeof v === "object" ? v.id : v))
        : [],
    };
  },
};
