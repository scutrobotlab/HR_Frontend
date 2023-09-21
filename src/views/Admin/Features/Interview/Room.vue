<script>

import moment from "moment";
import axios from "axios";
import PinyinMatch from "pinyin-match";
import RoomCard from "@/components/RoomCard.vue";

export default {
  name: "InterviewRoom",
  components: {RoomCard},
  computed: {
    moment() {
      return moment
    },
    nameList() {
      if (!this.searching) return this.pushable;
      let result = [];
      let nameList = this.$store.state.nameList.list;
      for (let i = 0; i < nameList.length; i++) {
        if (PinyinMatch.match(nameList[i].name, this.searchQuery)) result.push(nameList[i]);
        if (result.length > 20) break;
      }
      return result;
    },
    searching() {
      return this.searchQuery && this.searchQuery !== ""
    },
    myRoomId() {
      return this.$store.state.room.myRoomId
    },
    myRoomName() {
      return this.$store.state.room.myRoomName
    },
    pushable() {
      return this.$store.state.room.pushable
    },
    rooms() {
      let rooms = this.$store.state.room.rooms;
      if (this.myPermission === "管理员") return rooms;
      else return rooms.filter(e => e.status > 0);
    },
    status() {
      return this.$store.state.room.status;
    },
  },
  methods: {
    refreshRooms() {
      this.$store.dispatch("room/get");
    },
    getSearchIntents(applicantId) {
      axios.get("/api/admin/applicant/info/" + applicantId)
          .then(resp => this.selectApplicant = resp.data.applicant)
      this.searchQuery = null;
    },
    pushApplicant(roomId, applicantId, applicantTimeId) {
      this.pushDialog = false;
      this.loadingId = roomId;
      this.selectApplicant = null;
      return axios({
        method: "post",
        url: "/api/admin/room/push",
        params: {roomId: roomId, applicantId: applicantId, applicantTimeId: applicantTimeId}
      }).then(this.refreshRooms).finally(() => this.loadingId = 0)
    },
    setMyPermission(permission) {
      localStorage.setItem(this.roomPermissionKey, permission)
      if (permission === "管理员") this.adminDialog = true;
    },
    onPushDialog(roomId) {
      this.pushDialog = true;
      this.pushDialogRoomId = roomId;
    }
  },
  data: () => ({
    permissions: ["面试官", "接待组", "管理员"],
    showComment: true,
    myPermission: null,
    pushDialog: false,
    pushDialogRoomId: 0,
    adminDialog: false,
    timer: null,
    loadingId: 0,
    searchQuery: "",
    selectApplicant: null,
    roomPermissionKey: "room-permission",
  }),
  mounted() {
    this.myPermission = localStorage.getItem(this.roomPermissionKey)
    if (!this.myPermission) this.myPermission = this.permissions[0];
    this.refreshRooms();
    this.$store.dispatch("groups/get");
    this.timer = setInterval(this.refreshRooms, 3000);
    this.$store.dispatch("nameList/get");
  },
  destroyed() {
    clearInterval(this.timer);
    this.timer = null;
  },
}
</script>

<template>
  <div class="mt-5">
    <v-row>
      <v-col cols="12" sm="6">
        <v-select label="操作权限" :items="permissions" v-model="myPermission"
                  @change="e => setMyPermission(e)">
        </v-select>
      </v-col>
      <v-col cols="12" sm="6">
        <v-switch label="展示留言" v-model="showComment">
        </v-switch>
      </v-col>
    </v-row>
    <v-row class="mt-0">
      <v-col v-for="(room_it, idx) in rooms" :key="idx"
             cols="12" sm="4">
        <RoomCard
            :loading="loadingId === room_it.id"
            :room="room_it"
            :star="myRoomId === room_it.id"
            :my-permission="myPermission"
            :detail="false"
            :show-comment="showComment"
            @pushDialog="onPushDialog">
        </RoomCard>
      </v-col>
    </v-row>
    <v-dialog v-model="pushDialog" max-width="400px">
      <v-card v-if="!selectApplicant">
        <v-card-title>推送人员</v-card-title>
        <v-text-field
            class="ml-3 mr-3"
            flat solo clearable
            hide-details
            append-icon="mdi-magnify"
            placeholder="搜索姓名"
            v-model="searchQuery"/>
        <v-list class="ml-3 mr-3">
          <v-card-text v-if="!searching">已经签到但没有分配教室的面试者将被自动显示</v-card-text>
          <v-card-text v-else>搜索面试者不是正常的推送流程，仅供应急使用</v-card-text>
          <v-list-item v-for="(applicant, i) in nameList" :key="i"
                       @click="searching ? getSearchIntents(applicant.id) :
                        pushApplicant(pushDialogRoomId,applicant.applicantId,applicant.applicantTimeId)">
            {{ applicant.name }} {{ applicant.time }} {{ applicant.group }}
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-btn text color="primary" @click="pushDialog = false; searchQuery = null">取消</v-btn>
        </v-card-actions>
      </v-card>
      <v-card v-else>
        <v-card-title>{{ selectApplicant.name }}</v-card-title>
        <v-list class="ml-3 mr-3">
          <v-list-item v-for="(oneTime, i) in selectApplicant.times" :key="i"
                       @click="pushApplicant(pushDialogRoomId, selectApplicant.id, oneTime['applicant_time_id'])">
            {{ oneTime.time }} {{ oneTime.group }}
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-btn text color="primary" @click="pushDialog = false; selectApplicant = null">
            取消
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="adminDialog" max-width="400px" persistent>
      <v-card>
        <v-card-title>教室管理员</v-card-title>
        <v-card-text>
          我们相信您已经接受过了相关培训，但还是想要再次提醒您：<b>错误的操作可能导致面试流程混乱。</b>
          如果您无法正确行使管理员的职能，请修改权限。
        </v-card-text>
        <v-card-actions>
          <v-btn text color="primary" @click="adminDialog = false; myPermission = '面试官'">我是面试官</v-btn>
          <v-btn text color="primary" @click="adminDialog = false; myPermission = '接待组'">我是接待组</v-btn>
          <v-spacer></v-spacer>
          <v-btn text color="error" @click="adminDialog = false">我是管理员</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
</style>