import axios from "axios";

export default {
  namespaced: true,
  state: {
    list: [],
    loaded: false,
  },
  mutations: {},
  actions: {
    get({ state }) {
      if (state.loaded) return;
      return axios.get("/api/form/groups").then((response) => {
        state.list = response.data.groups;
        state.loaded = true;
      });
    },
  },
};
