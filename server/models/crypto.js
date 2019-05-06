
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config/default');

const user = {
  encode: (data) => {
    const hmac = crypto.createHmac('sha256', config.cryptKey.user);
    return hmac.update(data).digest('hex');
  }
};

const token = {
  encode: userInfo => {
    return jwt.sign(
      {
        ...userInfo,
        exp: Date.now() + config.cryptKey.tokenExpiresTime
      },
      config.cryptKey.token
    );
  },
  // decode: ctx => {
  //   let token = ctx.header.authorization;
  //   ctx.body = {
  //     token: token,
  //     user: ctx.state.user
  //   };
  //   // 使用jwt-simple自行解析数据
  //   let payload = jwt.decode(token.split(' ')[1], config.cryptKey.token);
  //   console.log(payload);
  // }
  decode: token => {
    // console.log(jwt.decode(token));
    return jwt.verify(token, config.cryptKey.token);
  }
};

const OAuth = {
  lengthTo16(value) {
    let t = value;
    while (t.length % 16 !== 0) {
      t += '\0';
    }
    return t;
  },
  encrypt(data, key = config.cryptKey.OAuth, iv = '') {
    const cipher = crypto.createCipheriv('aes-128-ecb', this.lengthTo16(key), iv);
    let crypted = cipher.update(data, 'utf8', 'binary');
    crypted += cipher.final('binary');
    crypted = new Buffer.from(crypted, 'binary').toString('base64');
    return crypted;
  },
  decrypt(data, key = config.cryptKey.OAuth, iv = '') {
    const decipher = crypto.createDecipheriv('aes-128-ecb', this.lengthTo16(key), iv);
    let crypted = new Buffer.from(data, 'base64').toString('binary');
    let decoded = decipher.update(crypted, 'binary', 'utf8');
    decoded += decipher.final('utf8');
    return decoded;
  }
};

module.exports = {
  user,
  token,
  OAuth
};
