const path = require("path");
const srcPath = path.resolve(process.cwd(), "src/web");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");
const autoprefixer = require("autoprefixer");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const {
  isProd,
  isDev,
  NODE_ENV,
  assetsPath,
  ASSETS_ROOT,
  ASSET_PUBLIC_PATH,
} = require("../config");

module.exports = {
  mode: NODE_ENV,
  devtool: isProd ? false : `cheap-module-source-map`,
  output: {
    path: ASSETS_ROOT,
    publicPath: ASSET_PUBLIC_PATH,
    filename: "[name].[chunkhash:6].js",
  },
  resolve: {
    alias: {
      "@config": path.resolve(__dirname, "../config"),
      "@cms": path.resolve(__dirname, "src/web/cms"),
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
        include: [srcPath],
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
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
            },
          },
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: () => [autoprefixer],
            },
          },
          "sass-loader",
          "vue-style-loader",
        ],
      },

      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10000,
              name: "/[path][name].[ext]?[hash:6]",
              context: srcPath,
            },
          },
        ],
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10000,
              name: "/fonts/[name].[hash:6].[ext]",
            },
          },
        ],
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 1000,
          name: assetsPath("media/[name].[ext]?[hash:6]"),
        },
      },
    ],
  },

  plugins: [new VueLoaderPlugin()],
  optimization: {
    noEmitOnErrors: true,
    minimize: true,
    minimizer: [
      new TerserJSPlugin({ cache: true }),
      // 分离css
      new MiniCssExtractPlugin({
        filename: "/[path][name].[chunkhash].css",
      }),
      // 压缩css
      new OptimizeCssAssetsPlugin({
        cssProcessorOptions: {
          map: {
            // 不生成内联映射,这样配置就会生成一个source-map文件
            inline: false,
            // 向css文件添加source-map路径注释
            // 如果没有此项压缩后的css会去除source-map路径注释
            annotation: true,
          },
        },
      }),
    ],
    splitChunks: {
      cacheGroups: {
        styles: {
          name: "[chunkname].styles",
          test: /\.css$/,
        },
        // any required modules inside node_modules are extracted to vendor
        vendor: {
          name: "[chunkname].vendor",
          minChunks: 2,
        },
        // manifest: {
        //   name: "manifest",
        //   chunks: "initial",
        // },
      },
    },
  },
  performance: {
    hints: false,
  },
};
