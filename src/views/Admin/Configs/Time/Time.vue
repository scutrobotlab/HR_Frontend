<template>
  <div>
    <v-tabs centered>
      <v-tab :to="'/admin/configs/times/export'">导出数据</v-tab>
      <v-tab :to="'/admin/configs/times/import'">导入数据</v-tab>
    </v-tabs>
    <router-view class="my-5" />
  </div>
</template>
