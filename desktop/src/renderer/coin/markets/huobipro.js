import Exchange from '../base/Exchange';

export default class huobipro extends Exchange {
  describe() {
    return {
      id: 'huobipro',
      name: 'Huobi Pro',
      urls: {
        socket: 'wss://api.huobi.pro/ws',
        www: 'https://www.huobi.pro',
        doc: 'https://github.com/huobiapi/API_Docs/wiki/REST_api_reference'
      },
      options: {
        lastSub: null,
      }
    };
  }

  // 解压
  compress(msg) {
    return JSON.parse(
      this.pako.inflate(msg, {
        to: 'string'
      })
    );
  }

  // async onOpen() {}

  // 订阅
  async sub(symbol, type, range) {
    if (this.options.lastSub) {
      // 移除之前交易所的监听，移除交易所对象。
      this.unsub();
    }
    let period = '15min';
    if (range) {
      if (range / 60000 < 60) {
        period = range / 60000 + 'min';
      } else if (range / 3600000 < 24) {
        period = range / 3600000 + 'hour';
      } else if (range / 86400000 < 6) {
        period = range / 86400000 + 'day';
      } else if (range / 604800000 < 12) {
        period = range / 604800000 + 'week';
      }

    }
    const symbolName = symbol.split('/').join('').toLowerCase();
    this.options.lastSub = { symbolName };
    this.options.lastSub = {
      symbolName,
      depth: `market.${symbolName}.depth.step0`,
      kline: `market.${symbolName}.kline.${period}`,
      trade: `market.${symbolName}.trade.detail`
    };
    const { depth, kline, trade } = this.options.lastSub;
    switch (type) {
      case 'depth': // 盘口
        this.socket.send(JSON.stringify({ sub: depth, id: symbolName }));
        break;
      case 'kline': // K线
        this.socket.send(JSON.stringify({ sub: kline, id: symbolName }));
        break;
      case 'trade': // 成交
        this.socket.send(JSON.stringify({ sub: trade, id: symbolName }));
        break;
      default: {
        this.socket.send(JSON.stringify({ sub: depth, id: symbolName }));// 盘口
        this.socket.send(JSON.stringify({ sub: kline, id: symbolName }));// K线
        this.socket.send(JSON.stringify({ sub: trade, id: symbolName }));// 成交
        break;
      }
    }
  }

  // 取消订阅
  async unsub(type) {
    const { symbolName, depth, kline, trade } = this.options.lastSub;
    switch (type) {
      // 盘口
      case 'depth':
        this.socket.send(JSON.stringify({ unsub: depth, id: symbolName }));
        break;
      // K线
      case 'kline':
        this.socket.send(JSON.stringify({ unsub: kline, id: symbolName }));
        break;
      // 成交
      case 'trade':
        this.socket.send(JSON.stringify({ unsub: trade, id: symbolName }));
        break;
      default:
        this.socket.send(JSON.stringify({ unsub: depth, id: symbolName }));// 盘口
        this.socket.send(JSON.stringify({ unsub: kline, id: symbolName }));// K线
        this.socket.send(JSON.stringify({ unsub: symbolName, id: symbolName }));// 成交
        break;
    }
    this.options.lastSub = null;
  }

  formatNewData(data) {
    const query = data.ch.split('.');
    const type = query[2];

    switch (type) {
      // 盘口
      case 'depth':
        //  `depths`(可选, 行情侧边栏显示): 深度图数据, `asks`:一定比例的卖单列表, `bids`:一定比例的买单列表, 其中每项的值依次是 成交价, 成交量
        this.events.emit('depth', data.tick);
        break;
      // K线
      case 'kline':
        //  `lines`: K线图, 依次是: 时间(ms), 开盘价, 最高价, 最低价, 收盘价, 成交量
        // this.events.emit('kline', data.tick);
        this.events.emit('kline', [[
          data.ts,
          data.tick.open,
          data.tick.high,
          data.tick.low,
          data.tick.close,
          data.tick.vol,
        ]]);
        break;
      // 成交
      case 'trade':
        //  `trades`(可选, 行情侧边栏显示): 最近成交记录, `amount`: 成交量, `price`:单价, `id`:订单ID, `ts`:成交时间(ms), `type`:成交类型 buy/sell
        this.events.emit('trade', data.tick.data);
        // data.tick.data.forEach(item => {
        //   this.events.emit('trade', item);
        // });
        break;
    }
  }
}