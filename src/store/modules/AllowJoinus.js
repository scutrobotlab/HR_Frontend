import axios from "axios";

export default {
  namespaced: true,
  state: {
      applyForm: null,
      selectTime: null,
  },
  mutations: {},
  actions: {
    canApplyForm({ state }) {
      return axios({
        method: "get",
        url: "/api/joinus/can-apply"
      }).then((response) => {
        state.applyForm = response.data;
      });
    },
    
    canSelectTime({ state }) {
        return axios({
          method: "get",
          url: "/api/joinus/can-select"
        }).then((response) => {
            state.selectTime = response.data;
        });
      },
  },
};
