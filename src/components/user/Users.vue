<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用戶管理</el-breadcrumb-item>
      <el-breadcrumb-item>用戶列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">

      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用戶</el-button>
        </el-col>

      </el-row>
      <el-table
              :data="userList"
              border
              stripe>
        <el-table-column
                type="index"
                label="#"
        >
        </el-table-column>
        <el-table-column
                prop="username"
                label="姓名"
        >
        </el-table-column>
        <el-table-column
                prop="email"
                label="郵箱"
        >
        </el-table-column>
        <el-table-column
                prop="mobile"
                label="電話">
        </el-table-column>
        <el-table-column
                prop="role_name"
                label="角色">
        </el-table-column>
        <el-table-column
                label="狀態">
          <template slot-scope="scope">
            <el-switch
                    v-model="scope.row.mg_state"
                    @change="userStateChanged(scope.row)"
            >
            </el-switch>

          </template>
        </el-table-column>
        <el-table-column
                label="操作" width="180px">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.id)"></el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeUserById(scope.row.id)"></el-button>
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" size="mini" icon="el-icon-setting" @click="setRole(scope.row)"></el-button>
            </el-tooltip>

          </template>
        </el-table-column>
      </el-table>

      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[1, 2, 5, 10]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
      </el-pagination>
    </el-card>
    <el-dialog
            title="添加用戶"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClosed"
    >
      <el-form ref="addFormRef" :rules="addFormRules" :model="addForm" label-width="70px">
        <el-form-item label="用戶名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密碼" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="郵箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手機" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
    </el-dialog>
    <el-dialog
            title="提示"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClosed"
           >
      <el-form ref="editFormRef" :rules="editFormRules" :model="editForm" label-width="70px">
        <el-form-item label="用戶名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="郵箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手機" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
    </el-dialog>

    <el-dialog
            title="分配角色"
            :visible.sync="setRoleDialogVisible"
            width="50%"
            @close="setRoleDialogClosed"
    >
      <div>
        <p>當前用戶:{{userInfo.username}}</p>
        <p>當前角色:{{userInfo.role_name}}</p>
        <p>分配新角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
                    v-for="item in roleList"
                    :key="item.id"
                    :label="item.roleName"
                    :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo" >确 定</el-button>
  </span>
    </el-dialog>
  </div>

</template>

<script>
export default {
  name: 'Users',
  data () {
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (!regEmail.test(value)) {
        return callback(new Error('郵箱輸入錯誤'))
      }
      callback()
    }
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (!regMobile.test(value)) {
        return callback(new Error('手機輸入錯誤'))
      }
      callback()
    }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2// 每頁顯示多少條數據
      },
      userList: [],
      roleList: [],
      total: 0,
      addDialogVisible: false,
      editDialogVisible: false,
      setRoleDialogVisible: false,
      addForm: { 'username': '', 'password': '', 'email': '', 'mobile': '' },
      editForm: { },
      userInfo: { },
      selectedRoleId: '',
      // 添加用戶表單的驗證規則
      addFormRules: {
        username: [{
          required: true, message: '請輸入用戶名', trigger: 'blur'
        },
        { min: 3, max: 10, message: '用戶名長度在3~10位之間', trigger: 'blur' }
        ],
        password: [
          {
            required: true, message: '請輸入密碼', trigger: 'blur'
          },
          { min: 6, max: 15, message: '用戶名長度在6~15位之間', trigger: 'blur' }
        ],
        email: [
          {
            required: true, message: '請輸入郵箱', trigger: 'blur'
          },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          {
            required: true, message: '請輸入手機', trigger: 'blur'
          },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editFormRules: {
        email: [
          {
            required: true, message: '請輸入郵箱', trigger: 'blur'
          },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          {
            required: true, message: '請輸入手機', trigger: 'blur'
          },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 監聽pagesize改變的事件
    handleSizeChange (newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 監聽翻頁事件
    handleCurrentChange (newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    async userStateChanged (userinfo) {
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
    },
    addDialogClosed () {
      // 添加用戶表單關閉時觸發的表單重置函數
      this.$refs.addFormRef.resetFields()
    },
    editDialogClosed () {
      // 添加編輯表單關閉時觸發的表單重置函數
      this.$refs.editFormRef.resetFields()
    },
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.addDialogVisible = false
        this.getUserList()
      })
    },
    editUserInfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`users/${this.editForm.id}`,
          { email: this.editForm.email, mobile: this.editForm.mobile })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.editDialogVisible = false
        this.getUserList()
      })
    },
    async showEditDialog (id) {
      // 監聽用戶編輯對話框
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editForm = res.data
      this.editDialogVisible = true
    },
    async removeUserById (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用戶, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('取消刪除用戶')

      const { data: res } = await this.$http.delete(`users/${id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getUserList()
    },
    async setRole (userInfo) {
      this.userInfo = userInfo
      const { data: res } = await this.$http.get(`roles`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.roleList = res.data
      this.setRoleDialogVisible = true
    },
    async saveRoleInfo () {
      if (!this.selectedRoleId) {
        return this.$message.error('請選擇要分配的角色')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    setRoleDialogClosed () {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style scoped>

</style>
