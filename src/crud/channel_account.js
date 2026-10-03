// store importado direto: useStore() só funciona dentro de setup(), e
// transformSave roda no clique de Salvar (M3).
import store from "@/store";

const getUsuarioId = () => {
  return store.state.auth.user?.usuario?.id ?? store.state.auth.user?.id;
};

export default {
  type: "channel-account",
  title: "Contas de Canais",

  headers: [
    { title: "Nome", key: "name" },
    { title: "Canal", key: "nome_channel" },
    { title: "Bot", key: "nome_bot" },
    { title: "ID Externo", key: "external_account_id" },
    { title: "Status", key: "status" },
  ],

  fields: [
    {
      key: "channel_id",
      label: "Canal",
      type: "select",
      source: "channel",
      itemTitle: "name",
      itemValue: "id",
    },
    {
      key: "bot_id",
      label: "Bot",
      type: "select",
      source: "bot",
      itemTitle: "nome",
      itemValue: "id",
    },
    {
      key: "name",
      label: "Nome da Conta",
      type: "text",
    },
    {
      key: "external_account_id",
      label: "ID da Conta Externa",
      type: "text",
    },
    {
      key: "credentials_encrypted",
      label: "Credenciais (JSON / Token)",
      type: "textarea",
    },
    {
      key: "status",
      label: "Status",
      type: "switch",
    },
  ],

  defaultModel() {
    return {
      usuario_id: getUsuarioId(),
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
      usuario_id: model?.usuario_id ?? getUsuarioId(),
      status: statusValue,
    };
  },
};
