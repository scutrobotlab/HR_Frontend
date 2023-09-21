<template>
  <v-container id="dashboard" fluid tag="section">
    <v-col>
      <DailyNew />
    </v-col>
    <v-col>
      <ClassChart />
    </v-col>
  </v-container>
</template>

<script>
import DailyNew from "@/components/Statistics/DailyNew.vue";
import ClassChart from "@/components/Statistics/ClassChart.vue";

export default {
  name: "DashboardDashboard",

  components: {
    DailyNew,
    ClassChart
  },

};
</script>
