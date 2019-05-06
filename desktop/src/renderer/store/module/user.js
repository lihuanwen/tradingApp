import ajax from '@/service/axios';
import path from '@/service/path';

export default {
  state: {
    token: localStorage.getItem('token'),
    userInfo: JSON.parse(localStorage.getItem('userInfo'))
  },
  mutations: {
    setUserInfo(state, newUserInfo) {
      let { token, userInfo } = newUserInfo;
      // if (!userInfo) {
      //   userInfo = { access: ['user', 'admin'] }
      // }
      state.token = token;
      state.userInfo = userInfo;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
      }
    }
  },
  actions: {
    // 退出登录
    handleLogOut({ state, commit }) {
      return new Promise((resolve, reject) => {
        window.location.href = window.location.pathname + '#/login';
        commit('setUserInfo', {});
        resolve();
      });
    },
    // 获取用户相关信息
    getUserInfo({ state, commit }) {
      return new Promise((resolve, reject) => {
        ajax
          .get(path.user.register)
          .then(data => {
            commit('setAvator', data.avator);
            resolve(data);
          })
          .catch(err => {
            reject(err);
          });
      });
    }
  }
};
