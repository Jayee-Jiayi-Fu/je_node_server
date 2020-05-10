// 服务器配置，是用于生成传递给 createBundleRenderer 的 server bundle
const webpack = require("webpack");
const merge = require("webpack-merge");
const webpackBaseConfig = require("./webpack.base.config");
const nodeExternals = require("webpack-node-externals");
const VueSSRServerPlugin = require("vue-server-renderer/server-plugin");
const { SERVER_ENV } = require("../config");

module.exports = merge(webpackBaseConfig, {
  // 将 entry 指向应用程序的 server entry 文件
  entry: {
    server: "./src/entry-server.js",
  },
  // 这允许 webpack 以 Node 适用方式(Node-appropriate fashion)处理动态导入(dynamic import)，
  // 并且还会在编译 Vue 组件时，
  // 告知 `vue-loader` 输送面向服务器代码(server-oriented code)。
  target: "node",
  // 对 bundle renderer 提供 source map 支持
  devtool: "source-map",
  output: {
    filename: "server-bundle.js",
    //将打包返回的值绑定到一个指定的变量上，
    // library: "",
    // 控制 webpack 打包的内容是如何暴露的
    libraryTarget: "commonjs2",
  },

  // 防止将某些 import的包打包到bundle中，
  // 而是在运行时(runtime)再去外部获取这些扩展依赖(external dependencies)
  // 可以通过多种编写方式实现：string,array,object,function,regex。
  externals: nodeExternals({
    // nodeExternals:用于排除node_modules目录下的代码被打包进去，
    // 因为放在node_modules目录下的代码应该通过npm安装
    // 通过列入白名单， 允许 webpack 将 node_modules 下所需文件打包
    whitelist: /\.css$/,
  }),
  plugins: [
    new webpack.DefinePlugin({
      "process.env": SERVER_ENV,
    }),
    // 这是将服务器的整个输出, 构建为单个 JSON 文件的插件。
    // 默认文件名为 `vue-ssr-server-bundle.json`
    // 在生成 vue-ssr-server-bundle.json 之后，
    // 只需将文件路径 又或者 将 bundle 作为对象 传递给 createBundleRenderer
    // 这对开发过程中的热重载是很有用的
    new VueSSRServerPlugin(),
  ],
});
