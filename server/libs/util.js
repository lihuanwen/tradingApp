const fs = require('fs');
const moment = require('moment');
const path = require('path');

const dayFormat = 'YYYY-MM-DD';
const timeFormat = 'YYYY-MM-DD HH:mm:ss';

/**
 * 时间转字符串
 * @param {date} date 时间对象
 * @param {string} format 格式 默认'YYYY-MM-DD HH:mm:ss'
 */
const _dateFormat = (date = new Date(), format = timeFormat) => {
  return moment(date).format(format);
};

/**
 * 一天之前字符串
 * @param {date} date 时间对象
 * @param {string} format 格式 默认'YYYY-MM-DD'
 */
const _dayBefore = (date = new Date(), format = dayFormat) => {
  return _dateFormat(moment(date).add(-1, 'day'), format);
};

/**
 * 今天日期字符串
 * @param {string} format 格式 默认'YYYY-MM-DD'
 */
const _dayNow = (format = dayFormat) => {
  return _dateFormat(new Date(), format);
};

/**
 * 明天字符串
 * @param {date} date 时间对象
 * @param {string} format 格式 默认'YYYY-MM-DD'
 */
const _dayNext = (date = new Date(), format = dayFormat) => {
  return _dateFormat(moment(date).add(+1, 'day'), format);
};

/**
 * 时间戳转字符串
 * @param {date} timeStamp 时间戳
 * @param {string} format 格式 默认'YYYY-MM-DD HH:mm:ss'
 */
const _timeStampToDate = (timeStamp, format = timeFormat) => {
  return moment(new Date(timeStamp * 1000)).format(format);
};

/**
 * 睡眠
 * @param {number} ms 毫秒
 */
const _sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const _mkdirs = dirpath => {
  if (fs.existsSync(dirpath)) {
    return true;
  } else {
    if (_mkdirs(path.dirname(dirpath))) {
      fs.mkdirSync(dirpath);
      return true;
    }
  }
};

const _split_array = (arr, len) => {
  let result = [];
  for (let i = 0; i < arr.length; i += len) {
    result.push(arr.slice(i, i + len));
  }
  return result;
};

const _profitMargin = {
  day(data) {
    return data.map(item => {
      return item.toFixed(2);
    });
  },
  week(data) {
    let weekTotal = 0;
    return data.map((item, index) => {
      weekTotal += item;
      let day = index + 1;
      // 小于7天继续相加
      if (day < 7) return (item * 365).toFixed(2);

      // 之后每天减去第一天
      if (day !== 7) {
        weekTotal -= data[index - 7];
      }
      return ((weekTotal / 7) * 365).toFixed(2);
    });
  },
  year(data) {
    let total = 0;
    let day = 0;
    return data.map((item, index) => {
      total += item;
      if (total !== 0) {
        day += 1;
      }
      if (index) {
        return ((total / day) * 365).toFixed(2);
      } else {
        return (total * 365).toFixed(2);
      }
    });
  }
};

/**
 * 生成[n,m]的随机整数
 * @param {number} min 最小
 * @param {number} max 最大
 * @param {number} decimals 小数位数 默认 0
 */
const _randomNum = (min, max, decimals = 0) => {
  return Number((Math.random() * (min - max) + max).toFixed(decimals));
};

module.exports = {
  _dateFormat,
  _dayBefore,
  _dayNow,
  _dayNext,
  _timeStampToDate,
  _sleep,
  _mkdirs,
  _split_array,
  _profitMargin,
  _randomNum
};
