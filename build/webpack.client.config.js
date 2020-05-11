const webpack = require("webpack");
const merge = require("webpack-merge");
const webpackBaseConfig = require("./webpack.base.config");
const VueSSRClientPlugin = require("vue-server-renderer/client-plugin");
const { NODE_ENV, CLIENT_VUE_ENV } = require("../config");

const clientConfig = merge(webpackBaseConfig, {
  entry: {
    client: "./src/web/cms/entry-client.js",
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development"
      ),
      "process.env.VUE_ENV": CLIENT_VUE_ENV,
    }),
    // 生成 `vue-ssr-client-manifest.json`。
    new VueSSRClientPlugin(),
  ],
});
module.exports = clientConfig;
