const Exchange = require('../base/Exchange');

export default class okex extends Exchange {
  describe() {
    return {
      id: 'okex',
      name: 'OKEX',
      urls: {
        ws: 'wss://real.okex.com:10442/ws/v3',
        www: 'https://www.okex.com',
        doc: 'https://www.okex.com/docs/zh/#README'
      },
      options: {
        lastSub: null,
        checkTime: 15 * 1000,
        overTime: 30 * 1000
      }
    };
  }

  onOpen() {
    if (!this._clearInterval) {
      this._clearInterval = setInterval(() => {
        this.checkConnect();
      }, this.options.checkTime);
    }
  }

  compress(msg) {
    return JSON.parse(
      this.pako.inflateRaw(msg, {
        to: 'string'
      })
    );
  }

  // 订阅
  async sub(symbol, type, range) {
    if (this.options.lastSub) {
      this.unsub();
    }
    let period = '900s';
    if (range) {
      period = range / 1000;
    }
    const symbolName = symbol.split('/').join('-').toUpCase();
    this.options.lastSub = {
      depth: `spot/depth5:${symbolName}`,
      kline: `spot/candle${period}:${symbolName}`,
      trade: `spot/trade:${symbolName}`
    };
    const { depth, kline, trade } = this.options.lastSub;
    switch (type) {
      case 'depth': // 盘口
        this.socket.send(JSON.stringify({ op: 'subscribe', args: [depth] }));
        break;
      case 'kline': // K线
        this.socket.send(JSON.stringify({ op: 'subscribe', args: [kline] }));
        break;
      case 'trade': // 成交
        this.socket.send(JSON.stringify({ op: 'subscribe', args: [trade] }));
        break;
      default: {
        this.socket.send(JSON.stringify({ op: 'subscribe', args: [depth, kline, trade] }));
        break;
      }
    }
  }

  // 取消订阅
  async unsub(type) {
    const { depth, kline, trade } = this.options.lastSub;
    // {"op": "unsubscribe", "args": ["spot/ticker:BTC-USDT", "spot/candle60s:BTC-USDT"]}
    switch (type) {
      case 'depth': // 盘口
        this.socket.send(JSON.stringify({ op: 'unsubscribe', args: [depth] }));
        break;
      case 'kline': // K线
        this.socket.send(JSON.stringify({ op: 'unsubscribe', args: [kline] }));
        break;
      case 'trade': // 成交
        this.socket.send(JSON.stringify({ op: 'unsubscribe', args: [trade] }));
        break;
      default:
        this.socket.send(JSON.stringify({ op: 'unsubscribe', args: [depth, kline, trade] }));
        break;
    }
    this.options.lastSub = null;
  }

  checkConnect() {
    this.socket.send('ping');
    if (new Date().getTime() - this.lastHeartBeat > this.options.overTime) {
      this._clearInterval && clearInterval(this._clearInterval);
      this.initWebSocket();
    }
  }

  formatNewData(data) {
    const query = data.table.split('/');
    let type = query[1];

    let saveData;
    let item = data.data;

    switch (type) {
      // 盘口信息
      case 'depth':
        // "tick": {
        //   "bids": [
        //   [买1价,买1量]
        //   [买2价,买2量]
        //   ]
        //   "asks": [
        //   [卖1价,卖1量]
        //   [卖2价,卖2量]
        //   ]
        // }
        saveData = [
          item.timestamp,
          item.bids.length ? item.bids[0][0] : null,
          item.bids.length ? item.bids[0][1] : null,
          item.asks.length ? item.asks[0][0] : null,
          item.asks.length ? item.asks[0][1] : null
        ];
        break;
      // 成交信息
      case 'deals':
        type = 'trade';
        item.forEach(element => {
          // [交易序号, 价格, 成交量, 时间, 买卖类型]
          saveData.push(element[3],
            element[4] === 'ask' ? 'sell' : 'buy',
            element[2],
            element[1]);
        });
        break;
    }
    if (saveData) {
      switch (type) {
        case 'trade':
          saveData.forEach(item => {
            this.events.emit('newData', {
              market: this.id,
              symbol,
              type,
              data: item.toString()
            });
          });
          break;
        default:
          this.events.emit('newData', {
            market: this.id,
            symbol,
            type,
            data: saveData.toString()
          });
          break;
      }
    }
  }
}