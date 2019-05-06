module.exports = {
  devServer: {
    port: 8082,
    https: false
  },
  // baseUrl: '/',
  productionSourceMap: false,
  css: {
    sourceMap: false
  },
  parallel: require('os').cpus().length > 1
};
