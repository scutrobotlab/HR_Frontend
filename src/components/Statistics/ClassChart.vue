<template>
  <MaterialChartCard
    :data="classChartData"
    :options="options"
    color="#E91E63"
    hover-reveal
    type="Bar"
  >
    <h4 class="card-title font-weight-light mt-2 ml-2">{{$route.params.group}}分类统计</h4>

    <p class="d-inline-flex font-weight-light ml-2 mt-1" v-if="form">
      <v-select :items="form" dense v-model="form_key"></v-select>
    </p>

    <template v-slot:actions>
      <v-icon class="mr-1" small>mdi-clock-outline</v-icon>
      <span class="caption grey--text font-weight-light">{{classChartUpdated||"加载中..."}}</span>
    </template>
  </MaterialChartCard>
</template>

<script>
import moment from "moment";
import MaterialChartCard from "@/components/Statistics/MaterialChartCard.vue";

export default {
  props: {
    group: String,
  },

  components: {
    MaterialChartCard,
  },

  computed: {
    classChartData() {
      if (this.$store.state.statistics.class) {
        var data = { labels: [], series: [[]] };
        data.labels = this.$store.state.statistics.class.data.map((a) => a.key);
        data.series[0] = this.$store.state.statistics.class.data.map((a) => a.count);
        return data;
      } else return null;
    },
    classChartUpdated() {
      if (this.$store.state.statistics.class.updated)
        return moment(this.$store.state.statistics.class.updated).format("MMMDoHH:mm");
      else return null;
    },
    form() {
      if (this.$store.state.form.form) {
        var form = [];
        this.$store.state.form.form.forEach((a) => {
          if (a.type == "select") form.push({ text: a.name, value: a.key });
        });
        return form;
      } else return null;
    },
  },

  watch: {
    form(new_val) {
      this.form_key = new_val[0].value;
    },
    form_key(new_val) {
      this.$store.dispatch("statistics/getClass", {
        group: this.$route.params.group,
        key: new_val,
      });
    },
    classChartData(new_val) {
      if (new_val) {
        this.options.high = Math.max(...new_val.series[0]) + 3;
      } else this.options.high = 10;
    },
    "$route.params.group"(new_val) {
      this.$store.dispatch("statistics/getClass", {
        group: new_val,
        key: this.form_key,
      });
    }
  },

  mounted() {
    this.$store.dispatch("form/get");
  },

  data() {
    return {
      form_key: null,
      options: {
        axisX: {
          showGrid: false,
        },
        low: 0,
        high: 10,
        chartPadding: {
          top: 0,
          right: 5,
          bottom: 0,
          left: 0,
        },
      },
    };
  },
};
</script>