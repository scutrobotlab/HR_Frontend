<script>
import moment from "moment";
import axios from "axios";

export default {
  name: "RoomCard",
  props: {
    room: Object,
    loading: Boolean,
    star: Boolean,
    myPermission: String,
    detail: Boolean,
    showComment: Boolean
  },
  data: () => ({
    interviewer_comment: null,
    interviewerCommentEditing: false,
    receiver_comment: null,
    receiverCommentEditing: false,
  }),
  computed: {
    moment() {
      return moment
    },
    status() {
      return this.$store.state.room.status;
    },
    interviewerComment: {
      get() {
        return this.interviewerCommentEditing ? this.interviewer_comment : this.room["interviewerComment"]
      },
      set(newVal) {
        this.interviewer_comment = newVal;
      }
    },
    receiverComment: {
      get() {
        return this.receiverCommentEditing ? this.receiver_comment : this.room["receiverComment"]
      },
      set(newVal) {
        this.receiver_comment = newVal;
      }
    },
    groupsLabel() {
      return ["无组别", ...this.$store.state.groups.list];
    },
  },
  methods: {
    pushDialog(roomId) {
      this.$emit("pushDialog", roomId)
    },
    setRoomStatus(roomId, status) {
      this.loadingId = roomId
      return axios({
        method: "post",
        url: "/api/admin/room/status",
        params: {roomId: roomId, status: status}
      }).then(() => this.$store.dispatch("room/get")).finally(() => this.loadingId = 0)
    },
    updateComment(type, comment) {
      if (type === 1) this.room["interviewerComment"] = comment;
      else if (type === 2) this.room["receiverComment"] = comment;
      return axios({
        method: "post",
        url: "/api/admin/room/comment/" + this.room.id,
        data: {type: type, comment: comment}
      })
    },
    setRoomGroup(roomId, group) {
      this.loadingId = roomId
      if (group === "无组别") group = null;
      return axios({
        method: "post",
        url: "/api/admin/room/group",
        params: {roomId: roomId, group: group}
      }).then(() => this.$store.dispatch("room/get")).finally(() => this.loadingId = 0)
    },
  },
}
</script>

<template>
  <v-card elevation="2" :loading="loading">
    <v-card-title>
      {{ room.name }} {{ room.groupLabel }}
      <v-icon v-if="star" color="amber">mdi-star</v-icon>
      <v-spacer></v-spacer>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-chip v-on="on" :color="status[room.status].color" label :small="!detail">
            {{ status[room.status].label }}
          </v-chip>
        </template>
        <span>{{ room["updatedBy"] }} {{ moment(room["updatedAt"]).fromNow() }}更新</span>
      </v-tooltip>
    </v-card-title>
    <v-card-subtitle>
      <b>HR</b> {{ room["admins"].join(", ") }}
    </v-card-subtitle>
    <v-card-text>
      <div v-if="room.status === 0">
        该场次已经停用<br><br>
      </div>
      <div v-else-if="room.status === 1">
        <div v-if="room['admins'].length === 1">面试官正在摸鱼</div>
        <div v-else-if="room['admins'].length === 2">面试官正在下象棋</div>
        <div v-else-if="room['admins'].length === 3">面试官正在斗地主</div>
        <div v-else-if="room['admins'].length === 4">面试官正在打麻将</div>
        <div v-else>面试官正在摸鱼</div>
        <br>
      </div>
      <div v-else-if="room.status === 2">
        <h3 class="colorful">请接待组推送人员</h3>
        已等待 {{ moment().diff(moment(room.updatedAt), "minutes") }} 分钟
      </div>
      <div v-else-if="room.status === 3">
        已推送 <b><a :href="'/admin/person/'+room.applicantId+'/info'" target="_blank">
        {{ room.applicant }}</a></b><br>
        {{ room.group }}
        {{ room.time }}
      </div>
      <div v-if="showComment">
        <v-text-field label="面试官" v-model="interviewerComment"
                      :disabled="(myPermission !== '面试官' || !detail) && myPermission !== '管理员'"
                      @focusin="interviewerCommentEditing = true; interviewer_comment = room['interviewerComment']"
                      @focusout="interviewerCommentEditing = false; updateComment(1, interviewer_comment)"
                      dense outlined class="mt-2">
        </v-text-field>
        <v-text-field label="接待组" v-model="receiverComment"
                      :disabled="myPermission !== '接待组' && myPermission !== '管理员'"
                      @focusin="receiverCommentEditing = true; receiver_comment = room['receiverComment']"
                      @focusout="receiverCommentEditing = false; updateComment(2, receiver_comment)"
                      dense outlined class="mt-n4 mb-n6">
        </v-text-field>
      </div>
    </v-card-text>
    <v-card-actions v-if="myPermission !== '面试官'">
      <v-btn :disabled="room.status !== 2" text color="primary"
             @click="pushDialog(room.id)">
        推送人员
      </v-btn>
      <v-menu bottom offset-y v-if="myPermission === '管理员'">
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="primary" text v-bind="attrs" v-on="on">
            <span>状态</span>
            <v-icon right>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item v-for="(item, index) in status" :key="index"
                       :disabled="item.id === 3 || item.id === room.status"
                       @click="setRoomStatus(room.id, item.id)">
            <v-list-item-title>{{ item.label }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu bottom right v-if="detail || myPermission === '管理员'">
        <template v-slot:activator="{ on, attrs }">
          <v-btn class="mr-2" text color="primary"
                 v-bind="attrs" v-on="on">
            <span>组别</span>
            <v-icon right>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item v-for="item in groupsLabel" :key="item"
                       @click="setRoomGroup(room.id, item)">
            <v-list-item-title>{{ item }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-spacer></v-spacer>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.colorful {
  animation: color-change 1s infinite;
}

@keyframes color-change {
  0% {
    color: #64b5f6;
  }
  50% {
    color: #3f51b5;
  }
  100% {
    color: #64b5f6;
  }
}

.text-one-line {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>