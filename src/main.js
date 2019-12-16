import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 導入全局樣式表
import './assets/css/global.css'
// 導入字體圖標
import './assets/fonts/iconfont.css'
import axios from 'axios'

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http = axios// 將axios掛載到全局的vue對象上,可透過this.$http訪問

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
