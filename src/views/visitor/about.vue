<template>
  <el-dialog :visible.sync="dialogVisible" title="关于" width="30%">
    <div style="text-align: center;">
      <h1>签集</h1>
      <h3>一个收集书签的网站</h3>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'About',
  data() {
    return {
      dialogVisible: false
    }
  }
}
</script>

<style scoped lang="scss">
  ::v-deep  .el-dialog__header {
    background-color: rgba(201,214,234, 0.3);
  }

  ::v-deep  .el-dialog__body {
    background-color: rgba(201,214,234, 0.3);
  }
</style>
