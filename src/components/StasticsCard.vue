<template>
  <div>
    <v-card class="ma-3" v-if="type === 'score'">
      <v-list-item three-line>
        <v-list-item-content>
          <v-list-item-title class="headline mb-1"
                             :class="admitted.includes(this.stastic.group) ? 'green--text text--darken-3 ' : ''">
            {{ stastic.group }}
            <v-icon v-if="admitted.includes(this.stastic.group)" color="success">mdi-marker-check</v-icon>
          </v-list-item-title>
          <v-list-item-subtitle>
            <div class="mb-3" v-if="intention === undefined">非意向组别</div>
            <div class="mb-3" v-else-if="!intention.parallel">第{{ intention.rank + 1 }}志愿</div>
            <div class="display-1 font-weight-bold">{{ average.toFixed(1) }}</div>
          </v-list-item-subtitle>
          <v-rating :value="average" background-color="orange lighten-4" color="orange darken-1" dense half-increments
                    readonly size="24"></v-rating>
        </v-list-item-content>
        <v-progress-circular :value="100 * rank_p" size="80" rotate="-90" :color="'hsl(' + rank_p * 120 + ', 100%, ' + ((rank_p - 0.6) * (rank_p - 0.6) * 35 + 20) + '%)'
          ">
          排名
          <br/>
          {{ rank }}/{{ total }}
        </v-progress-circular>
      </v-list-item>
      <v-card-actions>
        <span v-if="admin_groups.includes(this.stastic.group)">
          <v-btn text color="green darken-3" v-if="!admitted.includes(this.stastic.group)" @click="setAdmit"
                 :loading="admit_btn_loading">录用</v-btn>
          <CancleAdmit :admit="admit" :applicant_name="applicant_name" v-else/>
        </span>
        <v-spacer></v-spacer>
        <div class="px-2 grey--text text--darken-2">该组{{ stastic.scores.length }}人评分</div>
        <v-btn icon @click="
          show = !show;
        error = null;
        ">
          <v-icon>{{ show ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
        </v-btn>
      </v-card-actions>
      <ErrorAlert v-model="error"/>
      <v-expand-transition>
        <div v-show="show">
          <v-divider></v-divider>
          <v-list>
            <v-list-item v-for="score in stastic.scores" :key="score.admin.id">
              <v-list-item-content>
                <v-list-item-title>
                  {{ score.admin.name }}
                  <v-rating :value="score.score" background-color="orange lighten-4" color="orange darken-1" dense
                            half-increments readonly size="14"></v-rating>
                </v-list-item-title>
              </v-list-item-content>
              <div class="grey--text">{{ (score.score / 1).toFixed(1) }}</div>
            </v-list-item>
          </v-list>
        </div>
      </v-expand-transition>
    </v-card>
    <v-card class="ma-3" v-else-if="type === 'remark'">
      <v-list-item three-line>
        <v-list-item-content>
          <v-list-item-title class="headline mb-1 green--text text--darken-3">
            评价
          </v-list-item-title>
          <v-list-item-subtitle>
            <div class="mb-3">共有{{ stastic.length }}条评论</div>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>
      <v-expand-transition>
        <v-list>
          <v-list-item v-for="remark in stastic" :key="remark.id">
            <v-list-item-content>
              <v-list-item-title>
                {{ remark.admin_name }}&nbsp;
                <span class="grey--text">{{ remark.updated_at }}</span>
              </v-list-item-title>
              <div class="grey--text my-text">{{ remark.remark }}</div>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-expand-transition>
    </v-card>
    <v-card class="ma-3" v-else-if="type === 'review'">
      <v-list-item three-line>
        <v-list-item-content>
          <v-list-item-title class="headline mb-1 green--text text--darken-3">
            年度总结
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <div v-for="(text, i) in stastic" :key="i">
        <v-divider></v-divider>
        <v-expand-transition>
          <v-list>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>
                  <div style="white-space: pre-wrap;">{{ text }}</div>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-expand-transition>
      </div>
    </v-card>
  </div>
</template>

<script>
import axios from "axios";
import errorMixin from "@/mixins/errorMixin.js";
import CancleAdmit from "@/components/CancleAdmit.vue";

export default {
  mixins: [errorMixin],
  props: ["stastic", "type"],
  components: {CancleAdmit},
  computed: {
    average() {
      var sum = 0;
      var count = 0;
      this.stastic.scores.forEach((score) => {
        sum += score.score;
        count++;
      });
      return sum / count;
    },
    rank_p() {
      return (this.total - this.rank + 1) / this.total;
    },
    admin_groups() {
      return this.$store.state.admin.groups;
    },
    loaded() {
      return this.$store.state.adminApplicant.id == this.$route.params.appId;
    },
    intention() {
      if (this.loaded)
        return this.$store.state.adminApplicant.applicant.intents.find(
            (intent) => intent.group === this.stastic.group
        );
      else return false;
    },

    applicant_name() {
      if (this.loaded) return this.$store.state.adminApplicant.applicant.name;
      else return "";
    },
    admitted() {
      return this.loaded && this.$store.state.adminApplicant.admits;
    },
    admit() {
      var admits = this.$store.state.adminApplicant.applicant.admits;
      if (this.loaded && admits) return admits.find((admit) => admit.group === this.stastic.group);
      else return false;
    },
  },
  data: () => ({
    admit_btn_loading: false,
    show: false,
    total: 1,
    rank: 0,
  }),
  methods: {
    setAdmit() {
      this.admit_btn_loading = true;
      this.errorHandler(
          axios({
            method: "post",
            url: "/api/admin/applicant/admit/set",
            data: new URLSearchParams({
              applicant_id: this.$route.params.appId,
              group: this.stastic.group,
            }),
          })
      ).then(() => {
        this.$store
            .dispatch("adminApplicant/get", this.$route.params)
            .finally(() => (this.admit_btn_loading = false));
      });
    },
  },
  mounted() {
    if (this.type === "score") {
      axios
          .get("/api/admin/rank/" + this.stastic.group + "/" + this.$route.params.appId)
          .then((response) => {
            this.total = response.data.total;
            this.rank = response.data.rank;
          })
          .catch((error) => {
            window.console.log(error);
          });
    }
  }
}
</script>

<style>
.my-text {
  white-space: pre-wrap;
  word-break: break-all;
  overflow: hidden;
}
</style>
