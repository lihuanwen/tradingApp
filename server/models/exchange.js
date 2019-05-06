const crypto = require('./crypto');
const db = require('../db/mysql');
const CCXT = require('ccxt');
const ProxyAgent = require('proxy-agent');

let exchanges = {};
let exchangeConfigs = {};

/**
 * 获取交易所配置
 * @param {*} marketConfigID 配置ID
 */
const getExchangeConfig = async (marketConfigID) => {
  if (!exchangeConfigs[marketConfigID]) {
    exchangeConfigs[marketConfigID] = await db._findOne(`
      SELECT marketConfig.ID, OAuth, market.market AS market
      FROM marketConfig
      JOIN market ON market.ID =marketConfig.marketID
      WHERE marketConfig.ID ='${marketConfigID}'
    `);
    exchangeConfigs[marketConfigID].OAuth = JSON.parse(crypto.OAuth.decrypt(exchangeConfigs[marketConfigID].OAuth));
  }
  return exchangeConfigs[marketConfigID];
};

/**
 * 获取交易所对象
 * @param {*} marketConfigID 配置ID
 */
const getExchange = async (marketConfigID, websocket) => {
  const marketConfig = await getExchangeConfig(marketConfigID);
  const { ID, market, OAuth } = marketConfig;
  const marketName = `${ID}:${market}`;

  // 没有就新增
  if (!exchanges[marketName]) {
    exchanges[marketName] = new CCXT[market]({
      apiKey: OAuth.apiKey,
      secret: OAuth.secret,
      // uid: null,
      // password: null,
      enableRateLimit: true, // enable built-in rate limiting upon instantiation of the exchange
    });
    // let exchange = new CCXT.kraken({ id: market, agent });
    if (process.env.NODE_ENV === 'development') {
      exchanges[marketName].agent =
        exchanges[marketName].httpAgent =
        exchanges[marketName].httpsAgent =
        new ProxyAgent('http://127.0.0.1:1086');
    }
    try {
      await exchanges[marketName].loadMarkets();
    } catch (error) {
      delete exchanges[marketName];
      throw new Error(error);
    }
  }
  return exchanges[marketName];
};

module.exports = { getExchange, getExchangeConfig };
