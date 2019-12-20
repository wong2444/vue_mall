<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分類</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">
            添加分類
          </el-button>
        </el-col>
      </el-row>
      <tree-table
              :data="cateList"
              :columns="columns"
              :selection-type="false"
              :expand-type="false"
              show-index
              index-text="#"
              border
              :show-row-hover="false"
              class="treeTable"
      >
        <template slot="isok" slot-scope="scope">
          <i
                  v-if="!scope.row.cat_deleted"
                  class="el-icon-success"
                  style="color: #159fab"
          ></i>
          <i v-else class="el-icon-error"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level == '0'" size="mini">一級</el-tag>
          <el-tag
                  v-else-if="scope.row.cat_level == '1'"
                  size="mini"
                  type="success"
          >二級
          </el-tag>
          <el-tag
                  v-else-if="scope.row.cat_level == '2'"
                  size="mini"
                  type="warning"
          >三級
          </el-tag>
        </template>
        <template slot="opt" slot-scope="">
          <el-button type="primary" icon="el-icon-edit">編輯</el-button>
          <el-button type="danger" icon="el-icon-delete">刪除</el-button>
        </template>
      </tree-table>
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[2, 5, 10, 15]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
      >
      </el-pagination>
    </el-card>

    <el-dialog
            title="添加分類"
            :visible.sync="addCateDialogVisible"
            width="50%"
            @close="addCateDialogClosed"
            ref="addCateFormRef"
    >
      <el-form
              :model="addCateForm"
              :rules="addCateFormRules"
              ref="addCateFormRef"
              label-width="100px"
      >
        <el-form-item label="分類名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父級分類" prop="cat_pid">
          <el-cascader
                  v-model="selectedKeys"
                  :options="parentCateList"
                  :props="cascaderProps"
                  @change="parentCateChanged"
                  clearable
                  change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate"
        >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'cate',
  data () {
    return {
      cateList: [],
      parentCateList: [],
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0, // 總數據條數
      // 為tree-table指定列的屬性
      columns: [
        { label: '分類名稱', prop: 'cat_name' },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok' // 該列使用的模板名稱
        },
        {
          label: '排序',
          type: 'template',
          template: 'order' // 該列使用的模板名稱
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt' // 該列使用的模板名稱
        }
      ],
      addCateDialogVisible: false,
      addCateForm: {
        cat_name: '',
        cat_pid: 0, // 分类父 ID
        cat_level: 0 // 分类层级
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分類名稱', trigger: 'blur' }
        ]
      },
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedKeys: [] // 選中的父級id
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.cateList = res.data.result
      this.total = res.data.total
      // console.log(this.cateList)
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    showAddCateDialog () {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    async getParentCateList () {
      // 取得父級分類列表
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.parentCateList = res.data
      console.log(res)
    },
    parentCateChanged () {
      // 如果selectedKeys數組中的length大於0,證明有選中的父級分類
      // 反之,就說明要創建的分類是父級分類
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
      // console.log(this.addCateForm)
      // console.log(this.selectedKeys)
    },
    addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories',
          this.addCateForm
        )
        // console.log(res)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    }

  }
}
</script>

<style scoped lang="less">
  .treeTable {
    margin-top: 15px;
  }

  .el-cascader {
    width: 100%;
  }
  .el-cascader-panel{
    height: 200px;
  }
</style>
