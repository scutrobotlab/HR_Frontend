import axios from "axios";

export default {
  namespaced: true,
  state: {
    rooms: [],
    pushable: [],
    myRoomId: 0,
    myRoomName: null,
    status: {
      0: {id: 0, label: "已停用", color: "secondary"},
      1: {id: 1, label: "休息中", color: "success"},
      2: {id: 2, label: "等待中", color: "warning"},
      3: {id: 3, label: "已占用", color: "error"},
    },
  },
  mutations: {},
  actions: {
    get({state}) {
      return axios({
        method: "get",
        url: "/api/admin/room/all",
      }).then(resp => {
        state.rooms = resp.data.rooms;
        state.myRoomId = resp.data.myRoomId;
        state.myRoomName = resp.data.myRoomName;
      }).then(() =>
        axios({
          method: "get",
          url: "/api/admin/room/pushable",
        }).then(resp => {
          state.pushable = resp.data.applicants;
        }))
    },
    setMyRoom({state}, roomName) {
      let roomId = 0
      if (roomName) {
        let room = state.rooms.find(e => e.name === roomName)
        roomId = room.id
      }
      return axios({
        method: "post",
        url: "/api/admin/room/my",
        params: {roomId: roomId}
      }).then(() => this.dispatch("room/get"))
    },
  }
}