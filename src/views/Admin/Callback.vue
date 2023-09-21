<template>
  <v-main>
    <ErrorAlert critical v-model="error" :code="401" />
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import errorMixin from "@/mixins/errorMixin.js";

export default {
  mixins: [errorMixin],
  created() {
    this.errorHandler(this.$store.dispatch("admin/login", this.$route.query.code)).then(() => {
      this.$router.replace("/admin/group/" + this.$store.state.admin.groups[0] + "/未评分/1");
    });
  },
};
</script>

<style></style>
