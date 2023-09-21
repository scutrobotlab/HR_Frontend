<template>
  <div>
    <v-select label="导出组别" multiple :items="groups" v-model="export_groups"></v-select>
    <v-btn @click="exportCSV">导出服务器上的面试时间表</v-btn>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      export_groups: [],
    };
  },
  mounted() {
    this.$store.dispatch("groups/get");
    this.export_groups = this.admin_groups;
  },
  computed: {
    admin_groups() {
      return this.$store.state.admin.groups;
    },

    groups() {
      return this.$store.state.groups.list;
    },
  },
  methods: {
    exportCSV() {
      let groups = JSON.stringify(this.export_groups)
      axios({
        method: "get",
        url: "/api/admin/times/export?groups=" + groups
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "export.csv");
        document.body.appendChild(link);
        link.click();
      });
    },
  },
};
</script>
