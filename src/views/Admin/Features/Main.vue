<template>
  <div>
    <div class="d-block text-center pt-3">
      <v-avatar v-if="avatar" size="80" class="elevation-1">
        <v-img :src="avatar"></v-img>
      </v-avatar>
    </div>
    <v-card-title class="d-block text-center">{{ name }}</v-card-title>
    <v-card-subtitle class="d-block text-center">欢迎来到面试系统实用功能</v-card-subtitle>
    <v-row>
      <v-col cols="12" sm="6" v-for="r in routes" :key="r.key">
        <v-card class="mx-auto" outlined :to="r.path">
          <v-list-item three-line>
            <v-list-item-content>
              <v-list-item-title class="headline">{{ r.meta.title }}</v-list-item-title>
              <v-list-item-subtitle class="subtitle-2">{{ r.meta.msg }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-avatar tile size="80">
              <v-icon size="80" :color="r.meta.color">{{ r.meta.icon }}</v-icon>
            </v-list-item-avatar>
          </v-list-item>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  computed: {
    routes() {
      var configs = this.$router.options.routes.find((route) => route.path === "/admin/features");
      return configs.children.filter(
        (c) => c.meta && (this.$store.state.admin.id === 1 || !c.meta.requiresSuperAdmin)
      );
    },
    name() {
      return this.$store.state.admin.name;
    },
    avatar() {
      return this.$store.state.admin.avatar;
    },
  },
};
</script>
