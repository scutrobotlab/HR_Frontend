<template>
  <v-dialog v-model="display" :width="dialogWidth">
    <template v-slot:activator="{ on }">
      <v-text-field
        v-bind="textFieldProps"
        :disabled="disabled"
        :loading="loading"
        :label="label"
        :value="formattedDatetime"
        :suffix="fromNowDatetime"
        v-on="on"
        readonly
      >
        <template v-slot:progress>
          <slot name="progress">
            <v-progress-linear
              color="primary"
              indeterminate
              absolute
              height="2"
            ></v-progress-linear>
          </slot>
        </template>
      </v-text-field>
    </template>

    <v-card>
      <v-card-text class="px-0 py-0">
        <v-tabs fixed-tabs v-model="activeTab">
          <v-tab key="calendar">
            <slot name="dateIcon">
              <v-icon>mdi-calendar</v-icon>
            </slot>
          </v-tab>
          <v-tab key="timer" :disabled="dateSelected">
            <slot name="timeIcon">
              <v-icon>mdi-clock</v-icon>
            </slot>
          </v-tab>
          <v-tab-item key="calendar">
            <v-date-picker
              v-model="date"
              v-bind="datePickerProps"
              @input="showTimePicker"
              full-width
            ></v-date-picker>
          </v-tab-item>
          <v-tab-item key="timer">
            <v-time-picker
              ref="timer"
              v-model="time"
              v-bind="timePickerProps"
              format="24hr"
              full-width
            ></v-time-picker>
          </v-tab-item>
        </v-tabs>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <slot name="actions" :parent="this">
          <v-btn color="error" text @click.native="clearHandler">清除</v-btn>
          <v-btn color="success" text @click="okHandler">保存</v-btn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import moment from "moment";
const DEFAULT_DATE = "";
const DEFAULT_TIME = "00:00:00";
const DEFAULT_DIALOG_WIDTH = 340;
export default {
  name: "v-datetime-picker",
  model: {
    prop: "datetime",
    event: "input",
  },
  props: {
    datetime: {
      type: [Date, String],
      default: null,
    },
    disabled: {
      type: Boolean,
    },
    loading: {
      type: Boolean,
    },
    label: {
      type: String,
      default: "",
    },
    dialogWidth: {
      type: Number,
      default: DEFAULT_DIALOG_WIDTH,
    },
    textFieldProps: {
      type: Object,
    },
    datePickerProps: {
      type: Object,
    },
    timePickerProps: {
      type: Object,
    },
  },
  data() {
    return {
      display: false,
      activeTab: 0,
      date: DEFAULT_DATE,
      time: DEFAULT_TIME,
    };
  },
  mounted() {
    this.init();
  },
  computed: {
    formattedDatetime() {
      return this.selectedDatetime ? moment(this.selectedDatetime).format("lll") : "";
    },
    fromNowDatetime() {
      return this.selectedDatetime ? moment(this.selectedDatetime).fromNow() : "";
    },
    selectedDatetime() {
      if (this.date && this.time) {
        let datetimeString = this.date + " " + this.time;
        if (this.time.length === 5) {
          datetimeString += ":00";
        }
        return moment(datetimeString, this.defaultDateTimeFormat).toDate();
      } else {
        return null;
      }
    },
    dateSelected() {
      return !this.date;
    },
  },
  methods: {
    init() {
      if (!this.datetime) {
        return;
      }
      let initDateTime;
      if (this.datetime instanceof Date) {
        initDateTime = moment(this.datetime);
      } else if (typeof this.datetime === "string" || this.datetime instanceof String) {
        // see https://stackoverflow.com/a/9436948
        initDateTime = moment(this.datetime);
      }
      window.console.log(initDateTime);
      this.date = initDateTime.format("YYYY-MM-DD");
      this.time = initDateTime.format("HH:mm");
    },
    okHandler() {
      this.resetPicker();
      this.$emit("input", this.selectedDatetime);
    },
    clearHandler() {
      this.resetPicker();
      this.date = DEFAULT_DATE;
      this.time = DEFAULT_TIME;
      this.$emit("input", null);
    },
    resetPicker() {
      this.display = false;
      this.activeTab = 0;
      if (this.$refs.timer) {
        this.$refs.timer.selectingHour = true;
      }
    },
    showTimePicker() {
      this.activeTab = 1;
    },
  },
  watch: {
    datetime: function () {
      this.init();
    },
  },
};
</script>