const router = require('koa-router')();
const uuid = require('uuid/v4');

const db = require('../db/mysql');
const crypto = require('../models/crypto');
const validate = require('../libs/validate');

// const {
//   Getui,
//   ApnsInfo,
//   Alert,
//   SingleMessage,
//   AppMessage,
//   Condition,
//   ConditionKey,
//   CondOptType,
//   TargetList,
//   ListMessage,
//   BatchTask,
//   TransmissionTemplate,
//   TagMessage,
// } = require('getui-rest-sdk');

// const gt = new Getui({
//   appId: 'txNadX2iNP7pah5Nn6joc5',
//   appSecret: '6UGNyfOEf96D9XAOGfuWT3',
//   appKey: '25li1AgaWg8AEQHXtc1hX8',
//   masterSecret: '4TBABQ352R8O34v1LlSAH3',
// });

// const alert = new Alert();
// alert.title = 'Title: push test';
// alert.body = `Body: push test`;

// const payload = JSON.stringify({
//   message: `Payload message: push message test`,
// });

// const apnsInfo = new ApnsInfo();
// apnsInfo.alert = alert;
// apnsInfo.customMsg = { payload };

// const template = new TransmissionTemplate();
// template.transmissionContent = payload;

// const message = new SingleMessage();
// message.template = template;
// message.apnsInfo = apnsInfo;


router.post('/login', async ctx => {
  const query = { ...ctx.request.body, ...ctx.query };
  validate(query,
    {
      userName: { type: 'string', required: true, min: 3, max: 32 },
      password: { type: 'string', required: true, min: 6, max: 32 }
    }
  );
  // let ret;
  // ret = await gt.getUserStatus(query.clientInfo.clientid);
  // console.log(ret);
  // ret = await gt.pushMessageToSingle(message, { cid: query.clientInfo.clientid });
  // console.log(ret);
  // throw new Error('用户不存在');
  const user = await db._findOne(`
    SELECT ID, name, password, clientID, state FROM account
      WHERE name='${query.userName}'
  `);

  if (!user) {
    throw new Error('用户不存在');
  } else if (user.state === 0) {
    throw new Error('用户已被停用');
  } else if (user.password !== crypto.user.encode(query.password)) {
    throw new Error('密码错误');
  }

  if (query.clientInfo && query.clientInfo.clientid) {
    await db._query(
      `UPDATE account SET 
        clientID=?
        WHERE ID=? `,
      [
        query.clientInfo.clientid,
        user.ID
      ]
    );
  }

  ctx.state.data = {
    data: {
      token: crypto.token.encode({ ID: user.ID, name: user.name, clientID: user.clientID }),
      userInfo: {
        ID: user.ID,
        name: user.name,
        access: ['user', 'admin']
      }
    }
  };
});

router.post('/register', async ctx => {
  const query = { ...ctx.request.body, ...ctx.query };
  validate(query,
    {
      userName: { type: 'string', required: true, min: 3, max: 32 },
      password: { type: 'string', required: true, min: 6, max: 32 }
    }
  );

  const ID = uuid();

  await db._query(
    `INSERT INTO account SET
  ID=?,
  name=?,
  password=?,
  createTime=?
`,
    [
      ID,
      query.userName,
      crypto.user.encode(query.password),
      new Date()
    ]
  );

  ctx.state.data = {
    data: {
      token: crypto.token.encode({ ID, name: query.userName }),
      userInfo: {
        ID,
        name: query.userName,
        access: ['user', 'admin']
      }
    }
  };
});

module.exports = router;
