import axios from "axios";

export default {
  namespaced: true,
  state: {
    list: null,
    loading_list: true,
  },
  mutations: {},
  actions: {
    getList({ state }) {
      state.loading_list = true;
      return axios
        .get("/api/admin/evaluation/list")
        .then((response) => {
          state.list = response.data.list;
          state.loading_list = false;
        })
        .finally(() => (state.loading_list = false));
    },
  },
};
