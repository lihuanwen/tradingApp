import Vue from 'vue'
import Vuex from 'vuex'

import ajax from '@/service/ajax'
import path from '@/service/path'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		token: null, // token
		userInfo: null, // 用户信息
		cache: {}, // 数据缓存
		pushMessage: null
	},
	getters: {
		isLogin(state) {
			return state.token ? true : false;
		},
	},
	mutations: {
		/**
		 * 用户登录
		 * @param {*} state 
		 * @param {*} OAuth 用户信息
		 */
		login(state, OAuth) {
			state.token = OAuth.token;
			state.userInfo = OAuth.userInfo;
			uni.setStorageSync('OAuth', OAuth); // 保存用户信息
		},
		/**
		 * 用户登出
		 * @param {*} state 
		 */
		logout(state) {
			state.token = null;
			state.userInfo = null;
			uni.removeStorageSync('OAuth');
		},
		/**
		 * 设置数据缓存
		 * @param {*} state 
		 * @param {*} key 数据key
		 * @param {*} res 数据
		 */
		setCache(state, { key, res }) {
			state.cache[key] = res;
		},
		/**
		 * 清空本地数据
		 * @param {*} state 
		 */
		clearStorage(state) {
			state.token = null;
			state.userInfo = null;
			state.cache = {};
			uni.clearStorageSync();
		},
		/**
		 * 更新推送信息
		 * @param {*} state 
		 * @param {*} message 
		 */
		updatePushMessage(state, message) {
			// console.log(JSON.stringify(message));
			let { title, content, payload, aps } = message;
			payload = payload ? JSON.parse(payload) : null;
			if (payload.pagePath) {
				uni.navigateTo({
					url: payload.pagePath
				});
			} else {
				uni.switchTab({
					url: "/pages/main/index"
				});
			}
			state.pushMessage = {
				title, content, payload, aps
			};
		},
	},
	actions: {
		handleLogOut({ state, commit }) {
			return new Promise((resolve, reject) => {
				commit('logout');
				commit('clearStorage');
				resolve();
			});
		},
		getCache({ state, commit }, key) {
			return new Promise((resolve, reject) => {
				if (state.cache[key]) {
					resolve(state.cache[key]);
				} else {
					ajax.post(path.config, { key }).then(
						res => {
							commit('setCache', { key, res });
							resolve(res);
						},
						err => {
							reject(err);
						}
					);
				}
			});
		},
	},
})

// if (process.env.NODE_ENV === 'development') {
// } else {
// }
// store.commit("login", { "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6IjI5ZjBjNjBhLWRiODgtNDIyNy1iN2MzLTYyZDZmMDZlM2UxNCIsIm5hbWUiOiJhZG1pbiIsImV4cCI6MTU1NTM5NjMxMDMwNCwiaWF0IjoxNTU0NzkxNTEwfQ.XfQ-TELRh7dw_cZDGlVWeGHCf7YL8sCNYdz2L6G6Opk", "userInfo": { "ID": "29f0c60a-db88-4227-b7c3-62d6f06e3e14", "name": "admin", "access": ["user", "admin"] } });

const OAuth = uni.getStorageSync('OAuth');
OAuth && store.commit("login", OAuth);

export default store
