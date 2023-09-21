<template>
  <v-container class="grey lighten-5">
    <v-btn text to="/joinus/done">
      <v-icon left>mdi-arrow-left</v-icon>
      返回
    </v-btn>
    <div class="d-block text-center">
      <v-avatar size="80" class="elevation-1" color="orange darken-3">
        <v-icon x-large dark>mdi-head-question</v-icon>
      </v-avatar>
    </div>
    <v-card-title class="d-block text-center">面试题库</v-card-title>
    <v-card-subtitle class="d-block text-center">
      面试题全在这儿了，测测面试通过的概率吧！
    </v-card-subtitle>
    <v-row align="center" justify="center">
      <v-col cols="6" v-for="g in groups" :key="g">
        <v-card :to="'/joinus/exam/' + g">
          <div v-if="g !== '赛规'">
            <v-card-title>{{ g }}组</v-card-title>
            <v-card-subtitle>面试题库</v-card-subtitle>
          </div>
          <div v-else>
            <v-card-title style="color: orangered">{{ g }}题</v-card-title>
            <v-card-subtitle>所有面试者都会被问及</v-card-subtitle>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  computed: {
    groups_loading() {
      return this.$store.state.groups.loading;
    },
    groups() {
      return ["赛规", ...this.$store.state.groups.list]
    },
  },
  mounted() {
    this.$store.dispatch("groups/get");
  },
};
</script>

<style>
</style>
