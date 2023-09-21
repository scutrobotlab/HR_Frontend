import axios from "axios";

export default {
  namespaced: true,
  state: {
    id: null,
    name: null,
    groups: [],
    default_standard_id: null,
    avatar: null,
    sms_enabled: false,
  },
  mutations: {
    login() {
      this.dispatch("config/get").then((conf) => {
        if (conf.debug) {
          this.dispatch("admin/login", "test-code")
            .then(() => document.location.assign("/admin"));
          return;
        }
        const url = new URL(conf.url.admin_uri + "/oauth/authorize");
        url.searchParams.set("client_id", conf.oauth.client_id);
        url.searchParams.set("redirect_uri", conf.oauth.redirect_uri);
        document.location.assign(url.href);
      })
    },
  },
  actions: {
    info({commit, state}) {
      if (state.id) return;
      return axios
        .get("/api/admin/info")
        .then((response) => {
          state.id = response.data.id;
          state.name = response.data.name;
          state.groups = response.data.groups.map((groups) => groups.name);
          state.default_standard_id = response.data.default_standard_id;
          state.avatar = response.data.avatar;
          state.sms_enabled = response.data.sms_enabled;
        })
        .catch((error) => {
          if (error.response.status === 401) {
            commit("logout");
            commit("login");
          }
        });
    },

    async logout({state}) {
      state.id = null;
      state.name = null;
      state.group = [];
      state.default_standard_id = null;
      state.avatar = null;
      state.sms_enabled = false;
      await axios.post("/api/admin/logout")
        .finally(() => {
          window.localStorage.removeItem('admin-token'); // 清除 JWT-Token
        })
    },

    login({state}, code) {
      return axios.post("/api/admin/login/" + code).then((response) => {
        state.id = response.data.id;
        state.name = response.data.name;
        state.groups = response.data.groups.map((groups) => groups.name);
        state.default_standard_id = response.data.default_standard_id;
        state.avatar = response.data.avatar;
        state.sms_enabled = response.data.sms_enabled;
        window.localStorage.setItem('admin-token', response.data.token); //  保存 JWT-Token
      });
    },

    setDefault({state}, standard_id) {
      if (standard_id === "null") standard_id = 0;
      return axios({
        method: "post",
        url: "/api/admin/set-default-standard?standard_id=" + standard_id,
      })
        .then(() => {
          state.default_standard_id = standard_id;
        })
        .finally(() => (this.submit_loading = false));
    },
  },
  getters: {},
};
