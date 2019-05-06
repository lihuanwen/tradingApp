import Vue from 'vue'

//api
import ajax from '@/service/ajax'
Vue.prototype.$ajax = ajax;

//API路径
import path from '@/service/path'
Vue.prototype.$path = path;

// store
import store from '@/store'
Vue.prototype.$store = store

//util
import util from '@/common/util'
Vue.prototype.$util = util;

//全局混合
import mixins from '@/mixins'
Vue.mixin(mixins)

// 全局事件
import EventProxy from '@/common/EventProxy'
Vue.use(EventProxy);

// 全局组件
// import pageHead from './components/page-head.vue'
// Vue.component('page-head', pageHead)

Vue.config.productionTip = false
App.mpType = 'app'

import App from './App'
const app = new Vue({
    store,
    ...App
})
app.$mount()
