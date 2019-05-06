const log4js = require('log4js');

let logConf = {
  appenders: {
    app: {
      type: 'dateFile',
      filename: 'log/app.log',
      pattern: '.yyyy-MM-dd'
    }
  },
  categories: {
    default: {
      appenders: ['app'],
      level: 'DEBUG'
    }
  }
};

log4js.configure(logConf);

module.exports = log4js;