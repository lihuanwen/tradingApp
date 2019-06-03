module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: Number(process.env.PORT) || 8335,
  wws: 8336,
  cryptKey: 'Xd1!TI3#kXw4^R!F',
  mysql: {
    host: '118.24.115.49',
    port: 43133,
    user: 'xiaobai_admin',
    password: 'u&WjS!TmhEbGQzjf',
    database: 'xiaobai_v2',
    connectionLimit: 1000,
    connectTimeout: 60 * 60 * 1000,
    acquireTimeout: 60 * 60 * 1000,
    timeout: 60 * 60 * 1000,
  },
  mail: {
    host: 'smtp.exmail.qq.com',
    // port: 465,
    // secure: false, // true for 465, false for other ports
    // service: 'qq',
    auth: {
      user: 'xiaobaixingdong@jiaqinetwork.com',
      // pass: '1qaz@WSX'
      pass: 'V7AvRpXXdY6L52r3'
    }
  },
  cos: {
    SecretId: 'AKIDBGAtTrc62pQvFWIaN3a3LSQCnDSZcL6g',
    SecretKey: 'ZyJVdgbMwTwFS9j9Vhx342qW9f2FJCxc'
  },
  vps: {
    // host: "66.42.98.147", // 历史数据
    // curl -O http://66.42.98.147:55462/2018-11-09.tar.gz
    // curl -O http://45.32.89.75:55463/trade/2019-01-19.tar.gz
    depth: {
      host: '45.76.14.73', // 实时数据
      port: 55463
    },
    trade: {
      host: '45.32.89.75', // 实时数据
      port: 55463
    },
  },

  wechat: {
    //   AppID: 'wx3ee1f1ce62ec7777',
    //   AppSecret: 'e3d3e1b5820473a5861826c75cd75387',
    //   user: 'qiqi5689@163.com',
    //   password: 'owen5689'
    AppID: 'wxc75f42e04d4d9be2',
    AppSecret: 'b4af30a51554e758615be4b7d47ab00e',
    menu: {
      button: [
        {
          type: 'click',
          name: '今日歌曲',
          key: 'V1001_TODAY_MUSIC'
        },
        {
          name: '菜单',
          sub_button: [
            {
              type: 'view',
              name: '搜索',
              url: 'http://www.soso.com/'
            },
            {
              type: 'click',
              name: '赞一下我们',
              key: 'V1001_GOOD'
            }
          ]
        }
      ]
    }
  },
  ws: {
    port: 8337
  }
};
