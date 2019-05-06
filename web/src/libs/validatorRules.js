import moment from 'moment';

let Validator = function(allSatisfy) {
  this.cache = [];
  this.allSatisfy = allSatisfy;
};
Validator.prototype.add = function(value, rules) {
  let that = this;
  rules.forEach(function(item) {
    (function(rule) {
      let errorMsg = rule.errorMsg;
      let arr = [];
      arr.push(value, errorMsg);
      Object.keys(rule)
        .slice(2)
        .forEach(function(item) {
          arr.push(rule[item]);
        });
      that.cache.push(function() {
        return strategies[rule.strategy].apply(null, arr);
      });
    })(item);
  });
};
Validator.prototype.start = function() {
  let len = this.cache.length;
  let errorMsg = '';
  if (this.allSatisfy) {
    for (let i = 0; i < len; i++) {
      errorMsg = this.cache[i]();
      if (errorMsg) {
        return errorMsg;
      }
    }
    return errorMsg;
  } else {
    for (let i = 0; i < len; i++) {
      let msg = this.cache[i]();
      if (msg) {
        !errorMsg && (errorMsg = msg);
      } else {
        return '';
      }
    }
    return errorMsg;
  }
};

function validateFunc(rules, allSatisfy) {
  return function(rule, value, callback) {
    let v = new Validator(allSatisfy);
    v.add(value, rules);
    let errorMsg = v.start();
    if (errorMsg) {
      return callback(new Error(errorMsg));
    } else {
      callback();
    }
  };
}
/*
  *
  * 定义验证规则
  * */
let strategies = {
  notEmpty: function(value, msg) {
    let reg = /^\s+|\s+$/g;
    if (!value || !value.toString().replace(reg, '').length) {
      return msg;
    }
  },
  empty(value, msg) {
    if (value) {
      return msg;
    }
  },
  length: function(value, msg, minLength, maxLength) {
    if (
      value.toString().length > maxLength ||
      value.toString().length < minLength
    ) {
      return msg;
    }
  },
  checkAllTextValid: function(val, msg) {
    let pattern = new RegExp(
      "[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]"
    );
    if (pattern.test(val)) {
      return msg;
    }
  },
  positiveInteger: function(val, msg) {
    let pattern = new RegExp('^[0-9]*[1-9][0-9]*$');
    if (!pattern.test(val)) {
      return msg;
    }
  },
  positiveInteger2: function(val, msg) {
    let pattern = new RegExp('^[0-9]*[1-9][0-9]*$');
    if (val == null) {
      val = '';
    }
    if (val.length !== 0) {
      if (!pattern.test(val)) {
        return msg;
      }
    }
  },
  date: function(strValue, msg) {
    /* eslint-disable */
    var objRegExp = /^\d{4}(\-|\/|\.)\d{1,2}\1\d{1,2}$/
    if (!objRegExp.test(strValue)) {
      return msg
    }
  },
  dateAndTime(strValue, msg) {
    /* eslint-disable */
    let reg = /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s+(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/,
      time = moment(strValue).format('YYYY-MM-DD HH:mm:ss')
    if (!reg.test(time)) {
      return msg
    }
  },
  isIdCard: function(val, msg) {
    var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    if (reg.test(val) === false) {
      return msg
    }
  },
  phoneNum: function(val, msg) {
    if (!/^1[34578]\d{9}$/.test(val)) {
      return msg
    }
  },
  // 小数
  decimal(val, msg) {
    let reg = /^\d+(\.\d+)?$/
    if (!reg.test(val)) {
      return msg
    }
  },
  // 百分比
  percent(val, msg) {
    let reg = /^100$|^(\d|[1-9]\d)(\.\d+)*$/
    if (!reg.test(val)) return msg
  },
  // 中文汉字
  chinese(val, msg) {
    let reg = /^[\u4e00-\u9fa5]$/
    // console.log(typeof val);
    if (!val) return msg
    let bool = val.split('').every(char => reg.test(char))
    if (!bool) return msg
  },
  // 邮箱
  email(val, msg) {
    let reg = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/
    if (!reg.test(val)) return msg
  },
  //  正数
  positiveNumber(val, msg) {
    let valNum = Number(val)
    if (!valNum || valNum < 0) {
      return msg
    }
  },
  // 排序 1-999
  tsortRange(val, msg) {
    // 正整数
    let pattern = new RegExp('^[0-9]*[1-9][0-9]*$')
    if (pattern.test(val)) {
      if (val > 999 || val <= 0) {
        return msg
      }
    } else {
      return msg
    }
  }
}
let rules = {
  // 不为空
  notNull: {
    strategy: 'notEmpty',
    errorMsg: '不能为空'
  },
  // 为空
  isNull: {
    strategy: 'empty',
    errorMsg: '为空'
  },
  // 长度为3到8位
  length: {
    strategy: 'length',
    errorMsg: '长度必须在3-8之间',
    minLength: 3,
    maxLength: 8
  },
  // 特殊字符
  specialText: {
    strategy: 'checkAllTextValid',
    errorMsg: '不能使用特殊字符'
  },
  // 正整数
  posNumber: {
    strategy: 'positiveInteger',
    errorMsg: '只能为正整数'
  },
  //  正数
  positiveNumber: {
    strategy: 'positiveNumber',
    errorMsg: '只能为正数'
  },
  // 日期类型
  date: {
    strategy: 'date',
    errorMsg: '不正确'
  },
  // 日期类型 yy-mm-dd hh:mm:ss
  dateAndTime: {
    strategy: 'dateAndTime',
    errorMsg: '格式不正确'
  },
  // 身份证
  idCard: {
    strategy: 'isIdCard',
    errorMsg: '不正确'
  },
  // 电话号码
  phone: {
    strategy: 'phoneNum',
    errorMsg: '不正确'
  },
  // 小数
  decimal: {
    strategy: 'decimal',
    errorMsg: '只能为数字类型'
  },
  // 百分比
  percent: {
    strategy: 'percent',
    errorMsg: '为0-100的百分数'
  },
  // 中文
  chinese: {
    strategy: 'chinese',
    errorMsg: '只能为中文'
  },
  // 邮箱
  email: {
    strategy: 'email',
    errorMsg: '格式不正确'
  },
  tsortRange: {
    strategy: 'tsortRange',
    errorMsg: '1-999以内的整数'
  }
}
/*
  * 调用,请按顺序添加规则
  * */
// 必填项
// 不为空
let notNull = validateFunc([rules.notNull], true)
// 输入的长度为3-8位
let length_NotNull = validateFunc([rules.notNull, rules.length], true)
//特殊字符
let specialText_NotNull = validateFunc([rules.notNull, rules.specialText], true)
//数字类型的 -- 正整数
let posNumber_NotNull = validateFunc([rules.notNull, rules.posNumber], true)
//date类型 精确到日
let date_NotNull = validateFunc([rules.notNull, rules.date], true)
// date 时分秒
let dateAndTime_NotNull = validateFunc([rules.notNull, rules.dateAndTime], true)
//身份证
let idCard_NotNull = validateFunc([rules.notNull, rules.idCard], true)
// 电话
let mobileNum_NotNull = validateFunc([rules.notNull, rules.phone], true)
// 数字类型 --小数
let decimal_NotNull = validateFunc([rules.notNull, rules.decimal], true)
// 数字类型 --百分比
let percent_NotNull = validateFunc([rules.notNull, rules.percent], true)
// 中文汉字
let chinese_NotNull = validateFunc([rules.notNull, rules.chinese], true)
// 邮箱
let email_NotNull = validateFunc([rules.notNull, rules.email], true)
//  正数
let positiveNumber_NotNull = validateFunc(
  [rules.notNull, rules.positiveNumber],
  true
)
// 1-999
let tsortRange_NotNull = validateFunc([rules.notNull, rules.tsortRange], true)
// 非必填项
// 长度
let length_Null = validateFunc([rules.length, rules.isNull], false)
// 特殊字符
let specialText_Null = validateFunc([rules.specialText, rules.isNull], false)
//数字类型的 -- 正整数
let posNumber_Null = validateFunc([rules.posNumber, rules.isNull], false)
//date类型
let date_Null = validateFunc([rules.date, rules.isNull], false)
//date类型 时分秒
let dateAndTime_Null = validateFunc([rules.dateAndTime, rules.isNull], false)
//身份证
let idCard_Null = validateFunc([rules.idCard, rules.isNull], false)
// 电话
let mobileNum_Null = validateFunc([rules.phone, rules.isNull], false)
// 数字类型 --小数
let decimal_Null = validateFunc([rules.decimal, rules.isNull], false)
// 数字类型 --百分比
let percent_Null = validateFunc([rules.percent, rules.isNull], false)
// 中文汉字
let chinese_Null = validateFunc([rules.chinese, rules.isNull], false)
// 邮箱
let email_Null = validateFunc([rules.email, rules.isNull], false)
//  正数
let positiveNumber_Null = validateFunc(
  [rules.positiveNumber, rules.isNull],
  false
)
// 1-999
let tsortRange_Null = validateFunc([rules.tsortRange, rules.isNull], false)

export default {
  // blur
  // 不能为空 --blur
  notNull_Blur: [
    {
      validator: notNull,
      trigger: 'blur'
    }
  ],
  positiveNumber_NotNull_Blur: [
    {
      validator: positiveNumber_NotNull,
      trigger: 'blur'
    }
  ],
  // 长度不为空，blur-
  length_NotNull_Blur: [
    {
      validator: length_NotNull,
      trigger: 'blur'
    }
  ],
  // 特殊字符串不为空 blur
  specialText_NotNull_Blur: [
    {
      validator: specialText_NotNull,
      trigger: 'blur'
    }
  ],
  // 正整数 不为空 blur
  posNumber_NotNull_Blur: [
    {
      validator: posNumber_NotNull,
      trigger: 'blur'
    }
  ],
  // 日期 不为空 blur
  date_NotNull_Blur: [
    {
      validator: date_NotNull,
      trigger: 'blur'
    }
  ],
  // 日期 精确到时分秒
  dateAndTime_NotNull_Blur: [
    {
      validator: dateAndTime_NotNull,
      trigger: 'blur'
    }
  ],
  // 身份证 不为空 blur
  idCard_NotNull_Blur: [
    {
      validator: idCard_NotNull,
      trigger: 'blur'
    }
  ],
  // 电话 不为空 blur
  mobileNum_NotNull_Blur: [
    {
      validator: mobileNum_NotNull,
      trigger: 'blur'
    }
  ],
  // 小数
  decimal_NotNull_Blur: [
    {
      validator: decimal_NotNull,
      trigger: 'blur'
    }
  ],
  percent_NotNull_Blur: [
    {
      validator: percent_NotNull,
      trigger: 'blur'
    }
  ],
  chinese_NotNull_Blur: [
    {
      validator: chinese_NotNull,
      trigger: 'blur'
    }
  ],
  email_NotNull_Blur: [
    {
      validator: email_NotNull,
      trigger: 'blur'
    }
  ],
  tsortRange_NotNull_Blur: [
    {
      validator: tsortRange_NotNull,
      trigger: 'blur'
    }
  ],
  // 可以为空 --blur
  // 长度 可为空 blur
  length_Null_Blur: [
    {
      validator: length_Null,
      trigger: 'blur'
    }
  ],
  //  正数
  positiveNumber_Null_Blur: [
    {
      validator: positiveNumber_Null,
      trigger: 'blur'
    }
  ],
  // 特殊字符串 可为空 blur
  specialText_Null_Blur: [
    {
      validator: specialText_Null,
      trigger: 'blur'
    }
  ],
  // 整数 可为空 blur
  posNumber_Null_Blur: [
    {
      validator: posNumber_Null,
      trigger: 'blur'
    }
  ],
  // 日期 可为空 blur
  date_Null_Blur: [
    {
      validator: date_Null,
      trigger: 'blur'
    }
  ],
  // 日期 精确到时分秒
  dateAndTime_Null_Blur: [
    {
      validator: dateAndTime_Null,
      trigger: 'blur'
    }
  ],
  // 身份证 可为空 blur
  idCard_Null_Blur: [
    {
      validator: idCard_Null,
      trigger: 'blur'
    }
  ],
  // 电话 可为空 blur
  mobileNum_Null_Blur: [
    {
      validator: mobileNum_Null,
      trigger: 'blur'
    }
  ],
  decimal_Null_Blur: [
    {
      validator: decimal_Null,
      trigger: 'blur'
    }
  ],
  percent_Null_Blur: [
    {
      validator: percent_Null,
      trigger: 'blur'
    }
  ],
  chinese_Null_Blur: [
    {
      validator: chinese_Null,
      trigger: 'blur'
    }
  ],
  email_Null_Blur: [
    {
      validator: email_Null,
      trigger: 'blur'
    }
  ],
  tsortRange_Null_Blur: [
    {
      validator: tsortRange_Null,
      trigger: 'blur'
    }
  ],
  // 不能为空 --change
  // 不为空 change
  notNull_Change: [
    {
      validator: notNull,
      trigger: 'change,blur'
    }
  ],
  //  正数
  positiveNumber_NotNull_Change: [
    {
      validator: positiveNumber_NotNull,
      trigger: 'change,blur'
    }
  ],
  // 长度 不为空 change
  length_NotNull_Change: [
    {
      validator: length_NotNull,
      trigger: 'change,blur'
    }
  ],
  //特殊字符串 不为空 change
  specialText_NotNull_Change: [
    {
      validator: specialText_NotNull,
      trigger: 'change,blur'
    }
  ],
  // 正整数 不为空 change
  posNumber_NotNull_Change: [
    {
      validator: posNumber_NotNull,
      trigger: 'change,blur'
    }
  ],
  // 日期 不为空 change
  date_NotNull_Change: [
    {
      validator: date_NotNull,
      trigger: 'change,blur'
    }
  ],
  dateAndTime_NotNull_Change: [
    {
      validator: dateAndTime_NotNull,
      trigger: 'change,blur'
    }
  ],
  // 身份证 不为空 change
  idCard_NotNull_Change: [
    {
      validator: idCard_NotNull,
      trigger: 'change,blur'
    }
  ],
  // 电话 不为空 change
  mobileNum_NotNull_Change: [
    {
      validator: mobileNum_NotNull,
      trigger: 'change,blur'
    }
  ],
  decimal_NotNull_Change: [
    {
      validator: decimal_NotNull,
      trigger: 'change,blur'
    }
  ],
  percent_NotNull_Change: [
    {
      validator: percent_NotNull,
      trigger: 'change,blur'
    }
  ],
  chinese_NotNull_Change: [
    {
      validator: chinese_NotNull,
      trigger: 'change,blur'
    }
  ],
  email_NotNull_Change: [
    {
      validator: email_NotNull,
      trigger: 'change,blur'
    }
  ],
  tsortRange_NotNull_Change: [
    {
      validator: tsortRange_NotNull,
      trigger: 'change,blur'
    }
  ],
  // 可以为空 --change
  // 长度 可为空 change
  length_Null_Change: [
    {
      validator: length_Null,
      trigger: 'change,blur'
    }
  ],
  //  正数
  positiveNumber_Null_change: [
    {
      validator: positiveNumber_Null,
      trigger: 'blur,change'
    }
  ],
  // 特殊字符串 可为空 change
  specialText_Null_Change: [
    {
      validator: specialText_Null,
      trigger: 'change,blur'
    }
  ],
  // 正整数 可为空 change
  posNumber_Null_Change: [
    {
      validator: posNumber_Null,
      trigger: 'change,blur'
    }
  ],
  // 日期 可为空 change
  date_Null_Change: [
    {
      validator: date_Null,
      trigger: 'change,blur'
    }
  ],
  dateAndTime_Null_Change: [
    {
      validator: dateAndTime_Null,
      trigger: 'change,blur'
    }
  ],
  // 身份证 可为空 change
  idCard_Null_Change: [
    {
      validator: idCard_Null,
      trigger: 'change,blur'
    }
  ],
  // 电话 可为空 change
  mobileNum_Null_Change: [
    {
      validator: mobileNum_Null,
      trigger: 'change,blur'
    }
  ],
  decimal_Null_Change: [
    {
      validator: decimal_Null,
      trigger: 'change,blur'
    }
  ],
  // 百分比
  percent_Null_Change: [
    {
      validator: percent_Null,
      trigger: 'change,blur'
    }
  ],
  // 中文
  chinese_Null_Change: [
    {
      validator: chinese_Null,
      trigger: 'change,blur'
    }
  ],
  // 邮箱
  email_Null_Change: [
    {
      validator: email_Null,
      trigger: 'change,blur'
    }
  ],
  tsortRange_Null_Change: [
    {
      validator: tsortRange_Null,
      trigger: 'change,blur'
    }
  ]
}
