<template>
  <div>
    <vue-csv-import
      v-model="table"
      autoMatchFields
      :map-fields="{
        group: '组别',
        date: '日期',
        time: '时间',
        location: '地点',
        rank: '第几志愿',
        total_cnt: '人数',
        grade: '年级',
        campus: '校区'
      }"
    >
      <template slot="hasHeaders" slot-scope="{ toggle }">
        <v-switch @change="toggle" class="ma-2" label="不导入文件的第一行（表头）。"></v-switch>
      </template>

      <template slot="error">文件格式不正确。</template>

      <template slot="thead">
        <tr>
          <th>字段</th>
          <th>对应的CSV列</th>
        </tr>
      </template>

      <template slot="next" slot-scope="{ load }">
        <v-btn class="my-4" @click.prevent="load">导入</v-btn>
      </template>
    </vue-csv-import>
    <v-data-table :headers="headers" :items="table" :items-per-page="5" class="elevation-1 my-5"></v-data-table>
    <v-select label="写入组别" multiple :items="admin_groups" v-model="write_groups"></v-select>
    <div class="mb-3">
      <v-btn
        class="mr-3"
        :disabled="write_groups.length === 0 || table.length === 0"
        :uploading="uploading"
        @click="uploadCSV"
      >新增
      </v-btn>
      <v-dialog v-model="dialog" width="500">
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="error" v-bind="attrs" v-on="on" :disabled="write_groups.length === 0">重置</v-btn>
        </template>
        <v-card>
          <v-card-title>
            这将删除服务器上
            <span v-for="g in write_groups" :key="g.key">{{ g }}&nbsp;</span>的所有面试时间，请慎重。
          </v-card-title>
          <v-card-actions>
            <v-btn color="primary" text @click="dialog=false">取消</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="error" text @click="clear">确认重置</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <v-alert type="info" text v-if="time_statistics.length!==0">
      各组面试时间数量：
      <span v-for="g in groups"
            :key="g.key">{{ g
        }}{{ time_statistics.find(x => x.group === g) ? time_statistics.find(x => x.group === g).count : "0" }}，</span>
      <br />超管可以写入所有组别，其他管理员只能写入自己所在组别。
    </v-alert>
    <ErrorAlert critical v-model="error" />
  </div>
</template>

<script>
import { VueCsvImport } from "vue-csv-import";
import axios from "axios";
import errorMixin from "@/mixins/errorMixin.js";

export default {
  mixins: [errorMixin],
  components: { VueCsvImport },
  data() {
    return {
      headers: [
        { text: "组别", value: "group" },
        { text: "日期", value: "date" },
        { text: "时间", value: "time" },
        { text: "地点", value: "location" },
        { text: "第几志愿", value: "rank" },
        { text: "人数", value: "total_cnt" },
        { text: "年级", value: "grade" },
        { text: "校区", value: "campus" },
      ],
      time_statistics: [],
      table: [],
      write_groups: [],
      uploading: false,
      dialog: false,
    };
  },
  mounted() {
    this.$store.dispatch("groups/get");
    this.export_groups = this.admin_groups;
    this.updateStatistics();
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
    uploadCSV() {
      this.uploading = true;
      this.errorHandler(
        axios({
          method: "post",
          url: "/api/admin/times/upload",
          data: {
            groups: this.write_groups,
            data: this.table,
          },
        }),
      ).finally(() => {
        this.uploading = false;
        this.updateStatistics();
      });
    },
    clear() {
      this.errorHandler(
        axios({
          method: "delete",
          url: "/api/admin/times/clear",
          data: {
            groups: this.write_groups,
          },
        }),
      ).then(() => {
        this.updateStatistics();
      });
      this.dialog = false;
    },
    updateStatistics() {
      this.errorHandler(
        axios({
          method: "get",
          url: "/api/admin/times/statistics",
        }),
      ).then((response) => {
        this.time_statistics = response.data.times;
      });
    },
  },
};
</script>

<style>
.vue-csv-uploader-part-two {
  font-size: 0.9rem;
}

.vue-csv-mapping .form-control {
  display: block;
  width: 100%;
  padding: 0.375rem 0.75rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.vue-csv-mapping .table td,
.table th {
  padding: 0.25rem;
  border-top: 1px solid #eaeef1;
}

.vue-csv-mapping .table {
  width: 100%;
  max-width: 100%;
  margin-bottom: 1rem;
  background-color: transparent;
}
</style>
