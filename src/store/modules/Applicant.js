import axios from "axios";

export default {
  namespaced: true,
  state: {
    wechat: null,
    intents: [],
    finished: [],
    step: 0,
    model: {
      wechat_id: null,
      name: "",
      gender: "",
      phone: "",
      intents: [],
      parallel: false,
    },
    form_model: {}
  },
  mutations: {},
  actions: {
    setModel({ state }, model, form_model) {
      state.model = model;
      state.form_model = form_model;
    },
    getModel({ state }) {
      return axios({
        method: "get",
        url: "/api/joinus/form",
      }).then((response) => {
        if (response.data.applicant) {
          state.model.name = response.data.applicant.name;
          state.model.gender = response.data.applicant.gender;
          state.model.phone = response.data.applicant.phone;
          if (response.data.applicant.intents)
            state.model.intents = response.data.applicant.intents.map((intent) => intent.group);
          state.form_model = JSON.parse(response.data.applicant.form);
        }
      });
    },

    wechatInfo({ state }) {
      return axios.get("/api/joinus/wechat").then((response) => {
        state.wechat = response.data;
      });
    },

    wechatLogin({ state }, token) {
      return axios.post("/api/joinus/login/" + token).then((response) => {
        state.wechat = response.data;
        window.localStorage.setItem('applicant-token', response.data.token); //  保存 JWT-Token
        window.location.href = "/joinus";
      });
    },

    getStep({ state }) {
      return axios.get("/api/joinus/step/").then((response) => {
        state.step = response.data.step;
        // if (state.step >= 2 && (state.model.wechat_id == null || state.model.name === "")) {
        // }
      });
    },

    getIntents({ state }) {
      return axios({
        method: "get",
        url: "/api/joinus/intents",
        params: { wechat_id: state.wechat.openid },
      }).then((response) => {
        state.intents = [];
        state.intents = response.data.intents.map((intent) => intent.group);
        state.finished = response.data.intents.map((intent) => intent.finished);
      });
    },
  },
};
