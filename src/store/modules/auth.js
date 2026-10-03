import Cookies from "js-cookie";

// path "/" sempre: antes era "" e o navegador gravava um cookie por pasta da URL,
// que o logout não apagava (A5).
const COOKIE = {
  path: "/",
  sameSite: "lax",
  secure: typeof window !== "undefined" && window.location.protocol === "https:",
};

function readJsonCookie(name) {
  const raw = Cookies.get(name);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    Cookies.remove(name, { path: "/" });
    return null;
  }
}

function removeEverywhere(name) {
  Cookies.remove(name, { path: "/" });
  // Limpa cópias antigas gravadas com path vazio (diretório da URL atual).
  Cookies.remove(name, { path: "" });
}

export default {
  namespaced: true,

  state() {
    const user = readJsonCookie("user");

    return {
      user,
      userToken: Cookies.get("token") || "",
      refreshToken: Cookies.get("refreshToken") || "",
      permissions: user?.permissionList || [],
    };
  },

  mutations: {
    LOGIN(state, payload) {
      state.userToken = payload.accessToken;
      state.refreshToken = payload.refreshToken || state.refreshToken || "";

      Cookies.set("token", payload.accessToken, { ...COOKIE, expires: 1 });

      if (payload.refreshToken) {
        Cookies.set("refreshToken", payload.refreshToken, { ...COOKIE, expires: 7 });
      }
    },

    setUserData(state, payload) {
      state.user = payload;
      state.permissions = payload?.permissionList || [];

      Cookies.set("user", JSON.stringify(payload), { ...COOKIE, expires: 1 });
    },

    LOGOUT(state) {
      state.user = null;
      state.userToken = "";
      state.refreshToken = "";
      state.permissions = [];

      ["user", "token", "refreshToken", "config"].forEach(removeEverywhere);
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
        const [service, permission] = String(element).split(":");

        if (permission) {
          if (!temp[service]) temp[service] = [];
          temp[service].push(permission);
        }
      });

      return temp;
    },

    getServices: (state, getters) => Object.keys(getters.getPermissions),

    can: (state, getters) => (service, action) => {
      if (!service) return true;
      const list = getters.getPermissions[service];
      if (!list) return false;
      return action ? list.includes(action) : true;
    },
  },
};
