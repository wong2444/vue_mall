<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>商品分類</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="添加商品信息" type="info" show-icon :closable="false">
      </el-alert>
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品參數"></el-step>
        <el-step title="商品屬性"></el-step>
        <el-step title="商品圖片"></el-step>
        <el-step title="商品內容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-position="top"
      >
        <!--el-form需放在eltabs之上,el-form不可被el-form包裹-->
        <el-tabs
          v-model="activeIndex"
          tab-position="left"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名稱" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品價格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品數量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分類" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品參數" name="1">
            <el-form-item
              v-for="item in manyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  v-for="(cb, i) in item.attr_vals"
                  :label="cb"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品屬性" name="2">
            <el-form-item
              v-for="item in onlyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品圖片" name="3">
            <el-upload
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品內容" name="4">
            <quill-editor v-model="addForm.goods_introduce"
                          ref="myQuillEditor"
                          >
            </quill-editor>
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <el-dialog title="圖片預覽" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg"/>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'Add',
  data () {
    return {
      activeIndex: '0',
      cateList: [],
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '', // 商品內容
        attrs: []
      },
      editForm: {

      },
      addFormRules: {
        goods_name: [
          { required: true, message: '請輸入商品名稱', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '請輸入商品價格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '請輸入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '請輸入商品數量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '請選擇商品分類', trigger: 'blur' }
        ]
      },
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      manyTableData: [],
      onlyTableData: [],
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      headerObj: { Authorization: window.sessionStorage.getItem('token') }, // 圖片上傳請求頭對象
      previewPath: '', // 圖片預覽地址
      previewVisible: false
    }
  },
  created () {
    this.getCateList()
    if (this.$route.params.id) {
      this.getGoodsData(this.$route.params.id)
    }
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.cateList = res.data
    },
    handleChange () {
      if (this.addForm.goods_cat.length < 3) {
        this.addForm.goods_cat = []
      }
    },
    beforeTabLeave (activeName, oldActiveName) {
      // console.log(activeName, oldActiveName)
      if (oldActiveName === '0' && this.addForm.goods_cat.length < 3) {
        this.$message.error('請選擇商品分類')
        return false
      }
    },
    async tabClicked () {
      if (this.activeIndex === '1') {
        const {
          data: res
        } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'many' }
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const {
          data: res
        } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'only' }
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.onlyTableData = res.data
      }
    },
    handlePreview (file) {
      // 圖片預覽,点击文件列表中已上传的文件时的钩子
      // console.log(file)
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    handleRemove (file) {
      // 圖片移除
      // console.log(file)
      const filePath = file.response.data.tmp_path
      const picIndex = this.addForm.pics.findIndex(
        item => item.pic === filePath
      )
      this.addForm.pics.splice(picIndex, 1)
      console.log(this.addForm)
    },
    handleSuccess (response) {
      // 圖片上傳成功後的钩子
      // 1.拼接一個圖片信息對象
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
    },
    add () {
      // 添加商品
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('請填寫必要的表單項')
        }

        // lodash 對象深拷貝
        this.addForm.attrs = []
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 處理動態參數
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 處理靜態屬性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)
        if (this.$route.params.id) {
          const {
            data: res
          } = await this.$http.put('goods/' + this.$route.params.id, form)
          if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
          this.$message.success(res.meta.msg)
        } else {
          const {
            data: res
          } = await this.$http.post(`goods`, form)
          if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
          this.$message.success(res.meta.msg)
        }

        this.$router.push('/goods')
      })
    },
    async getGoodsData (id) {
      const {
        data: res
      } = await this.$http.get(`goods/${id}`)
      // console.log(res.data)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.addForm = res.data
      this.addForm.goods_cat = this.addForm.goods_cat.split(',')
      this.addForm.goods_cat.forEach((item, index) => {
        this.addForm.goods_cat[index] = parseInt(item)
      })
      console.log(this.addForm)
    }

  },
  computed: {
    cateId () {
      if (this.addForm.goods_cat.length > 2) {
        return this.addForm.goods_cat[this.addForm.goods_cat.length - 1]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
  .previewImg{
    width: 100%;
  }
  .btnAdd{
    margin-top: 15px;
  }
</style>
