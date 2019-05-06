const db = require('../db/mysql');
const crypto = require('../models/crypto');
// const renderer = require('../models/renderer');

let exchanges = {};
class Market {
  /**
   * 新建交易所对象
   * @param {*} marketName 交易所名称
   * @param {*} OAuth 账号密码
   * @param {*} websocket websocket连接
   */
  constructor(pageName, marketName, OAuth, websocket) {
    this.pageName = pageName;
    this.marketName = marketName;
    this.OAuth = OAuth;
    this.websocket = websocket;

    this.token = null;
  }

  /**
   *登录指定的交易所获取token信息
   */
  async login() {
    //   okex: {
    //     market: 'okex',
    //     account: '13730815703',
    //     passWord: 'qaz123690430'
    //   },
    //   binance: {
    //     market: 'binance',
    //     account: 'lihuanwen1993@gmail.com',
    //     passWord: 'FLMtZxD7397QLeE'
    //   }
    this.token = await renderer.getToken(
      this.pageName,
      this.marketName,
      this.OAuth,
      this.websocket
    );
    console.log(this.token);
    this.websocket.sendJSON({ path: 'end', msg: '获取token成功' });
  }
}

/**
 * 获取交易所对象
 * @param {*} marketConfig 配置
 */
const getExchange = async (marketConfig, websocket) => {
  const market = await db._findOne(`SELECT market from market WHERE ID=${marketConfig.marketID}`);
  const { OAuth } = marketConfig;
  const marketName = `${market.market}:${OAuth.userName}`;

  // 没有就新增
  if (!exchanges[marketName]) {
    exchanges[marketName] = new Market(
      marketName,
      market.market,
      OAuth,
      websocket
    );
  }
  return exchanges[marketName];
};

const use = async (ctx, next) => {
  ctx.websocket.sendJSON = function (data) {
    ctx.websocket.send(JSON.stringify(data));
  };
  ctx.websocket.on('message', function (data) {
    try {
      const query = JSON.parse(data);
      controller(ctx.websocket, query);
    } catch (err) {
      ctx.websocket.send({
        message: err.message,
        error: err.stack,
        success: false
      });
    }
  });
  ctx.websocket.on('error', function (message) {
    console.log(message);
  });
  ctx.websocket.on('close', function (message) {
  });
  return next(ctx);
};

const controller = async (websocket, query) => {
  switch (query.path) {
    case 'auth': {
      const userInfo = crypto.token.decode(query.token);
      websocket.userInfo = userInfo;
    }
      break;
    case 'login': {
      const exchange = await getExchange(query.config, websocket);
      await exchange.login();
    }
      break;
    default:
      throw new Error('无效的请求参数');
  }
};

module.exports = {
  use
};
