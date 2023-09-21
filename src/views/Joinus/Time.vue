<template>
  <v-main>
    <v-container>
      <ErrorAlert critical v-model="error"/>
      <v-alert type="info" text v-if="step < 2">请先填写报名表，再选择面试时间。</v-alert>
      <v-alert type="info" text class="text-left" v-else-if="!can_select">{{
          prompt_message
        }}
      </v-alert>
      <div class="fill-height text-center" fluid v-else-if="intents.length === 0">
        <v-row align="center" justify="center">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </v-row>
      </div>
      <div v-else>
        <v-scroll-x-transition hide-on-leave>
          <SelectTime
              :group="intents[page - 1]"
              :finished="finished[page - 1]"
              :rank="page"
              :key="page - 1"
              class="mb-5"
              @next="nextStep"
          />
        </v-scroll-x-transition>
        <v-pagination
            v-if="intents.length > 1"
            v-model="page"
            :length="intents.length"
            circle
            class="my-3"
        ></v-pagination>
      </div>
    </v-container>
  </v-main>
</template>

<script>
import moment from "moment";
import SelectTime from "@/components/SelectTime.vue";
import errorMixin from "@/mixins/errorMixin.js";

export default {
  mixins: [errorMixin],
  components: {
    SelectTime,
  },
  data: () => ({
    page: 1,
  }),
  methods: {
    nextStep() {
      if (this.page < this.intents.length) this.page++;
      else {
        this.$emit("next");
      }
    },
  },
  mounted() {
    if (this.step >= 2) {
      this.errorHandler(this.$store.dispatch("applicant/getIntents"));
    }
    this.$store.dispatch("applicant/getModel");
  },
  watch: {
    step(new_val) {
      if (new_val >= 2) {
        this.errorHandler(this.$store.dispatch("applicant/getIntents"));
      }
    },
  },
  computed: {
    step() {
      return this.$store.state.applicant.step;
    },
    intents() {
      return this.$store.state.applicant.intents;
    },
    finished() {
      return this.$store.state.applicant.finished;
    },
    can_select() {
      return this.$store.state.allowJoinus.selectTime.status;
    },
    prompt_message() {
      let apply = this.$store.state.allowJoinus.selectTime;
      if (!apply) return "";
      let now = moment();
      if (apply.start === null) return "面试时间" + "尚未开放选择，请等候通知。";
      else if (now.isBefore(apply.start))
        return "面试时间" + "将于" + moment(apply.start).fromNow() + "开放选择。";
      else {
        if (apply.end === null) return "前端逻辑出错";
        else if (now.isBefore(apply.end))
          return "面试时间" + "选择将于" + moment(apply.end).fromNow() + "截止。";
        else return "面试时间" + "选择已经截止。";
      }
    },
  },
};
</script>

<style>
.v-tabs:not(.v-tabs--vertical):not(.v-tabs--right)
> .v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes)
.v-slide-group__prev.v-slide-group__prev--disabled {
  display: none !important;
}
</style>
