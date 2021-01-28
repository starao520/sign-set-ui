<template>
  <el-container class="body" oncontextmenu="return false">
    <el-header>
      <el-row>
        <el-col :span="18">
          <img src="../assets/images/logo.png" style="height: 48px;">
        </el-col>
        <el-col :span="6">
          <div style="float: right;">
            <el-button size="mini" type="success">最新</el-button>
            <el-button size="mini" type="danger">最爱</el-button>
            <el-button size="mini" type="info" @click="aboutSystem">关于</el-button>
          </div>
        </el-col>
      </el-row>
    </el-header>
    <el-main class="elMain">
      <el-row :gutter="10">
        <el-col v-for="(item, index) in imageList" :key="index" :span="4">
          <el-image :src="item.url" style="height: 500px;cursor: pointer;" fit="fill" @click="handleImgClick(index)" />
        </el-col>
        <el-image-viewer v-if="showImage" :on-close="closeViewer" :url-list="srcList" />
      </el-row>
    </el-main>
    <el-footer style="text-align: center;">
      <div>
        Copyright © 2020 - 2021
      </div>
    </el-footer>
    <about ref="about" />
  </el-container>
</template>

<script>
import ElImageViewer from 'element-ui/packages/image/src/image-viewer'
import About from './visitor/about'
export default {
  name: 'Index',
  components: { ElImageViewer, About },
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
      ],
      showImage: false,
      srcList: []
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
  },
  methods: {
    closeViewer() {
      this.showImage = false
    },
    showViewer() {
      this.showImage = true
    },
    showImageList() {
      this.showViewer()
    },
    handleImgClick(index) {
      this.showImage = true
      const tempSrcList = []
      this.imageList.forEach((item) => {
        tempSrcList.push(item.url)
      })
      const temp = []
      for (let i = 0; i < index; i++) {
        temp.push(tempSrcList.shift()) // shift() 方法用于把数组的第一个元素从其中删除，并返回第一个元素的值。
      }
      this.srcList = tempSrcList.concat(temp) // concat()方法用于连接两个或多个数组。
    },
    aboutSystem() {
      const _this = this.$refs.about
      _this.dialogVisible = true
    }
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

  ::v-deep  .el-icon-circle-close {
    color: white;
  }
</style>
