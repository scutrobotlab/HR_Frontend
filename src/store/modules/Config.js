import axios from "axios";

export default {
  namespaced: true,
  state: {
    loaded: false,
    debug: true,
    oauth: {
      client_id: "",
      redirect_uri: "",
    },
    url: {
      admin_uri: "",
      wechat_uri: "",
      base_uri: ""
    }
  },
  actions: {
    async get({state}) {
      if (!state.loaded) await load_data(state);
      return state;
    }
  },
  methods: {}
}

function load_data(state) {
  return axios.get("/api/admin/frontend-config")
    .then(resp => {
      state.debug = resp.data.debug;
      state.oauth = resp.data.oauth;
      state.url = resp.data.url;
      state.loaded = true;
    })
}