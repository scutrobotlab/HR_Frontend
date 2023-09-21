<!-- 评价统计页面 -->
<template>
  <v-main>
    <ErrorAlert critical v-model="error" />
    <v-container>
      <v-card v-if="Object.entries(all_stastics).length === 0" :loading="loading">
        <v-card-title class="text-center title grey--text d-block py-12">{{
          loading ? "加载中…" : "暂无评价"
        }}</v-card-title>
      </v-card>
      <StasticsCard v-for="stastic in all_stastics" :key="stastic.id" :stastic="stastic" type="score" />
      <StasticsCard :stastic="remarks" type="remark" />
    </v-container>
  </v-main>
</template>

<script>
import axios from "axios";
import StasticsCard from "@/components/StasticsCard.vue";
import errorMixin from "@/mixins/errorMixin.js";

export default {
  mixins: [errorMixin],
  components: {
    StasticsCard,
  },
  data: () => ({
    loading: true,
    all_stastics: [],
    remarks: []
  }),
  computed: {
    loaded() {
      // 当 vuex 缓存的列表与当前路由请求相同时，说明当前列表已经加载过
      return this.$store.state.adminApplicant.applicant === this.$route.params.applicant;
    },
    applicant() {
      return this.loaded ? this.$store.state.adminApplicant.applicant : null;
    },
    admit() {
      return this.loaded ? this.$store.state.adminApplicant.admit : null;
    },
  },
  mounted() {
    this.load_data();
  },
  methods: {
    load_data() {
      this.loading = true;
      this.errorHandler(axios.get("/api/admin/applicant/scores/" + this.$route.params.appId))
        .then((response) => {
          var scores = response.data.scores;
          var result = {};
          scores.forEach((score) => {
            if (!(score.group in result)) {
              result[score.group] = {};
              result[score.group].group = score.group;
              result[score.group].scores = [];
            }
            score.score = parseFloat(score.score);
            result[score.group].scores.push(score);
          });
          this.all_stastics = result;
        })
        .finally(() => (this.loading = false));
      this.errorHandler(axios.get("/api/admin/remarks/list/" + this.$route.params.appId)
        .then((response) => {
          this.remarks = response.data.remarks;
        })
        .catch((error) => {
          window.console.log(error);
        }))
    },
  },
};
</script>

<style></style>
