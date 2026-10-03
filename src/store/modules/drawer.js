export default {
  namespaced: true,

  state() {
    return {
      // Aberto só em telas largas; no celular começa fechado.
      showDrawer: typeof window === "undefined" ? true : window.innerWidth >= 1280,
    };
  },

  mutations: {
    TOGGLE_DRAWER(state) {
      state.showDrawer = !state.showDrawer;
    },

    SET_DRAWER(state, value) {
      state.showDrawer = value;
    },
  },

  actions: {
    init({ commit }) {
      const isDesktop = window.innerWidth > 1264;
      commit("SET_DRAWER", isDesktop);
    },
  },
};
