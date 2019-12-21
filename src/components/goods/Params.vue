<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分類參數</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-alert
              title="注意: 只允許為第三級分類設置相關參數"
              type="warning"
              :closable="false"
              show-icon
      >
      </el-alert>
      <el-row class="cat_opt">
        <el-col>
          <span>選擇商品分類</span>

          <el-cascader
                  v-model="selectedKeys"
                  :options="cateList"
                  :props="cateProps"
                  @change="handleChange"
                  clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="動態參數" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">動態參數
          </el-button>
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,index) in scope.row.attr_vals"
                        :key="index" closable @close="handleClose(index,scope.row)">{{item}}</el-tag>
                <el-input
                        class="input-new-tag"
                        v-if="scope.row.inputVisible"
                        v-model="scope.row.inputValue"
                        ref="saveTagInput"
                        size="small"
                        @keyup.enter.native="handleInputConfirm(scope.row)"
                        @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index">
            </el-table-column>
            <el-table-column label="參數名稱" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">編輯</el-button>
                <el-button type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">刪除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="靜態屬性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">靜態屬性
          </el-button>
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,index) in scope.row.attr_vals"
                        :key="index" closable @close="handleClose(index,scope.row)">{{item}}</el-tag>
                <el-input
                        v-if="scope.row.inputVisible"
                        v-model="scope.row.inputValue"
                        ref="saveTagInput"
                        size="small"
                        @keyup.enter.native="handleInputConfirm(scope.row)"
                        @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index">
            </el-table-column>
            <el-table-column label="屬性名稱" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">編輯</el-button>
                <el-button type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">刪除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

    </el-card>

    <el-dialog
            :title="'添加'+titleText"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClose"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addParams">确 定</el-button>
  </span>
    </el-dialog>
    <el-dialog
            :title="'修改'+titleText"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClose"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editParams">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data () {
    return {
      cateList: [],
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedKeys: [], // 選中的所有商品分類id
      activeName: 'many', // 選中的tab名
      manyTableData: [],
      onlyTableData: [],
      addDialogVisible: false,
      addForm: { attr_name: '' },
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入參數名稱', trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      editForm: { attr_name: '' },
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入參數名稱', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories', {})
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.cateList = res.data
    },
    handleChange () {
      this.getParamsData()
    },
    async getParamsData () {
      if (this.selectedKeys.length < 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 根據所選的商品分類及其面板屬性(動態or靜態)返回對應參數
      const { data: res } = await this.$http.get(`categories/${this.catId}/attributes`, {
        params: { sel: this.activeName }
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 控制文本框的是否顯示
        item.inputVisible = false
        // 交本框中輸入的值
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    handleTabClick () {
      if (this.selectedKeys.length > 2) {
        this.getParamsData()
      }
      console.log(this.activeName)
    },
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
    },
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.catId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getParamsData()
        this.addDialogVisible = false
      })
    },
    async showEditDialog (attrId) {
      const { data: res } = await this.$http.get(`categories/${this.catId}/attributes/${attrId}`,
        {
          params: { attr_sel: this.activeName }
        })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.catId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    editDialogClose () {
      this.$refs.editFormRef.resetFields()
    },
    async removeParams (attrId) {
      const confirmResult = await this.$confirm('此操作将永久删除该參數, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('取消刪除')
      const { data: res } = await this.$http.delete(`categories/${this.catId}/attributes/${attrId}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.getParamsData()
    },
    showInput (row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        // $nextTick的作用,是當頁面上元素重新渲染後,才會觸發指定回調函數中的代碼
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    async saveAttrVals (row) {
      const { data: res } = await this.$http.put(`categories/${this.catId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(',')
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
    },
    handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      this.saveAttrVals(row)
      row.inputValue = ''
      row.inputVisible = false
    },
    handleClose (index, row) {
      row.attr_vals.splice(index, 1)// 從數組中刪除指定元素
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 控制添加商品屬性的btn,如禁用返回true,否則返回false
    isBtnDisabled () {
      if (this.selectedKeys.length < 3) return true
      return false
    },
    catId () {
      if (this.selectedKeys.length > 2) {
        return this.selectedKeys[this.selectedKeys.length - 1]
      }
      return null
    },
    titleText () {
      // 決定添加屬性dialog的標題
      if (this.activeName === 'many') {
        return '動態參數'
      }
      return '靜態屬性'
    }
  }
}
</script>

<style lang="less" scoped>
  .cat_opt {
    margin: 15px 0;
  }

  .el-cascader {
    margin-left: 10px;
  }
  .el-tag{
    margin: 10px;
  }
  .input-new-tag{
    width: 120px;
  }
</style>
