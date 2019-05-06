import moment from 'moment'

const dayFormat = 'YYYY-MM-DD';
const timeFormat = 'YYYY-MM-DD HH:mm:ss';

const util = {
	/**
	 * 时间转字符串
	 * @param {date} date 时间对象
	 * @param {string} format 格式 默认'YYYY-MM-DD HH:mm:ss'
	 */
	_dateFormat(date = new Date(), format = timeFormat) {
		return moment(date).format(format);
	},
	/**
	 * 一天之前字符串
	 * @param {date} date 时间对象
	 * @param {string} format 格式 默认'YYYY-MM-DD'
	 */
	_dayBefore(date = new Date(), format = dayFormat) {
		return _dateFormat(moment(date).add(-1, 'day'), format);
	},
	/**
	 * 今天日期字符串
	 * @param {string} format 格式 默认'YYYY-MM-DD'
	 */
	_dayNow(format = dayFormat) {
		return _dateFormat(new Date(), format);
	},
	/**
	 * 明天字符串
	 * @param {date} date 时间对象
	 * @param {string} format 格式 默认'YYYY-MM-DD'
	 */
	_dayNext(date = new Date(), format = dayFormat) {
		return _dateFormat(moment(date).add(+1, 'day'), format);
	},
	/**
	 * 时间戳转字符串
	 * @param {number} timeStamp 时间戳
	 * @param {string} format 格式 默认'YYYY-MM-DD HH:mm:ss'
	 */
	_timeStampToDate(timeStamp, format = timeFormat) {
		return moment(new Date(timeStamp * 1000)).format(format);
	},
	// _timeAgo(str = null) {
	// 	let date = new Date(str)
	// 	const time = new Date().getTime() - date.getTime() 
	// 	if (time < 0) {
	// 		return ''
	// 	} else if ((time / 1000 < 30)) {
	// 		return '刚刚'
	// 	} else if (time / 1000 < 60) {
	// 		return parseInt((time / 1000)) + '秒前'
	// 	} else if ((time / 60000) < 60) {
	// 		return parseInt((time / 60000)) + '分钟前'
	// 	} else if ((time / 3600000) < 24) {
	// 		return parseInt(time / 3600000) + '小时前'
	// 	} else if ((time / 86400000) < 31) {
	// 		return parseInt(time / 86400000) + '天前'
	// 	} else if ((time / 2592000000) < 12) {
	// 		return parseInt(time / 2592000000) + '月前'
	// 	} else {
	// 		return parseInt(time / 31536000000) + '年前'
	// 	}
	// },
	/**
	 * 睡眠
	 * @param {number} ms 毫秒
	 */
	_sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	},
	/**
	 * 生成[min,max]的随机数
	 * @param {number} min 最小
	 * @param {number} max 最大
	 * @param {number} decimals 小数位数 默认 0
	 */
	_randomNum(min, max, decimals = 0) {
		// return Math.floor(Math.random() * (max - min + 1) + min)
		return Number((Math.random() * (min - max) + max).toFixed(decimals));
	},
	/**
	 * 用于分割数字，默认为3位分割，一般用于格式化金额
	 * @param {number} source 要分割的数字
	 * @param {number} length 分割位数
	 */
	_numberComma(source = 0, length = 3) {
		source = String(source).split(".");
		source[0] = source[0].replace(new RegExp('(\\d)(?=(\\d{' + length + '})+$)', 'ig'), "$1,");
		return source.join(".");
	}
}

export default util;
