<!-- 面试者详情的头部 -->
<template>
  <div>
    <v-app-bar app color="blue darken-3" dark>
      <v-toolbar-title style="width: 300px">
        <v-btn icon @click="$router.go(-1)">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <span v-if="applicant">
          <ruby>{{ applicant.name }}
              <rt>{{ get_pinyin(applicant.name) }}</rt>
          </ruby>
        </span>
      </v-toolbar-title>
      <v-spacer />
      <v-btn icon @click="$router.replace('/admin/search')">
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
      <AdminButton />

      <template v-slot:extension>
        <v-tabs centered background-color="transparent">
          <v-tabs-slider color="yellow"></v-tabs-slider>
          <v-tab :to="'info'" replace>报名表详情</v-tab>
          <v-tab :to="'evaluation'" replace>我的评价</v-tab>
          <v-tab :to="'stastics'" replace>评价统计</v-tab>
          <v-tab :to="'exam'" replace>面试题库</v-tab>
        </v-tabs>
      </template>
    </v-app-bar>
    <v-main v-if="loading">
      <ErrorAlert critical v-model="error" />
      <v-skeleton-loader
        v-for="n in 8"
        :key="n"
        class="mx-auto applicant-list-Loader"
        type="list-item-avatar-two-line"
      ></v-skeleton-loader>
    </v-main>
    <router-view v-else-if="applicant" />
  </div>
</template>

<script>
import AdminButton from "@/components/AdminButton.vue";
import errorMixin from "@/mixins/errorMixin.js";
import {pinyin} from "pinyin-pro";

export default {
  mixins: [errorMixin],
  components: {
    AdminButton,
  },
  computed: {
    groups() {
      return this.$store.state.groups.list;
    },
    loading() {
      return this.$store.state.adminApplicant.id != this.$route.params.appId;
    },
    applicant() {
      return this.loading ? null : this.$store.state.adminApplicant.applicant;
    },
  },
  methods: {
    get_pinyin(text) {
      return pinyin(text)
    },
  },
  mounted() {
    this.$store.dispatch("groups/get");
    this.errorHandler(this.$store.dispatch("adminApplicant/get", this.$route.params));
  },
  data: () => ({
    scores: null,
  }),
};
</script>
