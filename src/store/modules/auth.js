import Cookies from "js-cookie";

export default {
  namespaced: true,

  state() {
    const user = Cookies.get("user");

    return {
      user: user ? JSON.parse(user) : null,
      userToken: Cookies.get("token") || "",
      refreshToken: Cookies.get("refreshToken") || "",
      permissions: user ? JSON.parse(user)?.permissionList || [] : [],
    };
  },

  mutations: {
    LOGIN(state, payload) {
      state.userToken = payload.accessToken;
      state.refreshToken = payload.refreshToken || "";

      Cookies.set("token", payload.accessToken, {
        path: "/",
        expires: 1,
      });

      if (payload.refreshToken) {
        Cookies.set("refreshToken", payload.refreshToken, {
          path: "/",
          expires: 7,
        });
      }
    },

    setUserData(state, payload) {
      state.user = payload;
      state.permissions = payload.permissionList || [];

      Cookies.set("user", JSON.stringify(payload), {
        path: "/",
        expires: 1,
      });
    },

    LOGOUT(state) {
      state.user = null;
      state.userToken = "";
      state.refreshToken = "";
      state.permissions = [];

      // remove no path padrão e limpa cookies legados criados com path ""
      for (const name of ["user", "token", "refreshToken", "config"]) {
        Cookies.remove(name, { path: "/" });
        Cookies.remove(name, { path: "" });
      }
    },
  },

  getters: {
    isLogged: (state) => !!state.userToken,

    getToken: (state) => state.userToken,
    getRefreshToken: (state) => state.refreshToken,

    getUser: (state) => state.user,

    getPermissions: (state) => {
      const temp = {};

      state.permissions.forEach((element) => {
        const [service, permission] = element.split(":");

        if (permission) {
          if (!temp[service]) temp[service] = [];
          temp[service].push(permission);
        }
      });

      return temp;
    },

    getServices: (state, getters) => {
      return Object.keys(getters.getPermissions);
    },
  },
};
