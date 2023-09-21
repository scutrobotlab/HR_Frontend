<script>
import moment from "moment";
import RoomCard from "@/components/RoomCard.vue";
import axios from "axios";

export default {
  name: "Interviewer",
  components: {RoomCard},
  data: () => ({
    myRoomName: null,
    timer: null,
    group: null,
  }),
  methods: {
    refreshRooms() {
      this.$store.dispatch("room/get")
          .then(() => this.myRoomName = this.myRoom.name);
    },
    setMyRoom(roomName) {
      this.$store.dispatch("room/setMyRoom", roomName)
      if (!roomName) this.myRoomName = "";
    },
    setRoomStatus(roomId, status) {
      this.loadingId = roomId
      return axios({
        method: "post",
        url: "/api/admin/room/status",
        params: {roomId: roomId, status: status}
      }).then(() => this.$store.dispatch("room/get")).finally(() => this.loadingId = 0)
    },
  },
  computed: {
    moment() {
      return moment;
    },
    rooms() {
      return this.$store.state.room.rooms.filter(e => e.status > 0);
    },
    myRoom() {
      return this.rooms.find(e => e.id === this.myRoomId);
    },
    myRoomId() {
      return this.$store.state.room.myRoomId;
    },
    status() {
      return this.$store.state.room.status;
    },
    myStatus() {
      if (this.myRoom) return this.myRoom.status;
      else return -1;
    },
  },
  mounted() {
    this.refreshRooms();
    this.$store.dispatch("groups/get");
    this.timer = setInterval(this.refreshRooms, 3000);
  },
  destroyed() {
    clearInterval(this.timer);
    this.timer = null;
  }
}
</script>

<template>
  <div class="mt-5">
    <v-row class="align-baseline">
      <v-col cols="12" sm="6">
        <v-select label="值班教室" :items="rooms.map(e => e.name)" v-model="myRoomName"
                  @change="e => setMyRoom(e)">
        </v-select>
      </v-col>
      <v-col cols="12" sm="6">
        <v-btn class="mr-3" color="primary" outlined :disabled="!myRoom" @click="setMyRoom(null)">
          立即下班
        </v-btn>
        <v-btn class="mr-3" color="success" outlined :disabled="!myRoom || myStatus <= 1"
               @click="setRoomStatus(myRoomId, 1)">
          {{ myStatus === 3 ? "面试结束" : "休息一下" }}
        </v-btn>
        <v-btn class="mr-3" color="warning" outlined :disabled="!myRoom || myStatus !== 1"
               @click="setRoomStatus(myRoomId, 2)">
          继续面试
        </v-btn>
      </v-col>
    </v-row>
    <v-row class="mt-0">
      <v-col cols="12" sm="12">
        <RoomCard
            v-if="myRoom"
            :room="myRoom"
            :star="true"
            :detail="true"
            :show-push="false"
            :show-comment="true"
            my-permission="面试官">
        </RoomCard>
        <div v-else>
          <v-alert color="warning" outlined>
            没有选择值班教室。
          </v-alert>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
</style>