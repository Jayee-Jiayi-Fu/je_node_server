// 服务器配置，是用于生成传递给 createBundleRenderer 的 server bundle
const webpack = require("webpack");
const merge = require("webpack-merge");
const webpackBaseConfig = require("./webpack.base.config");
const nodeExternals = require("webpack-node-externals");
const VueSSRServerPlugin = require("vue-server-renderer/server-plugin");
const { SERVER_VUE_ENV, NODE_ENV } = require("../config");

module.exports = merge(webpackBaseConfig, {
  // 将 entry 指向应用程序的 server entry 文件
  entry: {
    server: "./src/web/cms/entry-server.js",
  },
  target: "node",
  devtool: "source-map",
  output: {
    filename: "server-bundle.js",
    libraryTarget: "commonjs2",
  },
  // https://webpack.js.org/configuration/externals/#externals
  // https://github.com/liady/webpack-node-externals
  externals: nodeExternals({
    // do not externalize CSS files in case we need to import it from a dep
    whitelist: /\.css$/,
  }),
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": NODE_ENV,
      "process.env.VUE_ENV": SERVER_VUE_ENV,
    }),
    new VueSSRServerPlugin(),
  ],
});
