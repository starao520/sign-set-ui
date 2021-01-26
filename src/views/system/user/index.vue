<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--用户数据-->
      <!--工具栏-->
      <div class="head-container">
        <el-input v-model="searchForm.blurry" clearable size="small" placeholder="输入名称或者描述搜索" style="width: 200px;" class="filter-item" />
        <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="queryUser">搜索</el-button>
        <el-button v-permission="permission.add" class="filter-item" size="mini" type="primary" icon="el-icon-plus" @click="addBtn">新增</el-button>
      </div>
      <!--表单渲染-->
      <el-dialog :visible.sync="dialogVisible" :title="dialogTitle" width="570px" @open="openDialog">
        <el-form ref="userForm" :inline="true" :model="userForm" :rules="rules" size="small" label-width="66px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="userForm.username" />
          </el-form-item>
          <el-form-item label="电话" prop="phone">
            <el-input v-model.number="userForm.phone" />
          </el-form-item>
          <el-form-item label="昵称" prop="nickName">
            <el-input v-model="userForm.nickName" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="userForm.email" />
          </el-form-item>
          <el-form-item label="性别">
            <el-radio-group v-model="userForm.gender" style="width: 178px">
              <el-radio label="男">男</el-radio>
              <el-radio label="女">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="状态">
            <el-radio-group v-model="userForm.enabled" :disabled="userForm.id === user.id">
              <el-radio
                v-for="item in dict.user_status"
                :key="item.id"
                :label="item.value"
              >{{ item.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item style="margin-bottom: 0;" label="角色" prop="roles">
            <el-select
              v-model="roleDatas"
              style="width: 437px"
              multiple
              placeholder="请选择"
              @remove-tag="deleteTag"
              @change="changeRole"
            >
              <el-option
                v-for="item in roles"
                :key="item.name"
                :disabled="level !== 1 && item.level <= level"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUser">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" :data="userData" style="width: 100%;">
        <el-table-column :selectable="checkboxT" type="selection" width="55" />
        <el-table-column :show-overflow-tooltip="true" prop="username" label="用户名" align="center" />
        <el-table-column :show-overflow-tooltip="true" prop="nickName" label="昵称" align="center" />
        <el-table-column prop="gender" label="性别" width="100" align="center" />
        <el-table-column :show-overflow-tooltip="true" prop="phone" label="电话" align="center" />
        <el-table-column :show-overflow-tooltip="true" prop="email" label="邮箱" align="center" />
        <el-table-column label="状态" align="center" width="100" prop="enabled">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.enabled"
              :disabled="user.id === scope.row.id"
              active-color="#409EFF"
              inactive-color="#F56C6C"
              @change="changeEnabled(scope.row, scope.row.enabled)"
            />
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" prop="createTime" label="创建日期" align="center">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-permission="['admin','user:edit','user:del']" label="操作" width="130" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button v-permission="permission.edit" size="mini" type="primary" icon="el-icon-edit" @click="editBtn(scope.row)" />
            <el-button v-permission="permission.del" :disabled="user.id === scope.row.id" size="mini" type="danger" icon="el-icon-delete" @click="delUser(scope.row.id, scope.row.username)" />
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
    </el-row>
  </div>
</template>

<script>
import { isvalidPhone } from '@/utils/validate'
import { getAll, getLevel } from '@/api/system/role'
import { mapGetters } from 'vuex'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { getUsers, add, edit, del } from '@/api/system/user'
import { parseTime } from '@/utils/index'

let userRoles = []
let userJobs = []
export default {
  name: 'User',
  components: { },
  // 数据字典
  dicts: ['user_status'],
  data() {
    // 自定义验证
    const validPhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入电话号码'))
      } else if (!isvalidPhone(value)) {
        callback(new Error('请输入正确的11位手机号码'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      height: document.documentElement.clientHeight - 180 + 'px;',
      deptName: '',
      userData: [],
      dialogVisible: false,
      dialogTitle: '',
      isAdd: true,
      depts: [],
      deptDatas: [],
      jobs: [],
      level: 3,
      roles: [],
      jobDatas: [],
      roleDatas: [], // 多选时使用
      defaultProps: {
        children: 'children',
        label: 'name',
        isLeaf: 'leaf'
      },
      searchForm: {
        blurry: '',
        page: 0,
        size: 10,
        deptId: null
      },
      total: 0,
      userForm: {
        id: null,
        username: null,
        nickName: null,
        gender: '男',
        email: null,
        enabled: true,
        roles: [],
        jobs: [],
        dept: {
          id: null
        },
        phone: null
      },
      permission: {
        add: ['admin', 'user:add'],
        edit: ['admin', 'user:edit'],
        del: ['admin', 'user:del']
      },
      enabledTypeOptions: [
        { key: 'true', display_name: '激活' },
        { key: 'false', display_name: '锁定' }
      ],
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        nickName: [
          { required: true, message: '请输入用户昵称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        phone: [
          { required: true, trigger: 'blur', validator: validPhone }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ])
  },
  mounted: function() {
    const that = this
    window.onresize = function temp() {
      that.height = document.documentElement.clientHeight - 180 + 'px;'
    }
    this.queryUser()
  },
  methods: {
    parseTime,
    queryUser() {
      this.loading = true
      getUsers(this.searchForm).then(res => {
        console.info(res)
        this.userData = res.content
        this.total = res.totalElements
        this.loading = false
      }).catch(() => {
        this.$message.error('查询用户失败')
      })
    },
    //  新增按钮
    addBtn() {
      this.isAdd = true
      this.jobDatas = []
      this.roleDatas = []
      this.dialogTitle = '新增用户'
      this.dialogVisible = true
      this.getDepts()
    },
    //  新增用户
    submitUser() {
      this.$refs.userForm.validate((valid) => {
        if (valid) {
          if (!this.userForm.dept.id) {
            this.$message.warning('部门不能为空')
            return false
          } else if (this.jobDatas.length === 0) {
            this.$message.warning('岗位不能为空')
            return false
          } else if (this.roleDatas.length === 0) {
            this.$message.warning('角色不能为空')
            return false
          }
          this.userForm.roles = userRoles
          this.userForm.jobs = userJobs
        }

        if (this.isAdd) {
          add(this.userForm).then(res => {
            console.info(res)
            this.$message.success('新增成功，默认密码：123456')
            this.dialogVisible = false
            this.queryUser()
          }).catch(() => {
            this.$message.error('添加用户失败')
          })
        } else {
          edit(this.userForm).then(res => {
            console.info(res)
            this.$message.success('编辑成功')
            this.dialogVisible = false
            this.queryUser()
          }).catch(() => {
            this.$message.error('编辑用户失败')
          })
        }
      })
    },
    //  编辑按钮
    editBtn(row) {
      this.isAdd = false
      this.jobDatas = []
      this.roleDatas = []
      this.dialogTitle = '编辑用户'
      this.dialogVisible = true
      this.userForm = JSON.parse(JSON.stringify(row))
      userRoles = []
      userJobs = []
      const _this = this
      this.userForm.roles.forEach(function(role, index) {
        _this.roleDatas.push(role.id)
        const rol = { id: role.id }
        userRoles.push(rol)
      })
      this.userForm.jobs.forEach(function(job, index) {
        _this.jobDatas.push(job.id)
        const data = { id: job.id }
        userJobs.push(data)
      })
      this.getSupDepts(row.dept.id)
    },
    //  删除用户
    delUser(id, name) {
      this.$confirm('确认删除用户【' + name + '】?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = []
        ids.push(id)
        del(ids).then(res => {
          console.info(res)
          this.$message.success('删除成功')
          this.queryUser()
        })
      }).catch(() => {
        this.$message.info('已取消')
      })
    },
    changeRole(value) {
      userRoles = []
      value.forEach(function(data, index) {
        const role = { id: data }
        userRoles.push(role)
      })
    },
    changeJob(value) {
      userJobs = []
      console.info('value')
      console.info(value)
      console.info('jobDatas')
      console.info(this.jobDatas)
      value.forEach(function(data, index) {
        const job = { id: data }
        userJobs.push(job)
      })
    },
    deleteTag(value) {
      userRoles.forEach(function(data, index) {
        if (data.id === value) {
          userRoles.splice(index, value)
        }
      })
    },
    buildDepts(depts) {
      depts.forEach(data => {
        if (data.children) {
          this.buildDepts(data.children)
        }
        if (data.hasChildren && !data.children) {
          data.children = null
        }
      })
    },
    // 改变状态
    changeEnabled(data, val) {
      this.$confirm('此操作将 "' + this.dict.label.user_status[val] + '" ' + data.username + ', 是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        edit(data).then(res => {
          this.$message.success(this.dict.label.user_status[val] + '成功')
        }).catch(() => {
          data.enabled = !data.enabled
        })
      }).catch(() => {
        data.enabled = !data.enabled
      })
    },
    // 获取弹窗内角色数据
    getRoles() {
      getAll().then(res => {
        this.roles = res
      }).catch(() => { })
    },
    // 获取权限级别
    getRoleLevel() {
      getLevel().then(res => {
        this.level = res.level
      }).catch(() => { })
    },
    checkboxT(row, rowIndex) {
      return row.id !== this.user.id
    },
    openDialog() {
      this.getRoles()
      this.getRoleLevel()
      this.userForm.enabled = this.userForm.enabled.toString()
      if (this.isAdd) {
        this.reSet()
      }
    },
    reSet() {
      this.$nextTick(() => {
        this.$refs['userForm'].resetFields()
      })
    },
    //  改变每页条数
    sizeChangeHandler(val) {
      console.info('每页条数' + val)
      this.searchForm.size = val
      this.queryUser()
    },
    //  改变当前页
    pageChangeHandler(val) {
      console.info('当前页码' + val)
      this.searchForm.page = val - 1
      this.queryUser()
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  ::v-deep .vue-treeselect__control,::v-deep .vue-treeselect__placeholder,::v-deep .vue-treeselect__single-value {
    height: 30px;
    line-height: 30px;
  }
</style>
