import Cookies from "js-cookie";
import http from "@/plugins/axios";

export default {
  namespaced: true,

  state() {
    const raw = Cookies.get("config");

    let config = null;

    try {
      config = raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.log("[CONFIG] invalid cookie JSON");
      config = null;
    }

    const isValid =
      config &&
      (config.nome?.trim() || config.descricao?.trim());

    console.log("[CONFIG] state init cookie:", config);
    console.log("[CONFIG] isValid:", isValid);

    return {
      loaded: isValid, // 🔥 FIX PRINCIPAL
      nome: isValid ? config.nome : "",
      descricao: isValid ? config.descricao : "",
    };
  },

  mutations: {
    SET_CONFIG(state, payload) {
      console.log("[CONFIG] SET_CONFIG:", payload);

      state.nome = payload.nome || "";
      state.descricao = payload.descricao || "";
      state.loaded = true;

      Cookies.set(
        "config",
        JSON.stringify({
          nome: state.nome,
          descricao: state.descricao,
        }),
        { expires: 1 },
      );
    },

    CLEAR_CONFIG(state) {
      console.log("[CONFIG] CLEAR_CONFIG");

      state.nome = "";
      state.descricao = "";
      state.loaded = false;

      Cookies.remove("config");
    },
  },

  actions: {
    async load({ commit, state }) {
      console.log("[CONFIG] load called");

      // 🔥 agora só bloqueia se for realmente válido
      if (state.loaded) {
        console.log("[CONFIG] skipped (valid config already loaded)");
        return true;
      }

      try {
        console.log("[CONFIG] calling API...");

        const { data } = await http.post("/configuracao/list");

        console.log("[CONFIG] API response:", data);

        if (data.errno !== 0) return false;

        const config = data.data?.list?.[0];

        console.log("[CONFIG] parsed:", config);

        if (!config) {
          console.log("[CONFIG] EMPTY CONFIG -> redirect needed");
          return false;
        }

        commit("SET_CONFIG", config);

        return true;
      } catch (err) {
        console.error("[CONFIG] request error:", err);
        return false;
      }
    },
  },

  getters: {
    getNome: (state) => state.nome,
    getDescricao: (state) => state.descricao,
    isLoaded: (state) => state.loaded,
  },
};