const router = require('koa-router')();

const account = require('./account');
router.use('/account', account.routes(), account.allowedMethods());

// 以下接口需要鉴权
const config = require('./config');
router.use('/config', config.routes(), config.allowedMethods());

const marketConfig = require('./marketConfig');
router.use('/marketConfig', marketConfig.routes(), marketConfig.allowedMethods());

const capital = require('./capital');
router.use('/capital', capital.routes(), capital.allowedMethods());

module.exports = router;
