<template>
  <v-main>
    <template>
      <div class="v-app-bar" align="center">
        <v-card class="transparent" v-if="wechat" dark max-width="600" outlined align="left">
          <v-list-item two-line>
            <v-list-item-avatar tile>
              <v-img :src="secAvatar(wechat.headimgurl)"></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ wechat.nickname }}</v-list-item-title>
              <v-list-item-subtitle>微信已登录</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon @click="wechatLogin">
                <v-icon>mdi-account-convert</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-card>
        <v-tabs
            grow
            background-color="transparent"
            icons-and-text
            dark
            v-if="!this.$route.meta.noTabs"
        >
          <v-tabs-slider color="yellow"></v-tabs-slider>

          <v-tab v-for="(tab, key) in tabs" :key="key" :to="tab.url">
            {{ tab.text }}
            <v-icon>{{ tab.icon }}</v-icon>
          </v-tab>
        </v-tabs>
      </div>

      <router-view v-if="wechat" class="container" @next="goNext" :apply_msg="apply_msg"/>
      <v-btn block @click="wechatLogin" v-else
      >如果您的浏览器没有在几秒内自动跳转，请点击这里。
      </v-btn
      >
    </template>
    <ErrorAlert critical v-model="error"/>
  </v-main>
</template>

<script>
import errorMixin from "@/mixins/errorMixin.js";

export default {
  mixins: [errorMixin],
  data() {
    return {
      tabs: [
        {
          url: "/joinus/form",
          text: "报名表",
          icon: "mdi-clipboard-text",
        },

        {
          url: "/joinus/time",
          text: "面试时间",
          icon: "mdi-clock",
        },

        {
          url: "/joinus/done",
          text: "完成",
          icon: "mdi-check",
        },
      ],
      apply_msg: null,
    };
  },
  created() {
    window.console.log(`祝贺您发现彩蛋！
本网站由华工机器人实验室“战略信息组”开发。
如果你想加入“战略信息组”，请联系微信 N13618060211 。`);
    if (this.$route.query["login"] && !this.$route.query["token"]) {
      this.wechatLogin();
      return;
    }
    if (!this.wechat) {
      if (this.$route.query.token) {
        this.errorHandler(this.$store.dispatch("applicant/wechatLogin", this.$route.query.token));
      } else {
        this.$store.dispatch("applicant/wechatInfo").catch(() => {
          this.wechatLogin();
        });
      }
    }
  },
  mounted() {
    this.errorHandler(this.$store.dispatch("allowJoinus/canApplyForm"));
    this.errorHandler(this.$store.dispatch("allowJoinus/canSelectTime"));
  },
  computed: {
    wechat() {
      return this.$store.state.applicant.wechat;
    },

    step() {
      return this.$store.state.applicant.step;
    },
  },
  watch: {
    wechat() {
      this.$store.dispatch("applicant/getStep");
    },

    step(new_val) {
      if (this.$route.path !== this.tabs[new_val - 1].url && !this.$route.meta.noTabs)
        this.$router.push(this.tabs[new_val - 1].url);
    },

    "$route.path"() {
      this.$store.dispatch("applicant/getStep");
    },
  },
  methods: {
    wechatLogin() {
      this.$store.dispatch("config/get").then((conf) => {
        window.location.href = conf.url.wechat_uri + "/oauth/login?redirect=" + window.location.href;
      })
    },
    goNext() {
      this.$store
          .dispatch("applicant/getStep")
          .then(() => this.$router.push(this.tabs[this.step - 1].url));
    },
    secAvatar(avatar) {
      const url = new URL(avatar);
      url.protocol = document.location.protocol;
      return url.href;
    },
  },
};
</script>

<style scoped>
.transparent {
  background-color: #fff1 !important;
}

.container {
  display: block;
  max-width: 1080px;
}
</style>
