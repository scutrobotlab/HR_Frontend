<template>
  <v-container fluid>
    <ErrorAlert critical v-model="error"/>
    <v-alert type="success" v-if="step > 1" text>{{ prompt_message_submitted }}</v-alert>
    <v-alert type="info" text>{{ prompt_message }}</v-alert>
    <v-form class="text-center mt-5" ref="form" v-model="valid" v-if="form" :disabled="!can_apply">
      <v-text-field
          label="姓名"
          name="name"
          v-model="model.name"
          :rules="[
              (v) => !!v || '姓名是必填项。',
              rules.max_length(16)
              ]"
          required
      />
      <div>
        <v-subheader class="pl-0">性别</v-subheader>
        <v-btn-toggle v-model="model.gender" group mandatory color="primary" name="gender">
          <v-btn value="male" text :disabled="!can_apply">
            <span>男生</span>
            <v-icon right>mdi-gender-male</v-icon>
          </v-btn>
          <v-btn value="female" text :disabled="!can_apply">
            <span>女生</span>
            <v-icon right>mdi-gender-female</v-icon>
          </v-btn>
        </v-btn-toggle>
      </div>
      <v-text-field
          label="手机号码"
          name="phone"
          v-model="model.phone"
          counter="11"
          :rules="[
          (v) => !!v || '手机号码是必填项。',
          (v) => /^\d{11}$/.test(v) || '手机号码必须为11位数字。',
        ]"
          required
      />
      <div v-for="item in form" :key="item.id">
        <v-select
            v-if="item.type === 'select'"
            v-model="form_model[item.key]"
            :name="item.key"
            :items="item.options"
            :label="item.name"
            :rules="[(v) => !item.required || !!v || item.name + '是必填项。']"
            :required="item.required"
            :clearable="!item.required"
        ></v-select>
        <v-text-field
            v-else-if="item.type === 'text-field'"
            v-model="form_model[item.key]"
            :name="item.key"
            :label="item.name"
            :rules="[
                (v) => !item.required || !!v || item.name + '是必填项。',
                rules.max_length(item.max_length)
                ]"
            :required="item.required"
        ></v-text-field>
        <v-text-field
            v-else-if="item.type === 'text-field-email'"
            label="E-mail"
            name="email"
            v-model="form_model[item.key]"
            :rules="[
              (v) => !!v || '电子邮箱地址是必填项。',
              rules.email,
              rules.max_length(item.max_length)
              ]"
            :required="item.required"
        ></v-text-field>
        <v-textarea
            v-else-if="item.type === 'textarea'"
            outlined
            v-model="form_model[item.key]"
            :name="item.key"
            :label="item.name"
            :counter="item.max_length === 0 ? '' : item.max_length"
            :rules="[
                (v) => !item.required || !!v || item.name + '是必填项。',
                rules.max_length(item.max_length)
                ]"
            :required="item.required"
        ></v-textarea>
        <div v-if="item.key === 'campus'">
          <v-select
              v-if="intent && intent.parallel"
              class="my-2"
              v-model="model.intents"
              name="intent"
              :items="groups"
              :loading="groups_loading"
              :counter="intent.max > 1 ? intent.max : false"
              :rules="[
          (v) => v.length !== 0 || '意向组别是必填项。',
          (v) => v.length <= intent.max || '意向组别的数量不能超过' + intent.max + '。',
          (v) => v.length >= intent.min || '意向组别的数量不能少于' + intent.min + '。',
        ]"
              label="意向组别"
              :multiple="intent.max > 1"
              required
          ></v-select>
          <div v-else-if="intent">
            <v-select
                v-for="i in intent.max"
                :key="'intent' + i"
                v-model="model.intents[i - 1]"
                name="intent"
                :items="groups"
                :loading="groups_loading"
                :label="'第' + i + '志愿' + (i > intent.min ? '（选填）' : '')"
                :required="i > intent.min"
                :clearable="i > intent.min"
                :rules="[model.intents.length === new Set(model.intents).size || '多个志愿不能重复。']"
            >
            </v-select>
          </div>
        </div>
      </div>
      <v-btn
          @click="submit"
          :loading="submit_loading"
          :disabled="!valid || !can_apply"
          large
          color="primary"
          class="my-2"
      >提交
      </v-btn
      >
    </v-form>
    <v-row align="center" justify="center" v-else>
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";
import moment from "moment";
import errorMixin from "@/mixins/errorMixin.js";

export default {
  mixins: [errorMixin],
  props: {
    apply_msg: String,
  },
  data: () => ({
    intent: null,
    valid: true,
    model: {
      wechat_id: null,
      name: "",
      gender: "",
      phone: "",
      intents: [],
      parallel: false,
      // form: "",
    },
    form_model: {},
    submit_loading: false,
    rules: {
      email: value => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return pattern.test(value) || '不是正确的 E-mail。'
      },
      max_length: len => {
        if (len === 0) return true;
        return v => (v || '').length <= len || `不能超过 ${len} 个字符。`
      },
    },
  }),
  watch: {
    stored_model(new_val) {
      window.console.log(new_val);
      this.model = new_val;
    },
  },
  computed: {
    stored_model() {
      return this.$store.state.applicant.model;
    },
    stored_form_model() {
      return this.$store.state.applicant.form_model;
    },
    can_apply() {
      return this.$store.state.allowJoinus.applyForm.status;
    },
    prompt_message_submitted() {
      return "您已经成功提交了报名表。";
    },
    prompt_message() {
      let apply = this.$store.state.allowJoinus.applyForm;
      if (!apply) return "";
      let now = moment();
      if (apply.start === null) return "报名尚未开始，请等候通知。";
      else if (now.isBefore(apply.start))
        return "报名将于" + moment(apply.start).fromNow() + "开始。";
      else {
        if (apply.end === null) return "请填写报名表。";
        else if (now.isBefore(apply.end))
          return "报名表填写将于" + moment(apply.end).fromNow() + "截止。在截止时间前，您可以随时修改报名表。";
        else return "报名表填写已经结束。";
      }
    },
    groups_loading() {
      return this.$store.state.groups.loading;
    },
    groups() {
      let [...group_list] = this.$store.state.groups.list;
      group_list.remove("赛规");
      return group_list;
    },
    form() {
      return this.$store.state.form.form;
    },
    step() {
      return this.$store.state.applicant.step;
    },
  },
  methods: {
    submit() {
      this.model.form = JSON.stringify(this.form_model);

      this.submit_loading = true;
      this.model.wechat_id = this.$store.state.applicant.wechat["openid"];
      this.errorHandler(
          axios({
            method: "post",
            url: "/api/joinus/apply",
            data: this.model,
          })
              .then(() => {
                this.$store.dispatch("applicant/setModel", this.model, this.form_model);
                this.$emit("next");
              })
              .finally(() => (this.submit_loading = false)),
      );
    },
  },
  mounted() {
    this.$store.dispatch("groups/get");
    this.$store.dispatch("allowJoinus/canApplyForm");
    this.$store.dispatch("form/get");
    this.$store.dispatch("applicant/getModel");

    //TODO 应该放到store
    this.errorHandler(
        axios({
          method: "get",
          url: "/api/form/intent",
        }).then((response) => {
          this.intent = response.data.intent;
          this.model.parallel = response.data.intent.parallel;
        }),
    );

    this.model = this.stored_model;
    this.form_model = this.stored_form_model;
  },
};

Array.prototype.remove = function (val) {
  const index = this.indexOf(val);
  if (index > -1) {
    this.splice(index, 1);
  }
};
</script>

<style scoped>
.v-input {
  margin-top: 8px !important;
  margin-bottom: 8px !important;
}
</style>
