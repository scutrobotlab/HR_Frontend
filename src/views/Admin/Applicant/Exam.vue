<template>
  <v-main>
    <ErrorAlert v-model="error"/>
    <v-container>
      <v-alert
          v-if="!loading && !questions"
          color="warning"
          class="text-center"
          icon="mdi-note-remove"
          text prominent>
        面试者没有作答面试题库。
      </v-alert>
      <v-row v-else justify="center">
        <v-col cols="12" lg="6" v-for="(q_group, group) in questions" :key="q_group.key">
          <v-card class="ma-3" :loading="loading">
            <v-card-title>{{ group }}面试题库</v-card-title>
            <v-list>
              <div v-for="q in q_group" :key="q.id">
                <v-divider/>
                <v-list-item :class="'answer-' + q.answer">
                  <v-list-item-content>
                    <v-list-item-title>{{ q.question }}</v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-icon v-if="q.answer === '1'" color="success">mdi-thumb-up</v-icon>
                    <v-icon v-if="q.answer === '2'" color="error">mdi-thumb-down</v-icon>
                  </v-list-item-action>
                </v-list-item>
              </div>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import axios from "axios";
import errorMixin from "@/mixins/errorMixin.js";

export default {
  mixins: [errorMixin],
  data: () => ({
    questions: null,
    loading: true,
  }),
  mounted() {
    this.loading = true;
    this.errorHandler(
        axios({
          method: "get",
          url: "/api/admin/exam/id",
          params: {applicantId: this.$route.params.appId},
        }).then((response) => {
          let temp = {};
          response.data.questions.forEach((q) => {
            if (q.group in temp) {
              temp[q.group].push(q);
            } else {
              temp[q.group] = [q];
            }
            this.questions = temp;
          });
          this.loading = false;
        })
    );
  },
};
</script>

<style scoped>
.v-list-item__title {
  white-space: normal;
  height: fit-content;
}

.v-list-item__action {
  display: -webkit-box;
}

.answer-1 {
  background-image: linear-gradient(to right, white, #f4fff9);
}

.answer-2 {
  background-image: linear-gradient(to right, whitesmoke, #f7efef);
}

.answer-2 >>> .v-list-item__title {
  color: #9e9e9e !important;
  caret-color: #9e9e9e !important;
  text-decoration: line-through !important;
}
</style>
