<template>
  <el-container class="body" oncontextmenu="return false">
    <el-header>
      <el-row>
        <el-col :span="4">
          <img src="../assets/images/logo.png" style="height: 48px;">
        </el-col>
        <el-col :span="20">
          <div style="float: right;">
            <el-button size="mini" type="success" @click="getNew">最新</el-button>
            <el-button size="mini" type="danger" @click="getLove">最爱</el-button>
            <el-button size="mini" type="info" @click="aboutSystem">关于</el-button>
          </div>
        </el-col>
      </el-row>
    </el-header>
    <el-main class="elMain">
      <el-row :gutter="10">
        <el-col v-for="(item, index) in imageList" :key="index" :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
          <el-image :src="item.url" style="height: 500px;cursor: pointer;" fit="fill" @click="handleImgClick(index)" />
        </el-col>
        <el-image-viewer v-if="showImage" :on-close="closeViewer" :url-list="srcList" />
      </el-row>
      <el-pagination
        :page-size.sync="searchForm.size"
        :page-sizes="[12, 24, 48, 96]"
        :total="total"
        :current-page.sync="searchForm.page + 1"
        style="margin-top: 8px;"
        layout="total, prev, pager, next, sizes"
        @size-change="sizeChangeHandler"
        @current-change="pageChangeHandler"
      />
    </el-main>
    <!--    <el-footer style="text-align: center;">-->
    <!--      <div>-->
    <!--        Copyright © 2020 - 2021-->
    <!--      </div>-->
    <!--    </el-footer>-->
    <about ref="about" />
  </el-container>
</template>

<script>
import ElImageViewer from 'element-ui/packages/image/src/image-viewer'
import About from './visitor/about'

import { getVisitorFileList } from '@/api/tools/qiniu'

export default {
  name: 'Index',
  components: { ElImageViewer, About },
  data() {
    return {
      imageList: [],
      showImage: false,
      srcList: [],
      searchForm: {
        page: 0,
        size: 12
      },
      total: 0
    }
  },
  created() {
    //  禁用F12
    document.onkeydown = function() {
      const e = window.event || arguments[0]
      if (e.keyCode === 123) {
        return false
      }
    }
  },
  mounted() {
    this.queryFileList()
  },
  methods: {
    queryFileList() {
      this.imageList = []
      getVisitorFileList(this.searchForm).then(res => {
        this.imageList = res.content
        this.total = res.totalElements
      })
    },
    closeViewer() {
      this.showImage = false
    },
    showViewer() {
      this.showImage = true
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
    },
    getNew() {
      this.queryFileList()
      this.$message.success('查询成功')
    },
    getLove() {
      this.$message.info('敬请期待')
    },
    //  改变每页条数
    sizeChangeHandler(val) {
      console.info('每页条数' + val)
      this.searchForm.size = val
      this.queryFileList()
    },
    //  改变当前页
    pageChangeHandler(val) {
      console.info('当前页码' + val)
      this.searchForm.page = val - 1
      this.queryFileList()
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

  ::v-deep .el-pagination__sizes {
    display: none!important;
  }

  ::v-deep .el-pagination {
    text-align: center;
  }

  ::v-deep .btn-prev {
    background-color: transparent!important;
  }

  ::v-deep .btn-next {
    background-color: transparent!important;
  }

  ::v-deep .el-pager {
    li {
      background-color: transparent!important;
    }
  }
</style>
