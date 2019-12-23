<template>
<div>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    <el-breadcrumb-item>訂單管理</el-breadcrumb-item>
    <el-breadcrumb-item>訂單列表</el-breadcrumb-item>
  </el-breadcrumb>
  <el-card>
    <el-row>
      <el-col :span="8">
        <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList">
          <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
        </el-input>
      </el-col>
    </el-row>
    <el-table :data="orderList" border stripe>
      <el-table-column type="index" label="#">
      </el-table-column>
      <el-table-column label="訂單編號" prop="order_number">
      </el-table-column>
      <el-table-column label="訂單價格" prop="order_price" width="90px">
      </el-table-column>
      <el-table-column label="是否付款" prop="order_pay" width="90px">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.order_pay==='1'">已付款</el-tag>
          <el-tag type="danger" v-else-if="scope.row.order_pay==='0'">未付款</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否發貨" prop="is_send" width="70px">
      </el-table-column>
      <el-table-column label="下單時間" width="140px">
        <template slot-scope="scope">
          {{scope.row.update_time|dateFormat}}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="130px">
        <template>
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="showBox"></el-button>
          <el-button type="success" size="mini" icon="el-icon-location" @click="showProgressBox"></el-button>
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
  <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="addressDialogClosed">
    <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
      <el-form-item label="省市區/縣" prop="address1">
        <el-cascader :options="cityData" v-model="addressForm.address1">
        </el-cascader>
      </el-form-item>
      <el-form-item label="詳細地址" prop="address2">
        <el-input v-model="addressForm.address2"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
    <el-button @click="addressVisible = false">取 消</el-button>
    <el-button type="primary" @click="addressVisible = false">确 定</el-button>
    </span>
  </el-dialog>
  <el-dialog
          title="物流進度"
          :visible.sync="progressVisible"
          width="50%"
          >
    <el-timeline>
      <el-timeline-item
              v-for="(activity, index) in progressInfo"
              :key="index"
              :timestamp="activity.time">
        {{activity.context}}
      </el-timeline-item>
    </el-timeline>
  </el-dialog>
</div>
</template>

<script>
import cityData from './citydata'
export default {
  name: 'Order',
  data () {
    return {
      cityData,
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      orderList: [],
      total: 0,
      addressVisible: false,
      progressVisible: false,
      addressForm: { address1: [], address2: '' },
      addressFormRules: {
        address1: [
          { required: true, message: '請選擇省市區/縣', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '請填寫詳細地址', trigger: 'blur' }
        ]
      },
      progressInfo: []
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    showBox () {
      this.addressVisible = true
    },
    addressDialogClosed () {
      this.$refs.addressFormRef.resetFields()
    },
    async showProgressBox () {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) return this.$message.error(res.meta.message)
      this.$message.success(res.meta.message)
      this.progressInfo = res.data
      console.log(res.data)
      this.progressVisible = true
    },
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.orderList = res.data.goods
      this.total = res.data.total
      // this.$message.success(res.meta.msg)
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader{
  width: 100%;
}
</style>
