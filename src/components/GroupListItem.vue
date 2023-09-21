<template>
  <v-list-item two-line :to="'/admin/person/' + applicant.id + '/info'">
    <v-list-item-avatar :color="applicant.gender == 'male' ? 'blue' : applicant.gender == 'female' ? 'pink' : 'grey'">
      <v-img v-if="applicant.avatar" :src="secAvatar(applicant.avatar)">
        <template v-slot:placeholder>
          <span class="white--text headline center" v-if="applicant.name">{{
            applicant.name.charAt(0)
          }}</span>
        </template>
      </v-img>
      <span class="white--text headline center" v-else-if="applicant.name">{{
        applicant.name.charAt(0)
      }}</span>
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title>
        {{ applicant.name }}
        <v-chip style="left: 5px;" v-if="applicant.extend.receive_status" outlined small
          :color="getReceiveStatusColor(applicant.extend.receive_status)">
          {{ applicant.extend.receive_status }}
        </v-chip>
      </v-list-item-title>
      <v-list-item-subtitle class="d-inline-block text-truncate">
        {{ getSubTitle(applicant) }}
      </v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action v-if="applicant.admits && applicant.admits.length">
      <v-list-item-action-text class="green--text text--darken-3">
        <v-icon x-small color="success">mdi-checkbox-marked-circle-outline</v-icon>已录取
      </v-list-item-action-text>
      <v-list-item-action-text v-if="applicant.admits.length === 1" class="title green--text text--darken-3">{{
        applicant.admits[0].group }}</v-list-item-action-text>
      <v-list-item-action-text v-else class="title green--text text--darken-3">{{ applicant.admits.length
      }}个组</v-list-item-action-text>
    </v-list-item-action>
    <v-list-item-action v-if="applicant.scores_count">
      <v-list-item-action-text>本组{{ applicant.scores_count }}人评分</v-list-item-action-text>
      <v-list-item-action-text class="title">{{ (applicant.avg_score / 1).toFixed(1) }} 分</v-list-item-action-text>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import moment from "moment";

export default {
  props: ["applicant"],
  data: () => ({
    receive_status_list: [
      { label: "准时签到", color: "success" },
      { label: "迟到签到", color: "warning" },
      { label: "已请假", color: "primary" },
      { label: "已改期", color: "purple" },
      { label: "无故缺席", color: "error" },
    ],
  }),
  computed: {
    dateTime() {
      return moment(this.applicant.date + "T" + this.applicant.time).format("MMMDoah:mm");
    },
  },
  methods: {
    secAvatar(avatar) {
      const url = new URL(avatar);
      url.protocol = document.location.protocol;
      return url.href;
    },
    getSubTitle(applicant) {
      if (applicant.time) {
        let str = this.dateTime + "面试"
        if (applicant.location) {
          str += "   位于" + applicant.location
        }
        return str
      } else {
        return "未选择面试时间"
      }
    },
    getReceiveStatusColor(status) {
      let idx = this.receive_status_list.map(e => e.label).indexOf(status);
      if (idx === -1) return "default";
      return this.receive_status_list[idx].color;
    }
  },
};
</script>

<style scoped>
.center {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  left: 50%;
}
</style>
