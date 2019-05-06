const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const koaJwt = require('koa-jwt');
const cors = require('koa2-cors');
const IO = require('koa-websocket');

const app = IO(new Koa());

const controllers = require('./controllers');
const config = require('./config/default');
const log = require('./models/log').getLogger('app');

const schedule = require('node-schedule');
const serve = require('koa-static');
const path = require('path');

const coin = require('./models/coin');

const initSocket = () => {
  const { use } = require('./controllers/socket');
  app.ws.use(use);
};

const initServer = async () => {
  app.use(serve(path.resolve('data')));

  app.use(cors({
    origin: function (ctx) {
      // if (ctx.url === '/test') {
      //   return '*'; // 允许来自所有域名请求
      // }
      // return 'http://localhost:8080';
      return '*';
    },
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 5,
    credentials: true,
    allowMethods: ['GET', 'POST', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
  }));

  app.use(koaJwt({ secret: config.cryptKey.token }).unless({
    path: [/^\/account/]
  }));

  app.use(bodyParser());

  app.use(async (ctx, next) => {
    log.info(`api访问 ${ctx.ip} ${ctx.method} ${ctx.path}`);
    try {
      await next();
      ctx.body = Object.assign(
        {
          data: null,
          message: null,
          success: true
        },
        ctx.state.data
      );
    } catch (err) {
      console.error(err);
      ctx.body =
        {
          message: err.message,
          error: err.stack,
          success: false
        };
    }
  });

  app.use(controllers.routes());
  app.use(controllers.allowedMethods());

  app.listen(config.PORT, () => {
    log.info(`HTTP服务器 端口：${config.PORT}`);
  });
};

// 设置定时任务
const interval = () => {
  // 7点获取市场汇率
  schedule.scheduleJob('0 0 7 * * *', () => {
    coin.update();
  });
};

const main = async () => {
  await interval();
  await initServer();
  // await initSocket();
};

main();
