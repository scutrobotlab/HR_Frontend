import Vue from "vue";
import Vuex from "vuex";
import Admin from "./modules/Admin";
import Applicant from "./modules/Applicant";
import AdminGroup from "./modules/AdminGroup";
import EvaluationStd from "./modules/EvaluationStd";
import AdminApplicant from "./modules/AdminApplicant";
import NameList from "./modules/NameList";
import Groups from "./modules/Groups";
import Form from "./modules/Form";
import Statistics from "./modules/Statistics";
import AllowJoinus from "./modules/AllowJoinus";
import Config from "@/store/modules/Config";
import Room from "@/store/modules/Room";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    admin: Admin,
    applicant: Applicant,
    adminGroup: AdminGroup,
    evaluationStd: EvaluationStd,
    adminApplicant: AdminApplicant,
    nameList: NameList,
    groups: Groups,
    form: Form,
    statistics: Statistics,
    allowJoinus: AllowJoinus,
    config: Config,
    room: Room,
  },
});
