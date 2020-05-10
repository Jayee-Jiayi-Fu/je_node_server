const webpack = require("webpack");
const miniCssExtractPlugin = require("mini-css-extract-plugin");
// 这个插件是必须的！ 它的职责是将你定义过的其它规则复制并应用到 .vue 文件里相应语言的块。
// 例如，如果你有一条匹配 /\.js$/ 的规则，那么它会应用到 .vue 文件里的 <script> 块
const VueLoaderPlugin = require("vue-loader/lib/plugin");
// const FriendlyErrorsPlugin = require("friendly-errors-webpack-plugin");

const { resolve } = require("../src/utils/system.js");
const { isProd, buildAssetsPath } = require("../config");

module.exports = {
  mode: isProd ? "production" : "development",
  resolve: {
    extensions: [".js", ".vue", ".json"],
    alias: {
      "@": resolve(__dirname, "src"),
      "@blog": resolve(__dirname, "src/blog"),
      // static: resolve(__dirname, "static"),
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: {
          compilerOptions: {
            preserveWhitespace: false,
          },
        },
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jp(e+)g|gif|svg)$/,
        loader: "url-loader",
        options: {
          limit: 1000,
          name: buildAssetsPath("images/[name].[hash:6].[ext]"),
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 1000,
          name: buildAssetsPath("media/[name].[hash:6].[ext]"),
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 1000,
          name: buildAssetsPath("fonts/[name].[hash:6].[ext]"),
        },
      },
      {
        test: /\.scss$/,
        use: [
          ...(isProd ? [miniCssExtractPlugin.loader] : []),
          {
            loader: "css-loader",
            options: {
              minimize: true,
              modules: true,
              localIdentName: "[local]_[hash:base64:8]",
            },
          },
          "sass-loader",
          "vue-style-loader",
        ],
      },
    ],
  },

  plugins: [
    new VueLoaderPlugin(),
    new miniCssExtractPlugin({
      filename: "common.[chunkhase].css",
    }),

    // isProd?new FriendlyErrorsPlugin()
  ],
  optimization: {
    minimize: true,
  },
  devtool: isProd ? false : `#cheap-module-source-map`,
  performance: {
    hints: "error",
  },
};
