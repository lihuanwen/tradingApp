
const router = require('koa-router')();

const db = require('../db/mysql');
const validate = require('../libs/validate');
const { getExchange } = require('../models/exchange');

const coin = require('../models/coin');

// router.all('*', async (ctx, next) => {
//   // ctx.redirect('/sign-in');
//   const query = { ...ctx.request.body, ...ctx.query };
//   validate(query,
//     {
//       ID: { type: 'int', required: true },
//     }
//   );
//   // const { user } = ctx.state;
//   await next();
// });

// 查询交易对
router.all('/symbols', async ctx => {
  const query = { ...ctx.request.body, ...ctx.query };
  validate(query,
    {
      ID: { type: 'int', required: true },
    }
  );

  const exchange = await getExchange(query.ID);

  ctx.state.data = { data: exchange.symbols };
});

// 查询交易对数据
router.all('/markets', async ctx => {
  const query = { ...ctx.request.body, ...ctx.query };
  validate(query,
    {
      ID: { type: 'int', required: true },
    }
  );
  const exchange = await getExchange(query.ID);

  ctx.state.data = { data: exchange.markets };
});

// 查询交易对行情
router.all('/tickers', async ctx => {
  const query = { ...ctx.request.body, ...ctx.query };
  validate(query,
    {
      ID: { type: 'int', required: true },
    }
  );
  const exchange = await getExchange(query.ID);

  if (query.symbol) {
    ctx.state.data = { data: await exchange.fetchTicker(query.symbol) };
  } else {
    ctx.state.data = { data: await exchange.fetchTickers() };
  }
});

// 查询余额
router.all('/balance', async ctx => {
  const query = { ...ctx.request.body, ...ctx.query };
  if (query.ID) {
    const exchange = await getExchange(query.ID);
    ctx.state.data = { data: await exchange.fetchBalance() };
  } else {
    const { user } = ctx.state;

    let data = {
      info: {
        free: 0,
        used: 0,
        total: 0
      },
      detail: [],
    };
    const eachBalance = (markets, balance) => {
      let temp = {
        info: {
          free: 0,
          used: 0,
          total: 0
        },
        detail: [],
        err: []
      };

      for (const key in balance) {
        if (balance.hasOwnProperty(key)) {
          const item = balance[key];
          if (item.total) {
            if (coin.data[key]) {
              const { price_cny } = coin.data[key];
              let { free, used, total } = item;

              total = total * price_cny;
              free = free * price_cny;
              used = used * price_cny;

              if (total > 0.1) {
                data.info.free += free;
                data.info.used += used;
                data.info.total += total;

                temp.info.free += Number(free.toFixed(4));
                temp.info.used += Number(used.toFixed(4));
                temp.info.total += Number(total.toFixed(4));
                temp.detail.push({
                  asset: key,
                  totalCNY: Number(total.toFixed(4)),
                  free: Number(item.free.toFixed(4)),
                  used: Number(item.used.toFixed(4)),
                  total: Number(item.total.toFixed(4))
                });
              }
            } else {
              temp.err.push(key + ':' + item.total);
            }
          }
        }
      }
      temp.info.free = Number(temp.info.free.toFixed(4));
      temp.info.used = Number(temp.info.used.toFixed(4));
      temp.info.total = Number(temp.info.total.toFixed(4));
      return temp;
    };

    const marketConfigList = await db._page({
      select: `
      marketConfig.ID, marketConfig.marketID, marketConfig.createTime, marketConfig.note, marketConfig.state,
        market.market AS market
      `,
      table: 'marketConfig',
      where: `WHERE marketConfig.userID = '${user.ID}' AND marketConfig.state = 1`,
      join: `
        JOIN market ON market.ID = marketConfig.marketID
      `,
    });
    for (const item of marketConfigList.rows) {
      const exchange = await getExchange(item.ID);

      const markets = exchange.markets;
      const balance = await exchange.fetchBalance();

      data.detail.push({
        market: item.market,
        note: item.note,
        ...eachBalance(markets, balance)
      });
    }

    data.info.free = Number(data.info.free.toFixed(4));
    data.info.used = Number(data.info.used.toFixed(4));
    data.info.total = Number(data.info.total.toFixed(4));
    ctx.state.data = { data };
  }
});

// 查询订单
router.all('/fetchOrder', async ctx => {
  // symbol: btc_usdt 交易对
  // startDateMillis: 1551110400000  开始时间戳
  // endDateMillis: 1551542399999 结束时间戳
  // hiddenCancel: 0 隐藏以取消
  // side: 0
  // systemType: -1
  // isHistory: true
  // page: 1
  // perPage: 20
  // entrustType: history

  // {
  //   'id':                '12345-67890:09876/54321', // string
  //   'datetime':          '2017-08-17 12:42:48.000', // ISO8601 datetime of 'timestamp' with milliseconds
  //   'timestamp':          1502962946216, // order placing/opening Unix timestamp in milliseconds
  //   'lastTradeTimestamp': 1502962956216, // Unix timestamp of the most recent trade on this order
  //   'status':     'open',         // 'open', 'closed', 'canceled'
  //   'symbol':     'ETH/BTC',      // symbol
  //   'type':       'limit',        // 'market', 'limit'
  //   'side':       'buy',          // 'buy', 'sell'
  //   'price':       0.06917684,    // float price in quote currency
  //   'amount':      1.5,           // ordered amount of base currency
  //   'filled':      1.1,           // filled amount of base currency
  //   'remaining':   0.4,           // remaining amount to fill
  //   'cost':        0.076094524,   // 'filled' * 'price' (filling price used where available)
  //   'trades':    [ ... ],         // a list of order trades/executions
  //   'fee': {                      // fee info, if available
  //       'currency': 'BTC',        // which currency the fee is (usually quote)
  //       'cost': 0.0009,           // the fee amount in that currency
  //       'rate': 0.002,            // the fee rate (if available)
  //   },
  //   'info': { ... },              // the original unparsed order structure as is
  // }
  const query = { ...ctx.request.body, ...ctx.query };
  const exchange = await getExchange(query.ID);

  /**
   * 获取指定交易所的成交历史记录
   * @param {*} symbol 交易对
   * @param {*} startDateMillis 开始时间
   * @param {*} endDateMillis 结束时间
   */
  const fetchOrders = async (symbol, startDateMillis, endDateMillis) => {
    let allTrades = await exchange.fetchOrders(symbol);
    return allTrades;

    // let since = exchange.milliseconds() - 86400000; // -1 day from now
    // while (since < exchange.milliseconds()) {
    //   const limit = 20;
    //   const trades = await exchange.fetchOrders(symbol, since, limit);
    //   if (trades.length) {
    //     since = trades[trades.length - 1];
    //     allTrades.push(trades);
    //   } else {
    //     break;
    //   }
    // }

    // let page = 0;
    // const since = null;
    // const limit = 20;
    // const params = {
    //   'page': page,
    // };
    // while (true) {
    //   const orders = await exchange.fetchOrders(symbol, since, limit, params);
    //   if (orders.length) {
    //     page = exchange.last_json_response['cursor'];
    //     allTrades.push(orders);
    //   } else {
    //     break;
    //   }
    // }
  };

  /**
   * 获取交易所全部交易记录
   * @param {*} markets 交易对数组
   */
  const fetchAllSymbolOrders = async (markets, orderType) => {
    let Orders = null;
    let allOrders = [];
    for (const symbol of Object.keys(markets)) {
      console.log(symbol);
      switch (orderType) {
        case 'open':
          Orders = await exchange.fetchOpenOrders(query.symbol);
          break;
        case 'closed':
          Orders = await exchange.fetchClosedOrders(query.symbol);
          break;
        default:
          Orders = await fetchOrders(symbol);
          break;
      }
      if (Orders.length) {
        allOrders.push(...Orders);
      }
    }
    return allOrders;
  };


  let data = null;
  if (query.symbol) {
    switch (query.orderType) {
      case 'open':
        data = await exchange.fetchOpenOrders(query.symbol);
        break;
      case 'closed':
        data = await exchange.fetchClosedOrders(query.symbol);
        break;
      default:
        data = await exchange.fetchOrders(query.symbol);
        break;
    }
  } else {
    data = await fetchAllSymbolOrders(exchange.markets, query.orderType);
  }
  // fetchOrder (id, symbol, [params])
  // fetchOrders (symbol, since, limit, [params])
  // fetchOpenOrders (symbol, since, limit, [params])
  // fetchClosedOrders (symbol, since, limit, [params])
  // fetchMyTrades (symbol, since, limit, [params])
  ctx.state.data = { data };
});

// 创建订单
router.all('/createOrder', async ctx => {
  const query = { ...ctx.request.body, ...ctx.query };
  validate(query,
    {
      symbol: { type: 'string', required: true },
      type: ['limit', 'market'],
      side: ['sell', 'buy'],
      amount: { type: 'string', required: true },
      price: { type: 'string', required: true },
    }
  );
  const exchange = await getExchange(query.ID);
  // const params = {
  //   'stopPrice': 123.45,
  //   'type': 'stopLimit',
  // };
  const order = await exchange.createOrder(query.symbol, query.type, query.side, query.amount, query.price, query.params);
  ctx.state.data = { data: order };
  // createOrder (symbol, type, side, amount, price,[params])
  // createMarketBuyOrder (symbol, amount ,[params])
  // createMarketSellOrder (symbol, amount ,[params])
  // createLimitBuyOrder (symbol, amount, price ,[params])
  // createLimitSellOrder (symbol, amount, price ,[params])
});

// 取消订单
router.all('/cancelOrder', async ctx => {
  const query = { ...ctx.request.body, ...ctx.query };
  validate(query,
    {
      orderID: { type: 'string', required: true },
      symbol: { type: 'string', required: true },
    }
  );

  const exchange = await getExchange(query.ID);
  // cancelOrder (id, symbol, params)
  let msg = await exchange.cancelOrder(query.orderID, query.symbol);
  ctx.state.data = { data: msg };
});

// 存款地址查询
router.all('/deposit', async ctx => {
  const query = { ...ctx.request.body, ...ctx.query };
  const exchange = await getExchange(query.ID);

  exchange.has['fetchDepositAddress'];
  exchange.has['createDepositAddress'];
  fetchDepositAddress(code, params = {}); // 获取单个存款地址
  createDepositAddress(code, params = {}); // 创建一个存款地址
  fetchDepositAddresses(codes = undefined, params = {}); // 获取全部币种存款地址
  // {
  //   'currency': currency, // currency code
  //   'address': address,   // address in terms of requested currency
  //   'tag': tag,           // tag / memo / paymentId for particular currencies (XRP, XMR, ...)
  //   'info': response,     // raw unparsed data as returned from the exchange
  // }
  ctx.state.data = {};
});

// 转出
router.all('/withdraw', async ctx => {
  const query = { ...ctx.request.body, ...ctx.query };
  const exchange = await getExchange(query.ID);

  exchange.withdraw(code, amount, address, tag = undefined, params = {});
  // {
  //   'info' { ... },      // unparsed reply from the exchange, as is
  //   'id': '12345567890', // string withdrawal id, if any
  // }
  ctx.state.data = {};
});

// 转出
router.all('/transaction', async ctx => {
  const query = { ...ctx.request.body, ...ctx.query };
  const exchange = await getExchange(query.ID);

  const deposits = await exchange.fetchDeposits(code, since, limit, params);  // 查询存款
  const withdrawals = await exchange.fetchWithdrawals(code, since, limit, params); // 查询取款

  if (exchange.has['fetchTransactions']) {
    const transactions = await exchange.fetchTransactions(code, since, limit, params); // 查询存取款
  } else {
    throw new Error(exchange.id + ' does not have the fetchTransactions method');
  }
  // {
  //   'info':      { ... },    // the JSON response from the exchange as is
  //   'id':       '123456',    // exchange-specific transaction id, string
  //   'txid':     '0x68bfb29821c50ca35ef3762f887fd3211e4405aba1a94e448a4f218b850358f0',
  //   'timestamp': 1534081184515,             // timestamp in milliseconds
  //   'datetime': '2018-08-12T13:39:44.515Z', // ISO8601 string of the timestamp
  //   'addressFrom': '0x38b1F8644ED1Dbd5DcAedb3610301Bf5fa640D6f', // sender
  //   'address':  '0x02b0a9b7b4cDe774af0f8e47cb4f1c2ccdEa0806', // "from" or "to"
  //   'addressTo': '0x304C68D441EF7EB0E2c056E836E8293BD28F8129', // receiver
  //   'tagFrom', '0xabcdef', // "tag" or "memo" or "payment_id" associated with the sender
  //   'tag':      '0xabcdef' // "tag" or "memo" or "payment_id" associated with the address
  //   'tagTo': '0xhijgklmn', // "tag" or "memo" or "payment_id" associated with the receiver
  //   'type':     'deposit',   // or 'withdrawal', string
  //   'amount':    1.2345,     // float (does not include the fee)
  //   'currency': 'ETH',       // a common unified currency code, string
  //   'status':   'pending',   // 'ok', 'failed', 'canceled', string
  //   'updated':   undefined,  // UTC timestamp of most recent status change in ms
  //   'comment':  'a comment or message defined by the user if any',
  //   'fee': {                 // the entire fee structure may be undefined
  //       'currency': 'ETH',   // a unified fee currency code
  //       'cost': 0.1234,      // float
  //       'rate': undefined,   // approximately, fee['cost'] / amount, float
  //   },
  // }
  ctx.state.data = {};
});

// 查询交易，提现手续费
router.all('/fees', async ctx => {
  const query = { ...ctx.request.body, ...ctx.query };
  const exchange = await getExchange(query.ID);

  // calculateFee(symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) //计算交易费用
  // fetchFees(params = {})
  // fetchTradingFees(params = {})
  // fetchFundingFees(params = {})

  //   {
  //     'type': takerOrMaker,
  //     'currency': 'BTC', // the unified fee currency code
  //     'rate': percentage, // the fee rate, 0.05% = 0.0005, 1% = 0.01, ...
  //     'cost': feePaid, // the fee cost (amount * fee rate)
  //    }
  ctx.state.data = {};
});

module.exports = router;