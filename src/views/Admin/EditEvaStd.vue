<!-- 编辑或新建评价标准 -->
<template>
  <div>
    <v-app-bar app color="blue darken-3" dark>
      <v-toolbar-title style="width: 300px">
        <v-btn icon @click="$router.go(-1)">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        {{ $route.params.stdId ? "编辑" : "新建" }}评价标准
      </v-toolbar-title>
      <v-spacer />
      <AdminButton />
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <v-row justify="center">
          <v-col cols="12" md="8">
            <v-card :loading="loading">
              <v-data-table
                :headers="headers"
                :items="standard"
                :mobile-breakpoint="350"
                disable-pagination
                hide-default-footer
              >
                <template v-slot:top>
                  <v-text-field
                    label="标准名称"
                    filled
                    hide-details
                    clearable
                    v-model="stdTitle"
                  ></v-text-field>
                </template>
                <template v-slot:item.percentage="{ item }"
                  >{{ ((item.weight / weightTotal) * 100).toFixed(1) }} %</template
                >
                <template v-slot:item.action="{ item }">
                  <v-icon small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
                  <v-icon small @click="deleteItem(item)">mdi-close</v-icon>
                </template>
                <template v-slot:no-data>
                  <div>请添加评价项目。</div>
                </template>
              </v-data-table>
              <v-card-actions>
                <v-dialog v-model="dialog" max-width="500px">
                  <template v-slot:activator="{ on }">
                    <v-btn text v-on="on" color="blue-grey">
                      <v-icon left>mdi-plus</v-icon>添加评价项目
                    </v-btn>
                  </template>
                  <v-card>
                    <v-card-title>
                      <span class="headline">{{ formTitle }}</span>
                    </v-card-title>
                    <v-card-text>
                      <v-form v-model="valid">
                        <v-container>
                          <v-row>
                            <v-col cols="12" sm="6">
                              <v-text-field
                                v-model="editedItem.name"
                                label="项目名称"
                                :rules="[(v) => !!v || '项目名称是必填项。']"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6">
                              <v-text-field
                                v-model="editedItem.weight"
                                type="number"
                                label="权重"
                                :rules="[(v) => /^[0-9]{1,4}$/.test(v) || '请输入正整数。']"
                              ></v-text-field>
                            </v-col>
                          </v-row>
                        </v-container>
                      </v-form>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="blue darken-1" text @click="closeItemEdit">取消</v-btn>
                      <v-btn color="blue darken-1" :disabled="!valid" text @click="saveItemEdit"
                        >保存</v-btn
                      >
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-card-actions>
              <v-divider />
              <v-card-actions>
                <v-spacer />
                <v-btn
                  outlined
                  color="error"
                  :loading="delBtnloading"
                  v-if="$route.params.stdId"
                  @click="deleteStd"
                >
                  <v-icon left>mdi-delete</v-icon>删除标准
                </v-btn>
                <v-btn outlined color="success" :loading="submitBtnloading" @click="submitStd">
                  <v-icon left>mdi-check</v-icon>确认提交
                </v-btn>
              </v-card-actions>
              <ErrorAlert critical v-model="error" />
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </div>
</template>

<script>
import axios from "axios";
import AdminButton from "@/components/AdminButton.vue";
import errorMixin from "@/mixins/errorMixin.js";

export default {
  mixins: [errorMixin],
  components: {
    AdminButton,
  },
  data: () => ({
    stdTitle: "",
    dialog: false,
    headers: [
      { text: "项目", value: "name" },
      { text: "权重", value: "weight" },
      { text: "占比", value: "percentage", sortable: false },
      { text: "", value: "action", sortable: false },
    ],
    loading: false,
    valid: false,
    standard: [],
    editedIndex: -1,
    editedItem: {
      name: "某项能力",
      weight: 1,
    },
    defaultItem: {
      name: "某项能力",
      weight: 1,
    },
    delBtnloading: false,
    submitBtnloading: false,
  }),

  computed: {
    weightTotal() {
      var result = 0;
      this.standard.forEach((element) => {
        result += element.weight;
      });
      return result;
    },
    formTitle() {
      return this.editedIndex === -1 ? "添加项目" : "编辑项目";
    },
  },

  watch: {
    dialog(val) {
      val || this.closeItemEdit();
    },
  },

  mounted() {
    if (this.$route.params.stdId) {
      this.getStandard(this.$route.params.stdId);
    } else if (this.$route.query.from) {
      this.getStandard(this.$route.query.from);
    } else {
      this.stdTitle = this.$store.state.admin.name + "的评价标准";
      this.standard = [
        {
          name: "能力",
          weight: 3,
        },
        {
          name: "热情",
          weight: 7,
        },
        {
          name: "颜值",
          weight: 90,
        },
      ];
    }
  },

  methods: {
    getStandard(stdId) {
      this.loading = true;
      this.errorHandler(axios.get("/api/admin/evaluation/info/" + stdId))
        .then((response) => {
          this.stdTitle = response.data.evaluation_standard.name;
          if (!this.$route.params.stdId) this.stdTitle += "（副本）";
          this.standard = response.data.evaluation_standard.standard;
        })
        .finally(() => (this.loading = false));
    },

    deleteStd() {
      this.delBtnloading = true;
      this.errorHandler(
        axios({
          method: "post",
          url: "/api/admin/evaluation/delete",
          data: { id: parseInt(this.$route.params.stdId) },
        })
      )
        .then(() => {
          this.$router.go(-1);
        })
        .finally(() => (this.delBtnloading = false));
    },

    submitStd() {
      this.submitBtnloading = true;
      var _data = { name: this.stdTitle, standard: this.standard };
      var _url = "/api/admin/evaluation/add";
      if (this.$route.params.stdId) {
        _data.id = parseInt(this.$route.params.stdId);
        _url = "/api/admin/evaluation/update";
      }
      this.errorHandler(
        axios({
          method: "post",
          url: _url,
          data: _data,
        })
      )
        .then(() => {
          this.$router.go(-1);
          this.submitBtnloading = false;
        })
        .finally(() => (this.submitBtnloading = false));
    },

    editItem(item) {
      this.editedIndex = this.standard.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      this.standard.splice(this.standard.indexOf(item), 1);
    },

    closeItemEdit() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },

    saveItemEdit() {
      var weight = parseInt(this.editedItem.weight);
      if (weight && weight > 0) this.editedItem.weight = weight;
      else return;
      if (this.editedIndex > -1) {
        Object.assign(this.standard[this.editedIndex], this.editedItem);
      } else {
        this.standard.push(this.editedItem);
      }
      this.closeItemEdit();
    },
  },
};
</script>
