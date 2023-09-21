import axios from "axios";

export default {
  namespaced: true,
  state: {
    id: null,
    applicant: null,
    admits: null,
    scores: null,
  },
  mutations: {},
  actions: {
    get({ state }, params) {
      return axios.get("/api/admin/applicant/info/" + params.appId).then((response) => {
        state.id = params.appId;
        state.applicant = response.data.applicant;
        state.admits = response.data.applicant.admits.map((admit) => admit.group);

        for (let i = 0; i < state.applicant.intents.length; i++) {
          const e = state.applicant.intents[i];
          let pos = state.applicant.times.map(e => e.group).indexOf(e.group)
          state.applicant.intents[i].time = state.applicant.times[pos];
        }
      });
    }
  },
};
