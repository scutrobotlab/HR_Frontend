<template>
  <div>
    <v-app-bar app dark color="primary">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer/>
      <AdminButton/>
    </v-app-bar>

    <v-navigation-drawer width="300" v-model="drawer" app>
      <v-list-item to="/admin/configs/main" color="accent">
        <v-list-item-content>
          <v-list-item-title>配置中心首页</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-divider/>
      <v-list dense nav>
        <div v-for="r in routes" :key="r.key">
          <div v-if="r.meta && (!r.meta.requiresSuperAdmin || $store.state.admin.id === 1)">
            <v-list-item :to="'/admin/configs/' + r.path" color="accent">
              <v-list-item-icon>
                <v-icon>{{ r.meta.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ r.meta.title }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </div>
        </div>
      </v-list>
      <template v-slot:append>
        <v-bottom-navigation grow>
          <v-btn to="/admin/group"><span> 面试列表 </span>
            <v-icon>mdi-account</v-icon>
          </v-btn>
          <v-btn to="/admin/features"><span> 实用功能 </span>
            <v-icon>mdi-toolbox</v-icon>
          </v-btn>
          <v-btn to="/admin/configs" disabled><span> 配置中心 </span>
            <v-icon>mdi-cog</v-icon>
          </v-btn>
        </v-bottom-navigation>
      </template>
    </v-navigation-drawer>

    <v-main>
      <router-view class="px-5"/>
    </v-main>
  </div>
</template>

<script>
import AdminButton from "@/components/AdminButton.vue";
import errorMixin from "@/mixins/errorMixin.js";

export default {
  mixins: [errorMixin],
  components: {
    AdminButton,
  },
  data: () => ({
    loading: false,
    drawer: null,
  }),
  computed: {
    title() {
      return this.$route.meta.title || "配置中心";
    },
    routes() {
      var configs = this.$router.options.routes.find((route) => route.path === "/admin/configs");
      return configs.children;
    },
    name() {
      return this.$store.state.UserInfo.name;
    },
    email() {
      return this.$store.state.UserInfo.email;
    },
    avatarUrl() {
      return this.$store.state.UserInfo.avatarUrl;
    },
  },
  methods: {
    RoutePush(path) {
      if (this.$route.path !== "/configs/" + path) this.$router.push("/configs/" + path);
    },
  },
};
</script>

<style></style>
