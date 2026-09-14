// src/utils/permissions.js
import router from "@/router";
import store from "@/store";

const directive = {
  mounted(el, binding) {
    applyPermission(el, binding);
  },

  updated(el, binding) {
    applyPermission(el, binding);
  },
};

function applyPermission(el, binding) {
  if (!binding.value) return;

  const permissions = store.getters["auth/getPermissions"] || {};

  const currentService = router.currentRoute.value?.path?.substring(1);

  if (!permissions[currentService]) {
    el.style.display = "none";
    return;
  }

  if (!permissions[currentService].includes(binding.value)) {
    el.style.display = "none";
  } else {
    el.style.display = "";
  }
}

export default directive;
