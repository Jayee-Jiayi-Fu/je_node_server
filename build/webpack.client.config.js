const webpack = require("webpack");
const merge = require("webpack-merge");
const webpackBaseConfig = require("./webpack.base.config");
const VueSSRClientPlugin = require("vue-server-renderer/client-plugin");
const {
  isProd,
  CLIENT_ENV,
  ASSETS_ROOT,
  ASSETS_PUBLIC_PATH,
  buildAssetsPath,
} = require("../config/");

const clientConfig = merge(webpackBaseConfig, {
  entry: {
    client: ["./src/entry-client.js"],
  },
  output: {
    path: ASSETS_ROOT,
    publicPath: ASSETS_PUBLIC_PATH,
    filename: buildAssetsPath("js/[name].[hash:6].js"),
    chunkFilename: buildAssetsPath("js/[id].[hash:6].js"),
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": CLIENT_ENV,
    }),
    // 重要信息：这将 webpack 运行时分离到一个引导 chunk 中，
    // 以便可以在之后正确注入异步 chunk。
    // 这也为你的 应用程序/vendor 代码提供了更好的缓存
    // 此插件在输出目录中
    // 生成 `vue-ssr-client-manifest.json`。
    new VueSSRClientPlugin(),
  ],
  optimization: {
    splitChunks: {
      chunks: "all",
    },

    // 自定义一组一组的 cache group来配对应的共享模块
    // splitChunks: {
    //   cacheGroups: {
    //     commons: {
    //       // 生成的共享模块bundle的名字
    //       name: "vendor",
    //       // split前，有共享模块的chunks的最小数目 ，默认值是1
    //       minChunks: function(module) {
    //         return (
    //           /node_modules/.test(module.context) &&
    //           !/.css$/.test(module.request)
    //         );
    //       },
    //     },
    //   },
    //   cacheGroups: {
    //     commons: {
    //       name: "manifest",
    //       // initial”,：优化时只选择初始的chunks
    //       // async：优化时只选择所需要的chunks
    //       // all：优化时选择所有chunks 。
    //       chunks: "initial",
    //       // split前，有共享模块的chunks的最小数目 ，默认值是1
    //       minChunks: 2,
    //     },
    //   },
    // },
  },
});

// const SWPrecachePlugin = require("sw-precache-webpack-plugin");
// 确保你的网站使用HTTPS访问
// if (isProd) {
//   clientConfig.plugins.push(
//     // auto generate service worker
//     new SWPrecachePlugin({
//       cacheId: "vue-hn",
//       filename: "service-worker.js",
//       minify: true,
//       dontCacheBustUrlsMatching: /./,
//       staticFileGlobsIgnorePatterns: [/\.map$/, /\.json$/],
//       runtimeCaching: [
//         {
//           urlPattern: "/",
//           handler: "networkFirst",
//         },
//         // {
//         //   urlPattern: /\/(top|new|show|ask|jobs)/,
//         //   handler: "networkFirst",
//         // },
//         // {
//         //   urlPattern: "/item/:id",
//         //   handler: "networkFirst",
//         // },
//         // {
//         //   urlPattern: "/user/:id",
//         //   handler: "networkFirst",
//         // },
//       ],
//     })
//   );
// }

module.exports = clientConfig;
