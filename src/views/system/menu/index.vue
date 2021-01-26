<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <el-input v-model="searchForm.blurry" clearable size="small" placeholder="输入名称或者描述搜索" style="width: 200px;" class="filter-item" />
      <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="queryMenu">搜索</el-button>
      <el-button v-permission="permission.add" class="filter-item" size="mini" type="primary" icon="el-icon-plus" @click="add">新增</el-button>
    </div>
    <!--表单渲染-->
    <el-dialog :visible.sync="dialogVisible" :title="dialogTitle" width="580px">
      <el-form ref="menuForm" :inline="true" :model="menuForm" :rules="rules" size="small" label-width="80px">
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="menuForm.type" size="mini" style="width: 178px">
            <el-radio-button label="0">目录</el-radio-button>
            <el-radio-button label="1">菜单</el-radio-button>
            <el-radio-button label="2">按钮</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-show="menuForm.type.toString() !== '2'" label="菜单图标" prop="icon">
          <el-popover
            placement="bottom-start"
            width="450"
            trigger="click"
            @show="$refs['iconSelect'].reset()"
          >
            <IconSelect ref="iconSelect" @selected="selectedIcon" />
            <el-input slot="reference" v-model="menuForm.icon" style="width: 450px;" placeholder="点击选择图标" readonly>
              <svg-icon v-if="menuForm.icon" slot="prefix" :icon-class="menuForm.icon" class="el-input__icon" style="height: 32px;width: 16px;" />
              <i v-else slot="prefix" class="el-icon-search el-input__icon" />
            </el-input>
          </el-popover>
        </el-form-item>
        <el-form-item v-show="menuForm.type.toString() !== '2'" label="外链菜单" prop="iframe">
          <el-radio-group v-model="menuForm.iframe" size="mini">
            <el-radio-button label="true">是</el-radio-button>
            <el-radio-button label="false">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-show="menuForm.type.toString() === '1'" label="菜单缓存" prop="cache">
          <el-radio-group v-model="menuForm.cache" size="mini">
            <el-radio-button label="true">是</el-radio-button>
            <el-radio-button label="false">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-show="menuForm.type.toString() !== '2'" label="菜单可见" prop="hidden">
          <el-radio-group v-model="menuForm.hidden" size="mini">
            <el-radio-button label="false">是</el-radio-button>
            <el-radio-button label="true">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="menuForm.type.toString() !== '2'" label="菜单标题" prop="title">
          <el-input v-model="menuForm.title" :style=" menuForm.type.toString() === '0' ? 'width: 450px' : 'width: 178px'" placeholder="菜单标题" />
        </el-form-item>
        <el-form-item v-if="menuForm.type.toString() === '2'" label="按钮名称" prop="title">
          <el-input v-model="menuForm.title" placeholder="按钮名称" style="width: 178px;" />
        </el-form-item>
        <el-form-item v-show="menuForm.type.toString() !== '0'" label="权限标识" prop="permission">
          <el-input v-model="menuForm.permission" :disabled="menuForm.iframe" placeholder="权限标识" style="width: 178px;" />
        </el-form-item>
        <el-form-item v-if="menuForm.type.toString() !== '2'" label="路由地址" prop="path">
          <el-input v-model="menuForm.path" placeholder="路由地址" style="width: 178px;" />
        </el-form-item>
        <el-form-item label="菜单排序" prop="menuSort">
          <el-input-number v-model.number="menuForm.menuSort" :min="0" :max="999" controls-position="right" style="width: 178px;" />
        </el-form-item>
        <el-form-item v-show="!menuForm.iframe && menuForm.type.toString() === '1'" label="组件名称" prop="componentName">
          <el-input v-model="menuForm.componentName" style="width: 178px;" placeholder="匹配组件内Name字段" />
        </el-form-item>
        <el-form-item v-show="!menuForm.iframe && menuForm.type.toString() === '1'" label="组件路径" prop="component">
          <el-input v-model="menuForm.component" style="width: 178px;" placeholder="组件路径" />
        </el-form-item>
        <el-form-item label="上级类目" prop="pid">
          <treeselect
            v-model="menuForm.pid"
            :options="menus"
            :load-options="loadMenus"
            style="width: 450px;"
            placeholder="选择上级类目"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="dialogVisible = false">取消</el-button>
        <el-button v-if="isAdd" type="primary" @click="submitAdd">确认</el-button>
        <el-button v-else type="primary" @click="submitEdit">确认</el-button>
      </div>
    </el-dialog>
    <!--表格渲染-->
    <el-table
      ref="table"
      v-loading="loading"
      lazy
      :load="getMenus"
      :data="menuData"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      row-key="id"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column :show-overflow-tooltip="true" label="菜单标题" width="125px" prop="title" />
      <el-table-column prop="icon" label="图标" align="center" width="60px">
        <template slot-scope="scope">
          <svg-icon :icon-class="scope.row.icon ? scope.row.icon : ''" />
        </template>
      </el-table-column>
      <el-table-column prop="menuSort" align="center" label="排序">
        <template slot-scope="scope">
          {{ scope.row.menuSort }}
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" prop="permission" label="权限标识" />
      <el-table-column :show-overflow-tooltip="true" prop="component" label="组件路径" />
      <el-table-column prop="iframe" label="外链" width="75px">
        <template slot-scope="scope">
          <span v-if="scope.row.iframe">是</span>
          <span v-else>否</span>
        </template>
      </el-table-column>
      <el-table-column prop="cache" label="缓存" width="75px">
        <template slot-scope="scope">
          <span v-if="scope.row.cache">是</span>
          <span v-else>否</span>
        </template>
      </el-table-column>
      <el-table-column prop="hidden" label="可见" width="75px">
        <template slot-scope="scope">
          <span v-if="scope.row.hidden">否</span>
          <span v-else>是</span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建日期" width="135px">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-permission="['admin','menu:edit','menu:del']" label="操作" width="130px" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button v-permission="permission.edit" size="mini" type="primary" icon="el-icon-edit" @click="edit(scope.row)" />
          <el-button v-permission="permission.del" size="mini" type="danger" icon="el-icon-delete" @click="del(scope.row.id)" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import IconSelect from '@/components/IconSelect'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { LOAD_CHILDREN_OPTIONS } from '@riophae/vue-treeselect'

import { getMenus, getMenuSuperior, getMenusTree, add, edit, del } from '@/api/system/menu'
import { parseTime } from '@/utils/index'

export default {
  name: 'Menu',
  components: { Treeselect, IconSelect },
  data() {
    return {
      loading: false,
      menus: [],
      menuData: [],
      searchForm: {
        blurry: ''
      },
      menuForm: {
        id: null,
        title: null,
        menuSort: 999,
        path: null,
        component: null,
        componentName: null,
        iframe: false,
        roles: [],
        pid: null,
        icon: null,
        cache: false,
        hidden: false,
        type: 0,
        permission: null
      },
      isAdd: true,
      dialogVisible: false,
      dialogTitle: '',
      permission: {
        add: ['admin', 'menu:add'],
        edit: ['admin', 'menu:edit'],
        del: ['admin', 'menu:del']
      },
      rules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' }
        ],
        path: [
          { required: true, message: '请输入地址', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.queryMenu()
  },
  methods: {
    parseTime,
    getMenus(tree, treeNode, resolve) {
      const params = { pid: tree.id }
      setTimeout(() => {
        getMenus(params).then(res => {
          resolve(res.content)
        })
      }, 100)
    },
    getSupDepts(id) {
      getMenuSuperior(Array.of(id)).then(res => {
        const children = res.map(function(obj) {
          if (!obj.leaf && !obj.children) {
            obj.children = null
          }
          return obj
        })
        this.menus = [{ id: 0, label: '顶级类目', children: children }]
      })
    },
    loadMenus({ action, parentNode, callback }) {
      if (action === LOAD_CHILDREN_OPTIONS) {
        getMenusTree(parentNode.id).then(res => {
          parentNode.children = res.map(function(obj) {
            if (!obj.leaf) {
              obj.children = null
            }
            return obj
          })
          setTimeout(() => {
            callback()
          }, 100)
        })
      }
    },
    // 选中图标
    selectedIcon(name) {
      this.menuForm.icon = name
    },
    //  搜索
    queryMenu() {
      this.loading = true
      getMenus(this.searchForm).then(res => {
        console.info(res)
        this.menuData = res.content
        this.loading = false
      }).catch(() => {
        this.$message.error('查询菜单失败')
      })
    },
    //  新增菜单
    add() {
      this.isAdd = true
      this.menus = []
      this.dialogTitle = '新增菜单'
      this.menus.push({ id: 0, label: '顶级类目', children: null })
      this.dialogVisible = true
    },
    //  新增提交
    submitAdd() {
      this.$refs.menuForm.validate((valid) => {
        if (valid) {
          add(this.menuForm).then(res => {
            console.info(res)
            this.$message.success('新增成功')
            this.dialogVisible = false
            this.queryMenu()
          }).catch(() => {
            this.$message.error('新增失败')
          })
        }
      })
    },
    //  编辑菜单
    edit(row) {
      this.isAdd = false
      this.menuForm = row
      this.dialogTitle = '编辑菜单'
      this.getSupDepts(row.id)
      this.dialogVisible = true
    },
    //  编辑提交
    submitEdit() {
      this.$refs.menuForm.validate((valid) => {
        if (valid) {
          edit(this.menuForm).then(res => {
            console.info(res)
            this.$message.success('新增成功')
            this.dialogVisible = false
          })
        }
      })
    },
    //  删除菜单
    del(id) {
      this.$confirm('该操作会将下级一并删除,确认删除?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = []
        ids.push(id)
        del(ids).then(res => {
          this.$message.success('删除成功')
          this.queryMenu()
        })
      }).catch(() => {
        this.$message.info('已取消')
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
 ::v-deep .el-input-number .el-input__inner {
    text-align: left;
  }
 ::v-deep .vue-treeselect__control,::v-deep .vue-treeselect__placeholder,::v-deep .vue-treeselect__single-value {
    height: 30px;
    line-height: 30px;
  }
</style>
