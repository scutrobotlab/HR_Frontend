<template>
  <div>
    <div class="float-right pa-3" v-if="EvaStd.id != 'null'">
      <v-btn icon v-if="EvaStd.scores_count == 0" :to="'/admin/evaluation-std/edit/' + EvaStd.id">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn icon v-else :to="'/admin/evaluation-std/edit?from=' + EvaStd.id">
        <v-icon>mdi-content-duplicate</v-icon>
      </v-btn>
    </div>
    <v-list-item style="border-right: 1px WhiteSmoke solid;" :value="EvaStd.id">
      <template v-slot:default="{ active }">
        <v-list-item-action>
          <v-icon v-if="active">mdi-checkbox-marked-circle</v-icon>
          <v-icon v-else>mdi-checkbox-blank-circle-outline</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            <v-chip v-if="isDefault" small dark class="orange darken-3">默认</v-chip>
            {{ EvaStd.name }}
          </v-list-item-title>
          <div v-if="EvaStd.id != 'null'">
            <v-list-item-subtitle v-if="EvaStd.scores_count == 0"
              >{{ format(EvaStd.updated_at) || "最近" }}由{{
                EvaStd.last_edit_admin.name
              }}编辑过</v-list-item-subtitle
            >
            <v-list-item-subtitle v-else
              >已评价过&nbsp;{{ EvaStd.scores_count }}&nbsp;位面试者</v-list-item-subtitle
            >
          </div>
        </v-list-item-content>
      </template>
    </v-list-item>
  </div>
</template>

<script>
import moment from "moment";

export default {
  props: ["EvaStd", "isDefault"],
  methods: {
    format(dateTime) {
      return moment(dateTime).fromNow();
    },
  },
};
</script>

<style>
.v-radio {
  margin-right: 0px !important;
}
</style>
