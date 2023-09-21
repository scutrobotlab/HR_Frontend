<template>
  <div>
    <v-tabs class="none-prev" v-model="typ_index">
      <v-tab v-for="g in typ" :key="g">{{ g }}</v-tab>
    </v-tabs>
    <div v-if="!enabled">
      <v-alert class="mt-5" type="info" outlined>
        短信服务已被全局关闭，请联系超级管理员。
      </v-alert>
    </div>
    <div v-else-if="!smsEnabled">
      <v-alert class="mt-5" type="info" outlined>
        您没有发送短信的权限，只能查看。如有需要请联系管理员。
      </v-alert>
    </div>
    <v-alert class="mt-5" v-if="alerts.length > 0 && alerts[typ_index] !== ''"
             type="warning" outlined icon="mdi-alert">
      {{ alerts[typ_index] }}
    </v-alert>
    <v-dialog v-model="dialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          批量发送短信
        </v-card-title>
        <v-card-text>
          将要向 {{ selected.length }} 名面试者批量发送{{ this.currentType }}的短信。<br>
          本次发送预计消耗 {{ batchCost }} 元，错误触发记得赔钱。<br><br>
          要发送的短信中，{{ sendDetail }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="dialog = false">
            取消
          </v-btn>
          <v-btn
              color="red darken-1" text @click="batchSendSms">
            确定
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-card class="my-5">
      <v-card-title>
        短信列表 ({{ selected.length }}/{{ item_total }})
      </v-card-title>
      <v-card-subtitle class="mt-2">
        <v-btn color="primary" style="width: 100px"
               @click="dialog = true" :disabled="!smsEnabled || selected.length === 0">
          批量发送
        </v-btn>
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn color="primary" style="width: 100px" class="ml-2" dark v-bind="attrs" v-on="on">
              {{ page_size }}/页
              <v-icon right>
                mdi-menu-down
              </v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item v-for="(item, index) in page_size_list" :key="index" @click="page_size=Number(item.title)">
              <v-list-item-title>
                {{ item.title }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-spacer></v-spacer>
        <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="搜索"
            single-line
            hide-details
        ></v-text-field>
      </v-card-subtitle>
      <div class="text-center">
        <v-pagination
            v-model="page"
            :length="page_count"
        ></v-pagination>
      </div>
      <v-data-table
          v-model="selected"
          :headers="headers"
          :items="table"
          :page="page"
          :items-per-page="page_size"
          item-key="id"
          :search="search"
          :loading="loading"
          :expanded.sync="expanded"
          hide-default-footer
          show-select show-expand single-expand
          selectable-key="selectable"
          class="ma-auto mt-5">
        <template v-slot:item.name="{ item }">
          {{ item.name }}
          <v-badge v-show="item['reply_cnt'] > 0"
                   :content="item['reply_cnt']"
                   color="red" inline></v-badge>
        </template>
        <template v-slot:item.status="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-chip v-on="on" :color="getStatus(item.status).color" small>
                {{ getStatus(item.status).text }}
              </v-chip>
            </template>
            <span>{{ item.content === "" ? "无内容" : item.content }}</span>
          </v-tooltip>
        </template>
        <template v-slot:item.args="{ item }">
          {{ getArgsText(item.args) }}
        </template>
        <template v-slot:item.actions="{ item }">
          <v-icon class="mr-2" @click="viewApplicant(item)">
            mdi-eye
          </v-icon>
          <v-icon class="mr-2" v-show="item.status === 1 || item.status === 4 || item.status === 5"
                  @click="sendOneSms(item)" :disabled="!smsEnabled">
            mdi-send
          </v-icon>
          <v-icon class="mr-2" v-show="item.status === 3"
                  @click="sendOneSms(item)" :disabled="!smsEnabled">
            mdi-refresh-circle
          </v-icon>
        </template>
        <template v-slot:expanded-item="{ headers }">
          <td :colspan="headers.length">
            <v-alert class="ma-5" type="info" outlined
                     v-if="expanded_item.length === 0">
              没有对话
            </v-alert>
            <v-card
                v-else
                outlined shaped elevation="3"
                :class="'mt-4 ' + (i === expanded_item.length - 1 ? 'mb-5' : '')"
                width="80%" :style="e.right ? 'float: right' : 'float: left'"
                v-for="(e, i) in expanded_item" :key="i">
              <v-card-title>
                {{ e["senderName"] }}
              </v-card-title>
              <v-card-subtitle>
                发送于 {{ e["time"] }}
              </v-card-subtitle>
              <v-card-text>
                {{ e["content"] }}
              </v-card-text>
            </v-card>
          </td>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "SendSms",
  data() {
    return {
      typ: [],
      alerts: [],
      typ_index: -1,
      selected: [],
      loading: false,
      enabled: false,
      headers: [
        {text: "ID", value: "id"},
        {text: "姓名", value: "name"},
        {text: "状态", value: "status"},
        {text: "手机号码", value: "phone"},
        {text: "时间", value: "time"},
        {text: "参数", value: "args"},
        {text: "动作", value: "actions"},
        {text: '', value: 'data-table-expand'}
      ],
      table: [],
      page: 1,
      page_count: 1,
      page_size: 20,
      item_total: 0,
      search: "",
      status_list: [
        {status: 0, color: "default", text: "不发送"},
        {status: 1, color: "primary", text: "计划中"},
        {status: 2, color: "success", text: "已发送"},
        {status: 3, color: "error", text: "已失败"},
        {status: 4, color: "warning", text: "已过期"},
        {status: 5, color: "primary", text: "手动"},
        {status: 6, color: "primary", text: "立即发送"},
      ],
      dialog: false,
      page_size_list: [
        {title: '20'},
        {title: '50'},
        {title: '100'},
        {title: '500'},
        {title: '1000'},
      ],
      expanded: [],
      expanded_item: {}
    };
  },
  computed: {
    currentType() {
      return this.typ[this.typ_index]
    },
    batchCost() {
      let count = 0
      this.selected.forEach(e => {
        let len = e.content.length
        count += Math.ceil(len / 67)
      })
      return (count * 0.075).toFixed(2)
    },
    sendDetail() {
      let text = ""
      this.status_list.forEach(st => {
        let cnt = this.selected.filter(e => e.status === st.status).length
        if (cnt !== 0) {
          text += st.text + cnt + "条；"
        }
      })
      return text
    },
    smsEnabled() {
      return this.enabled && this.$store.state.admin.sms_enabled;
    }
  },
  methods: {
    getStatus(status) {
      return this.status_list[this.status_list.map(e => e.status).indexOf(status)]
    },
    refreshTable(typ, page) {
      this.loading = true;
      this.table = [];
      axios.get("/api/admin/sms/applicant/" + typ
          + "?pageSize=" + this.page_size + "&page=" + page)
          .then(res => {
            this.table = res.data['applicantSms']
            this.item_total = res.data.total;
            this.page_count = Math.ceil(res.data.total / this.page_size)
            for (let i = 0; i < this.table.length; i++) {
              // this.table[i].phone =
              //     this.table[i].phone.substring(0, 3) + " **** " + this.table[i].phone.substring(7, 11)
              let status = this.table[i].status
              this.table[i].selectable = this.ableToSend(status)
            }
          })
          .catch(() => {
            this.table = []
            this.page_count = 0
          })
          .finally(() => this.loading = false)
    },
    viewApplicant(item) {
      console.log(item)
      window.open("/admin/person/" + item.id + "/info");
    },
    sendOneSms(item) {
      this.sendSms([item.id])
      this.clearExpand()
    },
    batchSendSms() {
      this.dialog = false
      this.sendSms(this.selected.map(e => e.id))
      this.allNotSelect()
      this.clearExpand()
    },
    sendSms(ids) {
      axios.post("/api/admin/sms/send",
          {
            typ: this.currentType,
            applicantIds: ids
          })
          .finally(() => this.refreshTable(this.currentType, this.page))
    },
    allNotSelect() {
      this.selected = []
    },
    clearExpand() {
      this.expanded = []
      this.expanded_item = {}
    },
    getArgsText(args) {
      if (args) return args.map(e => e === "" ? "null" : e).join(", ")
      else return ""
    },
    ableToSend(status) {
      return status === 1 || status === 3 || status === 4 || status === 5
    }
  },
  created() {
    this.loading = true;
    axios.get("/api/admin/sms/config")
        .then(res => {
          this.typ = res.data.types
          this.alerts = res.data.alerts
          this.typ_index = 0
        })
  },
  mounted() {
    axios({
      method: "get",
      url: "/api/admin/config/sms-service",
    }).then((resp) => {
      this.enabled = resp.data.enabled;
    })
  },
  watch: {
    typ_index: function (newVal) {
      this.refreshTable(this.typ[newVal], 1)
      this.page = 1;
      this.allNotSelect()
      this.clearExpand()
    },
    page: function (newVal) {
      this.refreshTable(this.currentType, newVal)
      this.allNotSelect()
      this.clearExpand()
    },
    page_size: function () {
      this.refreshTable(this.currentType, 1)
      this.allNotSelect()
      this.clearExpand()
    },
    expanded: function (newVal) {
      if (newVal.length === 0) return
      this.expanded_item = null
      axios.get("/api/admin/sms/history/" + newVal[0].id)
          .then(res => {
            this.expanded_item = res.data['historySms']
          })
    }
  }
}
</script>

<style scoped>

</style>