// store importado direto: useStore() só funciona dentro de setup(), e
// transformSave roda no clique de Salvar (M3).
import store from "@/store";

const getUsuarioId = () => {
  return store.state.auth.user?.usuario?.id ?? store.state.auth.user?.id;
};

export default {
  type: "bot",
  title: "Bots",

  defaultModel() {
    return {
      usuario_id: getUsuarioId(),
      configuracoes: {},
      status: 1,
    };
  },

  headers: [
    { title: "Nome", key: "nome" },
    { title: "Telegram", key: "telegram_username" },
    { title: "Status", key: "status" },
  ],

  fields: [
    {
      key: "nome",
      label: "Nome",
      type: "text",
      required: true,
    },

    {
      key: "telegram_username",
      label: "Username Telegram",
      type: "text",
    },

    {
      key: "telegram_token_encrypted",
      label: "Token Telegram",
      type: "password",
    },

    {
      key: "mensagem_boas_vindas",
      label: "Mensagem de boas-vindas",
      type: "textarea",
    },

    {
      key: "configuracoes",
      label: "Configurações",
      type: "json",
    },

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
        : model?.status === false || model?.status === "0" || model?.status === 0
        ? 0
        : model?.status;

    return {
      ...model,
      usuario_id: model?.usuario_id ?? getUsuarioId(),
      status: statusValue,
      configuracoes:
        typeof model?.configuracoes === "string"
          ? JSON.parse(model.configuracoes || "{}") // CrudDialog já bloqueia JSON inválido
          : (model?.configuracoes ?? {}),
    };
  },
};
