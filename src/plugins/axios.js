import axios from "axios";
import store from "@/store";
import router from "@/router";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost/php-seed";

const http = axios.create({ baseURL });

// Instância sem interceptores, só para renovar o token. Se o próprio refresh
// falhar, ele não pode entrar de novo no interceptor (era o deadlock da A1).
const refreshClient = axios.create({ baseURL });

const AUTH_ERRNO = { expired: 4002, invalid: [4001, 4003] };

/**
 * Erro de negócio da API: HTTP 200 com `errno` diferente de 0.
 * Antes era tratado como sucesso (A2). Agora toda chamada rejeita com ele,
 * a menos que a requisição passe `allowErrno: true`.
 */
export class ApiError extends Error {
  constructor(message, { errno = null, status = null, data = null, network = false } = {}) {
    super(message);
    this.name = "ApiError";
    this.errno = errno;
    this.status = status;
    this.data = data;
    this.network = network;
  }
}

/** Mensagem legível para mostrar ao usuário a partir de qualquer erro. */
export function errorMessage(error, fallback = "Algo deu errado. Tente de novo.") {
  if (!error) return fallback;
  if (error.network) return "Não foi possível falar com o servidor. Verifique a conexão.";
  return error.message && error.message !== "Network Error" ? error.message : fallback;
}

function businessMessage(data) {
  return data?.msg || data?.message || data?.error || "O servidor recusou a operação.";
}

let refreshPromise = null;

async function refreshToken() {
  const refreshToken = store.getters["auth/getRefreshToken"];
  if (!refreshToken) throw new ApiError("Sessão expirada.", { errno: AUTH_ERRNO.expired });

  const { data } = await refreshClient.post("/refreshAccessToken", { refreshToken });
  if (data?.errno !== 0 || !data?.data?.accessToken) {
    throw new ApiError("Sessão expirada.", { errno: data?.errno ?? AUTH_ERRNO.expired, data });
  }

  store.commit("auth/LOGIN", { accessToken: data.data.accessToken, refreshToken });
  return data.data.accessToken;
}

async function retryWithFreshToken(originalRequest) {
  // Uma tentativa por requisição: sem isso, um 401 persistente virava loop.
  if (originalRequest._retry) {
    forceLogout();
    throw new ApiError("Sessão expirada.", { errno: AUTH_ERRNO.expired });
  }
  originalRequest._retry = true;

  try {
    // Várias requisições expiradas ao mesmo tempo compartilham um único refresh.
    refreshPromise ||= refreshToken().finally(() => { refreshPromise = null; });
    const token = await refreshPromise;
    originalRequest.headers = { ...originalRequest.headers, Authorization: token };
    return http(originalRequest);
  } catch (err) {
    forceLogout();
    throw err instanceof ApiError ? err : new ApiError("Sessão expirada.", { errno: AUTH_ERRNO.expired });
  }
}

http.interceptors.request.use((config) => {
  const token = store.getters["auth/getToken"];
  if (token) config.headers.Authorization = token;
  return config;
});

http.interceptors.response.use(
  (response) => {
    const data = response.data;
    const errno = data?.errno;

    if (errno === AUTH_ERRNO.expired) return retryWithFreshToken(response.config);

    if (AUTH_ERRNO.invalid.includes(errno)) {
      forceLogout();
      return Promise.reject(new ApiError("Sessão inválida. Entre de novo.", { errno, data }));
    }

    if (errno !== undefined && errno !== null && errno !== 0 && !response.config.allowErrno) {
      return Promise.reject(new ApiError(businessMessage(data), { errno, data, status: response.status }));
    }

    return response;
  },
  (error) => {
    const status = error.response?.status;

    if (status === 401 && error.config) return retryWithFreshToken(error.config);

    if (!error.response) {
      return Promise.reject(new ApiError("Não foi possível falar com o servidor.", { network: true }));
    }

    return Promise.reject(
      new ApiError(businessMessage(error.response.data), {
        status,
        errno: error.response.data?.errno ?? null,
        data: error.response.data,
      }),
    );
  },
);

let loggingOut = false;

function forceLogout() {
  if (loggingOut) return;
  loggingOut = true;
  store.commit("auth/LOGOUT");
  store.commit("config/CLEAR_CONFIG");
  const current = router.currentRoute.value;
  const redirect = current?.fullPath && current.path !== "/login" ? current.fullPath : undefined;
  router.replace({ path: "/login", query: { expired: "1", ...(redirect ? { redirect } : {}) } }).finally(() => {
    loggingOut = false;
  });
}

export default http;
