import Cookies from "js-cookie";

const PREVIEW_COOKIE = "chibata_local_preview";

export const localPreviewUser = {
  usuario: {
    id: "local-preview",
    nome: "Prévia local",
    username: "preview",
  },
  permissionList: [
    "bot:read",
    "inbox:read",
    "funil:read",
    "produto:read",
    "grupo:read",
    "usuario:read",
    "parametro:read",
    "log:read",
  ],
};

export function requestLocalPreview() {
  if (!import.meta.env.DEV) return false;

  const requested = new URLSearchParams(window.location.search).get("preview") === "1";

  if (requested) {
    Cookies.set(PREVIEW_COOKIE, "1", { path: "/", expires: 1 });
  }

  return requested;
}

export function isLocalPreviewEnabled() {
  return import.meta.env.DEV && Cookies.get(PREVIEW_COOKIE) === "1";
}

export function clearLocalPreview() {
  Cookies.remove(PREVIEW_COOKIE, { path: "/" });
}
