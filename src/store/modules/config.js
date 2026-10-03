import Cookies from "js-cookie";
import http from "@/plugins/axios";

function readConfigCookie() {
  try {
    const raw = Cookies.get("config");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default {
  namespaced: true,

  state() {
    const config = readConfigCookie();
    const isValid = !!(config && (config.nome?.trim() || config.descricao?.trim()));

    return {
      loaded: isValid,
      nome: isValid ? config.nome : "",
      descricao: isValid ? config.descricao : "",
    };
  },

  mutations: {
    SET_CONFIG(state, payload) {
      state.nome = payload.nome || "";
      state.descricao = payload.descricao || "";
      state.loaded = true;

      Cookies.set(
        "config",
        JSON.stringify({ nome: state.nome, descricao: state.descricao }),
        { path: "/", sameSite: "lax", expires: 1 },
      );
    },

    CLEAR_CONFIG(state) {
      state.nome = "";
      state.descricao = "";
      state.loaded = false;

      Cookies.remove("config", { path: "/" });
    },
  },

  actions: {
    /**
     * Retorna "ok", "empty" (não existe configuração) ou "error" (API fora / falha).
     * Antes "error" virava "empty" e levava a criar uma configuração duplicada (A6).
     */
    async load({ commit, state }) {
      if (state.loaded) return "ok";

      try {
        const { data } = await http.post("/configuracao/list");
        const config = data?.data?.list?.[0];

        if (!config) return "empty";

        commit("SET_CONFIG", config);
        return "ok";
      } catch {
        return "error";
      }
    },
  },

  getters: {
    getNome: (state) => state.nome,
    getDescricao: (state) => state.descricao,
    isLoaded: (state) => state.loaded,
  },
};
