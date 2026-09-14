export default {
  namespaced: true,

  state() {
    return {
      showDrawer: true,
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
