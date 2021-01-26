<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!-- 搜索 -->
      <el-input v-model="searchForm.blurry" clearable size="small" placeholder="输入名称或者描述搜索" style="width: 200px;" class="filter-item" />
      <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="queryRole">搜索</el-button>
      <el-button v-permission="permission.add" class="filter-item" size="mini" type="primary" icon="el-icon-plus" @click="add">新增</el-button>
      <!-- 表单渲染 -->
      <el-dialog :visible.sync="dialogVisible" :title="dialogTitle" width="520px">
        <el-form ref="roleForm" :inline="true" :model="roleForm" :rules="rules" size="small" label-width="80px">
          <el-form-item label="角色名称" prop="name">
            <el-input v-model="roleForm.name" style="width: 380px;" />
          </el-form-item>
          <el-form-item label="角色级别" prop="level">
            <el-input-number v-model.number="roleForm.level" :min="1" controls-position="right" style="width: 145px;" />
          </el-form-item>
          <el-form-item label="描述信息" prop="description">
            <el-input v-model="roleForm.description" style="width: 380px;" rows="5" type="textarea" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="dialogVisible = false">取消</el-button>
          <el-button v-if="isAdd" type="primary" @click="addRole">确认</el-button>
          <el-button v-else type="primary" @click="editRole">确认</el-button>
        </div>
      </el-dialog>
      <el-row :gutter="15">
        <!--角色管理-->
        <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="17" style="margin-bottom: 10px">
          <el-card class="box-card" shadow="never">
            <div slot="header" class="clearfix">
              <span class="role-span">角色列表</span>
            </div>
            <el-table ref="table" v-loading="loading" style="width: 100%;" :data="roleData" highlight-current-row @current-change="handleCurrentChange">
              <el-table-column label="序号" width="55" align="center">
                <template slot-scope="scope">
                  <span>{{ scope.$index + searchForm.page * searchForm.size + 1 }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="名称" align="center" />
              <el-table-column prop="level" label="角色级别" align="center" />
              <el-table-column :show-overflow-tooltip="true" prop="description" label="描述" align="center" />
              <el-table-column :show-overflow-tooltip="true" width="135px" prop="createTime" label="创建日期" align="center">
                <template slot-scope="scope">
                  <span>{{ parseTime(scope.row.createTime) }}</span>
                </template>
              </el-table-column>
              <el-table-column v-permission="['admin','roles:edit','roles:del']" label="操作" width="130px" align="center" fixed="right">
                <template slot-scope="scope">
                  <el-button v-permission="permission.edit" size="mini" type="primary" icon="el-icon-edit" @click="edit(scope.row)" />
                  <el-button v-permission="permission.del" size="mini" type="danger" icon="el-icon-delete" @click="del(scope.row.id, scope.row.name)" />
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
        <!-- 菜单授权 -->
        <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="7">
          <el-card class="box-card" shadow="never">
            <div slot="header" class="clearfix">
              <el-tooltip class="item" effect="dark" content="选择指定角色分配菜单" placement="top">
                <span class="role-span">菜单分配</span>
              </el-tooltip>
              <el-button
                v-permission="['admin','roles:edit']"
                :loading="menuLoading"
                icon="el-icon-check"
                size="mini"
                style="float: right; padding: 6px 9px"
                type="primary"
                @click="saveMenu"
              >保存</el-button>
            </div>
            <el-tree
              ref="menu"
              :data="menus"
              :default-checked-keys="menuIds"
              :props="defaultProps"
              accordion
              show-checkbox
              node-key="id"
            />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div></template>

<script>
import { add, edit, del, editMenu, getLevel, getRolesByPage } from '@/api/system/role'
import { getMenusTree, getSimpleMenusTree, getLowerMenus } from '@/api/system/menu'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

import { parseTime } from '@/utils/index'

export default {
  name: 'Role',
  components: {},
  data() {
    return {
      loading: false,
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      dialogTitle: '',
      dialogVisible: false,
      isAdd: true,
      total: 0,
      searchForm: {
        blurry: '',
        page: 0,
        size: 10
      },
      roleForm: {
        id: null,
        name: null,
        depts: [],
        description: null,
        dataScope: '全部',
        level: 3
      },
      roleData: [],
      dateScopes: ['全部', '本级', '自定义'],
      level: 3,
      currentId: 0,
      menuLoading: false,
      showButton: false,
      menus: [],
      menuIds: [],
      depts: [],
      deptDatas: [], // 多选时使用
      permission: {
        add: ['admin', 'roles:add'],
        edit: ['admin', 'roles:edit'],
        del: ['admin', 'roles:del']
      },
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        permission: [
          { required: true, message: '请输入权限', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    getLevel().then(data => {
      this.level = data.level
    })
  },
  mounted() {
    this.queryRole()
    this.getSimpleMenusTree()
  },
  methods: {
    parseTime,
    //  搜索
    queryRole() {
      this.loading = true
      getRolesByPage(this.searchForm).then(res => {
        console.info(res)
        this.roleData = res.content
        this.total = res.totalElements
        this.loading = false
      })
    },
    //  查询简化菜单树
    getSimpleMenusTree() {
      getSimpleMenusTree().then(res => {
        console.info(res)
        this.menus = res
      }).catch(() => {
        this.$message.error('查询菜单树失败')
      })
    },
    //  新增
    add() {
      this.isAdd = true
      this.deptDatas = []
      this.dialogTitle = '新增角色'
      this.dialogVisible = true
      this.reSet()
    },
    //  新增提交
    addRole() {
      this.$refs.roleForm.validate((valid) => {
        if (valid) {
          if (this.roleForm.dataScope === '自定义' && this.deptDatas.length === 0) {
            this.$message.warning('自定义数据范围不能为空')
            return false
          }
          this.setDataScope()
          add(this.roleForm).then(res => {
            console.info(res)
            this.$message.success('添加成功')
            this.dialogVisible = false
            this.queryRole()
          }).catch(() => {
            this.$message.error('添加失败')
          })
        }
      })
    },
    //  编辑
    edit(row) {
      this.deptDatas = []
      if (row.dataScope === '自定义') {
        this.getSupDepts(row.depts)
      }
      const _this = this
      row.depts.forEach(function(dept) {
        _this.deptDatas.push(dept.id)
      })
      this.isAdd = false
      this.dialogTitle = '编辑角色'
      this.roleForm = row
      this.dialogVisible = true
    },
    //  编辑提交
    editRole() {
      this.$refs.roleForm.validate((valid) => {
        if (valid) {
          if (this.roleForm.dataScope === '自定义' && this.deptDatas.length === 0) {
            this.$message.warning('自定义数据范围不能为空')
            return false
          }
          this.setDataScope()
          edit(this.roleForm).then(res => {
            console.info(res)
            this.$message.success('编辑成功')
            this.dialogVisible = false
            this.queryRole()
          }).catch(() => {
            this.$message.error('编辑失败')
          })
        }
      })
    },
    del(id, name) {
      this.$confirm('确认删除角色【' + name + '】？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = []
        ids.push(id)
        del(ids).then(res => {
          console.info(res)
          this.$message.success('删除成功')
          this.queryRole()
        }).catch(() => {
          this.$message.error('删除失败')
        })
      }).catch(() => {
        this.$message.info('已取消')
      })
    },
    getMenuDatas(node, resolve) {
      console.info('我执行了')
      setTimeout(() => {
        getMenusTree(node.data.id ? node.data.id : 0).then(res => {
          console.info(res)
          resolve(res)
        })
      }, 100)
    },
    // 触发单选
    handleCurrentChange(val) {
      if (val) {
        // 清空菜单的选中
        this.$refs.menu.setCheckedKeys([])
        // 保存当前的角色id
        this.currentId = val.id
        // 初始化默认选中的key
        this.menuIds = []
        //  查询当前角色对应的最下级菜单
        getLowerMenus({ roleId: val.id }).then(res => {
          res.forEach((item) => {
            this.menuIds.push(item.id)
          })
          this.$refs.menu.setCheckedKeys(this.menuIds)
        })

        this.showButton = true
      }
    },
    // 保存菜单
    saveMenu() {
      this.menuLoading = true
      const role = { id: this.currentId, menus: [] }
      // 得到已选中的 key 值
      const checkedNodes = this.$refs.menu.getCheckedNodes()
      checkedNodes.forEach((item) => {
        const menu = { id: item.id, pid: item.pid }
        role.menus.push(menu)
      })
      editMenu(role).then(() => {
        this.$message.success('保存成功')
        this.menuLoading = false
        this.queryRole()
      }).catch(err => {
        this.menuLoading = false
        console.log(err.response.data.message)
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
    // 如果数据权限为自定义则获取部门数据
    changeScope(val) {
      if (val === '自定义') {
        this.getDepts()
      }
    },
    checkboxT(row) {
      return row.level >= this.level
    },
    reSet() {
      this.$nextTick(() => {
        this.$refs.roleForm.resetFields()
      })
    },
    setDataScope() {
      if (this.roleForm.dataScope === '自定义') {
        const depts = []
        this.deptDatas.forEach(function(data) {
          const dept = { id: data }
          depts.push(dept)
        })
        this.roleForm.depts = depts
      } else {
        this.roleForm.depts = []
      }
    },
    //  改变每页条数
    sizeChangeHandler(val) {
      this.searchForm.size = val
      this.queryRole()
    },
    //  改变当前页
    pageChangeHandler(val) {
      this.searchForm.page = val - 1
      this.queryRole()
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
  .role-span {
    font-weight: bold;color: #303133;
    font-size: 15px;
  }
</style>

<style rel="stylesheet/scss" lang="scss" scoped>
 ::v-deep .el-input-number .el-input__inner {
    text-align: left;
  }
 ::v-deep .vue-treeselect__multi-value{
    margin-bottom: 0;
  }
 ::v-deep .vue-treeselect__multi-value-item{
    border: 0;
    padding: 0;
  }
</style>
