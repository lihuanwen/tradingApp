import store from "@/store/index";

export default {
	config: {
		url: '',
		data: {},
		header: {
			'Content-Type': 'application/json;charset=UTF-8'
		},
		method: "GET",
		dataType: "json",  // 如设为json，会对返回的数据做一次 JSON.parse
		responseType: "text",
		success() { },
		fail() { },
		complete() { }
	},
	async request(config) {
		return new Promise((resolve, reject) => {
			let _config = Object.assign({}, this.config, config)
			if (store.state.token) {
				_config.header['authorization'] = 'Bearer ' + store.state.token;
			}

			_config.success = res => {
				const { data, errMsg, header, statusCode } = res;
				switch (statusCode) {
					case 200:
						if (data.success) {
							resolve(data.data);
						} else {
							reject({ type: 'controller', err: data.error, msg: data.message ? data.message : '遇到未知错误，请稍后重试。' })
						}
						break;
					case 401:
					case 402:
						store.dispatch('handleLogOut');
						reject({ type: 'OAuth', msg: '当前操作需要授权' })
						uni.showModal({
							title: "未登录",
							content: "您未登录，需要登录后才能继续",
							showCancel: false,
							success: res => {
								if (res.confirm) {
									uni.navigateTo({
										url: "/pages/OAuth/login"
									});
								}
							}
						});
						break;
					default:
						reject({ type: 'controller', err: data.error, msg: data.message ? data.message : '遇到未知错误，请稍后重试。' })
						break;
				}
			}
			_config.fail = err => {
				let msg = '请求失败'
				switch (err.errMsg) {
					case 'request:fail':
						msg = '连接服务器失败'
						break;
					default:
						break;
				}
				reject({ type: 'server', err, msg })
			}

			uni.request(_config);
		});
	},
	get(url, data) {
		return this.request({ url, data, method: 'GET' })
	},
	post(url, data) {
		return this.request({ url, data, method: 'POST' })
	},
	put(url, data) {
		return this.request({ url, data, method: 'PUT' })
	},
	delete(url, data) {
		return this.request({ url, data, method: 'DELETE' })
	}
}
