<template>
  <div>
    <div v-if="dictName === ''">
      <div class="my-code">点击字典查看详情</div>
    </div>
    <div v-else>
      <!--工具栏-->
      <!--表单组件-->
      <el-dialog :visible.sync="dialogVisible" :title="detailTitle" width="500px">
        <el-form ref="form" :model="detailForm" :rules="rules" size="small" label-width="80px">
          <el-form-item label="字典标签" prop="label">
            <el-input v-model="detailForm.label" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="字典值" prop="value">
            <el-input v-model="detailForm.value" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="排序" prop="dictSort">
            <el-input-number v-model.number="detailForm.dictSort" :min="0" :max="999" controls-position="right" style="width: 370px;" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="dialogVisible = false">取消</el-button>
          <el-button v-if="isAdd" type="primary" @click="addDetail">确认</el-button>
          <el-button v-else type="primary" @click="editDetail">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table v-loading="loading" ref="table" :data="detailData" highlight-current-row style="width: 100%;">
        <el-table-column label="所属字典">
          {{ dictName }}
        </el-table-column>
        <el-table-column prop="label" label="字典标签" />
        <el-table-column prop="value" label="字典值" />
        <el-table-column prop="dictSort" label="排序" />
        <el-table-column v-permission="['admin','dict:edit','dict:del']" label="操作" width="130px" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button v-permission="permission.edit" size="mini" type="primary" icon="el-icon-edit" @click="edit(scope.row)" />
            <el-button v-permission="permission.edit" size="mini" type="danger" icon="el-icon-delete" @click="delDetail(scope.row.id)" />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <el-pagination
        :page-size.sync="detailForm.size"
        :total="total"
        :current-page.sync="detailForm.page"
        style="margin-top: 8px;"
        layout="total, prev, pager, next, sizes"
        @size-change="sizeChangeHandler"
        @current-change="pageChangeHandler"
      />
    </div>
  </div>
</template>

<script>

import { get, add, edit, del } from '../../../api/system/dictDetail'

export default {
  data() {
    return {
      dictId: null,
      loading: false,
      dialogVisible: false,
      isAdd: true,
      detailTitle: '',
      detailData: [],
      dictName: '',
      total: 0,
      detailForm: {
        page: 0,
        size: 0,
        label: '',
        value: '',
        dictSort: '',
        dict: {
          id: ''
        }
      },
      rules: {
        label: [
          { required: true, message: '请输入字典标签', trigger: 'blur' }
        ],
        value: [
          { required: true, message: '请输入字典值', trigger: 'blur' }
        ],
        dictSort: [
          { required: true, message: '请输入序号', trigger: 'blur', type: 'number' }
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
    this.queryDictDetail()
  },
  methods: {
    queryDictDetail() {
      get(this.dictName).then(res => {
        this.detailData = res.records
        this.total = res.total
        this.loading = false
      }).catch(() => {
        this.$message.error('查询字典详情失败')
      })
    },
    add() {
      this.dialogVisible = true
      this.isAdd = true
      this.detailTitle = '新增详情'
    },
    edit(row) {
      this.dialogVisible = true
      this.isAdd = false
      this.detailTitle = '编辑详情'

      this.detailForm.label = row.label
      this.detailForm.value = row.value
      this.detailForm.dictSort = row.dictSort
      this.detailForm.id = row.id
    },
    addDetail() {
      this.detailForm.dict.id = this.dictId
      add(this.detailForm).then(res => {
        console.info(res)
        this.$message.success('新增成功')
        this.dialogVisible = false
        this.queryDictDetail()
      }).catch(() => {
        this.$message.error('新增失败')
      })
    },
    editDetail() {
      edit(this.detailForm).then(res => {
        this.$message.success('编辑成功')
        this.dialogVisible = false
        this.queryDictDetail()
      }).catch(() => {
        this.$message.error('编辑失败')
      })
    },
    delDetail(id) {
      this.$confirm('确认删除该详情?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        del(id).then(res => {
          console.info(res)
          this.$message.success('删除成功')
          this.queryDictDetail()
        }).catch(() => {
          this.$message.error('删除失败')
        })
      }).catch(() => {
        this.$message.info('已取消')
      })
    },
    sizeChangeHandler(val) {
      this.detailForm.size = val
      this.queryDictDetail()
    },
    pageChangeHandler(val) {
      this.detailForm.page = val - 1
      this.queryDictDetail()
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
 ::v-deep .el-input-number .el-input__inner {
    text-align: left;
  }
</style>
