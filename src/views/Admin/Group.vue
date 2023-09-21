<!-- 面试者分组列表页面 -->
<template>
  <div>
    <v-navigation-drawer width="300" v-model="drawer" app>
      <v-list-item-group v-model="group">
        <v-list-item link color="primary" v-for="g in groups" :key="g.id" :value="g">
          <v-list-item-action>
            <v-icon v-if="admin_group.includes(g)" color="amber">mdi-star</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-if="g !== '赛规'">{{ g }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
      <template v-slot:append>
        <v-bottom-navigation grow>
          <v-btn to="/admin/group" disabled><span> 面试列表 </span>
            <v-icon>mdi-account</v-icon>
          </v-btn>
          <v-btn to="/admin/features"><span> 实用功能 </span>
            <v-icon>mdi-toolbox</v-icon>
          </v-btn>
          <v-btn to="/admin/configs"><span> 配置中心 </span>
            <v-icon>mdi-cog</v-icon>
          </v-btn>
        </v-bottom-navigation>
      </template>
    </v-navigation-drawer>

    <v-app-bar app color="blue darken-3" dark>
      <v-toolbar-title style="width: 300px">
        <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
        <span>{{ group }}</span>
      </v-toolbar-title>
      <v-spacer />
      <v-btn icon @click="$router.push('/admin/search')">
        <v-icon>mdi-magnify</v-icon>
      </v-btn>

      <AdminButton />

      <template v-slot:extension>
        <v-tabs align-with-title background-color="transparent" v-model="state" show-arrows>
          <v-tabs-slider color="yellow"></v-tabs-slider>
          <v-tab v-for="s in states" :key="s">{{ s }}</v-tab>
        </v-tabs>
      </template>
    </v-app-bar>
    <v-main>
      <ErrorAlert critical v-model="error" />
      <v-alert type="info" text class="ma-0">{{ info_text }}</v-alert>
      <v-row class="ma-0">
        <v-col cols="12" md="6" lg="8" class="pa-0">
          <div v-if="applicants_loaded">
            <GroupListItem
              v-for="applicant in applicants"
              :key="applicant.id"
              :applicant="applicant"
            />
          </div>
          <div v-else>
            <v-skeleton-loader
              v-for="n in 10"
              :key="n"
              class="mx-auto applicant-list-Loader"
              type="list-item-avatar-two-line"
            ></v-skeleton-loader>
          </div>
          <v-pagination class="mt-5 mb-10" v-model="page" :length="pages_count"></v-pagination>
        </v-col>
        <v-col cols="12" md="6" lg="4" class="pa-0">
          <StatisticsBar />
        </v-col>
      </v-row>
    </v-main>
  </div>
</template>

<script>
import AdminButton from "@/components/AdminButton.vue";
import GroupListItem from "@/components/GroupListItem.vue";
import errorMixin from "@/mixins/errorMixin.js";
import StatisticsBar from "@/components/Statistics/StatisticsBar";

export default {
  mixins: [errorMixin],
  components: {
    AdminButton,
    GroupListItem,
    StatisticsBar,
  },
  data: () => ({
    drawer: null,
    states: ["未评分", "已评分", "已录取", "临近面试", "需要评分"],
  }),
  computed: {
    info_text() {
      return this.count_loaded
        ? this.group + this.states[this.state] + " " + this.total + " 人。"
        : "加载中...";
    },
    groups() {
      return this.$store.state.groups.list;
    },
    admin_group() {
      return this.$store.state.admin.groups;
    },
    count_loaded() {
      return (
        this.$store.state.adminGroup.group === this.$route.params.group &&
        this.$store.state.adminGroup.state === this.$route.params.state
      );
    },
    applicants_loaded() {
      // 当 vuex 缓存的列表与当前路由请求相同时，说明当前列表已经加载过
      return (
        this.$store.state.adminGroup.group === this.$route.params.group &&
        this.$store.state.adminGroup.state === this.$route.params.state &&
        this.$store.state.adminGroup.page === this.$route.params.page
      );
    },
    applicants() {
      // 当前列表已经加载完毕时，先返回缓存的列表
      return this.applicants_loaded ? this.$store.state.adminGroup.applicants : null;
    },
    pages_count() {
      return this.$store.state.adminGroup.last_page;
    },
    total() {
      return this.$store.state.adminGroup.total;
    },
    group: {
      // getter
      get: function () {
        return this.$route.params.group;
      },
      // setter
      set: function (new_val) {
        if (new_val != null) this.$router.push("/admin/group/" + new_val + "/未评分/1");
      },
    },
    state: {
      // getter
      get: function () {
        return this.states.indexOf(this.$route.params.state);
      },
      // setter
      set: function (new_val) {
        if (new_val != null && this.$route.params.group != null)
          this.$router.push(
            "/admin/group/" + this.$route.params.group + "/" + this.states[new_val] + "/1"
          );
      },
    },
    page: {
      // getter
      get: function () {
        return parseInt(this.$route.params.page);
      },
      // setter
      set: function (new_val) {
        this.$router.push(
          "/admin/group/" +
            this.$route.params.group +
            "/" +
            this.$route.params.state +
            "/" +
            new_val
        );
      },
    },
  },
  watch: {
    admin_group(new_val) {
      if (this.$route.params.group) return;
      this.$router.replace("/admin/group/" + new_val[0] + "/未评分/1");
    },
    "$route.params": function () {
      this.load_list();
    },
  },
  mounted() {
    this.$store.dispatch("groups/get");
    if (!this.group) this.group = this.admin_group[0];
    if (this.state != null && this.group != null && this.page != null) this.load_list();
  },
  methods: {
    load_list() {
      this.errorHandler(this.$store.dispatch("adminGroup/get", this.$route.params));
    },
  },
};
</script>

<style>
.v-list-item__avatar {
  justify-content: center !important;
}
</style>
