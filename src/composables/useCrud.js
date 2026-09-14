import http from "@/plugins/axios";

export function useCrud(type) {
  const list = (payload) => http.post(`/${type}/list`, payload);

  const detail = (id) =>
    http.post(`/${type}/detail`, {
      id,
    });

  const create = (data) => http.post(`/${type}/add`, data);

  const update = (data) => http.put(`/${type}/update`, data);

  const remove = (id) =>
    http.delete(`/${type}/remove`, {
      params: { id },
    });

  const getEnum = (key) =>
    http.post(`/parametro/getValue`, {
      key: [key],
    });

  const getList = (endpoint) => http.post(`/${endpoint}/list`);

  return {
    list,
    detail,
    create,
    update,
    remove,
    getEnum,
    getList,
  };
}