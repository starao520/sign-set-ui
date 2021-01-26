<template>
  <!--  <el-tabs v-model="activeName" style="padding-left: 8px;" @tab-click="tabClick">-->
  <!--&lt;!&ndash;    <el-tab-pane label="本地存储" name="first">&ndash;&gt;-->
  <!--&lt;!&ndash;      <Local ref="local" />&ndash;&gt;-->
  <!--&lt;!&ndash;    </el-tab-pane>&ndash;&gt;-->
  <!--    <el-tab-pane label="七牛云存储" name="second">-->
  <!--      <QiNiu ref="qiNiu" />-->
  <!--    </el-tab-pane>-->
  <!--  </el-tabs>-->
  <QiNiu ref="qiNiu" />
</template>

<script>
import QiNiu from './qiniu/index'
export default {
  name: 'Storage',
  components: { QiNiu },
  data() {
    return {
      activeName: 'first'
    }
  },
  methods: {
    tabClick(name) {
      if (this.activeName === 'first') {
        this.$refs.local.crud.toQuery()
      } else {
        this.$refs.qiNiu.crud.toQuery()
      }
    }
  }
}
</script>

<style scoped>
</style>
