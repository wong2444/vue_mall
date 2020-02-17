import Vue from 'vue'
import App from './App.vue'
import router from './router'
// import './plugins/element.js'
// 導入全局樣式表
import './assets/css/global.css'
// 導入字體圖標
import './assets/fonts/iconfont.css'
import axios from 'axios'
import treeTable from 'vue-table-with-tree-grid'

import VueQuillEditor from 'vue-quill-editor'

// require styles
// import 'quill/dist/quill.core.css'
// import 'quill/dist/quill.snow.css'
// import 'quill/dist/quill.bubble.css'

import NProgress from 'nprogress'
// import 'nprogress/nprogress.css'

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

axios.interceptors.request.use(config => {
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // config是本次的request對象,在攔截器的最後必須return config
  return config
})

axios.interceptors.response.use(config => {
  NProgress.done()
  // config是本次的request對象,在攔截器的最後必須return config
  return config
})

Vue.prototype.$http = axios// 將axios掛載到全局的vue對象上,可透過this.$http訪問

Vue.config.productionTip = false
Vue.component('tree-table', treeTable)

Vue.use(VueQuillEditor)

Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')// 字符串長度為2,如不足則以0補足
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
