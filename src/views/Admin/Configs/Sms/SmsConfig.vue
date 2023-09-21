<script>
import axios from "axios";

export default {
  name: "SmsConfig",
  data() {
    return {
      model: {
        sendUrl: null,
        debug: null,
        enabled: null,
        userName: null
      },
      loading: false,
    }
  },
  mounted() {
    this.loading = true;
    axios({
      method: "get",
      url: "/api/admin/config/sms-service",
    }).then((resp) => {
      this.model = resp.data;
    }).finally(() => (this.loading = false));
  },
  methods: {
    submit(key, value) {
      this.loading = true;
      axios({
        method: "post",
        url: "/api/admin/config/key/" + key + "?value=" + value,
      }).then((resp) => {
        this.model[resp.data.key] = resp.data.value;
      }).finally(() => (this.loading = false));
    },
  },
  watch: {
    "model.enabled"(new_val) {
      this.submit("SmsServiceEnabled", new_val ? "1" : "0")
    }
  },
  computed: {
    isSuperAdmin() {
      return this.$store.state.admin.id === 1;
    }
  }
}
</script>

<template>
  <v-container>
    <v-text-field
        label="发送URL"
        prepend-icon="mdi-send"
        v-model="model.sendUrl"
        disabled
    ></v-text-field>
    <v-text-field
        label="用户名"
        prepend-icon="mdi-account"
        v-model="model.userName"
        disabled
    ></v-text-field>
    <v-switch
        label="调试模式（不允许动态修改）"
        prepend-icon="mdi-bug"
        v-model="model.debug"
        disabled
    ></v-switch>
    <v-switch
        label="短信服务（仅超级管理员可修改）"
        prepend-icon="mdi-key"
        v-model="model.enabled"
        :disabled="!isSuperAdmin"
    ></v-switch>
  </v-container>
</template>

<style scoped>

</style>