<template>
  <v-dialog v-model="dialog" persistent max-width="500">
    <template v-slot:activator="{ on, attrs }">
      <v-btn color="red" text v-bind="attrs" v-on="on">撤销录用</v-btn>
    </template>
    <v-card>
      <v-card-title class="headline">
        确定撤销
        <b>{{ applicant_name }}</b
        >到 <b>{{ admit.group }}</b
        >的录用吗？
      </v-card-title>
      <v-card-text
        >{{ admit.admin.name }}于{{ format(admit.updated_at) }}录用到{{
          admit.group
        }}，确定要撤销这个录用吗？</v-card-text
      >
      <v-card-actions>
        <v-btn color="green darken-1" text :disabled="btn_loading" @click="dialog = false"
          >取消</v-btn
        >
        <v-spacer></v-spacer>
        <v-btn
          color="red darken-1"
          text
          :disabled="btn_loading"
          :loading="btn_loading"
          @click="cancelAdmit"
          >确认撤销</v-btn
        >
      </v-card-actions>
      <ErrorAlert v-model="error" />
    </v-card>
  </v-dialog>
</template>

<script>
import moment from "moment";
import axios from "axios";
import errorMixin from "@/mixins/errorMixin.js";

export default {
  mixins: [errorMixin],
  props: {
    applicant_name: String,
    admit: Object,
  },
  data() {
    return {
      dialog: false,
      btn_loading: false,
    };
  },
  methods: {
    format(dateTime) {
      return moment(dateTime).fromNow();
    },
    cancelAdmit() {
      this.btn_loading = true;
      this.errorHandler(
        axios({
          method: "post",
          url: "/api/admin/applicant/admit/reset",
          data: new URLSearchParams({
            applicant_id: this.admit.applicant_id,
            group: this.admit.group,
          }),
        })
          .then(() => {
            this.$store
              .dispatch("adminApplicant/get", this.$route.params)
              .then((this.dialog = false))
              .finally((this.btn_loading = false));
          })
          .catch((this.btn_loading = false))
      );
    },
  },
};
</script>

<style></style>
