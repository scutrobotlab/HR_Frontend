import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import zhHans from 'vuetify/lib/locale/zh-Hans';

Vue.use(Vuetify);

export default new Vuetify({
    lang: {
      locales: { zhHans },
      current: 'zhHans',
    },
});
