<template>
  <MaterialChartCard
    :data="dailyNewData"
    :options="dailyNewOptions"
    color="success"
    hover-reveal
    type="Line"
  >
    <h4 class="card-title font-weight-light mt-2 ml-2">每日新增报名</h4>

    <p class="d-inline-flex font-weight-light ml-2 mt-1">
      今日&nbsp;
      <v-icon color="green" small>mdi-arrow-up</v-icon>
      <span class="green--text">{{todayIncrease}}</span>
    </p>

    <template v-slot:actions>
      <v-icon class="mr-1" small>mdi-clock-outline</v-icon>
      <span class="caption grey--text font-weight-light">{{dailyNewUpdated||"加载中..."}}</span>
    </template>
  </MaterialChartCard>
</template>

<script>
import moment from "moment";
import MaterialChartCard from "@/components/Statistics/MaterialChartCard.vue";

export default {
  components: {
    MaterialChartCard,
  },

  computed: {
    dailyNewData() {
      if (this.$store.state.statistics.dailyNew) {
        var data = { labels: [], series: [[]] };
        data.labels = this.$store.state.statistics.dailyNew.data.map((a) =>
          moment(a.date).format("D")
        );
        data.series[0] = this.$store.state.statistics.dailyNew.data.map((a) => a.counts);
        return data;
      } else return null;
    },
    dailyNewUpdated() {
      if (this.$store.state.statistics.dailyNew)
        return moment(this.$store.state.statistics.dailyNew.updated).format("MMMDoHH:mm");
      else return null;
    },
    todayIncrease() {
      let today = this.$store.state.statistics.dailyNew.data.find(
        (a) => new Date(a.date).toDateString() == new Date().toDateString()
      );
      return today ? today.counts : 0;
    },
  },

  watch: {
    dailyNewData(new_val) {
      this.dailyNewOptions.high = Math.max(new_val.series[0]) + 3;
    },
  },

  mounted() {
    this.$store.dispatch("statistics/getDailyNew");
  },

  data() {
    return {
      dailyNewOptions: {
        lineSmooth: this.$chartist.Interpolation.cardinal({
          tension: 0,
        }),
        low: 0,
        high: 50, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
        chartPadding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
    };
  },
};
</script>
