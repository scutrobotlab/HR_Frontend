<!-- 面试者详情的头部 -->
<template>
  <div>
    <v-app-bar app color="blue darken-3" dark>
      <v-toolbar-title>
        <v-btn icon @click="$router.go(-1)">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-toolbar-title>
      <v-text-field
        flat
        solo-inverted
        hide-details
        autofocus
        append-icon="mdi-magnify"
        placeholder="搜索姓名"
        v-model="query"
      />
      <template v-slot:extension>
        <v-tabs background-color="transparent"></v-tabs>
      </template>
    </v-app-bar>
    <ErrorAlert critical v-model="error" />
    <v-main v-if="loading">
      <v-skeleton-loader
        v-for="n in 8"
        :key="n"
        class="mx-auto applicant-list-Loader"
        type="list-item-avatar-two-line"
      ></v-skeleton-loader>
    </v-main>
    <!-- <router-view v-else-if="applicant" /> -->
    <v-main v-else>
      <v-list>
        <v-list-item
          v-for="result in resultList"
          :key="result.name"
          :to="'/admin/person/' + result.id + '/info'"
          replace
          :loading="loading"
        >
          <v-list-item-avatar color="grey">
            <span class="white--text headline" v-if="result.name">{{ result.name.charAt(0) }}</span>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ result.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-main>
  </div>
</template>

<script>
import errorMixin from "@/mixins/errorMixin.js";
import PinyinMatch from "pinyin-match";

export default {
  mixins: [errorMixin],
  data: () => ({
    query: "",
  }),
  computed: {
    resultList() {
      var result = [];
      let nameList = this.$store.state.nameList.list;
      for (var i = 0; i < nameList.length; i++) {
        if (PinyinMatch.match(nameList[i].name, this.query)) result.push(nameList[i]);
        if (result.length > 20) break;
      }
      return result;
    },
    loading() {
      return this.$store.state.nameList.loading;
    },
  },
  mounted() {
    this.errorHandler(this.$store.dispatch("nameList/get"));
  },
};
</script>
