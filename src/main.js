import './plugins/chartist'
import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import i18n from "./i18n";
import moment from "moment";
import vuetify from './plugins/vuetify';
import './config/axios-config'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'

Vue.config.productionTip = false;

new Vue({
  store,
  router,
  i18n,
  vuetify,
  render: (h) => h(App)
}).$mount("#app");

moment.locale(process.env.VUE_APP_I18N_LOCALE || "zh-cn");
document.title = process.env.VUE_APP_ORGANIZATION + "面试系统";
