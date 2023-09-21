<!-- 报名表详情页面 -->
<template>
  <v-main>
    <ErrorAlert critical v-model="error"/>
    <v-list tile>
      <v-list-item>
        <v-list-item-avatar>
          <v-icon>mdi-account</v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-subtitle>{{ $t("name") }}</v-list-item-subtitle>
          <v-list-item-title>{{ applicant.name }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-row align="center" class="mr-0">
        <v-col class="grow py-0 pr-0">
          <v-list-item :href="'tel:' + applicant.phone">
            <v-list-item-avatar>
              <v-icon color="primary">mdi-phone</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-subtitle>{{ $t("phone") }}</v-list-item-subtitle>
              <v-list-item-title>{{ applicant.phone }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-col>
        <v-col class="shrink py-0 px-3">
          <v-btn icon large :href="'sms:' +
            applicant.phone +
            ';?&body=【华工机器人实验室】' + applicant.name + '同学'">
            <v-icon>mdi-message-text</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-list-item>
        <v-list-item-avatar>
          <v-icon>mdi-gender-{{ applicant.gender }}</v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-subtitle>{{ $t("gender") }}</v-list-item-subtitle>
          <v-list-item-title>{{ $t(applicant.gender) }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item v-for="(intent, i) in applicant.intents" :key="intent.key">
        <v-list-item-avatar>
          <v-icon>mdi-heart</v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-subtitle>{{ $t("intent") + " " + (i + 1) }}</v-list-item-subtitle>
          <div>
            <GroupChip :intent="intent"></GroupChip>
            <v-list-item-action v-if="highlight(intent.time)" class="colorful">
              <b>{{ getSchedule(intent.time) }}</b>
            </v-list-item-action>
            <v-list-item-action v-else>
              {{ getSchedule(intent.time) }}
            </v-list-item-action>
            <v-chip-group v-if="intent.time" selected-class="text-primary" filter column>
              <v-chip v-for="(v, j) in receive_status_list" :key="j" outlined
                      v-on:click="on_update_receive_status(i, j)"
                      v-model="receive_status[intent.group][j]" :color="v.color" filter>{{ v.label }}
              </v-chip>
            </v-chip-group>
          </div>
        </v-list-item-content>
      </v-list-item>
      <v-list-item v-for="admit in applicant.admits" :key="admit.key">
        <v-list-item-avatar>
          <v-icon>mdi-marker-check</v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-subtitle>{{ admit.admin.name }}于{{ format(admit.updated_at) }}录取
          </v-list-item-subtitle>
          <v-list-item-title>{{ admit.group }}</v-list-item-title>
        </v-list-item-content>
        <v-list-item-action v-if="admin.groups.includes(admit.group)">
          <CancleAdmit :admit="admit" :applicant_name="applicant.name"/>
        </v-list-item-action>
      </v-list-item>
      <v-list-item two-line v-for="(item, key) in applicant.form" :key="key">
        <v-list-item-avatar/>
        <v-list-item-content>
          <v-list-item-subtitle>{{ form(key) }}</v-list-item-subtitle>
          <v-list-item-title>
            <div style="white-space: pre-wrap;">{{ item }}</div>
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-avatar/>
        <v-list-item-content>
          <v-list-item-subtitle>
            首次登录于 {{ format(applicant.created_at) }}
            <span v-if="applicant.created_at !== applicant.updated_at">，最后一次登录于 {{
                format(applicant.updated_at)
              }}</span>。
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <div class="d-block text-center pa-10">
      <v-dialog v-model="dialog" width="500">
        <template v-slot:activator="{ on, attrs }">
          <v-btn outlined color="error" v-bind="attrs" v-on="on" :loading="delete_loading">
            <v-icon left>mdi-delete</v-icon>
            删除
          </v-btn>
        </template>
        <v-card>
          <v-card-title> 警告：请仔细阅读</v-card-title>
          <v-card-text>
            优先推荐给面试者打低分，使之不出现在列表中。<br/>
            删除操作，将会从系统中，所有组别，删除此面试者。<br/>
            即便此面试者已面试过其他组，所有组面试官也都不能再看到这个面试者。<br/>
            请谨慎使用删除功能。<br/>
            如果误操作，可以联系网管进入数据库进行恢复。<br/>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" text @click="dialog = false">取消</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="error" text @click="del">确认删除</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-main>
</template>

<script>
import moment from "moment";
import axios from "axios";
import GroupChip from "@/components/GroupChip.vue";
import errorMixin from "@/mixins/errorMixin.js";
import CancleAdmit from "@/components/CancleAdmit.vue";

export default {
  mixins: [errorMixin],
  components: {GroupChip, CancleAdmit},
  data: () => ({
    drawer: null,
    delete_loading: false,
    cancel_loading: false,
    dialog: false,
    receive_status_list: [
      {label: "准时签到", color: "success"},
      {label: "迟到签到", color: "warning"},
      {label: "已请假", color: "primary"},
      {label: "已改期", color: "purple"},
      {label: "无故缺席", color: "error"},
    ],
    receive_status: {},
    first_click: true
  }),
  computed: {
    groups_loaded() {
      return this.$store.state.groups.loaded;
    },
    groups() {
      return this.$store.state.groups.list;
    },
    applicant() {
      return this.$store.state.adminApplicant.applicant;
    },
    admin() {
      return this.$store.state.admin;
    },
  },
  methods: {
    format(dateTime) {
      return moment(dateTime).fromNow();
    },
    form(key) {
      var form = this.$store.state.form.form;
      if (!form) return this.$t(key);
      else {
        var feild = form.find((item) => item.key === key);
        if (!feild) return this.$t(key);
        return feild.name;
      }
    },
    del() {
      this.delete_loading = true;
      this.errorHandler(
          axios({
            method: "delete",
            url: "/api/admin/applicant/" + this.$route.params.appId,
          }),
      )
          .then(() => this.$router.go("-1"))
          .finally(() => (this.delete_loading = false));
    },
    getSchedule(time) {
      if (time) return moment(time.date + "T" + time.time).format("MMMDoHH:mm") + "  在" + time.location + "面试";
      return "";
    },
    highlight(time) {
      if (!time) return false
      let diff = Math.abs(moment().diff(moment(time.date + "T" + time.time), "minute"))
      return diff <= 40
    },
    on_update_receive_status(intentIdx, chipIdx) {
      let group = this.applicant.intents[intentIdx].group;
      if (this.receive_status[group][chipIdx]) {
        if (this.first_click) {
          this.first_click = false;
          return;
        }
        chipIdx = -1;
      }
      this.first_click = false;
      this.applicant.intents[intentIdx].time.extend.receive_status
          = chipIdx === -1 ? "" : this.receive_status_list[chipIdx].label;
      this.errorHandler(
          axios({
            method: "post",
            url: "/api/admin/applicant/at-ext/" + this.$route.params.appId + "/" + this.applicant.intents[intentIdx].group,
            data: {
              extend: this.applicant.intents[intentIdx].time.extend
            }
          }),
      )
    }
  },
  mounted() {
    this.errorHandler(this.$store.dispatch("form/get"));
    this.$store.dispatch("groups/get");

    this.applicant.intents.forEach(e => {
      if (e.time) {
        let extend = e.time.extend;
        for (let i = 0; i < this.receive_status_list.length; i++) {
          const ele = this.receive_status_list[i];
          this.receive_status[e.group][i] = ele.label === extend.receive_status;
        }
      }
    });

  },
  created() {
    this.applicant.intents.forEach(e => {
      let tmp = [];
      for (let i = 0; i < this.receive_status_list.length; i++) {
        tmp.push(false);
      }
      this.receive_status[e.group] = tmp;
    });
  }
};
</script>

<style scoped>
.v-list-item__title {
  white-space: normal;
  height: fit-content;
}

.colorful {
  animation: color-change 1s infinite;
}

@keyframes color-change {
  0% {
    color: #64b5f6;
  }
  50% {
    color: #3f51b5;
  }
  100% {
    color: #64b5f6;
  }
}
</style>
