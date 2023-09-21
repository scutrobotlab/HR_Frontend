<template>
  <v-app id="inspire">
    <router-view/>
    <v-snackbar v-model="snackbar" color="warning">
      面试系统处于调试模式
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="snackbar = false">
          好的
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    snackbar: false,
  }),
  computed: {
    AdminPath() {
      return /^\/admin\/(?!login|signup)/.test(this.$route.path);
    },
  },
  created: function () {
    this.$store.dispatch("config/get").then(conf => {
      if (conf.debug) {
        this.snackbar = true;
        console.log("Debug Mode");
      }
    })
  },
};
</script>

<style>
.v-app-bar {
  background-color: #0a00ff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 1200 800'%3E%3Cdefs%3E%3CradialGradient id='a' cx='0' cy='800' r='800' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%230053bc'/%3E%3Cstop offset='1' stop-color='%230053bc' stop-opacity='0'/%3E%3C/radialGradient%3E%3CradialGradient id='b' cx='1200' cy='800' r='800' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%235600ea'/%3E%3Cstop offset='1' stop-color='%235600ea' stop-opacity='0'/%3E%3C/radialGradient%3E%3CradialGradient id='c' cx='600' cy='0' r='600' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%230015a6'/%3E%3Cstop offset='1' stop-color='%230015a6' stop-opacity='0'/%3E%3C/radialGradient%3E%3CradialGradient id='d' cx='600' cy='800' r='600' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%230d00ff'/%3E%3Cstop offset='1' stop-color='%230d00ff' stop-opacity='0'/%3E%3C/radialGradient%3E%3CradialGradient id='e' cx='0' cy='0' r='800' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%23007078'/%3E%3Cstop offset='1' stop-color='%23007078' stop-opacity='0'/%3E%3C/radialGradient%3E%3CradialGradient id='f' cx='1200' cy='0' r='800' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%239100d4'/%3E%3Cstop offset='1' stop-color='%239100d4' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect fill='url(%23a)' width='1200' height='800'/%3E%3Crect fill='url(%23b)' width='1200' height='800'/%3E%3Crect fill='url(%23c)' width='1200' height='800'/%3E%3Crect fill='url(%23d)' width='1200' height='800'/%3E%3Crect fill='url(%23e)' width='1200' height='800'/%3E%3Crect fill='url(%23f)' width='1200' height='800'/%3E%3C/svg%3E");
  background-attachment: fixed;
  background-size: cover;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  opacity: 0.9;
}
</style>
