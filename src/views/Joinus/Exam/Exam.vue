<template>
  <div>
    <ErrorAlert v-model="error"/>
    <v-btn text to="/joinus/exam/main">
      <v-icon left>mdi-arrow-left</v-icon>
      查看其他题库
    </v-btn>
    <v-card>
      <v-card-title>{{ $route.params.group }}面试题库</v-card-title>
      <v-card-subtitle v-if="$route.params.group === '赛规'">
        赛规题目旨在帮助面试者了解 RoboMaster 比赛，面试时会随机抽取2-3道进行考察。阅读下方的题库指导可以快速提高正确率。
      </v-card-subtitle>
      <v-card-subtitle v-else>
        面试官只问你会的题目。
      </v-card-subtitle>
      <v-list>
        <div v-for="q in questions" :key="q.id">
          <v-divider/>
          <v-list-item
              :class="['answer-' + q.answer, loading_question == q.id ? 'answer-loading' : '']"
          >
            <v-list-item-content>
              <v-list-item-title style="white-space: pre-wrap;">{{ q.question }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn
                  icon
                  :color="q.answer == 1 ? 'success' : 'grey'"
                  @click="answer(q.id, 1)"
                  :loading="loading_question == q.id"
              >
                <v-icon>mdi-thumb-up</v-icon>
              </v-btn>
              <v-btn
                  icon
                  :color="q.answer == 2 ? 'error' : 'grey'"
                  @click="answer(q.id, 2)"
                  :loading="loading_question == q.id"
              >
                <v-icon>mdi-thumb-down</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </div>
      </v-list>
      <v-card-title class="colorful">
        您通过{{ $route.params.group }}面试的概率为{{ probability }}%。
      </v-card-title>
      <v-card-subtitle>*根据去年数据统计。填写题目越多，测试结果越准确。</v-card-subtitle>
    </v-card>
    <v-card class="mt-5" v-if="guide">
      <v-card-title>{{ $route.params.group }}题库指导</v-card-title>
      <v-card-subtitle>
        {{ guide.subtitle }}
      </v-card-subtitle>
      <v-list v-for="(step, idx) in guide.steps" :key="idx">
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>
              <b>{{ step.title }}</b>
            </v-list-item-title>
            <v-list-item-subtitle class="my-text">
              {{ step.subtitle }}
            </v-list-item-subtitle>
            <div v-for="(ctn, i) in step.content" :key="i">
              <a v-if="ctn.type === 'link'" :href="ctn.href" target="_blank">
                {{ ctn.text }}
              </a>
              <div v-else-if="ctn.type === 'text'">
                {{ ctn.text }}
              </div>
            </div>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
    <v-snackbar :value="loading_question >= 0">正在同步...</v-snackbar>
    <v-snackbar v-model="lost">同步失败，或因网络不畅。请稍后重试。</v-snackbar>
  </div>
</template>

<script>
import axios from "axios";
import errorMixin from "@/mixins/errorMixin.js";

export default {
  mixins: [errorMixin],
  data: () => ({
    questions: [],
    answers_loaded: false,
    loading_question: -1,
    lost: false,
    guide: {
      subtitle: "",
      steps: []
    }
  }),
  mounted() {
    this.answers_loaded = false;
    this.errorHandler(
        axios({
          method: "get",
          url: "/api/exam",
          params: {group: this.$route.params.group},
        }).then((response) => {
          this.questions = response.data.questions;
          this.$nextTick(() => (this.answers_loaded = true));
        })
    );
    this.errorHandler(
        axios({
          method: "get",
          url: "/api/exam/guide",
          params: {group: this.$route.params.group},
        }).then((response) => {
          if (response.data) {
            this.guide = JSON.parse(response.data["guide"]);
          } else {
            this.guide = null;
          }
        })
    );
  },
  computed: {
    probability() {
      var good = this.questions.filter((q) => q.answer == 1).length;
      // var bad = this.questions.filter((q) => q.answer == 2).length;
      var all = this.questions.length + 1;
      var prob = good * 3 + (good / all) * 5 - 5;
      var sigmoid = (z) => 100 / (1 + Math.exp(-z / 10));
      return sigmoid(prob).toFixed(2);
    },
  },
  methods: {
    answer(q_id, a) {
      this.loading_question = q_id;
      let question = this.questions.find((q) => q.id === q_id);
      var answer = a || 0;
      if (question.answer == a) answer = 0;
      window.console.log(question.answer, a);
      this.errorHandler(
          axios({
            method: "post",
            url: "/api/exam",
            data: {
              answers: [
                {
                  question_id: q_id,
                  answer: answer,
                },
              ],
              group: this.$route.params.group,
            },
          })
              .then((response) => {
                if (response.data.questions) this.questions = response.data.questions;
                else this.lost = true;
              })
              .finally(() => (this.loading_question = -1))
      );
    },
  },
};
</script>

<style scoped>
.my-text {
  white-space: normal;
  word-break: break-all;
  overflow: hidden;
}

.v-list-item__title {
  white-space: normal;
  height: fit-content;
}

.v-list-item__action {
  display: -webkit-box;
}

.answer-1 {
  background: linear-gradient(to right, #dff7df, whitesmoke);
}

.answer-2 {
  background: linear-gradient(to right, #f7dfdf, whitesmoke);
}

.answer-loading {
  animation: gradient 1s ease infinite;
}

@keyframes gradient {
  0% {
    background: linear-gradient(to right, whitesmoke, whitesmoke);
  }
  25% {
    background: linear-gradient(to right, #f7f7df, whitesmoke);
  }
  50% {
    background: linear-gradient(to right, whitesmoke, #f7f7df, whitesmoke);
  }
  75% {
    background: linear-gradient(to right, whitesmoke, #f7f7df);
  }
  100% {
    background: linear-gradient(to right, whitesmoke, whitesmoke);
  }
}

.answer-2 >>> .v-list-item__title {
  color: #9e9e9e !important;
  caret-color: #9e9e9e !important;
  text-decoration: line-through !important;
}

.colorful {
  animation: color-change 1s infinite;
}

@keyframes color-change {
  0% {
    color: #64b5f6;
  }
  50% {
    color: #3f51b5;
  }
  100% {
    color: #64b5f6;
  }
}
</style>
