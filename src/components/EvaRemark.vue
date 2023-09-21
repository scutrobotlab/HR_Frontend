<template>
  <v-dialog v-model="dialog" persistent :max-width="600">
    <template v-slot:activator="{ on }">
      <v-list flat style="background:transparent" class="pa-0">
        <v-list-item-group>
          <v-list-item v-on="on">
            <v-list-item-content class="py-3">
              <v-list-item-title
                :class="'pb-2 ' + (!!getError ? ' red--text' : ' ')"
                style="white-space:normal; height:fit-content"
                :loading="loading"
                >{{
                  loading ? "加载中..." : getError || savedText || "暂无备注。"
                }}</v-list-item-title
              >
              <v-list-item-subtitle>点击此处编辑备注</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </template>
    <v-card>
      <v-card-title>备注</v-card-title>
      <v-textarea rows="10" v-model="unsavedText" filled light counter></v-textarea>
      <v-card-actions>
        <v-btn color="error" text @click="del" :disabled="!savedText">删除</v-btn>
        <v-spacer />
        <v-btn color="error" text @click="close">取消</v-btn>
        <v-btn color="success" text :disabled="!unsavedText" :loading="submitting" @click="submit"
          >保存</v-btn
        >
      </v-card-actions>
      <ErrorAlert v-model="error" />
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";
import errorMixin from "@/mixins/errorMixin.js";

export default {
  mixins: [errorMixin],
  data: () => ({
    dialog: false,
    unsavedText: "",
    savedText: "",
    loading: true,
    submitting: false,
    getError: "",
  }),
  mounted() {
    axios
      .get("/api/admin/remarks/" + this.$route.params.appId)
      .then((response) => (this.unsavedText = this.savedText = response.data.remark))
      .catch((err) => (this.getError = err.response.status + "错误。"))
      .finally(() => (this.loading = false));
  },
  methods: {
    close() {
      this.unsavedText = this.savedText;
      this.dialog = false;
    },
    del() {
      this.submitting = true;
      this.errorHandler(
        axios({
          method: "delete",
          url: "/api/admin/remarks/" + this.$route.params.appId,
        })
      )
        .then(() => {
          this.savedText = this.unsavedText = "";
          this.getError = "";
          this.dialog = false;
        })
        .finally(() => (this.submitting = false));
    },
    submit() {
      this.submitting = true;
      this.errorHandler(
        axios({
          method: "post",
          url: "/api/admin/remarks/" + this.$route.params.appId,
          data: new URLSearchParams({
            remark: this.unsavedText,
          }),
        })
      )
        .then(() => {
          this.savedText = this.unsavedText;
          this.getError = "";
          this.dialog = false;
        })
        .finally(() => (this.submitting = false));
    },
  },
};
</script>

<style></style>
