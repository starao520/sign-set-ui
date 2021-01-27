<template>
  <el-container class="body" oncontextmenu="return false">
    <el-header>
      <el-row>
        <el-col :span="18">
          <span>logo</span>
        </el-col>
        <el-col :span="6">
          <div style="float: right;">
            <el-button size="mini" type="success">最新</el-button>
            <el-button size="mini" type="danger">最爱</el-button>
            <el-button size="mini" type="info">关于</el-button>
          </div>
        </el-col>
      </el-row>
    </el-header>
    <el-main class="elMain">
      <el-row :gutter="10">
        <el-col v-for="(item, index) in imageList" :key="index" :span="4">
          <el-image :src="item.url" style="height: 500px;" fit="fill" />
        </el-col>
      </el-row>
    </el-main>
    <el-footer style="text-align: center;">
      <div>
        Copyright © 2020 - 2021
      </div>
    </el-footer>
  </el-container>
</template>

<script>
export default {
  name: 'Index',
  data() {
    return {
      imageList: [
        { url: 'http://signset.facebook47.cn/微信读书061611738873184.jpg', name: '卡拉克穆尔' },
        { url: 'http://signset.facebook47.cn/微信读书041611738873132.jpg', name: '卡拉克穆尔' },
        { url: 'http://signset.facebook47.cn/微信读书011611738873400.jpg', name: '卡拉克穆尔' },
        { url: 'http://signset.facebook47.cn/微信读书021611738873132.jpg', name: '卡拉克穆尔' },
        { url: 'http://signset.facebook47.cn/微信读书051611738873796.jpg', name: '卡拉克穆尔' },
        { url: 'http://signset.facebook47.cn/微信读书081611738873981.jpg', name: '卡拉克穆尔' },
        { url: 'http://signset.facebook47.cn/微信读书071611738873684.jpg', name: '卡拉克穆尔' },
        { url: 'http://signset.facebook47.cn/读书031611738893163.jpg', name: '卡拉克穆尔' },
        { url: 'http://signset.facebook47.cn/微信读书021611738873132.jpg', name: '卡拉克穆尔' },
        { url: 'http://signset.facebook47.cn/微信读书051611738873796.jpg', name: '卡拉克穆尔' },
        { url: 'http://signset.facebook47.cn/微信读书081611738873981.jpg', name: '卡拉克穆尔' },
        { url: 'http://signset.facebook47.cn/微信读书071611738873684.jpg', name: '卡拉克穆尔' }
      ]
    }
  },
  created() {
    //  禁用F12
    // document.onkeydown = function() {
    //   const e = window.event || arguments[0]
    //   if (e.keyCode === 123) {
    //     return false
    //   }
    // }
  }
}
</script>

<style scoped lang="scss">

  .body {
    height: calc(100vh);

    background-color: rgba(201,214,234, 0.3);

  }

  .elMain {
    overflow: hidden;
    scrollbar-width: none;
    overflow-y: overlay;

  }

  .el-header {
    background-color: rgba(201,214,234, 0.5);
    height: 50px!important;
    line-height: 50px;
  }

  .el-footer {
    background-color: rgba(201,214,234, 0.5);
    height: 30px!important;
    line-height: 30px;
  }

  *::-webkit-scrollbar {
    display: none;
  }
</style>
