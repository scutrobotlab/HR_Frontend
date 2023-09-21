import axios from "axios";

export default {
  namespaced: true,
  state: {
    form: null,
    intent: null,
    loaded: false,
  },
  mutations: {},
  actions: {
    get({ state }) {
      if (state.loaded) return;
      return axios({
        method: "get",
        url: "/api/form/get",
      }).then((response) => {
        state.form = response.data.form;
      });
    },
  },
};
