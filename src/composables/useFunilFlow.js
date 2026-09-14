import { ref } from "vue";
import api from "@/services/api";

export function useFunilFlow() {
  const etapas = ref([]);

  async function load(funilId) {
    const response = await api.get(`/funil/${funilId}/etapas`);

    etapas.value = response.data;
  }

  return {
    etapas,
    load,
  };
}
