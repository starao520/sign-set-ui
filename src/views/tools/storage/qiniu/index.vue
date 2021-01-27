<template>
  <div class="app-container" style="padding: 8px;">
    <!--表单组件-->
    <eForm ref="form" />
    <!-- 工具栏 -->
    <div class="head-container">
      <el-input v-model="searchForm.key" clearable size="small" placeholder="输入文件名称搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="queryFileList" />
      <date-range-picker v-model="createTime" class="date-item" @change="selectDate" />
      <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="queryFileList">搜索</el-button>
      <el-button class="filter-item" size="mini" type="primary" icon="el-icon-upload" @click="dialog = true">上传</el-button>
      <el-button class="filter-item" size="mini" type="success" icon="el-icon-s-tools" @click="doConfig">配置</el-button>
      <el-button class="filter-item" size="mini" type="danger" icon="el-icon-delete" @click="delFiles">删除</el-button>
      <!-- 文件上传 -->
      <el-dialog :visible.sync="dialog" :close-on-click-modal="false" append-to-body width="500px" @close="doSubmit">
        <el-upload
          :before-remove="handleBeforeRemove"
          :on-success="handleSuccess"
          :on-error="handleError"
          :file-list="fileList"
          :headers="headers"
          :action="qiNiuUploadApi"
          class="upload-demo"
          multiple
        >
          <el-button size="small" type="primary">点击上传</el-button>
          <div slot="tip" style="display: block;" class="el-upload__tip">请勿上传违法文件，且文件不超过15M</div>
        </el-upload>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="doSubmit">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" :data="fileData" style="width: 100%;" @selection-change="selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" :show-overflow-tooltip="true" label="文件名">
          <template slot-scope="scope">
            <a :href="scope.row.url" class="el-link el-link--primary" target="_blank" type="primary">{{ scope.row.realName }}</a>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" prop="suffix" label="文件类型" />
        <el-table-column prop="bucket" label="空间名称" />
        <el-table-column prop="size" label="文件大小" />
        <el-table-column prop="type" label="空间类型" />
        <el-table-column prop="createTime" label="创建日期">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <el-pagination
        :page-size.sync="searchForm.size"
        :total="total"
        :current-page.sync="searchForm.page + 1"
        style="margin-top: 8px;"
        layout="total, prev, pager, next, sizes"
        @size-change="sizeChangeHandler"
        @current-change="pageChangeHandler"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import { getFileList, download, del, sync } from '@/api/tools/qiniu'
import eForm from './form'
import DateRangePicker from '@/components/DateRangePicker'
import { parseTime } from '@/utils/index'

export default {
  components: { eForm, DateRangePicker },
  data() {
    return {
      fileData: [],
      searchForm: {
        key: '',
        createTime: [],
        page: 0,
        size: 10
      },
      total: 0,
      ids: [],
      createTime: [],
      permission: {
        del: ['admin', 'storage:del']
      },
      title: '文件', dialog: false,
      icon: 'el-icon-refresh',
      url: '', headers: { 'Authorization': getToken() },
      dialogImageUrl: '', dialogVisible: false, fileList: [], files: [], newWin: null
    }
  },
  computed: {
    ...mapGetters([
      'qiNiuUploadApi'
    ])
  },
  watch: {
    url(newVal, oldVal) {
      if (newVal && this.newWin) {
        this.newWin.sessionStorage.clear()
        this.newWin.location.href = newVal
        // 重定向后把url和newWin重置
        this.url = ''
        this.newWin = null
      }
    }
  },
  mounted() {
    this.queryFileList()
  },
  methods: {
    parseTime,
    //  查询文件列表
    queryFileList() {
      getFileList(this.searchForm).then(res => {
        this.fileData = res.content
        this.total = res.totalElements
      })
    },
    // 七牛云配置
    doConfig() {
      const _this = this.$refs.form
      _this.dialog = true
    },
    handleSuccess(response, file, fileList) {
      const uid = file.uid
      const id = response.id
      this.files.push({ uid, id })
    },
    handleBeforeRemove(file, fileList) {
      for (let i = 0; i < this.files.length; i++) {
        if (this.files[i].uid === file.uid) {
          del([this.files[i].id]).then(res => {})
          return true
        }
      }
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    selectionChangeHandler(val) {
      this.ids = []
      if (val) {
        val.forEach((item) => {
          this.ids.push(item.id)
        })
      }
    },
    // 刷新列表数据
    doSubmit() {
      this.fileList = []
      this.dialogVisible = false
      this.dialogImageUrl = ''
      this.dialog = false
      this.queryFileList()
    },
    // 监听上传失败
    handleError(e, file, fileList) {
      const msg = JSON.parse(e.message)
      this.$message.error(msg.message)
    },
    // 下载文件
    download(id) {
      this.downloadLoading = true
      // 先打开一个空的新窗口，再请求
      this.newWin = window.open()
      download(id).then(res => {
        this.downloadLoading = false
        this.url = res.url
      }).catch(err => {
        this.downloadLoading = false
        console.log(err.response.data.message)
      })
    },
    // 同步数据
    synchronize() {
      this.icon = 'el-icon-loading'
      sync().then(res => {
        this.icon = 'el-icon-refresh'
        this.$message({
          showClose: true,
          message: '数据同步成功',
          type: 'success',
          duration: 1500
        })
        this.crud.toQuery()
      }).catch(err => {
        this.icon = 'el-icon-refresh'
        console.log(err.response.data.message)
      })
    },
    //  选择日期
    selectDate(val) {
      this.searchForm.createTime = val.toString()
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
    },
    delFiles() {
      this.$confirm('确认要删除选中文件?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        del(this.ids).then(res => {
          this.$message.success('删除成功')
          this.queryFileList()
        })
      }).catch(() => {
        this.$message.info('已取消')
      })
    }
  }
}
</script>

<style scoped>

</style>
