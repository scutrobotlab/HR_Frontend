<template>
  <div class="pt-0">
    <v-tabs class="none-prev" v-model="idx">
      <v-tab v-for="g in groups" :key="g">{{ g }}</v-tab>
    </v-tabs>
    <v-card class="my-3">
      <v-card-title>{{ groups[idx] }}面试题库</v-card-title>
      <v-divider />
      <v-list :loading="loading">
        <div v-for="q in questions" :key="q.id">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title style="white-space: pre-wrap;">{{ q.question }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon color="error" @click="del(q.id)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-divider />
        </div>
        <v-list-item>
          <v-list-item-content>
            <v-text-field
              dense
              solo
              flat
              hide-details
              label="新增问题..."
              v-model="new_question"
            ></v-text-field>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn icon color="success" :disabled="!new_question.length" @click="add">
              <v-icon>mdi-upload</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script>
import axios from "axios";
import errorMixin from "@/mixins/errorMixin.js";

export default {
  mixins: [errorMixin],
  data: () => ({
    questions: [],
    new_question: "",
    idx: -1,
    loading: false,
  }),
  mounted() {
    this.$store.dispatch("groups/get");
  },
  computed: {
    groups() {
      return ["赛规", ...this.$store.state.groups.list]
    },
    admin_group() {
      return this.$store.state.admin.groups;
    },
  },
  watch: {
    admin_group(new_val) {
      if (this.idx != -1) return;
      this.idx = this.groups.findIndex((g) => g === new_val);
    },
    idx() {
      this.getQuestions();
    },
  },
  methods: {
    add() {
      this.errorHandler(
        axios({
          method: "post",
          url: "/api/admin/exam/create",
          data: {
            group: this.groups[this.idx],
            question: this.new_question,
          },
        })
      )
        .then(() => (this.new_question = ""))
        .finally(() => this.getQuestions());
    },
    del(id) {
      this.errorHandler(
        axios({
          method: "delete",
          url: "/api/admin/exam/delete/" + id,
        })
      ).finally(() => this.getQuestions());
    },
    getQuestions() {
      this.loading = true;
      this.errorHandler(
        axios
          .get("/api/admin/exam/group/" + this.groups[this.idx])
          .then((response) => (this.questions = response.data.questions))
          .finally(() => (this.loading = false))
      );
    },
  },
};
</script>

<style>
.v-text-field.v-text-field--enclosed:not(.v-text-field--rounded)
  > .v-input__control
  > .v-input__slot,
.v-text-field.v-text-field--enclosed .v-text-field__details {
  padding: 0 !important;
}
.none-prev .v-slide-group__prev--disabled{
  display: none!important;
}
</style>

<style scoped>
.v-list-item__title {
  white-space: normal;
  height: fit-content;
}
</style>
