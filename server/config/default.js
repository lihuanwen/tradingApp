module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: Number(process.env.PORT) || 8366,
  cryptKey: {
    token: '',
    tokenExpiresTime: 1000 * 60 * 60 * 24 * 7,
    user: '',
    OAuth: '',
  },
  mysql: {
    host: '',
    port: 0,
    user: '',
    password: '',
    database: '',
    connectionLimit: 1000,
    connectTimeout: 60 * 60 * 1000,
    acquireTimeout: 60 * 60 * 1000,
    timeout: 60 * 60 * 1000,
  },
};
