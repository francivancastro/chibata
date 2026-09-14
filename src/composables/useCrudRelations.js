import { ref } from "vue";
import { useCrud } from "./useCrud";

export function useCrudRelations(config) {
  const { getList, getEnum } = useCrud(config.type);

  const relations = ref({});
  const statusMap = ref([]);

  async function loadRelations() {
    const fields = config.fields || [];

    for (const field of fields) {
      if (field.type === "select" && field.source) {
        const { data } = await getList(field.source);

        relations.value[field.key] =
          data?.data?.list?.map((i) => ({
            title: i[field.itemTitle || "name"],
            value: i[field.itemValue || "id"],
          })) || [];
      }

      // 🔥 STATUS (SEU CASO REAL)
      if (field.key === "status") {
        const { data } = await getEnum(`${config.type}StatusMap`);

        const raw = data?.data?.[0]?.value || [];

        // 🔧 NORMALIZA SEMPRE EM ARRAY PADRÃO
        statusMap.value = Array.isArray(raw) ? raw : [];
      }
    }
  }

  return {
    relations,
    statusMap,
    loadRelations,
  };
}
