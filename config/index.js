const path = require("path");
const fs = require("fs");

const isProd = process.env.NODE_ENV === "production" ? true : false;
const isDev = process.env.NODE_ENV !== "production" ? true : false;
const DEV_CONFIG = require("./dev.config");
const PROD_CONFIG = require("./prod.config");
const CUR_CONFIG = isProd ? PROD_CONFIG : DEV_CONFIG;

module.exports = {
  isProd,

  isDev,

  DEV_CONFIG,

  PROD_CONFIG,

  CUR_CONFIG,

  PORT: CUR_CONFIG.PORT,

  //  TEMPLATE_PATH : path.resolve(__dirname, "../src/template"),

  ASSETS_ROOT: path.resolve(__dirname, "../dist"),

  ASSET_PUBLIC_PATH: CUR_CONFIG.ASSETS_PUBLIC_PATH,

  ASSETS_SUB_PATH: CUR_CONFIG.ASSETS_SUB_PATH,

  NODE_ENV: isProd ? "production" : "development",

  CLIENT_VUE_ENV: "client",

  SERVER_VUE_ENV: "server",

  PROXY: CUR_CONFIG.PROXY,

  assetsPath(_path) {
    return path.join(CUR_CONFIG.ASSETS_SUB_PATH, _path);
  },
};
