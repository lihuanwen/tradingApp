const router = require('koa-router')();

const db = require('../db/mysql');
const validate = require('../libs/validate');

const fun = {
  async market(user) {
    return db._page({
      select: '*',
      table: 'market',
    });
  },
  async marketConfig(user) {
    return db._page({
      select: `
      marketConfig.ID, marketConfig.marketID, marketConfig.createTime, marketConfig.note, marketConfig.state,
        market.market AS market
      `,
      table: 'marketConfig',
      where: `WHERE marketConfig.userID = '${user.ID}' AND marketConfig.state = 1 `,
      join: `
        JOIN market ON market.ID = marketConfig.marketID
      `,
    });
  }
};

router.post('*', async ctx => {
  const query = { ...ctx.request.body, ...ctx.query };
  validate(query,
    {
      key: { type: 'string', required: true },
    }
  );

  ctx.state.data = { data: await fun[query.key](ctx.state.user) };
  // ctx.response.redirect('/config/market');
});

module.exports = router;
