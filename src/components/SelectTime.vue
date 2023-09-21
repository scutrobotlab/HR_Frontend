<template>
  <div>
    <ErrorAlert v-model="error"/>
    <v-alert type="info" text class="text-left" v-if="!stored_model">正在加载...</v-alert>
    <v-alert type="info" text class="text-left" v-if="!loaded">正在加载...</v-alert>
    <v-alert type="info" text prominent class="text-left" v-else-if="submitting">
      正在提交...
    </v-alert>
    <v-alert type="info" text prominent class="text-left" v-else-if="finished">
      <v-row align="center">
        <v-col class="grow py-0">面试已结束，无法修改面试时间。</v-col>
        <v-col class="shrink py-0">
          <v-btn color="info" large icon @click="nextStep">
            <v-icon>mdi-arrow-right-circle</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-alert>
    <v-alert type="info" text prominent class="text-left" v-else-if="!saved_time_id">
      请选择第{{ rank }}志愿“{{ group }}”的面试时间。
    </v-alert>
    <v-alert type="success" text prominent class="text-left" v-else>
      <v-row align="center">
        <v-col class="grow py-0">已选择第{{ rank }}志愿“{{ group }}”的面试时间。</v-col>
        <v-col class="shrink py-0">
          <v-btn color="error" large icon @click="deleteDialog = true">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-col>
        <v-col class="shrink py-0">
          <v-btn color="success" large icon @click="nextStep">
            <v-icon>mdi-arrow-right-circle</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-alert>
    <v-dialog v-model="deleteDialog" max-width="380">
      <v-card>
        <v-card-title class="text-h5">
          放弃面试
        </v-card-title>
        <v-card-text>
          您确定要放弃<b>{{ group }}组</b>的面试时间吗？<br>
          放弃后该面试名额将被释放，其他面试者可以选择该时间，您仍然可以选择有空位的时间。
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="deleteDialog = false;">取消</v-btn>
          <v-btn color="red darken-1" text @click="clear">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-tabs centered v-model="selectDate" class="none-prev">
      <v-tab v-for="(time, date) in dateTime" :key="date" :href="`#${date}`">{{
          fDate(date)
        }}
      </v-tab>
    </v-tabs>
    <v-item-group v-model="time_id" @change="submit">
      <v-tabs-items v-model="selectDate">
        <v-tab-item v-for="(times, date) in dateTime" :key="date" :value="date">
          <v-container>
            <v-row>
              <v-col
                  v-for="time in times"
                  :class="$vuetify.breakpoint.xs ? 'pa-1' : ''"
                  :key="time.id"
                  cols="4"
                  sm="3"
                  md="2"
              >
                <v-item
                    v-slot:default="{ active, toggle }"
                    :value="time.id">
                  <v-card
                      :disabled="disabled_select_time(time)"
                      :color="
                      active
                        ? 'primary'
                        : time.left_cnt <= 0
                        ? 'blue-grey lighten-1'
                        : 'blue-grey darken-3'
                    "
                      :elevation="time.left_cnt <= 0 ? 0 : 3"
                      class="d-flex align-center"
                      dark
                      :height="$vuetify.breakpoint.xs ? 80 : 100"
                      @click="toggle"
                  >
                    <v-list-item two-line>
                      <v-list-item-content>
                        <v-list-item-title
                            :class="
                            ($vuetify.breakpoint.xs ? 'headline' : 'display-1') +
                            ' flex-grow-1 text-center'
                          "
                        >{{ fTime(time.time) }}
                        </v-list-item-title>
                        <v-scroll-y-transition
                            mode="out-in"
                        >
                          <div v-if="!show_card(time)">
                            <v-list-item-subtitle class="text-center">
                              {{ time.location }} <br> 该时间不开放
                            </v-list-item-subtitle>
                          </div>
                          <div v-else>
                            <v-list-item-subtitle v-if="active" class="text-center" key="active">
                              <v-icon x-small>mdi-checkbox-marked-circle-outline</v-icon>&nbsp;
                              {{ time.location }} <br>已选择
                            </v-list-item-subtitle>
                            <v-list-item-subtitle v-else class="text-center" key="unactive">
                              {{ time.location }} <br>剩余&nbsp;{{ time.left_cnt }}&nbsp;位
                            </v-list-item-subtitle>
                          </div>
                        </v-scroll-y-transition>
                      </v-list-item-content>
                    </v-list-item>
                  </v-card>
                </v-item>
              </v-col>
            </v-row>
          </v-container>
        </v-tab-item>
      </v-tabs-items>
    </v-item-group>
  </div>
</template>

<script>
import moment from "moment";
import axios from "axios";
import errorMixin from "@/mixins/errorMixin.js";

export default {
  mixins: [errorMixin],
  props: {
    group: String,
    rank: Number,
    finished: Boolean,
  },
  data: () => ({
    selectDate: null,
    dateTime: null,
    time_id: 0,
    submitting: false,
    saved_time_id: null,
    timer: null,
    loaded: false,
    overtimeHours: 1, // 超时时间
    deleteDialog: false,
    deleteTime: {},
  }),
  computed: {
    stored_model() {
      return this.$store.state.applicant.model;
    },
    stored_form_model() {
      return this.$store.state.applicant.form_model;
    },
    grade() {
      return this.stored_form_model.grade;
    },
    campus() {
      return this.stored_form_model.campus;
    },
  },
  methods: {
    show_card(time) {
      let grade_result = time.grade == null || time.grade === "";
      if (!grade_result && time.grade != null) {
        let grade_list = time.grade.trim().split("、");
        grade_result = grade_list.indexOf(this.grade) !== -1;
      }

      let campus_result = time.campus == null || time.campus === "";
      if (!campus_result && time.campus != null) {
        let campus_list = time.campus.trim().split("、");
        campus_result = campus_list.indexOf(this.campus) !== -1;
      }

      return grade_result && campus_result;
    },
    disabled_select_time(time) {
      return this.finished || time.left_cnt <= 0 || !this.show_card(time) || this.overtime(time);
    },
    overtime(time) {
      return moment(time.date + "T" + time.time)
          .isBefore(moment().add(this.overtimeHours, "hours"));
    },
    fDate(date) {
      return moment(date).format("MM/DD");
    },
    fTime(time) {
      return moment(time, "HH:mm:ss").format("HH:mm");
    },
    nextStep() {
      this.$emit("next");
    },
    update() {
      let groupBy = function (arr, key) {
        return arr.reduce(function (rv, item) {
          (rv[item[key]] = rv[item[key]] || []).push(item);
          return rv;
        }, {});
      };

      this.errorHandler(
          axios({
            method: "get",
            url: "/api/joinus/time",
            params: {group: this.group, rank: this.rank},
          }).then((response) => {
            this.dateTime = groupBy(response.data.time, "date");
            if (response.data.saved_time) {
              this.time_id = this.saved_time_id = response.data.saved_time.id;
              this.selectDate = response.data.saved_time.date;
            }
            this.loaded = true;
          }),
      );
    },
    submit() {
      this.dialog = false;
      this.submitting = true;
      this.errorHandler(
          axios({
            method: "post",
            url: "/api/joinus/time",
            data: {time_id: this.time_id, group: this.group},
          })
              .then(() => (this.saved_time_id = this.time_id))
              .finally(() => {
                this.submitting = false;
                this.update();
              }),
      );
    },
    clear() {
      this.time_id = 0;
      this.submit();
      this.deleteDialog = false;
    }
  },
  mounted() {
    this.loaded = false;
    this.update();
    this.timer = setInterval(this.update, 10000);
  },
  destroyed() {
    clearInterval(this.timer);
  },
};
</script>

<style></style>
