<template>
  <MaterialCard class="v-card--material-chart" v-bind="$attrs" v-on="$listeners">
    <template v-slot:heading>
      <chartist
        :data="data"
        :event-handlers="eventHandlers"
        :options="options"
        :ratio="ratio"
        :responsive-options="responsiveOptions"
        :type="type"
        style="max-height: 150px;"
      />
    </template>

    <slot slot="reveal-actions" name="reveal-actions" />

    <slot />

    <slot slot="actions" name="actions" />
  </MaterialCard>
</template>

<script>
import MaterialCard from "@/components/Statistics/MaterialCard.vue";

export default {
  name: "MaterialChartCard",

  inheritAttrs: false,

  components: {
    MaterialCard,
  },

  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
    eventHandlers: {
      type: Array,
      default: () => [],
    },
    options: {
      type: Object,
      default: () => ({}),
    },
    ratio: {
      type: String,
      default: undefined,
    },
    responsiveOptions: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      required: true,
      validator: (v) => ["Bar", "Line", "Pie"].includes(v),
    },
  },
};
</script>

<style>
.v-card--material-chart .v-card--material__heading .ct-grid {
    stroke: hsla(0,0%,100%,.2);
}

.v-card--material-chart .v-card--material__heading .ct-series-a .ct-bar,
.v-card--material-chart .v-card--material__heading .ct-series-a .ct-line,
.v-card--material-chart .v-card--material__heading .ct-series-a .ct-point,
.v-card--material-chart .v-card--material__heading .ct-series-a .ct-slice-donut {
  stroke: hsla(0, 0%, 100%, 0.8);
}

.v-card--material-chart .v-card--material__heading .ct-label {
    color: inherit;
    opacity: .7;
    font-size: .3rem;
    font-weight: 100;
}
</style>