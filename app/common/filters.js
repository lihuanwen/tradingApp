/**
 * 性别
 * @param {number} type 
 */
export function $sex(type = 0) {
  switch (type) {
    case 0:
      return '保密'
      break;
    case 1:
      return '男'
      break;
    case 2:
      return '女'
      break;
    default:
      return '未知'
      break;
  }
};

/**
 * 阿拉伯数字转换为简写汉字
 * @param {number} Num 
 */
export function $arabiaToSimplifiedChinese(Num) {
  const l = function (int) {
    switch (int) {
      case 1:
        return "一";
        break;
      case 2:
        return "二";
        break;
      case 3:
        return "三";
        break;
      case 4:
        return "四";
        break;
      case 5:
        return "五";
        break;
      case 6:
        return "六";
        break;
      case 7:
        return "七";
        break;
      case 8:
        return "八";
        break;
      case 9:
        return "九";
        break;
      case 0:
        return "零";
        break;
    }
  }
  const v = String(Num);
  let n = []
  v.split("").forEach(item => {
    n.push(l(item))
  })
  return n.join();
}

/**
 * 支付方式
 * @param {number} type 
 */
export function $payType(type) {
  switch (type) {
    case 10:
      return '微信支付'
      break;
    case 20:
      return '余额支付'
      break;
    case 30:
      return '支付宝'
      break;
    default:
      return '未支付'
      break;
  }
}

/**
 * 距离换算
 * @param {number} distance 
 */
export function $distance(distance = 0) {
  if (distance < 1000) {
    return `${parseInt(distance)}米`;
  } else {
    return (Math.round(distance / 100) / 10).toFixed(1) + "公里"
  }
}

/**
 * 基础订单状态
 * @param {number} type 
 */
export function $orderState(type) {
  //-1/支付取消 0/等待支付 1/待确认 2/已确认-待处理 3/取消中-待处理 4/已确认-已处理 5/已取消-已处理)
  switch (type) {
    case -1:
      return '已失效'
      break;
    case 0:
      return '待支付'
      break;
    case 1:
      return '确认中'
      break;
    case 2:
      return '确认中'
      break;
    case 3:
      return '取消中'
      break;
    case 4:
      return '已确认'
      break;
    case 5:
      return '已取消'
      break;
    case 10:
      return '已拒绝'
      break;
    case 30:
      return '取消中'
      break;
    default:
      return '未知'
      break;
  }
}

/**
 * 退款状态
 * @param {number} type 
 */
export function $refundState(type) {
  switch (type) {
    case 0:
      return '无退款'
      break;
    case 100:
      return '待确认'
      break;
    case 101:
      return '已拒绝'
      break;
    case 103:
      return '已审核'
      break;
    case 105:
      return '退款中'
      break;
    case 106:
      return '已退款'
      break;
    default:
      return '未知'
      break;
  }
}

/**
 * 提现方式
 * @param {number} type 
 */
export function $withdrawalsType(type) {
  switch (type) {
    case 0:
      return '余额'
      break;
    case 1:
      return '微信'
      break;
    case 2:
      return '银行卡'
      break;
    default:
      return '未知'
      break;
  }
}

/**
 * 去掉小数点
 * @param {number} price 
 */
export function $mathCeil(price) {
  if (Number(price)) {
    return Math.ceil(price) //进位，不要小数
  } else {
    return "-"
  }
}