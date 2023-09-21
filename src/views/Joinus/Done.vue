<template>
  <v-container fluid>
    <ErrorAlert v-model="error"/>
    <div v-if="body" class="text-center">
      <v-alert :type="alertType" prominent text>
        {{ body }}
      </v-alert>
    </div>
    <v-card v-if="result.status === 'passed'" class="mt-5 mb-5">
      <v-card-title>Offer</v-card-title>
      <v-card-subtitle>
        已于 {{ publishResultStartTime }} 发放
      </v-card-subtitle>
      <v-card-text class="text-pre-line">
        <div v-html="getHref(joinUs)"></div>
      </v-card-text>
    </v-card>
    <v-card :v-if="result.status === 'HaveNotPublished'"
            class="mt-5 mb-5" v-for="(item, i) in result.times" :key="i">
      <v-card-title>
        {{ item.group }}组面试
      </v-card-title>
      <v-card-text>
        面试于 {{ fDate(item.date) }}{{ fTime(item.time) }} 在{{ item.location }}进行。<br>
        {{ item["meeting_id"] !== "" ? "您的飞书会议号是 " + item["meeting_id"] + "." : "" }}
      </v-card-text>
      <v-card-actions>
        <v-btn
            :disabled="finished[i]"
            text color="error" @click="deleteTime = item; deleteDialog = true">
          放弃面试
        </v-btn>
        <v-btn
            v-if="item['meeting_id'] !== ''"
            :disabled="!enableMeeting(getMoment(item.date, item.time))"
            text color="primary"
            @click="launchMeeting(item['meeting_id'])">
          启动面试
        </v-btn>
      </v-card-actions>
    </v-card>
    <div class="text-center" v-if="step > 1 && showInterviewQuestionTime != null">
      <v-btn v-if="showInterviewQuestion()" x-large text to="/joinus/exam/main" color="primary">
        各组题库抢先看<br/>
        测试面试成功率
      </v-btn>
      <p v-else>
        面试题将于 {{ this.showInterviewQuestionTime }} 公布
      </p>
    </div>
    <v-dialog v-model="deleteDialog" max-width="380">
      <v-card>
        <v-card-title class="text-h5">
          放弃面试
        </v-card-title>
        <v-card-text>
          您确定要放弃<b>{{ deleteTime.group }}组</b>的面试时间吗？<br>
          放弃后该面试名额将被释放，其他面试者可以选择该时间，您仍然可以选择有空位的时间。
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="deleteDialog = false;">取消</v-btn>
          <v-btn color="red darken-1" text @click="cancelInterview(deleteTime.group)">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <StasticsCard v-if="review.text" :stastic="review.text" type="review"/>
  </v-container>
</template>

<script>
import moment from "moment";
import axios from "axios";
import Handlebars from "handlebars";
import errorMixin from "@/mixins/errorMixin.js";
import StasticsCard from "@/components/StasticsCard.vue";
import time from "@/views/Joinus/Time.vue";

export default {
  mixins: [errorMixin],
  components: {
    StasticsCard,
  },
  data: () => ({
    body: "",
    joinUs: "",
    result: {
      groups: [],
      status: null,
      times: [],
    },
    publishResultStartTime: null,
    showInterviewQuestionTime: null,
    review: {},
    alertType: "success",
    deleteDialog: false,
    deleteTime: {},
    allowStartMeetingMinutes: 30,
  }),
  methods: {
    fDate(date) {
      return moment(date).format("MMMDo");
    },
    fTime(time) {
      return moment(time, "HH:mm:ss").format("HH:mm");
    },
    showInterviewQuestion() {
      if (this.showInterviewQuestionTime === null) return false;
      return moment().isAfter(moment(this.showInterviewQuestionTime));
    },
    cancelInterview(group) {
      this.deleteDialog = false;
      axios({
        method: "post",
        url: "/api/joinus/time",
        data: {time_id: 0, group: group},
      }).then(() => {
        this.refreshModel();
      })
    },
    launchMeeting(meetingId) {
      meetingId = meetingId.replaceAll("-", "")
      window.open("https://vc.feishu.cn/j/" + meetingId)
    },
    getMoment(date, time) {
      return moment(date + "T" + time);
    },
    enableMeeting(meeting_moment) {
      return Math.abs(moment().diff(meeting_moment, "minutes")) <= this.allowStartMeetingMinutes
    },
    refreshModel() {
      this.errorHandler(
          axios({
            method: "get",
            url: "/api/joinus/result",
          }).then((response) => {
            this.result = response.data;
            if (this.result.status === "passed") {
              axios({
                method: "get",
                url: "/api/joinus/review",
              }).then((response) => {
                if (response.data) {
                  this.review = response.data;
                }
              })
            }
          }),
      );
      this.errorHandler(
          axios({
            method: "get",
            url: "/api/time-config",
          }).then((response) => {
            this.publishResultStartTime = response.data.timeConfigs.find(e => e.key === "publish_result_start").value;
            this.showInterviewQuestionTime = response.data.timeConfigs.find(e => e.key === "show_interview_questions").value;
          }),
      );
      this.$store.dispatch("applicant/getModel");
    },
    getHref(content) {
      if (!content) {
        return '';
      }
      const urlPattern = /(https?:\/\/|www\.)[a-zA-Z_0-9\-@]+(\.\w[a-zA-Z_0-9\-:]+)+(\/[()~#&\-=?+%/.\w]+)?/g;
      content = content.replace(urlPattern, (match) => {
        const urlHttp = match.indexOf('http://') && match.indexOf('https://');
        const href = urlHttp === -1 ? `https://${match}` : match;
        return `<a target="_blank" href="${href}" style="color: #3298FF">${match}</a>`;
      });
      return content;
    },

  },
  mounted() {
    this.refreshModel();
  },
  watch: {
    result(new_val) {
      let data = {
        applicant: this.applicant,
        admitted: this.result.groups,
        times: this.result.times,
        intents: this.intents,
      };
      let announceKey = "";
      if (this.step === 1) {
        announceKey = "HaveNotAppliedForm";
        this.alertType = "info";
      } else if (this.step === 2) {
        announceKey = "HaveNotSelectedTime";
        this.alertType = "info";
      } else {
        switch (new_val.status) {
          case "passed":
            announceKey = "Admitted";
            this.alertType = "success";
            axios.get("/api/announce/JoinUs").then((response) => {
              const template = Handlebars.compile(response.data.body);
              this.joinUs = template(data);
            })
            break
          case "failed":
            announceKey = "Failed";
            this.alertType = "info";
            break
          default:
            announceKey = "HaveNotPublished";
            this.alertType = "info";
            break
        }
      }
      this.errorHandler(
          axios.get("/api/announce/" + announceKey).then((response) => {
            const template = Handlebars.compile(response.data.body);
            this.body = template(data);
          }),
      );
    },
  },
  computed: {
    time() {
      return time
    },
    applicant() {
      return this.$store.state.applicant.model;
    },
    step() {
      return this.$store.state.applicant.step;
    },
    intents() {
      return this.$store.state.applicant.intents;
    },
    finished() {
      return this.$store.state.applicant.finished;
    },
  },
};
</script>

<style scoped></style>
