<script>
import axios from "axios";
import moment from "moment";

export default {
  name: "Schedule",
  data: () => ({
    focus: "",
    events: [],
    categories: [],
    group: null,
    type: "category",
    types: {
      category: "天",
      "4day": "4天",
    },
    loading: false,
    screenHeight: document.documentElement.clientHeight,
    showNotSelected: false,
    ready: false,
  }),
  computed: {
    groupsLabel() {
      return this.$store.state.groups.list;
    },
    calendarHeight() {
      return this.screenHeight - 140;
    },
    cal () {
      return this.ready ? this.$refs.calendar : null
    },
    nowY () {
      return this.cal ? this.cal.timeToY(this.cal.times.now) + 'px' : '-10px'
    },
  },
  mounted() {
    this.ready = true
    this.scrollToTime()
    this.updateTime()
    this.$store.dispatch("groups/get")
    this.group = localStorage.getItem("schedule.group")
    if (!this.group) this.$store.dispatch("admin/info")
        .then(() => this.group = this.$store.state.admin.groups[0])
    this.type = localStorage.getItem("schedule.type")
    if (!this.type) this.type = "category"
    this.$refs.calendar.checkChange()
    let _this = this;
    window.onresize = function () { // 定义窗口大小变更通知事件
      _this.screenHeight = document.documentElement.clientHeight; //窗口高度
    };
  },
  methods: {
    getEventColor(event) {
      switch (event.color) {
        case "success":
          return "green"
        case "done":
          return "indigo"
        case "ready":
          return "orange"
        case "danger":
          return "red"
        case "none":
          return "grey"
        case "default":
        default:
          return "cyan"
      }
    },
    setToday() {
      this.focus = moment().format("YYYY-MM-DD")
    },
    prev() {
      this.$refs.calendar.prev()
    },
    next() {
      this.$refs.calendar.next()
    },
    refreshEvent() {
      if (!this.group) return;
      this.loading = true;
      axios({
        method: 'get',
        url: '/api/admin/times/schedule',
        params: {group: this.group, date: this.focus, type: this.type, showNotSelected: this.showNotSelected}
      }).then(resp => {
        this.events = resp.data["timeTable"]
        this.categories = resp.data.categories
        this.focus = resp.data.focus
      }).finally(() => this.loading = false)
    },
    clickEvent(element) {
      if (element.event.id === 0) return
      window.open(`/admin/person/${element.event.id}/info`)
    },
    getCurrentTime () {
      return this.cal ? this.cal.times.now.hour * 60 + this.cal.times.now.minute : 0
    },
    scrollToTime () {
      const time = this.getCurrentTime()
      const first = Math.max(0, time - (time % 30) - 30)
      this.cal.scrollToTime(first)
    },
    updateTime () {
      setInterval(() => this.cal.updateTimes(), 60 * 1000)
    },
  },
  watch: {
    group(newVal) {
      localStorage.setItem("schedule.group", newVal)
      this.refreshEvent();
    },
    type(newVal) {
      localStorage.setItem("schedule.type", newVal)
    },
    showNotSelected() {
      this.refreshEvent()
    }
  }
}
</script>

<template>
  <div>
    <v-row class="fill-height">
      <v-col>
        <v-sheet>
          <v-toolbar flat>
            <v-btn outlined class="mr-4" color="grey darken-2" @click="setToday">
              今天
            </v-btn>
            <v-btn fab text small color="grey darken-2" @click="prev">
              <v-icon small>
                mdi-chevron-left
              </v-icon>
            </v-btn>
            <v-btn fab text small color="grey darken-2" @click="next">
              <v-icon small>
                mdi-chevron-right
              </v-icon>
            </v-btn>
            <v-toolbar-title v-if="$refs.calendar">
              {{ $refs.calendar.title }}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-switch v-model="showNotSelected" class="mt-5" label="显示未分配">
            </v-switch>
            <v-btn icon class="mr-4" color="grey darken-2" @click="refreshEvent">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
            <v-menu bottom right>
              <template v-slot:activator="{ on, attrs }">
                <v-btn class="mr-4" outlined color="grey darken-2" v-bind="attrs" v-on="on">
                  <span>{{ types[type] }}</span>
                  <v-icon right>mdi-menu-down</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="type = 'category'">
                  <v-list-item-title>天</v-list-item-title>
                </v-list-item>
                <v-list-item @click="type = '4day'">
                  <v-list-item-title>4天</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-menu bottom right>
              <template v-slot:activator="{ on, attrs }">
                <v-btn outlined color="grey darken-2" v-bind="attrs" v-on="on">
                  <span>{{ group }}</span>
                  <v-icon right>mdi-menu-down</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item v-for="item in groupsLabel" :key="item" @click="group = item">
                  <v-list-item-title>{{ item }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-toolbar>
          <v-progress-linear v-if="loading" indeterminate>
          </v-progress-linear>
        </v-sheet>
        <v-sheet :height="calendarHeight">
          <v-calendar
              ref="calendar"
              v-model="focus"
              color="primary"
              :type="type"
              category-show-all
              interval-height="100"
              first-time="08:00"
              :categories="categories"
              :events="events"
              :event-color="getEventColor"
              @change="refreshEvent"
              @click:event="clickEvent">
            <template v-slot:day-body="{ date, week }">
              <div
                  class="v-current-time"
                  :class="{ first: date === week[0].date }"
                  :style="{ top: nowY }"
              ></div>
            </template>
          </v-calendar>
        </v-sheet>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.max-height {
  height: 200px;
}

.v-current-time {
  height: 2px;
  background-color: #ea4335;
  position: absolute;
  left: -1px;
  right: 0;
  pointer-events: none;

  &.first::before {
    content: '';
    position: absolute;
    background-color: #ea4335;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-top: -5px;
    margin-left: -6.5px;
  }
}
</style>