<template>
  <v-main>
    <v-container fluid>
      <ErrorAlert critical v-model="error"/>
      <v-snackbar v-model="hasScoredShow" color="success" text class="ma-0">已评价。</v-snackbar>
      <v-alert v-if="admin_groups.length === 0" text type="error">你不属于任何组别，无法进行评分。</v-alert>
      <v-row justify="center" :class="$vuetify.breakpoint.xs ? '' : 'mx-10'">
        <v-col cols="12" md="10" lg="4">
          <v-select v-show="admin_groups.length > 1" :items="admin_groups" v-model="group" label="选择评价组别" solo/>
          <v-card :loading="mounted_loading">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="headline">总评</v-list-item-title>
                <v-list-item-subtitle>{{
                    score ? score.toFixed(2) + " 分" : "暂无评分"
                  }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-card-text class="text-center">
              <v-rating :dense="$vuetify.breakpoint.xs" :size="$vuetify.breakpoint.xs ? 40 : 48"
                        background-color="grey lighten-1" color="orange darken-1" half-increments v-model="score"
                        @input="setScore"></v-rating>
            </v-card-text>
            <v-divider/>
            <EvaRemark/>
          </v-card>
        </v-col>
        <v-col cols="12" md="10" lg="8">
          <v-card :loading="mounted_loading">
            <v-list two-line flat style="background: transparent" class="pa-0">
              <v-list-item-group>
                <v-dialog v-model="dialog" transition="slide-x-transition" :max-width="600" persistent
                          @input="updateEvaList">
                  <template v-slot:activator="{ on }">
                    <v-list-item v-on="on">
                      <v-list-item-content class="py-5">
                        <v-list-item-title class="headline">评价标准</v-list-item-title>
                        <v-list-item-subtitle>{{ standard_name || "无" }}</v-list-item-subtitle>
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-icon>mdi-chevron-right</v-icon>
                      </v-list-item-action>
                    </v-list-item>
                  </template>
                  <SelectEvaStd v-model="standard_id" @close="dialog = false"/>
                </v-dialog>
              </v-list-item-group>

              <v-list-item-group v-if="std_scores">
                <v-list-item v-for="std_score in std_scores" :key="std_score.id" :ripple="false" inactive>
                  <v-list-item-content>
                    <v-list-item-title>{{ std_score.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{
                        ((std_score.weight * 100) / weight_total).toFixed(2)
                      }}
                      %
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-rating half-increments :dense="$vuetify.breakpoint.xs" :size="$vuetify.breakpoint.xs ? 28 : 38"
                              background-color="grey lighten-1" color="orange darken-1" v-model="std_score.score"
                              @input="setEvaScore"></v-rating>
                  </v-list-item-action>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
      <div class="text-center my-3">
        <v-btn class="ma-2" color="error" outlined :loading="delete_loading" :disabled="!hasScored"
               @click="deleteScore">
          <v-icon left>mdi-delete</v-icon>
          删除评分
        </v-btn>
        <v-btn class="ma-2" color="indigo" outlined :loading="update_loading" :disabled="!score || !group"
               @click="submitScore">
          <v-icon left>mdi-check</v-icon>
          {{ hasScored ? "修改" : "提交" }}评分
        </v-btn>
      </div>
    </v-container>
  </v-main>
</template>

<script>
import axios from "axios";
import EvaRemark from "@/components/EvaRemark.vue";
import SelectEvaStd from "@/components/SelectEvaStd.vue";
import errorMixin from "@/mixins/errorMixin.js";

export default {
  mixins: [errorMixin],
  components: {
    EvaRemark,
    SelectEvaStd,
  },
  data: () => ({
    hasScored: false,
    hasScoredShow: false,
    dialog: false,
    mounted_loading: true, //防止mounted改变standard_id导致子项评分被清空
    update_loading: false,
    delete_loading: false,
    standard_loading: false,
    standard_id: null,
    standard_name: null,
    std_scores: [],
    score: 0,
    group: null,
  }),
  mounted() {
    this.mounted_loading = true;
    this.group = this.admin_groups[0];
  },
  computed: {
    weight_total() {
      var weight_total = 0;
      this.std_scores.forEach((std) => {
        weight_total += std.weight;
      });
      return weight_total;
    },

    admin_groups() {
      return this.$store.state.admin.groups;
    },
  },
  watch: {
    standard_id(new_val) {
      if (!new_val || new_val === "null") {
        this.standard_name = null;
        this.std_scores = [];
        return;
      }
      this.standard_loading = true;
      this.errorHandler(axios.get("/api/admin/evaluation/info/" + new_val))
          .then((response) => {
            this.standard_name = response.data.evaluation_standard.name;
            if (this.hasScored) return;
            let standard = response.data.evaluation_standard.standard;
            if (!standard) return;
            standard.forEach((item) => {
              item.score = this.score;
            });
            this.std_scores = standard;
          })
          .finally(() => (this.standard_loading = false));
    },
    group() {
      this.updateScore();
    }
  },
  methods: {
    updateScore() {
      this.errorHandler(axios.get("/api/admin/scores/" + this.$route.params.appId + "?group=" + this.group)).then((response) => {
        if (response.data) {
          // 已经评分
          this.hasScored = true;
          this.hasScoredShow = true;
          this.score = parseFloat(response.data.score);
          this.standard_id = response.data.standard_id;
          this.group = response.data.group;
          this.std_scores = response.data.evaluation_details;
        } else {
          // 没有评分
          this.hasScored = false;
          this.score = 0.0
          this.standard_id = this.$store.state.admin.default_standard_id;
        }
        this.mounted_loading = false;
      });
    },
    updateEvaList() {
      this.errorHandler(this.$store.dispatch("evaluationStd/getList"));
    },
    setScore(val) {
      this.std_scores.forEach((std) => {
        std.score = val;
      });
    },
    setEvaScore() {
      var total_score = 0;
      this.std_scores.forEach((std) => {
        total_score += std.weight * std.score;
      });
      this.score = total_score / this.weight_total;
    },
    submitScore() {
      this.update_loading = true;
      this.errorHandler(
          axios({
            method: "post",
            url: "/api/admin/scores/" + this.$route.params.appId,
            data: {
              score: this.score,
              group: this.group,
              standard_id: this.standard_id,
              evaluation_details: this.std_scores,
            },
          })
      )
          .then(() => {
            this.hasScored = true;
            this.hasScoredShow = true;
          })
          .finally(() => (this.update_loading = false));
    },
    deleteScore() {
      this.hasScoredShow = false;
      this.delete_loading = true;
      this.errorHandler(
          axios({
            method: "delete",
            url: "/api/admin/scores/" + this.$route.params.appId + "?group=" + this.group,
          })
      )
          .then(() => {
            this.hasScored = false;
            this.score = 0;
          })
          .finally(() => (this.delete_loading = false));
    },
  },
};
</script>

<style></style>
