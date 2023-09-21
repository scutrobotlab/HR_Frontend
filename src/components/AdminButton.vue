<template>
  <v-menu offset-y>
    <template v-slot:activator="{ on }">
      <v-chip link outlined v-on="on">
        <v-avatar left class="hidden-sm-and-down" v-if="loading">
          <v-icon>mdi-loading mdi-spin</v-icon>
        </v-avatar>
        <v-avatar left class="hidden-sm-and-down" v-else-if="admin.avatar">
          <v-img :src="secAvatar(admin.avatar)"></v-img>
        </v-avatar>
        <v-avatar left class="hidden-sm-and-down" v-else-if="admin.id">
          <v-img src="@/assets/logo.svg"></v-img>
        </v-avatar>
        <v-avatar left class="hidden-sm-and-down" v-else>
          <v-icon color="red">mdi-alert-circle</v-icon>
        </v-avatar>
        {{ text }}
      </v-chip>
    </template>

    <v-list>
      <v-list-item @click="account">
        <v-list-item-title>退出登录</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  computed: {
    admin() {
      return this.$store.state.admin;
    },
    text() {
      if (this.admin.name) {
        return this.admin.name;
      }
      if (this.loading) {
        return "加载中...";
      }
      if (this.error) {
        switch (this.error) {
          case 401:
            return "未登录";

          default:
            return "错误";
        }
      }
      return "未知状态";
    },
  },
  data() {
    return {
      loading: true,
      error: 0,
    };
  },
  created() {
    this.loading = true;
    this.$store
        .dispatch("admin/info")
        .catch((error) => {
          window.console.log("error", error);
          this.error = error.response.status;
        })
        .finally(() => (this.loading = false));
  },
  methods: {
    account() {
      this.$store.dispatch("admin/logout")
      this.$store.dispatch("config/get").then((conf) => {
        const url = new URL(conf.url.admin_uri);
        document.location.assign(url.href);
      })
    },
    secAvatar(avatar) {
      const url = new URL(avatar);
      url.protocol = document.location.protocol;
      return url.href;
    },
  },
};
</script>
