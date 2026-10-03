import axios from "axios";
import store from "@/store";
import router from "@/router";

const http = axios.create({
  // Preserve the existing local backend while allowing each environment to
  // provide its own endpoint without changing source code.
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost/php-seed",
});

let isRefreshing = false;
let queue = [];

function processQueue(error, token = null) {
  queue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  queue = [];
}

// REQUEST
http.interceptors.request.use((config) => {
  const token = store.getters["auth/getToken"];

  if (token) {
    config.headers.Authorization = token;
  }

  return config;
});

// RESPONSE
http.interceptors.response.use(
  (response) => {
    const data = response.data;

    // 🔥 backend error handling
    if (data?.errno === 4002) {
      return handleRefresh(response.config);
    }

    if (data?.errno === 4001 || data?.errno === 4003) {
      forceLogout();
      return Promise.reject(new Error("Auth error"));
    }

    return response;
  },

  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      return handleRefresh(error.config);
    }

    return Promise.reject(error);
  },
);

// 🔥 REFRESH LOGIC
async function handleRefresh(originalRequest) {
  if (isRefreshing) {
    return new Promise(function (resolve, reject) {
      queue.push({ resolve, reject });
    })
      .then((token) => {
        originalRequest.headers.Authorization = token;
        return http(originalRequest);
      })
      .catch((err) => Promise.reject(err));
  }

  isRefreshing = true;

  try {
    const refreshToken = store.getters["auth/getRefreshToken"];

    const { data } = await http.post("/refreshAccessToken", {
      refreshToken,
    });

    if (data.errno !== 0) {
      throw new Error("Refresh failed");
    }

    const newToken = data.data.accessToken;

    // 🔥 atualiza store
    store.commit("auth/LOGIN", {
      accessToken: newToken,
      refreshToken,
    });

    processQueue(null, newToken);

    originalRequest.headers.Authorization = newToken;

    return http(originalRequest);
  } catch (err) {
    processQueue(err, null);
    forceLogout();
    return Promise.reject(err);
  } finally {
    isRefreshing = false;
  }
}

// 🔥 logout centralizado
function forceLogout() {
  store.commit("auth/LOGOUT");
  store.commit("config/CLEAR_CONFIG");
  router.replace("/login");
}

export default http;
