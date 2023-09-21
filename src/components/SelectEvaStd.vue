<template>
  <v-card :loading="loading">
    <v-card-title>
      <div>选择评价标准</div>
      <v-spacer />
      <v-btn icon @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    <v-list v-if="Array.isArray(EvaStds) && EvaStds.length" shaped two-line>
      <v-list-item-group v-model="selected" color="primary" mandatory>
        <EvaStdItem :EvaStd="null_item" :isDefault="defaultId === 'null'" />
        <EvaStdItem
          v-for="evaStd in EvaStds"
          :key="evaStd.id"
          :EvaStd="evaStd"
          :isDefault="evaStd.id === defaultId"
        />
      </v-list-item-group>
    </v-list>
    <v-card-text v-else class="text-center my-5">暂无评价标准。</v-card-text>
    <v-card-actions>
      <v-btn text to="/admin/evaluation-std/edit/">
        <v-icon left>mdi-plus</v-icon>添加新标准
      </v-btn>
      <v-spacer />
      <v-btn text color="orange darken-3" @click="setDefault" :disabled="selected === defaultId"
        >设为默认</v-btn
      >
    </v-card-actions>
    <ErrorAlert v-model="error" />
  </v-card>
</template>

<script>
import EvaStdItem from "@/components/EvaStdItem.vue";
import errorMixin from "@/mixins/errorMixin.js";

export default {
  props: ["value"],
  mixins: [errorMixin],
  components: {
    EvaStdItem,
  },
  methods: {
    close() {
      this.$emit("close");
    },
    setDefault() {
      this.errorHandler(this.$store.dispatch("admin/setDefault", this.selected));
    },
  },
  computed: {
    selected: {
      get() {
        return this.value;
      },
      set(v) {
        this.$emit("input", v);
      },
    },
    defaultId() {
      return this.$store.state.admin.default_standard_id || "null";
    },
    EvaStds() {
      return this.$store.state.evaluationStd.list;
    },
    loading() {
      return this.$store.state.evaluationStd.loading_list;
    },
  },
  mounted() {
    this.errorHandler(this.$store.dispatch("evaluationStd/getList"));
  },
  data: () => ({
    dialog: null,
    null_item: {
      id: "null",
      name: "无",
    },
  }),
};
</script>

<style></style>
