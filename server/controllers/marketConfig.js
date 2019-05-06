
const router = require('koa-router')();

const db = require('../db/mysql');
const validate = require('../libs/validate');
const crypto = require('../models/crypto');
const CCXT = require('ccxt');

router.post('/list', async ctx => {
  const query = { ...ctx.request.body, ...ctx.query };
  const { user } = ctx.state;

  const data = await db._page({
    select: `
    marketConfig.ID, marketConfig.marketID, marketConfig.createTime, marketConfig.note, marketConfig.state,
      market.market AS market
    `,
    table: 'marketConfig',
    where: `WHERE marketConfig.userID = '${user.ID}' ${query.state && query.state.length ? ` AND marketConfig.state IN (${query.state.join()})` : ''}`,
    join: `
      JOIN market ON market.ID = marketConfig.marketID
    `,
    pageIndex: query.pageIndex,
    pageSize: query.pageSize
  });
  ctx.state.data = { data };
});

router.post('/validate', async ctx => {
  const query = { ...ctx.request.body, ...ctx.query };

  validate(query,
    {
      marketID: { type: 'int', required: true },
      OAuth: {
        type: 'object', required: true,
        rule: {
          apiKey: { type: 'string', required: true },
          secret: { type: 'string', required: true },
          // userName: { type: 'string', required: true },
          // password: { type: 'string', required: true },
        }
      },
    }
  );

  const market = await db._findOne(`SELECT market from market WHERE ID=${query.marketID}`);

  // 验证api的权限。
  const exchange = new CCXT[market.market]({
    apiKey: query.OAuth.apiKey,
    secret: query.OAuth.secret,
    // uid: null,
    password: query.OAuth.password,
    enableRateLimit: true, // enable built-in rate limiting upon instantiation of the exchange
  });
  // exchange.agent =
  //   exchange.httpAgent =
  //   exchange.httpsAgent =
  //   new ProxyAgent('socks://127.0.0.1:1086');
  await exchange.loadMarkets();

  // 拥有查询权限
  try {
    const balance = await exchange.fetchBalance();
  } catch (error) {
    throw new Error('API没有查询权限');
  }
  // 拥有交易权限
  try {
    // 创建一个不可能成功的订单，通过返回的信息判断是否拥有交易权限。
    const order = await exchange.createOrder('BTC/USDT', 'limit', 'sell', 1000, 9999999999999);
  } catch (error) {
    if (!error.message.search(/trade account balance is not enough/i)) {
      throw new Error('API没有交易权限');
    }
  }
  // 拥有提币权限
  // try {
  //   // 创建一个不可能成功的提现，通过返回的信息判断是否拥有提现权限。
  //   const withdraw = await exchange.withdraw('USDT', 1000000, 'address');
  // } catch (error) {
  //   if (error.message.search(/trade account balance is not enough/i)) {
  //     message.withdraw = true;
  //   }
  // }
  ctx.state.data = {};
});

router.post('/edit', async ctx => {
  const query = { ...ctx.request.body, ...ctx.query };

  validate(query,
    {
      marketID: { type: 'int', required: true },
      OAuth: { type: 'object', required: true, },
    }
  );

  const { user } = ctx.state;
  let message;
  if (query.ID) {
    message = await db._query(
      `UPDATE marketConfig SET 
        userID=? ,
        marketID=? ,
        note=? ,
        OAuth=? ,
        state=?
        WHERE ID=? `,
      [
        user.ID,
        query.marketID,
        query.note,
        crypto.OAuth.encrypt(JSON.stringify(query.OAuth)),
        query.state,
        query.ID
      ]
    );
  } else {
    message = await db._query(`
      INSERT INTO marketConfig SET 
        userID=? ,
        marketID=? ,
        note=? ,
        OAuth=? ,
        state=?
        createTime=?`,
    [
      user.ID,
      query.marketID,
      query.note,
      crypto.OAuth.encrypt(JSON.stringify(query.OAuth)),
      query.state,
      new Date()
    ]
    );
  }
  ctx.state.data = { message };
});

router.post('/stateUpDate', async ctx => {
  const query = { ...ctx.request.body, ...ctx.query };

  validate(query,
    {
      ID: { type: 'int', required: true },
      state: [0, 1],
    }
  );

  const { user } = ctx.state;
  const message = await db._query(
    `UPDATE marketConfig SET 
      state=?
      WHERE userID=? AND ID=? `,
    [
      query.state,
      user.ID,
      query.ID
    ]
  );
  ctx.state.data = { message };
});

router.post('/del', async ctx => {
  // throw new Error('删除功能已停用');
  const query = { ...ctx.request.body, ...ctx.query };
  const message = await db._query(`DELETE FROM marketConfig WHERE ID IN (${query.ID.join()})`);
  // const message = await db._query(`UPDATE marketConfig SET state=0 WHERE ID IN ("${query.IDs.join()}")`);
  ctx.state.data = { message };
});

module.exports = router;