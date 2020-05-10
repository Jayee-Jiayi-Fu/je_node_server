const path = require("path");
const isProd = process.env.NODE_ENV === "production" ? true : false;
const ASSETS_ROOT = path.resolve(__dirname, "../dist");
const config = isProd ? require("./prod.config") : require("./dev.config");

// 组装 最终静态资源 路径
const buildAssetsPath = function(_path) {
  // console.log("....");
  // throw new Error(path.join(config.ASSETS_SUB_PATH, _path));
  return path.join(config.ASSETS_SUB_PATH, _path);
};

module.exports = {
  isProd,
  ASSETS_ROOT,
  ...config,
  buildAssetsPath,
};
