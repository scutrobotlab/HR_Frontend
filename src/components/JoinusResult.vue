<template>
  <v-container>
    <div v-if="result">
      <div v-if="result.status==='passed'">
        <v-avatar size="100">
          <v-img src="@/assets/logo.png" size="80"></v-img>
        </v-avatar>
        <div class="font-weight-regular">
          <div>
            恭喜你通过面试
            <br />成为华南虎
            <span
              v-for="group in result.groups"
              :key="group.key"
              class="mx-1 font-weight-bold"
            >{{group}}</span>
            实习生！
          </div>
        </div>
      </div>
      <div v-else-if="result.status==='failed'">
        <v-avatar size="100">
          <v-icon color="red" size="80">mdi-emoticon-neutral-outline</v-icon>
        </v-avatar>
        <h3 class="font-weight-regular mt-3"></h3>
        <div class="font-weight-regular">
          <div>很抱歉，你没有通过面试。</div>
        </div>
      </div>
      <div v-else>
        <v-avatar color="green" size="100">
          <v-icon dark size="80">mdi-check</v-icon>
        </v-avatar>
        <h3 class="font-weight-regular mt-3">您已完成报名</h3>
        <div v-for="time in result.times" :key="time.key" class="font-weight-regular">
          <div>{{time.group}}面试：时间{{fDate(time.date)}}{{fTime(time.time)}}，地点：{{time.location}}</div>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script>
import axios from "axios";
import errorMixin from "@/mixins/errorMixin.js";
import moment from "moment";

export default {
  mixins: [errorMixin],
  data: () => ({
    result: null,
  }),
  methods: {
    fDate(date) {
      return moment(date).format("MMMDo");
    },
    fTime(time) {
      return moment(time, "HH:mm:ss").format("HH:mm");
    },
  },
  mounted() {
    this.errorHandler(
      axios({
        method: "get",
        url: "/api/joinus/result",
      }).then((response) => {
        this.result = response.data;
      })
    );
  },
};
</script>

<style>
</style>