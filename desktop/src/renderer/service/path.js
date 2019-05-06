let host;
let apiPath;
let staticPath;
if (process.env.NODE_ENV === 'development') {
  host = 'http://127.0.0.1:8366/';
  apiPath = `${host}`;
} else {
  host = 'http://45.32.89.75:8366/';
  apiPath = `${host}`;
}
staticPath = `/static/`;
export default {
  host,
  apiPath,
  staticPath,
  auc: {
    login: `${apiPath}account/login`,
    register: `${apiPath}account/register`
  },
  setting: {
    marketConfig: {
      list: `${apiPath}marketConfig/list`,
      validate: `${apiPath}marketConfig/validate`,
      edit: `${apiPath}marketConfig/edit`,
      del: `${apiPath}marketConfig/del`
    }
  },
  config: {
    market: `${apiPath}config/market`,
  },
  capital: {
    symbols: `${apiPath}capital/symbols`,
    markets: `${apiPath}capital/markets`,
    tickers: `${apiPath}capital/tickers`,
    balance: `${apiPath}capital/balance`,
    fetchOrder: `${apiPath}capital/fetchOrder`,
    createOrder: `${apiPath}capital/createOrder`,
    cancelOrder: `${apiPath}capital/cancelOrder`,
  },



  user: {
    list: `${apiPath}user/list`,
    detail: `${apiPath}user/detail?type=user`,
    edit: `${apiPath}user/edit`,
    del: `${apiPath}user/del`,

    order: `${apiPath}user/detail?type=order`,
    balance: `${apiPath}user/detail?type=balance`,
    profit: `${apiPath}user/detail?type=profit`
  },
  deal: {
    market: {
      list: `${apiPath}market/list`,
      edit: `${apiPath}market/edit`,
      del: `${apiPath}market/del`
    },
    rate: {
      list: `${apiPath}deal/rate/list`,
      detail: `${apiPath}deal/rate/detail`,
      del: `${apiPath}deal/rate/del`
    },
    rateMore: {
      list: `${apiPath}deal/rate/list2`,
      detail: `${apiPath}deal/rate/detail`,
      del: `${apiPath}deal/rate/del`
    }
  },
};
