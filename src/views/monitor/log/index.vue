<template>
  <div class="app-container">
    <div class="head-container">
      <el-input v-model="searchForm.blurry" clearable size="small" placeholder="请输入你要搜索的内容" style="width: 200px;" class="filter-item" />
      <date-range-picker class="date-item" @change="selectDate" />
      <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="queryLog">搜索</el-button>
      <el-button slot="left" class="filter-item" type="danger" icon="el-icon-delete" size="mini" @click="confirmDelAll()">清空</el-button>
    </div>
    <!--表格渲染-->
    <el-table v-loading="loading" ref="table" :data="logData" style="width: 100%;">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item label="请求方法">
              <span>{{ props.row.method }}</span>
            </el-form-item>
            <el-form-item label="请求参数">
              <span>{{ props.row.params }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="requestIp" label="IP" />
      <el-table-column :show-overflow-tooltip="true" prop="address" label="IP来源" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="browser" label="浏览器" />
      <el-table-column prop="time" label="请求耗时" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.time <= 300">{{ scope.row.time }}ms</el-tag>
          <el-tag v-else-if="scope.row.time <= 1000" type="warning">{{ scope.row.time }}ms</el-tag>
          <el-tag v-else type="danger">{{ scope.row.time }}ms</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建日期" width="180px">
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
</template>

<script>
import { delAllInfo, queryLogInfo } from '@/api/monitor/log'
import DateRangePicker from '@/components/DateRangePicker'
import { parseTime } from '@/utils/index'

export default {
  name: 'Log',
  components: { DateRangePicker },
  data() {
    return {
      loading: false,
      searchForm: {
        blurry: '',
        createTime: '',
        page: 0,
        size: 10
      },
      createTime: [],
      total: 0,
      logData: []
    }
  },
  mounted() {
    this.queryLog()
  },
  methods: {
    parseTime,
    queryLog() {
      this.loading = true
      queryLogInfo(this.searchForm).then(res => {
        console.info(res)
        this.logData = res.content
        this.total = res.totalElements
        this.loading = false
      })
    },
    confirmDelAll() {
      this.$confirm(`确认清空所有操作日志吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delAllInfo().then(res => {
          this.$message.success('清空完成')
          this.queryLog()
        }).catch(err => {
          this.crud.delAllLoading = false
          console.log(err.response.data.message)
        })
      }).catch(() => {
      })
    },
    selectDate(val) {
      this.searchForm.createTime = val.toString()
    },
    //  改变每页条数
    sizeChangeHandler(val) {
      console.info('每页条数' + val)
      this.searchForm.size = val
      this.queryLog()
    },
    //  改变当前页
    pageChangeHandler(val) {
      console.info('当前页码' + val)
      this.searchForm.page = val - 1
      this.queryLog()
    }
  }
}
</script>

<style>
.demo-table-expand {
  font-size: 0;
}
.demo-table-expand label {
  width: 70px;
  color: #99a9bf;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 100%;
}
.demo-table-expand .el-form-item__content {
  font-size: 12px;
}
</style>
