const rp = require('request-promise');

const _get = url => {
  return rp(url);
};

const _post = options => {
  return rp(options);
};

const _sendErrMsg = (text, desp) => {
  _get(
    encodeURI(
      `https://pushbear.ftqq.com/sub?sendkey=5752-6243ebb2862e4894a2a6df28aaf86182&desp=${desp}&text=${text}`
    )
  );
};

module.exports = {
  _sendErrMsg,
  _get,
  _post
};
