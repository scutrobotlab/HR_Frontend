import axios from "axios";

export default {
  namespaced: true,
  state: {
    dailyNew: { data: [], updated: null },
    class: { data: [], updated: null }
  },
  mutations: {},
  actions: {
    getDailyNew({ state }) {
      state.dailyNew.data = [];
      state.dailyNew.updated = null;
      return axios.get("/api/admin/statistics/dailynew").then((response) => {
        state.dailyNew.data = response.data.applicants;
        state.dailyNew.updated = new Date();
      });
    },
    getClass({ state }, data) {
      state.class.data = [];
      state.class.updated = null;
      return axios({
        method: "get",
        url: "/api/admin/statistics/class",
        params: { group: data.group, key: data.key }
      }).then((response) => {
        state.class.data = response.data.class;
        state.class.updated = new Date();
      });
    },
  },
};
