import { createStore } from "vuex";
import modules from "./modules";

export default createStore({
  state() {
    return {
      parametro: [],
      grupos: [],
      usuarios: [],
      pessoas: [],
      logs: [],
    };
  },

  mutations: {
    add(state, { payload, type }) {
      state[type].push(payload);
    },

    edit(state, { payload, type }) {
      const index = state[type].findIndex((item) => item.id === payload.id);

      if (index !== -1) {
        state[type][index] = payload;
      }
    },

    delete(state, { payload, type }) {
      const index = state[type].findIndex((item) => item.id === payload.id);

      if (index !== -1) {
        state[type].splice(index, 1);
      }
    },
  },

  actions: {},

  getters: {
    getItemById: (state) => (collection, id) => {
      const index = state[collection].findIndex((item) => item.id === id);

      return index > -1 ? state[collection][index] : {};
    },
  },

  modules,
});
