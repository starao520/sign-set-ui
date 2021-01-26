<template>
  <div class="app-container">
    <!--表单组件-->
    <el-dialog :visible.sync="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="form" :model="dictForm" :rules="rules" size="small" label-width="80px">
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="dictForm.name" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="dictForm.description" style="width: 370px;" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="dialogVisible = false">取消</el-button>
        <el-button v-if="isAdd" type="primary" @click="addDict">确认</el-button>
        <el-button v-else type="primary" @click="editDict">确认</el-button>
      </div>
    </el-dialog>
    <!-- 字典列表 -->
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="10" :lg="11" :xl="11" style="margin-bottom: 10px">
        <el-card class="box-card">
          <!--工具栏-->
          <div class="head-container">
            <!-- 搜索 -->
            <el-input v-model="searchForm.blurry" clearable size="small" placeholder="输入名称或者描述搜索" style="width: 200px;" class="filter-item" />
            <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="queryDict">搜索</el-button>
            <el-button v-permission="permission.add" class="filter-item" size="mini" type="primary" icon="el-icon-plus" @click="add">新增</el-button>
          </div>
          <!--表格渲染-->
          <el-table v-loading="loading" ref="table" :data="dictData" highlight-current-row style="width: 100%;" @current-change="handleCurrentChange">
            <el-table-column width="55" label="序号">
              <template slot-scope="scope">
                <span>{{ scope.$index + searchForm.page * searchForm.size + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column :show-overflow-tooltip="true" prop="name" label="名称" />
            <el-table-column :show-overflow-tooltip="true" prop="description" label="描述" />
            <el-table-column v-permission="['admin','dict:edit','dict:del']" label="操作" width="130px" align="center" fixed="right">
              <template slot-scope="scope">
                <el-button v-permission="permission.edit" :disabled="disabledEdit" size="mini" type="primary" icon="el-icon-edit" @click="edit(scope.row)" />
                <el-button v-permission="permission.del" :disabled="disabledDel" size="mini" type="danger" icon="el-icon-delete" @click="del(scope.row.id)" />
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
        </el-card>
      </el-col>
      <!-- 字典详情列表 -->
      <el-col :xs="24" :sm="24" :md="14" :lg="13" :xl="13">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>字典详情</span>
            <el-button
              v-if="checkPermission(['admin','dict:add']) && this.$refs.dictDetail && this.$refs.dictDetail.dictName"
              class="filter-item"
              size="mini"
              style="float: right;padding: 4px 10px"
              type="primary"
              icon="el-icon-plus"
              @click="$refs.dictDetail && $refs.dictDetail.add()"
            >新增</el-button>
          </div>
          <dictDetail ref="dictDetail" :permission="permission" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import checkPermission from '@/utils/permission'
import dictDetail from './dictDetail'
import { queryDicts, add, edit, del } from '@/api/system/dict'

export default {
  name: 'Dict',
  components: { dictDetail },
  data() {
    return {
      loading: false,
      searchForm: {
        blurry: '',
        size: 10,
        page: 0
      },
      dictForm: {
        name: '',
        description: ''
      },
      dictData: [],
      total: 0,
      isAdd: true,
      dialogVisible: false,
      disabledEdit: false,
      disabledDel: false,
      dialogTitle: '',
      pop: false,
      queryTypeOptions: [
        { key: 'name', display_name: '字典名称' },
        { key: 'description', display_name: '描述' }
      ],
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ]
      },
      permission: {
        add: ['admin', 'dict:add'],
        edit: ['admin', 'dict:edit'],
        del: ['admin', 'dict:del']
      }
    }
  },
  mounted() {
    this.queryDict()
  },
  methods: {
    checkPermission,
    // 选中字典后，设置字典详情数据
    handleCurrentChange(val) {
      if (val) {
        const _this = this.$refs.dictDetail
        _this.loading = true
        _this.dictName = val.name
        _this.dictId = val.id
        _this.detailData = []
        _this.queryDictDetail()
      }
    },
    //  搜索字典
    queryDict() {
      this.loading = true
      queryDicts(this.searchForm).then((res) => {
        this.dictData = res.records
        this.total = res.total
        this.loading = false
      }).catch(() => {
        this.$message.error('查询字典失败')
      })
    },
    //  新增
    add() {
      this.dialogVisible = true
      this.dialogTitle = '新增字典'
    },
    //  编辑
    edit(row) {
      this.isAdd = false
      this.dialogVisible = true
      this.dialogTitle = '编辑字典'
      this.dictForm.name = row.name
      this.dictForm.description = row.description
      this.dictForm.id = row.id
    },
    //  删除
    del(id) {
      const ids = []
      this.$confirm('确认删除该字典?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        ids.push(id)
        del(ids).then(res => {
          console.info(res)
          this.$message.success('删除成功')
          this.queryDict()
        }).catch(() => {
          this.$message.error('删除失败')
        })
      }).catch(() => {
        this.$message.info('已取消')
      })
    },
    //  新增字典
    addDict() {
      add(this.dictForm).then((res) => {
        console.info(res)
        this.$message.success('新增成功')
        this.dialogVisible = false
        this.queryDict()
      }).catch(() => {
        this.$message.error('新增失败')
      })
    },
    //  编辑字典
    editDict() {
      edit(this.dictForm).then(res => {
        console.info(res)
        this.$message.success('修改成功')
        this.dialogVisible = false
        this.queryDict()
      }).catch(() => {
        this.$message.error('修改失败')
      })
    },
    //  改变每页条数
    sizeChangeHandler(val) {
      console.info('每页条数' + val)
      this.searchForm.size = val
      this.queryDict()
    },
    //  改变当前页
    pageChangeHandler(val) {
      console.info('当前页码' + val)
      this.searchForm.page = val - 1
      this.queryDict()
    }
  }
}
</script>

<style scoped>
</style>
