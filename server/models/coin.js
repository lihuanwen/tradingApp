const tool = require('../libs/tool');
const fs = require('fs');

class Coin {
  constructor() {
    // https://static.hqz.com/market/huobipro.png
    // https://static.hqz.com/coin/binance-coin.png
    // https://www.hqz.com/data/get_global_statistical    虚拟币：1196/ 代币：988/ 交易平台：361/ 24小时成交量：¥1,516.3784亿/ 总市值：¥8,611.4420亿/ Bax
    this.data = null;
    // this.lastUpdateTime = 0;
    // this.update();
    this.data = JSON.parse(fs.readFileSync('data/exchangeRate.json'));
  }
  async getData() {
    let temp = [];
    let data = {};
    let options = {
      // https://m.hqz.com/?jump_type=m
      uri: 'https://m.hqz.com',
      qs: {
        p: 0
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
        'X-Requested-With': 'XMLHttpRequest'
      },
      json: true
    };
    do {
      options.qs.p++;
      data = await tool._get(options);
      temp = [...temp, ...data.data];
    } while (data.data.length > 0);
    return temp;
  }
  async update() {
    let data = {};
    for (const item of await this.getData()) {
      data[item.coinshortcode] = item;
    }
    fs.writeFileSync('data/exchangeRate.json', JSON.stringify(data));

    this.data = data;
    return data;
  }
}

module.exports = new Coin();