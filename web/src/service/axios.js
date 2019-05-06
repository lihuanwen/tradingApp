import axios from 'axios';
import store from '@/store';

import { Message } from 'iview';

// axios.defaults.timeout = 5 * 1000
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.interceptors.request.use(
  config => {
    if (store.state.user.token) {
      config.headers['authorization'] = 'Bearer ' + store.state.user.token;
    }
    return config;
  },
  err => {
    return Promise.reject(err);
  }
);

axios.interceptors.response.use(
  res => {
    let { data } = res;
    if (data.success) {
      return data.data;
    } else {
      Message.error({
        content: data.message ? data.message : '遇到未知错误，请稍后重试。',
        duration: 30,
        closable: true
      });
      return Promise.reject(data);
    }
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          store.dispatch('handleLogOut');
          Message.error({
            content: '未登录，或登录失效，请登录',
            duration: 30,
            closable: true
          });
          break;
        default:
          Message.error({
            content: error.response.statusText
              ? error.response.statusText
              : '遇到未知错误，请稍后重试。',
            duration: 30,
            closable: true
          });
      }
    } else {
      Message.error({
        content: error.message ? error.message : '遇到未知错误，请稍后重试。',
        duration: 30,
        closable: true
      });
    }
    return Promise.reject(error);
  }
);

export default axios;
