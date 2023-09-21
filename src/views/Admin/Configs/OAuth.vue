<template>
  <v-container>
    <v-text-field
        label="Client ID"
        prepend-icon="mdi-lock"
        v-model="model.client_id"
        disabled
    ></v-text-field>
    <v-text-field
        label="Client Secret"
        prepend-icon="mdi-key"
        v-model="model.client_secret"
        disabled
    ></v-text-field>
    <v-text-field
        label="面试系统跳转地址"
        prepend-icon="mdi-cat"
        v-model="model.redirect_uri"
        disabled
    ></v-text-field>
    <v-text-field
        label="统一认证地址"
        prepend-icon="mdi-shield"
        v-model="model.admin_uri"
        disabled
    ></v-text-field>
    <v-text-field
        label="微信认证地址"
        prepend-icon="mdi-wechat"
        v-model="model.wechat_uri"
        disabled
    ></v-text-field>
  </v-container>
</template>

<script>
import errorMixin from "@/mixins/errorMixin.js";
import axios from "axios";

export default {
  mixins: [errorMixin],
  data() {
    return {
      model: {
        client_id: "",
        client_secret: "",
        admin_uri: "",
        wechat_uri: "",
        redirect_uri: "",
      },
    };
  },
  mounted() {
    this.errorHandler(
        axios.get('/api/admin/oauth')
            .then(res => {
              this.model = res.data
            })
    );
  },
};
</script>

<style></style>
