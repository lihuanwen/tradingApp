let host, apiPath, staticPath;
// if (process.env.NODE_ENV == "development") {
//   host = '';
//   apiPath = `${host}`;
//   staticPath = `${host}static/`;
// } else {
//   host = '';
//   apiPath = `${host}`;
//   staticPath = `${host}static/`;
// }


host = 'http://127.0.0.1:8366/';
apiPath = `${host}`;
staticPath = `${host}static/`;

export default {
  host,
  apiPath,
  staticPath,
  SDK: {
  },
  OAuth: {
    login: `${apiPath}account/login`,
    register: `${apiPath}account/register`,
    check: `${apiPath}account/check`,
  },
  setting: {
    marketConfig: {
      list: `${apiPath}marketConfig/list`,
      validate: `${apiPath}marketConfig/validate`,
      edit: `${apiPath}marketConfig/edit`,
      stateUpDate: `${apiPath}marketConfig/stateUpDate`,
      del: `${apiPath}marketConfig/del`
    }
  },
  config: `${apiPath}config`,
  capital: {
    symbols: `${apiPath}capital/symbols`,
    markets: `${apiPath}capital/markets`,
    tickers: `${apiPath}capital/tickers`,
    balance: `${apiPath}capital/balance`,
    fetchOrder: `${apiPath}capital/fetchOrder`,
    createOrder: `${apiPath}capital/createOrder`,
    cancelOrder: `${apiPath}capital/cancelOrder`,
  },
};
