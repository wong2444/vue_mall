<template>
<div>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    <el-breadcrumb-item>商品分類</el-breadcrumb-item>
  </el-breadcrumb>
  <el-card class="box-card">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
          <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
        </el-input>
      </el-col>
      <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
      </el-col>
    </el-row>
    <el-table :data="goodsList" border stripe>
      <el-table-column type="index" label="#">
      </el-table-column>
      <el-table-column label="商品名稱" prop="goods_name">
      </el-table-column>
      <el-table-column label="商品價格" prop="goods_price" width="90px">
      </el-table-column>
      <el-table-column label="商品重量" prop="goods_weight" width="70px">
      </el-table-column>
      <el-table-column label="創建時間" width="140px">
        <template slot-scope="scope">
          {{scope.row.add_time|dateFormat}}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="130px">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="editById(scope.row.goods_id)"></el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeById(scope.row.goods_id)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[2, 5, 10, 15]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total" background>
    </el-pagination>
  </el-card>
</div>
</template>

<script>
export default {
  name: 'List',
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      goodsList: [],
      total: 0

    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.goodsList = res.data.goods
      this.total = res.data.total
      // this.$message.success(res.meta.msg)
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    async removeById (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('取消刪除')
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getGoodsList()
    },
    goAddPage () {
      this.$router.push('/goods/add')
    },
    editById (id) {
      this.$router.push(`/goods/${id}`)
    }

  }
}
</script>

<style scoped>

</style>
