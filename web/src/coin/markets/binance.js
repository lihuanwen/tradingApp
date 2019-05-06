const Exchange = require('../base/Exchange');

export default class binance extends Exchange {
  describe() {
    return {
      id: 'binance',
      name: 'Binance',
      urls: {
        ws: 'wss://stream.binance.com:9443/stream?streams=',
        web: 'https://www.binance.com',
        doc: 'https://github.com/binance-exchange/binance-official-api-docs/blob/master/web-socket-streams.md'
      },
      options: {
        checkTime: 25 * 1000,
        overTime: 30 * 1000
      },
    };
  }

  beforeInitWebSocket() {
    let arr1 = [];
    Object.keys(this.symbolsKey).forEach(symbolName => {
      switch (this.type) {
        case 'depth':
          // 盘口信息
          arr1.push(symbolName + '@depth5');
          break;
        case 'trade':
          // 成交信息
          arr1.push(symbolName + '@trade');
          break;
      }
    });
    this.urls.ws += arr1.join('/');
    // this.urls.ws += "btcusdt@depth5/btcusdt@trade";
  }

  formatNewData(data) {
    const query = data.stream.split('@');
    const symbol = this.symbolsKey[query[0]];
    let type = query[1];

    let saveData;
    const item = data.data;

    switch (type) {
      // 盘口信息
      case 'depth5':
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
        type = 'depth';
        saveData = [
          new Date().getTime(),
          item.bids ? item.bids[0][0] : null,
          item.bids ? item.bids[0][1] : null,
          item.asks ? item.asks[0][0] : null,
          item.asks ? item.asks[0][1] : null
        ];
        break;
        // 成交信息
      case 'trade':
        // "e": "trade",     // Event type
        // "E": 123456789,   // Event time
        // "s": "BNBBTC",    // Symbol
        // "t": 12345,       // Trade ID
        // "p": "0.001",     // Price
        // "q": "100",       // Quantity
        // "b": 88,          // Buyer order ID
        // "a": 50,          // Seller order ID
        // "T": 123456785,   // Trade time
        // "m": true,        // Is the buyer the market maker?
        // "M": true         // Ignore
        // 时间,类型,成交量,成交价
        saveData = [item.T, item.m ? 'buy' : 'sell', item.q, item.p];
        break;
    }
    if (saveData) {
      this.events.emit('newData', {
        market: this.id,
        symbol,
        type,
        data: saveData.toString()
      });
    }
  }
}
