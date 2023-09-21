import axios from "axios";

export default {
  namespaced: true,
  state: {
    group: null,
    state: null,
    page: null,
    last_page: 0,
    total: 0,
    applicants: null,
  },
  mutations: {},
  actions: {
    get({ state }, params) {
      return axios({
        method: "get",
        url: "/api/admin/applicant/group",
        params: params,
      }).then((response) => {
        state.group = params.group;
        state.state = params.state;
        state.page = params.page;
        state.applicants = response.data.data;
        state.last_page = response.data.last_page;
        state.total = response.data.total;
      });
    },
  },
};
