<template>
  <span class="mr-1 my-1">
    <v-tooltip bottom v-if="admits.includes(intent.group)">
      <template v-slot:activator="{ on }">
        <v-chip v-on="on" color="success">
          <v-icon left>mdi-check</v-icon>
          {{ intent.group }}
        </v-chip>
      </template>
      <span>已被{{ intent.group }}录取。</span>
    </v-tooltip>
    <v-chip v-else>
      <v-avatar left class="blue darken-3 white--text" v-if="!intent.parallel">{{
        intent.rank + 1
      }}</v-avatar>
      {{ intent.group }}
    </v-chip>
  </span>
</template>

<script>
export default {
  props: {
    intent: Object,
  },
  computed: {
    admits() {
      return this.$store.state.adminApplicant.admits;
    },
  },
};
</script>

<style></style>
