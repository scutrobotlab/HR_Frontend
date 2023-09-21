<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="6" v-for="tc in timeConfigs" :key="tc.key">
        <date-time-picker :label="$t(tc.key)" v-model="tc.value" :loading="loading" :disabled="loading" />
      </v-col>
    </v-row>
    <v-btn :loading="loading" :disabled="loading" @click="submit">提交</v-btn>
  </v-container>
</template>

<script>
import axios from "axios";
import moment from "moment";
import DateTimePicker from "@/components/DateTimePicker.vue";

export default {
  components: { DateTimePicker },
  data: () => ({
    timeConfigs: [
      { key: "apply_form_start", value: null },
      { key: "apply_form_end", value: null },
      { key: "select_time_start", value: null },
      { key: "select_time_end", value: null },
      { key: "show_interview_questions", value: null },
      { key: "publish_result_start", value: null },
      { key: "review_this_season", value: null },
      { key: "first_interview_date", value: null },
    ],
    loading: false,
  }),
  mounted() {
    this.loading = true;
    axios({
      method: "get",
      url: "/api/time-config",
    })
      .then((response) => {
        response.data.timeConfigs.forEach((kv) => {
          var time_config = this.timeConfigs.find((tc) => tc.key === kv.key);
          if (time_config) time_config.value = kv.value;
        });
      })
      .finally(() => (this.loading = false));
  },
  methods: {
    submit() {
      this.loading = true;
      var timeConfigs = this.timeConfigs;
      timeConfigs = timeConfigs.filter((tc) => tc.value);
      timeConfigs.forEach((tc) => (tc.value = moment(tc.value).format("YYYY-MM-DD HH:mm:ss")));
      axios({
        method: "post",
        url: "/api/admin/time-config",
        data: { timeConfigs: timeConfigs },
      })
        .then((response) => {
          window.console.log(response.data);
        })
        .finally(() => (this.loading = false));
    },
  },
};
</script>

<style></style>
