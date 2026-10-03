export default {
  type: "channel",
  title: "Canais",

  headers: [
    { title: "Nome", key: "name" },
    { title: "Codigo", key: "code" },
    { title: "Status", key: "status" },
  ],

  fields: [
    { key: "name", label: "Nome", type: "text" },
    { key: "code", label: "Codigo", type: "text" },
    {
      key: "status",
      label: "Status",
      type: "switch",
    },
  ],

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
