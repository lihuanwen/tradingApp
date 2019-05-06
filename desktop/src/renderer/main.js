import Vue from 'vue';

import router from './router';
import store from './store';

import iView from 'iview';
import i18n from '@/locale';
import importDirective from '@/directive';
import 'iview/dist/styles/iview.css';
// import './index.less';
import '@/assets/icons/iconfont.css';

import ajax from '@/service/axios';
import path from '@/service/path';
import config from '@/config';
import * as filters from '@/libs/filters';
// import socket from '@/service/socket'

import App from './App';
import dataTable from '@/components/dataTable';
import loading from '@/components/loading';
import noData from '@/components/noData';
import error from '@/components/error';

Vue.prototype.$filters = filters;
Object.keys(filters).forEach(k => Vue.filter(k, filters[k]));

// 全局注册组件
Vue.component('data-table', dataTable);
Vue.component('loading', loading);
Vue.component('no-data', noData);
Vue.component('error', error);

Vue.use(iView, {
  i18n: (key, value) => i18n.t(key, value)
});

// ajax
Vue.prototype.$ajax = ajax;
// 接口地址
Vue.prototype.$path = path;
// 程序配置
Vue.prototype.$config = config;
// socket
// Vue.prototype.$socket = new socket('http://localhost:55462')

Vue.config.productionTip = false;

importDirective(Vue);

/* eslint-disable */
new Vue({
  el: '#app',
  router,
  i18n,
  store,
  render: h => h(App)
})
