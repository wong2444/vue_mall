<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">
            添加角色
          </el-button>
        </el-col>
      </el-row>
      <el-table
              :data="roleList"
              border
              stripe>

        <!--展開列-->
        <el-table-column type="expand">
          <template slot-scope="scope">

            <div  v-if="scope.row.children.length===0" style="text-align: center">你沒有任何權限</div>
            <el-row :class="['bdbottom',index1===0?'bdtop':'','vcenter']" v-for="(item1,index1) in scope.row.children"
                    :key="item1.id">

              <!--一行24列-->
              <!--一級權限-->
              <el-col :span="5">
                <el-tag @close="removeRightById(scope.row,item1.id)" closable>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--二三級權限-->
              <el-col :span="19">
                <el-row :class="[index2===0?'':'bdtop','vcenter']" v-for="(item2,index2) in item1.children"
                        :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" @close="removeRightById(scope.row,item2.id)" closable>{{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag @close="removeRightById(scope.row,item3.id)" closable type="warning"
                            v-for="(item3) in item2.children" :key="item3.id">{{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>

        <el-table-column
                type="index"
                label="#"
        >
        </el-table-column>
        <el-table-column
                prop="roleName"
                label="角色名稱"
        >
        </el-table-column>
        <el-table-column
                prop="roleDesc"
                label="角色描述"
        >
        </el-table-column>
        <el-table-column
                label="操作"
                width="180px"
        >
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.id)"></el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete"
                       @click="removeRightById(scope.row.id)"></el-button>
            <el-tooltip class="item" effect="dark" content="分配權限" placement="top" :enterable="false">
              <el-button type="warning" size="mini" icon="el-icon-setting" @click="showSetRightDialog(scope.row)"></el-button>
            </el-tooltip>

          </template>

        </el-table-column>
      </el-table>
    </el-card>
    <!--分配權限的對話框-->
    <el-dialog
            title="分配權限"
            :visible.sync="setRightDialogVisible"
            width="50%"
            @close="setRightDialogClosed"
    >
      <el-tree :data="rightList" :props="treeProps" :default-checked-keys="defKeys" show-checkbox default-expand-all
               node-key="id" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary"  @click="allotRights">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data () {
    return {
      roleList: [],
      setRightDialogVisible: false,
      rightList: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 在權限分配表中默認選中的權限節點
      defKeys: [],
      roleId: ''// 即將分配權3限的role id
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.roleList = res.data
    },
    async removeRightById (role, rightId) {
      const confirmResult = await this.$confirm('此操作将删除该權限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('取消刪除權限')
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      role.children = res.data
      this.$message.success(res.meta.msg)
    },
    async showSetRightDialog (role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get(`/rights/tree`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rightList = res.data
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    getLeafKeys (node, arr) {
      // 拿到所有第三級權限的id
      if (!node.children) {
        // 如果該節點沒有children屬性,則是三級節點
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    setRightDialogClosed () {
      this.defKeys = []
    },
    // 分配權限
    async allotRights () {
      // 拿到el-tree中所有選中和半選中選項的key
      const keys = [...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()]
      const idStr = keys.join(',') // arr to string
      // console.log(idStr, this.roleId)
      const { data: res } = await this.$http.post(`/roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }

  .bdtop {
    border-top: 1px solid #eee;
  }

  .bdbottom {
    border-bottom: 1px solid #eee;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
