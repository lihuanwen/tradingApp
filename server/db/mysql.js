const mysql = require('promise-mysql');
const config = require('../config/default');

const connection = mysql.createPool(config.mysql);

const _query = (sql, values) => {
  return connection.query(sql, values);
};

const _findOne = async (sql, values) => {
  return (await connection.query({ sql, values }))[0];
};

// select table where join pageIndex pageSize
const _page = async query => {
  return new Promise(async (resolve, reject) => {
    try {
      let _sql = '';

      const total = await _findOne(`SELECT COUNT(*) AS count FROM ${query.table} ${query.where}`);

      _sql = `SELECT ${query.select} FROM ${query.table} `;
      _sql += query.join;
      _sql += query.where;

      if (query.pageSize) {
        _sql += ` limit ${(query.pageIndex - 1) * query.pageSize}, ${query.pageSize}`;
      }
      const list = await _query(_sql);

      resolve({ rows: list, total: total.count });
    } catch (error) {
      console.log(error.sql);
      reject(error);
    }
  });
};

module.exports = {
  _query,
  _findOne,
  _page
};
